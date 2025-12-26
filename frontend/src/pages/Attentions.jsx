import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { attentionService, professionalService, serviceService } from '../services/api';
import { formatDate, formatCurrency, showNotification } from '../utils/helpers';

export default function Attentions() {
    const [attentions, setAttentions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

    const selectedProfessional = watch('professional');
    const selectedService = watch('service');

    const fetchAttentions = async () => {
        try {
            setLoading(true);
            const response = await attentionService.getAll({ limit: 100, _t: Date.now() });
            setAttentions(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error al cargar atenciones:', error);
            setAttentions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfessionals = async () => {
        try {
            const response = await professionalService.getActive();
            setProfessionals(response.data);
        } catch (error) {
            console.error('Error al cargar profesionales:', error);
            setProfessionals([]);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await serviceService.getActive();
            setServices(response.data);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            setServices([]);
        }
    };

    useEffect(() => {
        fetchAttentions();
        fetchProfessionals();
        fetchServices();
    }, []);

    const onSubmit = async (data) => {
        try {
            // Asegurar que la fecha está en formato ISO
            const submitData = {
                ...data,
                amount_charged: parseFloat(data.amount_charged),
                commission_percentage: data.commission_percentage ? parseFloat(data.commission_percentage) : null,
                date: new Date(data.date).toISOString(),
            };

            if (editingId) {
                await attentionService.update(editingId, submitData);
                showNotification('Atención actualizada exitosamente');
            } else {
                await attentionService.create(submitData);
                showNotification('Atención registrada exitosamente');
            }
            setShowModal(false);
            reset();
            setEditingId(null);
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchAttentions();
        } catch (error) {
            showNotification(error.response?.data?.detail || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (attention) => {
        setEditingId(attention.id);
        const formData = {
            ...attention,
            date: new Date(attention.date).toISOString().slice(0, 16), // Formato datetime-local
        };
        reset(formData);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta atención?')) {
            try {
                await attentionService.delete(id);
                showNotification('Atención eliminada exitosamente');
                fetchAttentions();
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Atenciones</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        reset();
                        setShowModal(true);
                    }}
                >
                    + Registrar Atención
                </button>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : attentions.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>📋</p>
                        <h2 style={{color: '#333', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay atenciones registradas
                        </h2>
                        <p style={{color: '#666', marginTop: '0.5rem'}}>
                            Comienza registrando atenciones realizadas a pacientes.
                        </p>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={() => {
                                setEditingId(null);
                                reset();
                                setShowModal(true);
                            }}
                        >
                            + Registrar Atención
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
                                        <th>Servicio</th>
                                        <th>Paciente</th>
                                        <th>Fecha</th>
                                        <th>Monto</th>
                                        <th>Comisión %</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attentions.map((attention) => (
                                        <tr key={attention.id}>
                                            <td>{attention.professional_name}</td>
                                            <td>{attention.service_name}</td>
                                            <td>{attention.patient_name}</td>
                                            <td>{formatDate(attention.date)}</td>
                                            <td className="font-bold text-success">
                                                {formatCurrency(attention.amount_charged)}
                                            </td>
                                            <td>{attention.commission_percentage || '-'}%</td>
                                            <td>
                                                <span className={`badge ${
                                                    attention.status === 'completed' ? 'badge-success' :
                                                    attention.status === 'pending' ? 'badge-warning' :
                                                    'badge-error'
                                                }`}>
                                                    {attention.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-info mr-2"
                                                    onClick={() => handleEdit(attention)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleDelete(attention.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl">
                        <h3 className="font-bold text-lg">
                            {editingId ? 'Editar Atención' : 'Registrar Atención'}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`form-control ${errors.professional ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Profesional *</span>
                                    </label>
                                    <select 
                                        {...register('professional', { required: 'El profesional es requerido' })}
                                        className="select select-bordered"
                                    >
                                        <option value="">Seleccionar profesional</option>
                                        {professionals.map(prof => (
                                            <option key={prof.id} value={prof.id}>
                                                {prof.user_full_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.professional && <span className="error-message">{errors.professional.message}</span>}
                                </div>
                                <div className={`form-control ${errors.service ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Servicio *</span>
                                    </label>
                                    <select 
                                        {...register('service', { required: 'El servicio es requerido' })}
                                        className="select select-bordered"
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {services.map(svc => (
                                            <option key={svc.id} value={svc.id}>
                                                {svc.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.service && <span className="error-message">{errors.service.message}</span>}
                                </div>
                                <div className={`form-control ${errors.patient_name ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Nombre del Paciente *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('patient_name', { 
                                            required: 'El nombre del paciente es requerido',
                                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: María García"
                                    />
                                    {errors.patient_name && <span className="error-message">{errors.patient_name.message}</span>}
                                </div>
                                <div className={`form-control ${errors.patient_id ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Cédula del Paciente *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('patient_id', { 
                                            required: 'La cédula es requerida',
                                            minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: 123456789"
                                    />
                                    {errors.patient_id && <span className="error-message">{errors.patient_id.message}</span>}
                                </div>
                                <div className={`form-control ${errors.date ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Fecha y Hora *</span>
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        {...register('date', { required: 'La fecha es requerida' })}
                                        className="input input-bordered"
                                    />
                                    {errors.date && <span className="error-message">{errors.date.message}</span>}
                                </div>
                                <div className={`form-control ${errors.amount_charged ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Monto Cobrado *</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register('amount_charged', { 
                                            required: 'El monto es requerido',
                                            min: { value: 0, message: 'El monto debe ser mayor a 0' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="100000"
                                    />
                                    {errors.amount_charged && <span className="error-message">{errors.amount_charged.message}</span>}
                                </div>
                                <div className={`form-control ${errors.commission_percentage ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Porcentaje Comisión (%)</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register('commission_percentage', { 
                                            min: { value: 0, message: 'No puede ser negativo' },
                                            max: { value: 100, message: 'No puede ser mayor a 100%' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Dejar vacío para usar comisión por defecto"
                                    />
                                    {errors.commission_percentage && <span className="error-message">{errors.commission_percentage.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Estado</span>
                                    </label>
                                    <select 
                                        {...register('status')}
                                        className="select select-bordered"
                                    >
                                        <option value="completed">Completada</option>
                                        <option value="pending">Pendiente</option>
                                        <option value="cancelled">Cancelada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Notas</span>
                                </label>
                                <textarea 
                                    {...register('notes')}
                                    className="textarea textarea-bordered" 
                                    placeholder="Notas adicionales sobre la atención"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    Guardar
                                </button>
                                <button 
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowModal(false);
                                        reset();
                                        setEditingId(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => {
                        setShowModal(false);
                        reset();
                        setEditingId(null);
                    }}></div>
                </div>
            )}
        </div>
    );
}
