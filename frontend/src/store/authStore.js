import { create } from 'zustand';
import { authService } from '../services/api';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,
    
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) {
            localStorage.setItem('access_token', token);
        } else {
            localStorage.removeItem('access_token');
        }
        set({ token, isAuthenticated: !!token });
    },
    
    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(username, password);
            const { access, user } = response.data;
            
            localStorage.setItem('access_token', access);
            // Guardar información del usuario incluyendo el rol
            localStorage.setItem('user_info', JSON.stringify(user));
            
            set({ 
                user, 
                token: access, 
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
            
            return { success: true, user };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            set({ 
                isLoading: false, 
                error: errorMessage,
                isAuthenticated: false
            });
            return { success: false, error: errorMessage };
        }
    },
    
    logout: () => {
        authService.logout();
        localStorage.removeItem('user_info');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;

