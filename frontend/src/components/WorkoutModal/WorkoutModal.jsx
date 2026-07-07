import ExerciseCard from '../ExerciseCard';
import './WorkoutModal.css';

const WorkoutModal = ({ workout, icon, levelLabel, onClose, onStart }) => {
  const levelColors = {
    'BEGINNER': '#2ecc71',
    'INTERMEDIATE': '#f1c40f',
    'ADVANCED': '#e74c3c'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content workout-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="modal-header">
          <span className="modal-icon">{icon}</span>
          <div className="modal-header-info">
            <h2>{workout.title}</h2>
            <div className="modal-meta">
              <span
                className="modal-level"
                style={{ color: levelColors[workout.level] }}
              >
                {levelLabel}
              </span>
              <span>⏱ {workout.durationMinutes} мин</span>
              <span>🏋️ {workout.exercises?.length || 0} упражнений</span>
            </div>
          </div>
        </div>

        <p className="modal-description">{workout.description}</p>

        <div className="modal-exercises">
          <h3>📋 Упражнения</h3>
          <div className="modal-exercises-list">
            {workout.exercises.map((exercise, idx) => (
              <div key={exercise.id || idx} className="modal-exercise-item">
                <div className="modal-exercise-number">{idx + 1}</div>
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary modal-start-btn" onClick={onStart}>
          🚀 Начать тренировку
        </button>
      </div>
    </div>
  );
};

export default WorkoutModal;