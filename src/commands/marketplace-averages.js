/**
 * Marketplace Averages Command
 * View marketplace price averages for items from UEX Corp
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uexAPI = require('../handlers/uex-api');
const userManager = require('../utils/user-manager');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marketplace-averages')
    .setDescription('View marketplace price averages for items')
    .addSubcommand(subcommand =>
      subcommand
        .setName('item')
        .setDescription('Get price averages for a specific item')
        .addStringOption(option =>
          option
            .setName('slug')
            .setDescription('Item slug (e.g., titanium, steel, etc.)')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('all')
        .setDescription('Get price averages for all items')
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const itemSlug = interaction.options.getString('slug');
      const userId = interaction.user.id;

      logger.command('Marketplace averages command used', {
        userId,
        username: interaction.user.username,
        subcommand,
        itemSlug
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

      let result;
      
      if (subcommand === 'item') {
        // Get averages for specific item
        result = await uexAPI.getMarketplaceAverages(itemSlug, userResult.credentials);
      } else {
        // Get all averages
        result = await uexAPI.getMarketplaceAveragesAll(userResult.credentials);
      }

      if (!result.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Error Fetching Averages')
          .setDescription('Failed to retrieve marketplace averages from UEX Corp.')
          .setColor(0xff0000)
          .addFields([
            {
              name: '⚠️ Error Details',
              value: result.error || 'Unknown error occurred',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Marketplace • Try again later' })
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      if (subcommand === 'item') {
        // Display single item averages
        const itemData = result.data;
        
        if (!itemData) {
          const noDataEmbed = new EmbedBuilder()
            .setTitle('📊 No Average Data Found')
            .setDescription(`No price average data found for item: **${itemSlug}**`)
            .setColor(0x666666)
            .addFields([
              {
                name: '🔍 Tips',
                value: '• Check the item slug spelling\n• Try using `/marketplace-averages all` to see available items\n• Some items may not have enough trading data',
                inline: false
              }
            ])
            .setFooter({ text: 'UEX Marketplace' })
            .setTimestamp();

          await interaction.editReply({ embeds: [noDataEmbed] });
          return;
        }

        const averagesEmbed = new EmbedBuilder()
          .setTitle(`📊 Price Averages: ${itemData.name || itemSlug}`)
          .setDescription(`Market price analysis for **${itemData.name || itemSlug}**`)
          .setColor(0x0099ff)
          .addFields([
            {
              name: '💰 Average Price',
              value: `**${Number(itemData.average_price || 0).toLocaleString()} aUEC**`,
              inline: true
            },
            {
              name: '📈 Highest Price',
              value: `${Number(itemData.max_price || 0).toLocaleString()} aUEC`,
              inline: true
            },
            {
              name: '📉 Lowest Price',
              value: `${Number(itemData.min_price || 0).toLocaleString()} aUEC`,
              inline: true
            },
            {
              name: '📊 Total Listings',
              value: `${itemData.total_listings || 0} active`,
              inline: true
            },
            {
              name: '🔄 Last Updated',
              value: itemData.last_updated || 'Unknown',
              inline: true
            },
            {
              name: '📦 Unit Type',
              value: itemData.unit || 'Unknown',
              inline: true
            }
          ])
          .setFooter({ text: 'UEX Marketplace • Data refreshed hourly' })
          .setTimestamp();

        await interaction.editReply({ embeds: [averagesEmbed] });

      } else {
        // Display all item averages
        const allData = result.data || [];
        
        if (allData.length === 0) {
          const noDataEmbed = new EmbedBuilder()
            .setTitle('📊 No Average Data Available')
            .setDescription('No marketplace average data is currently available.')
            .setColor(0x666666)
            .setFooter({ text: 'UEX Marketplace' })
            .setTimestamp();

          await interaction.editReply({ embeds: [noDataEmbed] });
          return;
        }

        // Show top 15 items by average price
        const sortedData = allData
          .filter(item => item.average_price > 0)
          .sort((a, b) => b.average_price - a.average_price)
          .slice(0, 15);

        const allAveragesEmbed = new EmbedBuilder()
          .setTitle('📊 Marketplace Price Averages - Top Items')
          .setDescription(`Showing top ${sortedData.length} items by average price`)
          .setColor(0x0099ff);

        // Add items as fields
        sortedData.forEach((item, index) => {
          const value = `💰 **${Number(item.average_price).toLocaleString()} aUEC** avg\n` +
                       `📈 ${Number(item.max_price).toLocaleString()} high • 📉 ${Number(item.min_price).toLocaleString()} low\n` +
                       `📊 ${item.total_listings || 0} listings`;

          allAveragesEmbed.addFields([
            {
              name: `${index + 1}. ${item.name || item.slug}`,
              value: value,
              inline: true
            }
          ]);
        });

        allAveragesEmbed
          .setFooter({ text: `UEX Marketplace • Showing ${sortedData.length} of ${allData.length} items` })
          .setTimestamp();

        await interaction.editReply({ embeds: [allAveragesEmbed] });
      }

    } catch (error) {
      logger.error('Marketplace averages command error', { 
        error: error.message,
        stack: error.stack,
        userId: interaction.user.id 
      });

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while fetching marketplace averages.')
        .setColor(0xff0000)
        .setFooter({ text: 'UEX Marketplace' })
        .setTimestamp();

      try {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error('Failed to send marketplace averages error reply', { error: replyError.message });
      }
    }
  }
}; 