/**
 * Simple UEX API Test Function
 * Tests just the UEX API call without Discord integration
 */

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get configuration
    const uexSecretKey = process.env.UEX_SECRET_KEY;
    
    if (!uexSecretKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'UEX_SECRET_KEY not configured',
          env_check: {
            UEX_SECRET_KEY: !!process.env.UEX_SECRET_KEY,
            DISCORD_WEBHOOK_URL: !!process.env.DISCORD_WEBHOOK_URL
          }
        })
      };
    }

    // Parse request
    let requestData = {};
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (e) {
        requestData = { test: true };
      }
    }

    const hash = requestData.hash || 'test123';
    const message = requestData.message || 'Test message from Netlify function';

    console.log('[TEST] Attempting UEX API call:', { hash, message: message.substring(0, 20) + '...' });

    // Test UEX API call
    const response = await fetch('https://api.uexcorp.space/2.0/marketplace_negotiations_messages/', {
      method: 'POST',
      headers: {
        'secret_key': uexSecretKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'UEX-Test-Bot/1.0'
      },
      body: new URLSearchParams({
        hash: hash,
        message: message,
        is_production: '1'
      })
    });

    const responseText = await response.text();
    
    console.log('[TEST] UEX API response:', { 
      status: response.status, 
      statusText: response.statusText,
      body: responseText 
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        test_data: { hash, message },
        uex_api: {
          status: response.status,
          status_text: response.statusText,
          response: responseText,
          success: responseText === 'ok'
        },
        environment: {
          secret_key_configured: !!uexSecretKey,
          secret_key_length: uexSecretKey ? uexSecretKey.length : 0
        }
      })
    };

  } catch (error) {
    console.error('[TEST] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        name: error.name
      })
    };
  }
}; 