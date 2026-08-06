import { useCallback, useEffect, useState } from 'react';
import './SafetyModal.css';

/**
 * SafetyModal — чек-лист безопасности перед тренировкой.
 *
 * @param {Function} onConfirm - колбэк при подтверждении всех пунктов
 * @param {Function} onClose   - колбэк закрытия (клик по фону / Escape)
 */
function SafetyModal({ onConfirm, onClose }) {
  const [checks, setChecks] = useState({
    warmup: false,
    health: false,
    technique: false,
    hydration: false,
    equipment: false,
  });

  // Данные чек-листа вынесены в константу для чистоты JSX
  const CHECKLIST = [
    { key: 'warmup', text: '✅ Я сделал разминку (5-10 мин)' },
    { key: 'health', text: '✅ Я чувствую себя здоровым и готов к нагрузке' },
    { key: 'technique', text: '✅ Я помню о правильной технике выполнения' },
    { key: 'hydration', text: '✅ У меня есть вода рядом' },
    { key: 'equipment', text: '✅ Гиря/снаряжение в хорошем состоянии' },
  ];

  const allChecked = Object.values(checks).every(Boolean);
  const checkedCount = Object.values(checks).filter(Boolean).length;

  const toggleCheck = useCallback((key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (allChecked && onConfirm) onConfirm();
  }, [allChecked, onConfirm]);

  // Закрытие по Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="safety-overlay"
      onClick={onClose}   // ИСПРАВЛЕНО: клик по фону ЗАКРЫВАЕТ, а не подтверждает
      role="presentation"
    >
      <div
        className="safety-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Проверка безопасности"
      >
        <div className="safety-header">
          <div className="safety-icon">⚠️</div>
          <h2>Проверка безопасности</h2>
          <p>Перед началом тренировки подтверди следующие пункты:</p>
        </div>

        <div className="safety-body">
          <div className="safety-checklist">
            {CHECKLIST.map(item => (
              <label
                key={item.key}
                className={`safety-check-item ${checks[item.key] ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  className="safety-checkbox"
                  checked={checks[item.key]}
                  onChange={() => toggleCheck(item.key)}
                />
                <span className="safety-check-text">{item.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="safety-footer">
          <button
            type="button"
            className={`btn ${allChecked ? 'btn-success' : 'btn-secondary'}`}
            onClick={handleConfirm}
            disabled={!allChecked}
          >
            {allChecked
              ? '🚀 Начать тренировку'
              : `☐ Отметь все пункты (${checkedCount}/${CHECKLIST.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SafetyModal;