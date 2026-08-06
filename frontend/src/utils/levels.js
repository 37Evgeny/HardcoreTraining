/**
 * levels.js — единый источник правды для уровней тренировок.
 * Устраняет дублирование цветов/подписей между компонентами.
 */
export const LEVEL_COLORS = {
  BEGINNER: '#2ecc71',
  INTERMEDIATE: '#f1c40f',
  ADVANCED: '#e74c3c',
};

export const LEVEL_BG_COLORS = {
  BEGINNER: 'rgba(46, 204, 113, 0.15)',
  INTERMEDIATE: 'rgba(241, 196, 15, 0.15)',
  ADVANCED: 'rgba(231, 76, 60, 0.15)',
};

export const LEVEL_LABELS = {
  BEGINNER: 'Начальный',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
};

/**
 * Безопасное получение цвета уровня с fallback.
 * @param {string} level - уровень тренировки
 * @returns {string} цвет
 */
export const getLevelColor = (level) => LEVEL_COLORS[level] || '#888';

/**
 * Безопасное получение фонового цвета уровня с fallback.
 */
export const getLevelBgColor = (level) => LEVEL_BG_COLORS[level] || 'rgba(136,136,136,0.15)';

/**
 * Безопасное получение подписи уровня с fallback.
 */
export const getLevelLabel = (level) => LEVEL_LABELS[level] || level || 'Неизвестно';