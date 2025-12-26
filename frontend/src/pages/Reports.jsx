import { useState, useEffect } from 'react';
import { settlementService } from '../services/api';

export default function Reports() {
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        try {
            setLoading(true);
            const response = await settlementService.getAll();
            setSettlements(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            setSettlements([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    fontFamily: 'Georgia, serif',
                    margin: 0
                }}>
                    Reportes
                </h1>
            </div>

            {loading ? (
                <div className="loading loading-spinner loading-lg m-auto mt-10"></div>
            ) : settlements.length === 0 ? (
                <div style={{
                    background: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#cbd5e1'
                }}>
                    <p style={{fontSize: '3rem', margin: '0 0 1rem 0'}}>📊</p>
                    <h2 style={{color: '#f1f5f9', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                        No hay reportes disponibles
                    </h2>
                    <p style={{color: '#cbd5e1', marginTop: '0.5rem'}}>
                        Los reportes se generarán automáticamente con los datos de liquidaciones.
                    </p>
                </div>
            ) : (
                <div style={{
                    background: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: '#0f172a',
                            color: '#f1f5f9'
                        }}>
                            <thead>
                                <tr style={{
                                    background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.5) 0%, rgba(59, 130, 246, 0.3) 100%)',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.4)'
                                }}>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        color: '#e0f2fe',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase'
                                    }}>Período</th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        color: '#e0f2fe',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase'
                                    }}>Estado</th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        color: '#e0f2fe',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase'
                                    }}>Total</th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        color: '#e0f2fe',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase'
                                    }}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settlements.map((settlement, index) => (
                                    <tr key={settlement.id} style={{
                                        background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.08)' : '#0f172a',
                                        borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(59, 130, 246, 0.08)' : '#0f172a';
                                    }}>
                                        <td style={{padding: '16px', color: '#f1f5f9'}}>
                                            {settlement.period || 'N/A'}
                                        </td>
                                        <td style={{padding: '16px', color: '#f1f5f9'}}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '8px 14px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                textTransform: 'capitalize',
                                                background: settlement.status === 'completed' 
                                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)'
                                                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)',
                                                border: settlement.status === 'completed'
                                                    ? '1px solid rgba(16, 185, 129, 0.4)'
                                                    : '1px solid rgba(245, 158, 11, 0.4)',
                                                color: settlement.status === 'completed' ? '#34d399' : '#fbbf24'
                                            }}>
                                                {settlement.status || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{padding: '16px', color: '#f1f5f9', fontWeight: '600'}}>
                                            ${settlement.total_amount?.toLocaleString('es-CL') || '0'}
                                        </td>
                                        <td style={{padding: '16px', color: '#f1f5f9'}}>
                                            {new Date(settlement.created_at).toLocaleDateString('es-CL')}
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
