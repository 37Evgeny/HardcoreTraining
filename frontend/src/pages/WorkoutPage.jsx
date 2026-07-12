import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Timer from '../components/Timer';
import { finishSession, getWorkoutById, startSession } from '../services/api';

/**
 * Страница активной тренировки с таймером.
 */
const WorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getWorkoutById(id)
      .then((res) => {
        if (res.data.success) {
          setWorkout(res.data.data);
        }
      })
      .catch((err) => {
        setError('Не удалось загрузить тренировку');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = useCallback(async () => {
    try {
      const res = await startSession({ workoutId: id });
      if (res.data.success) {
        setSessionId(res.data.data.id);
      }
    } catch (err) {
      console.error('Ошибка старта сессии:', err);
    }
  }, [id]);

  const handleFinish = useCallback(async () => {
    if (!sessionId) return;
    try {
      await finishSession(sessionId);
      setIsCompleted(true);
    } catch (err) {
      console.error('Ошибка завершения сессии:', err);
    }
  }, [sessionId]);

  const handleExerciseEnd = useCallback(() => {
    if (!workout) return;
    const exercises = workout.exercises;
    if (currentExercise < exercises.length - 1) {
      setIsResting(true);
    } else {
      handleFinish();
    }
  }, [workout, currentExercise, handleFinish]);

  const handleRestEnd = useCallback(() => {
    setIsResting(false);
    setCurrentExercise((prev) => prev + 1);
  }, []);

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
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Вернуться к списку
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ marginBottom: '12px' }}>Тренировка завершена!</h2>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '30px' }}>
          {workout.title} — отличная работа!
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          🏠 На главную
        </button>
      </div>
    );
  }

  const exercise = workout.exercises[currentExercise];

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>{workout.title}</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Упражнение {currentExercise + 1} из {workout.exercises.length}
        </p>
      </div>

      {!sessionId ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Нажмите "Начать", чтобы запустить тренировку
          </p>
          <button className="btn btn-primary" onClick={handleStart}>
            🚀 Начать тренировку
          </button>
        </div>
      ) : isResting ? (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>😮‍💨 Отдых</h3>
          <Timer
            duration={exercise?.restSeconds || 60}
            onEnd={handleRestEnd}
          />
        </div>
      ) : exercise ? (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>{exercise.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
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
              }}>
                ⚠️ {exercise.safetyTip}
              </p>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div className="card-tag">Подходы: {exercise.sets}</div>
              <div className="card-tag">Повторения: {exercise.reps}</div>
              <div className="card-tag">Отдых: {exercise.restSeconds} сек</div>
            </div>
          </div>

          <Timer
            duration={60} // Можно заменить на расчетное время выполнения
            onEnd={handleExerciseEnd}
          />
        </div>
      ) : null}
    </div>
  );
};

export default WorkoutPage;