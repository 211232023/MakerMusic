const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// --- INÍCIO DA CORREÇÃO ---
// Importar os middlewares que estavam em falta
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
// --- FIM DA CORREÇÃO ---

// Rota de registo (pública)
router.post('/register', userController.registerUser);

// Rota de login (pública)
router.post('/login', userController.loginUser);

// Rota para um aluno buscar os dados do seu professor (protegida)
router.get('/my-teacher', authMiddleware, authorize(['ALUNO']), userController.getMyTeacher);

module.exports = router;