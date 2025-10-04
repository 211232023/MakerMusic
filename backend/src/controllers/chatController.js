const { pool } = require('../config/db');

exports.getChatHistory = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const otherUserId = req.params.userId;

    const [messages] = await pool.query(
      `SELECT id, sender_id, receiver_id, message_text, sent_at 
       FROM chat_messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY sent_at ASC`,
      [loggedInUserId, otherUserId, otherUserId, loggedInUserId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, messageText } = req.body;

    if (!receiverId || !messageText || !messageText.trim()) {
      return res.status(400).json({ message: 'Destinatário e texto da mensagem são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO chat_messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)',
      [senderId, receiverId, messageText]
    );

    res.status(201).json({ message: 'Mensagem enviada com sucesso!', messageId: result.insertId });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};