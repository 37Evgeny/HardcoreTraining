import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { finishSession, getWorkoutById, startSession } from '../services/api';

/**
 * Страница активной тренировки с таймером и переключением упражнений.
 */
const WorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | exercise | rest | completed
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  // Загружаем тренировку
  useEffect(() => {
    setLoading(true);
    getWorkoutById(id)
      .then((res) => {
        if (res.data.success) {
          setWorkout(res.data.data);
        }
      })
      .catch(() => setError('Не удалось загрузить тренировку'))
      .finally(() => setLoading(false));
  }, [id]);

  // Таймер
  useEffect(() => {
    if (timeLeft > 0 && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft, phase]);

  // Обработчик окончания таймера
  useEffect(() => {
    if (timeLeft === 0 && timerRef.current === null) {
      if (phase === 'exercise') {
        // Упражнение закончилось — переходим к отдыху или следующему
        handleExerciseEnd();
      } else if (phase === 'rest') {
        // Отдых закончился — переходим к следующему упражнению
        handleRestEnd();
      }
    }
  }, [timeLeft]);

  const handleStart = useCallback(async () => {
    try {
      const res = await startSession({ workoutId: id });
      if (res.data.success) {
        setSessionId(res.data.data.id);
        startExercise(0);
      }
    } catch (err) {
      console.error('Ошибка старта сессии:', err);
    }
  }, [id]);

  const startExercise = (index) => {
    if (!workout) return;
    const exercise = workout.exercises[index];
    if (!exercise) return;

    setCurrentExercise(index);
    setPhase('exercise');
    // Даём 60 секунд на упражнение (или можно сделать настраиваемым)
    setTimeLeft(60);
  };

  const handleExerciseEnd = () => {
    if (!workout) return;
    const nextIndex = currentExercise + 1;

    if (nextIndex < workout.exercises.length) {
      // Есть ещё упражнения — отдых
      const restSeconds = workout.exercises[currentExercise]?.restSeconds || 60;
      setPhase('rest');
      setTimeLeft(restSeconds);
    } else {
      // Все упражнения выполнены — завершаем тренировку
      handleFinish();
    }
  };

  const handleRestEnd = () => {
    const nextIndex = currentExercise + 1;
    startExercise(nextIndex);
  };

  const handleFinish = useCallback(async () => {
    if (!sessionId) return;
    try {
      await finishSession(sessionId);
      setPhase('completed');
    } catch (err) {
      console.error('Ошибка завершения сессии:', err);
    }
  }, [sessionId]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Загрузка тренировки...</p>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="container error-container">
        <h2>😕 Ошибка</h2>
        <p>{error || 'Тренировка не найдена'}</p>
        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Вернуться к списку
        </Link>
      </div>
    );
  }

  if (phase === 'completed') {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ marginBottom: '12px' }}>Тренировка завершена!</h2>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }}>
          {workout.title} — отличная работа!
        </p>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '30px' }}>
          Выполнено упражнений: {workout.exercises.length}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            🏠 На главную
          </Link>
          <Link to="/history" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            📋 История
          </Link>
        </div>
      </div>
    );
  }

  const exercise = workout.exercises[currentExercise];

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      {/* Прогресс */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          <span>{workout.title}</span>
          <span>{currentExercise + 1} / {workout.exercises.length}</span>
        </div>
        <div style={{
          height: '6px',
          background: 'var(--bg-input)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((currentExercise + (phase === 'rest' ? 0.5 : 0)) / workout.exercises.length) * 100}%`,
            background: 'var(--accent-red)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {phase === 'idle' ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2 style={{ marginBottom: '12px' }}>{workout.title}</h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Уровень: {workout.level === 'BEGINNER' ? 'Начальный' : workout.level === 'INTERMEDIATE' ? 'Средний' : 'Продвинутый'}
          </p>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Упражнений: {workout.exercises.length}
          </p>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '30px' }}>
            Длительность: ~{workout.durationMinutes} минут
          </p>
          <button className="btn btn-primary" onClick={handleStart} style={{ fontSize: '1.2rem', padding: '16px 40px' }}>
            🚀 Начать тренировку
          </button>
        </div>
      ) : phase === 'rest' ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😮‍💨</div>
          <h2 style={{ marginBottom: '16px' }}>Отдых</h2>
          <div style={{
            fontSize: '4rem',
            fontWeight: 700,
            color: 'var(--accent-red)',
            marginBottom: '16px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatTime(timeLeft)}
          </div>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Следующее: {workout.exercises[currentExercise + 1]?.name || 'Завершение'}
          </p>
        </div>
      ) : exercise ? (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>{exercise.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              {exercise.instructions}
            </p>
            {exercise.safetyTip && (
              <p style={{
                color: 'var(--accent-red)',
                fontSize: 'var(--text-sm)',
                padding: '10px 14px',
                background: 'var(--accent-red-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(231, 76, 60, 0.15)',
                marginBottom: '16px',
              }}>
                ⚠️ {exercise.safetyTip}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="card-tag">Подходы: {exercise.sets}</div>
              <div className="card-tag">Повторения: {exercise.reps}</div>
              <div className="card-tag">Отдых: {exercise.restSeconds} сек</div>
            </div>
          </div>

          {/* Таймер */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: 'var(--accent-red)',
              fontVariantNumeric: 'tabular-nums',
              marginBottom: '8px',
            }}>
              {formatTime(timeLeft)}
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              Время на упражнение
            </p>
          </div>

          {/* Кнопка "Готово" */}
          <button
            className="btn btn-primary"
            onClick={handleExerciseEnd}
            style={{ width: '100%', padding: '16px' }}
          >
            ✅ Упражнение выполнено
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default WorkoutPage;