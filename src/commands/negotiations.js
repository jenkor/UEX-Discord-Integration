/**
 * Negotiations Command
 * View your marketplace negotiations from UEX Corp
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uexAPI = require('../handlers/uex-api');
const userManager = require('../utils/user-manager');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('negotiations')
    .setDescription('View your marketplace negotiations'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      logger.command('Negotiations command used', {
        userId,
        username: interaction.user.username
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

      // Fetch user's negotiations
      const result = await uexAPI.getMarketplaceNegotiations(userResult.credentials);

      if (!result.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Error Fetching Negotiations')
          .setDescription('Failed to retrieve your negotiations from UEX Corp.')
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

      const negotiations = result.data || [];

      if (negotiations.length === 0) {
        const noNegotiationsEmbed = new EmbedBuilder()
          .setTitle('💬 No Active Negotiations')
          .setDescription('You don\'t have any active marketplace negotiations.')
          .setColor(0x666666)
          .addFields([
            {
              name: '🛒 Start Trading',
              value: '• Create listings with `/marketplace-add`\n• Browse listings with `/marketplace-listings`\n• Contact other traders to start negotiations',
              inline: false
            }
          ])
          .setFooter({ text: 'UEX Marketplace' })
          .setTimestamp();

        const marketplaceButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('🌐 Visit UEX Marketplace')
              .setStyle(ButtonStyle.Link)
              .setURL('https://uexcorp.space/marketplace')
          );

        await interaction.editReply({ 
          embeds: [noNegotiationsEmbed], 
          components: [marketplaceButton] 
        });
        return;
      }

      // Group negotiations by status
      const activeNegotiations = negotiations.filter(n => n.status === 'active' || n.status === 'pending');
      const completedNegotiations = negotiations.filter(n => n.status === 'completed' || n.status === 'accepted');
      const otherNegotiations = negotiations.filter(n => !activeNegotiations.includes(n) && !completedNegotiations.includes(n));

      const negotiationsEmbed = new EmbedBuilder()
        .setTitle('💬 Your Marketplace Negotiations')
        .setDescription(`You have **${negotiations.length}** total negotiation${negotiations.length !== 1 ? 's' : ''}`)
        .setColor(0x0099ff);

      // Show active negotiations first (up to 5)
      if (activeNegotiations.length > 0) {
        const displayActive = activeNegotiations.slice(0, 5);
        
        negotiationsEmbed.addFields([
          {
            name: `🟢 Active Negotiations (${activeNegotiations.length})`,
            value: displayActive.map((negotiation, index) => {
              const itemName = negotiation.listing?.title || negotiation.item_name || 'Unknown Item';
              const price = negotiation.offered_price || negotiation.price || 0;
              const otherUser = negotiation.buyer_username || negotiation.seller_username || 'Unknown User';
              const role = negotiation.buyer_username ? 'Seller' : 'Buyer';
              
              return `**${index + 1}.** ${itemName}\n` +
                     `💰 ${Number(price).toLocaleString()} aUEC • ${role}: ${otherUser}\n` +
                     `🔗 Hash: \`${negotiation.hash}\``;
            }).join('\n\n'),
            inline: false
          }
        ]);
      }

      // Show completed negotiations (up to 3)
      if (completedNegotiations.length > 0) {
        const displayCompleted = completedNegotiations.slice(0, 3);
        
        negotiationsEmbed.addFields([
          {
            name: `✅ Recent Completed (${completedNegotiations.length})`,
            value: displayCompleted.map((negotiation, index) => {
              const itemName = negotiation.listing?.title || negotiation.item_name || 'Unknown Item';
              const price = negotiation.final_price || negotiation.offered_price || negotiation.price || 0;
              const completedDate = negotiation.completed_at || negotiation.updated_at || 'Unknown';
              
              return `**${index + 1}.** ${itemName} - ${Number(price).toLocaleString()} aUEC\n` +
                     `📅 ${completedDate}`;
            }).join('\n\n'),
            inline: false
          }
        ]);
      }

      // Show summary if there are more
      const totalShown = Math.min(5, activeNegotiations.length) + Math.min(3, completedNegotiations.length);
      if (negotiations.length > totalShown) {
        negotiationsEmbed.addFields([
          {
            name: '📊 Summary',
            value: `• **${activeNegotiations.length}** active negotiations\n` +
                   `• **${completedNegotiations.length}** completed negotiations\n` +
                   `• **${otherNegotiations.length}** other status\n` +
                   `Showing ${totalShown} of ${negotiations.length} total`,
            inline: false
          }
        ]);
      }

      // Add action buttons
      const actionButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🌐 Visit UEX Marketplace')
            .setStyle(ButtonStyle.Link)
            .setURL('https://uexcorp.space/marketplace'),
          new ButtonBuilder()
            .setLabel('💬 Reply via Discord')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('help_reply_command')
            .setEmoji('🤖')
        );

      negotiationsEmbed
        .setFooter({ text: 'UEX Marketplace • Use /reply to respond to negotiations' })
        .setTimestamp();

      await interaction.editReply({ 
        embeds: [negotiationsEmbed], 
        components: [actionButtons] 
      });

    } catch (error) {
      logger.error('Negotiations command error', { 
        error: error.message,
        stack: error.stack,
        userId: interaction.user.id 
      });

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while fetching your negotiations.')
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
        logger.error('Failed to send negotiations error reply', { error: replyError.message });
      }
    }
  }
}; 