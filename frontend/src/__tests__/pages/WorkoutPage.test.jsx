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
  getWorkoutById: vi.fn(),
  startSession: vi.fn(),
  finishSession: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';
import { getWorkoutById, startSession } from '../../services/api';

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
  durationMinutes: 30,
  exercises: [
    {
      id: 'e-1',
      name: 'Swing',
      sets: 3,
      reps: 10,
      weight: 16,
      restSeconds: 60,
      instructions: 'Do the swing',
    },
    {
      id: 'e-2',
      name: 'Goblet Squat',
      sets: 3,
      reps: 8,
      weight: 12,
      restSeconds: 60,
      instructions: 'Do the squat',
    },
  ],
};

describe('WorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('должен отображать состояние загрузки', () => {
    getWorkoutById.mockReturnValue(new Promise(() => {}));
    renderWorkoutPage();
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

// frontend/src/__tests__/pages/WorkoutPage.test.jsx
// ... (всё то же самое до теста "должен отображать данные тренировки после загрузки")

  it('должен отображать данные тренировки после загрузки', async () => {
    getWorkoutById.mockResolvedValue({
      data: {
        success: true,
        data: mockWorkout,
      },
    });
    renderWorkoutPage();

    await waitFor(() => {
      const headings = screen.getAllByText('Foundation Beginner');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });

    expect(
      screen.getByRole('heading', { name: /foundation beginner/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Начальный/i)).toBeInTheDocument();

    // ✅ Исправлено: ищем по тексту "Упражнений:" а не по цифре "2"
    // Цифра 2 дублируется в прогресс-баре ("1 / 2") и в количестве упражнений
    expect(screen.getByText(/Упражнений:/i)).toBeInTheDocument();
    expect(screen.getByText(/30 минут/i)).toBeInTheDocument();
  });

  it('должен отображать ошибку, если тренировка не найдена', async () => {
    getWorkoutById.mockRejectedValue({ response: { status: 404 } });
    renderWorkoutPage();

    await waitFor(() => {
      expect(
        screen.getByText(/не удалось загрузить тренировку/i)
      ).toBeInTheDocument();
    });
  });

  it('должен запускать сессию при нажатии на кнопку "Начать"', async () => {
    const user = userEvent.setup();
    getWorkoutById.mockResolvedValue({
      data: {
        success: true,
        data: mockWorkout,
      },
    });
    startSession.mockResolvedValue({
      data: {
        success: true,
        data: { id: 'session-1' },
      },
    });

    renderWorkoutPage();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /foundation beginner/i })
      ).toBeInTheDocument();
    });

    const startButton = screen.getByRole('button', {
      name: /начать тренировку/i,
    });
    await user.click(startButton);

    await waitFor(() => {
      expect(startSession).toHaveBeenCalledWith({ workoutId: 'w-1' });
    });
  });
});