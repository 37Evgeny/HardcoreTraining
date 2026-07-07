
import React, { useState, useEffect } from 'react';

const Timer = ({ duration, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (onEnd) onEnd();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onEnd]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
        {formatTime(timeLeft)}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Пауза' : 'Старт'}
        </button>
        <button className="btn" onClick={() => { setIsRunning(false); setTimeLeft(duration); }}>
          Сброс
        </button>
      </div>
    </div>
  );
};

export default Timer;
