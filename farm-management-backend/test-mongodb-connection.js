// Quick MongoDB Connection Test
// Run this to verify your MongoDB setup

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_management';

console.log('Connection String:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
console.log('Attempting to connect...\n');

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔢 Port:', mongoose.connection.port);
    console.log('');
    
    // Create a test collection
    console.log('Testing database operations...');
    const TestSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('connection_test', TestSchema);
    
    return Test.create({ name: 'Connection Test ' + new Date().toISOString() });
  })
  .then((doc) => {
    console.log('✅ Test document created:', doc._id);
    console.log('');
    console.log('🎉 Your MongoDB setup is working perfectly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your backend: node start-dev.js');
    console.log('2. Register a user via API or web dashboard');
    console.log('3. Your data will now persist in MongoDB!');
    console.log('');
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ERROR! Failed to connect to MongoDB');
    console.error('');
    console.error('Error message:', error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Solution:');
      console.error('   - If using local MongoDB: Make sure MongoDB service is running');
      console.error('   - Windows: Run "net start MongoDB" in admin PowerShell');
      console.error('   - Or use MongoDB Atlas (cloud) - see MONGODB_SETUP_GUIDE.md');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Solution:');
      console.error('   - Check username/password in MONGODB_URI');
      console.error('   - Make sure password is URL-encoded if it has special characters');
      console.error('   - Verify user exists in MongoDB Atlas Database Access');
    } else if (error.message.includes('IP not whitelisted')) {
      console.error('💡 Solution:');
      console.error('   - Go to MongoDB Atlas → Network Access');
      console.error('   - Add your IP address or use 0.0.0.0/0 for development');
    } else {
      console.error('💡 Check:');
      console.error('   - MONGODB_URI in .env file is correct');
      console.error('   - Network connection is active');
      console.error('   - MongoDB service/cluster is running');
    }
    console.error('');
    process.exit(1);
  });
