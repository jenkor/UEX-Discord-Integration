/**
 * Marketplace Add Command
 * Create new marketplace listings on UEX Corp
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uexAPI = require('../handlers/uex-api');
const userManager = require('../utils/user-manager');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marketplace-add')
    .setDescription('Create a new marketplace listing on UEX Corp')
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('Listing title (e.g., "Premium Titanium Ore")')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('operation')
        .setDescription('Operation type')
        .setRequired(true)
        .addChoices(
          { name: 'Buy', value: 'buy' },
          { name: 'Sell', value: 'sell' }
        )
    )
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Listing type')
        .setRequired(true)
        .addChoices(
          { name: 'Market', value: 'market' },
          { name: 'Limit', value: 'limit' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('category')
        .setDescription('Item category ID (1=Materials, 2=Commodities, 3=Equipment, etc.)')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option
        .setName('price')
        .setDescription('Price per unit in aUEC')
        .setRequired(true)
        .setMinValue(0.01)
    )
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('Quantity available')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option
        .setName('unit')
        .setDescription('Unit type (e.g., SCU, kg, cSCU, units)')
        .setRequired(true)
        .addChoices(
          { name: 'SCU', value: 'SCU' },
          { name: 'cSCU', value: 'cSCU' },
          { name: 'kg', value: 'kg' },
          { name: 'units', value: 'units' },
          { name: 'liters', value: 'liters' }
        )
    )
    .addStringOption(option =>
      option
        .setName('location')
        .setDescription('Location (e.g., "Stanton > ArcCorp > Area18")')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Detailed description of your listing')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('contact')
        .setDescription('Contact information (Discord, in-game name, etc.)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Listing duration in days (default: 7)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(30)
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // Extract all parameters
      const title = interaction.options.getString('title');
      const operation = interaction.options.getString('operation');
      const type = interaction.options.getString('type');
      const category = interaction.options.getInteger('category');
      const price = interaction.options.getNumber('price');
      const quantity = interaction.options.getInteger('quantity');
      const unit = interaction.options.getString('unit');
      const location = interaction.options.getString('location');
      const description = interaction.options.getString('description') || '';
      const contact = interaction.options.getString('contact') || '';
      const duration = interaction.options.getInteger('duration') || 7;

      logger.command('Marketplace add command used', {
        userId,
        username: interaction.user.username,
        title,
        operation,
        type,
        category,
        price,
        quantity
      });

      // Defer reply since API call might take time
      await interaction.deferReply({ ephemeral: true });

      // Check if user is registered
      const userResult = await userManager.getUserCredentials(userId);
      
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

        await interaction.editReply({ 
          embeds: [notRegisteredEmbed], 
          components: [helpButton] 
        });
        return;
      }

      // Prepare listing data according to UEX API requirements
      const listingData = {
        id_category: category,
        operation: operation,
        type: type,
        unit: unit,
        price: price,
        quantity: quantity,
        title: title,
        description: description,
        location: location,
        contact_info: contact,
        duration_days: duration,
        status: 'active'
      };

      // Create the marketplace listing
      const result = await uexAPI.createMarketplaceListing(listingData, userResult.credentials);

      if (!result.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Failed to Create Listing')
          .setDescription('Failed to create your marketplace listing on UEX Corp.')
          .setColor(0xff0000)
          .addFields([
            {
              name: '⚠️ Error Details',
              value: result.error || 'Unknown error occurred',
              inline: false
            },
            {
              name: '🔍 Common Issues',
              value: '• Check category ID (1=Materials, 2=Commodities, 3=Equipment)\n• Verify price is greater than 0\n• Ensure all required fields are filled\n• Try different location format',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Marketplace • Try again with different parameters' })
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      // Success! Show listing details
      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Marketplace Listing Created!')
        .setDescription(`Your **${operation.toUpperCase()}** listing has been successfully created on UEX Corp.`)
        .setColor(0x00ff00)
        .addFields([
          {
            name: '📝 Listing Details',
            value: `**${title}**\n${description || 'No description provided'}`,
            inline: false
          },
          {
            name: '💰 Price & Quantity',
            value: `**${Number(price).toLocaleString()} aUEC** per ${unit}\n**${quantity.toLocaleString()}** ${unit} available`,
            inline: true
          },
          {
            name: '📍 Location',
            value: location,
            inline: true
          },
          {
            name: '📊 Listing Type',
            value: `${type.toUpperCase()} ${operation.toUpperCase()}`,
            inline: true
          },
          {
            name: '🏷️ Category',
            value: getCategoryName(category),
            inline: true
          },
          {
            name: '⏰ Duration',
            value: `${duration} day${duration !== 1 ? 's' : ''}`,
            inline: true
          },
          {
            name: '📞 Contact',
            value: contact || 'Discord: ' + interaction.user.username,
            inline: true
          }
        ]);

      if (result.listingId) {
        successEmbed.addFields([
          {
            name: '🆔 Listing ID',
            value: `\`${result.listingId}\``,
            inline: false
          }
        ]);
      }

      successEmbed
        .setFooter({ text: 'UEX Marketplace • Your listing is now live!' })
        .setTimestamp();

      // Add action buttons
      const actionButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🌐 View on UEX Marketplace')
            .setStyle(ButtonStyle.Link)
            .setURL('https://uexcorp.space/marketplace'),
          new ButtonBuilder()
            .setLabel('💬 View My Negotiations')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('view_negotiations')
            .setEmoji('📋')
        );

      await interaction.editReply({ 
        embeds: [successEmbed], 
        components: [actionButtons] 
      });

    } catch (error) {
      logger.error('Marketplace add command error', { 
        error: error.message,
        stack: error.stack,
        userId: interaction.user.id 
      });

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while creating your marketplace listing.')
        .setColor(0xff0000)
        .addFields([
          {
            name: '🔧 What to Try',
            value: '• Check your internet connection\n• Verify your UEX credentials are still valid\n• Try the command again in a few minutes\n• Contact support if the issue persists',
            inline: false
          }
        ])
        .setFooter({ text: 'UEX Marketplace' })
        .setTimestamp();

      try {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error('Failed to send marketplace add error reply', { error: replyError.message });
      }
    }
  }
};

/**
 * Get category name from category ID
 */
function getCategoryName(categoryId) {
  const categories = {
    1: 'Materials',
    2: 'Commodities', 
    3: 'Equipment',
    4: 'Ships',
    5: 'Components',
    6: 'Weapons',
    7: 'Armor',
    8: 'Services',
    9: 'Other'
  };
  
  return categories[categoryId] || `Category ${categoryId}`;
} 