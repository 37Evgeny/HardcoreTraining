// frontend/src/__tests__/components/Timer.test.jsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Timer from '../../components/Timer';

describe('Timer Component', () => {
  beforeEach(() => {
    // ✅ toFake: ['Date'] больше не нужен — используем performance.now()
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('должен отображать начальное время', () => {
    render(<Timer durationSeconds={60} />);
    expect(screen.getByLabelText('01:00 remaining')).toBeInTheDocument();
  });

  it('должен запускать отсчёт при нажатии на кнопку "Старт"', () => {
    render(<Timer durationSeconds={10} />);

    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));

    // ✅ Оборачиваем advanceTimersByTime в act(), чтобы React узнал о setTimeLeft
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByLabelText('00:05 remaining')).toBeInTheDocument();
  });

  it('должен ставить таймер на паузу при нажатии на "Пауза"', () => {
    render(<Timer durationSeconds={10} />);

    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.click(screen.getByRole('button', { name: /pause timer/i }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByLabelText('00:07 remaining')).toBeInTheDocument();
  });

  it('должен вызывать onComplete при достижении нуля', () => {
    const onComplete = vi.fn();
    render(<Timer durationSeconds={3} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('должен сбрасывать таймер при нажатии на "Сброс"', () => {
    render(<Timer durationSeconds={60} />);

    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    fireEvent.click(screen.getByRole('button', { name: /reset timer/i }));

    expect(screen.getByLabelText('01:00 remaining')).toBeInTheDocument();
  });

  it('должен автоматически запускаться при autoStart=true', () => {
    render(<Timer durationSeconds={5} autoStart={true} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByLabelText('00:03 remaining')).toBeInTheDocument();
  });
});