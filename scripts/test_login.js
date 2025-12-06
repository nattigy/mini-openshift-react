/**
 * Test script to verify React can successfully login to FastAPI
 * Run this in the browser console or via Node.js with Node 18+
 */

async function testLogin() {
  console.log('🧪 Testing authentication flow...\n');
  
  const API_URL = 'http://localhost:8000/api/v1';
  const credentials = {
    username: 'test@example.com',
    password: 'password123'
  };

  try {
    // Step 1: Login
    console.log('📝 Step 1: Attempting login with:', credentials.username);
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const loginResponse = await fetch(`${API_URL}/login/access-token`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('Token:', loginData.access_token.substring(0, 20) + '...');

    // Step 2: Get current user
    console.log('\n📝 Step 2: Fetching current user...');
    const userResponse = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`,
      },
      credentials: 'include',
    });

    if (!userResponse.ok) {
      throw new Error(`Get user failed: ${userResponse.status} ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    console.log('✅ User fetched successfully!');
    console.log('User:', userData);

    console.log('\n🎉 All tests passed! Authentication is working correctly.\n');
    return { success: true, token: loginData.access_token, user: userData };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testLogin();
