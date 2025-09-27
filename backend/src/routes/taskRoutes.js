const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o nosso middleware

// GET /api/tasks
// A rota está protegida. O 'authMiddleware' corre primeiro.
// Se o token for válido, ele chama 'getStudentTasks'.
router.get('/', authMiddleware, taskController.getStudentTasks);

module.exports = router;