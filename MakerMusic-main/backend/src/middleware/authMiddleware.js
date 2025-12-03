const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    console.log('[BACKEND] authMiddleware: Token recebido:', token);

    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[BACKEND] authMiddleware: Token descodificado com sucesso:', decoded.user);
    
    req.user = decoded.user;
    
    next();
  } catch (error) {

    console.error('[BACKEND] authMiddleware: Erro!', error.message);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};