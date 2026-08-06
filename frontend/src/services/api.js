import axios from 'axios';

/**
 * axios-инстанс с базовым URL и автоматической подстановкой JWT.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Интерцептор запроса: добавляет accessToken ----------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Обработка 401: ротация refresh-токена ----------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Уже обновляем токен — ставим запрос в очередь
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
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Вспомогательная функция: извлекает data из ответа.
 * Возвращает response.data.data (тело ответа), либо бросает ошибку.
 */
const unwrap = (promise) => promise.then((res) => res.data.data);

// ========== Auth API ==========
export const register = (data) => unwrap(api.post('/auth/register', data));
export const login = (data) => unwrap(api.post('/auth/login', data));

// ========== Workouts API ==========
export const getWorkouts = (params) => unwrap(api.get('/workouts', { params }));
export const getWorkoutById = (id) => unwrap(api.get(`/workouts/${id}`));
export const startSession = (data) => unwrap(api.post('/workouts/start', data));
export const finishSession = (sessionId) => unwrap(api.put(`/workouts/${sessionId}/finish`));
export const getHistory = (params) => unwrap(api.get('/workouts/history', { params }));

// ========== Favorites API ==========
export const getFavorites = () => unwrap(api.get('/favorites'));
export const addFavorite = (workoutId) => unwrap(api.post(`/favorites/${workoutId}`));
export const removeFavorite = (workoutId) => unwrap(api.delete(`/favorites/${workoutId}`));

export default api;