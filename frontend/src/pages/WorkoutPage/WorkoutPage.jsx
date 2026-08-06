import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// ИСПРАВЛЕНО: импортируем из существующего services/api
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard';
import Loader from '../../components/Loader/Loader';
import Timer from '../../components/Timer/Timer';
import {
  finishSession,
  getWorkoutById,
  startSession,
} from '../../services/api';
import './WorkoutPage.css';

/**
 * WorkoutPage — страница детального просмотра и выполнения тренировки.
 * @returns {JSX.Element}
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
   * Загружает данные тренировки по ID из URL.
   */
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getWorkoutById(id);
        if (!data) {
          throw new Error('Тренировка не найдена');
        }
        setWorkout(data);
      } catch (err) {
        console.error('Ошибка загрузки тренировки:', err);
        setError(
          err.response?.data?.message ||
            'Не удалось загрузить тренировку. Попробуйте позже.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  /**
   * Начинает новую сессию тренировки.
   */
  const handleStartSession = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const session = await startSession(id);
      setSessionId(session.id);
      setCurrentExerciseIndex(0);
    } catch (err) {
      console.error('Ошибка начала сессии:', err);
      setError('Не удалось начать тренировку.');
    }
  }, [id, user, navigate]);

  /**
   * Завершает текущую сессию тренировки.
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

  /**
   * Переход к следующему упражнению.
   */
  const handleNextExercise = useCallback(() => {
    if (!workout) return;

    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // Все упражнения выполнены
      handleFinishSession();
    }
  }, [workout, currentExerciseIndex, handleFinishSession]);

  // Состояние загрузки
  if (loading) {
    return <Loader />;
  }

  // Состояние ошибки
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  // Тренировка не найдена
  if (!workout) {
    return <ErrorMessage message="Тренировка не найдена" />;
  }

  // Сессия завершена
  if (sessionFinished) {
    return (
      <div className="workout-page__finished">
        <h2>🎉 Тренировка завершена!</h2>
        <p>Отличная работа! Вы выполнили все упражнения.</p>
        <button onClick={() => navigate('/')} className="btn btn--primary">
          Вернуться к списку
        </button>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="workout-page">
      <h1 className="workout-page__title">{workout.name}</h1>
      <p className="workout-page__description">{workout.description}</p>

      {!sessionId ? (
        <button
          onClick={handleStartSession}
          className="btn btn--primary workout-page__start-btn"
        >
          Начать тренировку
        </button>
      ) : (
        <div className="workout-page__session">
          <Timer
            duration={workout.duration || 60}
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
            <button
              onClick={handleNextExercise}
              className="btn btn--primary"
            >
              {currentExerciseIndex < workout.exercises.length - 1
                ? 'Следующее упражнение'
                : 'Завершить тренировку'}
            </button>
            <button
              onClick={handleFinishSession}
              className="btn btn--secondary"
            >
              Завершить досрочно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;