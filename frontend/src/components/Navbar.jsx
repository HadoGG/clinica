import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2d5a96 100%)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }} className="navbar sticky top-0 z-50">
            <div className="flex-1">
                <button 
                    style={{
                        color: '#f1f5f9',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        fontFamily: 'Georgia, serif'
                    }}
                    onClick={() => navigate('/')}
                >
                    🦷 OdontAll
                </button>
            </div>
            <div className="flex-none gap-2">
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}>
                            {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={{color: '#f1f5f9', fontWeight: '500'}}>
                            {user?.first_name || user?.username}
                        </span>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        style={{backgroundColor: '#1e293b', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'}}>
                        <li>
                            <a style={{color: '#cbd5e1'}}>{user?.username}</a>
                        </li>
                        <li>
                            <a onClick={() => navigate('/profile')} style={{color: '#cbd5e1'}}>Perfil</a>
                        </li>
                        <li>
                            <a onClick={handleLogout} style={{color: '#ef4444', fontWeight: '600'}}>Cerrar Sesión</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
