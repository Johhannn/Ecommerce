import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        // Only add token if it exists, is not empty, and not a string 'null' or 'undefined'
        if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
