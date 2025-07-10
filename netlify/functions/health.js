/**
 * Health Check Function
 * Provides status information about the UEX-Discord integration
 */

// Response helpers
const success = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  },
  body: JSON.stringify({ success: true, data })
});

const error = (message, statusCode = 400) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({ success: false, error: message })
});

// Check configuration status
function checkConfiguration() {
  const config = {
    discord_webhook_url: !!process.env.DISCORD_WEBHOOK_URL,
    discord_channel_id: !!process.env.DISCORD_CHANNEL_ID,
    uex_api_token: !!process.env.UEX_API_TOKEN,
    uex_secret_key: !!process.env.UEX_SECRET_KEY,
    uex_webhook_secret: !!process.env.UEX_WEBHOOK_SECRET,
    discord_bot_token: !!process.env.DISCORD_BOT_TOKEN,
    discord_guild_id: !!process.env.DISCORD_GUILD_ID,
    discord_public_key: !!process.env.DISCORD_PUBLIC_KEY
  };

  const required = ['discord_webhook_url', 'uex_api_token', 'uex_secret_key'];
  const missing = required.filter(key => !config[key]);
  
  const discordBotVars = ['discord_bot_token', 'discord_guild_id', 'discord_public_key'];
  const discordBotMissing = discordBotVars.filter(key => !config[key]);
  
  return {
    configured: config,
    is_valid: missing.length === 0,
    missing_required: missing,
    optional_missing: Object.keys(config).filter(key => 
      !required.includes(key) && !discordBotVars.includes(key) && !config[key]
    ),
    discord_bot: {
      configured: discordBotMissing.length === 0,
      missing: discordBotMissing,
      status: discordBotMissing.length === 0 ? 'ready_for_slash_commands' : 'webhook_notifications_only'
    }
  };
}

// Test external service connectivity
async function testConnectivity() {
  const results = {
    discord: { status: 'unknown', message: 'Not tested' },
    uex: { status: 'unknown', message: 'Not tested' }
  };

  // Test Discord webhook (if configured)
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhookUrl) {
    try {
      // Send a minimal test message
      const testPayload = {
        embeds: [{
          title: '🔧 Health Check',
          description: 'Integration is healthy',
          color: 0x00ff00,
          footer: { text: 'UEX-Discord Integration' }
        }]
      };

      const response = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'UEX-Discord-Bot/1.0'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        results.discord = { 
          status: 'healthy', 
          message: 'Webhook responding correctly' 
        };
      } else {
        results.discord = { 
          status: 'error', 
          message: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (err) {
      results.discord = { 
        status: 'error', 
        message: err.message 
      };
    }
  } else {
    results.discord = { 
      status: 'not_configured', 
      message: 'Discord webhook URL not set' 
    };
  }

  // Test UEX API endpoint (if configured)
  const uexApiToken = process.env.UEX_API_TOKEN;
  const uexSecretKey = process.env.UEX_SECRET_KEY;
  
  if (uexApiToken && uexSecretKey) {
    try {
      // Test if the UEX API is reachable with authentication
      const response = await fetch('https://api.uexcorp.space/2.0/', {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${uexApiToken}`,
          'User-Agent': 'UEX-Discord-Bot/1.0'
        }
      });

      results.uex = { 
        status: 'reachable', 
        message: `UEX API is reachable with authentication (${response.status})` 
      };
    } catch (err) {
      results.uex = { 
        status: 'error', 
        message: err.message 
      };
    }
  } else {
    const missing = [];
    if (!uexApiToken) missing.push('UEX_API_TOKEN');
    if (!uexSecretKey) missing.push('UEX_SECRET_KEY');
    
    results.uex = { 
      status: 'not_configured', 
      message: `Missing UEX credentials: ${missing.join(', ')}` 
    };
  }

  return results;
}

// Main handler
exports.handler = async (event, context) => {
  console.log('[INFO] Health check requested');

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return success('CORS preflight handled');
  }

  // Only accept GET requests
  if (event.httpMethod !== 'GET') {
    return error('Method not allowed', 405);
  }

  try {
    const startTime = Date.now();
    
    // Check configuration
    const configStatus = checkConfiguration();
    
    // Test connectivity (only if basic config is valid)
    let connectivityStatus = null;
    if (configStatus.is_valid) {
      connectivityStatus = await testConnectivity();
    }

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: configStatus.is_valid ? 'healthy' : 'configuration_error',
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      configuration: configStatus,
      connectivity: connectivityStatus,
      environment: {
        node_version: process.version,
        netlify_region: process.env.NETLIFY_REGION || 'unknown',
        deployment_id: process.env.DEPLOY_ID || 'unknown'
      },
      endpoints: {
        uex_webhook: `${process.env.NETLIFY_SITE_URL || 'https://your-site.netlify.app'}/.netlify/functions/uex-webhook`,
        discord_command: `${process.env.NETLIFY_SITE_URL || 'https://your-site.netlify.app'}/.netlify/functions/discord-command`,
        health_check: `${process.env.NETLIFY_SITE_URL || 'https://your-site.netlify.app'}/.netlify/functions/health`
      },
      api_info: {
        uex_endpoint: 'https://api.uexcorp.space/2.0/marketplace_negotiations_messages/',
        discord_webhook_configured: !!process.env.DISCORD_WEBHOOK_URL,
        production_mode: true
      }
    };

    const statusCode = configStatus.is_valid ? 200 : 503;
    
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        success: configStatus.is_valid,
        data: healthData
      }, null, 2)
    };

  } catch (err) {
    console.error('[ERROR] Health check failed:', err);
    return error(`Health check failed: ${err.message}`, 500);
  }
}; 