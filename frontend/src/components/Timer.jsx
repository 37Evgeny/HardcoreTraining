// frontend/src/components/Timer/Timer.tsx

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  durationSeconds: number;
  onComplete: () => void;
  autoStart?: boolean;
}

type TimerPhase = 'exercise' | 'rest' | 'idle';

/**
 * Таймер на useRef + clearInterval при unmount.
 * Использует Date.now() вместо счётчика — точнее при throttle браузера.
 * Web Worker вариант — для фонового режима (телефон заблокирован).
 */
export const Timer = ({ durationSeconds, onComplete, autoStart = false }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(durationSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      const remaining = pausedTimeRef.current - elapsed;

      if (remaining <= 0) {
        clearTimer();
        setTimeLeft(0);
        setIsRunning(false);
        onComplete(); // Колбэк — переход к следующему упражнению
        return;
      }

      setTimeLeft(remaining);
    }, 250); // Обновляем каждые 250ms для плавности

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

  // Cleanup при unmount — главное исправление утечки
  useEffect(() => {
    if (autoStart) start();
    return clearTimer; // clearInterval при unmount
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = ((durationSeconds - timeLeft) / durationSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="timer" role="timer" aria-label={`${minutes}:${seconds} remaining`}>
      {/* Circular progress */}
      <svg className="timer__circle" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" className="timer__track" />
        <circle
          cx="50" cy="50" r="45"
          className="timer__progress"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
        />
      </svg>

      <div className="timer__display">
        <span className="timer__time">{minutes}:{seconds}</span>
      </div>

      <div className="timer__controls">
        {isRunning ? (
          <button onClick={pause} aria-label="Pause timer">⏸ Pause</button>
        ) : (
          <button onClick={start} aria-label="Start timer">▶️ Start</button>
        )}
        <button onClick={reset} aria-label="Reset timer">🔄 Reset</button>
      </div>
    </div>
  );
};
