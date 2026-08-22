import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard';
import Loader from '../../components/Loader/Loader';
import Timer from '../../components/Timer/Timer';
import { useAuth } from '../../context/AuthContext';
import {
  cancelSession,
  finishSession,
  getWorkoutById,
  startSession,
  updateSessionProgress,
} from '../../services/api';
import './WorkoutPage.css';

const WorkoutPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  // Активная сессия из ответа на 409 (для модального окна восстановления)
  const [activeSessionConflict, setActiveSessionConflict] = useState(null);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const data = await getWorkoutById(id);
        setWorkout(data);
      } catch (err) {
        console.error('Ошибка загрузки тренировки:', err);
        setError('Не удалось загрузить тренировку.');
      } finally {
        setLoading(false);
      }
    };
    loadWorkout();
  }, [id]);

  /**
   * Начало сессии.
   * При 409 (уже есть активная сессия) показываем модальное окно восстановления.
   */
  const handleStartSession = useCallback(async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const session = await startSession({ workoutId: id });
      setSessionId(session.id);
      setCurrentExerciseIndex(0);
    } catch (err) {
      // 409 — уже есть активная сессия: предлагаем восстановление
      if (err.response?.status === 409 && err.response?.data?.data?.activeSession) {
        setActiveSessionConflict(err.response.data.data.activeSession);
        return;
      }
      console.error('Ошибка начала сессии:', err);
      setError('Не удалось начать тренировку.');
    }
  }, [id, user, navigate]);

  /**
   * Продолжить существующую активную сессию.
   * Восстанавливает тренировку и возвращает на сохранённое упражнение.
   */
  const handleResumeSession = useCallback(() => {
    if (!activeSessionConflict) return;
    setWorkout(activeSessionConflict.workout);
    setSessionId(activeSessionConflict.id);
    // Возвращаемся на то упражнение, где остановился пользователь
    setCurrentExerciseIndex(activeSessionConflict.currentExerciseIndex ?? 0);
    setActiveSessionConflict(null);
  }, [activeSessionConflict]);

  /**
   * Отменить зависшую сессию и начать новую с нуля.
   */
  const handleDiscardAndRestart = useCallback(async () => {
    if (!activeSessionConflict) return;
    try {
      await cancelSession(activeSessionConflict.id);
      setActiveSessionConflict(null);
      await handleStartSession();
    } catch (err) {
      console.error('Ошибка отмены сессии:', err);
      setError('Не удалось отменить предыдущую тренировку.');
    }
  }, [activeSessionConflict, handleStartSession]);

  /**
   * Завершение сессии (досрочно или после последнего упражнения).
   */
  const handleFinishSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await finishSession(sessionId);
      setSessionFinished(true);
    } catch (err) {
      console.error('Ошибка завершения сессии:', err);
      setError('Не удалось завершить тренировку.');
    }
  }, [sessionId]);

  /**
   * Переход к следующему упражнению.
   * Сохраняет прогресс в БД, чтобы «Продолжить» возвращало на то же упражнение.
   */
  const handleNextExercise = useCallback(async () => {
    if (!sessionId) return;

    const nextIndex = currentExerciseIndex + 1;

    // Дошли до конца — завершаем тренировку
    if (nextIndex >= workout.exercises.length) {
      await handleFinishSession();
      return;
    }

    setCurrentExerciseIndex(nextIndex);

    // Сохраняем прогресс (fire-and-forget с логированием ошибок)
    try {
      await updateSessionProgress(sessionId, nextIndex);
    } catch (err) {
      console.error('Не удалось сохранить прогресс:', err);
    }
  }, [sessionId, currentExerciseIndex, workout, handleFinishSession]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!workout) return <ErrorMessage message="Тренировка не найдена" />;

  if (sessionFinished) {
    return (
      <div className="workout-page">
        <h1 className="workout-page__title">Тренировка завершена!</h1>
        <p className="workout-page__description">Отличная работа! Вы прошли «{workout.title}».</p>
        <button type="button" onClick={() => navigate('/workouts')} className="btn btn--primary">
          К списку тренировок
        </button>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="workout-page">
      <h1 className="workout-page__title">{workout.title}</h1>
      <p className="workout-page__description">{workout.description}</p>

      {!sessionId ? (
        <button type="button" onClick={handleStartSession} className="btn btn--primary workout-page__start-btn">
          Начать тренировку
        </button>
      ) : (
        <div className="workout-page__session">
          <Timer
            duration={workout.durationMinutes || 60}
            showSettings={false}
            onComplete={handleNextExercise}
          />
          {currentExercise && (
            <ExerciseCard
              key={currentExercise.id}
              exercise={currentExercise}
              exerciseNumber={currentExerciseIndex + 1}
              totalExercises={workout.exercises.length}
            />
          )}
          <div className="workout-page__actions">
            <button type="button" onClick={handleNextExercise} className="btn btn--primary">
              {currentExerciseIndex < workout.exercises.length - 1
                ? 'Следующее упражнение'
                : 'Завершить тренировку'}
            </button>
            <button type="button" onClick={handleFinishSession} className="btn btn--secondary">
              Завершить досрочно
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно: восстановление активной сессии */}
      {activeSessionConflict && (
        <div className="workout-page__modal-overlay" role="dialog" aria-modal="true">
          <div className="workout-page__modal">
            <h2>Незавершённая тренировка</h2>
            <p>
              У вас есть активная тренировка «{activeSessionConflict.workout?.title}».
              Вы остановились на упражнении{' '}
              {(activeSessionConflict.currentExerciseIndex ?? 0) + 1} из{' '}
              {activeSessionConflict.workout?.exercises?.length ?? '?'}.
            </p>
            <div className="workout-page__modal-actions">
              <button type="button" onClick={handleResumeSession} className="btn btn--primary">
                Продолжить
              </button>
              <button type="button" onClick={handleDiscardAndRestart} className="btn btn--secondary">
                Отменить и начать заново
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;