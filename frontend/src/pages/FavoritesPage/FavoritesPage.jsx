import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import { getFavorites, removeFavorite } from '../../services/api';
import './FavoritesPage.css';

/**
 * FavoritesPage — страница «Избранное».
 * Показывает только тренировки, добавленные пользователем в избранное.
 * Позволяет убрать тренировку из избранного прямо со страницы.
 *
 * Маршрут защищён ProtectedRoute — доступен только авторизованным.
 */
const FavoritesPage = () => {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]); // полные объекты тренировок
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка списка избранных тренировок при монтировании.
   */
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFavorites();
        setFavorites(data);
      } catch (err) {
        console.error('Ошибка загрузки избранного:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить избранное. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  /**
   * Удаление тренировки из избранного.
   * После успешного ответа убираем её из локального состояния.
   * @param {string} workoutId - ID тренировки
   */
  const handleRemove = useCallback(async (workoutId) => {
    try {
      await removeFavorite(workoutId);
      setFavorites((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (err) {
      console.error('Ошибка удаления из избранного:', err);
      setError('Не удалось удалить тренировку из избранного.');
    }
  }, []);

  /**
   * Переход к тренировке.
   */
  const handleWorkoutClick = useCallback(
    (workoutId) => navigate(`/workout/${workoutId}`),
    [navigate]
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="favorites-page">
      <h1 className="favorites-page__title">Избранные тренировки</h1>

      {favorites.length === 0 ? (
        <p className="favorites-page__empty">
          У вас пока нет избранных тренировок. Добавьте их с главной страницы, нажав на сердечко.
        </p>
      ) : (
        <div className="favorites-page__grid">
          {favorites.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isFavorite
              onToggleFavorite={() => handleRemove(workout.id)}
              onClick={() => handleWorkoutClick(workout.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;