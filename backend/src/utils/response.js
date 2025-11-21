const success = (res, data, message = 'Operacion exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, message = 'Error en el servidor', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details
  });
};

module.exports = {
  success,
  error
};