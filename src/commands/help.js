/**
 * Help Command
 * Provides instructions on how to get UEX API credentials and use the bot
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with UEX API credentials and bot usage')
    .addStringOption(option =>
      option
        .setName('topic')
        .setDescription('Specific help topic')
        .setRequired(false)
        .addChoices(
          { name: 'Getting UEX Credentials', value: 'credentials' },
          { name: 'Bot Commands', value: 'commands' },
          { name: 'Privacy & Security', value: 'privacy' }
        )
    ),

  async execute(interaction) {
    try {
      const topic = interaction.options.getString('topic') || 'credentials';
      
      logger.command('Help command used', {
        userId: interaction.user.id,
        username: interaction.user.username,
        topic
      });

      let helpEmbed;

      switch (topic) {
        case 'credentials':
          helpEmbed = new EmbedBuilder()
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
                name: '🔗 Useful Links',
                value: '• [UEX Corp Website](https://uexcorp.space)\n' +
                       '• [UEX API Documentation](https://uexcorp.space/api)\n' +
                       '• [Account Settings](https://uexcorp.space/settings)',
                inline: false
              }
            ])
            .setFooter({ text: 'Need more help? Contact UEX Corp support' })
            .setTimestamp();
          break;

        case 'commands':
          helpEmbed = new EmbedBuilder()
            .setTitle('🤖 Bot Commands')
            .setDescription('Available commands for the UEX Discord Bot:')
            .setColor(0x00ff00)
            .addFields([
              {
                name: '📝 Registration Commands',
                value: '• `/register` - Register your UEX API credentials\n' +
                       '• `/unregister` - Remove your credentials from the bot',
                inline: false
              },
              {
                name: '🏪 Marketplace Commands',
                value: '• `/marketplace-listings` - View active marketplace listings\n' +
                       '• `/marketplace-add` - Create new marketplace listings\n' +
                       '• `/marketplace-averages` - View price averages for items\n' +
                       '• `/negotiations` - View your marketplace negotiations',
                inline: false
              },
              {
                name: '💬 Trading Commands',
                value: '• `/reply` - Reply to UEX negotiations\n' +
                       '• Interactive buttons for quick responses',
                inline: false
              },
              {
                name: '🔧 Utility Commands',
                value: '• `/help` - Show this help message\n' +
                       '• `/admin info` - Bot information (for admins)',
                inline: false
              }
            ])
            .setFooter({ text: 'All commands work in DMs and private channels' })
            .setTimestamp();
          break;

        case 'privacy':
          helpEmbed = new EmbedBuilder()
            .setTitle('🔒 Privacy & Security')
            .setDescription('Your security and privacy are our top priorities:')
            .setColor(0xff9900)
            .addFields([
              {
                name: '🔐 Bank-Level Security',
                value: '• Your credentials are encrypted with AES-256-GCM\n' +
                       '• Only you can access your data\n' +
                       '• No shared data between users\n' +
                       '• Secure file-based storage',
                inline: false
              },
              {
                name: '👥 Privacy Options',
                value: '• **Private Server**: Create your own Discord server, invite only the bot\n' +
                       '• **Private Channel**: Create private channels with restricted permissions\n' +
                       '• **DM Commands**: Use registration commands in DMs with the bot\n' +
                       '• **Ephemeral Replies**: Sensitive responses are only visible to you',
                inline: false
              },
              {
                name: '🛡️ Best Practices',
                value: '• Never share your UEX secret key with anyone\n' +
                       '• Register in private channels or DMs only\n' +
                       '• Use `/unregister` if you suspect compromise\n' +
                       '• Keep your Discord account secure',
                inline: false
              }
            ])
            .setFooter({ text: 'Questions about security? Contact the bot admin' })
            .setTimestamp();
          break;

        default:
          helpEmbed = new EmbedBuilder()
            .setTitle('❓ Help Topics')
            .setDescription('Choose a specific help topic:')
            .setColor(0x666666)
            .addFields([
              {
                name: 'Available Topics',
                value: '• `/help topic:credentials` - How to get UEX API credentials\n' +
                       '• `/help topic:commands` - Available bot commands\n' +
                       '• `/help topic:privacy` - Privacy and security information',
                inline: false
              }
            ]);
      }

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });

    } catch (error) {
      logger.error('Help command error', { 
        error: error.message,
        userId: interaction.user.id 
      });

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Help Error')
        .setDescription('Failed to display help information.')
        .setColor(0xff0000);

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}; 