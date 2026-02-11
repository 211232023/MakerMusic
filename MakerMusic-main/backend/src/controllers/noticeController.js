const db = require('../config/db');

exports.getNotices = async (req, res) => {
  try {
    const [notices] = await db.query(
      'SELECT * FROM notices ORDER BY is_pinned DESC, created_at DESC'
    );
    res.json(notices);
  } catch (error) {
    console.error('Erro ao buscar avisos:', error);
    res.status(500).json({ message: 'Erro ao buscar avisos' });
  }
};

exports.createNotice = async (req, res) => {
  const { title, content, category } = req.body;
  const { id: author_id, name: author_name } = req.user;

  if (req.user.role !== 'ADMIN' && req.user.role !== 'PROFESSOR') {
    return res.status(403).json({ message: 'Sem permissão para criar avisos' });
  }

  if (!title || !content) {
    return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO notices (title, content, author_id, author_name, category) VALUES (?, ?, ?, ?, ?)',
      [title, content, author_id, author_name, category || 'GERAL']
    );
    
    res.status(201).json({ 
      message: 'Aviso criado com sucesso!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erro ao criar aviso:', error);
    res.status(500).json({ message: 'Erro ao criar aviso' });
  }
};

exports.updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [notice] = await db.query('SELECT author_id FROM notices WHERE id = ?', [id]);
    
    if (notice.length === 0) {
      return res.status(404).json({ message: 'Aviso não encontrado' });
    }

    if (userRole !== 'ADMIN' && notice[0].author_id !== userId) {
      return res.status(403).json({ message: 'Sem permissão para editar este aviso' });
    }

    await db.query(
      'UPDATE notices SET title = ?, content = ?, category = ? WHERE id = ?',
      [title, content, category, id]
    );
    
    res.json({ message: 'Aviso atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar aviso:', error);
    res.status(500).json({ message: 'Erro ao atualizar aviso' });
  }
};

exports.deleteNotice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [notice] = await db.query('SELECT author_id FROM notices WHERE id = ?', [id]);
    
    if (notice.length === 0) {
      return res.status(404).json({ message: 'Aviso não encontrado' });
    }

    if (userRole !== 'ADMIN' && notice[0].author_id !== userId) {
      return res.status(403).json({ message: 'Sem permissão para deletar este aviso' });
    }

    await db.query('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ message: 'Aviso deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar aviso:', error);
    res.status(500).json({ message: 'Erro ao deletar aviso' });
  }
};

exports.togglePin = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores podem fixar avisos' });
  }

  try {
    await db.query(
      'UPDATE notices SET is_pinned = NOT is_pinned WHERE id = ?',
      [id]
    );
    res.json({ message: 'Status de fixação atualizado!' });
  } catch (error) {
    console.error('Erro ao atualizar fixação:', error);
    res.status(500).json({ message: 'Erro ao atualizar fixação' });
  }
};
