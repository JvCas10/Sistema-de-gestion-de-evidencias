import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si hay token y es 401 (sesión expirada)
    // NO redirigir si es intento de login fallido
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUsuarios: () => api.get('/auth/usuarios'),
};

export const expedienteService = {
  getAll: (params) => api.get('/expedientes', { params }),
  getById: (id) => api.get(`/expedientes/${id}`),
  create: (data) => api.post('/expedientes', data),
  update: (id, data) => api.put(`/expedientes/${id}`, data),
  enviarRevision: (id, coordinador_asignado) => 
    api.post(`/expedientes/${id}/enviar-revision`, { coordinador_asignado }),
  aprobar: (id) => api.post(`/expedientes/${id}/aprobar`),
  rechazar: (id, justificacion_rechazo) => 
    api.post(`/expedientes/${id}/rechazar`, { justificacion_rechazo }),
};

export const indicioService = {
  getByExpediente: (expedienteId) => api.get(`/indicios/expediente/${expedienteId}`),
  create: (data) => api.post('/indicios', data),
  update: (id, data) => api.put(`/indicios/${id}`, data),
  delete: (id) => api.delete(`/indicios/${id}`),
};

export const reporteService = {
  getReporte: (params) => api.get('/reportes/reporte', { params }),
  getEstadisticas: (params) => api.get('/reportes/estadisticas', { params }),
  getPendientesRevision: () => api.get('/reportes/revision/pendientes'),
};

export default api;