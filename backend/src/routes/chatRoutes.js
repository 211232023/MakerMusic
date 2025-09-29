const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para buscar o histórico com um utilizador específico
router.get('/:userId', authMiddleware, chatController.getChatHistory);

// Rota para enviar uma mensagem
router.post('/', authMiddleware, chatController.sendMessage);

module.exports = router;