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
          const notFoundEmbed = new EmbedBuilder()
            .setTitle('❌ Item Not Found')
            .setDescription(`No marketplace data found for item slug: **${itemSlug}**`)
            .setColor(0xff0000)
            .addFields([
              {
                name: '💡 Finding Valid Item Slugs',
                value: '• Check `/marketplace-listings` to see what items are being traded\n• Use `/marketplace-averages all` to see all available slugs\n• Common slugs: `titanium`, `steel`, `hadanite`, `quantanium`\n• Item slugs are usually lowercase names with dashes instead of spaces',
                inline: false
              },
              {
                name: '🔍 Search Tips',
                value: '• Try `hadanite` instead of `hadanite ore`\n• Try `steel` instead of `steel ingot`\n• Replace spaces with dashes: `citadel-arms` instead of `citadel arms`\n• Use the exact slug from `/marketplace-averages all` output',
                inline: false
              }
            ])
            .setFooter({ text: 'UEX Marketplace • Use exact slugs from marketplace data' })
            .setTimestamp();

          const helpButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel('📊 View All Averages')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('marketplace_averages_all')
                .setEmoji('📈'),
              new ButtonBuilder()
                .setLabel('🏪 View Marketplace')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('marketplace_listings_all')
                .setEmoji('🛒')
            );

          await interaction.editReply({ 
            embeds: [notFoundEmbed], 
            components: [helpButtons] 
          });
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

        // Debug log to see data structure
        logger.info('Marketplace averages data sample', { 
          totalItems: allData.length,
          sampleItem: allData[0],
          fields: Object.keys(allData[0] || {})
        });

        // Show top 15 items by average price (less restrictive filtering)
        const sortedData = allData
          .filter(item => item && (item.average_price || item.avg_price || item.price) && 
                         (item.name || item.slug || item.item_name))
          .sort((a, b) => {
            const priceA = a.average_price || a.avg_price || a.price || 0;
            const priceB = b.average_price || b.avg_price || b.price || 0;
            return priceB - priceA;
          })
          .slice(0, 15);

        if (sortedData.length === 0) {
          const debugEmbed = new EmbedBuilder()
            .setTitle('📊 Marketplace Averages Debug')
            .setDescription(`Found ${allData.length} items but none have valid price data.`)
            .setColor(0xff9900)
            .addFields([
              {
                name: '🔍 Data Sample',
                value: `\`\`\`json\n${JSON.stringify(allData.slice(0, 2), null, 2).substring(0, 1000)}\`\`\``,
                inline: false
              }
            ])
            .setFooter({ text: 'UEX Marketplace • Debug information' })
            .setTimestamp();

          await interaction.editReply({ embeds: [debugEmbed] });
          return;
        }

        const allAveragesEmbed = new EmbedBuilder()
          .setTitle('📊 Marketplace Price Averages - Top Items')
          .setDescription(`Showing top ${sortedData.length} items by average price`)
          .setColor(0x0099ff);

        // Add items as fields with flexible field names
        sortedData.forEach((item, index) => {
          const avgPrice = item.average_price || item.avg_price || item.price || 0;
          const maxPrice = item.max_price || item.high_price || item.highest_price || avgPrice;
          const minPrice = item.min_price || item.low_price || item.lowest_price || avgPrice;
          const listings = item.total_listings || item.listings || item.count || 0;
          const itemName = item.name || item.item_name || item.slug || 'Unknown Item';
          const itemSlug = item.slug || item.item_slug || 'unknown';

          const value = `💰 **${Number(avgPrice).toLocaleString()} aUEC** avg\n` +
                       `📈 ${Number(maxPrice).toLocaleString()} high • 📉 ${Number(minPrice).toLocaleString()} low\n` +
                       `📊 ${listings} listings • 🏷️ \`${itemSlug}\``;

          allAveragesEmbed.addFields([
            {
              name: `${index + 1}. ${itemName}`,
              value: value,
              inline: true
            }
          ]);
        });

        allAveragesEmbed
          .setFooter({ text: `UEX Marketplace • Showing ${sortedData.length} of ${allData.length} items • Copy slugs for specific queries` })
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