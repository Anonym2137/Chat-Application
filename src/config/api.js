

const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (isDevelopment ? 'http://localhost:3000' : '');

export const SOCKET_URL = import.meta.env.VITE_API_URL ||
    (isDevelopment ? 'http://localhost:3000' : window.location.origin);

// Helper to get full URL for API endpoints
export const getApiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
};

// Helper to get full URL for assets (avatars, uploads)
export const getAssetUrl = (path) => {
    if (!path) return undefined;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};
