import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reporteService, expedienteService } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, expedientesRes] = await Promise.all([
        reporteService.getEstadisticas(),
        expedienteService.getAll({ limit: 5 })
      ]);

      setStats(statsRes.data.data);
      setExpedientes(expedientesRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading message="Cargando estadísticas..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-800">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="text-gray-600 mt-1">Rol: {user?.rol}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Expedientes</div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mt-2">
              {stats?.total_expedientes || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">En Registro</div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-600 mt-2">
              {stats?.en_registro || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">En Revisión</div>
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mt-2">
              {stats?.en_revision || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Aprobados</div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mt-2">
              {stats?.aprobados || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Rechazados</div>
            <div className="text-3xl md:text-4xl font-bold text-red-600 mt-2">
              {stats?.rechazados || 0}
            </div>
          </div>
        </div>

        {/* Expedientes Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">Expedientes Recientes</h2>
              <Link
                to="/expedientes"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Ver todos →
              </Link>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {expedientes.length === 0 ? (
              <EmptyState
                title="No hay expedientes registrados"
                description="Los expedientes recientes aparecerán aquí"
                action={
                  (user?.rol === 'Tecnico' || user?.rol === 'Administrador') && (
                    <Link
                      to="/expedientes/crear"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                      Crear Primer Expediente
                    </Link>
                  )
                }
              />
            ) : (
              <div className="space-y-3 md:space-y-4">
                {expedientes.map((exp) => (
                  <Link
                    key={exp.expediente_id}
                    to={`/expedientes/${exp.expediente_id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {exp.numero_expediente}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {exp.descripcion}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Técnico: {exp.tecnico_nombre}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${exp.estado === 'APROBADO' ? 'bg-green-100 text-green-800' :
                          exp.estado === 'EN_REVISION' ? 'bg-orange-100 text-orange-800' :
                            exp.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                        }`}>
                        {exp.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;