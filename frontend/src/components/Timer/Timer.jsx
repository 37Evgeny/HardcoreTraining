import { useCallback, useEffect, useRef, useState } from 'react';
import './Timer.css';

/**
 * Timer — SVG-таймер с точным отсчётом на основе Date.now().
 *
 * @param {number}   duration      - длительность в секундах (default 60)
 * @param {Function} onComplete    - колбэк при завершении
 * @param {boolean}  showSettings  - показывать ли настройку длительности
 */
function Timer({ duration: initialDuration = 60, onComplete, showSettings = false }) {
  const [duration, setDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [inputValue, setInputValue] = useState(String(initialDuration));

  // Refs
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);          // requestAnimationFrame id
  const endTimeRef = useRef(0);         // момент окончания (timestamp)
  const onCompleteRef = useRef(onComplete);

  // Синхронизация ref с пропсом (защита от stale closure)
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.warn('AudioContext не доступен:', err.message);
    }
  }, [getAudioContext]);

  const vibrate = useCallback(() => {
    try {
      if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
    } catch { /* вибрация не поддерживается */ }
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setTimeLeft(duration);
    setStatus('idle');
  }, [duration]);

  /**
   * Точный тик: вычисляем оставшееся время из разницы timestamps.
   * Это устраняет дрейф setInterval.
   */
  const tick = useCallback(() => {
    const remainingMs = endTimeRef.current - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    setTimeLeft(remainingSec);

    if (remainingMs <= 0) {
      // Завершение
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setStatus('idle');
      playBeep();
      vibrate();
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }
    // Продолжаем цикл анимации
    rafRef.current = requestAnimationFrame(tick);
  }, [playBeep, vibrate]);

  const start = useCallback(() => {
    if (timeLeft <= 0) { reset(); return; }
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setStatus('running');
  }, [timeLeft, reset]);

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (timeLeft > 0) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setStatus('running');
    }
  }, [timeLeft]);

  // Запуск/остановка цикла анимации при смене статуса
  useEffect(() => {
    if (status === 'running') {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [status, tick]);

  const handleDurationChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 10 && num <= 300) {
      setDuration(num);
      setTimeLeft(num);
      setStatus('idle');
    }
  }, []);

  // Валидация при потере фокуса (если введено невалидное число — откат)
  const handleDurationBlur = useCallback(() => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 10 || num > 300) {
      setInputValue(String(duration));
    }
  }, [inputValue, duration]);

  const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;

  const getTimerColor = () => {
    if (timeLeft <= 10) return '#e63946';
    if (timeLeft <= 30) return '#e9c46a';
    return '#2a9d8f';
  };

  const timerColor = getTimerColor();
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="timer-container">
      <div className={`timer-circle ${timeLeft <= 10 && status === 'running' ? 'timer-pulse' : ''}`}>
        <svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label={`Осталось ${timeLeft} секунд`}>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle
            cx="110" cy="110" r={radius}
            fill="none"
            stroke={timerColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 110 110)"
            style={{
              transition: 'stroke-dashoffset 0.3s linear, stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${timerColor}40)`,
            }}
          />
          <text x="110" y="110" textAnchor="middle" dominantBaseline="central"
            fill="var(--color-text)" fontSize="3rem" fontWeight="bold">
            {timeLeft}
          </text>
          <text x="110" y="140" textAnchor="middle" dominantBaseline="central"
            fill="var(--color-text-muted)" fontSize="0.9rem">
            сек
          </text>
        </svg>
      </div>

      {showSettings && (
        <div className="timer-settings">
          <label htmlFor="timer-duration">Длительность (сек):</label>
          <input
            id="timer-duration"
            type="number"
            min="10"
            max="300"
            value={inputValue}
            onChange={handleDurationChange}
            onBlur={handleDurationBlur}
            disabled={status === 'running'}
          />
        </div>
      )}

      <div className="timer-controls">
        {status === 'idle' && (
          <button type="button" className="btn btn-success" onClick={start}>▶ Старт</button>
        )}
        {status === 'running' && (
          <button type="button" className="btn btn-secondary" onClick={pause}>⏸ Пауза</button>
        )}
        {status === 'paused' && (
          <>
            <button type="button" className="btn btn-success" onClick={resume}>▶ Продолжить</button>
            <button type="button" className="btn btn-secondary" onClick={reset}>↺ Сброс</button>
          </>
        )}
        {(status === 'running' || status === 'paused') && (
          <button type="button" className="btn btn-danger" onClick={reset}>■ Стоп</button>
        )}
      </div>
    </div>
  );
}

export default Timer;