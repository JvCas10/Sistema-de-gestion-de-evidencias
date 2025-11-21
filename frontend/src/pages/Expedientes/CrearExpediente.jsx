import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expedienteService } from '../../services/api';
import Layout from '../../components/Layout';

const CrearExpediente = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ numero_expediente: false, descripcion: false });
  const [formData, setFormData] = useState({
    numero_expediente: '',
    descripcion: ''
  });

  const validateForm = () => {
    if (!formData.numero_expediente.trim()) {
      return 'El número de expediente es requerido';
    }
    if (formData.numero_expediente.length < 5) {
      return 'El número de expediente debe tener al menos 5 caracteres';
    }
    if (!formData.descripcion.trim()) {
      return 'La descripción es requerida';
    }
    if (formData.descripcion.length < 20) {
      return 'La descripción debe tener al menos 20 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await expedienteService.create(formData);
      navigate(`/expedientes/${response.data.data.expediente_id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear expediente. Verifique que el número no esté duplicado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const isFormValid = formData.numero_expediente.length >= 5 && formData.descripcion.length >= 20;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crear Expediente</h1>
          <p className="text-gray-600 mt-2">Registra un nuevo expediente DICRI</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Número de Expediente *
              </label>
              <input
                type="text"
                name="numero_expediente"
                value={formData.numero_expediente}
                onChange={handleChange}
                onBlur={() => handleBlur('numero_expediente')}
                placeholder="Ej: DICRI-2024-001"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  touched.numero_expediente && formData.numero_expediente.length < 5
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {touched.numero_expediente && formData.numero_expediente.length < 5 && formData.numero_expediente && (
                  <p className="text-red-500 text-sm">Mínimo 5 caracteres</p>
                )}
                <p className="text-gray-500 text-sm ml-auto">
                  {formData.numero_expediente.length}/50
                </p>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Descripción del Caso *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                onBlur={() => handleBlur('descripcion')}
                rows="5"
                placeholder="Describe detalladamente el caso..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  touched.descripcion && formData.descripcion.length < 20
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {touched.descripcion && formData.descripcion.length < 20 && formData.descripcion && (
                  <p className="text-red-500 text-sm">Mínimo 20 caracteres</p>
                )}
                <p className={`text-sm ml-auto ${
                  formData.descripcion.length >= 20 ? 'text-green-600 font-medium' : 'text-gray-500'
                }`}>
                  {formData.descripcion.length}/500 
                  {formData.descripcion.length >= 20 && ' ✓'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Expediente'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/expedientes')}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CrearExpediente;