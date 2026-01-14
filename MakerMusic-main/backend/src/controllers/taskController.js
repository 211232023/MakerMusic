const { pool } = require('../config/db');

console.log('Conteúdo do pool no taskController:', pool);

exports.createTask = async (req, res) => {
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

exports.getTasksByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const query = `
            SELECT 
                t.id, 
                t.title, 
                t.due_date, 
                ts.completed IS TRUE AS completed 
            FROM tasks t
            LEFT JOIN task_submissions ts ON t.id = ts.task_id AND t.student_id = ts.student_id
            WHERE t.student_id = ?
            ORDER BY t.created_at DESC
        `;
        
        const [tasks] = await pool.query(query, [studentId]);
        
        res.json(tasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  const studentId = req.user.id;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'O estado "completed" é obrigatório e deve ser um booleano.' });
  }

  try {
    const [tasks] = await pool.query('SELECT student_id FROM tasks WHERE id = ?', [taskId]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    if (tasks[0].student_id !== studentId) {
      return res.status(403).json({ message: 'Não tem permissão para alterar esta tarefa.' });
    }

    const completedAt = completed ? new Date() : null;
    // Primeiro, verificamos se já existe uma submissão
    const [existingSubmissions] = await pool.query(
      'SELECT id FROM task_submissions WHERE task_id = ? AND student_id = ?',
      [taskId, studentId]
    );

    if (existingSubmissions.length > 0) {
      console.log("Atualizando submissão existente para tarefa:", taskId);
      await pool.query(
        'UPDATE task_submissions SET completed = ?, completed_at = ? WHERE task_id = ? AND student_id = ?',
        [completed, completedAt, taskId, studentId]
      );
    } else {
      console.log("Criando nova submissão para tarefa:", taskId);
      await pool.query(
        'INSERT INTO task_submissions (task_id, student_id, completed, completed_at) VALUES (?, ?, ?, ?)',
        [taskId, studentId, completed, completedAt]
      );
    }

    res.status(200).json({ message: 'Tarefa atualizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Total de tarefas atribuídas
    const [totalTasks] = await pool.query(
      'SELECT COUNT(*) as total FROM tasks WHERE student_id = ?',
      [studentId]
    );

    // Total de tarefas concluídas
    const [completedTasks] = await pool.query(
      'SELECT COUNT(*) as completed FROM task_submissions WHERE student_id = ? AND completed = TRUE',
      [studentId]
    );

    // Detalhes das tarefas para o gráfico/lista
    const [taskDetails] = await pool.query(
      `SELECT t.title, t.due_date, ts.completed, ts.completed_at 
       FROM tasks t 
       LEFT JOIN task_submissions ts ON t.id = ts.task_id 
       WHERE t.student_id = ?`,
      [studentId]
    );

    res.json({
      total: totalTasks[0].total,
      completed: completedTasks[0].completed,
      tasks: taskDetails
    });
  } catch (error) {
    console.error('Erro ao buscar desempenho:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};