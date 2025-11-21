const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return error(res, 'Token no proporcionado', 401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return error(res, 'Token invalido o expirado', 403);
    }
    req.user = user;
    next();
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol_nombre)) {
      return error(res, 'No tienes permisos para realizar esta accion', 403);
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize
};