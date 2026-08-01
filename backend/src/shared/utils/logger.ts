/**
 * Logger Utility
 * 
 * Упрощённая реализация логгера на основе console.
 * В production рекомендуется заменить на pino/winston для:
 * - Структурированного логирования (JSON)
 * - Ротации логов
 * - Разных уровней логирования
 * - Отправки в ELK/Sentry
 * 
 * @module logger
 */
import { env } from './env';

/**
 * Уровни логирования по возрастанию важности.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Карта соответствия уровня логирования числовому значению.
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Текущий уровень логирования из env (по умолчанию 'info').
 */
const currentLevel: LogLevel = (env as any).LOG_LEVEL || 'info';

/**
 * Проверка, нужно ли логировать на данном уровне.
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Форматирование сообщения с временной меткой.
 */
function formatMessage(level: string, message: string, ...args: any[]): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (args.length > 0) {
    return `${prefix} ${message} ${args.map(a => 
      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
    ).join(' ')}`;
  }
  
  return `${prefix} ${message}`;
}

export const logger = {
  /**
   * Отладочное логирование (только в development).
   */
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug') && env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, ...args));
    }
  },

  /**
   * Информационное логирование (пропускается в тестах).
   */
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info') && env.NODE_ENV !== 'test') {
      console.log(formatMessage('info', message, ...args));
    }
  },

  /**
   * Предупреждения.
   */
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, ...args));
    }
  },

  /**
   * Критические ошибки.
   */
  error: (message: string, ...args: any[]) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, ...args));
    }
  },
};