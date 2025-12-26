import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { showNotification } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordUserId, setPasswordUserId] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerPassword, handleSubmit: submitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        setToken(accessToken);
        if (accessToken) {
            fetchUsers(accessToken);
        }
    }, []);

    const fetchUsers = async (accessToken) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users/?_t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setUsers(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            showNotification('Error al cargar usuarios', 'error');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await axios.put(
                    `${API_URL}/users/${editingId}/`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('Usuario actualizado exitosamente');
            } else {
                await axios.post(
                    `${API_URL}/users/`,
                    { ...data, is_active: true },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('Usuario creado exitosamente');
            }
            setShowModal(false);
            reset();
            setEditingId(null);
            await new Promise(resolve => setTimeout(resolve, 500));
            fetchUsers(token);
        } catch (error) {
            showNotification(error.response?.data?.detail || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        reset({
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        });
        setShowModal(true);
    };

    const handleDelete = async (userId, username) => {
        if (!confirm(`¿Estás seguro de eliminar el usuario "${username}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        
        try {
            await axios.delete(
                `${API_URL}/users/${userId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('Usuario eliminado exitosamente');
            fetchUsers(token);
        } catch (error) {
            showNotification('Error al eliminar usuario', 'error');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.post(
                `${API_URL}/users/${userId}/change_role/`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('Rol actualizado exitosamente');
            fetchUsers(token);
        } catch (error) {
            showNotification('Error al cambiar rol', 'error');
        }
    };

    const handlePasswordSubmit = async (data) => {
        try {
            if (data.password !== data.password_confirm) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            await axios.post(
                `${API_URL}/users/${passwordUserId}/set_password/`,
                { password: data.password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('Contraseña actualizada exitosamente');
            setShowPasswordModal(false);
            resetPassword();
            setPasswordUserId(null);
        } catch (error) {
            showNotification('Error al actualizar contraseña', 'error');
        }
    };

    const onPasswordFormSubmit = (data) => {
        handlePasswordSubmit(data);
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            'admin': 'badge-error',
            'professional': 'badge-info',
            'staff': 'badge-warning'
        };
        return colors[role] || 'badge-ghost';
    };

    const getRoleLabel = (role) => {
        const labels = {
            'admin': 'Administrador',
            'professional': 'Profesional',
            'staff': 'Personal'
        };
        return labels[role] || role;
    };

    return (
        <div style={{ padding: '32px 24px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    fontFamily: 'Georgia, serif',
                    margin: '0'
                }}>
                    Gestión de Usuarios
                </h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        reset();
                        setShowModal(true);
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        cursor: 'pointer'
                    }}
                >
                    + Crear Usuario
                </button>
            </div>

            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px',
                    color: '#3b82f6'
                }}>
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            ) : users.length === 0 ? (
                <div style={{
                    background: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '60px 20px',
                    textAlign: 'center'
                }}>
                    <p style={{fontSize: '3rem', margin: '0'}}>👤</p>
                    <h2 style={{
                        color: '#f1f5f9',
                        marginTop: '1rem',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        fontFamily: 'Georgia, serif'
                    }}>
                        No hay usuarios registrados
                    </h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingId(null);
                            reset();
                            setShowModal(true);
                        }}
                        style={{
                            marginTop: '24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        + Crear Usuario
                    </button>
                </div>
            ) : (
                <div style={{
                    background: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '24px',
                    overflow: 'hidden'
                }}>
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Nombre</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-semibold">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.first_name} {user.last_name}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <select 
                                                        className="select select-sm select-bordered modal-select"
                                                        value={user.role}
                                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                    >
                                                        <option value="professional">Profesional</option>
                                                        <option value="staff">Personal</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="space-x-2">
                                                <button 
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setPasswordUserId(user.id);
                                                        resetPassword();
                                                        setShowPasswordModal(true);
                                                    }}
                                                >
                                                    Contraseña
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleDelete(user.id, user.username)}
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
                    <div className="modal-box w-11/12 max-w-md">
                        <h3 className="font-bold text-lg">
                            {editingId ? 'Editar Usuario' : 'Crear Usuario'}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div className={`form-control ${errors.username ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Usuario *</span>
                                </label>
                                <input 
                                    type="text" 
                                    {...register('username', { 
                                        required: !editingId ? 'El usuario es requerido' : false,
                                        minLength: !editingId ? { value: 3, message: 'Mínimo 3 caracteres' } : undefined,
                                        pattern: !editingId ? { value: /^[a-zA-Z0-9._-]+$/, message: 'Solo letras, números, punto, guión y guión bajo' } : undefined
                                    })}
                                    className="input input-bordered" 
                                    placeholder="Ej: juan.garcia"
                                    disabled={!!editingId}
                                />
                                {errors.username && <span className="error-message">{errors.username.message}</span>}
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
                                    placeholder="Ej: Endodoncia"
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
                                    placeholder="Ej: +56912345678"
                                />
                                {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                            </div>
                            {!editingId && (
                                <div className={`form-control ${errors.password ? 'has-error' : ''}`}>
                                    <label className="label">
                                        <span className="label-text">Contraseña *</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        {...register('password', { 
                                            required: !editingId ? 'La contraseña es requerida' : false,
                                            minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                        })}
                                        className="input input-bordered" 
                                        placeholder="Contraseña segura (mínimo 6 caracteres)"
                                    />
                                    {errors.password && <span className="error-message">{errors.password.message}</span>}
                                </div>
                            )}

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

            {/* Modal Cambiar Contraseña */}
            {showPasswordModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-md">
                        <h3 className="font-bold text-lg">Cambiar Contraseña</h3>
                        <form onSubmit={submitPassword(onPasswordFormSubmit)} className="space-y-4 mt-4">
                            <div className={`form-control ${passwordErrors.password ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Nueva Contraseña *</span>
                                </label>
                                <input 
                                    type="password" 
                                    {...registerPassword('password', { 
                                        required: 'La contraseña es requerida',
                                        minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                    })}
                                    className="input input-bordered" 
                                    placeholder="Mínimo 6 caracteres"
                                />
                                {passwordErrors.password && <span className="error-message">{passwordErrors.password.message}</span>}
                            </div>
                            <div className={`form-control ${passwordErrors.password_confirm ? 'has-error' : ''}`}>
                                <label className="label">
                                    <span className="label-text">Confirmar Contraseña *</span>
                                </label>
                                <input 
                                    type="password" 
                                    {...registerPassword('password_confirm', { 
                                        required: 'La confirmación es requerida'
                                    })}
                                    className="input input-bordered" 
                                    placeholder="Repite la contraseña"
                                />
                                {passwordErrors.password_confirm && <span className="error-message">{passwordErrors.password_confirm.message}</span>}
                            </div>

                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    Actualizar
                                </button>
                                <button 
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        resetPassword();
                                        setPasswordUserId(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => {
                        setShowPasswordModal(false);
                        resetPassword();
                        setPasswordUserId(null);
                    }}></div>
                </div>
            )}
        </div>
    );
}
