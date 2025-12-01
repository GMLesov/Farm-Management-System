# Required Dependencies Installation Guide

## Backend Dependencies

```bash
cd server
npm install --save-dev @types/express @types/node @types/cors @types/morgan typescript ts-node nodemon
npm install express cors morgan dotenv mongoose bcryptjs jsonwebtoken express-validator
npm install helmet express-rate-limit sanitize-html validator
npm install winston swagger-jsdoc swagger-ui-express
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/validator @types/swagger-jsdoc @types/swagger-ui-express
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

## Frontend Dependencies

```bash
cd web-dashboard
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom ts-jest
npm install --save-dev cypress
npm install --save-dev identity-obj-proxy
```

## Optional (Production Recommended)

```bash
# Backend
npm install rate-limit-redis redis
npm install @sentry/node
npm install compression

# Frontend
npm install @sentry/react
```

## Package.json Scripts

### Backend (server/package.json)
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon --watch src --exec ts-node src/server.ts",
    "build": "tsc",
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### Frontend (web-dashboard/package.json)
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```
