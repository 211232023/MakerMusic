const pool = require('../config/db');

// Obter todas as tarefas de um aluno específico
exports.getStudentTasks = async (req, res) => {
  try {
    // O ID do aluno vem do middleware que decodificou o token
    const studentId = req.user.id;

    const [tasks] = await pool.query(
      `SELECT t.id, t.title, t.due_date, ts.completed 
       FROM tasks t
       JOIN task_submissions ts ON t.id = ts.task_id
       WHERE ts.student_id = ?`,
      [studentId]
    );

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao obter tarefas.' });
  }
};

// Obter os alunos de um professor
exports.getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.user.id; // O ID do professor vem do token

    // Este query encontra todos os alunos (users) que estão matriculados (enrollments)
    // em turmas (classes) lecionadas pelo professor logado.
    const [students] = await pool.query(`
      SELECT u.id, u.name 
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = ? AND u.role = 'ALUNO'
      GROUP BY u.id, u.name
    `, [teacherId]);

    res.json(students);
  } catch (error) {
    console.error("Erro ao obter alunos:", error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Criar uma nova tarefa para um aluno
exports.createTaskForStudent = async (req, res) => {
  const { title, studentId, classId } = req.body; // O professor irá escolher o aluno e a turma
  const creatorId = req.user.id; // O criador é o professor logado

  if (!title || !studentId || !classId) {
    return res.status(400).json({ message: 'Título, aluno e turma são obrigatórios.' });
  }

  try {
    // Passo 1: Inserir a nova tarefa na tabela 'tasks'
    const [taskResult] = await pool.query(
      'INSERT INTO tasks (title, class_id, creator_id) VALUES (?, ?, ?)',
      [title, classId, creatorId]
    );
    const newTaskId = taskResult.insertId;

    // Passo 2: Ligar esta tarefa ao aluno na tabela 'task_submissions'
    await pool.query(
      'INSERT INTO task_submissions (task_id, student_id) VALUES (?, ?)',
      [newTaskId, studentId]
    );

    res.status(201).json({ message: 'Tarefa criada e atribuída com sucesso!', taskId: newTaskId });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};