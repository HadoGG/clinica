import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { discountService } from '../services/api';
import { formatCurrency, showNotification } from '../utils/helpers';

export default function Discounts() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

    const discountType = watch('discount_type');

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await discountService.getAll({ limit: 100, _t: Date.now() });
            setDiscounts(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error al cargar descuentos:', error);
            setDiscounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const onSubmit = async (data) => {
        try {
            const submitData = {
                ...data,
                value: parseFloat(data.value),
                is_active: data.is_active === 'on' || data.is_active === true,
                is_mandatory: data.is_mandatory === 'on' || data.is_mandatory === true,
            };

            if (editingId) {
                await discountService.update(editingId, submitData);
                showNotification('Descuento actualizado exitosamente');
            } else {
                await discountService.create(submitData);
                showNotification('Descuento creado exitosamente');
            }
            setShowModal(false);
            reset();
            setEditingId(null);
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchDiscounts();
        } catch (error) {
            showNotification(error.response?.data?.detail || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (discount) => {
        setEditingId(discount.id);
        reset(discount);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este descuento?')) {
            try {
                await discountService.delete(id);
                showNotification('Descuento eliminado exitosamente');
                fetchDiscounts();
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
        }
    };

    const getCategoryBadge = (category) => {
        const badges = {
            'discount': 'badge-success',
            'retention': 'badge-warning',
            'deduction': 'badge-error'
        };
        const labels = {
            'discount': 'Descuento',
            'retention': 'Retención',
            'deduction': 'Deducción'
        };
        return { badge: badges[category], label: labels[category] };
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Descuentos y Retenciones</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        reset();
                        setShowModal(true);
                    }}
                >
                    + Agregar Descuento
                </button>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : discounts.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                        <p style={{fontSize: '3rem'}}>💰</p>
                        <h2 style={{color: '#333', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            No hay descuentos registrados
                        </h2>
                        <p style={{color: '#666', marginTop: '0.5rem'}}>
                            Configura descuentos y retenciones que se aplicarán en las liquidaciones.
                        </p>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={() => {
                                setEditingId(null);
                                reset();
                                setShowModal(true);
                            }}
                        >
                            + Agregar Descuento
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
                                        <th>Categoría</th>
                                        <th>Tipo</th>
                                        <th>Valor</th>
                                        <th>Obligatorio</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((discount) => {
                                        const { badge, label } = getCategoryBadge(discount.category);
                                        return (
                                            <tr key={discount.id}>
                                                <td>{discount.name}</td>
                                                <td>
                                                    <span className={`badge ${badge}`}>
                                                        {label}
                                                    </span>
                                                </td>
                                                <td className="capitalize">{discount.discount_type}</td>
                                                <td>
                                                    {discount.discount_type === 'percentage' 
                                                        ? `${discount.value}%`
                                                        : formatCurrency(discount.value)
                                                    }
                                                </td>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={discount.is_mandatory}
                                                        disabled
                                                        className="checkbox checkbox-sm"
                                                    />
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        discount.is_active ? 'badge-success' : 'badge-error'
                                                    }`}>
                                                        {discount.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-info mr-2"
                                                        onClick={() => handleEdit(discount)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-error"
                                                        onClick={() => handleDelete(discount.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                            {editingId ? 'Editar Descuento' : 'Crear Descuento/Retención'}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        placeholder="Ej: Afiliación"
                                    />
                                    {errors.name && <span className="error-message">{errors.name.message}</span>}
                                </div>
                                <div className={`form-control ${errors.category ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Categoría *</span>
                                    </label>
                                    <select 
                                        {...register('category', { required: 'La categoría es requerida' })}
                                        className="select select-bordered modal-select"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="discount">Descuento</option>
                                        <option value="retention">Retención</option>
                                        <option value="deduction">Deducción</option>
                                    </select>
                                    {errors.category && <span className="error-message">{errors.category.message}</span>}
                                </div>
                                <div className={`form-control ${errors.discount_type ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Tipo *</span>
                                    </label>
                                    <select 
                                        {...register('discount_type', { required: 'El tipo es requerido' })}
                                        className="select select-bordered modal-select"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="fixed">Monto Fijo</option>
                                    </select>
                                    {errors.discount_type && <span className="error-message">{errors.discount_type.message}</span>}
                                </div>
                                <div className={`form-control ${errors.value ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">
                                            Valor {discountType === 'percentage' ? '(%) *' : '($) *'}
                                        </span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register('value', { 
                                            required: 'El valor es requerido',
                                            min: { value: 0, message: 'El valor debe ser mayor o igual a 0' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder={discountType === 'percentage' ? '5' : '50000'}
                                    />
                                    {errors.value && <span className="error-message">{errors.value.message}</span>}
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
                                    placeholder="Descripción del descuento"
                                    rows="2"
                                ></textarea>
                                {errors.description && <span className="error-message">{errors.description.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            {...register('is_mandatory')}
                                            className="checkbox checkbox-sm"
                                        />
                                        <span className="label-text ml-2">¿Obligatorio?</span>
                                    </label>
                                </div>
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            {...register('is_active')}
                                            defaultChecked={true}
                                            className="checkbox checkbox-sm"
                                        />
                                        <span className="label-text ml-2">¿Activo?</span>
                                    </label>
                                </div>
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
