import './SafetyModal.css';

const SafetyModal = ({ workout, onAccept, onClose }) => {
  return (
    <div className="safety-modal-overlay" onClick={onClose}>
      <div className="safety-modal" onClick={e => e.stopPropagation()}>
        <button className="safety-modal-close" onClick={onClose}>✕</button>
        
        <h2>⚠️ Перед тренировкой</h2>
        <p className="safety-workout-name">{workout?.title}</p>

        <div className="safety-checklist">
          <label className="safety-item">
            <input type="checkbox" /> Я размялся и готов к нагрузке
          </label>
          <label className="safety-item">
            <input type="checkbox" /> У меня нет болей и травм
          </label>
          <label className="safety-item">
            <input type="checkbox" /> Рядом есть свободное пространство
          </label>
          <label className="safety-item">
            <input type="checkbox" /> Пол не скользкий, гиря не повреждена
          </label>
          <label className="safety-item">
            <input type="checkbox" /> Я готов выложиться на 100%
          </label>
        </div>

        <p className="safety-warning">
          💡 Помни: техника важнее веса. При боли — остановись.
        </p>

        <button className="btn btn-primary safety-accept-btn" onClick={onAccept}>
          ✅ Я готов, погнали!
        </button>
      </div>
    </div>
  );
};

export default SafetyModal;