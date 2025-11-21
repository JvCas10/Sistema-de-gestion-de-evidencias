const request = require('supertest');
const express = require('express');
const expedienteRoutes = require('../routes/expedienteRoutes');

const app = express();
app.use(express.json());
app.use('/api/expedientes', expedienteRoutes);

// Mock correcto
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { usuario_id: 1, rol_nombre: 'Tecnico' };
    next();
  },
  authorize: (...roles) => (req, res, next) => next()
}));

describe('Expedientes API Tests', () => {
  
  describe('POST /api/expedientes', () => {
    it('debe rechazar expediente sin datos', async () => {
      const res = await request(app)
        .post('/api/expedientes')
        .send({});
      
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar sin numero_expediente', async () => {
      const res = await request(app)
        .post('/api/expedientes')
        .send({
          descripcion: 'Test descripcion valida'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });
});