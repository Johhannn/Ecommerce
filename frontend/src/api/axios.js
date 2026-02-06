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

// Add response interceptor to handle 401 errors (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    // Try to refresh the token
                    const response = await axios.post('http://127.0.0.1:8000/accounts/login/refresh/', {
                        refresh: refreshToken
                    });

                    if (response.status === 200) {
                        const { access } = response.data;

                        // Save new token
                        localStorage.setItem('access_token', access);

                        // Update header and retry original request
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // If refresh fails, clear everything and redirect to login
                console.error("Token refresh failed:", refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // If not 401 or already retried, return error
        return Promise.reject(error);
    }
);

export default api;
