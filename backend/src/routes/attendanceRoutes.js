const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Rota para o professor marcar a presença
router.post('/', authMiddleware, authorize(['PROFESSOR']), attendanceController.markAttendance);

module.exports = router;