/**
 * Button Interactions Handler
 * Handles Discord button interactions for UEX bot functionality
 */

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uexAPI = require('./uex-api');
const userManager = require('../utils/user-manager');
const logger = require('../utils/logger');

/**
 * Handle button interactions
 * @param {object} interaction - Discord button interaction
 */
async function handleButtonInteraction(interaction) {
  try {
    const customId = interaction.customId;
    
    if (customId.startsWith('reply_')) {
      await handleReplyButton(interaction);
    } else if (customId === 'help_credentials') {
      await handleHelpCredentialsButton(interaction);
    } else if (customId === 'view_negotiations') {
      await handleViewNegotiationsButton(interaction);
    } else if (customId === 'help_reply_command') {
      await handleHelpReplyCommandButton(interaction);
    } else {
      logger.warn('Unknown button interaction', { customId });
      await interaction.reply({ 
        content: '❌ Unknown button interaction', 
        ephemeral: true 
      });
    }
    
  } catch (error) {
    logger.error('Button interaction error', {
      error: error.message,
      stack: error.stack,
      customId: interaction.customId,
      userId: interaction.user.id
    });

    try {
      const errorMessage = '❌ An error occurred while processing your request.';
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      logger.error('Failed to send button error reply', { error: replyError.message });
    }
  }
}

/**
 * Handle reply button interaction
 * @param {object} interaction - Discord button interaction
 */
async function handleReplyButton(interaction) {
  try {
    // Extract negotiation hash from button custom ID
    const negotiationHash = interaction.customId.replace('reply_', '');
    
    logger.info('Reply button clicked', {
      negotiationHash,
      userId: interaction.user.id,
      username: interaction.user.username
    });

    // Check if user is registered
    const userResult = await userManager.getUserCredentials(interaction.user.id);
    
    if (!userResult.found) {
      const notRegisteredEmbed = new EmbedBuilder()
        .setTitle('❌ Not Registered')
        .setDescription('You need to register your UEX API credentials first.')
        .setColor(0xff0000)
        .addFields([
          {
            name: '📝 How to Register',
            value: 'Use `/register` command with your UEX API credentials',
            inline: false
          },
          {
            name: '🔑 Get API Keys',
            value: 'Get Bearer Token from UEX **My Apps** + Secret Key from **Account Settings**',
            inline: false
          }
        ])
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      const helpButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_credentials')
            .setLabel('📖 Get Help')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔑')
        );

      await interaction.reply({ 
        embeds: [notRegisteredEmbed], 
        components: [helpButton], 
        ephemeral: true 
      });
      return;
    }

    // Create modal for message input
    const modal = new ModalBuilder()
      .setCustomId(`reply_modal_${negotiationHash}`)
      .setTitle('Reply to UEX Negotiation');

    const messageInput = new TextInputBuilder()
      .setCustomId('reply_message')
      .setLabel('Your Reply Message')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Type your reply message here...')
      .setRequired(true)
      .setMaxLength(2000);

    const actionRow = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

  } catch (error) {
    logger.error('Reply button handler error', {
      error: error.message,
      stack: error.stack,
      userId: interaction.user.id
    });

    await interaction.reply({ 
      content: '❌ Failed to open reply dialog. Please try again.', 
      ephemeral: true 
    });
  }
}

/**
 * Handle modal submit interactions
 * @param {object} interaction - Discord modal submit interaction
 */
async function handleModalSubmit(interaction) {
  try {
    const customId = interaction.customId;
    
    if (customId.startsWith('reply_modal_')) {
      await handleReplyModalSubmit(interaction);
    } else {
      logger.warn('Unknown modal interaction', { customId });
      await interaction.reply({ 
        content: '❌ Unknown modal interaction', 
        ephemeral: true 
      });
    }
    
  } catch (error) {
    logger.error('Modal submit error', {
      error: error.message,
      stack: error.stack,
      customId: interaction.customId,
      userId: interaction.user.id
    });

    try {
      const errorMessage = '❌ An error occurred while processing your reply.';
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      logger.error('Failed to send modal error reply', { error: replyError.message });
    }
  }
}

/**
 * Handle reply modal submit
 * @param {object} interaction - Discord modal submit interaction
 */
