const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.post('/', authMiddleware, authorize(['PROFESSOR']), scheduleController.createSchedule);

router.get('/my-schedules', authMiddleware, authorize(['ALUNO']), scheduleController.getSchedulesByStudent);

router.get('/teacher/day/:dayOfWeek', authMiddleware, authorize(['PROFESSOR']), scheduleController.getSchedulesForTeacherByDay);

module.exports = router;