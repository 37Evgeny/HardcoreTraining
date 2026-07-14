// frontend/src/__tests__/pages/HomePage.test.jsx
// Интеграционный тест для HomePage

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import HomePage from '../../pages/HomePage';

// Мокаем API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../../services/api';

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
    user: { id: '1', email: 'test@test.com' },
    isAuthenticated: true,
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
    (api.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderHomePage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render workouts after loading', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockWorkouts } });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Beginner Full Body')).toBeInTheDocument();
      expect(screen.getByText('Intermediate Strength')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should filter workouts by level', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockWorkouts } });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Beginner Full Body')).toBeInTheDocument();
    });

    // Выбираем фильтр BEGINNER
    const filterButton = screen.getByRole('button', { name: /beginner/i });
    fireEvent.click(filterButton);

    // Проверяем, что отображается только BEGINNER тренировка
    expect(screen.getByText('Beginner Full Body')).toBeInTheDocument();
    expect(screen.queryByText('Intermediate Strength')).not.toBeInTheDocument();
  });

  it('should show empty state when no workouts match filter', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/no workouts/i)).toBeInTheDocument();
    });
  });
});