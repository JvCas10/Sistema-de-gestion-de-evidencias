const { getPool, sql } = require('../config/database');
const { success, error } = require('../utils/response');

const crearExpediente = async (req, res) => {
  try {
    const { numero_expediente, descripcion } = req.body;
    const tecnico_registro = req.user.usuario_id;

    if (!numero_expediente || !descripcion) {
      return error(res, 'Numero de expediente y descripcion son requeridos', 400);
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('numero_expediente', sql.VarChar, numero_expediente)
      .input('descripcion', sql.VarChar, descripcion)
      .input('tecnico_registro', sql.Int, tecnico_registro)
      .execute('sp_CrearExpediente');

    return success(res, {
      expediente_id: result.recordset[0].expediente_id
    }, 'Expediente creado exitosamente', 201);

  } catch (err) {
    console.error('Error al crear expediente:', err);
    if (err.message && err.message.includes('ya existe')) {
      return error(res, 'El numero de expediente ya existe', 400);
    }
    return error(res, 'Error al crear expediente', 500, err.message);
  }
};

const obtenerExpedientes = async (req, res) => {
  try {
    const { estado, fecha_inicio, fecha_fin } = req.query;

    const pool = await getPool();
    const result = await pool.request()
      .input('estado', sql.VarChar, estado || null)
      .input('fecha_inicio', sql.DateTime, fecha_inicio || null)
      .input('fecha_fin', sql.DateTime, fecha_fin || null)
      .execute('sp_ObtenerExpedientes');

    return success(res, result.recordset);

  } catch (err) {
    console.error('Error al obtener expedientes:', err);
    return error(res, 'Error al obtener expedientes', 500, err.message);
  }
};

const obtenerExpedientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('expediente_id', sql.Int, id)
      .execute('sp_ObtenerExpedientePorId');

    if (result.recordset.length === 0) {
      return error(res, 'Expediente no encontrado', 404);
    }

    return success(res, result.recordset[0]);

  } catch (err) {
    console.error('Error al obtener expediente:', err);
    return error(res, 'Error al obtener expediente', 500, err.message);
  }
};

const actualizarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
      return error(res, 'La descripcion es requerida', 400);
    }

    const pool = await getPool();
    await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('descripcion', sql.VarChar, descripcion)
      .execute('sp_ActualizarExpediente');

    return success(res, null, 'Expediente actualizado exitosamente');

  } catch (err) {
    console.error('Error al actualizar expediente:', err);
    return error(res, 'Error al actualizar expediente', 500, err.message);
  }
};

const enviarRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinador_asignado } = req.body;

    if (!coordinador_asignado) {
      return error(res, 'El coordinador asignado es requerido', 400);
    }

    const pool = await getPool();
    await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('coordinador_asignado', sql.Int, coordinador_asignado)
      .execute('sp_EnviarExpedienteRevision');

    return success(res, null, 'Expediente enviado a revision');

  } catch (err) {
    console.error('Error al enviar a revision:', err);
    if (err.message && err.message.includes('al menos un indicio')) {
      return error(res, 'El expediente debe tener al menos un indicio', 400);
    }
    return error(res, 'Error al enviar expediente a revision', 500, err.message);
  }
};

const aprobarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinador_id = req.user.usuario_id;

    const pool = await getPool();
    await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('coordinador_id', sql.Int, coordinador_id)
      .execute('sp_AprobarExpediente');

    return success(res, null, 'Expediente aprobado exitosamente');

  } catch (err) {
    console.error('Error al aprobar expediente:', err);
    return error(res, 'Error al aprobar expediente', 500, err.message);
  }
};

const rechazarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const { justificacion_rechazo } = req.body;
    const coordinador_id = req.user.usuario_id;

    if (!justificacion_rechazo || justificacion_rechazo.length < 10) {
      return error(res, 'La justificacion debe tener al menos 10 caracteres', 400);
    }

    const pool = await getPool();
    await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('coordinador_id', sql.Int, coordinador_id)
      .input('justificacion_rechazo', sql.VarChar, justificacion_rechazo)
      .execute('sp_RechazarExpediente');

    return success(res, null, 'Expediente rechazado');

  } catch (err) {
    console.error('Error al rechazar expediente:', err);
    return error(res, 'Error al rechazar expediente', 500, err.message);
  }
};

module.exports = {
  crearExpediente,
  obtenerExpedientes,
  obtenerExpedientePorId,
  actualizarExpediente,
  enviarRevision,
  aprobarExpediente,
  rechazarExpediente
};