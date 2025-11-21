const express = require('express');
const router = express.Router();
const {
  crearIndicio,
  obtenerIndiciosPorExpediente,
  actualizarIndicio,
  eliminarIndicio
} = require('../controllers/indicioController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateIndicio } = require('../middleware/validation');

router.post('/', authenticateToken, authorize('Tecnico', 'Administrador'), validateIndicio, crearIndicio);
router.get('/expediente/:expediente_id', authenticateToken, obtenerIndiciosPorExpediente);
router.put('/:id', authenticateToken, authorize('Tecnico', 'Administrador'), validateIndicio, actualizarIndicio);
router.delete('/:id', authenticateToken, authorize('Tecnico', 'Administrador'), eliminarIndicio);

module.exports = router;