/**
 * User Manager
 * Securely manages multiple users' UEX API credentials for shared bot deployment
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const logger = require('./logger');

// File path for storing encrypted user data
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const ENCRYPTION_KEY = config.USER_ENCRYPTION_KEY;

/**
 * Ensure data directory exists
 */
async function ensureDataDirectory() {
  const dataDir = path.dirname(USERS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text with IV
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Load users data from file
 * @returns {Promise<object>} - Users data object
 */
async function loadUsersData() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // File doesn't exist yet
    }
    logger.error('Failed to load users data', { error: error.message });
    throw error;
  }
}

/**
 * Save users data to file
 * @param {object} usersData - Users data to save
 */
async function saveUsersData(usersData) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(USERS_FILE, JSON.stringify(usersData, null, 2));
  } catch (error) {
    logger.error('Failed to save users data', { error: error.message });
    throw error;
  }
}

/**
 * Validate UEX API credentials
 * @param {string} apiToken - UEX API token
 * @param {string} secretKey - UEX secret key
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateUEXCredentials(apiToken, secretKey) {
  try {
    logger.info('Validating UEX credentials');
    
    // Basic format validation first
    if (!apiToken || !secretKey || apiToken.length < 10 || secretKey.length < 10) {
      return { valid: false, error: 'API token and secret key must be at least 10 characters' };
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Test with a simple API call
      const response = await fetch(`${config.UEX_API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'secret_key': secretKey,
          'User-Agent': 'UEX-Discord-Bot/2.0-MultiUser'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        logger.success('UEX credentials validation successful');
        return { valid: true };
      } else {
        const error = `HTTP ${response.status}: ${response.statusText}`;
        logger.warn('UEX credentials validation failed', { error });
        return { valid: false, error };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        logger.warn('UEX API validation timeout - allowing registration anyway');
        return { valid: true }; // Allow registration if API is slow
      }
      throw fetchError;
    }

  } catch (error) {
    logger.error('UEX credentials validation error', { error: error.message });
    
    // If validation fails due to network issues, allow registration anyway
    // Users will get feedback when they try to use the credentials
    if (error.message.includes('fetch') || error.message.includes('network')) {
      logger.warn('Network error during validation - allowing registration');
      return { valid: true };
    }
    
    return { valid: false, error: error.message };
  }
}

/**
 * Register a new user with encrypted credentials
 * @param {string} userId - Discord user ID
 * @param {object} userData - User data including API credentials
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function registerUser(userId, userData) {
  try {
    logger.info('Registering new user', { userId, username: userData.username });

    const usersData = await loadUsersData();

    // Encrypt sensitive data
    const encryptedApiToken = encrypt(userData.apiToken);
    const encryptedSecretKey = encrypt(userData.secretKey);

    // Store encrypted credentials
    usersData[userId] = {
      username: userData.username,
      registeredAt: userData.registeredAt,
      encryptedAt: new Date().toISOString(),
      credentials: {
        apiToken: encryptedApiToken,
        secretKey: encryptedSecretKey
      },
      lastUsed: null,
      active: true
    };

    await saveUsersData(usersData);

    logger.success('User registered successfully', { userId, username: userData.username });
    return { success: true };

  } catch (error) {
    logger.error('Failed to register user', { 
      userId, 
      error: error.message,
      stack: error.stack 
    });
    return { success: false, error: error.message };
  }
}

/**
 * Get user credentials (decrypted)
 * @param {string} userId - Discord user ID
 * @returns {Promise<{found: boolean, credentials?: object, error?: string}>}
 */
async function getUserCredentials(userId) {
  try {
    const usersData = await loadUsersData();
    const userData = usersData[userId];

    if (!userData || !userData.active) {
      return { found: false };
    }

    // Decrypt credentials
    const credentials = {
      apiToken: decrypt(userData.credentials.apiToken),
      secretKey: decrypt(userData.credentials.secretKey)
    };

    // Update last used timestamp
    userData.lastUsed = new Date().toISOString();
    await saveUsersData(usersData);

    return { found: true, credentials };

  } catch (error) {
    logger.error('Failed to get user credentials', { userId, error: error.message });
    return { found: false, error: error.message };
  }
}

/**
 * Check if user is registered
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>}
 */
async function isUserRegistered(userId) {
  try {
    const usersData = await loadUsersData();
    return !!(usersData[userId] && usersData[userId].active);
  } catch (error) {
    logger.error('Failed to check user registration', { userId, error: error.message });
    return false;
  }
}

/**
 * Unregister a user (remove their credentials)
 * @param {string} userId - Discord user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function unregisterUser(userId) {
  try {
    logger.info('Unregistering user', { userId });

    const usersData = await loadUsersData();
    
    if (usersData[userId]) {
      usersData[userId].active = false;
      usersData[userId].unregisteredAt = new Date().toISOString();
      // Keep the record for audit purposes but mark as inactive
      
      await saveUsersData(usersData);
      
      logger.success('User unregistered successfully', { userId });
      return { success: true };
    } else {
      return { success: false, error: 'User not found' };
    }

  } catch (error) {
    logger.error('Failed to unregister user', { userId, error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Get user statistics for admin purposes
 * @returns {Promise<object>}
 */
async function getUserStats() {
  try {
    const usersData = await loadUsersData();
    const userIds = Object.keys(usersData);
    
    const stats = {
      totalUsers: userIds.length,
      activeUsers: userIds.filter(id => usersData[id].active).length,
      inactiveUsers: userIds.filter(id => !usersData[id].active).length,
      recentlyActive: userIds.filter(id => {
        const lastUsed = usersData[id].lastUsed;
        if (!lastUsed) return false;
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(lastUsed) > dayAgo;
      }).length
    };

    return stats;
  } catch (error) {
    logger.error('Failed to get user stats', { error: error.message });
    return { error: error.message };
  }
}

module.exports = {
  validateUEXCredentials,
  registerUser,
  getUserCredentials,
  isUserRegistered,
  unregisterUser,
  getUserStats
}; 