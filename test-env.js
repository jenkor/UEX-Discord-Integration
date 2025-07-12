// Test script to debug environment variable loading
console.log('Testing environment variable loading...');

// Test 1: Check if dotenv is available
try {
  console.log('Attempting to require dotenv...');
  const dotenv = require('dotenv');
  console.log('✅ dotenv module loaded successfully');
  
  // Test 2: Load .env.local
  const result = dotenv.config({ path: '.env.local' });
  console.log('dotenv.config result:', result);
  
  // Test 3: Check environment variables
  console.log('Environment variables:');
  console.log('DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'SET (length: ' + process.env.DISCORD_BOT_TOKEN.length + ')' : 'NOT SET');
  console.log('USER_ENCRYPTION_KEY:', process.env.USER_ENCRYPTION_KEY ? 'SET (length: ' + process.env.USER_ENCRYPTION_KEY.length + ')' : 'NOT SET');
  
  // Test 4: Show first few characters of token if set
  if (process.env.DISCORD_BOT_TOKEN) {
    console.log('Token starts with:', process.env.DISCORD_BOT_TOKEN.substring(0, 10) + '...');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} 