/**
 * ErrorMessage — компонент для отображения ошибок с кнопкой повтора.
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-message" style={{
    textAlign: 'center',
    padding: '2rem',
    color: '#e74c3c',
  }}>
    <p style={{ marginBottom: '1rem' }}>{message || 'Произошла ошибка'}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn--primary">
        Попробовать снова
      </button>
    )}
  </div>
);

export default ErrorMessage;
