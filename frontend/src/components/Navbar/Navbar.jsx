import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

/**
 * Navbar — навигационная панель.
 * На мобильных сворачивается в hamburger-меню.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Блокируем прокрутку фона, пока открыто мобильное меню
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  // Базовый класс для NavLink + активное состояние
  const linkClass = ({ isActive }) =>
    `navbar__link${isActive ? ' navbar__link--active' : ''}`;

  return (
    <nav className="navbar" aria-label="Основная навигация">
      <div className="navbar__container">
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          HardcoreTraining
        </NavLink>

        <button
          type="button"
          className={`navbar__hamburger${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
        >
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
        </button>

        <div className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          <NavLink to="/" className={linkClass} end onClick={closeMenu}>
            Тренировки
          </NavLink>

          {user ? (
            <>
            <NavLink to="/favorites" className={linkClass} onClick={closeMenu}>
      Избранное
    </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
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
              <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                Войти
              </NavLink>
              <NavLink to="/register" className={linkClass} onClick={closeMenu}>
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