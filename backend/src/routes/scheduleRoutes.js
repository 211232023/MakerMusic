const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Rota para professor criar um horário
router.post('/', authMiddleware, authorize(['PROFESSOR']), scheduleController.createSchedule);

// Rota para o aluno ver os seus horários
router.get('/my-schedules', authMiddleware, authorize(['ALUNO']), scheduleController.getSchedulesByStudent);

// Rota para o professor ver a sua agenda de um dia específico
router.get('/teacher/day/:dayOfWeek', authMiddleware, authorize(['PROFESSOR']), scheduleController.getSchedulesForTeacherByDay);

module.exports = router;