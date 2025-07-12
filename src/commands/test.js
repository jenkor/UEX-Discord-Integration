/**
 * Test Command - Simple command to verify Discord interactions work
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Simple test command to verify bot functionality'),

  async execute(interaction) {
    try {
      // Immediately defer the reply
      await interaction.deferReply({ ephemeral: true });

      // Simple response
      const embed = new EmbedBuilder()
        .setTitle('✅ Test Successful')
        .setDescription('Bot is working correctly!')
        .setColor(0x00ff00)
        .addFields([
          {
            name: 'User',
            value: interaction.user.username,
            inline: true
          },
          {
            name: 'User ID',
            value: interaction.user.id,
            inline: true
          },
          {
            name: 'Timestamp',
            value: new Date().toISOString(),
            inline: false
          }
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Test command error:', error);
      
      try {
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Test Failed')
          .setDescription('An error occurred during testing.')
          .setColor(0xff0000)
          .addFields([
            {
              name: 'Error',
              value: error.message || 'Unknown error',
              inline: false
            }
          ])
          .setTimestamp();

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  }
}; 