import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesApi } from '../../api/favorites';
import { workoutsApi } from '../../api/workouts';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import WorkoutModal from '../../components/WorkoutModal/WorkoutModal';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

/**
 * Главная страница со списком тренировок.
 * Поддерживает фильтрацию по уровню сложности, поиск, избранное.
 * Карточки появляются с анимацией (card-animate).
 */
function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Состояния
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Загрузка списка тренировок при монтировании.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await workoutsApi.getAll();
        if (!cancelled) {
          setWorkouts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Не удалось загрузить тренировки');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWorkouts();
    return () => { cancelled = true; };
  }, []);

  /**
   * Загрузка избранного, если пользователь авторизован.
   */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchFavorites = async () => {
      try {
        const data = await favoritesApi.getAll();
        if (!cancelled) {
          setFavorites(data.map(fav => fav.workoutId));
        }
      } catch {
        // Игнорируем ошибку загрузки избранного
      }
    };

    fetchFavorites();
    return () => { cancelled = true; };
  }, [user]);

  /**
   * Переключение избранного.
   * @param {number} workoutId - ID тренировки
   */
  const toggleFavorite = useCallback(async (workoutId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (favorites.includes(workoutId)) {
        await favoritesApi.remove(workoutId);
        setFavorites(prev => prev.filter(id => id !== workoutId));
      } else {
        await favoritesApi.add(workoutId);
        setFavorites(prev => [...prev, workoutId]);
      }
    } catch (err) {
      console.error('Ошибка переключения избранного:', err);
    }
  }, [user, favorites, navigate]);

  /**
   * Открытие модалки с деталями тренировки.
   * @param {Object} workout - объект тренировки
   */
  const openModal = useCallback((workout) => {
    setSelectedWorkout(workout);
  }, []);

  /**
   * Закрытие модалки.
   */
  const closeModal = useCallback(() => {
    setSelectedWorkout(null);
  }, []);

  /**
   * Начать тренировку (переход на страницу тренировки).
   * @param {number} workoutId - ID тренировки
   */
  const startWorkout = useCallback((workoutId) => {
    navigate(`/workout/${workoutId}`);
  }, [navigate]);

  /**
   * Отфильтрованный и отсортированный список тренировок.
   */
  const filteredWorkouts = useMemo(() => {
    let result = [...workouts];

    // Фильтр по уровню
    if (filter !== 'all') {
      result = result.filter(w => w.level === filter);
    }

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(w =>
        w.name.toLowerCase().includes(query) ||
        (w.description && w.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [workouts, filter, searchQuery]);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="home-page">
        <div className="home-loading">
          <div className="spinner" />
          <p>Загрузка тренировок...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="home-page">
        <div className="home-error">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Заголовок */}
        <div className="home-header animate-fade-in-up">
          <h1>🏋️ Тренировки с гирей</h1>
          <p>Выбери программу и начни тренировку</p>
        </div>

        {/* Фильтры и поиск */}
        <div className="home-filters animate-fade-in-up">
          <div className="filter-buttons">
            {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                className={`btn btn-sm ${filter === level ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(level)}
                type="button"
              >
                {level === 'all' ? 'Все' :
                 level === 'beginner' ? 'Начальный' :
                 level === 'intermediate' ? 'Средний' : 'Продвинутый'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="🔍 Поиск тренировок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Список тренировок */}
        {filteredWorkouts.length === 0 ? (
          <div className="home-empty animate-fade-in-up">
            <p>Тренировки не найдены</p>
            {searchQuery && (
              <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
                Сбросить поиск
              </button>
            )}
          </div>
        ) : (
          <div className="workout-grid">
            {filteredWorkouts.map((workout, index) => (
              <div
                key={workout.id}
                className="card-animate"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <WorkoutCard
                  workout={workout}
                  isFavorite={favorites.includes(workout.id)}
                  onToggleFavorite={() => toggleFavorite(workout.id)}
                  onOpenModal={() => openModal(workout)}
                  onStartWorkout={() => startWorkout(workout.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Модалка с деталями тренировки */}
        {selectedWorkout && (
          <WorkoutModal
            workout={selectedWorkout}
            isFavorite={favorites.includes(selectedWorkout.id)}
            onToggleFavorite={() => toggleFavorite(selectedWorkout.id)}
            onClose={closeModal}
            onStartWorkout={() => startWorkout(selectedWorkout.id)}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;