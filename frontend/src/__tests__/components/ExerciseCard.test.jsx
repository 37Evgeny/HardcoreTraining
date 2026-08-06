import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard';

/**
 * Тесты для компонента ExerciseCard.
 * ИСПРАВЛЕНО: тест использует поле safetyTip (вместо caution),
 * что соответствует пропсам компонента ExerciseCard.
 */

describe('ExerciseCard Component', () => {
  // ИСПРАВЛЕНО: используем safetyTip вместо caution
  const mockExercise = {
    id: '1',
    name: 'Отжимания',
    description: 'Классические отжимания от пола',
    sets: 3,
    reps: 15,
    safetyTip: 'Держите спину прямой, не прогибайтесь в пояснице',
    imageUrl: '/images/pushups.jpg',
  };

  it('отображает название упражнения', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        exerciseNumber={1}
        totalExercises={10}
      />
    );

    expect(screen.getByText('Отжимания')).toBeInTheDocument();
  });

  it('отображает количество подходов и повторений', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        exerciseNumber={1}
        totalExercises={10}
      />
    );

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('отображает совет по безопасности', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        exerciseNumber={1}
        totalExercises={10}
      />
    );

    // ИСПРАВЛЕНО: проверяем safetyTip
    expect(
      screen.getByText(
        'Держите спину прямой, не прогибайтесь в пояснице'
      )
    ).toBeInTheDocument();
  });

  it('отображает номер упражнения из общего количества', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        exerciseNumber={3}
        totalExercises={10}
      />
    );

    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('отображает изображение, если оно предоставлено', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        exerciseNumber={1}
        totalExercises={10}
      />
    );

    const image = screen.getByAltText('Отжимания');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/pushups.jpg');
  });

  it('не отображает изображение, если imageUrl отсутствует', () => {
    const exerciseWithoutImage = { ...mockExercise, imageUrl: undefined };

    render(
      <ExerciseCard
        exercise={exerciseWithoutImage}
        exerciseNumber={1}
        totalExercises={10}
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});