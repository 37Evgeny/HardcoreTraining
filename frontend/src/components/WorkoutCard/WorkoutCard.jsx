import './WorkoutCard.css';

const WorkoutCard = ({ workout, icon, levelLabel, onClick }) => {
  const levelColors = {
    'BEGINNER': '#2ecc71',
    'INTERMEDIATE': '#f1c40f',
    'ADVANCED': '#e74c3c'
  };

  const levelBgColors = {
    'BEGINNER': 'rgba(46, 204, 113, 0.15)',
    'INTERMEDIATE': 'rgba(241, 196, 15, 0.15)',
    'ADVANCED': 'rgba(231, 76, 60, 0.15)'
  };

  return (
    <div className="workout-card" onClick={onClick}>
      <div
        className="card-accent"
        style={{ background: levelColors[workout.level] }}
      />
      <div className="card-icon-wrapper">
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{workout.title}</h3>
        <p className="card-description">
          {workout.description.length > 80
            ? workout.description.slice(0, 80) + '...'
            : workout.description
          }
        </p>
        <div className="card-tags">
          <span
            className="card-tag level-tag"
            style={{
              color: levelColors[workout.level],
              background: levelBgColors[workout.level]
            }}
          >
            {levelLabel}
          </span>
          <span className="card-tag">
            ⏱ {workout.durationMinutes} мин
          </span>
          <span className="card-tag">
            🏋️ {workout.exercises?.length || 0} упр.
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;