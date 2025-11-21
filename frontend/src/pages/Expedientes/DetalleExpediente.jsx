import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { expedienteService, indicioService, authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const DetalleExpediente = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [expediente, setExpediente] = useState(null);
    const [indicios, setIndicios] = useState([]);
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIndicioForm, setShowIndicioForm] = useState(false);
    const [showEnviarModal, setShowEnviarModal] = useState(false);
    const [selectedCoordinador, setSelectedCoordinador] = useState('');
    const [indicioAEliminar, setIndicioAEliminar] = useState(null);
    const [showRechazarModal, setShowRechazarModal] = useState(false);
    const [justificacionRechazo, setJustificacionRechazo] = useState('');
    const [procesandoRevision, setProcesandoRevision] = useState(false);
    const [indicioForm, setIndicioForm] = useState({
        nombre_objeto: '',
        descripcion: '',
        color: '',
        tamano_cm: '',
        peso_gramos: '',
        ubicacion: ''
    });

    useEffect(() => {
        loadData();
        loadCoordinadores();
    }, [id]);

    const loadData = async () => {
        try {
            const [expRes, indRes] = await Promise.all([
                expedienteService.getById(id),
                indicioService.getByExpediente(id)
            ]);
            setExpediente(expRes.data.data);
            setIndicios(indRes.data.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCoordinadores = async () => {
        try {
            const response = await authService.getUsuarios();
            const coords = response.data.data.filter(u => u.rol_nombre === 'Coordinador' && u.activo);
            setCoordinadores(coords);
        } catch (error) {
            console.error('Error al cargar coordinadores:', error);
        }
    };

    const handleAgregarIndicio = async (e) => {
        e.preventDefault();
        try {
            await indicioService.create({
                ...indicioForm,
                expediente_id: parseInt(id),
                tamano_cm: indicioForm.tamano_cm ? parseFloat(indicioForm.tamano_cm) : null,
                peso_gramos: indicioForm.peso_gramos ? parseFloat(indicioForm.peso_gramos) : null
            });
            setShowIndicioForm(false);
            setIndicioForm({
                nombre_objeto: '',
                descripcion: '',
                color: '',
                tamano_cm: '',
                peso_gramos: '',
                ubicacion: ''
            });
            loadData();
            alert('Indicio agregado exitosamente');
        } catch (error) {
            console.error('Error completo:', error.response);
            alert(error.response?.data?.message || 'Error al agregar indicio');
        }
    };

    const handleEliminarIndicio = async (indicioId) => {
        try {
            await indicioService.delete(indicioId);
            setIndicioAEliminar(null);
            loadData();
            alert('Indicio eliminado exitosamente');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar indicio');
        }
    };

    const handleEnviarRevision = () => {
        if (indicios.length === 0) {
            alert('Debe agregar al menos un indicio antes de enviar a revisión');
            return;
        }
        setShowEnviarModal(true);
    };

    const confirmarEnvio = async () => {
        if (!selectedCoordinador) {
            alert('Seleccione un coordinador');
            return;
        }
        try {
            await expedienteService.enviarRevision(id, parseInt(selectedCoordinador));
            setShowEnviarModal(false);
            setSelectedCoordinador('');
            loadData();
            alert('Expediente enviado a revisión exitosamente');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar a revisión');
        }
    };

    const handleAprobarExpediente = async () => {
        if (window.confirm(`¿Está seguro de aprobar el expediente ${expediente.numero_expediente}?`)) {
            setProcesandoRevision(true);
            try {
                await expedienteService.aprobar(id);
                alert('Expediente aprobado exitosamente');
                navigate('/revision');
            } catch (error) {
                alert(error.response?.data?.message || 'Error al aprobar expediente');
            } finally {
                setProcesandoRevision(false);
            }
        }
    };

    const handleRechazarExpediente = async () => {
        if (!justificacionRechazo || justificacionRechazo.trim().length < 10) {
            alert('La justificación debe tener al menos 10 caracteres');
            return;
        }

        setProcesandoRevision(true);
        try {
            await expedienteService.rechazar(id, justificacionRechazo);
            alert('Expediente rechazado exitosamente');
            navigate('/revision');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al rechazar expediente');
        } finally {
            setProcesandoRevision(false);
        }
    };

    if (loading) {
        return <Layout><div className="text-center py-12">Cargando...</div></Layout>;
    }

    if (!expediente) {
        return <Layout><div className="text-center py-12">Expediente no encontrado</div></Layout>;
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header con breadcrumb */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Link to="/expedientes" className="hover:text-blue-600">Expedientes</Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-800">{expediente.numero_expediente}</span>
                </div>

                {/* Título y Estado */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {expediente.numero_expediente}
                        </h1>
                        <p className="text-gray-600 mt-2">{expediente.descripcion}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${expediente.estado === 'APROBADO' ? 'bg-green-100 text-green-800' :
                        expediente.estado === 'EN_REVISION' ? 'bg-orange-100 text-orange-800' :
                            expediente.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>
                        {expediente.estado.replace('_', ' ')}
                    </span>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-medium text-gray-700 mb-4">
                            Información General
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Técnico:</span>
                                <span className="font-medium">{expediente.tecnico_nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fecha:</span>
                                <span className="font-medium">{new Date(expediente.fecha_creacion).toLocaleDateString('es-GT')}</span>
                            </div>
                            {expediente.coordinador_nombre && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Coordinador:</span>
                                    <span className="font-medium">{expediente.coordinador_nombre}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Indicios:</span>
                                <span className="font-medium">{indicios.length}</span>
                            </div>
                        </div>
                    </div>

                    {expediente.justificacion_rechazo && (
                        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                            <h3 className="font-medium text-red-800 mb-3">
                                Justificación de Rechazo
                            </h3>
                            <p className="text-sm text-red-700">{expediente.justificacion_rechazo}</p>
                        </div>
                    )}
                </div>

                {/* Sección de Indicios */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Indicios ({indicios.length})
                            </h2>
                            {expediente.estado === 'EN_REGISTRO' && (
                                <button
                                    onClick={() => setShowIndicioForm(!showIndicioForm)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    {showIndicioForm ? 'Cancelar' : 'Agregar Indicio'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Formulario de Agregar Indicio */}
                    {showIndicioForm && (
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <form onSubmit={handleAgregarIndicio} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del objeto *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Arma blanca"
                                            value={indicioForm.nombre_objeto}
                                            onChange={(e) => setIndicioForm({ ...indicioForm, nombre_objeto: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Color
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Plateado"
                                            value={indicioForm.color}
                                            onChange={(e) => setIndicioForm({ ...indicioForm, color: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tamaño (cm)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ej: 25.5"
                                            value={indicioForm.tamano_cm}
                                            onChange={(e) => setIndicioForm({ ...indicioForm, tamano_cm: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Peso (gramos)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ej: 150.5"
                                            value={indicioForm.peso_gramos}
                                            onChange={(e) => setIndicioForm({ ...indicioForm, peso_gramos: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ubicación
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Escena del crimen - Sector A"
                                            value={indicioForm.ubicacion}
                                            onChange={(e) => setIndicioForm({ ...indicioForm, ubicacion: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción *
                                    </label>
                                    <textarea
                                        placeholder="Describe el indicio detalladamente..."
                                        value={indicioForm.descripcion}
                                        onChange={(e) => setIndicioForm({ ...indicioForm, descripcion: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                                    >
                                        Guardar Indicio
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowIndicioForm(false);
                                            setIndicioForm({
                                                nombre_objeto: '',
                                                descripcion: '',
                                                color: '',
                                                tamano_cm: '',
                                                peso_gramos: '',
                                                ubicacion: ''
                                            });
                                        }}
                                        className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Lista de Indicios */}
                    <div className="p-6">
                        {indicios.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-medium text-gray-800 mb-2">No hay indicios registrados</h3>
                                <p className="text-gray-600 mb-6">Agrega el primer indicio para este expediente</p>
                                {expediente.estado === 'EN_REGISTRO' && !showIndicioForm && (
                                    <button
                                        onClick={() => setShowIndicioForm(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                                    >
                                        Agregar Primer Indicio
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {indicios.map((indicio) => (
                                    <div key={indicio.indicio_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800 text-lg">{indicio.nombre_objeto}</h4>
                                                <p className="text-sm text-gray-600 mt-2">{indicio.descripcion}</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                                    {indicio.color && (
                                                        <div>
                                                            <span className="text-gray-500">Color: </span>
                                                            <span className="font-medium">{indicio.color}</span>
                                                        </div>
                                                    )}
                                                    {indicio.tamano_cm && (
                                                        <div>
                                                            <span className="text-gray-500">Tamaño: </span>
                                                            <span className="font-medium">{indicio.tamano_cm} cm</span>
                                                        </div>
                                                    )}
                                                    {indicio.peso_gramos && (
                                                        <div>
                                                            <span className="text-gray-500">Peso: </span>
                                                            <span className="font-medium">{indicio.peso_gramos} g</span>
                                                        </div>
                                                    )}
                                                    {indicio.ubicacion && (
                                                        <div>
                                                            <span className="text-gray-500">Ubicación: </span>
                                                            <span className="font-medium">{indicio.ubicacion}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {expediente.estado === 'EN_REGISTRO' && (
                                                <button
                                                    onClick={() => setIndicioAEliminar(indicio.indicio_id)}
                                                    className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                                                    title="Eliminar indicio"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de acción según estado y rol */}
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        onClick={() => navigate(user?.rol === 'Coordinador' && expediente.estado === 'EN_REVISION' ? '/revision' : '/expedientes')}
                        className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                        Volver
                    </button>

                    {/* Botones para Técnico */}
                    {expediente.estado === 'EN_REGISTRO' && (user?.rol === 'Tecnico' || user?.rol === 'Administrador') && (
                        <button
                            onClick={handleEnviarRevision}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            Enviar a Revisión
                        </button>
                    )}

                    {/* Botones para Coordinador */}
                    {expediente.estado === 'EN_REVISION' && (user?.rol === 'Coordinador' || user?.rol === 'Administrador') && (
                        <>
                            <button
                                onClick={() => setShowRechazarModal(true)}
                                disabled={procesandoRevision}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={handleAprobarExpediente}
                                disabled={procesandoRevision}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                Aprobar
                            </button>
                        </>
                    )}
                </div>

                {/* Modal de Enviar a Revisión */}
                {showEnviarModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold mb-4">Enviar a Revisión</h3>
                            <p className="text-gray-600 mb-4">
                                Seleccione el coordinador que revisará este expediente:
                            </p>
                            <select
                                value={selectedCoordinador}
                                onChange={(e) => setSelectedCoordinador(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Seleccione un coordinador...</option>
                                {coordinadores.map(coord => (
                                    <option key={coord.usuario_id} value={coord.usuario_id}>
                                        {coord.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={confirmarEnvio}
                                    disabled={!selectedCoordinador}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Envío
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEnviarModal(false);
                                        setSelectedCoordinador('');
                                    }}
                                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmar Eliminación */}
                {indicioAEliminar && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold mb-4 text-red-600">
                                Eliminar Indicio
                            </h3>
                            <p className="text-gray-600 mb-6">
                                ¿Está seguro que desea eliminar este indicio? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEliminarIndicio(indicioAEliminar)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition"
                                >
                                    Sí, eliminar
                                </button>
                                <button
                                    onClick={() => setIndicioAEliminar(null)}
                                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal de Rechazar Expediente */}
            {showRechazarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-red-600">
                            Rechazar Expediente
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Explique el motivo del rechazo del expediente {expediente.numero_expediente}:
                        </p>
                        <textarea
                            value={justificacionRechazo}
                            onChange={(e) => setJustificacionRechazo(e.target.value)}
                            className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows="4"
                            placeholder="Justificación del rechazo (mínimo 10 caracteres)..."
                        />
                        <div className="flex justify-between items-center mt-3">
                            <span className={`text-sm ${justificacionRechazo.length >= 10 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                {justificacionRechazo.length}/500 caracteres
                                {justificacionRechazo.length >= 10 && ' ✓'}
                            </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleRechazarExpediente}
                                disabled={procesandoRevision || justificacionRechazo.trim().length < 10}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {procesandoRevision ? 'Procesando...' : 'Confirmar Rechazo'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRechazarModal(false);
                                    setJustificacionRechazo('');
                                }}
                                disabled={procesandoRevision}
                                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DetalleExpediente;