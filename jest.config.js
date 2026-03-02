const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^signature_pad$': '<rootDir>/src/__mocks__/signature_pad.js',
  },
  // Excluir tests E2E de Playwright (se ejecutan con npx playwright test)
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',   // todos los .spec.ts de Playwright van aquí
    '<rootDir>/.next/',
  ],
}

module.exports = createJestConfig(customJestConfig)
