const pool = require('../config/db');

// Listar todos os utilizadores (para o Admin ver quem pode associar)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (error) {
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