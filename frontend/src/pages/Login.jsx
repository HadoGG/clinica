import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuthStore();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('Inacap2025&');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!username || !password) {
            setLocalError('Por favor completa todos los campos');
            return;
        }

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setLocalError(result.error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>OdontAll - Sistema de Gestión</h1>
                <h2>Iniciar Sesión</h2>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            disabled={isLoading}
                        />
                    </div>

                    {(error || localError) && (
                        <div className="error-message">
                            {error || localError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-button"
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-info">
                    <p>Credenciales de admin para video:</p>
                    <ul>
                        <li><strong>Admin:</strong> admin / Inacap2025&</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
