const { pool } = require('../config/db');

// Buscar histórico de mensagens entre dois usuários
exports.getChatHistory = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Busca todas as colunas da tabela chat_messages para garantir compatibilidade multimídia
    const [messages] = await pool.query(
      `SELECT * FROM chat_messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY sent_at ASC`,
      [loggedInUserId, otherUserId, otherUserId, loggedInUserId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico do chat.' });
  }
};

// Enviar uma nova mensagem (Texto ou Multimídia)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, messageText, messageType, fileUrl, fileName, fileSize } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'ID do destinatário é obrigatório.' });
    }

    const type = messageType || 'TEXT';

    // Define um texto padrão caso messageText seja nulo/vazio
    let finalMessageText = messageText;
    if (!finalMessageText && type !== 'TEXT') {
      const typeLabels = { 
        IMAGE: '📷 Foto', 
        AUDIO: '🎵 Áudio', 
        VIDEO: '🎥 Vídeo', 
        FILE: '📄 Arquivo' 
      };
      finalMessageText = typeLabels[type] || 'Arquivo enviado';
    }

    // Garante que o texto nunca seja nulo para o banco de dados
    const safeText = finalMessageText || '';

    // Insere a mensagem no banco de dados com suporte a arquivos
    const [result] = await pool.query(
      'INSERT INTO chat_messages (sender_id, receiver_id, message_text, message_type, file_url, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [senderId, receiverId, safeText, type, fileUrl || null, fileName || null, fileSize || null]
    );

    res.status(201).json({ 
      message: 'Mensagem enviada com sucesso!', 
      messageId: result.insertId,
      data: {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        message_text: safeText,
        message_type: type,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize
      }
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro ao enviar mensagem.' });
  }
};