const validateExpediente = (req, res, next) => {
  const { numero_expediente, descripcion } = req.body;

  if (!numero_expediente || !numero_expediente.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El numero de expediente es requerido'
    });
  }

  if (numero_expediente.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'El numero de expediente debe tener al menos 5 caracteres'
    });
  }

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({
      success: false,
      message: 'La descripcion es requerida'
    });
  }

  if (descripcion.length < 20) {
    return res.status(400).json({
      success: false,
      message: 'La descripcion debe tener al menos 20 caracteres'
    });
  }

  next();
};

const validateIndicio = (req, res, next) => {
  const { nombre_objeto, descripcion, expediente_id } = req.body;

  if (!nombre_objeto || !nombre_objeto.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El nombre del objeto es requerido'
    });
  }

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({
      success: false,
      message: 'La descripcion es requerida'
    });
  }

  if (!expediente_id) {
    return res.status(400).json({
      success: false,
      message: 'El ID del expediente es requerido'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El email es requerido'
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Email invalido'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña es requerida'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  next();
};

module.exports = {
  validateExpediente,
  validateIndicio,
  validateLogin
};