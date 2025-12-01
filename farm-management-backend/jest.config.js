module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/setup.ts',
    '/src/__tests__/auth.test.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        }
      }
    }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/config/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  // Progressive coverage thresholds - will increase as coverage improves
  coverageThreshold: {
    global: {
      branches: 30,    // Current: 21.85%, Target: 70% (long-term)
      functions: 40,   // Current: 37.43%, Target: 70% (long-term)
      lines: 40,       // Current: 35.91%, Target: 75% (long-term)
      statements: 40   // Current: 35.78%, Target: 75% (long-term)
    },
    './src/controllers/**/*.ts': {
      branches: 20,
      functions: 30,
      lines: 30,
      statements: 30
    },
    './src/services/**/*.ts': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60
    },
    './src/middleware/**/*.ts': {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/models/**/*.ts': {
      branches: 40,
      functions: 45,
      lines: 45,
      statements: 45
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};