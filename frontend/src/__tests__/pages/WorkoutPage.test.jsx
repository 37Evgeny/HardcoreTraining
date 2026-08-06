import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import WorkoutPage from '../../pages/WorkoutPage/WorkoutPage';

/**
 * Мокаем API-сервис, который использует WorkoutPage.
 * ИСПРАВЛЕНО: мокаем функции из '../../services/api', которые реально используются в WorkoutPage.
 */
vi.mock('../../services/api', () => ({
  getWorkoutById: vi.fn(),
  startSession: vi.fn(),
  finishSession: vi.fn(),
}));

import { getWorkoutById } from '../../services/api';

/**
 * Мокаем AuthContext.
 */
const mockUser = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
};

const renderWorkoutPage = (workoutId = '1', user = null) => {
  return render(
    <BrowserRouter>
      <AuthProvider initialUser={user}>
        <Routes>
          <Route path="/workouts/:id" element={<WorkoutPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>,
    { initialEntries: [`/workouts/${workoutId}`] }
  );
};

describe('WorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает название тренировки', async () => {
    const mockWorkout = {
      id: '1',
      name: 'Утренняя зарядка',
      description: 'Бодрое начало дня',
      duration: 30,
      exercises: [
        { id: '1', name: 'Отжимания', sets: 3, reps: 15, safetyTip: 'Держите спину прямой' },
      ],
    };

    (getWorkoutById as ReturnType<typeof vi.fn>).mockResolvedValue(mockWorkout);

    renderWorkoutPage('1', mockUser);

    await waitFor(() => {
      expect(screen.getByText('Утренняя зарядка')).toBeInTheDocument();
    });
  });

  it('отображает описание тренировки', async () => {
    const mockWorkout = {
      id: '1',
      name: 'Утренняя зарядка',
      description: 'Бодрое начало дня',
      duration: 30,
      exercises: [
        { id: '1', name: 'Отжимания', sets: 3, reps: 15, safetyTip: 'Держите спину прямой' },
      ],
    };

    (getWorkoutById as ReturnType<typeof vi.fn>).mockResolvedValue(mockWorkout);

    renderWorkoutPage('1', mockUser);

    await waitFor(() => {
      expect(screen.getByText('Бодрое начало дня')).toBeInTheDocument();
    });
  });

  it('отображает кнопку "Начать тренировку"', async () => {
    const mockWorkout = {
      id: '1',
      name: 'Утренняя зарядка',
      description: 'Бодрое начало дня',
      duration: 30,
      exercises: [
        { id: '1', name: 'Отжимания', sets: 3, reps: 15, safetyTip: 'Держите спину прямой' },
      ],
    };

    (getWorkoutById as ReturnType<typeof vi.fn>).mockResolvedValue(mockWorkout);

    renderWorkoutPage('1', mockUser);

    await waitFor(() => {
      expect(
        screen.getByText('Начать тренировку')
      ).toBeInTheDocument();
    });
  });

  it('отображает ошибку, если тренировка не найдена', async () => {
    (getWorkoutById as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Not Found')
    );

    renderWorkoutPage('999', mockUser);

    await waitFor(() => {
      expect(
        screen.getByText(/Не удалось загрузить тренировку/i)
      ).toBeInTheDocument();
    });
  });
});