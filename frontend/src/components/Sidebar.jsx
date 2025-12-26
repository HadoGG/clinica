import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
            // En pantallas grandes, siempre mostrar sidebar
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Obtener rol del usuario desde localStorage o sessionStorage
    useEffect(() => {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                setUserRole(user.role || 'professional');
            } catch (e) {
                setUserRole('professional');
            }
        }
    }, []);

    const allMenuItems = [
        { 
            label: 'Dashboard', 
            icon: '▦', 
            path: '/',
            key: 'dashboard',
            roles: ['admin', 'professional', 'staff']
        },
        { 
            label: 'Gestión de Usuarios', 
            icon: '👥', 
            path: '/users',
            key: 'users',
            roles: ['admin'] // Solo admin
        },
        { 
            label: 'Gestión de Profesionales', 
            icon: '👨‍⚕️', 
            path: '/professionals',
            key: 'professionals',
            roles: ['admin'] // Solo admin
        },
        { 
            label: 'Servicios', 
            icon: '✦', 
            path: '/services',
            key: 'services',
            roles: ['admin', 'professional']
        },
        { 
            label: 'Atenciones', 
            icon: '✎', 
            path: '/attentions',
            key: 'attentions',
            roles: ['admin', 'professional']
        },
        { 
            label: 'Liquidaciones', 
            icon: '📄', 
            path: '/settlements',
            key: 'settlements',
            roles: ['admin'] // Solo admin
        },
        { 
            label: 'Reportes', 
            icon: '⊞', 
            path: '/reports',
            key: 'reports',
            roles: ['admin']
        },
    ];

    // Filtrar items según el rol del usuario
    const menuItems = allMenuItems.filter(item => 
        !item.roles || item.roles.includes(userRole || 'professional')
    );

    return (
        <>
            {/* Toggle button para móviles */}
            {!isLargeScreen && !isOpen && (
                <button 
                    style={{
                        position: 'fixed',
                        top: '70px',
                        left: '15px',
                        zIndex: 50,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <span>☰</span>
                    <span>Menú</span>
                </button>
            )}

            {/* Sidebar */}
            <aside style={{
                backgroundColor: '#1e293b',
                borderRight: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#f1f5f9',
                transition: 'transform 0.3s ease',
                // Positioning
                ...(isLargeScreen ? {
                    // Pantalla grande: static, siempre visible
                    position: 'static',
                    transform: 'none',
                    zIndex: 'auto',
                    width: '16rem',
                    height: 'auto'
                } : {
                    // Pantalla pequeña: fixed, toggle con transform
                    position: 'fixed',
                    left: '0',
                    top: '4rem',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    zIndex: '30',
                    width: '16rem',
                    height: '100vh',
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                })
            }} className="lg:static">
                <div style={{padding: '1.5rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                        <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9', margin: 0, fontFamily: 'Georgia, serif'}}>
                            Menú
                        </h2>
                        {!isLargeScreen && (
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#3b82f6',
                                    padding: '0',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                                    e.target.style.borderRadius = '0.375rem';
                                    e.target.style.color = '#06b6d4';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#3b82f6';
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.key}>
                                    <a 
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            paddingLeft: isActive ? '1.5rem' : '1rem',
                                            cursor: 'pointer',
                                            color: isActive ? '#06b6d4' : '#cbd5e1',
                                            textDecoration: 'none',
                                            borderRadius: '0.375rem',
                                            transition: 'all 0.3s ease',
                                            marginBottom: '0.5rem',
                                            fontSize: '1rem',
                                            fontWeight: isActive ? '600' : '500',
                                            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                            borderLeft: isActive ? '3px solid #06b6d4' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                                e.target.style.color = '#06b6d4';
                                                e.target.style.paddingLeft = '1.5rem';
                                                e.target.style.borderLeft = '3px solid #06b6d4';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#cbd5e1';
                                                e.target.style.paddingLeft = '1rem';
                                                e.target.style.borderLeft = 'none';
                                            }
                                        }}
                                    >
                                        <span style={{fontSize: '1.25rem'}}>{item.icon}</span>
                                        {item.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* Overlay para móviles */}
            {isOpen && !isLargeScreen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 20
                    }}
                    className="lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
