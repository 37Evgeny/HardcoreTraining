import './ErrorMessage.css';

/**
 * ErrorMessage — отображение ошибки с кнопкой повтора.
 *
 * @param {string}   message  - текст ошибки
 * @param {Function} onRetry  - колбэк повторной попытки (опционально)
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-message" role="alert">
    <p className="error-message__text">{message || 'Произошла ошибка'}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn btn--primary">
        Попробовать снова
      </button>
    )}
  </div>
);

export default ErrorMessage;