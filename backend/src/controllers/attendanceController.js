const { pool } = require('../config/db');

// Professor marca a presença de um aluno numa aula
exports.markAttendance = async (req, res) => {
  const { scheduleId, studentId, classDate, status } = req.body;
  const teacherId = req.user.id;

  if (!scheduleId || !studentId || !classDate || !status) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verifica se o professor tem permissão para marcar presença neste horário
    const [scheduleCheck] = await pool.query('SELECT teacher_id FROM schedules WHERE id = ?', [scheduleId]);
    if (scheduleCheck.length === 0 || scheduleCheck[0].teacher_id !== teacherId) {
        return res.status(403).json({ message: 'Não tem permissão para este horário.' });
    }

    // Usa ON DUPLICATE KEY UPDATE para inserir ou atualizar a presença do dia
    const query = `
        INSERT INTO attendance (schedule_id, student_id, class_date, status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = ?
    `;
    await pool.query(query, [scheduleId, studentId, classDate, status, status]);

    res.status(200).json({ message: 'Presença atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao marcar presença:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};