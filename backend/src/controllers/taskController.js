const pool = require('../config/db');

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