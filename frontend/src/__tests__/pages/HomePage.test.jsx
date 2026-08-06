import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import HomePage from '../../pages/HomePage/HomePage';

/**
 * Мокаем API-сервис, который использует HomePage.
 * ИСПРАВЛЕНО: мокаем функции из '../../services/api', которые реально используются в HomePage.
 */
vi.mock('../../services/api', () => ({
  getWorkouts: vi.fn(),
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

// Импортируем моки для использования в тестах
import { getFavorites, getWorkouts } from '../../services/api';

/**
 * Мокаем AuthContext для тестов.
 */
const mockUser = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
};

const renderHomePage = (user = null) => {
  return render(
    <BrowserRouter>
      <AuthProvider initialUser={user}>
        <HomePage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает заголовок страницы', async () => {
    // Мокаем успешный ответ API
    (getWorkouts as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderHomePage(mockUser);

    // Ждём загрузки
    await waitFor(() => {
      expect(screen.getByText('Тренировки')).toBeInTheDocument();
    });
  });

  it('отображает сообщение, если тренировок нет', async () => {
    (getWorkouts as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderHomePage(mockUser);

    await waitFor(() => {
      expect(
        screen.getByText('Пока нет доступных тренировок.')
      ).toBeInTheDocument();
    });
  });

  it('отображает список тренировок', async () => {
    const mockWorkouts = [
      {
        id: '1',
        name: 'Утренняя зарядка',
        description: 'Бодрое начало дня',
        level: 'BEGINNER',
        duration: 30,
        icon: '🏃',
      },
      {
        id: '2',
        name: 'Силовая тренировка',
        description: 'Комплекс силовых упражнений',
        level: 'INTERMEDIATE',
        duration: 45,
        icon: '💪',
      },
    ];

    (getWorkouts as ReturnType<typeof vi.fn>).mockResolvedValue(mockWorkouts);
    (getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderHomePage(mockUser);

    await waitFor(() => {
      expect(screen.getByText('Утренняя зарядка')).toBeInTheDocument();
      expect(screen.getByText('Силовая тренировка')).toBeInTheDocument();
    });
  });

  it('отображает ошибку, если API вернул ошибку', async () => {
    (getWorkouts as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network Error')
    );
    (getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderHomePage(mockUser);

    await waitFor(() => {
      expect(
        screen.getByText(/Не удалось загрузить тренировки/i)
      ).toBeInTheDocument();
    });
  });
});