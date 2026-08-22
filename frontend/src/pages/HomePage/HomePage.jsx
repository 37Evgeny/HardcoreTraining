import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import LevelFilterBar from '../../components/LevelFilterBar/LevelFilterBar';
import Loader from '../../components/Loader/Loader';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import { useAuth } from '../../context/AuthContext';
import { addFavorite, getFavorites, getWorkoutsPage, removeFavorite } from '../../services/api';
import './HomePage.css';

/** Размер страницы — совпадает с дефолтным limit на бэкенде. */
const PAGE_SIZE = 20;

/**
 * HomePage — главная страница со списком тренировок и избранным.
 * Реализована пагинация «Показать ещё»: подгружаем страницы по 20 тренировок.
 *
 * Фильтрация по уровню: уровень берётся из URL-параметра ?level=,
 * который проставляет LevelFilterBar. При смене уровня список
 * перезагружается с 1-й страницы.
 */
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Активный уровень из URL (?level=BEGINNER | INTERMEDIATE | ADVANCED).
  // Если параметра нет — undefined (показываем все тренировки).
  const level = searchParams.get('level') || undefined;

  const [workouts, setWorkouts] = useState([]);
  const [favorites, setFavorites] = useState([]); // массив ID избранных тренировок
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Загрузка первой страницы тренировок и избранного.
   * Зависит от user и level — при смене фильтра перезагружаем с 1-й страницы.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [workoutsData, favoritesData] = await Promise.all([
          getWorkoutsPage({ page: 1, limit: PAGE_SIZE, level }),
          user ? getFavorites() : Promise.resolve([]),
        ]);

        setWorkouts(workoutsData.data);
        setPage(1);
        setTotalPages(workoutsData.meta?.totalPages ?? 1);
        // Храним только ID избранных тренировок (единый формат)
        setFavorites(favoritesData.map((fav) => fav.id));
      } catch (err) {
        console.error('Ошибка загрузки данных HomePage:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить тренировки. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, level]);

  /**
   * Подгрузка следующей страницы тренировок (кнопка «Показать ещё»).
   * Учитывает текущий фильтр по уровню.
   */
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      setError(null);

      const workoutsData = await getWorkoutsPage({ page: nextPage, limit: PAGE_SIZE, level });

      // Дописываем новые тренировки к уже загруженным
      setWorkouts((prev) => [...prev, ...workoutsData.data]);
      setPage(nextPage);
      setTotalPages(workoutsData.meta?.totalPages ?? totalPages);
    } catch (err) {
      console.error('Ошибка подгрузки тренировок:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить ещё тренировки.');
    } finally {
      setLoadingMore(false);
    }
  }, [page, totalPages, loadingMore, level]);

  const isFavorite = useCallback(
    (workoutId) => favorites.includes(workoutId),
    [favorites]
  );

  /**
   * Переключение избранного.
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

      {/* Отдельная панель фильтрации по уровню под заголовком */}
      <LevelFilterBar />

      {workouts.length === 0 ? (
        <p className="home-page__empty">Пока нет доступных тренировок.</p>
      ) : (
        <>
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

          {page < totalPages && (
            <button
              type="button"
              className="btn btn-primary home-page__load-more"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Загрузка…' : 'Показать ещё'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;