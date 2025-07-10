/**
 * PRODUCTION Discord Bot Function with Proper Signature Verification
 */

const crypto = require('crypto');

exports.handler = async (event, context) => {
  console.log('=== DISCORD BOT FUNCTION (VERIFIED) ===');
  console.log('Method:', event.httpMethod);
  console.log('Timestamp:', new Date().toISOString());
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp',
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
    if (!event.body) {
      console.log('[ERROR] No body in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No body provided' })
      };
    }

    const body = JSON.parse(event.body);
    console.log('[INFO] Discord interaction type:', body.type);

    // Discord signature verification
    const signature = event.headers['x-signature-ed25519'] || event.headers['X-Signature-Ed25519'];
    const timestamp = event.headers['x-signature-timestamp'] || event.headers['X-Signature-Timestamp'];
    
    console.log('[DEBUG] Signature verification:');
    console.log('- Signature present:', !!signature);
    console.log('- Timestamp present:', !!timestamp);
    console.log('- Public key configured:', !!process.env.DISCORD_PUBLIC_KEY);

    if (!process.env.DISCORD_PUBLIC_KEY) {
      console.error('[ERROR] DISCORD_PUBLIC_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    if (!signature || !timestamp) {
      console.error('[ERROR] Missing Discord signature headers');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing signature' })
      };
    }

    // Verify Discord signature
    const isValidSignature = verifyDiscordSignature(
      event.body, 
      signature, 
      timestamp, 
      process.env.DISCORD_PUBLIC_KEY
    );

    console.log('[DEBUG] Signature verification result:', isValidSignature);

    if (!isValidSignature) {
      console.error('[ERROR] Invalid Discord signature');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    console.log('[SUCCESS] Signature verified - request is from Discord');

    // Handle Discord PING (verification)
    if (body.type === 1) {
      console.log('[SUCCESS] Discord verification ping - sending pong');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ type: 1 })
      };
    }

    // Handle slash command interactions (type 2)
    if (body.type === 2) {
      const commandName = body.data?.name || 'unknown';
      console.log('[INFO] Slash command:', commandName);

      if (commandName === 'reply') {
        return await handleReplyCommand(body);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          type: 4,
          data: { content: `❌ Unknown command: ${commandName}` }
        })
      };
    }

    // Handle other interaction types
    console.log('[WARN] Unhandled interaction type:', body.type);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        type: 4, 
        data: { content: 'Interaction type not supported' }
      })
    };

  } catch (error) {
    console.error('[ERROR] Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      })
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
          data: { 
            content: '❌ Missing parameters. Use: `/reply hash message`',
            flags: 64
          }
        })
      };
    }

    const hash = hashOption.value;
    const message = messageOption.value;

    console.log('[REPLY] Processing:', { hash, messageLength: message.length });

    // Send to UEX API
    const result = await sendReplyToUEX(hash, message);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: {
            content: `✅ **Reply Sent Successfully**\n\`\`\`\nNegotiation: ${hash}\nMessage: "${message}"\n\`\`\``,
            flags: 64
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
            flags: 64
          }
        })
      };
    }

  } catch (error) {
    console.error('[REPLY] Error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4,
        data: { 
          content: `❌ Error: ${error.message}`, 
          flags: 64 
        }
      })
    };
  }
}

async function sendReplyToUEX(hash, message) {
  try {
    if (!process.env.UEX_SECRET_KEY) {
      throw new Error('UEX_SECRET_KEY not configured');
    }

    console.log('[UEX] Sending reply to API');

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
    console.log('[UEX] API response:', responseText);

    if (responseText === 'ok') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: responseText || `HTTP ${response.status}` 
      };
    }

  } catch (error) {
    console.error('[UEX] API error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

function verifyDiscordSignature(body, signature, timestamp, publicKey) {
  try {
    const timestampBuffer = Buffer.from(timestamp, 'utf8');
    const bodyBuffer = Buffer.from(body, 'utf8');
    const message = Buffer.concat([timestampBuffer, bodyBuffer]);
    
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    
    const isValid = crypto.verify(
      null, // Use null for Ed25519
      message,
      {
        key: publicKeyBuffer,
        format: 'der',
        type: 'spki'
      },
      signatureBuffer
    );
    
    return isValid;
  } catch (error) {
    console.error('[ERROR] Signature verification failed:', error);
    
    // Fallback verification method
    try {
      const message = timestamp + body;
      const key = Buffer.from(publicKey, 'hex');
      const sig = Buffer.from(signature, 'hex');
      
      return crypto.verify('ed25519', Buffer.from(message), key, sig);
    } catch (fallbackError) {
      console.error('[ERROR] Fallback verification failed:', fallbackError);
      return false;
    }
  }
} 