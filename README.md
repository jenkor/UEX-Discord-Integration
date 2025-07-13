# UEX Multi-User Discord Bot

A secure, self-hostable Discord bot that serves multiple users with UEX Corp marketplace notifications and trading functionality. One deployment serves unlimited users with bank-level security and complete privacy options.

## 🎯 What This Bot Does

- **🔔 Real-time Notifications**: Receives UEX Corp marketplace events and sends them as Discord DMs to the appropriate users
- **⚡ Interactive Commands**: Reply to negotiations directly through Discord using slash commands or interactive buttons
- **👥 Multi-User Architecture**: One bot deployment serves unlimited users securely with encrypted credential storage
- **🔒 Privacy by Design**: Multiple privacy options using Discord's built-in permission system
- **💰 Free Forever**: Deploy once on free hosting platforms, serve unlimited users

## 🏗️ Multi-User Architecture

This bot is designed for **one admin to deploy and serve multiple users**:

- **Express Server**: Handles incoming UEX webhooks at `/webhook/uex`
- **Discord.js Client**: Connects to Discord Gateway for DM delivery and command handling  
- **Encrypted User Storage**: All user credentials secured with AES-256-GCM encryption
- **User Isolation**: Each user can only access their own negotiations and data
- **Privacy Controls**: Discord permissions provide complete user isolation options

### 🔒 Privacy Options for Users

**🏠 Private Discord Server (Recommended)**
- User creates their own Discord server
- Invites only the bot (complete isolation)
- Like having a personal bot instance

**🔒 Private Channels**
- Use private channels in existing Discord servers
- Channel permissions control who can see bot interactions
- Perfect for teams or small groups

**👥 Shared Servers**
- All bot commands are ephemeral (only the user sees responses)
- User credentials are encrypted and isolated from other users
- Convenient for large Discord communities

## 🚀 Quick Start for Admins

### 1. Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application → Go to "Bot" section → Create a bot
3. Copy the bot token (keep this secret!)
4. Enable "Message Content Intent" under Privileged Gateway Intents
5. Invite the bot to any Discord server (required for DMs to work)

### 2. Deploy the Bot

#### Option A: Render (Recommended - Free 750hrs/month)
**📖 [Complete Render Deployment Guide →](docs/RENDER-DEPLOYMENT.md)**

