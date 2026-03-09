import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        // Explicitly use 127.0.0.1 for web to avoid IPv6 Windows resolution issues
        return 'http://127.0.0.1:5000';
    }
    if (Constants.expoConfig?.hostUri) {
        return `http://${Constants.expoConfig.hostUri.split(':')[0]}:5000`;
    }
    // Fallback to detected host IP for physical devices on same Wi-Fi
    return 'http://10.31.255.131:5000';
};

export const BASE_URL = getBaseUrl();
export const API_BASE_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: `${BASE_URL}/api/admin`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('adminToken');
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
    getRestaurantStats: (id) => api.get(`/restaurants/${id}/stats`),
    getRestaurantOrderHistory: (id, page = 1) => api.get(`/restaurants/${id}/history?page=${page}&limit=20`),
    getOrders: () => api.get('/orders'),
    updateUserStatus: (id) => api.patch(`/users/${id}/status`),
    updateDriverStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status }),
    updateRestaurantStatus: (id, status) => api.patch(`/restaurants/${id}/status`, { status }),
    updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    getDriverStats: (id) => api.get(`/drivers/${id}/stats`),
    // Banner Management
    getBanners: () => api.get('/banners'),
    createBanner: (data) => api.post('/banners', data),
    updateBanner: (id, data) => api.put(`/banners/${id}`, data),
    deleteBanner: (id) => api.delete(`/banners/${id}`),

    // Banner Request Management
    getBannerRequests: () => api.get('/banners/requests'),
    updateBannerRequestStatus: (id, data) => api.put(`/banners/requests/${id}`, data),
};

const baseApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Since adminToken may be needed for some routes
baseApi.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const couponAPI = {
    getCoupons: () => baseApi.get('/coupons'),
    createCoupon: (data) => baseApi.post('/coupons', data),
    updateCoupon: (id, data) => baseApi.put(`/coupons/${id}`, data),
    deleteCoupon: (id) => baseApi.delete(`/coupons/${id}`),
};

export const categoryAPI = {
    getCategories: () => baseApi.get('/categories'),
    createCategory: (data) => baseApi.post('/categories', data),
    updateCategory: (id, data) => baseApi.put(`/categories/${id}`, data),
    deleteCategory: (id) => baseApi.delete(`/categories/${id}`),
};

export default api;
