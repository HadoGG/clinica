import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Professionals from './pages/Professionals';
import Services from './pages/Services';
import Attentions from './pages/Attentions';
import Discounts from './pages/Discounts';
import Settlements from './pages/Settlements';
import InsuranceDiscounts from './pages/InsuranceDiscounts';
import Reports from './pages/Reports';
import Login from './pages/Login';
import useAuthStore from './store/authStore';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    const { isAuthenticated, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular carga inicial
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        );
    }

    return (
        <Router>
            <Navbar />
            <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 60px)' }}>
                <Sidebar />
                <main style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/users" 
                            element={
                                <ProtectedRoute>
                                    <UserManagement />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/professionals" 
                            element={
                                <ProtectedRoute>
                                    <Professionals />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/services" 
                            element={
                                <ProtectedRoute>
                                    <Services />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/attentions" 
                            element={
                                <ProtectedRoute>
                                    <Attentions />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/discounts" 
                            element={
                                <ProtectedRoute>
                                    <Discounts />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/insurance-discounts" 
                            element={
                                <ProtectedRoute>
                                    <InsuranceDiscounts />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/settlements" 
                            element={
                                <ProtectedRoute>
                                    <Settlements />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/reports" 
                            element={
                                <ProtectedRoute>
                                    <Reports />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
            <ToastContainer 
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

export default App;
