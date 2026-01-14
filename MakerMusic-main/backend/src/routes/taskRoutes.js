const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.post('/', authMiddleware, authorize(['PROFESSOR']), taskController.createTask);

router.get('/student/:studentId', authMiddleware, authorize(['ALUNO', 'PROFESSOR']), taskController.getTasksByStudent);

router.put('/:taskId/status', authMiddleware, authorize(['ALUNO']), taskController.updateTaskStatus);
router.get('/performance/:studentId', authMiddleware, authorize(['PROFESSOR']), taskController.getStudentPerformance);


module.exports = router;