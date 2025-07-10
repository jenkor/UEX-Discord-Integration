/**
 * DEBUG VERSION: Discord Bot Function
 * This version logs everything for Discord verification debugging
 */

const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Log EVERYTHING for debugging Discord verification
  console.log('=== DISCORD BOT DEBUG FUNCTION CALLED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', event.httpMethod);
  console.log('URL:', event.path);
  console.log('Query params:', JSON.stringify(event.queryStringParameters));
  console.log('Raw Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Raw Body:', event.body);
  console.log('Body length:', event.body ? event.body.length : 'null');
  console.log('Context:', JSON.stringify(context, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('[OPTIONS] CORS preflight request');
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ message: 'CORS preflight OK' })
    };
  }

  // Handle GET requests (like browser visits)
  if (event.httpMethod === 'GET') {
    console.log('[GET] Browser/GET request detected');
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'text/html' },
      body: `
        <html>
          <body>
            <h1>Discord Bot Debug Endpoint</h1>
            <p>This endpoint expects POST requests from Discord.</p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>Function is working correctly!</p>
          </body>
        </html>
      `
    };
  }

  // Only accept POST requests for Discord interactions
  if (event.httpMethod !== 'POST') {
    console.log('[ERROR] Non-POST/OPTIONS/GET request:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        allowed: ['POST', 'OPTIONS', 'GET'],
        received: event.httpMethod
      })
    };
  }

  try {
    console.log('[INFO] POST request received, processing...');
    
    // Parse Discord interaction
    let body;
    try {
      if (!event.body) {
        console.log('[ERROR] No body in request');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No body provided' })
        };
      }

      body = JSON.parse(event.body);
      console.log('[SUCCESS] Body parsed successfully:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.log('[ERROR] Failed to parse body:', parseError.message);
      console.log('[ERROR] Raw body was:', event.body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON',
          details: parseError.message,
          received: event.body 
        })
      };
    }

    // Check Discord headers
    const signature = event.headers['x-signature-ed25519'] || event.headers['X-Signature-Ed25519'];
    const timestamp = event.headers['x-signature-timestamp'] || event.headers['X-Signature-Timestamp'];
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'];
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    
    console.log('[DEBUG] Discord headers analysis:');
    console.log('- Signature (x-signature-ed25519):', signature ? 'PRESENT' : 'MISSING');
    console.log('- Timestamp (x-signature-timestamp):', timestamp ? 'PRESENT' : 'MISSING');
    console.log('- User-Agent:', userAgent);
    console.log('- Content-Type:', contentType);
    console.log('- Discord Public Key configured:', process.env.DISCORD_PUBLIC_KEY ? 'YES' : 'NO');

    // Handle Discord PING (verification)
    if (body.type === 1) {
      console.log('[SUCCESS] ✅ Discord PING received - this is the verification request!');
      console.log('[SUCCESS] ✅ Sending PONG response with type: 1');
      
      const response = {
        statusCode: 200,
        headers,
        body: JSON.stringify({ type: 1 })
      };
      
      console.log('[SUCCESS] ✅ Response object:', JSON.stringify(response, null, 2));
      console.log('[SUCCESS] ✅ This should complete Discord verification!');
      
      return response;
    }

    // Handle slash command interactions (type 2)
    if (body.type === 2) {
      console.log('[INFO] Discord slash command interaction received');
      const commandName = body.data?.name || 'unknown';
      console.log('[INFO] Command name:', commandName);

      if (commandName === 'reply') {
        console.log('[INFO] Processing /reply command');
        return await handleReplyCommand(body);
      }

      console.log('[WARN] Unknown command:', commandName);
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
    console.log('[WARN] Unhandled Discord interaction type:', body.type);
    console.log('[INFO] Full interaction data:', JSON.stringify(body, null, 2));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        type: 4, 
        data: { 
          content: `Received interaction type ${body.type} - not yet supported`
        }
      })
    };

  } catch (error) {
    console.error('[ERROR] ❌ Critical error in discord-bot function:', error);
    console.error('[ERROR] ❌ Stack trace:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        type: 'function_error'
      })
    };
  }
};

async function handleReplyCommand(interaction) {
  try {
    console.log('[REPLY] Processing reply command interaction');
    
    const options = interaction.data.options || [];
    const hashOption = options.find(opt => opt.name === 'hash');
    const messageOption = options.find(opt => opt.name === 'message');
    
    if (!hashOption || !messageOption) {
      console.log('[REPLY] Missing required parameters');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: { 
            content: '❌ Missing required parameters. Use: `/reply hash message`',
            flags: 64 // Ephemeral
          }
        })
      };
    }

    const hash = hashOption.value;
    const message = messageOption.value;

    console.log('[REPLY] Sending to UEX:', { hash, messageLength: message.length });

    // For now, just acknowledge the command
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4,
        data: {
          content: `✅ **Reply Command Received (Debug Mode)**\n\`\`\`\nNegotiation: ${hash}\nMessage: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"\n\`\`\`\n*Note: UEX API integration temporarily disabled for debugging*`,
          flags: 64 // Ephemeral
        }
      })
    };

  } catch (error) {
    console.error('[REPLY] Error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4,
        data: { 
          content: `❌ Error processing reply: ${error.message}`, 
          flags: 64 
        }
      })
    };
  }
} 