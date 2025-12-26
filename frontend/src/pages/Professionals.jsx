import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { professionalService } from '../services/api';
import { formatDate, showNotification } from '../utils/helpers';

export default function Professionals() {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);

    const fetchProfessionals = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await professionalService.getAll({ page: pageNum, _t: Date.now() });
            setProfessionals(response.data.results || response.data || []);
            setTotalRecords(response.data.count || response.data.length || 0);
        } catch (error) {
            // No mostrar error si está vacío, solo si hay un problema real
            console.error('Error al cargar profesionales:', error);
            setProfessionals([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfessionals(page);
    }, [page]);

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await professionalService.update(editingId, data);
                showNotification('Profesional actualizado exitosamente');
            } else {
                await professionalService.create(data);
                showNotification('Profesional creado exitosamente');
            }
            setShowModal(false);
            reset();
            setEditingId(null);
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchProfessionals(page);
        } catch (error) {
            showNotification(error.response?.data?.detail || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (professional) => {
        setEditingId(professional.id);
        reset(professional);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este profesional?')) {
            try {
                await professionalService.delete(id);
                showNotification('Profesional eliminado exitosamente');
                fetchProfessionals(page);
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Profesionales</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        reset();
                        setShowModal(true);
                    }}
                >
                    + Agregar Profesional
                </button>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : professionals.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>👨‍⚕️</p>
                        <h2 style={{color: '#f1f5f9', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay profesionales registrados
                        </h2>
                        <p style={{color: '#cbd5e1', marginTop: '0.5rem'}}>
                            Comienza agregando un nuevo profesional para gestionar tu clínica OdontAll.
                        </p>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={() => {
                                setEditingId(null);
                                reset();
                                setShowModal(true);
                            }}
                        >
                            + Agregar Profesional
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
                                        <th>Nombre</th>
                                        <th>Licencia</th>
                                        <th>Especialización</th>
                                        <th>Teléfono</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {professionals.map((prof) => (
                                        <tr key={prof.id}>
                                            <td>{prof.user_full_name}</td>
                                            <td>{prof.license_number}</td>
                                            <td>{prof.specialization}</td>
                                            <td>{prof.phone}</td>
                                            <td>
                                                <span className={`badge ${
                                                    prof.status === 'active' ? 'badge-success' :
                                                    prof.status === 'inactive' ? 'badge-warning' :
                                                    'badge-error'
                                                }`}>
                                                    {prof.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-info mr-2"
                                                    onClick={() => handleEdit(prof)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleDelete(prof.id)}
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
                            {editingId ? 'Editar Profesional' : 'Crear Profesional'}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`form-control ${errors.first_name ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Nombre *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('first_name', { 
                                            required: 'El nombre es requerido',
                                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: Juan"
                                    />
                                    {errors.first_name && <span className="error-message">{errors.first_name.message}</span>}
                                </div>
                                <div className={`form-control ${errors.last_name ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Apellido *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('last_name', { 
                                            required: 'El apellido es requerido',
                                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: García"
                                    />
                                    {errors.last_name && <span className="error-message">{errors.last_name.message}</span>}
                                </div>
                                <div className={`form-control ${errors.email ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Email *</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        {...register('email', { 
                                            required: 'El email es requerido',
                                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: juan@odontall.com"
                                    />
                                    {errors.email && <span className="error-message">{errors.email.message}</span>}
                                </div>
                                <div className={`form-control ${errors.license_number ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Número de Licencia *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('license_number', { 
                                            required: 'El número de licencia es requerido',
                                            minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: 12345"
                                    />
                                    {errors.license_number && <span className="error-message">{errors.license_number.message}</span>}
                                </div>
                                <div className={`form-control ${errors.specialization ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Especialización *</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register('specialization', { 
                                            required: 'La especialización es requerida',
                                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: Ortodoncia"
                                    />
                                    {errors.specialization && <span className="error-message">{errors.specialization.message}</span>}
                                </div>
                                <div className={`form-control ${errors.phone ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Teléfono *</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        {...register('phone', { 
                                            required: 'El teléfono es requerido',
                                            pattern: { value: /^[0-9+\-\s()]+$/, message: 'Teléfono inválido' },
                                            minLength: { value: 9, message: 'Mínimo 9 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Ej: 3001234567"
                                    />
                                    {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Porcentaje Comisión (%)</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register('default_commission_percentage')}
                                        className="input input-bordered" 
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Dirección</span>
                                </label>
                                <textarea 
                                    {...register('address')}
                                    className="textarea textarea-bordered" 
                                    placeholder="Dirección del profesional"
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
