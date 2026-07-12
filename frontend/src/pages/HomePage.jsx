import { useEffect, useState } from 'react';
import SafetyModal from '../components/SafetyModal/SafetyModal';
import WorkoutCard from '../components/WorkoutCard/WorkoutCard';
import WorkoutModal from '../components/WorkoutModal/WorkoutModal';
import { getWorkouts } from '../services/api';
import './HomePage.css';

const LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

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
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showSafety, setShowSafety] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Загружаем тренировки с сервера с учётом фильтра и пагинации.
   * Лимит 50 — чтобы все 30 тренировок поместились на одной странице.
   */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = { limit: 50 };
    if (activeLevel !== 'ALL') {
      params.level = activeLevel;
    }

    getWorkouts(params)
      .then(res => {
        if (res.data.success) {
          setWorkouts(res.data.data);
          setTotalPages(res.data.pagination?.totalPages || 1);
        } else {
          setError('Ошибка загрузки данных');
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить тренировки. Проверьте соединение с сервером.');
      })
      .finally(() => setLoading(false));
  }, [activeLevel, page]);

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
      'ADVANCED': 'Продвинутый'
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

      {/* Фильтр по уровню */}
      <div className="level-filter">
        {LEVELS.map(level => (
          <button
            key={level}
            className={`filter-btn ${activeLevel === level ? 'active' : ''}`}
            onClick={() => {
              setActiveLevel(level);
              setPage(1); // Сбрасываем на первую страницу при смене фильтра
            }}
          >
            {level === 'ALL' ? '🏁 Все' : levelLabel(level)}
          </button>
        ))}
      </div>

      {/* Счётчик тренировок */}
      <p style={{
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--text-sm)',
        marginBottom: '20px',
      }}>
        Найдено тренировок: <strong>{workouts.length}</strong>
      </p>

      {/* Сетка карточек */}
      <div className="card-grid">
        {workouts.length === 0 ? (
          <p className="empty-message">Нет тренировок для выбранного уровня</p>
        ) : (
          workouts.map(w => (
            <WorkoutCard
              key={w.id}
              workout={w}
              icon={getIcon(w.title)}
              levelLabel={levelLabel(w.level)}
              onClick={() => handleCardClick(w)}
            />
          ))
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="pagination" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '30px',
          marginBottom: '40px',
        }}>
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Назад
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`btn ${page === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPage(p)}
              style={{ minWidth: '40px' }}
            >
              {p}
            </button>
          ))}

          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Вперед →
          </button>
        </div>
      )}

      {/* Модалка с деталями тренировки */}
      {selectedWorkout && !showSafety && (
        <WorkoutModal
          workout={selectedWorkout}
          icon={getIcon(selectedWorkout.title)}
          levelLabel={levelLabel(selectedWorkout.level)}
          onClose={() => setSelectedWorkout(null)}
          onStart={handleStartFromModal}
        />
      )}

      {/* Модалка безопасности */}
      {showSafety && (
        <SafetyModal
          workout={selectedWorkout}
          onAccept={handleAcceptSafety}
          onClose={() => {
            setShowSafety(false);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;