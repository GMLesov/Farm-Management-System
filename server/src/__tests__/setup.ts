import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Increase timeout for database operations
jest.setTimeout(30000);

// Connect to test database before all tests
beforeAll(async () => {
  // Use a separate test database on Atlas to avoid conflicts
  const mongoUri = process.env.MONGODB_URI?.replace('farm-management', 'farm-management-test') 
    || 'mongodb+srv://farmadmin:maranatha%402018@cluster0.674o7z7.mongodb.net/farm-management-test?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(mongoUri);
  console.log('✅ Test database connected');
});

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
