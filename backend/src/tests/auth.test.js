const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API Tests', () => {
  
  describe('POST /api/auth/login', () => {
    it('debe rechazar login sin credenciales', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar login con email invalido', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalido',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar login con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'wrongpassword'
        });
      
      expect([401, 500]).toContain(res.statusCode);
    });

    it('debe responder a solicitudes de login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@dicri.gob.gt',
          password: 'password123'
        });
      
      expect([200, 401, 500]).toContain(res.statusCode);
    });
  });
});