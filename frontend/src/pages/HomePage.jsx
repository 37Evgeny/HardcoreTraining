import { useEffect, useMemo, useState } from 'react';
import SafetyModal from '../components/SafetyModal/SafetyModal';
import WorkoutCard from '../components/WorkoutCard/WorkoutCard';
import WorkoutModal from '../components/WorkoutModal/WorkoutModal';
import { getWorkouts } from '../services/api';
import './HomePage.css';

const LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const WORKOUT_ICONS = {
  'Simple & Sinister': '🎯',
  'Просто и Грозно (Simple & Sinister)': '🎯',
  'Минотавр 300': '🐂',
  'Armor Building Complex (ABC)': '🛡️',
  'Броневой комплекс (ABC)': '🛡️',
  'Dry Fighting Weight (DFW)': '⚔️',
  'Сухой боевой вес (DFW)': '⚔️',
  'The Giant': '🏔️',
  'Гигант (The Giant)': '🏔️',
  'Viking Warrior Conditioning': '⚡',
  'Кондиционирование викинга': '⚡',
  '10,000 Swing Challenge': '🔄',
  'Челлендж 10 000 махов': '🔄',
  'Right of Passage': '👑',
  'Обряд посвящения (Right of Passage)': '👑',
  'Kettlebell Muscle': '💪',
  'Гиревые мышцы (Kettlebell Muscle)': '💪',
  'Total Tension Complex': '🔗',
  'Комплекс полного напряжения': '🔗',
  'Program Minimum': '✅',
  'Минимальная программа (Program Minimum)': '✅',
  'The Wolf': '🐺',
  'Волк (The Wolf)': '🐺',
  'King Sized Killer': '💀',
  'Королевский убийца (King Sized Killer)': '💀',
  'Сибирский молот': '🔨',
  'Русский богатырь': '🦸',
  'Кремлёвский жим': '🏛️',
  'Медвежий комплекс (Bear Complex)': '🐻',
  'Пирамида (The Pyramid)': '🔺',
  'Тройной удар (Triple Threat)': '👊',
  'Ярославский рывок': '🌊',
  'Уральский молот': '⛏️',
  'Гиревая карусель': '🎠',
  'Богатырские забавы': '🎪',
  'Сибирский циркуль': '📐',
  'Гиревой бой': '🥊'
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWorkouts()
      .then(res => {
        if (res.data.success) {
          setWorkouts(res.data.data);
        } else {
          setError('Ошибка загрузки данных');
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить тренировки. Проверьте соединение с сервером.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkouts = useMemo(() => {
    if (activeLevel === 'ALL') return workouts;
    return workouts.filter(w => w.level === activeLevel);
  }, [workouts, activeLevel]);

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

      {/* Сетка карточек */}
      <div className="card-grid">
        {filteredWorkouts.length === 0 ? (
          <p className="empty-message">Нет тренировок для выбранного уровня</p>
        ) : (
          filteredWorkouts.map(w => (
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