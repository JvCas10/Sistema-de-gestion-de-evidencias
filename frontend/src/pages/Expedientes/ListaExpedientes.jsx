import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expedienteService } from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const ListaExpedientes = () => {
  const { user } = useAuth();
  const [expedientes, setExpedientes] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpedientes();
  }, [filtros]);

  const loadExpedientes = async () => {
    setLoading(true);
    try {
      const response = await expedienteService.getAll(filtros);
      setExpedientes(response.data.data);
    } catch (error) {
      console.error('Error al cargar expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Expedientes</h1>
            <p className="text-gray-600 mt-1">Gestión de casos DICRI</p>
          </div>
          {(user?.rol === 'Tecnico' || user?.rol === 'Administrador') && (
            <Link
              to="/expedientes/crear"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition inline-flex items-center"
            >
              <span className="mr-2">+</span>
              Nuevo Expediente
            </Link>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="EN_REGISTRO">En Registro</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="APROBADO">Aprobado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>
            {filtros.estado && (
              <button
                onClick={() => setFiltros({ estado: '' })}
                className="self-end px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <Loading message="Cargando expedientes..." />
          ) : expedientes.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No se encontraron expedientes"
              description={
                filtros.estado
                  ? `No hay expedientes con estado "${filtros.estado.replace('_', ' ')}"`
                  : "Aún no hay expedientes registrados en el sistema"
              }
              action={
                (user?.rol === 'Tecnico' || user?.rol === 'Administrador') && !filtros.estado && (
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Técnico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expedientes.map((exp) => (
                    <tr key={exp.expediente_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exp.numero_expediente}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={exp.descripcion}>
                          {exp.descripcion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exp.tecnico_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exp.estado === 'APROBADO' ? 'bg-green-100 text-green-800' :
                          exp.estado === 'EN_REVISION' ? 'bg-orange-100 text-orange-800' :
                          exp.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {exp.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          {exp.total_indicios || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/expedientes/${exp.expediente_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                        >
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && expedientes.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Mostrando {expedientes.length} expediente{expedientes.length !== 1 ? 's' : ''}
            {filtros.estado && ` con estado "${filtros.estado.replace('_', ' ')}"`}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListaExpedientes;