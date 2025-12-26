import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token JWT y prevenir caché
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar timestamp a GET requests para evitar caché del navegador
    if (config.method === 'get' || config.method === 'GET') {
        config.params = {
            ...config.params,
            _t: new Date().getTime()
        };
    }
    
    return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Servicios de Autenticación
export const authService = {
    login: (username, password) => {
        return axios.post(`${API_BASE_URL}/auth/login/`, {
            username,
            password
        });
    },
    refreshToken: (refreshToken) => {
        return axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
        });
    },
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};

// Servicios de Profesionales
export const professionalService = {
    getAll: (params) => api.get('/professionals/', { params }),
    getById: (id) => api.get(`/professionals/${id}/`),
    create: (data) => api.post('/professionals/', data),
    update: (id, data) => api.put(`/professionals/${id}/`, data),
    delete: (id) => api.delete(`/professionals/${id}/`),
    getActive: () => api.get('/professionals/active_professionals/'),
    getSettlementHistory: (id) => api.get(`/professionals/${id}/settlement_history/`),
};

// Servicios de Servicios
export const serviceService = {
    getAll: (params) => api.get('/services/', { params }),
    getById: (id) => api.get(`/services/${id}/`),
    create: (data) => api.post('/services/', data),
    update: (id, data) => api.put(`/services/${id}/`, data),
    delete: (id) => api.delete(`/services/${id}/`),
    getActive: () => api.get('/services/active_services/'),
};

// Servicios de Atenciones
export const attentionService = {
    getAll: (params) => api.get('/attentions/', { params }),
    getById: (id) => api.get(`/attentions/${id}/`),
    create: (data) => api.post('/attentions/', data),
    update: (id, data) => api.put(`/attentions/${id}/`, data),
    delete: (id) => api.delete(`/attentions/${id}/`),
    getByProfessional: (professionalId) => api.get('/attentions/professional_attentions/', { 
        params: { professional_id: professionalId } 
    }),
    getByDateRange: (startDate, endDate) => api.get('/attentions/date_range/', { 
        params: { start_date: startDate, end_date: endDate } 
    }),
};

// Servicios de Descuentos
export const discountService = {
    getAll: (params) => api.get('/discounts/', { params }),
    getById: (id) => api.get(`/discounts/${id}/`),
    create: (data) => api.post('/discounts/', data),
    update: (id, data) => api.put(`/discounts/${id}/`, data),
    delete: (id) => api.delete(`/discounts/${id}/`),
    getActive: () => api.get('/discounts/active_discounts/'),
    getByCategory: (category) => api.get('/discounts/by_category/', { 
        params: { category } 
    }),
};

// Servicios de Liquidaciones
export const settlementService = {
    getAll: (params) => api.get('/settlements/', { params }),
    getById: (id) => api.get(`/settlements/${id}/`),
    create: (data) => api.post('/settlements/', data),
    update: (id, data) => api.put(`/settlements/${id}/`, data),
    delete: (id) => api.delete(`/settlements/${id}/`),
    calculate: (id) => api.post(`/settlements/${id}/calculate/`),
    approve: (id) => api.post(`/settlements/${id}/approve/`),
    markAsPaid: (id, data) => api.post(`/settlements/${id}/mark_as_paid/`, data),
    generateForPeriod: (data) => api.post('/settlements/generate_for_period/', data),
    getReport: (params) => api.get('/settlements/report/', { params }),
    exportPDF: (id) => api.get(`/settlements/${id}/export_pdf/`, { 
        responseType: 'arraybuffer'
    }),
    exportExcel: () => api.get('/settlements/export_excel/', { 
        responseType: 'arraybuffer'
    }),
};

