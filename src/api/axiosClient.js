import axios from 'axios';
import { useWellnessStore } from '../store/wellnessStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to append the bearer access token and language to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('hs_access_token') || localStorage.getItem('hs_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const activeLang = useWellnessStore.getState().language?.code || 'en';
      config.headers['Accept-Language'] = activeLang;
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh and unauthorized errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 Unauthorized (expired token) and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('hs_refresh_token');
      if (refreshToken) {
        try {
          // Call direct axios post to bypass request interceptor and prevent refresh loops
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (res.data && res.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = res.data;
            localStorage.setItem('hs_access_token', accessToken);
            localStorage.setItem('hs_refresh_token', newRefreshToken);
            sessionStorage.setItem('hs_access_token', accessToken);
            sessionStorage.setItem('hs_refresh_token', newRefreshToken);

            // Retry the original request with the new access token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          // Invalidate tokens and clear session on refresh error
          localStorage.removeItem('hs_access_token');
          localStorage.removeItem('hs_refresh_token');
          sessionStorage.removeItem('hs_access_token');
          sessionStorage.removeItem('hs_refresh_token');
          sessionStorage.removeItem('hs_current_member');
          sessionStorage.removeItem('temp_role');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
