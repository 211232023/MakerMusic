const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Rota para obter todos os utilizadores (Protegida)
// GET /api/admin/users
// A sequência [authMiddleware, authorize('ADMIN')] garante que:
// 1. O utilizador está logado.
// 2. O utilizador tem o perfil 'ADMIN'.
// Só depois a função getAllUsers é chamada.
router.get(
  '/users',
  [authMiddleware, authorize('ADMIN')],
  adminController.getAllUsers
);

// Rota para associar um professor a um aluno (Protegida)
// POST /api/admin/assign-teacher
router.post(
  '/assign-teacher',
  [authMiddleware, authorize('ADMIN')],
  adminController.assignTeacherToStudent
);

module.exports = router;