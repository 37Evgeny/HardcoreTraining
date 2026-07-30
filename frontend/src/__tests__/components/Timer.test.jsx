/**
 * Timer Component Tests
 * 
 * Тестирует:
 * - Рендеринг с начальным временем
 * - Запуск и паузу таймера
 * - Вызов onComplete при завершении
 * - Сброс таймера
 */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Timer from '../../components/Timer';

describe('Timer Component', () => {
  // Сбрасываем fake timers перед каждым тестом
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('должен отображать начальное время в формате MM:SS', () => {
    render(<Timer durationSeconds={60} />);
    
    // Проверяем, что отображается "01:00"
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('должен запускать отсчёт при нажатии на кнопку "Старт"', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer durationSeconds={10} />);

    // Нажимаем кнопку старта
    const startButton = screen.getByRole('button', { name: /старт/i });
    await user.click(startButton);

    // Проматываем 5 секунд
    vi.advanceTimersByTime(5000);
    
    // Проверяем, что отображается "00:05"
    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('должен ставить таймер на паузу при нажатии на "Пауза"', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer durationSeconds={10} />);

    // Запускаем таймер
    await user.click(screen.getByRole('button', { name: /старт/i }));
    
    // Проматываем 3 секунды
    vi.advanceTimersByTime(3000);

    // Ставим на паузу
    await user.click(screen.getByRole('button', { name: /пауза/i }));
    
    // Проматываем ещё 3 секунды (таймер не должен измениться)
    vi.advanceTimersByTime(3000);

    // Проверяем, что время осталось 7 секунд (а не 4)
    expect(screen.getByText('00:07')).toBeInTheDocument();
  });

  it('должен вызывать onComplete при достижении нуля', () => {
    const onComplete = vi.fn();
    render(<Timer durationSeconds={3} onComplete={onComplete} />);

    // Запускаем таймер
    fireEvent.click(screen.getByRole('button', { name: /старт/i }));
    
    // Проматываем 3 секунды
    vi.advanceTimersByTime(3000);

    // Проверяем, что onComplete был вызван ровно 1 раз
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('должен сбрасывать таймер при нажатии на "Сброс"', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer durationSeconds={60} />);

    // Запускаем таймер
    fireEvent.click(screen.getByRole('button', { name: /старт/i }));
    
    // Проматываем 10 секунд
    vi.advanceTimersByTime(10000);

    // Нажимаем сброс
    await user.click(screen.getByRole('button', { name: /сброс/i }));
    
    // Проверяем, что время вернулось к "01:00"
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('должен автоматически запускаться при autoStart=true', () => {
    render(<Timer durationSeconds={5} autoStart={true} />);
    
    // Проматываем 2 секунды
    vi.advanceTimersByTime(2000);
    
    // Проверяем, что время изменилось (таймер работает)
    expect(screen.getByText('00:03')).toBeInTheDocument();
  });
});