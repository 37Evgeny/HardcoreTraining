import { getLevelBgColor, getLevelColor, getLevelLabel } from '../../utils/levels';
import './WorkoutCard.css';

/**
 * WorkoutCard — карточка тренировки.
 *
 * @param {Object}   workout          - объект тренировки
 * @param {string}   icon             - эмодзи-иконка (опционально, приоритетнее workout.icon)
 * @param {boolean}  isFavorite       - находится ли тренировка в избранном
 * @param {Function} onToggleFavorite - переключение избранного
 * @param {Function} onClick          - обработчик клика по карточке
 */
const WorkoutCard = ({
  workout,
  icon,
  isFavorite = false,
  onToggleFavorite,
  onClick,
}) => {
  // Defensive: защита от undefined полей и поддержка обоих форматов данных
  // (бэкенд отдаёт title/durationMinutes, тесты используют name/duration)
  const {
    title,
    name,
    description = '',
    level = 'BEGINNER',
    durationMinutes,
    duration,
    exercises = [],
    icon: workoutIcon,
  } = workout || {};

  const displayTitle = title || name || 'Без названия';
  const displayIcon = icon || workoutIcon || '🏋️';
  const displayDuration = durationMinutes ?? duration ?? 0;

  // Обрезка описания до 80 символов
  const shortDescription =
    description.length > 80 ? `${description.slice(0, 80)}...` : description;

  return (
    <article
      className="workout-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <div className="card-accent" style={{ background: getLevelColor(level) }} />

      {onToggleFavorite && (
        <button
          type="button"
          className="card-favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}

      <div className="card-icon-wrapper">
        <span className="card-icon">{displayIcon}</span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{displayTitle}</h3>
        <p className="card-description">{shortDescription}</p>
        <div className="card-tags">
          <span
            className="card-tag level-tag"
            style={{ color: getLevelColor(level), background: getLevelBgColor(level) }}
          >
            {getLevelLabel(level)}
          </span>
          <span className="card-tag">⏱ {displayDuration} мин</span>
          <span className="card-tag">🏋️ {exercises.length} упр.</span>
        </div>
      </div>
    </article>
  );
};

export default WorkoutCard;