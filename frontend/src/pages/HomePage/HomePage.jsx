import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import { useAuth } from '../../context/AuthContext';
import { addFavorite, getFavorites, getWorkouts, removeFavorite } from '../../services/api';
import './HomePage.css';

/**
 * HomePage — главная страница со списком тренировок и избранным.
 */
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [favorites, setFavorites] = useState([]); // массив ID избранных тренировок
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка тренировок и избранного.
   * ИСПРАВЛЕНО: api.js теперь возвращает данные напрямую (res.data.data).
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [workoutsData, favoritesData] = await Promise.all([
          getWorkouts(),
          user ? getFavorites() : Promise.resolve([]),
        ]);

        setWorkouts(workoutsData);
        // ИСПРАВЛЕНО: храним только ID избранных тренировок (единый формат)
        setFavorites(favoritesData.map((fav) => fav.id));
      } catch (err) {
        console.error('Ошибка загрузки данных HomePage:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить тренировки. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isFavorite = useCallback(
    (workoutId) => favorites.includes(workoutId),
    [favorites]
  );

  /**
   * Переключение избранного.
   * ИСПРАВЛЕНО: removeFavorite/addFavorite принимают workoutId (не fav.id).
   */
  const handleToggleFavorite = useCallback(
    async (workoutId) => {
      if (!user) { navigate('/login'); return; }

      try {
        if (isFavorite(workoutId)) {
          await removeFavorite(workoutId);
          setFavorites((prev) => prev.filter((id) => id !== workoutId));
        } else {
          await addFavorite(workoutId);
          setFavorites((prev) => [...prev, workoutId]);
        }
      } catch (err) {
        console.error('Ошибка переключения избранного:', err);
        setError('Не удалось обновить избранное.');
      }
    },
    [user, favorites, isFavorite, navigate]
  );

  /**
   * Переход к тренировке.
   * ИСПРАВЛЕНО: маршрут /workout/:id (совпадает с App.jsx).
   */
  const handleWorkoutClick = useCallback(
    (workoutId) => navigate(`/workout/${workoutId}`),
    [navigate]
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

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