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

router.get(
  '/users',
  [authMiddleware, authorize('ADMIN')],
  adminController.getAllUsers
);

router.post(
  '/assign-teacher',
  [authMiddleware, authorize('ADMIN')],
  adminController.assignTeacherToStudent
);

module.exports = router;