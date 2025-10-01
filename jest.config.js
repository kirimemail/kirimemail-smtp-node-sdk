module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^ky$': '<rootDir>/node_modules/ky/distribution/index.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../client/SmtpClient$': '<rootDir>/tests/__mocks__/SmtpClient',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ky)/)',
  ],
};