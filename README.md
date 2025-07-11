# UEX Discord Bot

A secure multi-user Discord bot that sends UEX Corp marketplace notifications directly to your DMs. One deployment serves multiple users with complete privacy options.

## 🎯 What This Bot Does

- **Private DM Notifications**: Receives UEX Corp marketplace events and sends them as direct messages to you
- **Slash Commands**: Reply to negotiations directly through Discord using `/reply` commands
- **Multi-User Architecture**: One bot deployment serves multiple users securely
- **Privacy by Design**: Encrypted credentials + Discord permissions for complete privacy
- **Free Forever**: Deploy once, serve multiple users on free hosting platforms

## 🏗️ Architecture

This bot uses a secure multi-user architecture with privacy options:

- **Express Server**: Handles incoming UEX webhooks at `/webhook/uex`
- **Discord.js Client**: Connects to Discord Gateway for DM delivery and command handling
- **Encrypted User Storage**: All user credentials secured with AES-256 encryption
- **Privacy Controls**: Discord permissions provide complete user isolation

### 🔒 Privacy Options

**🏠 Private Discord Server**
- Create your own Discord server, invite only the bot
- Complete isolation, like having your own personal bot
- No other users can see your activity

**🔒 Private Channels**
- Use private channels in existing Discord servers
- Channel permissions control who can see bot interactions
- Perfect for teams or small groups

**👥 Shared Servers**
- All bot commands are ephemeral (only you see responses)
- Your credentials are encrypted and isolated from other users
- Convenient for large Discord communities

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
USER_ENCRYPTION_KEY=your_random_32_character_encryption_key

# Optional
UEX_WEBHOOK_SECRET=your_webhook_secret_for_validation
```

### 5. Users Register Their UEX Credentials

Each user runs this command to securely register their UEX API credentials:
```
/register api_token:their_uex_token secret_key:their_uex_secret
```

### 6. Configure UEX Webhooks (Per User)

Each user sets their UEX webhook URL to: `https://your-bot-domain.com/webhook/uex`

## 💬 Usage

### For Users

**Register Your Credentials:**
```
/register api_token:your_uex_token secret_key:your_uex_secret
```

**Reply to Negotiations:**
```
/reply hash:abc123def message:Thanks for your offer!
```

**Remove Your Credentials:**
```
/unregister
```

### For Server Admins

**View Usage Statistics:**
```
/admin stats
```

**View Bot Information:**
```
/admin info
```

### Privacy & Notifications
- UEX marketplace events automatically sent as DMs to the appropriate user
- All commands are ephemeral (only you see the responses)
- Rich embeds show negotiation details and reply instructions

### Testing the Bot
- Visit `https://your-bot-domain.com/health` to check bot status
- Send a test DM: `POST /test/dm/YOUR_DISCORD_USER_ID`

## 🔒 Security & Privacy

- 🔐 **Encrypted Storage**: All user credentials encrypted with AES-256
- 👤 **User Isolation**: Each user can only access their own negotiations
- 🔑 **Permission Validation**: Admin commands require Discord admin permissions
- 📝 **Audit Trail**: All user actions logged for security
- 🏠 **Privacy Options**: Use private Discord servers/channels for complete isolation

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

## 🎉 Benefits of This Architecture

- ✅ **No deployment complexity** - Users don't need to deploy anything
- ✅ **Privacy by choice** - Use Discord permissions for complete isolation
- ✅ **Secure by design** - All credentials encrypted with bank-level security
- ✅ **No usage limits** - Free forever hosting serves unlimited users
- ✅ **Better Discord integration** - Native bot features and commands
- ✅ **Easier maintenance** - One deployment, multiple users
- ✅ **More reliable** - Persistent connection, no cold starts

## 📄 License

MIT License - feel free to modify and deploy your own instance!

## 🤝 Contributing

This is designed for multi-user deployment, but improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

- Check the `/health` endpoint for bot status
- Use `/admin info` for bot configuration details
- Ensure users have registered with `/register` command
- Verify Discord bot permissions and server access
- Use private Discord servers/channels for complete privacy 