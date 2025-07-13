/**
 * Marketplace Listings Command
 * View active marketplace advertisements from UEX Corp with pagination
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
        .setName('operation')
        .setDescription('Filter by operation type')
        .setRequired(false)
        .addChoices(
          { name: 'Want to Sell (WTS)', value: 'sell' },
          { name: 'Want to Buy (WTB)', value: 'buy' },
          { name: 'Trading', value: 'trade' }
        )
    )
    .addStringOption(option =>
      option
        .setName('item_type')
        .setDescription('Filter by item type/name')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number (default: 1)')
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const operation = interaction.options.getString('operation');
      const itemType = interaction.options.getString('item_type');
      const page = interaction.options.getInteger('page') || 1;
      const itemsPerPage = 6; // Show 6 items per page for better readability

      logger.command('Marketplace listings command used', {
        userId: interaction.user.id,
        username: interaction.user.username,
        filters: { username, operation, itemType, page }
      });

      // Defer reply since API call might take time
      await interaction.deferReply({ ephemeral: true });

      // Build filters object
      const filters = {};
      if (username) filters.username = username;
      if (operation) filters.operation = operation;
      if (itemType) filters.type = itemType;

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

      const allListings = result.data || [];

      if (allListings.length === 0) {
        const noResultsEmbed = new EmbedBuilder()
          .setTitle('📋 No Marketplace Listings Found')
          .setDescription('No active marketplace listings match your criteria.')
          .setColor(0x666666)
          .addFields([
            {
              name: '🔍 Search Tips',
              value: '• Try different filter criteria\n• Check spelling of username or item type\n• Remove filters to see all listings',
              inline: false
            },
            {
              name: '💡 Popular Searches',
              value: '• `/marketplace-listings operation:sell` - All WTS listings\n• `/marketplace-listings operation:buy` - All WTB requests\n• `/marketplace-listings item_type:titanium` - Specific items',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Marketplace' })
          .setTimestamp();

        await interaction.editReply({ embeds: [noResultsEmbed] });
        return;
      }

      // Calculate pagination
      const totalPages = Math.ceil(allListings.length / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, allListings.length);
      const currentListings = allListings.slice(startIndex, endIndex);

      // Create main embed
      const listingsEmbed = new EmbedBuilder()
        .setTitle('🏪 UEX Marketplace Listings')
        .setDescription(`**Page ${page} of ${totalPages}** • Found **${allListings.length}** listing${allListings.length !== 1 ? 's' : ''} ${getFilterDescription(filters)}`)
        .setColor(0x00ff00);

      // Display each listing as a detailed card
      currentListings.forEach((listing, index) => {
        const actualIndex = startIndex + index + 1;
        const operationType = listing.operation?.toUpperCase() || 'UNKNOWN';
        const operationEmoji = operationType === 'SELL' || operationType === 'WTS' ? '💰' : 
                               operationType === 'BUY' || operationType === 'WTB' ? '🛒' : '🔄';
        
        const priceInfo = listing.price ? `**${Number(listing.price).toLocaleString()} aUEC**` : '💰 *Price negotiable*';
        const unitInfo = listing.unit ? ` per ${listing.unit}` : '';
        const stockInfo = listing.quantity ? `📦 **${listing.quantity}** ${listing.unit || 'units'}` : '📦 *Stock available*';
        const locationInfo = listing.location ? `📍 **${listing.location}**` : '📍 *Location TBD*';
        const traderInfo = listing.username ? `👤 **${listing.username}**` : '👤 *Trader*';
        const updatedInfo = listing.updated ? `⏰ ${new Date(listing.updated).toLocaleDateString()}` : '⏰ *Recently*';
        
        // Add status indicator
        const statusEmoji = listing.status === 'active' ? '🟢' : listing.status === 'sold' ? '🔴' : '🟡';
        const statusText = listing.status === 'active' ? 'Active' : listing.status === 'sold' ? 'Sold Out' : 'Unknown';
        
        // Create item information with discoverable IDs
        let itemInfo = `**${listing.title || listing.type || 'Untitled Listing'}**`;
        
        // Add item slug/ID for easy discovery
        if (listing.slug) {
          itemInfo += `\n🔖 **Item Slug:** \`${listing.slug}\` *(copy this for searches)*`;
        }
        if (listing.id && listing.id !== listing.slug) {
          itemInfo += `\n🆔 **Listing ID:** \`${listing.id}\``;
        }
        if (listing.item_id && listing.item_id !== listing.slug) {
          itemInfo += `\n📦 **Item ID:** \`${listing.item_id}\``;
        }

        let valueText = `${operationEmoji} **${operationType}** • ${priceInfo}${unitInfo}\n` +
                       `${stockInfo} • ${statusEmoji} ${statusText}\n` +
                       `${locationInfo} • ${traderInfo}\n` +
                       `${updatedInfo}`;

        // Add image link if available
        if (listing.image_url) {
          valueText += `\n🖼️ [View Image](${listing.image_url})`;
        }

        // Add contact info if available
        if (listing.contact_info) {
          valueText += `\n📞 ${listing.contact_info}`;
        }

        listingsEmbed.addFields([
          {
            name: `${actualIndex}. ${itemInfo}`,
            value: valueText,
            inline: false
          }
        ]);
      });

      // Set main image to first listing with image
      const firstListingWithImage = currentListings.find(listing => listing.image_url);
      if (firstListingWithImage) {
        listingsEmbed.setImage(firstListingWithImage.image_url);
      }

      // Add pagination and filter info
      listingsEmbed.addFields([
        {
          name: '📊 Browse Information',
          value: `📄 **Page ${page}** of **${totalPages}** • **${allListings.length}** total listings\n` +
                 `💡 **Copy item slugs** above to search for similar items\n` +
                 `🔍 **Use filters** to narrow down results`,
          inline: false
        }
      ]);

      listingsEmbed
        .setFooter({ text: `UEX Marketplace • Showing ${currentListings.length} listings` })
        .setTimestamp();

      // Create navigation buttons
      const navigationRow = new ActionRowBuilder();
      
      // Previous page button
      if (page > 1) {
        navigationRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`listings_page_${page - 1}_${encodeFilters(filters)}`)
            .setLabel('◀️ Previous')
            .setStyle(ButtonStyle.Secondary)
        );
      }

      // Page indicator (non-clickable)
      navigationRow.addComponents(
        new ButtonBuilder()
          .setCustomId('page_indicator')
          .setLabel(`Page ${page}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      // Next page button
      if (page < totalPages) {
        navigationRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`listings_page_${page + 1}_${encodeFilters(filters)}`)
            .setLabel('Next ▶️')
            .setStyle(ButtonStyle.Secondary)
        );
      }

      // Action buttons row
      const actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🌐 Visit UEX Marketplace')
            .setStyle(ButtonStyle.Link)
            .setURL('https://uexcorp.space/marketplace'),
          new ButtonBuilder()
            .setLabel('🔄 Refresh')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`refresh_listings_${encodeFilters(filters)}`)
            .setEmoji('🔄')
        );

      // Add filter clear button if filters are active
      if (Object.keys(filters).length > 0) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setLabel('🗑️ Clear Filters')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('clear_filters_listings')
        );
      }

      const components = [actionRow];
      if (totalPages > 1) {
        components.unshift(navigationRow);
      }

      await interaction.editReply({ 
        embeds: [listingsEmbed], 
        components: components
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

/**
 * Get human-readable filter description
 */
function getFilterDescription(filters) {
  const parts = [];
  if (filters.username) parts.push(`by **${filters.username}**`);
  if (filters.operation) parts.push(`operation: **${filters.operation}**`);
  if (filters.type) parts.push(`item: **${filters.type}**`);
  
  return parts.length > 0 ? `(${parts.join(', ')})` : '';
}

/**
 * Encode filters for button custom IDs
 */
function encodeFilters(filters) {
  return Buffer.from(JSON.stringify(filters)).toString('base64').substring(0, 80);
}

/**
 * Decode filters from button custom IDs  
 */
function decodeFilters(encoded) {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString());
  } catch {
    return {};
  }
} 