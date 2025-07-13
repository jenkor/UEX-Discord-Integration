/**
 * Marketplace Listings Command
 * View active marketplace advertisements from UEX Corp
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uexAPI = require('../handlers/uex-api');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marketplace-listings')
    .setDescription('View active marketplace listings from UEX Corp')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('Filter by specific username')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('slug')
        .setDescription('Filter by item slug')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('id')
        .setDescription('Filter by listing ID')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const slug = interaction.options.getString('slug');
      const id = interaction.options.getInteger('id');

      logger.command('Marketplace listings command used', {
        userId: interaction.user.id,
        username: interaction.user.username,
        filters: { username, slug, id }
      });

      // Defer reply since API call might take time
      await interaction.deferReply({ ephemeral: true });

      // Build filters object
      const filters = {};
      if (username) filters.username = username;
      if (slug) filters.slug = slug;
      if (id) filters.id = id;

      // Fetch marketplace listings
      const result = await uexAPI.getMarketplaceListings(filters);

      if (!result.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Error Fetching Listings')
          .setDescription('Failed to retrieve marketplace listings from UEX Corp.')
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

      const listings = result.data || [];

      if (listings.length === 0) {
        const noResultsEmbed = new EmbedBuilder()
          .setTitle('📋 No Marketplace Listings Found')
          .setDescription('No active marketplace listings match your criteria.')
          .setColor(0x666666)
          .addFields([
            {
              name: '🔍 Search Tips',
              value: '• Try different filter criteria\n• Check spelling of username or item slug\n• Remove filters to see all listings',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Marketplace' })
          .setTimestamp();

        await interaction.editReply({ embeds: [noResultsEmbed] });
        return;
      }

      // Create embed with listings (show first 8 for better visual layout)
      const displayListings = listings.slice(0, 8);
      const listingsEmbed = new EmbedBuilder()
        .setTitle('🏪 UEX Marketplace Listings')
        .setDescription(`Found **${listings.length}** active listing${listings.length !== 1 ? 's' : ''} ${filters.username ? `by **${filters.username}**` : ''}`)
        .setColor(0x00ff00);

      // Group listings by operation type for better organization
      const wtsSell = displayListings.filter(l => l.operation?.toLowerCase() === 'sell' || l.operation?.toUpperCase() === 'WTS');
      const wtbBuy = displayListings.filter(l => l.operation?.toLowerCase() === 'buy' || l.operation?.toUpperCase() === 'WTB');
      const trading = displayListings.filter(l => l.operation?.toLowerCase() === 'trade' || l.operation?.toUpperCase() === 'TRADING');
      const other = displayListings.filter(l => !wtsSell.includes(l) && !wtbBuy.includes(l) && !trading.includes(l));

      // Display WTS (Want to Sell) listings first
      if (wtsSell.length > 0) {
        const wtsSection = wtsSell.slice(0, 4).map((listing, index) => {
          const priceInfo = listing.price ? `**${Number(listing.price).toLocaleString()} aUEC**` : '💰 *Price negotiable*';
          const unitInfo = listing.unit ? ` per ${listing.unit}` : '';
          const stockInfo = listing.quantity ? `📦 **Stock:** ${listing.quantity}` : '📦 *Stock available*';
          const locationInfo = listing.location ? `📍 **${listing.location}**` : '📍 *Location TBD*';
          const sellerInfo = listing.username ? `👤 **${listing.username}**` : '👤 *Seller*';
          const updatedInfo = listing.updated ? `⏰ ${new Date(listing.updated).toLocaleDateString()}` : '⏰ *Recently*';
          
          // Add status indicator
          const statusEmoji = listing.status === 'active' ? '🟢' : listing.status === 'sold' ? '🔴' : '🟡';
          const statusText = listing.status === 'active' ? 'Active' : listing.status === 'sold' ? 'Sold Out' : 'Unknown';
          
          return `**${listing.title || listing.type || 'Untitled Item'}**\n` +
                 `💰 ${priceInfo}${unitInfo} | ${stockInfo}\n` +
                 `${locationInfo} | ${sellerInfo}\n` +
                 `${statusEmoji} ${statusText} | ${updatedInfo}` +
                 (listing.image_url ? `\n🖼️ [View Image](${listing.image_url})` : '');
        }).join('\n\n');

        listingsEmbed.addFields([
          {
            name: '💰 Want to Sell (WTS) Listings',
            value: wtsSection || 'No WTS listings found',
            inline: false
          }
        ]);
      }

      // Display WTB (Want to Buy) listings
      if (wtbBuy.length > 0) {
        const wtbSection = wtbBuy.slice(0, 3).map((listing, index) => {
          const priceInfo = listing.price ? `**${Number(listing.price).toLocaleString()} aUEC**` : '💰 *Price negotiable*';
          const unitInfo = listing.unit ? ` per ${listing.unit}` : '';
          const quantityInfo = listing.quantity ? `📦 **Seeking:** ${listing.quantity}` : '📦 *Quantity needed*';
          const locationInfo = listing.location ? `📍 **${listing.location}**` : '📍 *Location flexible*';
          const buyerInfo = listing.username ? `👤 **${listing.username}**` : '👤 *Buyer*';
          const updatedInfo = listing.updated ? `⏰ ${new Date(listing.updated).toLocaleDateString()}` : '⏰ *Recently*';
          
          // Add status indicator
          const statusEmoji = listing.status === 'active' ? '🟢' : listing.status === 'completed' ? '✅' : '🟡';
          const statusText = listing.status === 'active' ? 'Active' : listing.status === 'completed' ? 'Fulfilled' : 'Unknown';
          
          return `**${listing.title || listing.type || 'Untitled Request'}**\n` +
                 `💰 ${priceInfo}${unitInfo} | ${quantityInfo}\n` +
                 `${locationInfo} | ${buyerInfo}\n` +
                 `${statusEmoji} ${statusText} | ${updatedInfo}` +
                 (listing.image_url ? `\n🖼️ [View Image](${listing.image_url})` : '');
        }).join('\n\n');

        listingsEmbed.addFields([
          {
            name: '🛒 Want to Buy (WTB) Requests',
            value: wtbSection || 'No WTB requests found',
            inline: false
          }
        ]);
      }

      // Display Trading listings
      if (trading.length > 0) {
        const tradingSection = trading.slice(0, 2).map((listing, index) => {
          const sellerInfo = listing.username ? `👤 **${listing.username}**` : '👤 *Trader*';
          const locationInfo = listing.location ? `📍 **${listing.location}**` : '📍 *Location TBD*';
          const updatedInfo = listing.updated ? `⏰ ${new Date(listing.updated).toLocaleDateString()}` : '⏰ *Recently*';
          
          return `**${listing.title || listing.type || 'Trade Offer'}**\n` +
                 `🔄 Trade offer | ${sellerInfo}\n` +
                 `${locationInfo} | ${updatedInfo}` +
                 (listing.image_url ? `\n🖼️ [View Image](${listing.image_url})` : '');
        }).join('\n\n');

        listingsEmbed.addFields([
          {
            name: '🔄 Trading Offers',
            value: tradingSection || 'No trading offers found',
            inline: false
          }
        ]);
      }

      // Set main image to first listing with image (like website's main image)
      const firstListingWithImage = displayListings.find(listing => listing.image_url);
      if (firstListingWithImage) {
        listingsEmbed.setImage(firstListingWithImage.image_url);
      }

      // Add summary field if there are multiple categories
      const totalDisplayed = Math.min(4, wtsSell.length) + Math.min(3, wtbBuy.length) + Math.min(2, trading.length);
      if (listings.length > totalDisplayed) {
        listingsEmbed.addFields([
          {
            name: '📊 Marketplace Summary',
            value: `📈 **${wtsSell.length}** WTS listings | 📉 **${wtbBuy.length}** WTB requests | 🔄 **${trading.length}** trades\n` +
                   `Showing **${totalDisplayed}** of **${listings.length}** total listings`,
            inline: false
          }
        ]);
      }

      // Add footer with additional info
      listingsEmbed.setFooter({ 
        text: `UEX Marketplace • ${listings.length > totalDisplayed ? `Showing ${totalDisplayed} of ${listings.length} listings` : 'All current listings'}` 
      });

      listingsEmbed.setTimestamp();

      // Add button to visit marketplace
      const marketplaceButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🌐 Visit UEX Marketplace')
            .setStyle(ButtonStyle.Link)
            .setURL('https://uexcorp.space/marketplace')
        );

      await interaction.editReply({ 
        embeds: [listingsEmbed], 
        components: [marketplaceButton] 
      });

    } catch (error) {
      logger.error('Marketplace listings command error', { 
        error: error.message,
        stack: error.stack,
        userId: interaction.user.id 
      });

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while fetching marketplace listings.')
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
        logger.error('Failed to send marketplace listings error reply', { error: replyError.message });
      }
    }
  }
}; 