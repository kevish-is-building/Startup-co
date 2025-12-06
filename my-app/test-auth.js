#!/usr/bin/env node

/**
 * Simple script to test the new authentication system
 */

const testAuth = async () => {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test registration
    console.log('📝 Testing Registration...');
    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      }),
    });

    if (registerResponse.ok) {
      console.log('✅ Registration works!');
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.error);
    }

    // Test login
    console.log('\n🔐 Testing Login...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login works!');
      
      // Test session
      console.log('\n👤 Testing Session...');
      const sessionResponse = await fetch(`${baseURL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
        },
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log('✅ Session validation works!');
        console.log('User:', sessionData.user?.name);
      } else {
        console.log('❌ Session validation failed');
      }
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.error);
    }

    console.log('\n🎉 Authentication system test completed!');
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };