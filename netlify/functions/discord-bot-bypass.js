/**
 * TEMPORARY Discord Bot Function - BYPASS SIGNATURE VERIFICATION
 * WARNING: For testing only! Not secure for production.
 */

exports.handler = async (event, context) => {
  console.log('=== DISCORD BOT BYPASS (TESTING ONLY) ===');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  
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
    if (!event.body) {
      console.log('[ERROR] No body in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No body provided' })
      };
    }

    console.log('[DEBUG] Raw body:', event.body);
    const body = JSON.parse(event.body);
    console.log('[DEBUG] Parsed body:', JSON.stringify(body, null, 2));

    // 🚨 BYPASS SIGNATURE VERIFICATION (FOR TESTING ONLY)
    console.log('[WARNING] SIGNATURE VERIFICATION BYPASSED - TESTING MODE');

    // Handle Discord PING (verification)
    if (body.type === 1) {
      console.log('[SUCCESS] Discord verification ping - sending pong (BYPASSED)');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ type: 1 })
      };
    }

    // Handle slash command interactions (type 2)
    if (body.type === 2) {
      const commandName = body.data?.name || 'unknown';
      console.log('[INFO] Slash command received:', commandName);

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
            content: `✅ **Reply Sent Successfully** (BYPASS MODE)\n\`\`\`\nNegotiation: ${hash}\nMessage: "${message}"\n\`\`\``,
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