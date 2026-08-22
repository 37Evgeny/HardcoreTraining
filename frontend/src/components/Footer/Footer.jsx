import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LEVEL_LABELS } from '../../utils/levels';
import './Footer.css';

/**
 * Список уровней тренировок для быстрых ссылок в футере.
 * Клик ведёт на главную с активным фильтром ?level=...
 */
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

/**
 * Footer — подвал приложения.
 *
 * Секции:
 *  - бренд: логотип + слоган + краткое описание;
 *  - навигация: основные разделы (зависят от авторизации);
 *  - тренировки: быстрые ссылки на фильтр по уровню;
 *  - контакты: email, соцсети, кнопка «наверх».
 *
 * Внизу — копирайт-бар с годом и ссылкой на GitHub.
 */
const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  // Класс для NavLink с активным состоянием
  const linkClass = ({ isActive }) =>
    `footer__link${isActive ? ' footer__link--active' : ''}`;

  /**
   * Прокрутка страницы наверх (для кнопки «Наверх»).
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* ---------- Секция бренда ---------- */}
        <div className="footer__brand">
          <NavLink to="/" className="footer__logo">
            Hardcore<span className="footer__logo-accent">Training</span>
          </NavLink>
          <p className="footer__tagline">
            Тренируйся жёстко. Прогрессируй постоянно.
          </p>
          <p className="footer__description">
            Программы тренировок для всех уровней подготовки — от новичка
            до продвинутого атлета. Отмечай любимые тренировки и следи за прогрессом.
          </p>
        </div>

        {/* ---------- Секция навигации ---------- */}
        <nav className="footer__col" aria-label="Навигация по сайту">
          <h3 className="footer__heading">Навигация</h3>
          <ul className="footer__list">
            <li>
              <NavLink to="/" className={linkClass} end>
                Тренировки
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/favorites" className={linkClass}>
                  Избранное
                </NavLink>
              </li>
            )}
            {user && (
              <li>
                <NavLink to="/history" className={linkClass}>
                  История
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to={user ? '/profile' : '/login'} className={linkClass}>
                {user ? 'Профиль' : 'Войти'}
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* ---------- Секция уровней тренировок ---------- */}
        <nav className="footer__col" aria-label="Тренировки по уровню">
          <h3 className="footer__heading">Уровни</h3>
          <ul className="footer__list">
            <li>
              <NavLink to="/" className={linkClass} end>
                Все тренировки
              </NavLink>
            </li>
            {LEVELS.map((level) => (
              <li key={level}>
                <NavLink to={`/?level=${level}`} className={linkClass}>
                  {LEVEL_LABELS[level]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---------- Секция контактов ---------- */}
        <div className="footer__col">
          <h3 className="footer__heading">Контакты</h3>
          <ul className="footer__list">
            <li>
              <a className="footer__link" href="mailto:support@hardcoretraining.dev">
                support@hardcoretraining.dev
              </a>
            </li>
            <li>
              <a
                className="footer__link"
                href="https://github.com/37Evgeny/HardcoreTraining"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>

          {/* Кнопка «Наверх» */}
          <button
            type="button"
            className="footer__top-btn"
            onClick={scrollToTop}
            aria-label="Прокрутить наверх"
          >
            ↑ Наверх
          </button>
        </div>
      </div>

      {/* ---------- Копирайт-бар ---------- */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copyright">
            © {currentYear} HardcoreTraining. Все права защищены.
          </p>
          <p className="footer__made">
            Сделано с <span className="footer__heart">♥</span> для сильных духом
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;