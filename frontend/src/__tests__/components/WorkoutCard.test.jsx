// frontend/src/__tests__/components/WorkoutCard.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
// ✅ Исправлено: путь к файлу внутри директории WorkoutCard/
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const mockWorkout = {
  id: 'w-1',
  title: 'Foundation Beginner',
  description: 'Базовая тренировка для начинающих',
  level: 'BEGINNER',
  durationMinutes: 30,
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
    // ✅ WorkoutCard ожидает пропсы: workout, icon, levelLabel, onClick
    renderWithRouter(
      <WorkoutCard
        workout={mockWorkout}
        icon="🏋️"
        levelLabel="Начальный"
        onClick={() => {}}
      />
    );
    expect(screen.getByText('Foundation Beginner')).toBeInTheDocument();
  });

  it('должен отображать уровень тренировки', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(
      <WorkoutCard
        workout={mockWorkout}
        icon="🏋️"
        levelLabel="Начальный"
        onClick={() => {}}
      />
    );
    expect(screen.getByText(/Начальный/i)).toBeInTheDocument();
  });

  it('должен отображать количество упражнений', () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRouter(
      <WorkoutCard
        workout={mockWorkout}
        icon="🏋️"
        levelLabel="Начальный"
        onClick={() => {}}
      />
    );
    // ✅ Исправлено: реальный формат — "🏋️ 3 упр."
    expect(screen.getByText(/3 упр/i)).toBeInTheDocument();
  });

  it('должен вызывать onClick при клике', () => {
    useAuth.mockReturnValue({ user: null });
    const handleClick = vi.fn();
    renderWithRouter(
      <WorkoutCard
        workout={mockWorkout}
        icon="🏋️"
        levelLabel="Начальный"
        onClick={handleClick}
      />
    );
    // ✅ Кликаем по карточке
    const card = screen.getByText('Foundation Beginner').closest('.workout-card');
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('должен обрезать длинное описание', () => {
    useAuth.mockReturnValue({ user: null });
    const longDescWorkout = {
      ...mockWorkout,
      description: 'A'.repeat(100),
    };
    renderWithRouter(
      <WorkoutCard
        workout={longDescWorkout}
        icon="🏋️"
        levelLabel="Начальный"
        onClick={() => {}}
      />
    );
    // ✅ Описание обрезается до 80 символов + '...'
    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
  });
});