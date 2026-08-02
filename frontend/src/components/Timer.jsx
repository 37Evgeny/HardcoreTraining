// frontend/src/components/Timer.jsx
import { useCallback, useEffect, useRef, useState } from 'react';

const Timer = ({ durationSeconds, onComplete, autoStart = false }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(durationSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    // ✅ Исправлено: performance.now() вместо Date.now()
    // performance.now() корректно мокается vi.useFakeTimers()
    // и advanceTimersByTime двигает его значение между тиками интервала
    startTimeRef.current = performance.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (performance.now() - startTimeRef.current) / 1000
      );
      const remaining = pausedTimeRef.current - elapsed;

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
    }, 250);

    setIsRunning(true);
  }, [clearTimer, onComplete]);

  const pause = useCallback(() => {
    pausedTimeRef.current = timeLeft;
    clearTimer();
    setIsRunning(false);
  }, [clearTimer, timeLeft]);

  const reset = useCallback(() => {
    clearTimer();
    pausedTimeRef.current = durationSeconds;
    setTimeLeft(durationSeconds);
    setIsRunning(false);
  }, [clearTimer, durationSeconds]);

  // ✅ Автостарт при монтировании
  useEffect(() => {
    if (autoStart) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress =
    durationSeconds > 0
      ? ((durationSeconds - timeLeft) / durationSeconds) * 100
      : 0;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="timer" role="timer" aria-label={`${minutes}:${seconds} remaining`}>
      <svg className="timer__circle" viewBox="0 0 100 100">
        <circle
          className="timer__track"
          cx="50"
          cy="50"
          fill="none"
          r="45"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        <circle
          className="timer__progress"
          cx="50"
          cy="50"
          fill="none"
          r="45"
          stroke="#4CAF50"
          strokeDasharray={2 * Math.PI * 45}
          strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
          strokeLinecap="round"
          strokeWidth="8"
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="timer__display">
        <span className="timer__time">
          {minutes}:{seconds}
        </span>
      </div>
      <div className="timer__controls">
        {!isRunning ? (
          <button
            className="timer__btn timer__btn--start"
            aria-label="Start timer"
            onClick={start}
          >
            ▶ Старт
          </button>
        ) : (
          <button
            className="timer__btn timer__btn--pause"
            aria-label="Pause timer"
            onClick={pause}
          >
            ⏸ Пауза
          </button>
        )}
        <button
          className="timer__btn timer__btn--reset"
          aria-label="Reset timer"
          onClick={reset}
        >
          🔄 Сброс
        </button>
      </div>
    </div>
  );
};

export default Timer;