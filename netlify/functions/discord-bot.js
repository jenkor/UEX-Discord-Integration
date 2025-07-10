const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse Discord interaction
    const body = JSON.parse(event.body);
    console.log('[INFO] Discord interaction received:', JSON.stringify(body, null, 2));

    // Discord requires verification for interactions
    const signature = event.headers['x-signature-ed25519'];
    const timestamp = event.headers['x-signature-timestamp'];
    
    if (process.env.DISCORD_PUBLIC_KEY) {
      const isValid = verifyDiscordSignature(event.body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY);
      if (!isValid) {
        console.error('[ERROR] Invalid Discord signature');
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
    }

    // Handle ping from Discord
    if (body.type === 1) {
      console.log('[INFO] Discord ping received');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ type: 1 })
      };
    }

    // Handle slash command interactions (type 2)
    if (body.type === 2) {
      const commandName = body.data?.name || 'unknown';
      console.log('[INFO] Discord slash command received:', commandName);

      if (commandName === 'reply') {
        return await handleReplyCommand(body);
      }
    }

    // Handle message component interactions (type 3)
    if (body.type === 3) {
      console.log('[INFO] Discord component interaction received');
      // Handle button clicks, select menus, etc. (future feature)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ type: 4, data: { content: 'Component interactions not yet supported' } })
      };
    }

    // Handle regular message (for text-based /reply commands)
    if (body.type === 0 && body.content) {
      const content = body.content.trim();
      if (content.startsWith('/reply ')) {
        return await handleTextReply(content, body.channel_id);
      }
    }

    console.log('[WARN] Unhandled Discord interaction type:', body.type);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ type: 4, data: { content: 'Unknown command' } })
    };

  } catch (error) {
    console.error('[ERROR] Discord bot error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

async function handleReplyCommand(interaction) {
  try {
    const options = interaction.data.options || [];
    const hashOption = options.find(opt => opt.name === 'hash');
    const messageOption = options.find(opt => opt.name === 'message');
    
    if (!hashOption || !messageOption) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: { content: '❌ Missing required parameters. Use: `/reply hash message`' }
        })
      };
    }

    const hash = hashOption.value;
    const message = messageOption.value;

    console.log('[INFO] Processing reply:', { hash, message });

    // Send reply to UEX API
    const result = await sendReplyToUEX(hash, message);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: {
            content: `✅ **Reply Sent Successfully**\n\`\`\`\nNegotiation: ${hash}\nMessage: "${message}"\n\`\`\``,
            flags: 64 // Ephemeral (only visible to user)
          }
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: {
            content: `❌ **Reply Failed**\n\`\`\`\nError: ${result.error}\nNegotiation: ${hash}\n\`\`\``,
            flags: 64 // Ephemeral
          }
        })
      };
    }

  } catch (error) {
    console.error('[ERROR] Reply command error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4,
        data: { content: `❌ Error processing reply: ${error.message}`, flags: 64 }
      })
    };
  }
}

async function handleTextReply(content, channelId) {
  try {
    // Parse: /reply 123abc Your message here
    const parts = content.split(' ');
    if (parts.length < 3) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '❌ Usage: `/reply HASH your message here`' })
      };
    }

    const hash = parts[1];
    const message = parts.slice(2).join(' ');

    console.log('[INFO] Processing text reply:', { hash, message });

    // Send reply to UEX API
    const result = await sendReplyToUEX(hash, message);
    
    // Send response back to Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      const responseContent = result.success 
        ? `✅ **Reply Sent Successfully**\n\`\`\`\nNegotiation: ${hash}\nMessage: "${message}"\n\`\`\``
        : `❌ **Reply Failed**\n\`\`\`\nError: ${result.error}\nNegotiation: ${hash}\n\`\`\``;

      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: responseContent,
          username: 'UEX Bot'
        })
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('[ERROR] Text reply error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function sendReplyToUEX(hash, message) {
  try {
    if (!process.env.UEX_SECRET_KEY) {
      throw new Error('UEX_SECRET_KEY not configured');
    }

    console.log('[INFO] Sending to UEX API:', { hash, message: message.substring(0, 50) + '...' });

    const response = await fetch('https://api.uexcorp.space/2.0/marketplace_negotiations_messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': process.env.UEX_SECRET_KEY
      },
      body: new URLSearchParams({
        hash: hash,
        message: message,
        is_production: '1'
      })
    });

    const responseText = await response.text();
    console.log('[INFO] UEX API response:', { status: response.status, body: responseText });

    if (responseText === 'ok') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: responseText || `HTTP ${response.status}` 
      };
    }

  } catch (error) {
    console.error('[ERROR] UEX API error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

function verifyDiscordSignature(body, signature, timestamp, publicKey) {
  try {
    const crypto = require('crypto');
    const message = timestamp + body;
    const key = Buffer.from(publicKey, 'hex');
    const sig = Buffer.from(signature, 'hex');
    
    return crypto.verify('ed25519', Buffer.from(message), key, sig);
  } catch (error) {
    console.error('[ERROR] Signature verification failed:', error);
    return false;
  }
} 