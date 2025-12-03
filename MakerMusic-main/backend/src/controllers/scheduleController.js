const { pool } = require('../config/db');

exports.createSchedule = async (req, res) => {
  const teacherId = req.user.id; 
  const { studentId, dayOfWeek, startTime, endTime } = req.body;

  if (!studentId || !dayOfWeek || !startTime || !endTime) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO schedules (student_id, teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [studentId, teacherId, dayOfWeek, startTime, endTime]
    );
    res.status(201).json({ message: 'Horário criado com sucesso!', scheduleId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.getSchedulesByStudent = async (req, res) => {
    const studentId = req.user.id; 
    try {
        const [schedules] = await pool.query(
            `SELECT s.id, s.day_of_week, s.start_time, s.end_time, u.name as teacher_name
             FROM schedules s
             JOIN users u ON s.teacher_id = u.id
             WHERE s.student_id = ?
             ORDER BY FIELD(s.day_of_week, 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO')`,
            [studentId]
        );
        res.json(schedules);
    } catch (error) {
        console.error('Erro ao buscar horários do aluno:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.getSchedulesForTeacherByDay = async (req, res) => {
    const teacherId = req.user.id;
    const { dayOfWeek } = req.params; 

    try {
        const query = `
            SELECT 
                s.id,
                s.start_time,
                s.end_time,
                u.id as student_id,
                u.name as student_name,
                a.status as attendance_status
            FROM schedules s
            JOIN users u ON s.student_id = u.id
            LEFT JOIN attendance a ON s.id = a.schedule_id AND a.class_date = CURDATE()
            WHERE s.teacher_id = ? AND s.day_of_week = ?
            ORDER BY s.start_time
        `;
        const [schedules] = await pool.query(query, [teacherId, dayOfWeek]);
        res.json(schedules);
    } catch (error) {
        console.error('Erro ao buscar horários do professor:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};