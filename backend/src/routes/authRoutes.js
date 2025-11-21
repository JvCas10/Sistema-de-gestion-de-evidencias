const express = require('express');
const router = express.Router();
const { login, register, getUsuarios } = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validation');

router.post('/login', validateLogin, login);
router.post('/register', authenticateToken, authorize('Administrador'), register);
router.get('/usuarios', authenticateToken, getUsuarios);

module.exports = router;