/**
 * Button Interactions Handler
 * Handles Discord button interactions for UEX bot functionality
 */

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
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
          }
        ])
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      await interaction.reply({ embeds: [notRegisteredEmbed], ephemeral: true });
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
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
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

module.exports = {
  handleButtonInteraction,
  handleModalSubmit
}; 