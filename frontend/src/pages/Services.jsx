import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { serviceService } from '../services/api';
import { formatCurrency, showNotification } from '../utils/helpers';

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await serviceService.getAll({ limit: 100, _t: Date.now() });
            setServices(response.data.results || response.data || []);
        } catch (error) {
            // No mostrar error si está vacío, solo si hay un problema real
            console.error('Error al cargar servicios:', error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await serviceService.update(editingId, data);
                showNotification('Servicio actualizado exitosamente');
            } else {
                await serviceService.create(data);
                showNotification('Servicio creado exitosamente');
            }
            setShowModal(false);
            reset();
            setEditingId(null);
            // Pequeño delay para asegurar que la BD esté actualizada
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchServices();
        } catch (error) {
            showNotification(error.response?.data?.detail || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        reset(service);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este servicio?')) {
            try {
                await serviceService.delete(id);
                showNotification('Servicio eliminado exitosamente');
                fetchServices();
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Servicios</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        reset();
                        setShowModal(true);
                    }}
                >
                    + Agregar Servicio
                </button>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : services.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>🔧</p>
                        <h2 style={{color: '#333', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay servicios registrados
                        </h2>
                        <p style={{color: '#666', marginTop: '0.5rem'}}>
                            Agrega servicios dentales que ofreces en OdontAll.
                        </p>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={() => {
                                setEditingId(null);
                                reset();
                                setShowModal(true);
                            }}
                        >
                            + Agregar Servicio
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <div key={service.id} className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title text-lg">{service.name}</h2>
                                <p className="text-sm text-gray-600">{service.code}</p>
                                <p className="text-sm">{service.description}</p>
                                <div className="my-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Precio:</span>
                                        <span className="font-bold text-success">{formatCurrency(service.base_price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Comisión:</span>
                                        <span className="font-bold">{service.commission_percentage}%</span>
                                    </div>
                                </div>
                                <div className="card-actions justify-between">
                                    <button 
                                        className="btn btn-sm btn-info"
                                        onClick={() => handleEdit(service)}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-error"
                                        onClick={() => handleDelete(service.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl">
                        <h3 className="font-bold text-lg">
                            {editingId ? 'Editar Servicio' : 'Crear Servicio'}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`form-control ${errors.code ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Código *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('code', { 
                                            required: 'El código es requerido',
                                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: LIMP001"
                                    />
                                    {errors.code && <span className="error-message">{errors.code.message}</span>}
                                </div>
                                <div className={`form-control ${errors.name ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Nombre *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('name', { 
                                            required: 'El nombre es requerido',
                                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: Limpieza"
                                    />
                                    {errors.name && <span className="error-message">{errors.name.message}</span>}
                                </div>
                                <div className={`form-control ${errors.base_price ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Precio Base *</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register('base_price', { 
                                            required: 'El precio es requerido',
                                            min: { value: 0, message: 'El precio debe ser mayor a 0' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="100000"
                                    />
                                    {errors.base_price && <span className="error-message">{errors.base_price.message}</span>}
                                </div>
                                <div className={`form-control ${errors.commission_percentage ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Comisión (%) *</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register('commission_percentage', { 
                                            required: 'La comisión es requerida',
                                            min: { value: 0, message: 'La comisión debe ser mayor o igual a 0' },
                                            max: { value: 100, message: 'La comisión no puede ser mayor a 100%' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="30"
                                    />
                                    {errors.commission_percentage && <span className="error-message">{errors.commission_percentage.message}</span>}
                                </div>
                            </div>

                            <div className={`form-control ${errors.description ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Descripción *</span>
                                </label>
                                <textarea 
                                    {...register('description', { 
                                        required: 'La descripción es requerida',
                                        minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                                    })}
                                    className="textarea textarea-bordered" 
                                    placeholder="Descripción del servicio"
                                    rows="3"
                                ></textarea>
                                {errors.description && <span className="error-message">{errors.description.message}</span>}
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
