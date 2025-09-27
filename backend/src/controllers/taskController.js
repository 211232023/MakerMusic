const pool = require('../config/db');

// Rota do ALUNO para ver as suas tarefas (já existente e correta)
exports.getStudentTasks = async (req, res) => {
  try {
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

// Rota do PROFESSOR para obter a sua lista de alunos (CORRIGIDA)
exports.getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.user.id; // O ID do professor vem do token

    // Query CORRIGIDA: Seleciona todos os utilizadores (alunos)
    // que têm o 'teacher_id' igual ao ID do professor logado.
    const [students] = await pool.query(
      `SELECT id, name FROM users WHERE role = 'ALUNO' AND teacher_id = ?`, 
      [teacherId]
    );

    res.json(students);
  } catch (error) {
    console.error("Erro ao obter alunos:", error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Rota do PROFESSOR para criar uma tarefa para um aluno (CORRIGIDA)
exports.createTaskForStudent = async (req, res) => {
  const { title, studentId } = req.body; // Já não precisamos de classId
  const creatorId = req.user.id;

  if (!title || !studentId) {
    return res.status(400).json({ message: 'Título e aluno são obrigatórios.' });
  }

  try {
    // Passo 1: Inserir a nova tarefa na tabela 'tasks' (sem class_id)
    const [taskResult] = await pool.query(
      'INSERT INTO tasks (title, creator_id) VALUES (?, ?)',
      [title, creatorId]
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