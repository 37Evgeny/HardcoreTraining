import { useNavigate, useSearchParams } from 'react-router-dom';
import { LEVEL_LABELS } from '../../utils/levels';
import './LevelFilterBar.css';

/**
 * Список доступных уровней тренировок.
 * 'ALL' — псевдо-уровень, означающий «показать все тренировки».
 */
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

/**
 * LevelFilterBar — панель фильтрации тренировок по уровню.
 * Рендерится на странице «Тренировки» под заголовком (не внутри Navbar).
 *
 * Выбранный уровень хранится в URL-параметре ?level=, поэтому:
 * - фильтр «переживает» перезагрузку страницы;
 * - ссылку на отфильтрованный список можно скопировать/отправить;
 * - HomePage автоматически реагирует на изменение параметра.
 *
 * Стилизация: используем глобальные классы .btn / .btn-sm из index.css
 * и CSS-переменные проекта. Панель отцентрирована по горизонтали.
 */
const LevelFilterBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Активный уровень берём из URL. Если параметра нет — 'ALL'.
  const activeLevel = searchParams.get('level') || 'ALL';

  /**
   * Смена фильтра по уровню.
   * Обновляем URL-параметр ?level= — HomePage перезагрузит список с 1-й страницы.
   * @param {string} level - уровень тренировки или 'ALL'
   */
  const handleLevelChange = (level) => {
    if (level === 'ALL') {
      navigate('/');
    } else {
      navigate(`/?level=${level}`);
    }
  };

  // Базовый класс кнопки: .btn + .btn-sm (глобальные), + модификатор активного уровня
  const btnClass = (level) =>
    `btn btn-sm level-filter__btn${activeLevel === level ? ' level-filter__btn--active' : ''}`;

  return (
    <div
      className="level-filter"
      role="group"
      aria-label="Фильтр тренировок по уровню"
    >
      <span className="level-filter__label">Уровень:</span>

      <button
        type="button"
        className={btnClass('ALL')}
        onClick={() => handleLevelChange('ALL')}
      >
        Все
      </button>

      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={btnClass(level)}
          onClick={() => handleLevelChange(level)}
        >
          {LEVEL_LABELS[level]}
        </button>
      ))}
    </div>
  );
};

export default LevelFilterBar;