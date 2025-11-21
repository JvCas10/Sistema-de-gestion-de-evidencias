const express = require('express');
const router = express.Router();
const {
  crearExpediente,
  obtenerExpedientes,
  obtenerExpedientePorId,
  actualizarExpediente,
  enviarRevision,
  aprobarExpediente,
  rechazarExpediente
} = require('../controllers/expedienteController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateExpediente } = require('../middleware/validation');

router.post('/', authenticateToken, authorize('Tecnico', 'Administrador'), validateExpediente, crearExpediente);
router.get('/', authenticateToken, obtenerExpedientes);
router.get('/:id', authenticateToken, obtenerExpedientePorId);
router.put('/:id', authenticateToken, authorize('Tecnico', 'Administrador'), validateExpediente, actualizarExpediente);
router.post('/:id/enviar-revision', authenticateToken, authorize('Tecnico', 'Administrador'), enviarRevision);
router.post('/:id/aprobar', authenticateToken, authorize('Coordinador', 'Administrador'), aprobarExpediente);
router.post('/:id/rechazar', authenticateToken, authorize('Coordinador', 'Administrador'), rechazarExpediente);

module.exports = router;