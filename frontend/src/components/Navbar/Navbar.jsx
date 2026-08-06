import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

/**
 * Navbar — навигационная панель.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Базовый класс для NavLink + активное состояние
  const linkClass = ({ isActive }) =>
    `navbar__link${isActive ? ' navbar__link--active' : ''}`;

  return (
    <nav className="navbar" aria-label="Основная навигация">
      <div className="navbar__container">
        <NavLink to="/" className="navbar__logo">
          HardcoreTraining
        </NavLink>

        <div className="navbar__links">
          <NavLink to="/" className={linkClass} end>
            Тренировки
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile" className={linkClass}>
                Профиль
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="navbar__link navbar__link--btn"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Войти
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Регистрация
              </NavLink>
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="navbar__theme-toggle"
            aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;