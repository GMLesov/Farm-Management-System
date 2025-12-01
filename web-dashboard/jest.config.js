module.exports = {
  // Use the default react-scripts test configuration
  ...require('react-scripts/config/jest/jest.config'),
  
  // Transform ESM modules from react-router-dom and react-router
  transformIgnorePatterns: [
    'node_modules/(?!(react-router-dom|react-router|@remix-run)/)',
  ],
  
  // Module name mapper for any additional mocking if needed
  moduleNameMapper: {
    '^react-router-dom$': require.resolve('react-router-dom'),
  },

  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**',
  ],

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
    // Components - user-facing UI logic
    './src/components/**/*.{ts,tsx}': {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Services - API integration layer
    './src/services/**/*.ts': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Store/Redux - state management
    './src/store/**/*.ts': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
