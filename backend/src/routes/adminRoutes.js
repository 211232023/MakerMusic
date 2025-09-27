const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
// Agora este 'require' irá funcionar porque o ficheiro existe
const authorize = require('../middleware/authorize');

// Aplica os middlewares para todas as rotas neste ficheiro
// 1º - Verifica se está logado (authMiddleware)
// 2º - Verifica se é ADMIN (authorize)
router.use(authMiddleware, authorize('ADMIN'));

// GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// POST /api/admin/assign-teacher
router.post('/assign-teacher', adminController.assignTeacherToStudent);

module.exports = router;