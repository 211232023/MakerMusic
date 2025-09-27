const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Rotas existentes...
router.get('/users', authMiddleware, authorize(['ADMIN']), adminController.getAllUsers);
// ...

// --- ROTA ATUALIZADA ---
// Antes era /assign-student-to-class
router.post('/assign-teacher', authMiddleware, authorize(['ADMIN']), adminController.assignTeacherToStudent);

// --- ROTA ATUALIZADA ---
// Antes usava a tabela de turmas, agora busca direto
router.get('/teacher/:teacherId/students', authMiddleware, authorize(['ADMIN', 'PROFESSOR']), adminController.getStudentsByTeacher);

module.exports = router;