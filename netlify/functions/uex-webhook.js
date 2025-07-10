/**
 * UEX Webhook Handler
 * Receives webhooks from UEX Corp and sends notifications to Discord
 */

const crypto = require('crypto');

// Response helpers
const success = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-UEX-Signature'
  },
  body: JSON.stringify({ success: true, data })
});

const error = (message, statusCode = 400) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-UEX-Signature'
  },
  body: JSON.stringify({ success: false, error: message })
});

// Validate webhook signature (optional - only if UEX_WEBHOOK_SECRET is configured)
function validateWebhook(body, signature, secret) {
  if (!secret) {
    console.log('[INFO] UEX_WEBHOOK_SECRET not configured - skipping signature verification');
    return true; // Skip validation if not configured
  }
  
  if (!signature) {
    console.warn('[WARN] No signature provided but UEX_WEBHOOK_SECRET is configured');
    return false;
  }
  
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
    
  const isValid = signature === expectedSignature;
  if (!isValid) {
    console.error('[ERROR] Webhook signature mismatch');
  }
  
  return isValid;
}

// Send message to Discord
async function sendToDiscord(webhookUrl, payload) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'UEX-Discord-Bot/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord API error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('[ERROR] Discord webhook failed:', err);
    throw err;
  }
}

// Format UEX data for Discord
function formatDiscordMessage(uexData) {
  const {
    negotiation_hash: hash = 'Unknown',
    last_message: message = 'No message',
    sender_username: sender = 'Unknown sender',
    listing_title: title = 'Unknown listing',
    event_type: eventType = 'negotiation'
  } = uexData;

  // Create Discord embed
  const embed = {
    title: '🔔 New UEX Message',
    description: `**${title}**`,
    color: eventType === 'negotiation_started' ? 0x00ff00 : 0x0099ff,
    fields: [
      {
        name: '👤 From',
        value: sender,
        inline: true
      },
      {
        name: '📝 Message',
        value: `"${message}"`,
        inline: false
      },
      {
        name: '💬 Reply Command',
        value: `\`/reply ${hash} your message here\``,
        inline: false
      }
    ],
    footer: {
      text: `Negotiation: ${hash}`
    },
    timestamp: new Date().toISOString()
  };

  return { embeds: [embed] };
}

// Main handler
exports.handler = async (event, context) => {
  console.log('[INFO] UEX webhook received');

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return success('CORS preflight handled');
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    // Parse webhook data
    const body = event.body;
    const signature = event.headers['x-uex-signature'] || event.headers['X-UEX-Signature'];
    
    if (!body) {
      return error('No webhook data received');
    }

    // Validate webhook signature if secret is configured
    const webhookSecret = process.env.UEX_WEBHOOK_SECRET;
    if (!validateWebhook(body, signature, webhookSecret)) {
      console.error('[ERROR] Invalid webhook signature');
      return error('Invalid webhook signature', 401);
    }

    let uexData;
    try {
      uexData = JSON.parse(body);
    } catch (parseError) {
      console.error('[ERROR] Invalid JSON:', parseError);
      return error('Invalid JSON payload');
    }

    console.log('[INFO] UEX data received:', JSON.stringify(uexData, null, 2));

    // Validate required fields
    const { negotiation_hash: hash, last_message: message } = uexData;
    if (!hash || !message) {
      console.warn('[WARN] Missing required fields:', { hash, message });
      return error('Missing required fields: negotiation_hash, last_message');
    }

    // Get Discord webhook URL
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
      console.error('[ERROR] Discord webhook URL not configured');
      return error('Discord webhook not configured', 500);
    }

    // Format and send to Discord
    const discordPayload = formatDiscordMessage(uexData);
    await sendToDiscord(discordWebhookUrl, discordPayload);

    console.log('[INFO] Notification sent to Discord successfully');
    
    // Store in memory MCP if available (for tracking)
    // This could be implemented later for advanced features

    return success({
      message: 'Notification sent to Discord',
      negotiation_hash: hash
    });

  } catch (err) {
    console.error('[ERROR] Webhook processing failed:', err);
    return error(`Webhook processing failed: ${err.message}`, 500);
  }
}; 