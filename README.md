# UEX Personal Discord Bot

A personal Discord bot that sends UEX Corp marketplace notifications directly to your DMs. Deploy your own instance for free, completely private notifications.

## 🎯 What This Bot Does

- **Private DM Notifications**: Receives UEX Corp marketplace events and sends them as direct messages to you
- **Slash Commands**: Reply to negotiations directly through Discord using `/reply` commands
- **Personal Deployment**: Each user deploys their own bot instance - completely private and independent
- **Free Forever**: Deploy on free hosting platforms with no usage limits

## 🏗️ Architecture

This bot replaces the previous Netlify Functions approach with a persistent Node.js application:

- **Express Server**: Handles incoming UEX webhooks at `/webhook/uex`
- **Discord.js Client**: Connects to Discord Gateway for DM delivery and command handling
- **Modular Design**: Easy to extend with new commands and features

## 🚀 Quick Start

### 1. Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token (keep this secret!)
5. Invite the bot to any Discord server you're in (required for DMs)

### 2. Get Your Discord User ID

1. Enable Developer Mode in Discord Settings > Advanced
2. Right-click your username anywhere in Discord
3. Select "Copy User ID"

### 3. Deploy the Bot

#### Option A: Wispbyte (Recommended)
1. Fork this repository
2. Sign up at [Wispbyte](https://wispbyte.com)
3. Create a new project and connect your GitHub repository
4. Set environment variables in the Wispbyte dashboard
5. Deploy!

#### Option B: Railway
1. Fork this repository
2. Sign up at [Railway](https://railway.app)
3. Create new project from GitHub repo
4. Set environment variables
5. Deploy!

### 4. Configure Environment Variables

Set these in your hosting platform's environment variables:

```bash
# Required
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_USER_ID=your_discord_user_id_here
UEX_API_TOKEN=your_uex_api_token_here
UEX_SECRET_KEY=your_uex_secret_key_here

# Optional
UEX_WEBHOOK_SECRET=your_webhook_secret_for_validation
```

### 5. Configure UEX Webhooks

1. In your UEX Corp dashboard, set webhook URL to: `https://your-bot-domain.com/webhook/uex`
2. Optionally set the webhook secret for validation

## 💬 Usage

### Receiving Notifications
- UEX marketplace events are automatically sent as DMs
- Rich embeds show negotiation details, messages, and reply instructions

### Replying to Negotiations
Use the `/reply` slash command:
```
/reply hash:abc123def message:Thanks for your offer!
```

### Testing the Bot
- Visit `https://your-bot-domain.com/health` to check bot status
- Use `POST /test/dm` to send a test DM

## 🛠️ Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/uex-discord-bot.git
cd uex-discord-bot
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

4. Start development server:
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── bot.js              # Main entry point
├── commands/           # Discord slash commands
│   └── reply.js        # Reply to UEX negotiations
├── handlers/           # External integrations
│   ├── webhook.js      # UEX webhook processing
│   └── uex-api.js      # UEX API communication
└── utils/              # Shared utilities
    ├── config.js       # Environment configuration
    └── logger.js       # Logging utility
```

## 🔧 Adding New Commands

1. Create a new file in `src/commands/`:
```javascript
// src/commands/status.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check bot status'),
  
  async execute(interaction) {
    await interaction.reply('Bot is online!');
  }
};
```

2. Restart the bot - commands are automatically loaded

## 🆘 Troubleshooting

### Bot Won't Start
- ✅ Check all required environment variables are set
- ✅ Verify Discord bot token is valid
- ✅ Ensure bot is invited to at least one Discord server

### DMs Not Working
- ✅ Bot must share a server with you to send DMs
- ✅ Check Discord privacy settings allow DMs from server members
- ✅ Verify DISCORD_USER_ID is correct

### Webhooks Not Working
- ✅ Update UEX webhook URL to your deployed bot's `/webhook/uex` endpoint
- ✅ Check UEX_WEBHOOK_SECRET matches your UEX configuration
- ✅ Verify bot is publicly accessible

## 🔐 Security

- **Private Deployment**: Each user has their own bot instance
- **Environment Variables**: All secrets stored in hosting platform
- **DM Only**: Notifications only go to the configured user
- **Webhook Validation**: Optional signature verification for UEX webhooks

## 📈 Migration from Netlify Functions

If you're migrating from the old Netlify Functions setup:

1. **Environment Variables**: Update from webhook URLs to bot tokens
2. **UEX Webhook URL**: Change from Netlify function to your new bot's `/webhook/uex`
3. **Discord Setup**: Switch from webhooks to bot DMs
4. **No More Limits**: Enjoy unlimited usage on free hosting

## 🎉 Benefits Over Previous Setup

- ✅ **No cold starts** - Always-on connection
- ✅ **No usage limits** - Free forever hosting
- ✅ **Better Discord integration** - Native bot features
- ✅ **Private DMs** - No public channel messages
- ✅ **Easier development** - Standard Node.js app
- ✅ **More reliable** - Persistent connection

## 📄 License

MIT License - feel free to modify and deploy your own instance!

## 🤝 Contributing

This is designed for personal deployment, but improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

- Check the `/health` endpoint for bot status
- Review logs in your hosting platform
- Ensure all environment variables are correctly set
- Verify Discord bot permissions and server membership 