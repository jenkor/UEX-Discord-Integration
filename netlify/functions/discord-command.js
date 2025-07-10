/**
 * Discord Command Handler
 * Processes Discord commands and sends replies to UEX Corp API
 */

// Response helpers
const success = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

// Send reply to UEX API using their exact format
async function sendToUEX(negotiationHash, message, secretKey) {
  try {
    const response = await fetch('https://api.uexcorp.space/2.0/marketplace_negotiations_messages/', {
      method: 'POST',
      headers: {
        'secret_key': secretKey,
        'Content-Type': 'application/json',
        'User-Agent': 'UEX-Discord-Bot/1.0'
      },
      body: JSON.stringify({
        hash: negotiationHash,
        message: message,
        is_production: 1  // Set to 1 for production, 0 for testing
      })
    });

    const responseText = await response.text();
    
    // UEX API returns text responses like "ok", "negotiation_not_found", etc.
    if (responseText === 'ok') {
      return { success: true, response: responseText };
    } else {
      throw new Error(`UEX API error: ${responseText}`);
    }

  } catch (err) {
    console.error('[ERROR] UEX API request failed:', err);
    throw err;
  }
}

// Send confirmation back to Discord
async function sendDiscordConfirmation(webhookUrl, message, isSuccess = true) {
  try {
    const embed = {
      title: isSuccess ? '✅ Reply Sent Successfully' : '❌ Reply Failed',
      description: message,
      color: isSuccess ? 0x00ff00 : 0xff0000,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (!response.ok) {
      console.warn('[WARN] Failed to send Discord confirmation:', response.status);
    }
  } catch (err) {
    console.warn('[WARN] Discord confirmation failed:', err);
  }
}

// Parse Discord command
function parseCommand(content) {
  const trimmed = content.trim();
  
  // Handle /reply command
  if (trimmed.startsWith('/reply ')) {
    const parts = trimmed.split(' ');
    if (parts.length < 3) {
      return { error: 'Invalid format. Use: `/reply <negotiation_hash> <your message>`' };
    }
    
    const negotiationHash = parts[1];
    const message = parts.slice(2).join(' ');
    
    return {
      command: 'reply',
      negotiationHash,
      message
    };
  }
  
  // Handle other commands (for future expansion)
  return { error: 'Unknown command. Use `/reply <hash> <message>`' };
}

// Main handler
exports.handler = async (event, context) => {
  console.log('[INFO] Discord command received');

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return success('CORS preflight handled');
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    // Parse Discord webhook data
    const body = event.body;
    if (!body) {
      return error('No data received');
    }

    let discordData;
    try {
      discordData = JSON.parse(body);
    } catch (parseError) {
      console.error('[ERROR] Invalid JSON:', parseError);
      return error('Invalid JSON payload');
    }

    console.log('[INFO] Discord data received:', JSON.stringify(discordData, null, 2));

    // Handle Discord verification challenge (if using Discord bot webhooks)
    if (discordData.type === 1) {
      return success({ type: 1 }); // ACK ping
    }

    // Extract message content
    const content = discordData.content || discordData.data?.options?.[0]?.value;
    if (!content) {
      console.warn('[WARN] No content in Discord message');
      return success('No command content');
    }

    // Parse the command
    const parsed = parseCommand(content);
    if (parsed.error) {
      console.warn('[WARN] Command parse error:', parsed.error);
      
      // Send error back to Discord if webhook URL is available
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (discordWebhookUrl) {
        await sendDiscordConfirmation(discordWebhookUrl, parsed.error, false);
      }
      
      return error(parsed.error);
    }

    // Handle reply command
    if (parsed.command === 'reply') {
      const { negotiationHash, message } = parsed;

      // Get UEX API configuration
      const uexSecretKey = process.env.UEX_SECRET_KEY;
      
      if (!uexSecretKey) {
        const configError = 'UEX API secret key not configured';
        console.error('[ERROR]', configError);
        
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
          await sendDiscordConfirmation(discordWebhookUrl, configError, false);
        }
        
        return error(configError, 500);
      }

      try {
        // Send reply to UEX
        const uexResponse = await sendToUEX(negotiationHash, message, uexSecretKey);
        
        console.log('[INFO] Reply sent to UEX successfully:', negotiationHash);

        // Send success confirmation to Discord
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
          await sendDiscordConfirmation(
            discordWebhookUrl,
            `**Reply sent to negotiation:** \`${negotiationHash}\`\n**Message:** "${message}"`,
            true
          );
        }

        return success({
          message: 'Reply sent to UEX successfully',
          negotiation_hash: negotiationHash,
          reply_message: message,
          uex_response: uexResponse.response
        });

      } catch (uexError) {
        console.error('[ERROR] Failed to send reply to UEX:', uexError);
        
        // Send error confirmation to Discord
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
          await sendDiscordConfirmation(
            discordWebhookUrl,
            `**Failed to send reply:** ${uexError.message}`,
            false
          );
        }

        return error(`Failed to send reply: ${uexError.message}`, 500);
      }
    }

    return error('Unsupported command');

  } catch (err) {
    console.error('[ERROR] Command processing failed:', err);
    return error(`Command processing failed: ${err.message}`, 500);
  }
}; 