/**
 * Timer Component
 * 
 * Таймер для отсчёта времени упражнения/отдыха.
 * Использует Date.now() для точности при throttle браузера (вкладки в фоне).
 * 
 * @param {Object} props
 * @param {number} props.durationSeconds - длительность таймера в секундах
 * @param {Function} [props.onComplete] - колбэк при завершении отсчёта
 * @param {boolean} [props.autoStart=false] - автоматический старт
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const Timer = ({ durationSeconds, onComplete, autoStart = false }) => {
  // Текущее оставшееся время
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  // Флаг: запущен ли таймер
  const [isRunning, setIsRunning] = useState(autoStart);
  
  // Ref для интервала (чтобы не пересоздавать при ререндерах)
  const intervalRef = useRef(null);
  // Ref для времени старта (Date.now())
  const startTimeRef = useRef(null);
  // Ref для времени на момент паузы
  const pausedTimeRef = useRef(durationSeconds);

  /**
   * Очистка интервала.
   * Безопасно вызывает clearInterval, если интервал существует.
   */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Запуск таймера.
   * Использует Date.now() для точности — даже если браузер throttlит
   * setInterval для фоновых вкладок, время считается корректно.
   */
  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = pausedTimeRef.current - elapsed;

      // Таймер завершён
      if (remaining <= 0) {
        clearTimer();
        setTimeLeft(0);
        setIsRunning(false);
        if (onComplete) {
          onComplete();
        }
        return;
      }

      setTimeLeft(remaining);
    }, 250); // 250ms для плавности, но без лишней нагрузки

    setIsRunning(true);
  }, [clearTimer, onComplete]);

  /**
   * Пауза таймера.
   * Сохраняет текущее оставшееся время в ref для возобновления.
   */
  const pause = useCallback(() => {
    pausedTimeRef.current = timeLeft;
    clearTimer();
    setIsRunning(false);
  }, [clearTimer, timeLeft]);

  /**
   * Сброс таймера к начальному значению.
   */
  const reset = useCallback(() => {
    clearTimer();
    pausedTimeRef.current = durationSeconds;
    setTimeLeft(durationSeconds);
    setIsRunning(false);
  }, [clearTimer, durationSeconds]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Прогресс в процентах (для кругового индикатора)
  const progress = durationSeconds > 0
    ? ((durationSeconds - timeLeft) / durationSeconds) * 100
    : 0;

  // Форматирование времени: MM:SS
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, '0');

  return (
    <div className="timer" role="timer" aria-label={`${minutes}:${seconds} remaining`}>
      {/* Круговой прогресс-бар (SVG) */}
      <svg className="timer__circle" viewBox="0 0 100 100">
        {/* Фоновый круг */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className="timer__track"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        {/* Круг прогресса */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className="timer__progress"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
          transform="rotate(-90 50 50)"
        />
      </svg>

      {/* Отображение времени */}
      <div className="timer__display">
        <span className="timer__time">{minutes}:{seconds}</span>
      </div>

      {/* Кнопки управления */}
      <div className="timer__controls">
        {isRunning ? (
          <button
            onClick={pause}
            aria-label="Pause timer"
            className="timer__btn timer__btn--pause"
          >
            ⏸ Пауза
          </button>
        ) : (
          <button
            onClick={start}
            aria-label="Start timer"
            className="timer__btn timer__btn--start"
          >
            ▶️ Старт
          </button>
        )}
        <button
          onClick={reset}
          aria-label="Reset timer"
          className="timer__btn timer__btn--reset"
        >
          🔄 Сброс
        </button>
      </div>
    </div>
  );
};

export default Timer;