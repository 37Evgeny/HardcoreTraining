import { useCallback, useState } from 'react';
import './SafetyModal.css';

/**
 * Модальное окно безопасности перед началом тренировки.
 * Пользователь должен подтвердить все пункты чек-листа.
 *
 * @param {Object} props
 * @param {Function} props.onConfirm - колбэк при подтверждении всех пунктов
 */
function SafetyModal({ onConfirm }) {
  // Состояние каждого чекбокса
  const [checks, setChecks] = useState({
    warmup: false,
    health: false,
    technique: false,
    hydration: false,
    equipment: false,
  });

  /**
   * Переключение состояния чекбокса.
   * @param {string} key - ключ чекбокса
   */
  const toggleCheck = useCallback((key) => {
    setChecks(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  /**
   * Все ли чекбоксы отмечены.
   */
  const allChecked = Object.values(checks).every(Boolean);

  /**
   * Обработчик подтверждения.
   */
  const handleConfirm = useCallback(() => {
    if (allChecked && onConfirm) {
      onConfirm();
    }
  }, [allChecked, onConfirm]);

  /**
   * Обработчик клавиши Enter для подтверждения.
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && allChecked) {
      handleConfirm();
    }
  }, [allChecked, handleConfirm]);

  return (
    <div className="safety-overlay" onClick={handleConfirm}>
      <div
        className="safety-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Проверка безопасности"
        onKeyDown={handleKeyDown}
      >
        {/* Заголовок */}
        <div className="safety-header">
          <div className="safety-icon">⚠️</div>
          <h2>Проверка безопасности</h2>
          <p>Перед началом тренировки подтверди следующие пункты:</p>
        </div>

        {/* Чек-лист */}
        <div className="safety-body">
          <div className="safety-checklist">
            {[
              { key: 'warmup', text: '✅ Я сделал разминку (5-10 мин)' },
              { key: 'health', text: '✅ Я чувствую себя здоровым и готов к нагрузке' },
              { key: 'technique', text: '✅ Я помню о правильной технике выполнения' },
              { key: 'hydration', text: '✅ У меня есть вода рядом' },
              { key: 'equipment', text: '✅ Гиря/снаряжение в хорошем состоянии' },
            ].map(item => (
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

        {/* Кнопка подтверждения */}
        <div className="safety-footer">
          <button
            className={`btn ${allChecked ? 'btn-success' : 'btn-secondary'}`}
            onClick={handleConfirm}
            disabled={!allChecked}
            type="button"
          >
            {allChecked ? '🚀 Начать тренировку' : `☐ Отметь все пункты (${Object.values(checks).filter(Boolean).length}/${Object.values(checks).length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SafetyModal;