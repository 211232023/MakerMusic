// Middleware para verificar se o utilizador tem um dos perfis permitidos
const authorize = (roles = []) => {
  // Garante que 'roles' seja sempre um array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // O authMiddleware já deve ter colocado o req.user
    if (!req.user || !roles.includes(req.user.role)) {
      // 403 Forbidden é o status correto para permissão negada
      return res.status(403).json({ message: 'Acesso proibido. Você não tem a permissão necessária.' });
    }
    // Se tiver permissão, continua para a próxima função (o controlador)
    next();
  };
};

module.exports = authorize;