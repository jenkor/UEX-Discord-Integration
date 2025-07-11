# Deploy UEX Discord Bot on Wispbyte

A complete guide to deploy the UEX Discord Bot on [Wispbyte](https://wispbyte.com) free hosting.

## 📋 Prerequisites

Before deploying, you'll need:

1. **GitHub Account** with this repository forked
2. **Discord Bot** created and configured
3. **Wispbyte Account** (free signup)
4. **UEX API Access** (users will provide their own credentials)

## 🚀 Step-by-Step Deployment

### Step 1: Fork the Repository

1. Go to this GitHub repository
2. Click **"Fork"** button (top right)
3. Choose your GitHub account as the destination
4. Wait for the fork to complete

### Step 2: Create Discord Bot

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Create New Application**:
   - Click "New Application"
   - Name it "UEX Bot" (or whatever you prefer)
   - Accept Discord's Terms of Service

3. **Create the Bot**:
   - Go to "Bot" section in left sidebar
   - Click "Add Bot"
   - Confirm by clicking "Yes, do it!"

4. **Get Bot Token**:
   - Under "Token" section, click "Copy"
   - **Save this token securely** - you'll need it for Wispbyte
   - ⚠️ **Never share this token publicly**

5. **Configure Bot Permissions**:
   - Scroll down to "Privileged Gateway Intents"
   - Enable "Message Content Intent" (required for commands)

6. **Invite Bot to Discord Server**:
   - Go to "OAuth2" → "URL Generator"
   - **Scopes**: Check "bot" and "applications.commands"
   - **Bot Permissions**: Check "Send Messages" and "Use Slash Commands"
   - Copy the generated URL and open it in a new tab
   - Select your Discord server and authorize the bot

### Step 3: Sign Up for Wispbyte

1. **Go to Wispbyte**: https://wispbyte.com
2. **Create Account**:
   - Click "Sign Up" or "Get Started"
   - Use your GitHub account for easy integration
   - Complete the signup process

### Step 4: Deploy on Wispbyte

1. **Create New Project**:
   - In Wispbyte dashboard, click "New Project"
   - Choose "Import from GitHub"
   - Select your forked UEX Discord Bot repository

2. **Configure Build Settings**:
   - **Framework**: Select "Node.js" or "Other"
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18 or higher
   - **Port**: Leave default (will be auto-detected)

3. **Set Environment Variables**:
   Click "Environment Variables" and add these:

   ```bash
   # Required Variables
   DISCORD_BOT_TOKEN=paste_your_discord_bot_token_here
   USER_ENCRYPTION_KEY=generate_random_32_character_string_here
   
   # Optional Variables
   UEX_WEBHOOK_SECRET=your_webhook_secret_for_validation
   NODE_ENV=production
   ```

   **🔑 Generate Encryption Key**: Use a random 32+ character string like:
   ```
   UEX_Bot_Secret_Key_2024_Random_123456789
   ```

4. **Deploy**:
   - Click "Deploy" button
   - Wait for deployment to complete (usually 2-3 minutes)
   - Wispbyte will show build logs during deployment

### Step 5: Verify Deployment

1. **Check Deployment Status**:
   - Your bot should show "Deploy successful"
   - Note the deployed URL (like `https://your-project.wispbyte.com`)

2. **Test Health Endpoint**:
   - Visit `https://your-project.wispbyte.com/health`
   - Should return JSON with bot status

3. **Test Discord Bot**:
   - Go to your Discord server
   - The bot should appear online
   - Try typing `/` to see if slash commands are available

## 👥 User Setup Instructions

Once deployed, share these instructions with your Discord community:

### For Discord Users

1. **Register Your UEX Credentials**:
   ```
   /register api_token:your_uex_token secret_key:your_uex_secret
   ```

2. **Test Your Setup**:
   ```
   /reply hash:test_hash message:Hello UEX!
   ```

3. **Configure UEX Webhooks**:
   - In your UEX Corp account settings
   - Set webhook URL to: `https://your-project.wispbyte.com/webhook/uex`
   - Set webhook secret (if you configured `UEX_WEBHOOK_SECRET`)

4. **For Privacy** (Optional):
   - Create a private Discord server and invite only the bot
   - Or use private channels with restricted permissions
   - All bot responses are ephemeral (only you see them)

### For Server Admins

Monitor bot usage with admin commands:
```
/admin stats    # View user registration statistics
/admin info     # View bot configuration and status
```

## 🔧 Configuration Options

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_BOT_TOKEN` | ✅ | Your Discord bot token |
| `USER_ENCRYPTION_KEY` | ✅ | 32+ character encryption key |
| `UEX_WEBHOOK_SECRET` | ❌ | Webhook validation secret |
| `NODE_ENV` | ❌ | Set to `production` for deployment |
| `PORT` | ❌ | Auto-set by Wispbyte |

### Wispbyte Features Used

- **Free Hosting**: No cost for basic usage
- **GitHub Integration**: Auto-deploy on git push
- **Environment Variables**: Secure credential storage
- **Custom Domains**: Available if you want to add one
- **SSL/TLS**: Automatic HTTPS

## 🔍 Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Check Discord bot is online in your server
- Verify `DISCORD_BOT_TOKEN` is correct
- Ensure bot has "Use Slash Commands" permission

**"Invalid webhook signature" errors:**
- Check `UEX_WEBHOOK_SECRET` matches UEX configuration
- Or remove the variable to skip validation

**Users can't register:**
- Verify `USER_ENCRYPTION_KEY` is set
- Check bot logs in Wispbyte dashboard

**Build/deployment fails:**
- Check Wispbyte build logs for specific errors
- Ensure all required environment variables are set
- Verify Node.js version is 18+

### Getting Help

1. **Check Bot Status**: Visit `/health` endpoint
2. **View Logs**: Use Wispbyte dashboard logs section
3. **Test Commands**: Use `/admin info` for bot diagnostics
4. **Discord Permissions**: Ensure bot has proper server permissions

## 🔄 Updates and Maintenance

### Auto-Updates from GitHub

Wispbyte can auto-deploy when you push to main branch:

1. In Wispbyte dashboard, go to project settings
2. Enable "Auto Deploy" for main branch
3. Any changes to your repository will trigger redeployment

### Manual Updates

1. In Wispbyte dashboard, click "Redeploy"
2. Or push changes to your GitHub repository
3. Wispbyte will rebuild and redeploy automatically

## 🎉 Success!

Your UEX Discord Bot is now deployed and ready to serve multiple users securely! 

**Next Steps:**
- Share registration instructions with your Discord community
- Monitor usage with admin commands
- Configure UEX webhooks for automatic notifications
- Enjoy unlimited, free UEX trading notifications! 

## 🆘 Support

If you encounter issues:
- Check this guide's troubleshooting section
- Review Wispbyte documentation
- Create an issue in the GitHub repository
- Ask in your Discord server's support channels 