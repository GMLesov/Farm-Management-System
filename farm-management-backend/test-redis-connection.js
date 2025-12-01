// Quick Redis Connection Test
// Run this to verify your Redis setup

const redis = require('redis');
require('dotenv').config();

console.log('🔍 Testing Redis Connection...\n');

const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    tls: process.env.REDIS_TLS === 'true',
  },
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

console.log('Connection Details:', `${redisConfig.socket.host}:${redisConfig.socket.port}`);
console.log('TLS Enabled:', redisConfig.socket.tls);
console.log('Password:', redisConfig.password ? '****' : '(none)');
console.log('Attempting to connect...\n');

const client = redis.createClient(redisConfig);

client.on('error', (err) => {
  console.error('❌ ERROR! Failed to connect to Redis');
  console.error('');
  console.error('Error message:', err.message);
  console.error('');
  
  if (err.message.includes('ECONNREFUSED')) {
    console.error('💡 Solution:');
    console.error('   - Redis server is not running');
    console.error('   - Windows (Memurai): Check if Memurai service is running');
    console.error('   - WSL: Run "sudo service redis-server start"');
    console.error('   - Docker: Run "docker-compose up -d redis"');
    console.error('   - Or use Redis Cloud (see REDIS_SETUP_GUIDE.md)');
  } else if (err.message.includes('WRONGPASS') || err.message.includes('authentication')) {
    console.error('💡 Solution:');
    console.error('   - Check REDIS_PASSWORD in .env file');
    console.error('   - Verify password matches your Redis configuration');
    console.error('   - For local Redis without auth, leave REDIS_PASSWORD empty');
  } else if (err.message.includes('ETIMEDOUT') || err.message.includes('timeout')) {
    console.error('💡 Solution:');
    console.error('   - Check REDIS_HOST and REDIS_PORT in .env file');
    console.error('   - Verify network connection');
    console.error('   - For Redis Cloud, ensure TLS is enabled (REDIS_TLS=true)');
  } else {
    console.error('💡 Check:');
    console.error('   - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env file');
    console.error('   - Network connection is active');
    console.error('   - Redis service/instance is running');
    console.error('   - Firewall is not blocking the connection');
  }
  console.error('');
  console.error('📖 Full setup guide: REDIS_SETUP_GUIDE.md');
  console.error('');
  
  process.exit(1);
});

client.on('ready', async () => {
  try {
    console.log('✅ SUCCESS! Redis connected successfully!');
    console.log('');
    
    // Test write
    const testKey = 'connection_test';
    const testValue = 'Connection test at ' + new Date().toISOString();
    await client.set(testKey, testValue, { EX: 60 }); // Expires in 60 seconds
    console.log('✅ Test key written successfully');
    
    // Test read
    const readValue = await client.get(testKey);
    console.log('✅ Test key read successfully');
    console.log('   Value:', readValue);
    console.log('');
    
    // Get server info
    const info = await client.info('server');
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    if (versionMatch) {
      console.log('📊 Redis Version:', versionMatch[1]);
    }
    
    console.log('');
    console.log('🎉 Your Redis setup is working perfectly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your backend: node start-dev.js');
    console.log('2. Redis will automatically cache data');
    console.log('3. Enjoy 10x faster API responses!');
    console.log('');
    
    await client.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await client.quit();
    process.exit(1);
  }
});

// Connect
client.connect().catch((err) => {
  console.error('❌ Failed to initiate connection:', err.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 10 seconds');
  console.error('');
  console.error('💡 Solutions:');
  console.error('   - Check if Redis is running');
  console.error('   - Verify host and port are correct');
  console.error('   - Check firewall settings');
  console.error('');
  process.exit(1);
}, 10000);
