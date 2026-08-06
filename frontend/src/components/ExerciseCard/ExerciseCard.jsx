import './ExerciseCard.css';

/**
 * ExerciseCard — карточка упражнения.
 *
 * @param {Object} exercise - { name, instructions, safetyTip, sets, reps, restSeconds }
 */
const ExerciseCard = ({ exercise }) => {
  // Дефолтные значения защищают от undefined/null в данных с бэкенда
  const {
    name = 'Упражнение',
    instructions = '',
    safetyTip = null,
    sets = '—',
    reps = '—',
    restSeconds = '—',
  } = exercise || {};

  return (
    <div className="card exercise-card">
      <h4 className="exercise-card__title">{name}</h4>
      <p className="exercise-card__instructions">{instructions}</p>

      {safetyTip && (
        <p className="exercise-card__safety" role="note">
          ⚠️ {safetyTip}
        </p>
      )}

      <div className="exercise-card__meta">
        <div className="exercise-card__meta-item">
          <span className="exercise-card__meta-label">Подходы: </span>
          <strong>{sets}</strong>
        </div>
        <div className="exercise-card__meta-item">
          <span className="exercise-card__meta-label">Повторения: </span>
          <strong>{reps}</strong>
        </div>
        <div className="exercise-card__meta-item">
          <span className="exercise-card__meta-label">Отдых: </span>
          <strong>{restSeconds} сек</strong>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;