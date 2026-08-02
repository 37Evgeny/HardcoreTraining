import { useCallback, useEffect, useRef, useState } from 'react';
import './Timer.css';

/**
 * SVG-таймер с поддержкой:
 * - Настройки длительности (10-300 сек)
 * - Звуковых уведомлений через Web Audio API
 * - Вибрации на мобильных устройствах
 * - Паузы/продолжения
 * - Цветовой индикации (зелёный → жёлтый → красный)
 */
function Timer({ duration: initialDuration = 60, onComplete, showSettings = false }) {
  // Длительность таймера в секундах
  const [duration, setDuration] = useState(initialDuration);
  // Оставшееся время в секундах
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  // Статус: 'idle' | 'running' | 'paused'
  const [status, setStatus] = useState('idle');
  // Поле ввода для настройки длительности
  const [inputValue, setInputValue] = useState(String(initialDuration));

  // Refs для звука и интервала
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Синхронизируем ref с пропсом, чтобы избежать stale closure
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /**
   * Инициализация AudioContext (ленивая — при первом использовании).
   * Нужна для воспроизведения звука без внешних файлов.
   */
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Воспроизведение звукового сигнала через Web Audio API.
   * Тройной сигнал: 660 Гц → 880 Гц → 1100 Гц.
   */
  const playBeep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Частота: 660 Гц (нота E5)
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);

      // Громкость
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.45);
    } catch (err) {
      // Тихий fallback, если AudioContext недоступен
      console.warn('AudioContext не доступен:', err.message);
    }
  }, [getAudioContext]);

  /**
   * Вибрация на мобильных устройствах.
   * Три коротких импульса по 100 мс с паузами.
   */
  const vibrate = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100]);
      }
    } catch {
      // Игнорируем, если вибрация не поддерживается
    }
  }, []);

  /**
   * Сброс таймера в начальное состояние.
   */
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(duration);
    setStatus('idle');
  }, [duration]);

  /**
   * Запуск таймера.
   */
  const start = useCallback(() => {
    if (timeLeft <= 0) {
      reset();
      return;
    }
    setStatus('running');
  }, [timeLeft, reset]);

  /**
   * Пауза таймера.
   */
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus('paused');
  }, []);

  /**
   * Продолжение таймера после паузы.
   */
  const resume = useCallback(() => {
    if (timeLeft > 0) {
      setStatus('running');
    }
  }, [timeLeft]);

  /**
   * Основной эффект: управление интервалом таймера.
   * Запускается при изменении статуса на 'running'.
   */
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Таймер завершён
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setStatus('idle');

            // Звук + вибрация
            playBeep();
            vibrate();

            // Колбэк завершения
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, playBeep, vibrate]);

  /**
   * Обработчик изменения длительности из поля ввода.
   * @param {Object} e - событие изменения
   */
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

  /**
   * Вычисление процента для SVG-кольца прогресса.
   */
  const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;

  /**
   * Определение цвета таймера в зависимости от оставшегося времени.
   * Зелёный (>30с) → Жёлтый (10-30с) → Красный (<10с)
   */
  const getTimerColor = () => {
    if (timeLeft <= 10) return '#e63946'; // Красный — критично
    if (timeLeft <= 30) return '#e9c46a'; // Жёлтый — предупреждение
    return '#2a9d8f'; // Зелёный — нормально
  };

  const timerColor = getTimerColor();

  // Параметры SVG-окружности
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="timer-container">
      {/* SVG-таймер */}
      <div className={`timer-circle ${timeLeft <= 10 && status === 'running' ? 'timer-pulse' : ''}`}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          {/* Фоновое кольцо */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Кольцо прогресса */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={timerColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 110 110)"
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${timerColor}40)`,
            }}
          />
          {/* Текст с оставшимся временем */}
          <text
            x="110"
            y="110"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-text)"
            fontSize="3rem"
            fontWeight="bold"
          >
            {timeLeft}
          </text>
          <text
            x="110"
            y="140"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-text-muted)"
            fontSize="0.9rem"
          >
            сек
          </text>
        </svg>
      </div>

      {/* Настройка длительности (опционально) */}
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
            disabled={status === 'running'}
          />
        </div>
      )}

      {/* Кнопки управления */}
      <div className="timer-controls">
        {status === 'idle' && (
          <button className="btn btn-success" onClick={start} type="button">
            ▶ Старт
          </button>
        )}
        {status === 'running' && (
          <button className="btn btn-secondary" onClick={pause} type="button">
            ⏸ Пауза
          </button>
        )}
        {status === 'paused' && (
          <>
            <button className="btn btn-success" onClick={resume} type="button">
              ▶ Продолжить
            </button>
            <button className="btn btn-secondary" onClick={reset} type="button">
              ↺ Сброс
            </button>
          </>
        )}
        {(status === 'running' || status === 'paused') && (
          <button className="btn btn-danger" onClick={reset} type="button">
            ■ Стоп
          </button>
        )}
      </div>
    </div>
  );
}

export default Timer;