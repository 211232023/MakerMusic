const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/users', authMiddleware, authorize(['ADMIN']), adminController.getAllUsers);

router.post('/assign-teacher', authMiddleware, authorize(['ADMIN']), adminController.assignTeacherToStudent);

router.get('/teacher/:teacherId/students', authMiddleware, authorize(['ADMIN', 'PROFESSOR']), adminController.getStudentsByTeacher);

module.exports = router;