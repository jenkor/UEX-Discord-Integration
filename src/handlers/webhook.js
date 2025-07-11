/**
 * Webhook Handler
 * Logic for handling incoming UEX webhooks and sending Discord DMs
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../utils/config');
const logger = require('../utils/logger');
const uexAPI = require('./uex-api');

/**
 * Process UEX webhook and send DM notification to the appropriate user
 * @param {object} discordClient - Discord.js client instance
 * @param {string} rawBody - Raw webhook request body
 * @param {string} signature - Webhook signature from headers
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function processUEXWebhook(discordClient, rawBody, signature) {
  try {
    logger.webhook('Processing UEX webhook');

    // Validate webhook signature
    if (!uexAPI.validateWebhookSignature(rawBody, signature)) {
      return {
        success: false,
        error: 'Invalid webhook signature'
      };
    }

    // Parse webhook data
    const parseResult = uexAPI.parseWebhookData(rawBody);
    if (!parseResult.valid) {
      return {
        success: false,
        error: parseResult.error
      };
    }

    const uexData = parseResult.data;
    logger.webhook('UEX webhook data received', uexData);

    // In multi-user mode, we need to determine which user should receive this notification
    // For now, we'll log that this feature needs implementation for user-specific routing
    // This would require mapping UEX listing owners to Discord user IDs
    logger.warn('Multi-user webhook routing not yet implemented - webhook received but no user mapping available');

    return { 
      success: true, 
      message: 'Webhook received but user-specific routing not implemented yet' 
    };

  } catch (error) {
    logger.error('Failed to process UEX webhook', {
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create Discord embed for UEX notification
 * @param {object} uexData - UEX webhook data
 * @returns {EmbedBuilder}
 */
function createNotificationEmbed(uexData) {
  const {
    negotiation_hash: hash = 'Unknown',
    message = 'No message',
    client_username: sender = 'Unknown sender',
    listing_title: title = 'Unknown listing',
    event_type: eventType = 'negotiation'
  } = uexData;

  // Determine embed color based on event type
  let embedColor;
  switch (eventType) {
    case 'negotiation_started':
      embedColor = 0x00ff00; // Green for new negotiations
      break;
    case 'negotiation_message':
      embedColor = 0x0099ff; // Blue for messages
      break;
    case 'negotiation_completed':
      embedColor = 0xffd700; // Gold for completed
      break;
    default:
      embedColor = 0x0099ff; // Default blue
  }

  const embed = new EmbedBuilder()
    .setTitle('🔔 New UEX Message')
    .setDescription(`**${title}**`)
    .setColor(embedColor)
    .addFields([
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
    ])
    .setFooter({ text: `Negotiation: ${hash}` })
    .setTimestamp();

  // Add additional fields if available
  if (uexData.listing_price) {
    embed.addFields([{
      name: '💰 Price',
      value: `${uexData.listing_price} aUEC`,
      inline: true
    }]);
  }

  if (uexData.listing_location) {
    embed.addFields([{
      name: '📍 Location',
      value: uexData.listing_location,
      inline: true
    }]);
  }

  return embed;
}

/**
 * Send test DM to a specific user to verify bot functionality
 * @param {object} discordClient - Discord.js client instance
 * @param {string} userId - Discord user ID to send test DM to
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendTestDM(discordClient, userId) {
  try {
    logger.discord('Sending test DM', { userId });

    const user = await discordClient.users.fetch(userId);
    if (!user) {
      throw new Error(`Could not find Discord user with ID: ${userId}`);
    }

    const embed = new EmbedBuilder()
      .setTitle('🤖 UEX Discord Bot Test')
      .setDescription('The UEX Discord bot is working correctly!')
      .setColor(0x00ff00)
      .addFields([
        {
          name: '✅ Bot Status',
          value: 'Online and ready to receive your UEX notifications',
          inline: false
        },
        {
          name: '📨 DM Delivery',
          value: 'This message confirms that DM notifications are working',
          inline: false
        },
        {
          name: '🔗 Setup Webhook',
          value: 'Configure your UEX webhooks to point to the bot\'s `/webhook/uex` endpoint',
          inline: false
        },
        {
          name: '🔐 Privacy',
          value: 'Your credentials are encrypted and your notifications are private',
          inline: false
        }
      ])
      .setFooter({ text: 'UEX Discord Bot v2.0' })
      .setTimestamp();

    await user.send({ embeds: [embed] });

    logger.success('Test DM sent successfully', { userId });
    return { success: true };

  } catch (error) {
    logger.error('Failed to send test DM', {
      userId,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  processUEXWebhook,
  createNotificationEmbed,
  sendTestDM
}; 