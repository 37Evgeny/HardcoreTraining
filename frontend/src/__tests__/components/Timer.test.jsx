// frontend/src/__tests__/components/Timer.test.jsx
// Unit-тесты для компонента Timer

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Timer from '../../components/Timer';

describe('Timer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should render with initial time', () => {
    render(<Timer duration={60} />);
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('should start countdown on play button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer duration={10} />);

    const startButton = screen.getByRole('button', { name: /старт/i });
    await user.click(startButton);

    vi.advanceTimersByTime(5000);

    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('should pause countdown on pause button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer duration={10} />);

    const startButton = screen.getByRole('button', { name: /старт/i });
    await user.click(startButton);

    vi.advanceTimersByTime(3000);

    const pauseButton = screen.getByRole('button', { name: /пауза/i });
    await user.click(pauseButton);

    vi.advanceTimersByTime(3000);

    expect(screen.getByText('00:07')).toBeInTheDocument();
  });

  it('should call onEnd callback when timer reaches zero', () => {
    const onEnd = vi.fn();
    render(<Timer duration={3} onEnd={onEnd} />);

    fireEvent.click(screen.getByRole('button', { name: /старт/i }));
    vi.advanceTimersByTime(3000);

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('should display 00:00 when timer reaches zero', () => {
    render(<Timer duration={1} />);

    fireEvent.click(screen.getByRole('button', { name: /старт/i }));
    vi.advanceTimersByTime(1000);

    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('should reset timer on reset button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer duration={60} />);

    fireEvent.click(screen.getByRole('button', { name: /старт/i }));
    vi.advanceTimersByTime(10000);

    const resetButton = screen.getByRole('button', { name: /сброс/i });
    await user.click(resetButton);

    expect(screen.getByText('01:00')).toBeInTheDocument();
  });
});