async function handleReplyModalSubmit(interaction) {
  try {
    // Extract negotiation hash from modal custom ID
    const negotiationHash = interaction.customId.replace('reply_modal_', '');
    const message = interaction.fields.getTextInputValue('reply_message');
    
    logger.info('Reply modal submitted', {
      negotiationHash,
      messageLength: message.length,
      userId: interaction.user.id,
      username: interaction.user.username
    });

    // Defer reply since UEX API call might take time
    await interaction.deferReply({ ephemeral: true });

    // Get user's credentials
    const userResult = await userManager.getUserCredentials(interaction.user.id);
    
    if (!userResult.found) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Not Registered')
        .setDescription('Your UEX credentials are no longer available.')
        .setColor(0xff0000)
        .addFields([
          {
            name: '📝 How to Register',
            value: 'Use `/register` command with your UEX API credentials',
            inline: false
          },
          {
            name: '🔑 Get API Keys',
            value: 'Get Bearer Token from UEX **My Apps** + Secret Key from **Account Settings**',
            inline: false
          }
        ])
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      const helpButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_credentials')
            .setLabel('📖 Get Help')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔑')
        );

      await interaction.editReply({ 
        embeds: [errorEmbed], 
        components: [helpButton] 
      });
      return;
    }

    // Send reply via UEX API
    const result = await uexAPI.sendReplyWithCredentials(negotiationHash, message, userResult.credentials);

    if (result.success) {
      // Success response
      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Reply Sent Successfully')
        .setColor(0x00ff00)
        .addFields([
          {
            name: '📝 Negotiation',
            value: `\`${negotiationHash}\``,
            inline: true
          },
          {
            name: '💬 Message',
            value: `"${message.length > 100 ? message.substring(0, 100) + '...' : message}"`,
            inline: false
          }
        ])
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      // Add message ID if available
      if (result.messageId) {
        successEmbed.addFields([{
          name: '🆔 Message ID',
          value: `${result.messageId}`,
          inline: true
        }]);
      }

      await interaction.editReply({ embeds: [successEmbed] });

      logger.success('Reply sent successfully via button', {
        negotiationHash,
        messageId: result.messageId,
        userId: interaction.user.id
      });

    } else {
      // Error response
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Reply Failed')
        .setColor(0xff0000)
        .addFields([
          {
            name: '📝 Negotiation',
            value: `\`${negotiationHash}\``,
            inline: true
          },
          {
            name: '⚠️ Error',
            value: result.error || 'Unknown error occurred',
            inline: false
          }
        ])
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });

      logger.error('Reply failed via button', {
        negotiationHash,
        error: result.error,
        userId: interaction.user.id
      });
    }

  } catch (error) {
    logger.error('Reply modal submit error', {
      error: error.message,
      stack: error.stack,
      userId: interaction.user.id
    });

    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Reply Error')
      .setDescription('An unexpected error occurred while sending your reply.')
      .setColor(0xff0000)
      .setFooter({ text: 'UEX Discord Bot' })
      .setTimestamp();

    try {
      await interaction.editReply({ embeds: [errorEmbed] });
    } catch (replyError) {
      logger.error('Failed to send reply error message', { error: replyError.message });
    }
  }
}

/**
 * Handle help credentials button click
 * @param {object} interaction - Discord button interaction
 */
async function handleHelpCredentialsButton(interaction) {
  try {
    logger.info('Help credentials button clicked', { 
      userId: interaction.user.id,
      username: interaction.user.username 
    });

    const helpEmbed = new EmbedBuilder()
      .setTitle('🔑 How to Get Your UEX API Credentials')
      .setDescription('Follow these steps to get your API token and secret key from UEX Corp:')
      .setColor(0x0099ff)
      .addFields([
        {
          name: '📱 Step 1: Get API Token (Bearer Token)',
          value: '1. Login to [UEX Corp](https://uexcorp.space)\n' +
                 '2. Navigate to **"My Apps"** section\n' +
                 '3. Create a new application or select existing one\n' +
                 '4. Copy the **"Bearer Token"** from your application\n' +
                 '5. This is your `api_token` for the bot',
          inline: false
        },
        {
          name: '🔐 Step 2: Get Secret Key',
          value: '1. Go to **"Account Settings"** in your UEX profile\n' +
                 '2. Find the **"Secret Key"** section\n' +
                 '3. Generate a new key if you don\'t have one\n' +
                 '4. Copy the secret key (keep it private!)\n' +
                 '5. This is your `secret_key` for the bot',
          inline: false
        },
        {
          name: '✅ Step 3: Register with Bot',
          value: '```\n/register api_token:YOUR_BEARER_TOKEN secret_key:YOUR_SECRET_KEY\n```\n' +
                 '⚠️ **Important:** Use this command in DMs or private channels only!',
          inline: false
        },
        {
          name: '🔗 Need More Help?',
          value: '• Use `/help` command for detailed instructions\n' +
                 '• Use `/help topic:credentials` for step-by-step guide\n' +
                 '• [Visit UEX Corp](https://uexcorp.space) to manage credentials',
          inline: false
        }
      ])
      .setFooter({ text: 'Need more help? Contact UEX Corp support' })
      .setTimestamp();

    await interaction.reply({ 
      embeds: [helpEmbed], 
      ephemeral: true 
    });

  } catch (error) {
    logger.error('Help credentials button error', {
      error: error.message,
      userId: interaction.user.id
    });

    try {
      const errorMessage = '❌ Failed to display help information.';
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      logger.error('Failed to send help button error reply', { error: replyError.message });
    }
  }
}

