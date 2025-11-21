const express = require('express');
const router = express.Router();
const {
  obtenerReporte,
  obtenerEstadisticas,
  obtenerExpedientesParaRevision
} = require('../controllers/reporteController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/reporte', authenticateToken, obtenerReporte);
router.get('/estadisticas', authenticateToken, obtenerEstadisticas);
router.get('/revision/pendientes', authenticateToken, authorize('Coordinador', 'Administrador'), obtenerExpedientesParaRevision);

module.exports = router;