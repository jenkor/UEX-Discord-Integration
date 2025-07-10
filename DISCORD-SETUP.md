# Discord Bot Setup Guide

## 🤖 Why You Need a Discord Bot

Currently, typing `/reply` in Discord does **nothing** because Discord doesn't know our Netlify functions exist. To fix this, we need to:

1. **Create a Discord Bot Application**
2. **Register slash commands** that point to our functions
3. **Configure Discord** to send interactions to our webhook

## 📋 Step-by-Step Setup

### Step 1: Create Discord Bot Application

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Click "New Application"**
3. **Name it**: "UEX Trading Bot" (or whatever you prefer)
4. **Go to "Bot" section** in the left sidebar
5. **Click "Add Bot"**
6. **Copy the bot token** - you'll need this for environment variables

### Step 2: Get Your Discord Server ID

1. **Enable Developer Mode** in Discord:
   - Settings → Advanced → Developer Mode (ON)
2. **Right-click your Discord server** in the left sidebar
3. **Select "Copy Server ID"**
4. **Save this ID** - you'll need it for environment variables

### Step 3: Invite Bot to Your Server

1. **In Discord Developer Portal**, go to **OAuth2 → URL Generator**
2. **Select scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`
3. **Select bot permissions**:
   - ✅ `Send Messages`
   - ✅ `Use Slash Commands`
   - ✅ `Read Message History`
4. **Copy the generated URL** and open it in your browser
5. **Select your Discord server** and authorize the bot

### Step 4: Configure Environment Variables in Netlify

Add these to your Netlify environment variables:

```bash
# Existing variables (keep these)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_CHANNEL_ID=YOUR_DISCORD_CHANNEL_ID_HERE
UEX_SECRET_KEY=your_uex_secret_key_here

# NEW variables for bot functionality
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_STEP_1
DISCORD_GUILD_ID=YOUR_DISCORD_SERVER_ID_FROM_STEP_2
DISCORD_PUBLIC_KEY=YOUR_BOT_PUBLIC_KEY_FROM_DEVELOPER_PORTAL
```

**Where to find Discord Public Key:**
1. Discord Developer Portal → Your Application → General Information
2. Copy the "Public Key" value

### Step 5: Configure Discord Interactions Endpoint

**This is the crucial step that connects Discord to your Netlify functions!**

1. **In Discord Developer Portal**, go to **General Information**
2. **Find "Interactions Endpoint URL"**
3. **Enter your bot function URL**:
   ```
   https://YOUR-SITE.netlify.app/.netlify/functions/discord-bot
   ```
4. **Save Changes**

Discord will now send slash command interactions to this URL!

### Step 6: Register the /reply Slash Command

After deploying your functions with the new environment variables:

1. **Call the registration function**:
   ```bash
   curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/register-discord-commands
   ```

2. **Check the response** - you should see:
   ```json
   {
     "success": true,
     "message": "Slash command registered successfully",
     "command_id": "123456789",
     "command_name": "reply"
   }
   ```

### Step 7: Test the Integration

1. **Go to your Discord server**
2. **Type `/reply`** - you should see the command auto-complete!
3. **Use the command**: `/reply abc123 Hello from Discord!`
4. **Check your UEX account** for the reply

## 🔄 How It Works

Once configured, here's the flow:

```
User types: /reply abc123 Hello!
       ↓
Discord sends interaction to:
https://your-site.netlify.app/.netlify/functions/discord-bot
       ↓  
Function processes command and calls UEX API
       ↓
UEX receives reply: {"hash": "abc123", "message": "Hello!"}
       ↓
Discord gets confirmation message
```

## 🐛 Troubleshooting

### "Interaction failed" in Discord

**Check Netlify function logs**:
1. Netlify Dashboard → Functions → discord-bot
2. Look for error messages

**Common issues**:
- ❌ Environment variables not set
- ❌ Interactions endpoint URL incorrect
- ❌ Public key doesn't match
- ❌ Function taking too long (3-second limit for Discord)

### Slash command not appearing

**Discord commands cache for up to 1 hour**:
- Wait or restart Discord
- Check if command registered successfully
- Try in incognito/private Discord web client

### Bot permissions

Make sure your bot has these permissions in your Discord server:
- ✅ View Channels
- ✅ Send Messages  
- ✅ Use Slash Commands
- ✅ Read Message History

## 🔒 Security Notes

- **Bot token is sensitive** - never commit to git
- **Public key validates** Discord requests
- **Interactions endpoint** should use HTTPS (Netlify provides this)
- **Function authentication** protects against abuse

## 🚀 Alternative: Simple Text Commands

If Discord bot setup seems complex, you can use a simpler approach:

1. **Use existing discord-command.js function**
2. **Manually call it** when you want to reply
3. **Skip bot registration** entirely

**Manual method:**
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
  -H "Authorization: your_auth_token" \
  -H "Content-Type: application/json" \
  -d '{"content":"/reply abc123 Hello World"}'
```

This sends the reply without needing slash commands in Discord.

## 📝 Summary

The Discord bot setup is optional but provides the best user experience:

- **With bot**: Type `/reply` directly in Discord ✨
- **Without bot**: Use manual function calls or webhooks

Choose based on your comfort level with Discord development! 