/**
 * Handle view negotiations button click
 * @param {object} interaction - Discord button interaction
 */
async function handleViewNegotiationsButton(interaction) {
  try {
    logger.info('View negotiations button clicked', { 
      userId: interaction.user.id,
      username: interaction.user.username 
    });

    const helpEmbed = new EmbedBuilder()
      .setTitle('💬 How to View Your Negotiations')
      .setDescription('Use the `/negotiations` command to see all your marketplace negotiations.')
      .setColor(0x0099ff)
      .addFields([
        {
          name: '📋 Command Usage',
          value: '```\n/negotiations\n```\nThis will show all your active and completed marketplace negotiations.',
          inline: false
        },
        {
          name: '📊 What You\'ll See',
          value: '• **Active negotiations** - Currently ongoing discussions\n• **Completed negotiations** - Finished deals\n• **Negotiation details** - Item, price, and parties involved\n• **Hashes** - For use with `/reply` command',
          inline: false
        },
        {
          name: '💬 Replying to Negotiations',
          value: 'Copy the hash from your negotiations and use:\n```\n/reply hash:HASH_HERE message:Your response\n```',
          inline: false
        }
      ])
      .setFooter({ text: 'UEX Marketplace • Stay on top of your deals' })
      .setTimestamp();

    await interaction.reply({ 
      embeds: [helpEmbed], 
      ephemeral: true 
    });

  } catch (error) {
    logger.error('View negotiations button error', {
      error: error.message,
      userId: interaction.user.id
    });

    try {
      const errorMessage = '❌ Failed to display negotiations help.';
      await interaction.reply({ content: errorMessage, ephemeral: true });
    } catch (replyError) {
      logger.error('Failed to send view negotiations button error reply', { error: replyError.message });
    }
  }
}

/**
 * Handle help reply command button click
 * @param {object} interaction - Discord button interaction
 */
async function handleHelpReplyCommandButton(interaction) {
  try {
    logger.info('Help reply command button clicked', { 
      userId: interaction.user.id,
      username: interaction.user.username 
    });

    const helpEmbed = new EmbedBuilder()
      .setTitle('💬 How to Reply to Negotiations via Discord')
      .setDescription('You can reply to UEX marketplace negotiations directly through Discord!')
      .setColor(0x00ff88)
      .addFields([
        {
          name: '📋 Step 1: Get the Negotiation Hash',
          value: '• Use `/negotiations` to see your active negotiations\n• Copy the hash from the negotiation you want to reply to\n• Example hash: `abc123def456`',
          inline: false
        },
        {
          name: '💬 Step 2: Send Your Reply',
          value: '```\n/reply hash:abc123def456 message:Thanks for your offer!\n```\n• Replace `abc123def456` with the actual hash\n• Write your message in the `message` field',
          inline: false
        },
        {
          name: '🔔 Step 3: Get Notified',
          value: '• You\'ll receive Discord DMs when others reply\n• Click "Reply" buttons in notifications for quick responses\n• All replies are sent directly to UEX Corp',
          inline: false
        },
        {
          name: '✨ Pro Tips',
          value: '• Use private channels or DMs for `/register` and `/reply` commands\n• Notifications include "Reply" buttons for convenience\n• Your replies appear on UEX Corp marketplace instantly',
          inline: false
        }
      ])
      .setFooter({ text: 'UEX Discord Bot • Streamlined marketplace communication' })
      .setTimestamp();

    await interaction.reply({ 
      embeds: [helpEmbed], 
      ephemeral: true 
    });

  } catch (error) {
    logger.error('Help reply command button error', {
      error: error.message,
      userId: interaction.user.id
    });

    try {
      const errorMessage = '❌ Failed to display reply help.';
      await interaction.reply({ content: errorMessage, ephemeral: true });
    } catch (replyError) {
      logger.error('Failed to send help reply command button error reply', { error: replyError.message });
    }
  }
}

module.exports = {
  handleButtonInteraction,
  handleModalSubmit
}; 