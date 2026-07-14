// frontend/src/__tests__/components/Timer.test.jsx
// Unit-тесты для компонента Timer

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Timer from '../../components/Timer';

describe('Timer Component', () => {
  beforeEach(() => {
    // Сбрасываем таймеры перед каждым тестом
    vi.useFakeTimers();
  });

  it('should render with initial time', () => {
    render(<Timer initialSeconds={60} />);

    // Проверяем, что отображается начальное время
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('should start countdown on play button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer initialSeconds={10} />);

    // Нажимаем кнопку старта
    const startButton = screen.getByRole('button', { name: /start|play/i });
    await user.click(startButton);

    // Продвигаем время на 5 секунд
    vi.advanceTimersByTime(5000);

    // Проверяем, что время уменьшилось
    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('should pause countdown on pause button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer initialSeconds={10} />);

    // Стартуем таймер
    const startButton = screen.getByRole('button', { name: /start|play/i });
    await user.click(startButton);

    // Продвигаем на 3 секунды
    vi.advanceTimersByTime(3000);

    // Пауза
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    // Продвигаем ещё на 3 секунды (таймер не должен измениться)
    vi.advanceTimersByTime(3000);

    // Время должно остаться 00:07
    expect(screen.getByText('00:07')).toBeInTheDocument();
  });

  it('should call onComplete callback when timer reaches zero', () => {
    const onComplete = vi.fn();
    render(<Timer initialSeconds={3} onComplete={onComplete} />);

    // Стартуем таймер
    fireEvent.click(screen.getByRole('button', { name: /start|play/i }));

    // Продвигаем на 3 секунды
    vi.advanceTimersByTime(3000);

    // Проверяем, что callback вызван
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should display 00:00 when timer reaches zero', () => {
    render(<Timer initialSeconds={1} />);

    fireEvent.click(screen.getByRole('button', { name: /start|play/i }));
    vi.advanceTimersByTime(1000);

    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('should reset timer on reset button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer initialSeconds={60} />);

    // Стартуем и продвигаем
    fireEvent.click(screen.getByRole('button', { name: /start|play/i }));
    vi.advanceTimersByTime(10000);

    // Сбрасываем
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Время должно вернуться к 01:00
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });
});