// frontend/vitest.config.js
// Конфигурация Vitest для React frontend

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Подключаем React плагин Vite
  plugins: [react()],

  test: {
    // Среда выполнения — jsdom (симулирует браузер)
    environment: 'jsdom',

    // Глобальные настройки для тестов
    globals: true,

    // Паттерны для поиска тестов
    include: ['src/**/*.{test,spec}.{js,jsx}'],

    // Setup файл с расширениями matchers
    setupFiles: ['./src/test/setup.js'],

    // Покрытие кода
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/test/**',
      ],
      thresholds: {
        branches: 30,
        functions: 30,
        lines: 30,
        statements: 30,
      },
    },

    // CSS не обрабатываем в тестах
    css: false,
  },
});