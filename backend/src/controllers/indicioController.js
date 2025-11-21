const { getPool, sql } = require('../config/database');
const { success, error } = require('../utils/response');

const crearIndicio = async (req, res) => {
  try {
    const {
      nombre_objeto,
      descripcion,
      color,
      tamano_cm,
      peso_gramos,
      ubicacion,
      expediente_id
    } = req.body;

    const tecnico_registro = req.user.usuario_id;

    if (!nombre_objeto || !descripcion || !expediente_id) {
      return error(res, 'Nombre, descripcion y expediente_id son requeridos', 400);
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('nombre_objeto', sql.VarChar, nombre_objeto)
      .input('descripcion', sql.VarChar, descripcion)
      .input('color', sql.VarChar, color || null)
      .input('tamano_cm', sql.Float, tamano_cm || null)
      .input('peso_gramos', sql.Float, peso_gramos || null)
      .input('ubicacion', sql.VarChar, ubicacion || null)
      .input('expediente_id', sql.Int, expediente_id)
      .input('tecnico_registro', sql.Int, tecnico_registro)
      .execute('sp_CrearIndicio');

    return success(res, {
      indicio_id: result.recordset[0].indicio_id
    }, 'Indicio creado exitosamente', 201);

  } catch (err) {
    console.error('Error al crear indicio:', err);
    if (err.message && err.message.includes('en registro')) {
      return error(res, 'Solo se pueden agregar indicios a expedientes en registro', 400);
    }
    return error(res, 'Error al crear indicio', 500, err.message);
  }
};

const obtenerIndiciosPorExpediente = async (req, res) => {
  try {
    const { expediente_id } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .execute('sp_ObtenerIndiciosPorExpediente');

    return success(res, result.recordset);

  } catch (err) {
    console.error('Error al obtener indicios:', err);
    return error(res, 'Error al obtener indicios', 500, err.message);
  }
};

const actualizarIndicio = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_objeto,
      descripcion,
      color,
      tamano_cm,
      peso_gramos,
      ubicacion
    } = req.body;

    if (!nombre_objeto || !descripcion) {
      return error(res, 'Nombre y descripcion son requeridos', 400);
    }

    const pool = await getPool();
    await pool.request()
      .input('indicio_id', sql.Int, id)
      .input('nombre_objeto', sql.VarChar, nombre_objeto)
      .input('descripcion', sql.VarChar, descripcion)
      .input('color', sql.VarChar, color || null)
      .input('tamano_cm', sql.Float, tamano_cm || null)
      .input('peso_gramos', sql.Float, peso_gramos || null)
      .input('ubicacion', sql.VarChar, ubicacion || null)
      .execute('sp_ActualizarIndicio');

    return success(res, null, 'Indicio actualizado exitosamente');

  } catch (err) {
    console.error('Error al actualizar indicio:', err);
    if (err.message && err.message.includes('en registro')) {
      return error(res, 'Solo se pueden editar indicios de expedientes en registro', 400);
    }
    return error(res, 'Error al actualizar indicio', 500, err.message);
  }
};

const eliminarIndicio = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    await pool.request()
      .input('indicio_id', sql.Int, id)
      .execute('sp_EliminarIndicio');

    return success(res, null, 'Indicio eliminado exitosamente');

  } catch (err) {
    console.error('Error al eliminar indicio:', err);
    if (err.message && err.message.includes('en registro')) {
      return error(res, 'Solo se pueden eliminar indicios de expedientes en registro', 400);
    }
    return error(res, 'Error al eliminar indicio', 500, err.message);
  }
};

module.exports = {
  crearIndicio,
  obtenerIndiciosPorExpediente,
  actualizarIndicio,
  eliminarIndicio
};