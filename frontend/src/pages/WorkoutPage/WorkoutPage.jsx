import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard';
import Loader from '../../components/Loader/Loader';
import Timer from '../../components/Timer/Timer';
import { useAuth } from '../../context/AuthContext';
import { finishSession, getWorkoutById, startSession } from '../../services/api';
import './WorkoutPage.css';

/**
 * WorkoutPage — детальный просмотр и выполнение тренировки.
 */
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

  /**
   * Загрузка тренировки.
   * ИСПРАВЛЕНО: getWorkoutById возвращает данные напрямую (res.data.data).
   */
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkoutById(id);
        if (!data) throw new Error('Тренировка не найдена');
        setWorkout(data);
      } catch (err) {
        console.error('Ошибка загрузки тренировки:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить тренировку. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [id]);

  /**
   * Начало сессии.
   * ИСПРАВЛЕНО: startSession принимает { workoutId } и возвращает данные.
   */
  const handleStartSession = useCallback(async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const session = await startSession({ workoutId: id });
      setSessionId(session.id);
      setCurrentExerciseIndex(0);
    } catch (err) {
      console.error('Ошибка начала сессии:', err);
      setError('Не удалось начать тренировку.');
    }
  }, [id, user, navigate]);

  /**
   * Завершение сессии.
   */
  const handleFinishSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await finishSession(sessionId);
      setSessionFinished(true);
      setSessionId(null);
    } catch (err) {
      console.error('Ошибка завершения сессии:', err);
      setError('Не удалось завершить тренировку.');
    }
  }, [sessionId]);

  const handleNextExercise = useCallback(() => {
    if (!workout) return;
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      handleFinishSession();
    }
  }, [workout, currentExerciseIndex, handleFinishSession]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!workout) return <ErrorMessage message="Тренировка не найдена" />;

  if (sessionFinished) {
    return (
      <div className="workout-page__finished">
        <h2>🎉 Тренировка завершена!</h2>
        <p>Отличная работа! Вы выполнили все упражнения.</p>
        <button type="button" onClick={() => navigate('/')} className="btn btn--primary">
          Вернуться к списку
        </button>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="workout-page">
      {/* ИСПРАВЛЕНО: бэкенд возвращает title, а не name */}
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
    </div>
  );
};

export default WorkoutPage;