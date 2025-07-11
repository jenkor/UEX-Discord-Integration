/**
 * Configuration Management
 * Loads and exports all environment variables for the UEX Discord Bot
 */

require('dotenv').config();

// Validate required environment variables
const requiredVars = [
  'DISCORD_BOT_TOKEN',
  'USER_ENCRYPTION_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('Note: UEX credentials are provided by individual users via /register command');
  console.error('Please check your .env file or environment configuration.');
  process.exit(1);
}

module.exports = {
  // Discord Configuration
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  
  // UEX Configuration
  UEX_WEBHOOK_SECRET: process.env.UEX_WEBHOOK_SECRET,
  UEX_API_BASE_URL: 'https://api.uexcorp.space/2.0',
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // Features
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false',
  
  // Security
  USER_ENCRYPTION_KEY: process.env.USER_ENCRYPTION_KEY,
  
  // Validation helper
  isProduction: () => module.exports.NODE_ENV === 'production',
  isDevelopment: () => module.exports.NODE_ENV === 'development'
}; 