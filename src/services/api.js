/**
 * Centralized API service for all backend communication
 * Provides consistent error handling and authentication
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get auth headers
const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
});

// Helper to handle API errors consistently
const handleApiError = (error, context = '') => {
    const message = error.response?.data || error.message;
    console.error(`API Error${context ? ` (${context})` : ''}:`, message);
    throw error;
};

// ============ Auth API ============

export const authApi = {
    login: async (username, password) => {
        try {
            const response = await api.post('/login', { username, password });
            return response.data;
        } catch (error) {
            handleApiError(error, 'login');
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'register');
        }
    },

    resetPasswordRequest: async (email) => {
        try {
            const response = await api.post('/reset-password', { email });
            return response.data;
        } catch (error) {
            handleApiError(error, 'reset-password-request');
        }
    },

    resetPassword: async (token, password) => {
        try {
            const response = await api.post(`/reset-password/${token}`, { password });
            return response.data;
        } catch (error) {
            handleApiError(error, 'reset-password');
        }
    },

    refreshToken: async (token) => {
        try {
            const response = await api.post('/refresh-token', { token });
            return response.data;
        } catch (error) {
            handleApiError(error, 'refresh-token');
        }
    },
};

// ============ User API ============

export const userApi = {
    getProfile: async (userId, token) => {
        try {
            const response = await api.get(`/profile/${userId}`, {
                headers: getAuthHeaders(token),
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'get-profile');
        }
    },

    updateProfile: async (formData, token) => {
        try {
            const response = await api.put('/update-profile', formData, {
                headers: {
                    ...getAuthHeaders(token),
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'update-profile');
        }
    },

    searchUsers: async (query, token) => {
        try {
            const response = await api.get('/search-users', {
                headers: getAuthHeaders(token),
                params: { query },
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'search-users');
        }
    },
};

// ============ Chat API ============

export const chatApi = {
    getDirectChats: async (token) => {
        try {
            const response = await api.get('/direct-chats', {
                headers: getAuthHeaders(token),
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'get-direct-chats');
        }
    },

    createChatRoom: async (userId, token) => {
        try {
            const response = await api.post(
                '/create-user-chatroom',
                { user_id: userId },
                { headers: getAuthHeaders(token) }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'create-chatroom');
        }
    },

    getMessages: async (chatRoomId, token) => {
        try {
            const response = await api.get(`/user-messages/${chatRoomId}`, {
                headers: getAuthHeaders(token),
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'get-messages');
        }
    },

    markMessagesAsRead: async (chatRoomId, userId, token) => {
        try {
            await api.post(
                '/mark-messages-read',
                { chat_room_id: chatRoomId, user_id: userId },
                { headers: getAuthHeaders(token) }
            );
        } catch (error) {
            handleApiError(error, 'mark-messages-read');
        }
    },

    getUnreadCounts: async (token) => {
        try {
            const response = await api.get('/unread-messages', {
                headers: getAuthHeaders(token),
            });
            return response.data.reduce((acc, item) => {
                acc[item.user_id] = item.unread_count;
                return acc;
            }, {});
        } catch (error) {
            handleApiError(error, 'get-unread-counts');
        }
    },
};

// ============ Notification API ============

export const notificationApi = {
    getNotifications: async (token) => {
        try {
            const response = await api.get('/notifications', {
                headers: getAuthHeaders(token),
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'get-notifications');
        }
    },

    acceptUser: async (userId, token) => {
        try {
            const response = await api.post(
                '/accept-user',
                { user_id: userId },
                { headers: getAuthHeaders(token) }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'accept-user');
        }
    },

    declineUser: async (userId, token) => {
        try {
            await api.post(
                '/decline-user',
                { user_id: userId },
                { headers: getAuthHeaders(token) }
            );
        } catch (error) {
            handleApiError(error, 'decline-user');
        }
    },
};

// ============ Spam API ============

export const spamApi = {
    getSpamChats: async (token) => {
        try {
            const response = await api.get('/spam-chats', {
                headers: getAuthHeaders(token),
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'get-spam-chats');
        }
    },

    unspamUser: async (userId, token) => {
        try {
            await api.post(
                '/unspam',
                { user_id: userId },
                { headers: getAuthHeaders(token) }
            );
        } catch (error) {
            handleApiError(error, 'unspam-user');
        }
    },
};

export default api;
