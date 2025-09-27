const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obter o token do cabeçalho do pedido
  const token = req.header('Authorization')?.split(' ')[1]; // Formato "Bearer TOKEN"

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    // Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Adiciona os dados do user ao objeto 'req'
    next(); // Passa para o próximo passo (o controlador)
  } catch (ex) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

const authorize = (roles = []) => {
  // Garante que 'roles' seja sempre um array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // O authMiddleware já deve ter colocado o req.user
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso proibido. Você не tem a permissão necessária.' });
    }
    next();
  };
};
