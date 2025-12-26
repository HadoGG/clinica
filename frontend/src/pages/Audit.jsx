import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatDate, showNotification } from '../utils/helpers';

export default function Audit() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [filters, setFilters] = useState({
        action: '',
        model_name: '',
        user: '',
        search: ''
    });
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                setUserRole(user.role || 'professional');
                // Si no es admin, redirigir al dashboard
                if (user.role !== 'admin') {
                    navigate('/');
                }
            } catch (e) {
                setUserRole('professional');
                navigate('/');
            }
        }
    }, [navigate]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.action) params.append('action', filters.action);
            if (filters.model_name) params.append('model_name', filters.model_name);
            if (filters.user) params.append('user_id', filters.user);
            if (filters.search) params.append('search', filters.search);
            
            params.append('limit', '100');
            
            const response = await api.get('/audit-logs/', { params });
            const data = response.data.results || response.data || [];
            setLogs(data);
        } catch (error) {
            console.error('Error al cargar auditoría:', error);
            showNotification('Error al cargar logs de auditoría', 'error');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/audit-logs/summary/');
            setStats(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            fetchLogs();
            fetchStats();
        }
    }, [userRole]);

    const handleFilter = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleApplyFilters = () => {
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            action: '',
            model_name: '',
            user: '',
            search: ''
        });
        setLogs([]);
        fetchLogs();
    };

    const getActionColor = (action) => {
        const colors = {
            create: 'badge-success',
            update: 'badge-info',
            delete: 'badge-error',
            status_change: 'badge-warning',
            payment: 'badge-primary',
            settlement_generated: 'badge-secondary'
        };
        return colors[action] || 'badge-ghost';
    };

    const getActionLabel = (action) => {
        const labels = {
            create: '➕ Crear',
            update: '✏️ Actualizar',
            delete: '🗑️ Eliminar',
            status_change: '📊 Cambio Estado',
            payment: '💰 Pago',
            settlement_generated: '📄 Liquidación'
        };
        return labels[action] || action;
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2">
                    📋 Auditoría del Sistema
                </h1>
                <p className="text-gray-600">Registro de todos los cambios realizados en OdontAll</p>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-2xl">{stats.total_logs}</h2>
                            <p className="text-gray-600">Total de Registros</p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-2xl">{Object.keys(stats.by_model || {}).length}</h2>
                            <p className="text-gray-600">Modelos Auditados</p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-2xl">{Object.keys(stats.by_action || {}).length}</h2>
                            <p className="text-gray-600">Tipos de Acciones</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="card bg-base-100 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title mb-4">Filtros</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Acción</span>
                            </label>
                            <select 
                                name="action"
                                value={filters.action}
                                onChange={handleFilter}
                                className="select select-bordered"
                            >
                                <option value="">Todas</option>
                                <option value="create">Crear</option>
                                <option value="update">Actualizar</option>
                                <option value="delete">Eliminar</option>
                                <option value="status_change">Cambio de Estado</option>
                                <option value="payment">Pago</option>
                                <option value="settlement_generated">Liquidación</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Modelo</span>
                            </label>
                            <select 
                                name="model_name"
                                value={filters.model_name}
                                onChange={handleFilter}
                                className="select select-bordered"
                            >
                                <option value="">Todos</option>
                                <option value="User">Usuario</option>
                                <option value="Professional">Profesional</option>
                                <option value="Service">Servicio</option>
                                <option value="Attention">Atención</option>
                                <option value="Settlement">Liquidación</option>
                                <option value="Discount">Descuento</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Búsqueda</span>
                            </label>
                            <input 
                                type="text"
                                name="search"
                                placeholder="ID u objeto..."
                                value={filters.search}
                                onChange={handleFilter}
                                className="input input-bordered"
                            />
                        </div>

                        <div className="form-control flex justify-end gap-2 pt-7">
                            <button 
                                className="btn btn-primary"
                                onClick={handleApplyFilters}
                            >
                                🔍 Aplicar
                            </button>
                            <button 
                                className="btn btn-ghost"
                                onClick={handleClearFilters}
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Logs */}
            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : logs.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>📝</p>
                        <h2 style={{color: '#333', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay registros de auditoría
                        </h2>
                        <p style={{color: '#666', marginTop: '0.5rem'}}>
                            Los cambios en el sistema aparecerán aquí
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full text-sm">
                                <thead>
                                    <tr>
                                        <th>Fecha/Hora</th>
                                        <th>Usuario</th>
                                        <th>Acción</th>
                                        <th>Modelo</th>
                                        <th>Objeto</th>
                                        <th>IP Address</th>
                                        <th>Detalles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover">
                                            <td className="text-xs">{formatDate(log.created_at)}</td>
                                            <td className="font-semibold">{log.user_display || 'Sistema'}</td>
                                            <td>
                                                <span className={`badge ${getActionColor(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="font-semibold">{log.model_display || log.model_name}</td>
                                            <td className="text-xs truncate max-w-xs">{log.object_description}</td>
                                            <td className="text-xs font-mono">{log.ip_address || 'N/A'}</td>
                                            <td>
                                                <details className="dropdown">
                                                    <summary className="btn btn-sm btn-ghost">Ver</summary>
                                                    <div className="dropdown-content menu bg-base-100 rounded-box shadow p-2 w-80">
                                                        <div className="p-2 bg-gray-100 rounded text-xs">
                                                            <p><strong>ID:</strong> {log.object_id}</p>
                                                            <p><strong>User Agent:</strong> {log.user_agent || 'N/A'}</p>
                                                            {log.old_values && Object.keys(log.old_values).length > 0 && (
                                                                <div className="mt-2">
                                                                    <strong>Antes:</strong>
                                                                    <pre className="bg-white p-1 rounded overflow-auto max-h-40">
                                                                        {JSON.stringify(log.old_values, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.new_values && Object.keys(log.new_values).length > 0 && (
                                                                <div className="mt-2">
                                                                    <strong>Después:</strong>
                                                                    <pre className="bg-white p-1 rounded overflow-auto max-h-40">
                                                                        {JSON.stringify(log.new_values, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </details>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
