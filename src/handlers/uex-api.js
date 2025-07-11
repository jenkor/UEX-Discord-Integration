/**
 * UEX API Handler
 * All functions for communicating with the UEX Corp API
 */

const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Send a reply message to a UEX negotiation
 * @param {string} negotiationHash - The negotiation hash from UEX
 * @param {string} message - The message to send
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendReply(negotiationHash, message) {
  try {
    logger.uex(`Sending reply to negotiation: ${negotiationHash}`);
    
    const response = await fetch(`${config.UEX_API_BASE_URL}/marketplace_negotiations_messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.UEX_API_TOKEN}`,
        'secret_key': config.UEX_SECRET_KEY,
        'User-Agent': 'UEX-Discord-Bot/2.0'
      },
      body: JSON.stringify({
        hash: negotiationHash,
        message: message,
        is_production: 1
      })
    });

    const responseText = await response.text();
    logger.uex('API response received', { 
      status: response.status, 
      statusText: response.statusText,
      body: responseText 
    });

    // Handle different response formats from UEX API
    if (response.ok) {
      try {
        // Try to parse as JSON first
        const jsonResponse = JSON.parse(responseText);
        
        if (jsonResponse.status === 'ok' && jsonResponse.http_code === 200) {
          const messageId = jsonResponse.data?.id_message;
          logger.success(`Reply sent successfully to ${negotiationHash}`, { messageId });
          return { 
            success: true, 
            messageId: messageId,
            data: jsonResponse.data 
          };
        } else {
          throw new Error(`UEX API error: ${jsonResponse.error || 'Unknown error'}`);
        }
      } catch (parseError) {
        // Handle text responses like "ok", "negotiation_not_found", etc.
        if (responseText.trim() === 'ok') {
          logger.success(`Reply sent successfully to ${negotiationHash}`);
          return { success: true };
        } else {
          throw new Error(`UEX API error: ${responseText}`);
        }
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

  } catch (error) {
    logger.error(`Failed to send reply to UEX`, {
      negotiationHash,
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test connection to UEX API
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function testConnection() {
  try {
    logger.uex('Testing UEX API connection');
    
    // Use a simple endpoint to test connectivity
    const response = await fetch(`${config.UEX_API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.UEX_API_TOKEN}`,
        'secret_key': config.UEX_SECRET_KEY,
        'User-Agent': 'UEX-Discord-Bot/2.0'
      }
    });

    if (response.ok) {
      logger.success('UEX API connection test successful');
      return { success: true };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }

  } catch (error) {
    logger.error('UEX API connection test failed', { error: error.message });
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Validate UEX webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Signature from X-UEX-Signature header
 * @returns {boolean}
 */
function validateWebhookSignature(body, signature) {
  if (!config.UEX_WEBHOOK_SECRET) {
    logger.warn('UEX_WEBHOOK_SECRET not configured - skipping signature verification');
    return true; // Skip validation if not configured
  }
  
  if (!signature) {
    logger.warn('No signature provided but UEX_WEBHOOK_SECRET is configured');
    return false;
  }
  
  try {
    const crypto = require('crypto');
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', config.UEX_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
      
    const isValid = signature === expectedSignature;
    
    if (isValid) {
      logger.success('UEX webhook signature validated');
    } else {
      logger.error('UEX webhook signature mismatch');
    }
    
    return isValid;
  } catch (error) {
    logger.error('Error validating UEX webhook signature', { error: error.message });
    return false;
  }
}

/**
 * Parse and validate UEX webhook data
 * @param {string} rawBody - Raw webhook body
 * @returns {{valid: boolean, data?: object, error?: string}}
 */
function parseWebhookData(rawBody) {
  try {
    const data = JSON.parse(rawBody);
    
    // Validate required fields
    const { negotiation_hash: hash, message } = data;
    if (!hash || !message) {
      return {
        valid: false,
        error: 'Missing required fields: negotiation_hash, message'
      };
    }
    
    return {
      valid: true,
      data: data
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error.message}`
    };
  }
}

module.exports = {
  sendReply,
  testConnection,
  validateWebhookSignature,
  parseWebhookData
}; 