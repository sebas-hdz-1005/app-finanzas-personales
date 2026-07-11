const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/services/**/*.{js,jsx}',
    'src/utils/**/*.{js,jsx}',
    'src/validations/**/*.{js,jsx}',
    'src/components/**/*.{js,jsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
