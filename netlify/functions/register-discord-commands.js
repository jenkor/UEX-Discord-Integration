/**
 * Discord Command Registration
 * One-time function to register slash commands with Discord
 * Call this after deploying to set up /reply command
 */

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID; // Your Discord server ID
    
    if (!botToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'DISCORD_BOT_TOKEN not configured' })
      };
    }

    if (!guildId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'DISCORD_GUILD_ID not configured' })
      };
    }

    // Extract bot application ID from token
    const appId = Buffer.from(botToken.split('.')[0], 'base64').toString();

    // Define the /reply slash command
    const replyCommand = {
      name: 'reply',
      description: 'Send a reply to a UEX negotiation',
      options: [
        {
          type: 3, // String
          name: 'hash',
          description: 'The negotiation hash from UEX notification',
          required: true
        },
        {
          type: 3, // String
          name: 'message', 
          description: 'Your reply message',
          required: true
        }
      ]
    };

    // Register command with Discord
    const discordUrl = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
    
    const response = await fetch(discordUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(replyCommand)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Discord API error ${response.status}: ${errorData}`);
    }

    const commandData = await response.json();
    
    console.log('[INFO] Slash command registered successfully:', commandData.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Slash command registered successfully',
        command_id: commandData.id,
        command_name: commandData.name,
        guild_id: guildId
      })
    };

  } catch (error) {
    console.error('[ERROR] Command registration failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Command registration failed',
        details: error.message
      })
    };
  }
}; 