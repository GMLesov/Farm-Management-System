// Firebase Connection Test Script
// Run with: node test-firebase-connection.js

require('dotenv').config();
const admin = require('firebase-admin');

console.log('🔥 Testing Firebase Connection...\n');

try {
  // Try to load service account from file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  
  console.log(`📁 Looking for service account at: ${serviceAccountPath}`);
  
  const serviceAccount = require(serviceAccountPath);
  
  console.log('✅ Service account file found');
  console.log(`📋 Project ID: ${serviceAccount.project_id}`);
  console.log(`📧 Client Email: ${serviceAccount.client_email}\n`);
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully!');
  
  // Test Firestore connection
  const db = admin.firestore();
  console.log('✅ Firestore connection established');
  
  // Try to write a test document
  const testRef = db.collection('_test').doc('connection_test');
  
  testRef.set({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    message: 'Firebase connection test successful',
    from: 'test-firebase-connection.js'
  }).then(() => {
    console.log('✅ Test document written to Firestore');
    
    // Read it back
    return testRef.get();
  }).then((doc) => {
    if (doc.exists) {
      console.log('✅ Test document read from Firestore');
      console.log('📄 Data:', doc.data());
      
      // Clean up
      return testRef.delete();
    } else {
      throw new Error('Document not found');
    }
  }).then(() => {
    console.log('✅ Test document deleted (cleanup)');
    console.log('\n🎉 All Firebase tests passed!');
    console.log('\n✅ Your Firebase setup is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Restart your backend: node start-dev.js');
    console.log('2. Check backend console for "Firebase initialized successfully"');
    console.log('3. Test push notifications in your app\n');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Firestore test failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Check Firestore is enabled in Firebase Console');
    console.log('2. Verify service account has proper permissions');
    console.log('3. Check internet connection\n');
    process.exit(1);
  });
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.log('\n💡 Troubleshooting:');
  
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('1. Make sure firebase-service-account.json exists in the backend folder');
    console.log('2. Or set FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    console.log('3. Download service account from Firebase Console → Project Settings → Service Accounts');
  } else if (error.message.includes('FIREBASE_CONFIG')) {
    console.log('1. Check .env file has FIREBASE_SERVICE_ACCOUNT_PATH');
    console.log('2. Verify the path points to your service account JSON file');
  } else {
    console.log('1. Verify firebase-service-account.json is valid JSON');
    console.log('2. Check file permissions');
    console.log('3. Make sure Firebase Admin SDK is installed: npm install firebase-admin');
  }
  
  console.log('\n📚 See FIREBASE_QUICK_START.md for setup instructions\n');
  process.exit(1);
}
