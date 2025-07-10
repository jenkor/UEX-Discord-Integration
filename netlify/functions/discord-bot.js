/**
 * Discord Bot Function for UEX Integration
 * Handles Discord slash commands and interactions with proper Ed25519 signature verification
 */

const crypto = require('crypto');

exports.handler = async (event, context) => {
  console.log('=== DISCORD BOT FUNCTION ===');
  console.log('Method:', event.httpMethod);
  
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

    const body = JSON.parse(event.body);
    console.log('[INFO] Discord interaction type:', body.type);

    // Get Discord signature headers
    const signature = event.headers['x-signature-ed25519'] || event.headers['X-Signature-Ed25519'];
    const timestamp = event.headers['x-signature-timestamp'] || event.headers['X-Signature-Timestamp'];
    
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
    if (!process.env.UEX_API_TOKEN || !process.env.UEX_SECRET_KEY) {
      const missing = [];
      if (!process.env.UEX_API_TOKEN) missing.push('UEX_API_TOKEN');
      if (!process.env.UEX_SECRET_KEY) missing.push('UEX_SECRET_KEY');
      throw new Error(`Missing UEX API configuration: ${missing.join(', ')}`);
    }

    console.log('[UEX] Sending reply to API');

    const response = await fetch('https://api.uexcorp.space/2.0/marketplace_negotiations_messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.UEX_API_TOKEN}`,
        'secret_key': process.env.UEX_SECRET_KEY
      },
      body: JSON.stringify({
        hash: hash,
        message: message,
        is_production: 1
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
    console.log('[DEBUG] Verifying Discord signature');
    console.log('- Body length:', body.length);
    console.log('- Timestamp:', timestamp);
    console.log('- Signature length:', signature.length);
    console.log('- Public key length:', publicKey.length);

    // Discord signature verification according to official docs
    // Message = timestamp + body (string concatenation)
    const message = timestamp + body;
    
    // Convert hex strings to Buffer
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    const messageBuffer = Buffer.from(message, 'utf8');

    console.log('[DEBUG] Message to verify (first 100 chars):', message.substring(0, 100));

    // Method 1: Try with crypto.verify using ed25519
    try {
      // Create a proper Ed25519 public key object
      const keyObject = crypto.createPublicKey({
        key: publicKeyBuffer,
        format: 'der',
        type: 'spki'
      });
      
      const isValid = crypto.verify('ed25519', messageBuffer, keyObject, signatureBuffer);
      console.log('[DEBUG] Method 1 (crypto.verify ed25519):', isValid);
      if (isValid) return true;
    } catch (error) {
      console.log('[DEBUG] Method 1 failed:', error.message);
    }

    // Method 2: Manual verification with raw key
    try {
      // For Ed25519, the signature verification formula is:
      // verify(message, signature, public_key)
      const isValid = crypto.verify(
        null, // Let Node.js auto-detect the algorithm
        messageBuffer,
        {
          key: publicKeyBuffer,
          format: 'raw'
        },
        signatureBuffer
      );
      console.log('[DEBUG] Method 2 (raw key):', isValid);
      if (isValid) return true;
    } catch (error) {
      console.log('[DEBUG] Method 2 failed:', error.message);
    }

    // Method 3: Try with ASN.1 DER encoding
    try {
      // Ed25519 public key in ASN.1 DER format
      const algorithmIdentifier = Buffer.from([
        0x30, 0x05, // SEQUENCE, length 5
        0x06, 0x03, // OID, length 3
        0x2b, 0x65, 0x70 // Ed25519 OID: 1.3.101.112
      ]);
      
      const keyBitString = Buffer.concat([
        Buffer.from([0x03, 0x21, 0x00]), // BIT STRING, length 33, unused bits 0
        publicKeyBuffer
      ]);
      
      const derKey = Buffer.concat([
        Buffer.from([0x30]), // SEQUENCE
        Buffer.from([algorithmIdentifier.length + keyBitString.length]), // Length
        algorithmIdentifier,
        keyBitString
      ]);

      const keyObject = crypto.createPublicKey({
        key: derKey,
        format: 'der',
        type: 'spki'
      });

      const isValid = crypto.verify(null, messageBuffer, keyObject, signatureBuffer);
      console.log('[DEBUG] Method 3 (DER encoding):', isValid);
      if (isValid) return true;
    } catch (error) {
      console.log('[DEBUG] Method 3 failed:', error.message);
    }

    console.log('[ERROR] All signature verification methods failed');
    return false;

  } catch (error) {
    console.error('[ERROR] Signature verification error:', error);
    return false;
  }
} 