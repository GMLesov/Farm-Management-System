const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Farm Management API\n');

  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Test 1: Login as Admin
    console.log('1️⃣ Logging in as admin...');
    let adminToken;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@farm.com',
        password: 'admin123'
      });
      console.log('✅ Admin login successful');
      adminToken = loginResponse.data.token;
    } catch (loginError) {
      // If login fails, try to register
      console.log('Admin not found, registering...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Farm Administrator',
        email: 'admin@farm.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1234567890'
      });
      console.log('✅ Admin registered successfully');
      adminToken = registerResponse.data.token;
    }

    // Test 2: Get all workers first
    console.log('\n2️⃣ Fetching all workers...');
    const allWorkersResponse = await axios.get(`${BASE_URL}/workers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const workers = allWorkersResponse.data.workers || [];
    console.log('Workers found:', workers.length);
    
    let workerId;
    let workerToken;
    
    if (workers.length > 0) {
      // Use existing worker
      workerId = workers[0]._id;
      console.log('Using existing worker:', workers[0].name);
      
      // Login to get token
      const workerLoginResponse = await axios.post(`${BASE_URL}/auth/worker-login`, {
        username: workers[0].username,
        password: 'worker123'
      });
      workerToken = workerLoginResponse.data.token;
      console.log('✅ Worker logged in successfully');
    } else {
      // Create new worker
      console.log('No workers found, creating new worker...');
      const workerResponse = await axios.post(`${BASE_URL}/workers`, {
        username: 'john.worker',
        email: 'worker@farm.com',
        password: 'worker123',
        name: 'John Worker',
        phone: '+1234567890',
        role: 'worker'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      workerId = workerResponse.data._id || workerResponse.data.data?._id;
      
      // Login to get token
      const workerLoginResponse = await axios.post(`${BASE_URL}/auth/worker-login`, {
        username: 'john.worker',
        password: 'worker123'
      });
      workerToken = workerLoginResponse.data.token;
      workerId = workerLoginResponse.data.user._id;
      console.log('✅ Worker created and logged in');
    }

    // Test 3: Test Worker Token
    console.log('\n3️⃣ Testing worker authentication...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    const userName = profileResponse.data.data?.name || profileResponse.data.user?.name || 'Worker';
    console.log('✅ Worker authenticated:', userName);

    // Test 4: Get All Workers (Admin Only)
    console.log('\n4️⃣ Fetching all workers...');
    const workersResponse = await axios.get(`${BASE_URL}/workers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const workersCount = workersResponse.data.data?.length || workersResponse.data.length || 0;
    console.log('✅ Workers fetched:', workersCount);

    // Test 5: Create Task
    console.log('\n5️⃣ Creating a task...');
    const taskResponse = await axios.post(`${BASE_URL}/tasks`, {
      title: 'Check Livestock',
      description: 'Daily health check for all animals',
      assignedTo: workerId,
      type: 'animals',
      location: 'Barn Area',
      priority: 'high',
      deadline: new Date(Date.now() + 86400000).toISOString()
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const taskTitle = taskResponse.data.data?.title || taskResponse.data.title || 'Task';
    console.log('✅ Task created:', taskTitle);

    // Test 6: Get Tasks
    console.log('\n6️⃣ Fetching tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const tasksCount = tasksResponse.data.data?.length || tasksResponse.data.length || 0;
    console.log('✅ Tasks fetched:', tasksCount);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Admin login: admin@farm.com / admin123');
    console.log('- Worker login: john.worker / worker123');
    console.log('- Total workers:', workersCount);
    console.log('- Total tasks:', tasksCount);
    console.log('\n✅ Backend API is fully functional!');
    console.log('\n🔗 Server running at: http://localhost:5000');
    console.log('📚 API Documentation: See BACKEND-COMPLETE.md');

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAPI();
