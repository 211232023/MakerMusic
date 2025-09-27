const pool = require('../config/db');

// Listar todos os utilizadores (para o Admin ver quem pode associar)
exports.getAllUsers = async (req, res) => {
  console.log('[BACKEND] adminController: A executar getAllUsers...'); // <-- LOG 8
  try {
    const [users] = await pool.query('SELECT id, name, email, role, teacher_id FROM users');
    console.log('[BACKEND] adminController: Utilizadores encontrados na base de dados.'); // <-- LOG 9
    res.json(users);
  } catch (error) {
    console.error('[BACKEND] adminController: Erro na base de dados!', error); // <-- LOG DE ERRO
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Associar um aluno a um professor
exports.assignTeacherToStudent = async (req, res) => {
  const { studentId, teacherId } = req.body;

  if (!studentId || !teacherId) {
    return res.status(400).json({ message: 'ID do aluno e do professor são obrigatórios.' });
  }

  try {
    await pool.query(
      'UPDATE users SET teacher_id = ? WHERE id = ? AND role = "ALUNO"',
      [teacherId, studentId]
    );
    res.json({ message: 'Professor associado ao aluno com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};