// backend/jest.config.ts
// Конфигурация Jest для TypeScript backend

import type { Config } from 'jest';

const config: Config = {
  // Используем ts-jest для трансформации TypeScript
  preset: 'ts-jest',

  // Среда выполнения — Node.js
  testEnvironment: 'node',

  // Корневая директория для тестов
  roots: ['<rootDir>/src'],

  // Паттерны для поиска тестов
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],

  // Модули, которые нужно игнорировать при трансформации
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],

  // Покрытие кода
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],

  // Пороги покрытия (можно ослабить на старте)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Алиасы для путей (если используются)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Очистка моков между тестами
  clearMocks: true,
};

export default config;