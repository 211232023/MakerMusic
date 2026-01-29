const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Rota para buscar histórico
router.get('/history/:userId', authMiddleware, chatController.getChatHistory);

// Rota para enviar mensagem
router.post('/send', authMiddleware, chatController.sendMessage);

// Rota para upload de arquivos (AJUSTADA PARA CELULAR)
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado ou limite de 20MB excedido.' });
  }
  
  // MUDANÇA AQUI: Retornar apenas o caminho relativo.
  // O frontend (ChatScreen.tsx) irá prefixar com BASE_FILES_URL.
  const fileUrl = `/uploads/${req.file.filename}`;

  // Retorna os dados do arquivo com a URL completa
  res.json({
    message: 'Upload realizado com sucesso!',
    fileUrl: fileUrl, // Agora envia /uploads/...
    fileName: Buffer.from(req.file.originalname, 'latin1' ).toString('utf8'),
    fileSize: req.file.size
  });
});

module.exports = router;