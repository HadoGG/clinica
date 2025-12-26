import { useState, useEffect } from 'react';
import { settlementService, professionalService, attentionService } from '../services/api';
import { formatCurrency, formatDate, showNotification } from '../utils/helpers';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Paleta de colores moderna
const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1'
};

const pieColors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSettlements: 0,
        totalAmount: 0,
        pendingSettlements: 0,
        professionals: 0,
        patientsAttended: 0,
    });
    const [recentSettlements, setRecentSettlements] = useState([]);
    const [recentAttentions, setRecentAttentions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                if (userRole === 'admin') {
                    const [settlementsRes, professionalsRes] = await Promise.all([
                        settlementService.getAll({ limit: 100 }),
                        professionalService.getActive(),
                    ]);

                    const settlements = settlementsRes.data.results || settlementsRes.data;
                    const professionals = professionalsRes.data;

                    // Preparar datos para gráfico
                    const chartData = settlements.slice(-10).map(s => ({
                        name: formatDate(s.period_end).substring(0, 5),
                        amount: parseFloat(s.net_amount) || 0
                    }));

                    // Datos de estados
                    const statusCounts = {
                        paid: settlements.filter(s => s.status === 'paid').length,
                        approved: settlements.filter(s => s.status === 'approved').length,
                        calculated: settlements.filter(s => s.status === 'calculated').length,
                        pending: settlements.filter(s => s.status === 'pending').length,
                    };

                    const statusChartData = Object.entries(statusCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([status, count]) => ({
                            name: status.charAt(0).toUpperCase() + status.slice(1),
                            value: count
                        }));

                    setChartData(chartData);
                    setStatusData(statusChartData);

                    setStats({
                        totalSettlements: settlements.length,
                        totalAmount: settlements.reduce((sum, s) => sum + (parseFloat(s.net_amount) || 0), 0),
                        pendingSettlements: settlements.filter(s => s.status !== 'paid').length,
                        professionals: professionals.length,
                        patientsAttended: 0,
                    });

                    setRecentSettlements(settlements.slice(0, 5));
                } else {
                    const userInfo = localStorage.getItem('user_info');
                    const user = JSON.parse(userInfo);
                    const professionalId = user.professional_id;
                    
                    if (!professionalId) {
                        setStats({
                            totalSettlements: 0,
                            totalAmount: 0,
                            pendingSettlements: 0,
                            professionals: 0,
                            patientsAttended: 0,
                        });
                        setLoading(false);
                        return;
                    }
                    
                    const [attentionsRes, settlementsRes] = await Promise.all([
                        attentionService.getAll({ limit: 100 }),
                        settlementService.getAll({ limit: 100 }),
                    ]);

                    let attentions = attentionsRes.data.results || attentionsRes.data || [];
                    let settlements = settlementsRes.data.results || settlementsRes.data || [];
                    
                    attentions = attentions.filter(a => a.professional === professionalId);
                    settlements = settlements.filter(s => s.professional === professionalId);

                    const chartData = settlements.slice(-10).map(s => ({
                        name: formatDate(s.period_end).substring(0, 5),
                        amount: parseFloat(s.net_amount) || 0
                    }));

                    const statusCounts = {
                        paid: settlements.filter(s => s.status === 'paid').length,
                        approved: settlements.filter(s => s.status === 'approved').length,
                        calculated: settlements.filter(s => s.status === 'calculated').length,
                    };

                    const statusChartData = Object.entries(statusCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([status, count]) => ({
                            name: status.charAt(0).toUpperCase() + status.slice(1),
                            value: count
                        }));

                    setChartData(chartData);
                    setStatusData(statusChartData);
                    
                    setStats({
                        totalSettlements: settlements.length,
                        totalAmount: settlements.reduce((sum, s) => sum + (parseFloat(s.net_amount) || 0), 0),
                        pendingSettlements: settlements.filter(s => s.status !== 'paid').length,
                        professionals: 0,
                        patientsAttended: attentions.length,
                    });

                    setRecentAttentions(attentions.slice(0, 5));
                    setRecentSettlements(settlements.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userRole) {
            fetchData();
        }
    }, [userRole]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.primary} 100%)`
            }}>
                <div className="loading loading-spinner loading-lg" style={{ color: colors.secondary }}></div>
            </div>
        );
    }

    const handleExportPDF = async (settlementId) => {
        try {
            const response = await settlementService.exportPDF(settlementId);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `liquidacion-${settlementId}.pdf`);
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
            link.setAttribute('download', `liquidaciones.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showNotification('Excel descargado exitosamente');
        } catch (error) {
            showNotification('Error al descargar Excel', 'error');
            console.error('Error:', error);
        }
    };

    // Componente de tarjeta de estadística
    const StatCard = ({ title, value, icon, color, trend }) => (
        <div style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
            border: `1px solid ${color}44`,
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 12px 24px ${color}33`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}>
            <div style={{
                fontSize: '40px',
                background: `${color}22`,
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <p style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    margin: '0 0 8px 0',
                    fontWeight: '500',
                    letterSpacing: '0.5px'
                }}>
                    {title}
                </p>
                <h3 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    margin: '0',
                    color: colors.text,
                    fontFamily: 'Georgia, serif'
                }}>
                    {value}
                </h3>
                {trend && <p style={{
                    fontSize: '12px',
                    color: colors.success,
                    margin: '4px 0 0 0'
                }}>↑ {trend}</p>}
            </div>
        </div>
    );

    return (
        <div style={{
            padding: '32px 24px',
            background: `linear-gradient(135deg, ${colors.bg} 0%, #1a2e4a 100%)`,
            minHeight: '100vh',
            color: colors.text,
            fontFamily: '"Inter", "Segoe UI", sans-serif'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <p style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    margin: '0 0 8px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    Bienvenido
                </p>
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: '700',
                    margin: '0',
                    color: colors.text,
                    fontFamily: 'Georgia, serif'
                }}>
                    {userRole === 'admin' ? 'Panel de Control' : 'Mi Información'}
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: colors.textSecondary,
                    margin: '12px 0 0 0'
                }}>
                    {userRole === 'admin' 
                        ? 'Resumen de liquidaciones y profesionales'
                        : 'Resumen de tus liquidaciones y atenciones'}
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: userRole === 'admin' 
                    ? 'repeat(auto-fit, minmax(280px, 1fr))'
                    : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                {userRole === 'admin' && (
                    <StatCard
                        title="Profesionales Activos"
                        value={stats.professionals}
                        icon="👥"
                        color={colors.secondary}
                    />
                )}

                {userRole !== 'admin' && (
                    <StatCard
                        title="Pacientes Atendidos"
                        value={stats.patientsAttended}
                        icon="🏥"
                        color={colors.secondary}
                    />
                )}

                <StatCard
                    title={userRole === 'admin' ? 'Liquidaciones Totales' : 'Mis Liquidaciones'}
                    value={stats.totalSettlements}
                    icon="📊"
                    color={colors.accent}
                />

                <StatCard
                    title={userRole === 'admin' ? 'Monto Total Pagado' : 'Mi Monto Total'}
                    value={formatCurrency(stats.totalAmount)}
                    icon="💰"
                    color={colors.success}
                />

                <StatCard
                    title={userRole === 'admin' ? 'Liquidaciones Pendientes' : 'Liquidaciones Pendientes'}
                    value={stats.pendingSettlements}
                    icon="⏳"
                    color={colors.warning}
                />
            </div>

            {/* Charts Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                {/* Gráfico de línea - Monto Neto */}
                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.primary}44`,
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <p style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 20px 0',
                        color: colors.text,
                        fontFamily: 'Georgia, serif'
                    }}>
                        Tendencia de Montos
                    </p>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${colors.primary}44`} />
                                <XAxis dataKey="name" stroke={colors.textSecondary} />
                                <YAxis stroke={colors.textSecondary} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: colors.primary,
                                        border: `1px solid ${colors.secondary}`,
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke={colors.secondary} 
                                    strokeWidth={3}
                                    dot={{ fill: colors.secondary, r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: colors.textSecondary, textAlign: 'center' }}>No hay datos disponibles</p>
                    )}
                </div>

                {/* Gráfico de dona - Estados */}
                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.primary}44`,
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <p style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 20px 0',
                        color: colors.text,
                        fontFamily: 'Georgia, serif'
                    }}>
                        Estado de Liquidaciones
                    </p>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: colors.primary,
                                        border: `1px solid ${colors.secondary}`,
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: colors.textSecondary, textAlign: 'center' }}>No hay datos disponibles</p>
                    )}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        justifyContent: 'center',
                        marginTop: '16px'
                    }}>
                        {statusData.map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '2px',
                                    backgroundColor: pieColors[idx % pieColors.length]
                                }}></div>
                                <span style={{ color: colors.textSecondary }}>
                                    {item.name}: {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Settlements Table */}
            <div style={{
                background: colors.card,
                border: `1px solid ${colors.primary}44`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                overflow: 'hidden'
            }}>
                <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    color: colors.text,
                    fontFamily: 'Georgia, serif'
                }}>
                    {userRole === 'admin' ? 'Liquidaciones Recientes' : 'Mis Liquidaciones Recientes'}
                </p>

                <div style={{
                    overflowX: 'auto'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <thead>
                            <tr style={{
                                borderBottom: `2px solid ${colors.primary}44`,
                                backgroundColor: `${colors.primary}11`
                            }}>
                                {userRole === 'admin' && (
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        color: colors.textSecondary,
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>Profesional</th>
                                )}
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    color: colors.textSecondary,
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>Período</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    color: colors.textSecondary,
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>Comisión</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    color: colors.textSecondary,
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>Monto Neto</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    color: colors.textSecondary,
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>Estado</th>
                                {userRole !== 'admin' && (
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        color: colors.textSecondary,
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {recentSettlements.map((settlement, idx) => (
                                <tr 
                                    key={settlement.id}
                                    style={{
                                        borderBottom: `1px solid ${colors.primary}22`,
                                        backgroundColor: idx % 2 === 0 ? `${colors.primary}08` : 'transparent',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.secondary}22`}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? `${colors.primary}08` : 'transparent'}
                                >
                                    {userRole === 'admin' && (
                                        <td style={{ padding: '16px', color: colors.text }}>
                                            {settlement.professional_name}
                                        </td>
                                    )}
                                    <td style={{ padding: '16px', color: colors.text }}>
                                        {formatDate(settlement.period_start)} - {formatDate(settlement.period_end)}
                                    </td>
                                    <td style={{ padding: '16px', color: colors.textSecondary }}>
                                        {formatCurrency(settlement.total_commission)}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        color: colors.success,
                                        fontWeight: '600',
                                        fontSize: '16px'
                                    }}>
                                        {formatCurrency(settlement.net_amount)}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: settlement.status === 'paid' ? `${colors.success}22` :
                                                settlement.status === 'approved' ? `${colors.secondary}22` :
                                                settlement.status === 'calculated' ? `${colors.warning}22` :
                                                `${colors.primary}22`,
                                            color: settlement.status === 'paid' ? colors.success :
                                                settlement.status === 'approved' ? colors.secondary :
                                                settlement.status === 'calculated' ? colors.warning :
                                                colors.textSecondary,
                                            textTransform: 'capitalize'
                                        }}>
                                            {settlement.status}
                                        </span>
                                    </td>
                                    {userRole !== 'admin' && (
                                        <td style={{ padding: '16px' }}>
                                            <button
                                                onClick={() => handleExportPDF(settlement.id)}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    color: colors.text,
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = `0 8px 16px ${colors.secondary}44`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                📄 PDF
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {recentSettlements.length === 0 && (
                    <p style={{
                        textAlign: 'center',
                        color: colors.textSecondary,
                        padding: '40px 20px',
                        fontSize: '14px'
                    }}>
                        No hay liquidaciones disponibles
                    </p>
                )}

                {userRole !== 'admin' && recentSettlements.length > 0 && (
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleExportExcel}
                            style={{
                                padding: '10px 24px',
                                background: `linear-gradient(135deg, ${colors.success} 0%, #059669 100%)`,
                                border: 'none',
                                borderRadius: '8px',
                                color: colors.text,
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 8px 16px ${colors.success}44`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            📊 Descargar Excel
                        </button>
                    </div>
                )}
            </div>

            {/* Recent Attentions - Para profesionales */}
            {userRole !== 'admin' && recentAttentions.length > 0 && (
                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.primary}44`,
                    borderRadius: '12px',
                    padding: '24px',
                    overflow: 'hidden'
                }}>
                    <p style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 20px 0',
                        color: colors.text,
                        fontFamily: 'Georgia, serif'
                    }}>
                        Pacientes Atendidos Recientemente
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '14px'
                        }}>
                            <thead>
                                <tr style={{
                                    borderBottom: `2px solid ${colors.primary}44`,
                                    backgroundColor: `${colors.primary}11`
                                }}>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        color: colors.textSecondary,
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>Paciente</th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        color: colors.textSecondary,
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>Servicio</th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        color: colors.textSecondary,
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>Fecha</th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        color: colors.textSecondary,
                                        fontWeight: '600',
                                        letterSpacing: '0.5px'
                                    }}>Previsión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAttentions.map((attention, idx) => (
                                    <tr 
                                        key={attention.id}
                                        style={{
                                            borderBottom: `1px solid ${colors.primary}22`,
                                            backgroundColor: idx % 2 === 0 ? `${colors.primary}08` : 'transparent',
                                            transition: 'background-color 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.secondary}22`}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? `${colors.primary}08` : 'transparent'}
                                    >
                                        <td style={{ padding: '16px', color: colors.text }}>
                                            {attention.patient_name}
                                        </td>
                                        <td style={{ padding: '16px', color: colors.textSecondary }}>
                                            {attention.service_name}
                                        </td>
                                        <td style={{ padding: '16px', color: colors.textSecondary }}>
                                            {formatDate(attention.date)}
                                        </td>
                                        <td style={{ padding: '16px', color: colors.accent }}>
                                            {attention.insurance_type || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
