import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Навигационная панель с кнопками входа/выхода и ссылками.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <Link to="/" style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        textDecoration: 'none',
      }}>
        🔥 HardcoreTraining
      </Link>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/history" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              📋 История
            </Link>
            <Link to="/profile" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              👤 {user.name || user.email}
            </Link>
            <button className="btn btn-secondary" onClick={handleLogout}>
              🚪 Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              🔐 Войти
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              📝 Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;