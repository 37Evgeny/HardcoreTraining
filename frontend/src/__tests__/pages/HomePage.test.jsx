// frontend/src/__tests__/pages/HomePage.test.jsx
// Интеграционный тест для HomePage

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import HomePage from '../../pages/HomePage';

// Мокаем API функции
vi.mock('../../services/api', () => ({
  getWorkouts: vi.fn(),
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

describe('HomePage', () => {
  const mockWorkouts = [
    {
      id: '1',
      title: 'Beginner Full Body',
      level: 'BEGINNER',
      durationMinutes: 30,
      exercises: [],
    },
    {
      id: '2',
      title: 'Intermediate Strength',
      level: 'INTERMEDIATE',
      durationMinutes: 45,
      exercises: [],
    },
  ];

  const mockAuthContext = {
    user: { id: '1', email: 'test@test.com', name: 'Test', role: 'USER' },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <HomePage />
        </AuthContext.Provider>
      </BrowserRouter>,
    );
  };

  it('should show loading state initially', () => {
    const { getWorkouts } = require('../../services/api');
    getWorkouts.mockImplementation(() => new Promise(() => {}));
    renderHomePage();
    expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
  });

  it('should render workouts after loading', async () => {
    const { getWorkouts } = require('../../services/api');
    getWorkouts.mockResolvedValue({ data: { success: true, data: mockWorkouts } });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Beginner Full Body')).toBeInTheDocument();
      expect(screen.getByText('Intermediate Strength')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    const { getWorkouts } = require('../../services/api');
    getWorkouts.mockRejectedValue(new Error('Network Error'));
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Ошибка/i)).toBeInTheDocument();
    });
  });

  it('should filter workouts by level', async () => {
    const { getWorkouts } = require('../../services/api');
    getWorkouts.mockResolvedValue({ data: { success: true, data: mockWorkouts } });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Beginner Full Body')).toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /Начальный/i });
    fireEvent.click(filterButton);

    expect(screen.getByText('Beginner Full Body')).toBeInTheDocument();
    expect(screen.queryByText('Intermediate Strength')).not.toBeInTheDocument();
  });

  it('should show empty state when no workouts match filter', async () => {
    const { getWorkouts } = require('../../services/api');
    getWorkouts.mockResolvedValue({ data: { success: true, data: [] } });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Нет тренировок/i)).toBeInTheDocument();
    });
  });
});