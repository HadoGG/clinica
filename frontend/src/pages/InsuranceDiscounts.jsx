import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { showNotification } from '../utils/helpers';

export default function InsuranceDiscounts() {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/insurance-discounts/', { params: { limit: 100, _t: Date.now() } });
            const data = response.data.results || response.data || [];
            setDiscounts(data);
        } catch (error) {
            console.error('Error al cargar descuentos:', error);
            showNotification('Error al cargar descuentos de aseguradora', 'error');
            setDiscounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            fetchDiscounts();
        }
    }, [userRole]);

    const handleSaveDiscount = async (data) => {
        try {
            if (editingId) {
                // Actualizar
                await api.put(`/insurance-discounts/${editingId}/`, {
                    insurance_name: data.insurance_name,
                    discount_type: data.discount_type,
                    discount_value: parseFloat(data.discount_value),
                    is_active: data.is_active === 'on'
                });
                showNotification('Descuento actualizado exitosamente');
            } else {
                // Crear
                await api.post('/insurance-discounts/', {
                    insurance_name: data.insurance_name,
                    discount_type: data.discount_type,
                    discount_value: parseFloat(data.discount_value),
                    is_active: data.is_active === 'on'
                });
                showNotification('Descuento creado exitosamente');
            }
            setShowModal(false);
            setEditingId(null);
            reset();
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchDiscounts();
        } catch (error) {
            showNotification('Error al guardar descuento', 'error');
        }
    };

    const handleEdit = (discount) => {
        setEditingId(discount.id);
        setValue('insurance_name', discount.insurance_name);
        setValue('discount_type', discount.discount_type);
        setValue('discount_value', discount.discount_value);
        setValue('is_active', discount.is_active);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este descuento?')) {
            try {
                await api.delete(`/insurance-discounts/${id}/`);
                showNotification('Descuento eliminado exitosamente');
                fetchDiscounts();
            } catch (error) {
                showNotification('Error al eliminar descuento', 'error');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        reset();
    };

    const handleOpenModal = () => {
        setEditingId(null);
        reset();
        setShowModal(true);
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold">
                        🏥 Descuentos por Aseguradora
                    </h1>
                    <p className="text-gray-600 mt-1">Gestiona los descuentos aplicables a cada aseguradora en OdontAll</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={handleOpenModal}
                >
                    + Nuevo Descuento
                </button>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : discounts.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>🏥</p>
                        <h2 style={{color: '#333', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay descuentos registrados
                        </h2>
                        <p style={{color: '#666', marginTop: '0.5rem'}}>
                            Crea el primer descuento de aseguradora para OdontAll
                        </p>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={handleOpenModal}
                        >
                            + Crear Descuento
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discounts.map((discount) => (
                        <div key={discount.id} className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title text-lg">
                                    {discount.insurance_name}
                                </h2>
                                
                                <div className="space-y-2 my-4">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Tipo:</span>
                                        <span className="badge badge-primary">
                                            {discount.discount_type === 'percentage' ? '📊 Porcentaje' : '💰 Fijo'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Valor:</span>
                                        <span className="text-lg font-bold text-success">
                                            {discount.discount_type === 'percentage' 
                                                ? `${discount.discount_value}%` 
                                                : `$${parseFloat(discount.discount_value).toFixed(2)}`}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Estado:</span>
                                        <span className={`badge ${discount.is_active ? 'badge-success' : 'badge-error'}`}>
                                            {discount.is_active ? '✅ Activo' : '❌ Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-actions justify-end gap-2">
                                    <button 
                                        className="btn btn-sm btn-warning"
                                        onClick={() => handleEdit(discount)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-error"
                                        onClick={() => handleDelete(discount.id)}
                                    >
                                        🗑️ Eliminar
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
                    <div className="modal-box w-11/12 max-w-md">
                        <h3 className="font-bold text-lg">
                            {editingId ? 'Editar Descuento' : 'Nuevo Descuento por Aseguradora'}
                        </h3>
                        
                        <form onSubmit={handleSubmit(handleSaveDiscount)} className="space-y-4 mt-4">
                            <div className={`form-control ${errors.insurance_name ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Nombre de la Aseguradora *</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Seguros Medicos SA"
                                    {...register('insurance_name', { 
                                        required: 'El nombre es requerido',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                    className="input input-bordered" 
                                />
                                {errors.insurance_name && (
                                    <span className="error-message">{errors.insurance_name.message}</span>
                                )}
                            </div>

                            <div className={`form-control ${errors.discount_type ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Tipo de Descuento *</span>
                                </label>
                                <select 
                                    {...register('discount_type', { required: 'Selecciona un tipo' })}
                                    className="select select-bordered modal-select"
                                >
                                    <option value="">Selecciona un tipo</option>
                                    <option value="percentage">📊 Porcentaje (%)</option>
                                    <option value="fixed">💰 Monto Fijo ($)</option>
                                </select>
                                {errors.discount_type && (
                                    <span className="error-message">{errors.discount_type.message}</span>
                                )}
                            </div>

                            <div className={`form-control ${errors.discount_value ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Valor del Descuento *</span>
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    placeholder="Ej: 15 o 150.50"
                                    {...register('discount_value', { 
                                        required: 'El valor es requerido',
                                        min: { value: 0, message: 'El valor debe ser mayor o igual a 0' }
                                    })}
                                    className="input input-bordered" 
                                />
                                {errors.discount_value && (
                                    <span className="error-message">{errors.discount_value.message}</span>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Descuento Activo</span>
                                    <input 
                                        type="checkbox" 
                                        {...register('is_active')}
                                        className="checkbox"
                                        defaultChecked={true}
                                    />
                                </label>
                            </div>

                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Actualizar' : 'Crear'}
                                </button>
                                <button 
                                    type="button"
                                    className="btn"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={handleCloseModal}></div>
                </div>
            )}
        </div>
    );
}
