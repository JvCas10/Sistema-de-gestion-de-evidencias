import { useState, useEffect } from 'react';
import { reporteService } from '../../services/api';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';

const Reportes = () => {
    const [stats, setStats] = useState({
        total: 0,
        en_registro: 0,
        en_revision: 0,
        aprobados: 0,
        rechazados: 0
    });

    const [loading, setLoading] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null); 
    const [expedientes, setExpedientes] = useState([]);
    
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        estado: ''
    });

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            const response = await reporteService.getEstadisticas();
            setEstadisticas(response.data.data);
            // Opcional: Si el backend devuelve stats generales, puedes descomentar esto:
            // setStats(response.data.data); 
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleGenerarReporte = async (e) => {
        if (e) e.preventDefault();

        if (!filtros.fecha_inicio || !filtros.fecha_fin) {
            alert('Seleccione ambas fechas');
            return;
        }

        // CORRECCIÓN 1: Forzamos la hora 00:00 local para evitar que new Date() reste horas por zona horaria
        const fechaInicioLocal = new Date(filtros.fecha_inicio + 'T00:00:00');
        const fechaFinLocal = new Date(filtros.fecha_fin + 'T23:59:59');

        if (fechaFinLocal < fechaInicioLocal) {
            alert('La fecha fin debe ser mayor o igual a la fecha inicio');
            return;
        }

        setLoading(true); 
        try {
            // Formateamos para enviar al backend
            const fechaInicioISO = fechaInicioLocal.toISOString().split('T')[0];
            const fechaFinISO = fechaFinLocal.toISOString().split('T')[0];

            const params = {
                fecha_inicio: fechaInicioISO,
                fecha_fin: fechaFinISO
            };

            if (filtros.estado && filtros.estado !== 'Todos') {
                params.estado = filtros.estado;
            }

            const response = await reporteService.getReporte(params);
            setExpedientes(response.data.data);

            // Recalcular las tarjetas de estadísticas con los datos filtrados
            const expedientesData = response.data.data;
            const newStats = {
                total: expedientesData.length,
                en_registro: expedientesData.filter(e => e.estado === 'EN_REGISTRO').length,
                en_revision: expedientesData.filter(e => e.estado === 'EN_REVISION').length,
                aprobados: expedientesData.filter(e => e.estado === 'APROBADO').length,
                rechazados: expedientesData.filter(e => e.estado === 'RECHAZADO').length
            };
            
            setStats(newStats);

        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert(error.response?.data?.message || 'Error al generar reporte');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            fecha_inicio: '',
            fecha_fin: '',
            estado: ''
        });
        setExpedientes([]);
        setStats({ total: 0, en_registro: 0, en_revision: 0, aprobados: 0, rechazados: 0 });
    };

    const exportarCSV = () => {
        if (expedientes.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const headers = ['Número Expediente', 'Descripción', 'Técnico', 'Estado', 'Indicios', 'Fecha Creación'];
        const rows = expedientes.map(exp => [
            exp.numero_expediente,
            exp.descripcion,
            exp.tecnico_nombre,
            exp.estado,
            exp.total_indicios || 0,
            new Date(exp.fecha_creacion).toLocaleDateString('es-GT')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_dicri_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Reportes y Estadísticas</h1>
                    <p className="text-gray-600 mt-2">Análisis de expedientes del sistema DICRI</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Expedientes</div>
                        <div className="text-3xl md:text-4xl font-bold text-blue-600 mt-2">
                            {stats.total}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">En Registro</div>
                        <div className="text-3xl md:text-4xl font-bold text-yellow-600 mt-2">
                            {stats.en_registro}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">En Revisión</div>
                        <div className="text-3xl md:text-4xl font-bold text-orange-600 mt-2">
                            {stats.en_revision}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Aprobados</div>
                        <div className="text-3xl md:text-4xl font-bold text-green-600 mt-2">
                            {stats.aprobados}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Rechazados</div>
                        <div className="text-3xl md:text-4xl font-bold text-red-600 mt-2">
                            {stats.rechazados}
                        </div>
                    </div>
                </div>

                {/* Formulario de Filtros */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Generar Reporte</h2>
                    <form onSubmit={handleGenerarReporte} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Inicio *
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fecha_inicio}
                                    onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Fin *
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fecha_fin}
                                    onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={filtros.estado}
                                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos</option>
                                    <option value="EN_REGISTRO">En Registro</option>
                                    <option value="EN_REVISION">En Revisión</option>
                                    <option value="APROBADO">Aprobado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {loading ? 'Generando...' : 'Generar Reporte'}
                            </button>
                            <button
                                type="button"
                                onClick={limpiarFiltros}
                                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                Limpiar
                            </button>
                            {expedientes.length > 0 && (
                                <button
                                    type="button"
                                    onClick={exportarCSV}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                                >
                                    Exportar CSV
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Resultados */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow">
                        <Loading message="Generando reporte..." />
                    </div>
                ) : expedientes.length > 0 ? (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Resultados ({expedientes.length})
                                </h2>
                                <span className="text-sm text-gray-600">
                                    {/* CORRECCIÓN 2: Visualización correcta de la fecha con 'T00:00:00' */}
                                    {filtros.fecha_inicio && filtros.fecha_fin && (
                                        <>Del {new Date(filtros.fecha_inicio + 'T00:00:00').toLocaleDateString('es-GT')} al {new Date(filtros.fecha_fin + 'T00:00:00').toLocaleDateString('es-GT')}</>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicios</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expedientes.map((exp) => (
                                        <tr key={exp.expediente_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {exp.numero_expediente}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {exp.descripcion}
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
                                                {exp.total_indicios || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(exp.fecha_creacion).toLocaleDateString('es-GT')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : filtros.fecha_inicio && filtros.fecha_fin ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">No se encontraron expedientes con los filtros seleccionados</p>
                    </div>
                ) : null}
            </div>
        </Layout>
    );
};

export default Reportes;