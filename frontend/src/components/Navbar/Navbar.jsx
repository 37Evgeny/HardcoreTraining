import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// ИСПРАВЛЕНО: деструктуризация { isDark, toggleTheme } вместо { theme, toggleTheme }
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

/**
 * Navbar — навигационная панель приложения.
 * Отображает ссылки на основные разделы и кнопку переключения темы.
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  // ИСПРАВЛЕНО: ThemeContext экспортирует { isDark, toggleTheme }
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  /**
   * Обработчик выхода из аккаунта.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          HardcoreTraining
        </Link>

        <div className="navbar__links">
          <Link to="/" className="navbar__link">
            Тренировки
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="navbar__link">
                Профиль
              </Link>
              <button onClick={handleLogout} className="navbar__link navbar__link--btn">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">
                Войти
              </Link>
              <Link to="/register" className="navbar__link">
                Регистрация
              </Link>
            </>
          )}

          {/* ИСПРАВЛЕНО: используем isDark вместо theme для определения текущей темы */}
          <button
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