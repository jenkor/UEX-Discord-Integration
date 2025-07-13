/**
 * Marketplace Items Command
 * Search and discover available items from UEX Corp for use in other commands
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uexAPI = require('../handlers/uex-api');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('items')
    .setDescription('Search and discover available items from UEX Corp')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Search for items by name or category')
        .addStringOption(option =>
          option
            .setName('query')
            .setDescription('Search term (item name, category, or slug)')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('popular')
        .setDescription('Show most popular/traded items')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('random')
        .setDescription('Show random selection of items')
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const searchQuery = interaction.options.getString('query');

      logger.command('Items command used', {
        userId: interaction.user.id,
        username: interaction.user.username,
        subcommand,
        searchQuery
      });

      // Defer reply since API call might take time
      await interaction.deferReply({ ephemeral: true });

      // Get items from UEX API
      const result = await uexAPI.getItems();

      if (!result.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Error Fetching Items')
          .setDescription('Failed to retrieve items data from UEX Corp.')
          .setColor(0xff0000)
          .addFields([
            {
              name: '⚠️ Error Details',
              value: result.error || 'Unknown error occurred',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Items Database • Try again later' })
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const items = result.data || [];

      if (items.length === 0) {
        const noItemsEmbed = new EmbedBuilder()
          .setTitle('📦 No Items Found')
          .setDescription('No items data available from UEX Corp at this time.')
          .setColor(0x666666)
          .setFooter({ text: 'UEX Items Database' })
          .setTimestamp();

        await interaction.editReply({ embeds: [noItemsEmbed] });
        return;
      }

      let filteredItems = items;

      if (subcommand === 'search' && searchQuery) {
        // Filter items based on search query
        const query = searchQuery.toLowerCase();
        filteredItems = items.filter(item => 
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.slug && item.slug.toLowerCase().includes(query)) ||
          (item.category && item.category.toLowerCase().includes(query)) ||
          (item.code && item.code.toLowerCase().includes(query))
        );
      } else if (subcommand === 'popular') {
        // Show popular items (commodities, metals, harvestables)
        const popularCategories = ['commodities', 'metals', 'harvestables', 'precious metals'];
        filteredItems = items.filter(item => 
          item.category && popularCategories.some(cat => 
            item.category.toLowerCase().includes(cat)
          )
        ).slice(0, 15);
      } else if (subcommand === 'random') {
        // Show random selection
        filteredItems = items.sort(() => 0.5 - Math.random()).slice(0, 12);
      }

      if (filteredItems.length === 0) {
        const noResultsEmbed = new EmbedBuilder()
          .setTitle('🔍 No Items Found')
          .setDescription(`No items match your search: **${searchQuery}**`)
          .setColor(0x666666)
          .addFields([
            {
              name: '💡 Search Tips',
              value: '• Try broader search terms\n• Search by category (e.g., "metal", "ore", "commodity")\n• Use `/items popular` to see common items\n• Try `/items random` for discovery',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Items Database' })
          .setTimestamp();

        await interaction.editReply({ embeds: [noResultsEmbed] });
        return;
      }

      // Create embed with items (show first 12 for better display)
      const displayItems = filteredItems.slice(0, 12);
      
      let title = '📦 UEX Items Database';
      let description = `Found ${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`;
      
      if (subcommand === 'search') {
        title = `🔍 Search Results: ${searchQuery}`;
      } else if (subcommand === 'popular') {
        title = '⭐ Popular Trading Items';
        description = 'Most commonly traded items in the UEX marketplace';
      } else if (subcommand === 'random') {
        title = '🎲 Random Item Discovery';
        description = 'Random selection of items from the UEX database';
      }

      const itemsEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x0099ff);

      // Add items as fields (3 per row for better display)
      for (let i = 0; i < displayItems.length; i += 3) {
        const batch = displayItems.slice(i, i + 3);
        
        batch.forEach(item => {
          const itemName = item.name || 'Unknown Item';
          const itemSlug = item.slug || 'no-slug';
          const itemCode = item.code ? ` (${item.code})` : '';
          const itemCategory = item.category || 'Unknown Category';
          
          const value = `**Slug:** \`${itemSlug}\`\n` +
                       `**Category:** ${itemCategory}\n` +
                       `**Use in:** \`/marketplace-averages item slug:${itemSlug}\``;

          itemsEmbed.addFields([
            {
              name: `${itemName}${itemCode}`,
              value: value,
              inline: true
            }
          ]);
        });
      }

      // Add helpful footer
      if (filteredItems.length > 12) {
        itemsEmbed.setFooter({ 
          text: `UEX Items Database • Showing first 12 of ${filteredItems.length} items` 
        });
      } else {
        itemsEmbed.setFooter({ text: 'UEX Items Database • Copy slugs for use in other commands' });
      }

      itemsEmbed.setTimestamp();

      // Add helpful buttons
      const actionButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🌐 UEX Items Page')
            .setStyle(ButtonStyle.Link)
            .setURL('https://uexcorp.space/resources/home'),
          new ButtonBuilder()
            .setLabel('📊 View Averages')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('help_averages_command')
        );

      await interaction.editReply({ 
        embeds: [itemsEmbed], 
        components: [actionButtons] 
      });

    } catch (error) {
      logger.error('Items command error', { 
        error: error.message,
        stack: error.stack,
        userId: interaction.user.id 
      });

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while fetching items data.')
        .setColor(0xff0000)
        .setFooter({ text: 'UEX Items Database' })
        .setTimestamp();

      try {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error('Failed to send items error reply', { error: replyError.message });
      }
    }
  }
}; 