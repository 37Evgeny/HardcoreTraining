import { getLevelBgColor, getLevelColor, getLevelLabel } from '../../utils/levels';
import './WorkoutCard.css';

/**
 * WorkoutCard — карточка тренировки.
 *
 * @param {Object}   workout - объект тренировки
 * @param {string}   icon    - эмодзи-иконка
 * @param {Function} onClick - обработчик клика
 */
const WorkoutCard = ({ workout, icon, onClick }) => {
  // Defensive: защита от undefined полей
  const {
    title = 'Без названия',
    description = '',
    level = 'BEGINNER',
    durationMinutes = 0,
    exercises = [],
  } = workout || {};

  // Обрезка описания до 80 символов
  const shortDescription =
    description.length > 80 ? `${description.slice(0, 80)}...` : description;

  return (
    <article
      className="workout-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <div className="card-accent" style={{ background: getLevelColor(level) }} />
      <div className="card-icon-wrapper">
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{shortDescription}</p>
        <div className="card-tags">
          <span
            className="card-tag level-tag"
            style={{ color: getLevelColor(level), background: getLevelBgColor(level) }}
          >
            {getLevelLabel(level)}
          </span>
          <span className="card-tag">⏱ {durationMinutes} мин</span>
          <span className="card-tag">🏋️ {exercises.length} упр.</span>
        </div>
      </div>
    </article>
  );
};

export default WorkoutCard;