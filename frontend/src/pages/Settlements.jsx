import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { settlementService, professionalService } from '../services/api';
import { formatCurrency, formatDate, showNotification } from '../utils/helpers';

export default function Settlements() {
    const navigate = useNavigate();
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

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

    const fetchSettlements = async () => {
        try {
            setLoading(true);
            // Agregar timestamp para evitar cache
            const response = await settlementService.getAll({ limit: 100, _t: Date.now() });
            const data = response.data.results || response.data || [];
            
            // Ordenar por fecha descendente
            const sorted = Array.isArray(data) ? [...data].sort((a, b) => {
                const dateA = new Date(b.period_end);
                const dateB = new Date(a.period_end);
                return dateA - dateB;
            }) : [];
            
            setSettlements(sorted);
        } catch (error) {
            console.error('Error al cargar liquidaciones:', error);
            setSettlements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            fetchSettlements();
        }
    }, [userRole]);

    const handleGenerateSettlements = async (data) => {
        try {
            await settlementService.generateForPeriod(data);
            showNotification('Liquidaciones generadas exitosamente');
            setShowGenerateModal(false);
            reset();
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchSettlements();
        } catch (error) {
            showNotification('Error al generar liquidaciones', 'error');
        }
    };

    const handleCalculate = async (id) => {
        try {
            await settlementService.calculate(id);
            showNotification('Liquidación calculada exitosamente');
            fetchSettlements();
        } catch (error) {
            showNotification('Error al calcular liquidación', 'error');
        }
    };

    const handleApprove = async (id) => {
        try {
            await settlementService.approve(id);
            showNotification('Liquidación aprobada exitosamente');
            fetchSettlements();
        } catch (error) {
            showNotification('Error al aprobar liquidación', 'error');
        }
    };

    const handleMarkAsPaid = async (id) => {
        const referenceNumber = prompt('Ingrese el número de referencia de pago:');
        if (referenceNumber) {
            try {
                await settlementService.markAsPaid(id, { payment_reference: referenceNumber });
                showNotification('Liquidación marcada como pagada');
                fetchSettlements();
            } catch (error) {
                showNotification('Error al registrar pago', 'error');
            }
        }
    };

    const handleExportPDF = async (id) => {
        try {
            const response = await settlementService.exportPDF(id);
            // Crear blob y descargar
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `liquidacion-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showNotification('PDF descargado exitosamente');
        } catch (error) {
            showNotification('Error al descargar PDF', 'error');
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await settlementService.exportExcel();
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `liquidaciones-odontall.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showNotification('Excel descargado exitosamente');
        } catch (error) {
            showNotification('Error al descargar Excel', 'error');
        }
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            draft: 'badge-ghost',
            calculated: 'badge-warning',
            approved: 'badge-info',
            paid: 'badge-success',
            cancelled: 'badge-error'
        };
        return colors[status] || 'badge-ghost';
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">
                    Liquidaciones
                </h1>
                <div className="flex gap-2">
                    <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => fetchSettlements()}
                        title="Actualizar lista"
                        disabled={loading}
                    >
                        🔄 Actualizar
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => handleExportExcel()}
                        title="Descargar todas las liquidaciones en Excel"
                    >
                        📊 Excel
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowGenerateModal(true)}
                    >
                        + Generar Liquidaciones
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : settlements.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>📄</p>
                        <h2 style={{color: '#333', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay liquidaciones registradas
                        </h2>
                        <p style={{color: '#666', marginTop: '0.5rem'}}>
                            Genera liquidaciones para los profesionales de OdontAll.
                        </p>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={() => setShowGenerateModal(true)}
                        >
                            + Generar Liquidaciones
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Profesional</th>
                                        <th>Período</th>
                                        <th>Comisión Total</th>
                                        <th>Descuentos</th>
                                        <th>Monto Neto</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {settlements.map((settlement) => (
                                        <tr key={settlement.id} className="hover">
                                            <td className="font-semibold">{settlement.professional_name}</td>
                                            <td>
                                                {formatDate(settlement.period_start)} - {formatDate(settlement.period_end)}
                                            </td>
                                            <td>{formatCurrency(settlement.total_commission)}</td>
                                            <td className="text-error">{formatCurrency(settlement.total_discounts || 0)}</td>
                                            <td className="font-bold text-success">{formatCurrency(settlement.net_amount)}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeColor(settlement.status)}`}>
                                                    {settlement.status}
                                                </span>
                                            </td>
                                            <td className="space-x-2 text-sm">
                                                {settlement.status === 'draft' && (
                                                    <button 
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleCalculate(settlement.id)}
                                                    >
                                                        📊 Calcular
                                                    </button>
                                                )}
                                                {settlement.status === 'calculated' && (
                                                    <>
                                                        <button 
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => handleCalculate(settlement.id)}
                                                            title="Recalcular con nuevas atenciones"
                                                        >
                                                            🔄 Recalcular
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-info"
                                                            onClick={() => handleApprove(settlement.id)}
                                                        >
                                                            ✓ Aprobar
                                                        </button>
                                                    </>
                                                )}
                                                {settlement.status === 'approved' && (
                                                    <button 
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleMarkAsPaid(settlement.id)}
                                                    >
                                                        💰 Pagar
                                                    </button>
                                                )}
                                                {settlement.status === 'approved' || settlement.status === 'paid' ? (
                                                    <button 
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleExportPDF(settlement.id)}
                                                        title="Descargar como PDF"
                                                    >
                                                        📄 PDF
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-md">
                        <h3 className="font-bold text-lg">Generar Liquidaciones para Período</h3>
                        <form onSubmit={handleSubmit(handleGenerateSettlements)} className="space-y-4 mt-4">
                            <div className={`form-control ${errors.period_start ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Fecha Inicio *</span>
                                </label>
                                <input 
                                    type="date" 
                                    {...register('period_start', { required: 'La fecha de inicio es requerida' })}
                                    className="input input-bordered" 
                                />
                                {errors.period_start && <span className="error-message">{errors.period_start.message}</span>}
                            </div>
                            <div className={`form-control ${errors.period_end ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Fecha Fin *</span>
                                </label>
                                <input 
                                    type="date" 
                                    {...register('period_end', { required: 'La fecha de fin es requerida' })}
                                    className="input input-bordered" 
                                />
                                {errors.period_end && <span className="error-message">{errors.period_end.message}</span>}
                            </div>

                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    Generar
                                </button>
                                <button 
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowGenerateModal(false);
                                        reset();
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => {
                        setShowGenerateModal(false);
                        reset();
                    }}></div>
                </div>
            )}
        </div>
    );
}
