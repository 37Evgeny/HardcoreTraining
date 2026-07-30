// frontend/src/__tests__/components/WorkoutCard.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import WorkoutCard from '../../components/WorkoutCard';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

// Убираем TypeScript: (ui: React.ReactElement) => (ui)
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const mockWorkout = {
  id: 'w-1',
  title: 'Foundation Beginner',
  description: 'Базовая тренировка для начинающих',
  level: 'BEGINNER',
  exercises: [
    { id: 'e-1', name: 'Swing', sets: 3, reps: 10 },
    { id: 'e-2', name: 'Goblet Squat', sets: 3, reps: 8 },
    { id: 'e-3', name: 'Turkish Get-Up', sets: 2, reps: 3 },
  ],
  createdAt: '2024-01-01',
};

describe('WorkoutCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отображать заголовок тренировки', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(<WorkoutCard workout={mockWorkout} />);
    expect(screen.getByText('Foundation Beginner')).toBeInTheDocument();
  });

  it('должен отображать уровень тренировки', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(<WorkoutCard workout={mockWorkout} />);
    expect(screen.getByText(/BEGINNER/i)).toBeInTheDocument();
  });

  it('должен отображать количество упражнений', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(<WorkoutCard workout={mockWorkout} />);
    expect(screen.getByText(/3 exercises/i)).toBeInTheDocument();
  });

  it('должен содержать ссылку на страницу тренировки', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(<WorkoutCard workout={mockWorkout} />);
    const link = screen.getByRole('link', { name: /начать тренировку/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/workouts/w-1');
  });

  it('должен показывать кнопку избранного для авторизованных', () => {
    useAuth.mockReturnValue({ user: { id: 'user-1' } });
    renderWithRouter(<WorkoutCard workout={mockWorkout} />);
    expect(screen.getByRole('button', { name: /избранное/i })).toBeInTheDocument();
  });

  it('НЕ должен показывать кнопку избранного для неавторизованных', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(<WorkoutCard workout={mockWorkout} />);
    expect(
      screen.queryByRole('button', { name: /избранное/i })
    ).not.toBeInTheDocument();
  });
});