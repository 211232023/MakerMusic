const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role !== 'ALUNO') {
    return res.status(403).json({ message: 'Apenas o cadastro de Alunos é permitido nesta rota.' });
  }

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'Utilizador registado com sucesso!', userId: result.insertId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este email já está a ser utilizado.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao registar utilizador.' });
  }
};

exports.registerUserByAdmin = async (req, res) => {
  const { 
    name, email, password, role, 
    student_level, instrument_category, 
    teacher_category, teacher_level 
  } = req.body;

  const validRoles = ['ALUNO', 'PROFESSOR', 'ADMIN', 'FINANCEIRO'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Papel de usuário inválido.' });
  }

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, student_level, instrument_category, teacher_category, teacher_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name, email, hashedPassword, role, 
        student_level || null, 
        instrument_category || null, 
        teacher_category || null, 
        teacher_level || null
      ]
    );

    res.status(201).json({ message: `Utilizador ${role} registado com sucesso!`, userId: result.insertId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este email já está a ser utilizado.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao registar utilizador.' });
  }
};

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

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor durante o login.' });
  }
};

exports.getMyTeacher = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT T.id, T.name FROM users S JOIN users T ON S.teacher_id = T.id WHERE S.id = ?',
      [req.user.id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Nenhum professor vinculado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Por favor, forneça o email e a nova senha.' });
  }

  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ message: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao atualizar a senha.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Por favor, forneça o email.' });
  }

  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000);

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expiresAt, email]
    );

     const emailResponse = await emailService.sendPasswordResetEmail(email, token);

    if (emailResponse.success) {
        res.json({ 
            message: 'Token de recuperação enviado para o seu e-mail!'
        });
    } else {
        console.error('Erro ao enviar e-mail:', emailResponse.error);
        res.status(500).json({ 
            message: 'Erro ao enviar e-mail. Tente novamente mais tarde.' 
        });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao solicitar recuperação de senha.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Por favor, forneça o token e a nova senha.' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?',
      [hashedPassword, token]
    );

    res.json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao redefinir a senha.' });
  }
};

exports.getMyStudents = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        let query = 'SELECT id, name, email, student_level, instrument_category FROM users WHERE role = "ALUNO"';
        let params = [];

        // Se for professor, filtra apenas os alunos dele. Se for admin, vê todos para simulação.
        if (userRole === 'PROFESSOR') {
            query += ' AND teacher_id = ?';
            params.push(userId);
        }

        const [students] = await pool.query(query, params);
        res.json(students);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};