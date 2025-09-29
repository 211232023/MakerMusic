const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Rota para professor criar uma tarefa para um aluno
router.post('/', authMiddleware, authorize(['PROFESSOR']), taskController.createTask);

// Rota para aluno ou professor ver as tarefas de um aluno específico
router.get('/student/:studentId', authMiddleware, authorize(['ALUNO', 'PROFESSOR']), taskController.getTasksByStudent);

// O ":taskId" na URL permite-nos saber qual tarefa está a ser atualizada
router.put('/:taskId/status', authMiddleware, authorize(['ALUNO']), taskController.updateTaskStatus);


module.exports = router;