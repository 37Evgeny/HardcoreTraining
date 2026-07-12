import { useCallback, useEffect, useMemo, useState } from 'react';
import SafetyModal from '../components/SafetyModal/SafetyModal';
import WorkoutCard from '../components/WorkoutCard/WorkoutCard';
import WorkoutModal from '../components/WorkoutModal/WorkoutModal';
import { useAuth } from '../context/AuthContext';
import { addFavorite, getFavorites, getWorkouts, removeFavorite } from '../services/api';
import './HomePage.css';

const LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FAVORITES'];

const WORKOUT_ICONS = {
  'Основы маха гирей': '🏋️',
  'Поток для начинающих': '🌊',
  'Силовая база': '💪',
  'Кардио-взрыв': '🔥',
  'Мобильность и растяжка': '🧘',
  'Круговая для новичков': '🔄',
  'Махи на выносливость': '⚡',
  'Кор и стабильность': '🎯',
  'Жимовой день': '🏋️',
  'Финальный аккорд': '🎵',
  'Поток среднего уровня': '🌊',
  'Силовой микс': '💪',
  'Кардио-удар': '🔥',
  'Технический день': '🔧',
  'Круговая на выносливость': '🔄',
  'Работа с двумя гирями': '🏋️',
  'Лестница': '🪜',
  'Рывковый марафон': '🏃',
  'Табата с гирей': '⏱️',
  'Финальный рубеж': '🏁',
  'Грайндр — силовая выносливость': '⚙️',
  'Длинный цикл': '🔄',
  'Толчковый монстр': '👹',
  'Рывковая мощь': '💥',
  'Приседательный ад': '😈',
  'Жимовой предел': '🏔️',
  'Круговая экстрим': '☠️',
  'Марафон': '🏅',
  'Силовой максимум': '🏆',
  'Финальный босс': '👑',
};

const getIcon = (title) => {
  return WORKOUT_ICONS[title] || '🏋️';
};

const HomePage = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showSafety, setShowSafety] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLevel, setActiveLevel] = useState('ALL');

  // Загружаем тренировки
  useEffect(() => {
    setLoading(true);
    setError(null);

    getWorkouts({ limit: 50 })
      .then(res => {
        if (res.data.success) {
          setWorkouts(res.data.data);
        } else {
          setError('Ошибка загрузки данных');
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить тренировки.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Загружаем избранное (если пользователь авторизован)
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    getFavorites()
      .then(res => {
        if (res.data.success) {
          const ids = new Set(res.data.data.map(w => w.id));
          setFavoriteIds(ids);
        }
      })
      .catch(err => console.error('Ошибка загрузки избранного:', err));
  }, [user]);

  // Фильтрация
  const filteredWorkouts = useMemo(() => {
    if (activeLevel === 'ALL') return workouts;
    if (activeLevel === 'FAVORITES') {
      return workouts.filter(w => favoriteIds.has(w.id));
    }
    return workouts.filter(w => w.level === activeLevel);
  }, [workouts, activeLevel, favoriteIds]);

  // Обработчик избранного
  const handleToggleFavorite = useCallback(async (workoutId, e) => {
    e.stopPropagation();

    if (!user) {
      alert('Войдите в аккаунт, чтобы добавлять тренировки в избранное');
      return;
    }

    try {
      if (favoriteIds.has(workoutId)) {
        await removeFavorite(workoutId);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(workoutId);
          return next;
        });
      } else {
        await addFavorite(workoutId);
        setFavoriteIds(prev => new Set(prev).add(workoutId));
      }
    } catch (err) {
      console.error('Ошибка изменения избранного:', err);
    }
  }, [user, favoriteIds]);

  const handleCardClick = (workout) => {
    setSelectedWorkout(workout);
  };

  const handleStartFromModal = () => {
    setShowSafety(true);
  };

  const handleAcceptSafety = () => {
    setShowSafety(false);
    setSelectedWorkout(null);
  };

  const levelLabel = (level) => {
    const map = {
      'BEGINNER': 'Начальный',
      'INTERMEDIATE': 'Средний',
      'ADVANCED': 'Продвинутый',
      'FAVORITES': '⭐ Избранное',
    };
    return map[level] || level;
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Загрузка тренировок...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container error-container">
        <h2>😕 Ошибка</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🔥 Hardcore Training</h1>
        <p className="subtitle">Тренировки с гирей для любого уровня</p>
      </header>

      {/* Фильтр */}
      <div className="level-filter">
        {LEVELS.map(level => (
          <button
            key={level}
            className={`filter-btn ${activeLevel === level ? 'active' : ''}`}
            onClick={() => setActiveLevel(level)}
          >
            {level === 'ALL' ? '🏁 Все' : levelLabel(level)}
          </button>
        ))}
      </div>

      {/* Счётчик */}
      <p style={{
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--text-sm)',
        marginBottom: '20px',
      }}>
        {activeLevel === 'FAVORITES'
          ? `⭐ Избранное: ${filteredWorkouts.length} тренировок`
          : `Найдено тренировок: ${filteredWorkouts.length}`
        }
      </p>

      {/* Сетка карточек */}
      <div className="card-grid">
        {filteredWorkouts.length === 0 ? (
          <p className="empty-message">
            {activeLevel === 'FAVORITES'
              ? '⭐ У вас пока нет избранных тренировок. Нажмите на сердечко на карточке, чтобы добавить.'
              : 'Нет тренировок для выбранного уровня'
            }
          </p>
        ) : (
          filteredWorkouts.map(w => (
            <div key={w.id} style={{ position: 'relative' }}>
              <WorkoutCard
                workout={w}
                icon={getIcon(w.title)}
                levelLabel={levelLabel(w.level)}
                onClick={() => handleCardClick(w)}
              />
              {/* Кнопка избранного */}
              <button
                onClick={(e) => handleToggleFavorite(w.id, e)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                  transition: 'transform 0.2s ease',
                  transform: favoriteIds.has(w.id) ? 'scale(1.1)' : 'scale(1)',
                  filter: favoriteIds.has(w.id) ? 'none' : 'grayscale(1)',
                  opacity: favoriteIds.has(w.id) ? 1 : 0.5,
                }}
                title={favoriteIds.has(w.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                ❤️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Модалки */}
      {selectedWorkout && !showSafety && (
        <WorkoutModal
          workout={selectedWorkout}
          icon={getIcon(selectedWorkout.title)}
          levelLabel={levelLabel(selectedWorkout.level)}
          onClose={() => setSelectedWorkout(null)}
          onStart={handleStartFromModal}
        />
      )}

      {showSafety && (
        <SafetyModal
          workout={selectedWorkout}
          onAccept={handleAcceptSafety}
          onClose={() => setShowSafety(false)}
        />
      )}
    </div>
  );
};

export default HomePage;