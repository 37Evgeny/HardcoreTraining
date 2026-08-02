// frontend/src/__tests__/pages/HomePage.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '../../pages/HomePage';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  getWorkouts: vi.fn(),
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';
import { getFavorites, getWorkouts } from '../../services/api';

const renderHomePage = () => {
  return render(<BrowserRouter><HomePage /></BrowserRouter>);
};

const mockWorkouts = Array.from({ length: 6 }, (_, i) => ({
  id: `w-${i}`,
  title: `Workout ${i}`,
  level: i < 3 ? 'BEGINNER' : 'INTERMEDIATE',
  description: `Description ${i}`,
  durationMinutes: 30,
  exercises: [{ id: `e-${i}-1`, name: `Exercise ${i}`, sets: 3, reps: 10 }],
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}));

const mockResponse = {
  data: {
    success: true,
    data: mockWorkouts,
  },
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 'user-1' } });
    // ✅ getFavorites должен возвращать Promise, иначе HomePage падает с .then of undefined
    getFavorites.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });
  });

  it('должен отображать состояние загрузки', () => {
    getWorkouts.mockReturnValue(new Promise(() => {}));
    renderHomePage();
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('должен отображать список тренировок после загрузки', async () => {
    getWorkouts.mockResolvedValue(mockResponse);
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText('Workout 0')).toBeInTheDocument();
    });
    expect(screen.getByText('Workout 1')).toBeInTheDocument();
    expect(screen.getByText('Workout 5')).toBeInTheDocument();
  });

  it('должен отображать сообщение, если тренировок нет', async () => {
    getWorkouts.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText(/нет тренировок/i)).toBeInTheDocument();
    });
  });

  it('должен отображать ошибку при неудачной загрузке', async () => {
    getWorkouts.mockRejectedValue(new Error('Network Error'));
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText(/ошибка/i)).toBeInTheDocument();
    });
  });

  it('должен фильтровать тренировки по уровню', async () => {
    const user = userEvent.setup();
    getWorkouts.mockResolvedValue(mockResponse);
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Workout 0')).toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /начальный/i });
    await user.click(filterButton);

    await waitFor(() => {
      expect(getWorkouts).toHaveBeenCalledTimes(1);
      expect(getWorkouts).toHaveBeenCalledWith({ limit: 50 });
    });
  });
});