const { getPool, sql } = require('../config/database');
const { success, error } = require('../utils/response');

const obtenerReporte = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return error(res, 'Las fechas de inicio y fin son requeridas', 400);
    }

    const fechaInicio = new Date(fecha_inicio + 'T00:00:00');
    const fechaFin = new Date(fecha_fin + 'T23:59:59');

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return error(res, 'Formato de fecha invalido', 400);
    }

    if (fechaFin < fechaInicio) {
      return error(res, 'La fecha fin debe ser mayor o igual a la fecha inicio', 400);
    }

    const pool = getPool();
    
    let query = `
      SELECT 
        e.expediente_id,
        e.numero_expediente,
        e.descripcion,
        e.fecha_creacion,
        ut.nombre as tecnico_nombre,
        uc.nombre as coordinador_nombre,
        e.estado, 
        e.justificacion_rechazo,
        (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.expediente_id) as total_indicios
      FROM Expedientes e
      INNER JOIN Usuario ut ON e.tecnico_registro = ut.usuario_id
      LEFT JOIN Usuario uc ON e.coordinador_asignado = uc.usuario_id
      WHERE e.fecha_creacion >= @fecha_inicio 
        AND e.fecha_creacion <= @fecha_fin
    `;

    const request = pool.request()
      .input('fecha_inicio', sql.DateTime, fechaInicio)
      .input('fecha_fin', sql.DateTime, fechaFin);

    if (estado && estado !== 'Todos') {
      query += ' AND e.estado = @estado';
      request.input('estado', sql.VarChar, estado);
    }

    query += ' ORDER BY e.fecha_creacion DESC';

    const result = await request.query(query);

    return success(res, result.recordset);
  } catch (err) {
    console.error('Error al obtener reporte:', err);
    return error(res, 'Error al obtener reporte', 500, err.message);
  }
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .execute('sp_ObtenerEstadisticas');

    const stats = result.recordset[0] || { 
        total_expedientes: 0, 
        en_registro: 0, 
        en_revision: 0, 
        aprobados: 0, 
        rechazados: 0 
    };

    return success(res, {
      total_expedientes: stats.total_expedientes,
      en_registro: stats.en_registro,
      en_revision: stats.en_revision,
      aprobados: stats.aprobados,
      rechazados: stats.rechazados
    });

  } catch (err) {
    console.error('Error al obtener estadisticas:', err);
    return error(res, 'Error al obtener estadisticas', 500, err.message);
  }
};

const obtenerExpedientesParaRevision = async (req, res) => {
  try {
    const coordinador_id = req.user ? req.user.usuario_id : null;

    if (!coordinador_id) {
        return error(res, 'Usuario no autenticado', 401);
    }

    const pool = getPool();
    const result = await pool.request()
      .input('coordinador_id', sql.Int, coordinador_id)
      .execute('sp_ObtenerExpedientesParaRevision');

    return success(res, result.recordset);

  } catch (err) {
    console.error('Error al obtener expedientes para revision:', err);
    return error(res, 'Error al obtener expedientes para revision', 500, err.message);
  }
};

module.exports = {
  obtenerReporte,
  obtenerEstadisticas,
  obtenerExpedientesParaRevision
};