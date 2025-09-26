const pool = require('../config/db'); // Importa a ligação à base de dados
const bcrypt = require('bcryptjs');

// Função para registar um novo utilizador
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Validação dos dados recebidos
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    // 2. Encriptação da senha antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Inserção do novo utilizador na base de dados
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // 4. Resposta de sucesso
    res.status(201).json({ message: 'Utilizador registado com sucesso!', userId: result.insertId });

  } catch (error) {
    // Trata erros comuns, como email duplicado
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este email já está a ser utilizado.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao registar utilizador.' });
  }
};

// Função para fazer login de um utilizador
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validação simples
  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça o email e a senha.' });
  }

  try {
    // 1. Encontrar o utilizador pelo email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    // Se o utilizador não existir, devolve um erro
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    // 2. Comparar a senha fornecida com a senha encriptada na base de dados
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mesma mensagem genérica
    }

    // 3. Se as credenciais estiverem corretas, criar o token JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Usa a chave secreta do .env
      { expiresIn: '1h' }, // O token expira em 1 hora (pode ajustar)
      (err, token) => {
        if (err) throw err;
        // 4. Enviar o token e os dados do utilizador como resposta
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