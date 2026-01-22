const { pool } = require('../config/db');

exports.createSchedule = async (req, res) => {
  console.log('[BACKEND] createSchedule: Iniciando criação de horário');
  console.log('[BACKEND] Body recebido:', req.body);
  console.log('[BACKEND] Usuário autenticado:', req.user);
  
  const { studentId, dayOfWeek, startTime, endTime, activity } = req.body;
  const teacherId = req.user.id; // Extraído do token JWT via authMiddleware

  // Validação básica
  if (!studentId || !dayOfWeek || !startTime || !endTime || !activity) {
    console.warn('[BACKEND] Validação falhou: Campos obrigatórios ausentes');
    return res.status(400).json({
      message: 'Todos os campos são obrigatórios (studentId, dayOfWeek, startTime, endTime, activity).'
    });
  }

  try {
    // 1. Resolver a Classe (class_id) automaticamente
    console.log(`[BACKEND] Buscando classe para aluno ${studentId} e professor ${teacherId}`);
    
    // Buscar o ID do professor na tabela 'teachers' usando o user_id do token
    const [teachers] = await pool.query(
      'SELECT id FROM teachers WHERE user_id = ?',
      [teacherId]
    );

    if (teachers.length === 0) {
      console.error('[BACKEND] Erro: Professor não encontrado na tabela teachers.');
      return res.status(404).json({ message: 'Professor não encontrado no sistema.' });
    }

    const actualTeacherId = teachers[0].id;

    // Buscar a classe onde o aluno está matriculado e que pertence ao professor logado
    const [enrollments] = await pool.query(
      `SELECT e.class_id 
       FROM students s
       JOIN enrollments e ON e.student_id = s.id
       JOIN classes c ON e.class_id = c.id 
       WHERE s.user_id = ? AND c.teacher_id = ? AND e.status = 'ATIVO' 
       LIMIT 1`,
      [studentId, actualTeacherId]
    );

    let finalClassId = null;
    if (enrollments.length > 0) {
      finalClassId = enrollments[0].class_id;
      console.log(`[BACKEND] Classe encontrada via matrícula ativa: ${finalClassId}`);
    } else {
      // Fallback: Se não houver matrícula ativa específica, buscar qualquer classe do professor
      // para garantir que o horário seja criado vinculado a uma estrutura válida
      console.log('[BACKEND] Nenhuma matrícula ativa encontrada para este vínculo. Tentando fallback para primeira classe do professor.');
      const [teacherClasses] = await pool.query(
        'SELECT id FROM classes WHERE teacher_id = ? LIMIT 1',
        [actualTeacherId]
      );
      
      if (teacherClasses.length > 0) {
        finalClassId = teacherClasses[0].id;
        console.log(`[BACKEND] Classe encontrada via fallback do professor: ${finalClassId}`);
      }
    }

    // Se ainda não encontrou, o sistema não consegue criar o horário sem uma classe de referência
    if (!finalClassId) {
      console.error('[BACKEND] Erro: Não foi possível associar uma classe ao horário.');
      return res.status(400).json({ 
        message: 'Não foi possível encontrar uma turma válida para este aluno vinculada a você. Verifique se o aluno está matriculado corretamente.' 
      });
    }

    // 2. Inserir o horário no banco de dados
    const [result] = await pool.query(
      `INSERT INTO schedules 
       (student_id, teacher_id, class_id, day_of_week, start_time, end_time, activity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, teacherId, finalClassId, dayOfWeek, startTime, endTime, activity]
    );

    console.log(`[BACKEND] Horário criado com sucesso! ID: ${result.insertId}`);

    res.status(201).json({
      message: 'Horário criado com sucesso!',
      scheduleId: result.insertId
    });
  } catch (error) {
    console.error('[BACKEND] Erro ao criar horário:', error);
    res.status(500).json({ message: 'Erro no servidor ao salvar o horário.' });
  }
};

exports.getSchedulesByStudent = async (req, res) => {
  const studentId = req.user.id;

  try {
    const [schedules] = await pool.query(
      `
      SELECT 
        s.id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.activity,
        u.name AS teacher_name
      FROM schedules s
      JOIN users u ON u.id = s.teacher_id
      WHERE s.student_id = ?
      ORDER BY FIELD(
        s.day_of_week,
        'SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO'
      )
      `,
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
        s.activity,
        u.id AS student_id,
        u.name AS student_name,
        a.status AS attendance_status
      FROM schedules s
      JOIN users u ON u.id = s.student_id
      LEFT JOIN attendance a 
        ON a.schedule_id = s.id 
        AND a.class_date = CURDATE()
      WHERE s.teacher_id = ? 
        AND s.day_of_week = ?
      ORDER BY s.start_time
    `;

    const [schedules] = await pool.query(query, [teacherId, dayOfWeek]);
    res.json(schedules);
  } catch (error) {
    console.error('Erro ao buscar horários do professor:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};