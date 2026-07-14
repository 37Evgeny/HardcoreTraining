// frontend/src/__tests__/components/ExerciseCard.test.jsx
// Unit-тесты для компонента ExerciseCard

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExerciseCard from '../../components/ExerciseCard';

describe('ExerciseCard Component', () => {
  const mockExercise = {
    id: '1',
    name: 'Swings',
    sets: 3,
    reps: 15,
    restSeconds: 60,
    instructions: 'Stand with feet shoulder-width apart...',
    safetyTip: 'Keep your back straight',
  };

  it('should render exercise name', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText('Swings')).toBeInTheDocument();
  });

  it('should render sets and reps', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText(/3 sets/i)).toBeInTheDocument();
    expect(screen.getByText(/15 reps/i)).toBeInTheDocument();
  });

  it('should render rest time', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText(/60s rest/i)).toBeInTheDocument();
  });

  it('should render instructions', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(
      screen.getByText(/Stand with feet shoulder-width apart/i),
    ).toBeInTheDocument();
  });

  it('should render safety tip when provided', () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText(/Keep your back straight/i)).toBeInTheDocument();
  });

  it('should not render safety tip section when not provided', () => {
    const exerciseWithoutTip = { ...mockExercise, safetyTip: undefined };
    render(<ExerciseCard exercise={exerciseWithoutTip} />);
    expect(screen.queryByText(/Safety Tip/i)).not.toBeInTheDocument();
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
    expect(screen.getByText(/90s rest/i)).toBeInTheDocument();
  });
});