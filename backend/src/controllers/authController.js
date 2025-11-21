const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');
const { success, error } = require('../utils/response');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email y password son requeridos', 400);
    }

    const pool = getPool();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT u.usuario_id, u.nombre, u.email, u.password_hash, u.rol_id, r.nombre as rol_nombre, u.activo FROM Usuario u INNER JOIN Roles r ON u.rol_id = r.rol_id WHERE u.email = @email AND u.activo = 1');

    if (result.recordset.length === 0) {
      return error(res, 'Credenciales invalidas', 401);
    }

    const user = result.recordset[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return error(res, 'Credenciales invalidas', 401);
    }

    const token = jwt.sign(
      {
        usuario_id: user.usuario_id,
        email: user.email,
        rol_id: user.rol_id,
        rol_nombre: user.rol_nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return success(res, {
      token,
      user: {
        usuario_id: user.usuario_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol_nombre
      }
    }, 'Login exitoso');

  } catch (err) {
    console.error('Error en login:', err);
    return error(res, 'Error al iniciar sesion', 500, err.message);
  }
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    if (!nombre || !email || !password || !rol_id) {
      return error(res, 'Todos los campos son requeridos', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const pool = getPool();
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, passwordHash)
      .input('rol_id', sql.Int, rol_id)
      .execute('sp_CrearUsuario');

    return success(res, {
      usuario_id: result.recordset[0].usuario_id
    }, 'Usuario creado exitosamente', 201);

  } catch (err) {
    console.error('Error en register:', err);
    if (err.message && err.message.includes('email ya esta registrado')) {
      return error(res, 'El email ya esta registrado', 400);
    }
    return error(res, 'Error al crear usuario', 500, err.message);
  }
};

const getUsuarios = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .execute('sp_ObtenerUsuarios');

    return success(res, result.recordset);

  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return error(res, 'Error al obtener usuarios', 500, err.message);
  }
};

module.exports = {
  login,
  register,
  getUsuarios
};