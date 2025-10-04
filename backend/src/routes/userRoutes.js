const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/my-teacher', authMiddleware, authorize(['ALUNO']), userController.getMyTeacher);

module.exports = router;