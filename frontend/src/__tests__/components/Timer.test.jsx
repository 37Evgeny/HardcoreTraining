import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Timer from '../../components/Timer/Timer';

/**
 * Тесты для компонента Timer.
 * ИСПРАВЛЕНО: тест теперь использует корректные пропсы компонента:
 * - duration (вместо durationSeconds)
 * - showSettings (вместо autoStart)
 * - onComplete (оставлен, но проверяется корректно)
 */

describe('Timer Component', () => {
  beforeEach(() => {
    // Используем фейковые таймеры для контроля времени
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('отображает начальное время в формате MM:SS', () => {
    // ИСПРАВЛЕНО: используем duration вместо durationSeconds
    render(<Timer duration={60} showSettings={false} />);

    // Компонент отображает время в формате "MM:SS"
    // Проверяем, что на странице есть текст с временем
    expect(screen.getByText(/01:00/)).toBeInTheDocument();
  });

  it('отображает переданное количество минут', () => {
    // ИСПРАВЛЕНО: duration=120 означает 2 минуты
    render(<Timer duration={120} showSettings={false} />);

    expect(screen.getByText(/02:00/)).toBeInTheDocument();
  });

  it('вызывает onComplete по истечении времени', () => {
    const onCompleteMock = vi.fn();

    // ИСПРАВЛЕНО: используем корректные пропсы
    render(
      <Timer duration={1} showSettings={false} onComplete={onCompleteMock} />
    );

    // Запускаем таймер на 1 секунду + небольшой запас
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onComplete до истечения времени', () => {
    const onCompleteMock = vi.fn();

    render(
      <Timer duration={10} showSettings={false} onComplete={onCompleteMock} />
    );

    // Прошло меньше времени, чем duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onCompleteMock).not.toHaveBeenCalled();
  });

  it('обновляет отображаемое время каждую секунду', () => {
    render(<Timer duration={5} showSettings={false} />);

    // Изначально 00:05
    expect(screen.getByText(/00:05/)).toBeInTheDocument();

    // Прошла 1 секунда
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/00:04/)).toBeInTheDocument();
  });

  it('отображает 00:00 когда время истекло', () => {
    render(<Timer duration={1} showSettings={false} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });
});