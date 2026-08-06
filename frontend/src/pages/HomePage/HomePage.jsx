import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// ИСПРАВЛЕНО: импортируем из существующего services/api, а не из несуществующей api/
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import {
  addFavorite,
  getFavorites,
  getWorkouts,
  removeFavorite,
} from '../../services/api';
import './HomePage.css';

/**
 * HomePage — главная страница со списком тренировок и избранным.
 * @returns {JSX.Element}
 */
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загружает список тренировок и избранного при монтировании.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Параллельная загрузка тренировок и избранного
        const [workoutsRes, favoritesRes] = await Promise.all([
          getWorkouts(),
          user ? getFavorites() : Promise.resolve({ data: [] }),
        ]);

        setWorkouts(workoutsRes.data);
        setFavorites(favoritesRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных HomePage:', err);
        setError(
          err.response?.data?.message ||
            'Не удалось загрузить тренировки. Попробуйте позже.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  /**
   * Проверяет, находится ли тренировка в избранном.
   * @param {string} workoutId — ID тренировки
   * @returns {boolean}
   */
  const isFavorite = useCallback(
    (workoutId) => favorites.some((fav) => fav.workoutId === workoutId),
    [favorites]
  );

  /**
   * Обработчик добавления/удаления из избранного.
   * @param {string} workoutId — ID тренировки
   */
  const handleToggleFavorite = useCallback(
    async (workoutId) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        if (isFavorite(workoutId)) {
          const fav = favorites.find((f) => f.workoutId === workoutId);
          await removeFavorite(fav.id);
          setFavorites((prev) => prev.filter((f) => f.workoutId !== workoutId));
        } else {
          const newFavRes = await addFavorite(workoutId);
          setFavorites((prev) => [...prev, newFavRes.data]);
        }
      } catch (err) {
        console.error('Ошибка переключения избранного:', err);
        setError('Не удалось обновить избранное.');
      }
    },
    [user, favorites, isFavorite, navigate]
  );

  /**
   * Обработчик клика по карточке тренировки.
   * @param {string} workoutId — ID тренировки
   */
  const handleWorkoutClick = useCallback(
    (workoutId) => {
      navigate(`/workouts/${workoutId}`);
    },
    [navigate]
  );

  // Состояние загрузки
  if (loading) {
    return <Loader />;
  }

  // Состояние ошибки
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="home-page">
      <h1 className="home-page__title">Тренировки</h1>

      {workouts.length === 0 ? (
        <p className="home-page__empty">Пока нет доступных тренировок.</p>
      ) : (
        <div className="home-page__grid">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isFavorite={isFavorite(workout.id)}
              onToggleFavorite={() => handleToggleFavorite(workout.id)}
              onClick={() => handleWorkoutClick(workout.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;