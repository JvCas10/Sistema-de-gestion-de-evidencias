import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return email.includes('@') && email.includes('.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Por favor ingrese un correo válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Solo redirige si el login fue exitoso
      navigate('/dashboard');
    } catch (err) {
      // Mantiene el formulario con los datos y muestra el error
      setError(err.response?.data?.message || 'Credenciales incorrectas. Verifique sus datos.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-blue-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/MP_logo.png" alt="Ministerio Público" className="h-20 w-auto" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sistema DICRI</h1>
          <p className="text-gray-600 mt-2">Gestión de Evidencias</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-sm">Error de autenticación</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(''); // Limpia el error al escribir
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${touched.email && !validateEmail(email)
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              placeholder="usuario@dicri.gob.gt"
              required
            />
            {touched.email && !validateEmail(email) && email && (
              <p className="text-red-500 text-sm mt-1">Ingrese un correo válido</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Limpia el error al escribir
              }}
              onBlur={() => setTouched({ ...touched, password: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${touched.password && password.length < 6
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              placeholder="••••••••"
              required
            />
            {touched.password && password.length < 6 && password && (
              <p className="text-red-500 text-sm mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !validateEmail(email) || password.length < 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-3 font-medium">Usuarios de prueba:</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-700 font-medium">Coordinador:</span>
              <span className="font-mono text-gray-900 text-xs sm:text-sm break-all">jcastellanos@dicri.gob.gt</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-700 font-medium">Técnico:</span>
              <span className="font-mono text-gray-900 text-xs sm:text-sm break-all">vperez@dicri.gob.gt</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Password:</span>
              <span className="font-mono text-gray-900">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;