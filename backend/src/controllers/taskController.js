const { pool } = require('../config/db');

console.log('Conteúdo do pool no taskController:', pool);

// Cria uma nova tarefa para um aluno específico
exports.createTask = async (req, res) => {
    // O creator_id vem do token (usuário logado)
    const creatorId = req.user.id; 
    const { studentId, title, dueDate } = req.body;

    if (!studentId || !title) {
        return res.status(400).json({ message: 'ID do aluno e título são obrigatórios.' });
    }

    try {
        await pool.query(
            'INSERT INTO tasks (student_id, creator_id, title, due_date) VALUES (?, ?, ?, ?)',
            [studentId, creatorId, title, dueDate || null]
        );
        res.status(201).json({ message: 'Tarefa criada com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// Pega as tarefas de um aluno específico
exports.getTasksByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const [tasks] = await pool.query('SELECT * FROM tasks WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
        res.json(tasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body; // Esperamos receber { "completed": true }

  // O ID do aluno vem do token para garantir que só o próprio aluno pode marcar a sua tarefa
  const studentId = req.user.id;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'O estado "completed" é obrigatório e deve ser um booleano.' });
  }

  try {
    // Primeiro, vamos garantir que a tarefa pertence mesmo a este aluno
    const [tasks] = await pool.query('SELECT student_id FROM tasks WHERE id = ?', [taskId]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    if (tasks[0].student_id !== studentId) {
      return res.status(403).json({ message: 'Não tem permissão para alterar esta tarefa.' });
    }

    // Agora, inserimos ou atualizamos o registo na tabela de submissões
    // O comando `ON DUPLICATE KEY UPDATE` é uma forma eficiente de fazer um "upsert"
    const completedAt = completed ? new Date() : null;
    await pool.query(
      `INSERT INTO task_submissions (task_id, student_id, completed, completed_at) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE completed = ?, completed_at = ?`,
      [taskId, studentId, completed, completedAt, completed, completedAt]
    );

    res.status(200).json({ message: 'Tarefa atualizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};