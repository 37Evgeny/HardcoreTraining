import axios from 'axios';

/**
 * Создание axios-инстанса с базовым URL.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Интерцептор запроса: добавляет JWT token из localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Интерцептор ответа: обрабатывает 401 и пытается обновить токен.
 */
let isRefreshing = false;
let failedQueue = []; // <-- Убрал TypeScript-аннотацию

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и это не запрос на refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если уже обновляем токен, ставим в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Очищаем токены и перенаправляем на логин
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ========== Auth API ==========
export const register = (data) =>
  api.post('/auth/register', data);

export const login = (data) =>
  api.post('/auth/login', data);

export const refreshToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

// ========== Workouts API ==========
export const getWorkouts = (params) =>
  api.get('/workouts', { params });

export const getWorkoutById = (id) =>
  api.get(`/workouts/${id}`);

export const startSession = (data) =>
  api.post('/workouts/start', data);

export const finishSession = (sessionId) =>
  api.put(`/workouts/${sessionId}/finish`);

export const getHistory = (params) =>
  api.get('/workouts/history', { params });

export default api;