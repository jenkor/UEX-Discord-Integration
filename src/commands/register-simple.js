/**
 * Simple Register Command - Minimal version for testing
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-simple')
    .setDescription('Simple register test without file operations')
    .addStringOption(option =>
      option
        .setName('api_token')
        .setDescription('Your UEX API token')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('secret_key')
        .setDescription('Your UEX secret key')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Immediately defer the reply
      await interaction.deferReply({ ephemeral: true });

      const apiToken = interaction.options.getString('api_token');
      const secretKey = interaction.options.getString('secret_key');

      // Simple validation
      if (!apiToken || !secretKey || apiToken.length < 5 || secretKey.length < 5) {
        await interaction.editReply({
          content: '❌ API token and secret key must be at least 5 characters long.'
        });
        return;
      }

      // Success response without file operations
      await interaction.editReply({
        content: `✅ Registration test successful!\n\n**User:** ${interaction.user.username}\n**Token length:** ${apiToken.length}\n**Secret length:** ${secretKey.length}\n\n*This is a test command - no data was actually saved.*`
      });

    } catch (error) {
      console.error('Register-simple command error:', error);
      
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: '❌ An error occurred during testing: ' + error.message
          });
        } else {
          await interaction.reply({
            content: '❌ An error occurred during testing: ' + error.message,
            ephemeral: true
          });
        }
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  }
}; 