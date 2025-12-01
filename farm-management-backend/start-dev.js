// Simple development server starter without strict TypeScript compilation
require('ts-node').register({
  transpileOnly: true, // Skip type checking for faster startup
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
    esModuleInterop: true,
    skipLibCheck: true
  }
});

require('tsconfig-paths').register({
  baseUrl: './src',
  paths: {
    '@/*': ['*']
  }
});

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ALLOW_START_WITHOUT_DB = 'true';
process.env.ALLOW_START_WITHOUT_REDIS = 'true';

console.log('🚀 Starting development server...');
console.log('Environment:', process.env.NODE_ENV);

// Start the server
require('./src/server.ts');
