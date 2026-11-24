
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes('/admin/refresh-token') ||
            !localStorage.getItem('adminToken')
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return API(originalRequest);
            }).catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            const response = await API.post('/admin/refresh-token');

            const newAccessToken = response.data.accessToken;

            localStorage.setItem('adminToken', newAccessToken);

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return API(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);

            localStorage.removeItem('adminToken');
            window.location.href = '/login';

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default API;
