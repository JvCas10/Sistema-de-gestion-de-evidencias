const { validateExpediente, validateIndicio, validateLogin } = require('../middleware/validation');

describe('Validation Middleware Tests', () => {
  
  describe('validateExpediente', () => {
    it('debe pasar validacion con datos correctos', () => {
      const req = {
        body: {
          numero_expediente: 'DICRI-123456',
          descripcion: 'Descripcion de prueba con mas de 10 caracteres'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateExpediente(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe rechazar numero_expediente muy corto', () => {
      const req = {
        body: {
          numero_expediente: 'DI',
          descripcion: 'Descripcion valida con suficiente texto'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateExpediente(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe rechazar descripcion muy corta', () => {
      const req = {
        body: {
          numero_expediente: 'DICRI-123456',
          descripcion: 'corta'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateExpediente(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateIndicio', () => {
    it('debe pasar validacion con datos minimos correctos', () => {
      const req = {
        body: {
          nombre_objeto: 'Objeto de prueba',
          descripcion: 'Descripcion detallada del indicio',
          expediente_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateIndicio(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('debe rechazar sin nombre_objeto', () => {
      const req = {
        body: {
          descripcion: 'Descripcion valida',
          expediente_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateIndicio(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateLogin', () => {
    it('debe pasar validacion con email y password validos', () => {
      const req = {
        body: {
          email: 'test@dicri.gob.gt',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateLogin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('debe rechazar email invalido', () => {
      const req = {
        body: {
          email: 'invalido',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateLogin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe rechazar password muy corto', () => {
      const req = {
        body: {
          email: 'test@dicri.gob.gt',
          password: '123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateLogin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});