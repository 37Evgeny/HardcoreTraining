import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionsApi } from '../../api/sessions';
import { workoutsApi } from '../../api/workouts';
import SafetyModal from '../../components/SafetyModal/SafetyModal';
import Timer from '../../components/Timer/Timer';
import './WorkoutPage.css';

/**
 * Страница выполнения тренировки.
 * Показывает список упражнений, таймер, прогресс выполнения.
 * Поддерживает авто-режим (автоматический переход к следующему упражнению).
 */
function WorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Состояния
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(true);
  const [isResting, setIsResting] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  /**
   * Загрузка данных тренировки при монтировании.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchWorkout = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await workoutsApi.getById(id);
        if (!cancelled) {
          setWorkout(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Не удалось загрузить тренировку');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWorkout();
    return () => { cancelled = true; };
  }, [id]);

  /**
   * Старт сессии тренировки.
   */
  const startSession = useCallback(async () => {
    try {
      const session = await sessionsApi.start(workout.id);
      setSessionId(session.id);
    } catch (err) {
      console.error('Ошибка старта сессии:', err);
    }
  }, [workout]);

  /**
   * Завершение сессии тренировки.
   */
  const finishSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await sessionsApi.finish(sessionId, {
        completedExercises: completedExercises.length,
        totalExercises: workout.exercises.length,
      });
    } catch (err) {
      console.error('Ошибка завершения сессии:', err);
    }
  }, [sessionId, completedExercises, workout]);

  /**
   * Завершение текущего упражнения.
   * Добавляет его в список выполненных и переходит к следующему.
   */
  const completeExercise = useCallback(() => {
    setCompletedExercises(prev => {
      if (prev.includes(currentExerciseIndex)) return prev;
      return [...prev, currentExerciseIndex];
    });

    if (currentExerciseIndex < (workout?.exercises?.length || 0) - 1) {
      if (autoMode) {
        // В авто-режиме показываем отдых
        setIsResting(true);
      } else {
        // В ручном режиме просто переходим к следующему
        setCurrentExerciseIndex(prev => prev + 1);
      }
    } else {
      // Тренировка завершена
      setIsFinished(true);
      finishSession();
    }
  }, [currentExerciseIndex, workout, autoMode, finishSession]);

  /**
   * Завершение фазы отдыха.
   */
  const completeRest = useCallback(() => {
    setIsResting(false);
    setCurrentExerciseIndex(prev => prev + 1);
  }, []);

  /**
   * Пропуск упражнения.
   */
  const skipExercise = useCallback(() => {
    if (currentExerciseIndex < (workout?.exercises?.length || 0) - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  }, [currentExerciseIndex, workout]);

  /**
   * Обработчик подтверждения SafetyModal.
   */
  const handleSafetyConfirm = useCallback(() => {
    setShowSafetyModal(false);
    startSession();
  }, [startSession]);

  /**
   * Прогресс выполнения в процентах.
   */
  const progressPercent = useMemo(() => {
    if (!workout?.exercises?.length) return 0;
    return (completedExercises.length / workout.exercises.length) * 100;
  }, [completedExercises, workout]);

  /**
   * Текущее упражнение.
   */
  const currentExercise = useMemo(() => {
    if (!workout?.exercises?.length) return null;
    return workout.exercises[currentExerciseIndex];
  }, [workout, currentExerciseIndex]);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="workout-page">
        <div className="workout-loading">
          <div className="spinner" />
          <p>Загрузка тренировки...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="workout-page">
        <div className="workout-error">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            ← Назад к тренировкам
          </button>
        </div>
      </div>
    );
  }

  // Тренировка не найдена
  if (!workout) {
    return (
      <div className="workout-page">
        <div className="workout-error">
          <h2>Тренировка не найдена</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            ← Назад к тренировкам
          </button>
        </div>
      </div>
    );
  }

  // Экран завершения тренировки
  if (isFinished) {
    return (
      <div className="workout-page">
        <div className="workout-finished animate-bounce-in">
          <div className="workout-finished-icon">🎉</div>
          <h2>Тренировка завершена!</h2>
          <p>
            Выполнено упражнений: {completedExercises.length} / {workout.exercises.length}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            ← К тренировкам
          </button>
        </div>
      </div>
    );
  }

  // Safety-модалка (показ перед началом)
  if (showSafetyModal) {
    return (
      <div className="workout-page">
        <SafetyModal onConfirm={handleSafetyConfirm} />
      </div>
    );
  }

  return (
    <div className="workout-page">
      <div className="workout-container">
        {/* Заголовок тренировки */}
        <div className="workout-header animate-fade-in-up">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            ← Назад
          </button>
          <div className="workout-header-info">
            <h1>{workout.name}</h1>
            <span className="workout-level">{workout.level}</span>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="workout-progress animate-fade-in-up">
          <div className="progress-header">
            <span>Прогресс</span>
            <span>{completedExercises.length} / {workout.exercises.length}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Точки-индикаторы упражнений */}
            {workout.exercises.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  completedExercises.includes(index) ? 'completed' : ''
                } ${index === currentExerciseIndex ? 'current' : ''}`}
                style={{ left: `${(index / (workout.exercises.length - 1)) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Фаза отдыха */}
        {isResting ? (
          <div className="workout-rest animate-fade-in-up">
            <div className="rest-icon animate-bounce-in">😮‍💨</div>
            <h2>Отдых</h2>
            <p>Передохни перед следующим упражнением</p>
            <Timer duration={30} onComplete={completeRest} />
          </div>
        ) : (
          <>
            {/* Текущее упражнение */}
            {currentExercise && (
              <div className="workout-exercise animate-fade-in-up" key={currentExerciseIndex}>
                <div className="exercise-header">
                  <span className="exercise-number">
                    Упражнение {currentExerciseIndex + 1} из {workout.exercises.length}
                  </span>
                </div>
                <h2 className="exercise-name">{currentExercise.name}</h2>
                {currentExercise.description && (
                  <p className="exercise-description">{currentExercise.description}</p>
                )}
                {currentExercise.reps && (
                  <p className="exercise-reps">Повторения: {currentExercise.reps}</p>
                )}
                {currentExercise.weight && (
                  <p className="exercise-weight">Вес: {currentExercise.weight} кг</p>
                )}

                {/* Таймер для упражнения */}
                <Timer
                  duration={currentExercise.duration || 60}
                  onComplete={completeExercise}
                  showSettings={true}
                />

                {/* Кнопки управления */}
                <div className="exercise-actions">
                  <button className="btn btn-secondary" onClick={skipExercise} type="button">
                    ⏭ Пропустить
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Переключатель авто-режима */}
        <div className="workout-auto-toggle animate-fade-in-up">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
            />
            <span className="toggle-text">Авто-режим (автоматический переход)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default WorkoutPage;