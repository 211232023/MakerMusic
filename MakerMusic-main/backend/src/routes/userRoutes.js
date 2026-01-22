const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.post('/forgot-password', userController.forgotPassword);

router.put('/reset-password', userController.resetPassword);

router.get('/my-students', authMiddleware, authorize(['PROFESSOR', 'ADMIN']), userController.getMyStudents);

router.get('/my-teacher', authMiddleware, authorize(['ALUNO']), userController.getMyTeacher);

router.put('/update-password', userController.updatePassword);

module.exports = router;