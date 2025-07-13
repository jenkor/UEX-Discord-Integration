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
    )
    .addStringOption(option =>
      option
        .setName('image_url')
        .setDescription('Image URL for your listing (optional)')
        .setRequired(false)
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
      const imageUrl = interaction.options.getString('image_url') || '';

      logger.command('Marketplace add command used', {
        userId,
        username: interaction.user.username,
        title,
        operation,
        type,
        category,
        price,
        quantity,
        hasImage: !!imageUrl
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

      // Add image URL if provided
      if (imageUrl) {
        listingData.image_url = imageUrl;
      }

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

      // Success! Show listing details with website-style design
      const operationEmoji = operation === 'sell' ? '💰' : '🛒';
      const operationText = operation === 'sell' ? 'WTS (Want to Sell)' : 'WTB (Want to Buy)';
      const statusEmoji = '🟢';
      
      const successEmbed = new EmbedBuilder()
        .setTitle(`✅ ${operationText} Listing Created!`)
        .setDescription(`Your **${operationText}** listing is now **live** on the UEX Marketplace`)
        .setColor(operation === 'sell' ? 0x00ff00 : 0x0099ff);

      // Add main listing info in website-style format
      successEmbed.addFields([
        {
          name: `${operationEmoji} ${title}`,
          value: `**${Number(price).toLocaleString()} aUEC** per ${unit} | **${quantity.toLocaleString()}** ${unit} ${operation === 'sell' ? 'available' : 'needed'}\n` +
                 `📍 **${location}** | ${statusEmoji} **Active**\n` +
                 `🏷️ **${getCategoryName(category)}** • **${type.toUpperCase()}** listing`,
          inline: false
        }
      ]);

      // Add description if provided
      if (description) {
        successEmbed.addFields([
          {
            name: '📝 Description',
            value: description.length > 200 ? description.substring(0, 200) + '...' : description,
            inline: false
          }
        ]);
      }

      // Add contact and duration info in compact format
      successEmbed.addFields([
        {
          name: '📞 Contact Info',
          value: contact || `Discord: ${interaction.user.username}`,
          inline: true
        },
        {
          name: '⏰ Duration',
          value: `${duration} day${duration !== 1 ? 's' : ''}`,
          inline: true
        },
        {
          name: '📊 Total Value',
          value: `**${(price * quantity).toLocaleString()} aUEC**`,
          inline: true
        }
      ]);

      // Add listing ID if available
      if (result.listingId) {
        successEmbed.addFields([
          {
            name: '🆔 Listing ID',
            value: `\`${result.listingId}\` • Use this ID to manage your listing`,
            inline: false
          }
        ]);
      }

      // Add listing management tips and tracking information
      successEmbed.addFields([
        {
          name: '📈 Track Your Listing Performance',
          value: '• **Views** - How many people have seen your listing\n' +
                 '• **Negotiations** - Number of interested buyers/sellers\n' +
                 '• **Votes** - Community trust rating for your listing\n' +
                 'Use `/marketplace-listings username:' + interaction.user.username + '` to check your stats',
          inline: false
        },
        {
          name: '💡 Pro Tips for Better Results',
          value: '• **Add images** - Listings with photos get 3x more views\n' +
                 '• **Set competitive prices** - Check market rates first\n' +
                 '• **Update regularly** - Fresh listings appear higher in searches\n' +
                 '• **Respond quickly** - Fast replies improve your rating',
          inline: false
        }
      ]);

      // Add expected engagement metrics
      const estimatedViews = Math.ceil(price * quantity / 50000); // Rough estimate based on value
      successEmbed.addFields([
        {
          name: '🎯 What to Expect',
          value: `• **Estimated daily views:** ~${Math.max(5, estimatedViews)} people\n` +
                 `• **Listing expires:** ${new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString()}\n` +
                 `• **Current market:** ${operation === 'sell' ? 'Sellers' : 'Buyers'} market for this category\n` +
                 `• **Visibility:** Your listing is now searchable by item type`,
          inline: false
        }
      ]);

      // Set image prominently like the website
      if (imageUrl) {
        successEmbed.setImage(imageUrl);
        successEmbed.addFields([
          {
            name: '🖼️ Image Preview',
            value: 'Your listing image is displayed above',
            inline: false
          }
        ]);
      }

      successEmbed
        .setFooter({ text: 'UEX Marketplace • Your listing is now visible to all traders!' })
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