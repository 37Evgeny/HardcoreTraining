import { useEffect } from 'react';
import { getLevelColor, getLevelLabel } from '../../utils/levels';
import ExerciseCard from '../ExerciseCard/ExerciseCard';
import './WorkoutModal.css';

/**
 * WorkoutModal — детали тренировки.
 *
 * @param {Object}   workout - объект тренировки
 * @param {string}   icon    - эмодзи-иконка
 * @param {Function} onClose - закрытие
 * @param {Function} onStart - старт тренировки
 */
const WorkoutModal = ({ workout, icon, onClose, onStart }) => {
  const {
    title = 'Без названия',
    description = '',
    level = 'BEGINNER',
    durationMinutes = 0,
    exercises = [],
  } = workout || {};

  // Закрытие по Escape + блокировка скролла фона
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKeyDown);
    // Блокируем прокрутку страницы за модалкой
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow; // восстанавливаем
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content workout-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>

        <div className="modal-header">
          <span className="modal-icon">{icon}</span>
          <div className="modal-header-info">
            <h2>{title}</h2>
            <div className="modal-meta">
              <span className="modal-level" style={{ color: getLevelColor(level) }}>
                {getLevelLabel(level)}
              </span>
              <span>⏱ {durationMinutes} мин</span>
              <span>🏋️ {exercises.length} упражнений</span>
            </div>
          </div>
        </div>

        <p className="modal-description">{description}</p>

        <div className="modal-exercises">
          <h3>📋 Упражнения</h3>
          <div className="modal-exercises-list">
            {exercises.map((exercise, idx) => (
              <div key={exercise.id || idx} className="modal-exercise-item">
                <div className="modal-exercise-number">{idx + 1}</div>
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn-primary modal-start-btn" onClick={onStart}>
          🚀 Начать тренировку
        </button>
      </div>
    </div>
  );
};

export default WorkoutModal;