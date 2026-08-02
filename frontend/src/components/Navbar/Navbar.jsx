import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

/**
 * Компонент навигационной панели.
 * На мобильных устройствах отображает hamburger-меню.
 * При открытии меню блокирует скролл body.
 */
function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Состояние мобильного меню
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Закрытие меню при ресайзе окна на десктоп.
   * Если ширина > 768px — меню автоматически закрывается.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  /**
   * Блокировка/разблокировка скролла body при открытии/закрытии меню.
   */
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  /**
   * Переключение мобильного меню.
   */
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  /**
   * Закрытие меню и навигация.
   * @param {string} path - путь для навигации
   */
  const handleNavClick = useCallback((path) => {
    setIsMenuOpen(false);
    navigate(path);
  }, [navigate]);

  /**
   * Обработчик выхода из аккаунта.
   */
  const handleLogout = useCallback(() => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Логотип / Название приложения */}
        <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          🏋️ HardcoreTraining
        </Link>

        {/* Кнопка hamburger для мобильных */}
        <button
          className={`navbar-hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
          type="button"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        {/* Навигационные ссылки */}
        <div className={`navbar-menu ${isMenuOpen ? 'navbar-menu--open' : ''}`}>
          <Link
            to="/"
            className="navbar-link"
            onClick={() => handleNavClick('/')}
          >
            Тренировки
          </Link>

          {user && (
            <>
              <Link
                to="/history"
                className="navbar-link"
                onClick={() => handleNavClick('/history')}
              >
                История
              </Link>
              <Link
                to="/profile"
                className="navbar-link"
                onClick={() => handleNavClick('/profile')}
              >
                Профиль
              </Link>
            </>
          )}

          {/* Переключатель темы */}
          <button
            className="navbar-theme-btn"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            type="button"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Кнопки авторизации */}
          {user ? (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
              type="button"
            >
              Выйти
            </button>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary btn-sm"
              onClick={() => handleNavClick('/login')}
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;