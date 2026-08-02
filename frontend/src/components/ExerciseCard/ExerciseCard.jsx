
const ExerciseCard = ({ exercise }) => {
  return (
    <div className="card">
      <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
        {exercise.name}
      </h4>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        {exercise.instructions}
      </p>
      {exercise.safetyTip && (
        <p style={{
          color: 'var(--accent-red)',
          fontSize: 'var(--text-xs)',
          marginTop: '10px',
          padding: '8px 12px',
          background: 'var(--accent-red-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(231, 76, 60, 0.15)'
        }}>
          ⚠️ {exercise.safetyTip}
        </p>
      )}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '14px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '6px 14px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)'
        }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Подходы: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{exercise.sets}</strong>
        </div>
        <div style={{
          padding: '6px 14px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)'
        }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Повторения: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{exercise.reps}</strong>
        </div>
        <div style={{
          padding: '6px 14px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)'
        }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Отдых: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{exercise.restSeconds} сек</strong>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;