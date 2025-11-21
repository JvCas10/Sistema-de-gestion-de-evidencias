import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reporteService, expedienteService } from '../../services/api';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const RevisionExpedientes = () => {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState(null);
  const [justificacion, setJustificacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    setLoading(true);
    try {
      const response = await reporteService.getPendientesRevision();
      setExpedientes(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id, numeroExpediente) => {
    if (window.confirm(`¿Está seguro de aprobar el expediente ${numeroExpediente}?`)) {
      setProcesando(true);
      try {
        await expedienteService.aprobar(id);
        loadExpedientes();
        alert('Expediente aprobado exitosamente');
      } catch (error) {
        alert(error.response?.data?.message || 'Error al aprobar expediente');
      } finally {
        setProcesando(false);
      }
    }
  };

  const handleRechazar = async (id) => {
    if (!justificacion || justificacion.trim().length < 10) {
      alert('La justificación debe tener al menos 10 caracteres');
      return;
    }
    
    setProcesando(true);
    try {
      await expedienteService.rechazar(id, justificacion);
      setSelectedExp(null);
      setJustificacion('');
      loadExpedientes();
      alert('Expediente rechazado exitosamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al rechazar expediente');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Expedientes Pendientes de Revisión
          </h1>
          <p className="text-gray-600 mt-2">Aprobar o rechazar expedientes enviados por técnicos</p>
        </div>

        {/* Estadísticas rápidas */}
        {!loading && expedientes.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-orange-800 font-medium">
                  {expedientes.length} expediente{expedientes.length !== 1 ? 's' : ''} pendiente{expedientes.length !== 1 ? 's' : ''}
                </span>
                <span className="text-orange-600 text-sm ml-2">
                  (Requiere{expedientes.length !== 1 ? 'n' : ''} atención)
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <Loading message="Cargando expedientes pendientes..." />
          ) : expedientes.length === 0 ? (
            <EmptyState
              title="No hay expedientes pendientes"
              description="Todos los expedientes han sido revisados. Los nuevos expedientes aparecerán aquí."
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {expedientes.map((exp) => (
                <div key={exp.expediente_id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-800">
                          {exp.numero_expediente}
                        </h3>
                        <span className="ml-4 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          EN REVISIÓN
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{exp.descripcion}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Técnico:</span>
                          <span className="ml-2 font-medium text-gray-800">{exp.tecnico_nombre}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Indicios:</span>
                          <span className="ml-2 font-medium text-gray-800">{exp.total_indicios}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Días en revisión:</span>
                          <span className="ml-2 font-medium text-gray-800">{exp.dias_en_revision}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:w-48">
                      <button
                        onClick={() => navigate(`/expedientes/${exp.expediente_id}`)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => handleAprobar(exp.expediente_id, exp.numero_expediente)}
                        disabled={procesando}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => setSelectedExp(exp.expediente_id)}
                        disabled={procesando}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>

                  {/* Form de rechazo inline */}
                  {selectedExp === exp.expediente_id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Justificación del Rechazo *
                      </label>
                      <textarea
                        value={justificacion}
                        onChange={(e) => setJustificacion(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                        placeholder="Explique detalladamente el motivo del rechazo (mínimo 10 caracteres)..."
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-sm ${justificacion.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                          {justificacion.length}/500 caracteres
                          {justificacion.length >= 10 && ' ✓'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRechazar(exp.expediente_id)}
                            disabled={procesando || justificacion.trim().length < 10}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {procesando ? 'Procesando...' : 'Confirmar Rechazo'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExp(null);
                              setJustificacion('');
                            }}
                            disabled={procesando}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RevisionExpedientes;