Quick steps:
1. Fork this repository to your GitHub account
2. Sign up at [Render](https://render.com) using your GitHub account
3. Create new web service from your forked repository
4. Set environment variables (see below)
5. Deploy and start serving users!

#### Option B: Other Platforms
The bot works on any Node.js hosting platform:
- **Railway**: https://railway.app
- **Daki Hosting**: https://daki.dev  
- **Any VPS**: With Node.js 18+ support

### 3. Configure Environment Variables

Set these in your hosting platform's environment variables:

```bash
# Required
DISCORD_BOT_TOKEN=your_discord_bot_token_here
USER_ENCRYPTION_KEY=your_random_32_character_encryption_key

# Optional  
UEX_WEBHOOK_SECRET=your_webhook_secret_for_validation
NODE_ENV=production
```

**🔑 Generate Encryption Key**: Use a random 32+ character string. This encrypts all user credentials.

### 4. Share Instructions with Users

Once deployed, share your bot's Discord invite link and the user instructions below.

## 💬 Usage for Users

### Initial Setup

**1. Register Your UEX Credentials:**
```
/register api_token:your_uex_token secret_key:your_uex_secret
```

**2. Configure UEX Webhooks:**
- In your UEX Corp account settings
- Set webhook URL to: `https://your-bot-domain.com/webhook/uex`
- Set webhook secret (if admin configured `UEX_WEBHOOK_SECRET`)

### Commands

**📝 Register/Manage Credentials:**
```
/register api_token:your_token secret_key:your_secret
/unregister
```

**💬 Reply to Negotiations:**
```
/reply hash:abc123def message:Thanks for your offer!
```

**🔧 Admin Commands (for bot admins):**
```
/admin stats  # View user registration statistics
/admin info   # View bot configuration details
```

### Interactive Features

**🔔 Automatic Notifications:**
- Receive DMs when UEX negotiations update
- Rich embeds with negotiation details
- Interactive "Reply" buttons for quick responses

**⚡ Button Interactions:**
- Click "Reply" buttons in notification messages
- Opens a modal dialog for easy message input
- No need to remember negotiation hashes

**🔒 Privacy Features:**
- All commands are ephemeral (only you see responses)
- Your credentials are encrypted and isolated
- Choose your privacy level with Discord permissions

## 🔒 Security & Privacy

- 🔐 **Bank-level Encryption**: All user credentials encrypted with AES-256-GCM
- 👤 **Complete User Isolation**: Users can only access their own negotiations
- 🔑 **Permission Validation**: Admin commands require Discord admin permissions
- 📝 **Comprehensive Logging**: All actions logged for security monitoring
- 🏠 **Privacy by Choice**: Use Discord permissions for complete isolation
- 🛡️ **Secure Storage**: File-based encrypted storage, no database required

## 🛠️ Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/UEX-Discord-Integration.git
cd UEX-Discord-Integration
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `env.example`:
```bash
cp env.example .env
# Edit .env with your actual values
```

4. Register slash commands:
```bash
node scripts/register-commands.js
```

5. Start development server:
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── bot.js                      # Main entry point: Express + Discord client
├── commands/                   # Discord slash commands
│   ├── register.js            # User credential registration
│   ├── unregister.js          # User credential removal  
│   ├── reply.js               # UEX negotiation replies
│   └── admin.js               # Admin commands (stats, info)
├── handlers/                   # External integrations
│   ├── webhook.js             # UEX webhook processing
│   ├── uex-api.js             # UEX API communication
│   └── button-interactions.js # Discord button/modal handling
└── utils/                      # Shared utilities
    ├── config.js              # Environment configuration
    ├── logger.js              # Logging utility
    └── user-manager.js        # User credential encryption/storage

docs/                          # Deployment guides
└── RENDER-DEPLOYMENT.md       # Render hosting guide

scripts/
└── register-commands.js       # Slash command registration script

user_data/                     # Encrypted user credential files (auto-created)
```

## 🔧 Adding New Commands

1. Create a new file in `src/commands/`:
```javascript
// src/commands/status.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your UEX connection status'),
  
  async execute(interaction) {
    await interaction.reply({ 
      content: 'Bot is online!', 
      ephemeral: true 
    });
  }
};
```

2. Restart the bot - commands are automatically loaded

## 🆘 Troubleshooting

### For Admins

**Bot Won't Start:**
- ✅ Check all required environment variables are set
- ✅ Verify Discord bot token is valid
- ✅ Ensure bot is invited to at least one Discord server
- ✅ Check hosting platform logs for specific errors

**Webhooks Not Working:**
- ✅ Verify webhook URL is publicly accessible: `https://your-bot-domain.com/webhook/uex`
- ✅ Check `UEX_WEBHOOK_SECRET` matches your UEX configuration
- ✅ Test health endpoint: `https://your-bot-domain.com/health`

### For Users

**Commands Not Working:**
- ✅ Bot must share a server with you to send DMs
- ✅ Check Discord privacy settings allow DMs from server members
- ✅ Verify you've registered with `/register` command

**Not Receiving Notifications:**
- ✅ Ensure you've set up UEX webhooks correctly
- ✅ Check if bot is online in Discord
- ✅ Verify your UEX API credentials are still valid

**Registration Issues:**
- ✅ Use the exact command format: `/register api_token:token secret_key:secret`
- ✅ Ensure your UEX credentials are correct
- ✅ Try re-registering if you updated your UEX credentials

## 🌟 Benefits of This Multi-User Architecture

- ✅ **Zero deployment complexity for users** - Admin deploys once, serves everyone
- ✅ **Privacy by choice** - Use Discord permissions for complete isolation
- ✅ **Bank-level security** - All credentials encrypted with military-grade encryption
- ✅ **No usage limits** - Free hosting serves unlimited users forever
- ✅ **Better Discord integration** - Native bot features, buttons, and commands
- ✅ **Easier maintenance** - One deployment, automatic updates for all users
- ✅ **More reliable** - Persistent connection, no cold starts, built-in error handling

## 🔄 Updates and Maintenance

### For Admins
- Push changes to your GitHub repository
- Hosting platform automatically rebuilds and deploys
- Zero downtime deployments
- Monitor usage with `/admin stats` command

### Auto-Sleep Behavior (Free Hosting)
- Service sleeps after inactivity to save resources
- **Automatically wakes** on:
  - Incoming UEX webhooks
  - Discord command usage
  - Health check requests
- No manual intervention needed

## 📄 License

MIT License - feel free to modify and deploy your own instance!

## 🤝 Contributing

Improvements to the multi-user architecture are welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

**For Admins:**
- Check the `/health` endpoint for bot status
- Use `/admin info` for bot configuration details
- Monitor logs in your hosting platform dashboard
- Review deployment guides in `/docs` folder

**For Users:**
- Ensure you're registered with `/register` command
- Use private Discord servers/channels for complete privacy
- Contact your bot admin if you experience issues
- All commands work in DMs, private channels, or shared servers

---

**🚀 Ready to deploy? Choose your hosting platform and follow the deployment guide!** 