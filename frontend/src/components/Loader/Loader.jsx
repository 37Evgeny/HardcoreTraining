import './Loader.css';

/**
 * Loader — индикатор загрузки.
 * @param {string} [label] - текст под спиннером (опционально)
 */
const Loader = ({ label = 'Загрузка...' }) => (
  <div className="loader" role="status" aria-live="polite">
    <div className="loader__spinner" aria-hidden="true" />
    <p className="loader__label">{label}</p>
  </div>
);

export default Loader;