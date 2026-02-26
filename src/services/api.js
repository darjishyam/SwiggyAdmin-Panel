import axios from 'axios';

const BASE_URL = 'http://192.168.1.6:5000/api/admin';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // We'll use SecureStore for mobile token storage later
    const token = null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
};

export const adminAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getUsers: () => api.get('/users'),
    getDrivers: () => api.get('/drivers'),
    getRestaurants: () => api.get('/restaurants'),
    getRestaurantMenu: (id) => api.get(`/restaurants/${id}/menu`),
    getOrders: () => api.get('/orders'),
    updateUserStatus: (id) => api.patch(`/users/${id}/status`),
    updateDriverStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status }),
    updateRestaurantStatus: (id, status) => api.patch(`/restaurants/${id}/status`, { status }),
};

export default api;
