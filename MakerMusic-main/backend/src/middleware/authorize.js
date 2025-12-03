const authorize = (roles = []) => {
  
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    console.log(`[BACKEND] authorize: A verificar se o utilizador (${req.user?.role}) tem a permissão (${roles})`); // <-- LOG 6
    if (!req.user || !roles.includes(req.user.role)) {
      console.error('[BACKEND] authorize: Acesso negado!'); // <-- LOG DE ERRO
      return res.status(403).json({ message: 'Acesso proibido.' });
    }
    console.log('[BACKEND] authorize: Permissão concedida.'); // <-- LOG 7
    next();
  };
};

module.exports = authorize;