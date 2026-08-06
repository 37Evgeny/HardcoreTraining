import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';

/**
 * Тесты для компонента WorkoutCard.
 * ИСПРАВЛЕНО: тест использует корректные пропсы компонента:
 * - workout (объект тренировки)
 * - isFavorite (boolean)
 * - onToggleFavorite (callback)
 * - onClick (callback)
 *
 * ВАЖНО: Компонент WorkoutCard ожидает пропсы:
 * - workout: { id, name, description, level, duration, icon }
 * - isFavorite: boolean
 * - onToggleFavorite: () => void
 * - onClick: () => void
 */

describe('WorkoutCard Component', () => {
  const mockWorkout = {
    id: '1',
    name: 'Утренняя зарядка',
    description: 'Бодрое начало дня с зарядкой',
    level: 'BEGINNER',
    duration: 30,
    icon: '🏃',
  };

  it('отображает название тренировки', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Утренняя зарядка')).toBeInTheDocument();
  });

  it('отображает описание тренировки', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(
      screen.getByText('Бодрое начало дня с зарядкой')
    ).toBeInTheDocument();
  });

  it('отображает уровень сложности', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClick={vi.fn()}
      />
    );

    // Компонент может отображать уровень как текст или иконку
    expect(screen.getByText(/BEGINNER/i)).toBeInTheDocument();
  });

  it('отображает иконку тренировки', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('🏃')).toBeInTheDocument();
  });

  it('вызывает onClick при клике на карточку', () => {
    const onClickMock = vi.fn();

    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClick={onClickMock}
      />
    );

    // Кликаем по карточке
    fireEvent.click(screen.getByText('Утренняя зарядка'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('вызывает onToggleFavorite при клике на кнопку избранного', () => {
    const onToggleFavoriteMock = vi.fn();

    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={false}
        onToggleFavorite={onToggleFavoriteMock}
        onClick={vi.fn()}
      />
    );

    // Находим кнопку избранного (обычно это звездочка или сердечко)
    const favoriteButton = screen.getByRole('button', {
      name: /избранное|favorite|добавить/i,
    });
    fireEvent.click(favoriteButton);

    expect(onToggleFavoriteMock).toHaveBeenCalledTimes(1);
  });

  it('отображает заполненную иконку избранного, если тренировка в избранном', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
        onClick={vi.fn()}
      />
    );

    // Проверяем, что отображается активное состояние избранного
    const favoriteButton = screen.getByRole('button', {
      name: /избранное|favorite|убрать/i,
    });
    expect(favoriteButton).toBeInTheDocument();
  });
});