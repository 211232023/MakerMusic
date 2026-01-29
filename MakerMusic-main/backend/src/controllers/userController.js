const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Cadastro de Aluno (Rota Pública)
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (role !== 'ALUNO') {
    return res.status(403).json({ message: 'Apenas o cadastro de Alunos é permitido nesta rota.' });
  }
  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao registrar o usuário.' });
  }
};

// Cadastro de Usuário por Admin
exports.registerUserByAdmin = async (req, res) => {
  const { name, email, password, role, teacher_id, student_level, instrument_category, teacher_category, teacher_level } = req.body;
  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query(
      `INSERT INTO users (name, email, password, role, teacher_id, student_level, instrument_category, teacher_category, teacher_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, teacher_id || null, student_level || null, instrument_category || null, teacher_category || null, teacher_level || null]
    );
    res.status(201).json({ message: 'Usuário cadastrado pelo Admin com sucesso!' });
  } catch (error) {
    console.error('Erro no cadastro por Admin:', error);
    res.status(500).json({ message: 'Erro no servidor ao cadastrar usuário.' });
  }
};

// Login de Usuário
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça o email e a senha.' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const payload = { user: { id: user.id, name: user.name, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
  }
};

// Recuperação de Senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expiresAt, email]);
    const emailResponse = await emailService.sendPasswordResetEmail(email, token);
    res.json({ message: emailResponse.success ? 'Token enviado!' : 'Erro ao enviar e-mail.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    if (users.length === 0) return res.status(400).json({ message: 'Token inválido.' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?', [hashedPassword, token]);
    res.json({ message: 'Senha redefinida!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Buscar Alunos (Query Completa)
exports.getMyStudents = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let query = '';
        let params = [];
        if (userRole === 'PROFESSOR') {
            query = `
                SELECT u.id, u.name, u.email, u.student_level, u.instrument_category,
                       c.id as class_id, c.description as class_description, i.name as instrument_name
                FROM users u
                LEFT JOIN students s ON s.user_id = u.id
                LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'ATIVO'
                LEFT JOIN classes c ON e.class_id = c.id
                LEFT JOIN instruments i ON c.instrument_id = i.id
                WHERE u.role = 'ALUNO' AND u.teacher_id = ?
                GROUP BY u.id`;
            params.push(userId);
        } else {
            query = `
                SELECT u.id, u.name, u.email, u.student_level, u.instrument_category,
                       c.id as class_id, c.description as class_description, i.name as instrument_name
                FROM users u
                LEFT JOIN students s ON s.user_id = u.id
                LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'ATIVO'
                LEFT JOIN classes c ON e.class_id = c.id
                LEFT JOIN instruments i ON c.instrument_id = i.id
                WHERE u.role = 'ALUNO'
                GROUP BY u.id`;
        }
        const [students] = await pool.query(query, params);
        res.json(students);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// Buscar Professor
exports.getMyTeacher = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT T.id, T.name FROM users S JOIN users T ON S.teacher_id = T.id WHERE S.id = ?', [req.user.id]);
    rows.length > 0 ? res.json(rows[0]) : res.status(404).json({ message: 'Nenhum professor vinculado.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Atualizar Senha
exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    res.json({ message: 'Senha atualizada!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};
