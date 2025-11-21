const { success, error } = require('../utils/response');

describe('Response Utils Tests', () => {
  
  describe('success function', () => {
    it('debe retornar respuesta exitosa con codigo 200 por defecto', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      success(res, { id: 1 }, 'Operacion exitosa');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operacion exitosa',
        data: { id: 1 }
      });
    });

    it('debe retornar respuesta exitosa con codigo personalizado', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      success(res, { id: 2 }, 'Recurso creado', 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('error function', () => {
    it('debe retornar respuesta de error con codigo 500 por defecto', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      error(res, 'Error interno del servidor');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor',
        details: null
      });
    });

    it('debe retornar respuesta de error con codigo personalizado', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      error(res, 'Recurso no encontrado', 404);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Recurso no encontrado',
        details: null
      });
    });

    it('debe incluir detalles del error cuando se proporcionan', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      error(res, 'Error de validacion', 400, 'Campo requerido');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validacion',
        details: 'Campo requerido'
      });
    });
  });
});