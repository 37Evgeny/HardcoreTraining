// frontend/src/__tests__/pages/WorkoutPage.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import WorkoutPage from '../../pages/WorkoutPage';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  workoutsApi: {
    getById: vi.fn(),
    startSession: vi.fn(),
    finishSession: vi.fn(),
  },
}));

import { useAuth } from '../../context/AuthContext';
import { workoutsApi } from '../../services/api';

// Убираем TypeScript: (workoutId = 'w-1') => { ... }
const renderWorkoutPage = (workoutId) => {
  window.history.pushState({}, '', `/workouts/${workoutId || 'w-1'}`);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/workouts/:id" element={<WorkoutPage />} />
      </Routes>
    </BrowserRouter>
  );
};

const mockWorkout = {
  id: 'w-1',
  title: 'Foundation Beginner',
  level: 'BEGINNER',
  description: 'Базовая тренировка',
  exercises: [
    { id: 'e-1', name: 'Swing', sets: 3, reps: 10, weight: 16 },
    { id: 'e-2', name: 'Goblet Squat', sets: 3, reps: 8, weight: 12 },
  ],
};

describe('WorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('должен отображать состояние загрузки', () => {
    workoutsApi.getById.mockReturnValue(new Promise(() => {}));
    renderWorkoutPage();
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('должен отображать данные тренировки после загрузки', async () => {
    workoutsApi.getById.mockResolvedValue({ data: mockWorkout });
    renderWorkoutPage();

    await waitFor(() => {
      expect(screen.getByText('Foundation Beginner')).toBeInTheDocument();
    });
    expect(screen.getByText(/BEGINNER/i)).toBeInTheDocument();
    expect(screen.getByText('Swing')).toBeInTheDocument();
    expect(screen.getByText('Goblet Squat')).toBeInTheDocument();
  });

  it('должен отображать ошибку, если тренировка не найдена', async () => {
    workoutsApi.getById.mockRejectedValue({ response: { status: 404 } });
    renderWorkoutPage();

    await waitFor(() => {
      expect(screen.getByText(/не найдена/i)).toBeInTheDocument();
    });
  });

  it('должен запускать сессию при нажатии на кнопку "Начать"', async () => {
    const user = userEvent.setup();
    workoutsApi.getById.mockResolvedValue({ data: mockWorkout });
    workoutsApi.startSession.mockResolvedValue({ data: { id: 'session-1' } });

    renderWorkoutPage();

    await waitFor(() => {
      expect(screen.getByText('Foundation Beginner')).toBeInTheDocument();
    });

    const startButton = screen.getByRole('button', { name: /начать тренировку/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(workoutsApi.startSession).toHaveBeenCalledWith('w-1');
    });
  });
});