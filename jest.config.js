const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Excluir tests E2E de Playwright (se ejecutan con npx playwright test)
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/.next/',
  ],
}

module.exports = createJestConfig(customJestConfig)
