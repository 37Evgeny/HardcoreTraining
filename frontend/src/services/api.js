
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getWorkouts = () => api.get('/workouts');
export const startSession = (data) => api.post('/workouts/start', data);
export const finishSession = (id) => api.put(`/workouts/${id}/finish`);
