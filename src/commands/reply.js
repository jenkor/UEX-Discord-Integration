/**
 * Reply Command
 * Discord slash command for replying to UEX negotiations
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const uexAPI = require('../handlers/uex-api');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reply')
    .setDescription('Send a reply to a UEX negotiation')
    .addStringOption(option =>
      option
        .setName('hash')
        .setDescription('The negotiation hash from UEX')
        .setRequired(true)
        .setMinLength(8)
        .setMaxLength(64)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Your reply message')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(2000)
    ),

  async execute(interaction) {
    try {
      // Get command options
      const hash = interaction.options.getString('hash');
      const message = interaction.options.getString('message');

      logger.command('Processing reply command', {
        hash,
        messageLength: message.length,
        userId: interaction.user.id
      });

      // Defer reply since UEX API call might take some time
      await interaction.deferReply({ ephemeral: true });

      // Send reply to UEX API
      const result = await uexAPI.sendReply(hash, message);

      if (result.success) {
        // Success response
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Reply Sent Successfully')
          .setColor(0x00ff00)
          .addFields([
            {
              name: '📝 Negotiation',
              value: `\`${hash}\``,
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

        logger.success('Reply command completed successfully', {
          hash,
          messageId: result.messageId
        });

      } else {
        // Error response
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Reply Failed')
          .setColor(0xff0000)
          .addFields([
            {
              name: '📝 Negotiation',
              value: `\`${hash}\``,
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

        logger.error('Reply command failed', {
          hash,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Reply command error', {
        error: error.message,
        stack: error.stack,
        userId: interaction.user.id
      });

      // Create error embed
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while processing your reply.')
        .setColor(0xff0000)
        .addFields([
          {
            name: '⚠️ Error Details',
            value: error.message,
            inline: false
          }
        ])
        .setFooter({ text: 'UEX Discord Bot' })
        .setTimestamp();

      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error('Failed to send error reply', { error: replyError.message });
      }
    }
  }
}; 