/**
 * Loader — компонент-заглушка для состояния загрузки.
 */
const Loader = () => (
  <div className="loader" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4rem',
  }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--color-border)',
      borderTopColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  </div>
);

export default Loader;
