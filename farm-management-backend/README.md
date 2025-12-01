# Farm Management API Backend

A comprehensive REST API backend for farm management systems built with Node.js, Express, TypeScript, and MongoDB.

## 🌾 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Farm Management**: Complete CRUD operations for farms, crops, and equipment
- **Real-time Communication**: Socket.IO integration for live updates
- **Weather Integration**: Weather data and alerts
- **Financial Tracking**: Income, expenses, and financial reporting
- **Smart Irrigation**: Automated irrigation system control
- **Analytics & Reporting**: Comprehensive data analytics and report generation
- **Cloud Integration**: Firebase integration for mobile app synchronization
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Structured logging with Winston
- **Docker Support**: Complete Docker setup for easy deployment

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Cache**: Redis
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Cloud Services**: Firebase
- **Documentation**: Swagger/OpenAPI
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18.0 or higher
- MongoDB 6.0 or higher
- Redis 6.0 or higher
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farm-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/farm_management
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Add other environment variables as needed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Build and run manually**
   ```bash
   docker build -t farm-management-api .
   docker run -p 3000:3000 farm-management-api
   ```

## 📚 API Documentation

Once the server is running, access the API documentation at:
- **Swagger UI**: http://localhost:3000/api-docs
- **JSON Schema**: http://localhost:3000/api-docs.json

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/firebase-login` - Login with Firebase
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/switch-farm/:farmId` - Switch active farm

### Farms
- `GET /api/farms` - Get all farms
- `POST /api/farms` - Create new farm
- `GET /api/farms/:id` - Get farm by ID
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Additional Endpoints
- Crops Management
- Irrigation Systems
- Weather Data
- Financial Tracking
- Reports & Analytics
- Notifications
- Data Synchronization

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Database
npm run db:seed      # Seed database with sample data
npm run db:migrate   # Run database migrations
```

### Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # MongoDB connection
│   ├── redis.ts     # Redis connection
│   ├── firebase.ts  # Firebase configuration
│   └── swagger.ts   # API documentation setup
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
│   ├── auth.ts      # Authentication middleware
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
├── models/          # Database models
│   ├── User.ts
│   ├── Farm.ts
│   └── ...
├── routes/          # API routes
│   ├── auth.ts
│   ├── users.ts
│   ├── farms.ts
│   └── ...
├── services/        # Business logic
│   ├── socketService.ts
│   └── ...
├── utils/           # Utility functions
│   └── logger.ts
└── server.ts        # Application entry point
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Cross-origin resource sharing setup
- **Input Validation**: Express Validator for request validation
- **Security Headers**: Helmet.js for security headers
- **Environment Variables**: Sensitive data protection

## 📊 Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Health Checks**: Built-in health check endpoint
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Request timing and performance metrics

## 🚀 Deployment

### Production Deployment Checklist

1. **Environment Variables**
   - Set all required environment variables
   - Use strong JWT secrets
   - Configure proper database URLs

2. **Security**
   - Enable SSL/TLS
   - Configure firewall rules
   - Set up proper CORS origins

3. **Monitoring**
   - Set up log aggregation
   - Configure health check monitoring
   - Set up error alerting

4. **Performance**
   - Configure Redis for production
   - Set up database indexing
   - Enable compression middleware

### Cloud Deployment Options

- **AWS**: ECS, EC2, or Elastic Beanstalk
- **Google Cloud**: Cloud Run, Compute Engine, or App Engine
- **Azure**: Container Instances or App Service
- **DigitalOcean**: Droplets or App Platform
- **Heroku**: Direct deployment with add-ons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@farmmanagement.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added real-time features with Socket.IO
- **v1.2.0** - Firebase integration and mobile app sync

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the robust database
- Socket.IO team for real-time capabilities
- All contributors and the open-source community