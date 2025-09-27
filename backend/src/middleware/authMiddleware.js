const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obter o token do cabeçalho de autorização
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    // O token geralmente vem no formato "Bearer <token>"
    const token = authHeader.split(' ')[1];
    console.log('[BACKEND] authMiddleware: Token recebido:', token);

    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    // Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[BACKEND] authMiddleware: Token descodificado com sucesso:', decoded.user);
    
    // Adiciona os dados do utilizador ao objeto de pedido (request)
    req.user = decoded.user;
    
    // Continua para a próxima função na cadeia (seja outro middleware ou o controlador)
    next();
  } catch (error) {
    // Se jwt.verify falhar (token expirado, inválido, etc.), ele lança um erro
    console.error('[BACKEND] authMiddleware: Erro!', error.message);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};