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

      // Create embed with listings (show first 10)
      const displayListings = listings.slice(0, 10);
      const listingsEmbed = new EmbedBuilder()
        .setTitle('🏪 UEX Marketplace Listings')
        .setDescription(`Found ${listings.length} active listing${listings.length !== 1 ? 's' : ''} ${filters.username ? `by **${filters.username}**` : ''}`)
        .setColor(0x00ff00);

      // Add listings as fields
      displayListings.forEach((listing, index) => {
        const value = `**${listing.operation?.toUpperCase() || 'N/A'}** • ${listing.type || 'Unknown'}\n` +
                     `💰 **${Number(listing.price || 0).toLocaleString()} aUEC** per ${listing.unit || 'unit'}\n` +
                     `📍 ${listing.location || 'Unknown Location'}\n` +
                     `👤 ${listing.username || 'Unknown User'}`;

        listingsEmbed.addFields([
          {
            name: `${index + 1}. ${listing.title || 'Untitled Listing'}`,
            value: value,
            inline: true
          }
        ]);
      });

      // Add footer with additional info
      if (listings.length > 10) {
        listingsEmbed.setFooter({ 
          text: `UEX Marketplace • Showing first 10 of ${listings.length} listings` 
        });
      } else {
        listingsEmbed.setFooter({ text: 'UEX Marketplace' });
      }

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