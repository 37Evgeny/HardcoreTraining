// frontend/src/__tests__/components/ExerciseCard.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExerciseCard from '../../components/ExerciseCard';

describe('ExerciseCard Component', () => {
  const mockExercise = {
    id: '1',
    name: 'Swings',
    description: 'Stand with feet shoulder-width apart...',
    sets: 3,
    reps: 15,
    restSeconds: 60,
    caution: 'Keep your back straight',
  };

  it('should render exercise name', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText('Swings')).toBeInTheDocument();
  });

  it('should render sets and reps', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    // Ищем по тексту с учётом вложенных элементов
    expect(screen.getByText(/Подходы:/)).toBeInTheDocument();
    expect(screen.getByText(/Повторения:/)).toBeInTheDocument();
  });

  it('should render rest time', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText(/Отдых:/)).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalExercise = {
      id: '2',
      name: 'Press',
      sets: 3,
      reps: 10,
      restSeconds: 90,
    };

    render(<ExerciseCard exercise={minimalExercise} />);
    expect(screen.getByText('Press')).toBeInTheDocument();
    expect(screen.getByText(/Отдых:/)).toBeInTheDocument();
  });
});