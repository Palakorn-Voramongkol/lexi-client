// src/services/apiClient.js

import axios from 'axios';

// Create an Axios instance with default configurations
const apiClient = axios.create({
    baseURL: 'http://localhost:5001', // Replace with your actual API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add a request interceptor to include the token in headers if it exists
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
