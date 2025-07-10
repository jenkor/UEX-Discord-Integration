# Discord Bot Setup

**Enable `/reply` slash commands in Discord (Optional)**

This guide shows you how to set up a Discord bot so you can type `/reply` directly in Discord instead of using browser console commands.

## 🎯 What You'll Get

After completing this guide:
- ✅ Type `/reply abc123 Your message` directly in Discord
- ✅ Bot responds with confirmation when message is sent
- ✅ Autocomplete for negotiation hashes
- ✅ Professional Discord integration

**⏱️ Time required:** 10-15 minutes

---

## 📋 Prerequisites

Before starting this guide, you must have:
- ✅ Completed the [Setup Guide](Setup-Guide) 
- ✅ UEX notifications working in Discord
- ✅ Your Netlify site deployed and functional

**Don't have these yet?** Complete the [Setup Guide](Setup-Guide) first.

---

## Step 1: Create Discord Application

### 1.1 Access Discord Developer Portal
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Log in with your Discord account
3. Click **"New Application"**
4. Name it something like "UEX Integration Bot"
5. Click **"Create"**

### 1.2 Get Your Application ID
1. You should now be on your application's **"General Information"** page
2. **Copy the "Application ID"** - you'll need this later
3. Save this ID somewhere safe

✅ **Checkpoint:** You have a Discord application and its ID.

---

## Step 2: Create Bot User

### 2.1 Configure Bot Settings
1. In the left sidebar, click **"Bot"**
2. Click **"Add Bot"** → **"Yes, do it!"**
3. **Customize your bot:**
   - **Username:** Something like "UEX Notifications"
   - **Avatar:** Upload an icon if you want (optional)

### 2.2 Get Bot Token
1. Under the **"Token"** section, click **"Copy"**
2. **Save this token** - it's like a password for your bot
3. **NEVER share this token** with anyone

### 2.3 Set Bot Permissions
1. Scroll down to **"Bot Permissions"**
2. Select these permissions:
   - ✅ **"Send Messages"**
   - ✅ **"Use Slash Commands"**
   - ✅ **"Embed Links"** (optional, for rich responses)

✅ **Checkpoint:** You have a bot user with a token.

---

## Step 3: Enable Slash Commands

### 3.1 Register Slash Commands
1. Still in Discord Developer Portal, click **"Slash Commands"** in the left sidebar
2. Click **"Create New Command"**
3. **Fill out the command details:**
   - **Name:** `reply`
   - **Description:** `Reply to a UEX Corp negotiation`
   - **Options:** 
     - **Option 1:**
       - **Name:** `hash`
       - **Description:** `Negotiation hash from Discord notification`
       - **Type:** `String`
       - **Required:** ✅ Yes
     - **Option 2:**
       - **Name:** `message`
       - **Description:** `Your reply message`
       - **Type:** `String`
       - **Required:** ✅ Yes
4. Click **"Save"**

### 3.2 Example Command Configuration
Your command should look like this:
```
Command: /reply
Description: Reply to a UEX Corp negotiation

Option 1:
- Name: hash
- Description: Negotiation hash from Discord notification
- Type: String
- Required: Yes

Option 2:
- Name: message
- Description: Your reply message
- Type: String
- Required: Yes
```

✅ **Checkpoint:** Slash command is registered.

---

## Step 4: Invite Bot to Your Server

### 4.1 Generate Invite Link
1. In Discord Developer Portal, click **"OAuth2"** → **"URL Generator"**
2. **Select scopes:**
   - ✅ **"bot"**
   - ✅ **"applications.commands"**
3. **Select bot permissions:**
   - ✅ **"Send Messages"**
   - ✅ **"Use Slash Commands"**
4. **Copy the generated URL**

### 4.2 Add Bot to Server
1. **Paste the URL** in a new browser tab
2. **Select your Discord server** from the dropdown
3. Click **"Authorize"**
4. Complete any captcha if prompted
5. **Verify the bot appears** in your server's member list

✅ **Checkpoint:** Bot is in your Discord server.

---

## Step 5: Configure Netlify Environment

### 5.1 Add Bot Configuration
1. Go to **Netlify Dashboard** → Your site → **"Site settings"** → **"Environment variables"**
2. **Add these new variables:**

**Variable 1: Discord Bot Token**
- **Key:** `DISCORD_BOT_TOKEN`
- **Value:** The bot token you copied in Step 2.2

**Variable 2: Discord Application ID**
- **Key:** `DISCORD_APPLICATION_ID`
- **Value:** The application ID you copied in Step 1.2

### 5.2 Redeploy Your Site
1. Go to **Netlify Dashboard** → Your site → **"Deploys"**
2. Click **"Trigger deploy"** → **"Deploy site"**
3. **Wait 2-3 minutes** for deployment to complete

✅ **Checkpoint:** Bot credentials are configured in Netlify.

---

## Step 6: Set Up Bot Event Handler

### 6.1 Create Discord Bot Function
This step assumes you have the correct Netlify function files. If your project doesn't have a Discord bot function, you'll need to add one.

**Check if you have:** `netlify/functions/discord-bot.js`

**If missing:** This means your project might need updating to support Discord bots. Check the main repository for the latest version.

### 6.2 Register Webhook with Discord
1. **Test your bot function:**
   - Go to: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/discord-bot`
   - You should see a response like: `{"type": "PING"}`

2. **Configure Discord webhook** (this step requires the correct function):
   - Discord will automatically register your bot's slash commands
   - This happens when the bot comes online

✅ **Checkpoint:** Bot is ready to receive commands.

---

## Step 7: Test Your Bot

### 7.1 Test Slash Command
1. **Go to your Discord server**
2. **In the notification channel, type:** `/reply`
3. **You should see autocomplete** showing the hash and message parameters
4. **Fill in a test command:**
   ```
   /reply hash:abc123def456 message:Hello from Discord bot!
   ```
5. **Press Enter**

### 7.2 Expected Behavior
**What should happen:**
1. ✅ Bot responds immediately: "Message sent to UEX Corp!"
2. ✅ Your reply appears in the UEX Corp negotiation
3. ✅ If there's an error, bot tells you what went wrong

**What might go wrong:**
- ❌ "Unknown command" → Bot needs time to register commands (wait 5-10 minutes)
- ❌ "Bot not responding" → Check Netlify function logs
- ❌ "Authentication error" → Verify UEX API keys are still valid

✅ **Checkpoint:** You can use `/reply` commands in Discord!

---

## 🔧 Troubleshooting

### Problem: "Slash command not appearing"

**Solutions:**
1. **Wait 5-10 minutes** - Discord needs time to register commands
2. **Try in a different channel** or refresh Discord
3. **Check bot permissions** - make sure it can use slash commands
4. **Re-invite the bot** with proper scopes

### Problem: "Bot not responding to commands"

**Solutions:**
1. **Check Netlify function logs:**
   - Go to Netlify Dashboard → Functions → discord-bot
   - Look for error messages

2. **Verify environment variables:**
   - `DISCORD_BOT_TOKEN` should be set
   - `DISCORD_APPLICATION_ID` should be set
   - Redeploy after adding variables

3. **Test bot function manually:**
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/discord-bot \
     -H "Content-Type: application/json" \
     -d '{"type": 1}'
   ```

### Problem: "Message not sent to UEX Corp"

**Solutions:**
1. **Check UEX API health:**
   - Go to: `https://your-site.netlify.app/.netlify/functions/health`
   - Verify UEX connectivity is healthy

2. **Verify negotiation hash:**
   - Make sure hash is exactly as shown in notification
   - Hash is case-sensitive

3. **Check if negotiation is still active:**
   - You can't reply to closed negotiations

---

## 🎨 Customization Options

### Custom Bot Responses
You can modify how the bot responds by editing the Discord bot function:

**Success response:**
```javascript
await interaction.reply({
  content: "✅ Message sent to UEX Corp successfully!",
  ephemeral: true  // Only visible to you
});
```

**Error response:**
```javascript
await interaction.reply({
  content: "❌ Failed to send message: " + error.message,
  ephemeral: true
});
```

### Rich Embeds
Make bot responses look more professional:
```javascript
const embed = {
  title: "UEX Reply Sent",
  description: "Your message has been sent to the negotiation",
  color: 0x00ff00,
  fields: [
    { name: "Negotiation", value: hash.substring(0, 8) + "...", inline: true },
    { name: "Message Length", value: message.length + " characters", inline: true }
  ],
  timestamp: new Date().toISOString()
};
```

---

## 🚀 Advanced Features

### Auto-Complete Negotiation Hashes
If you want autocomplete to suggest recent negotiation hashes, you can modify the bot to:
1. Store recent negotiation hashes in memory
2. Return them as autocomplete options
3. Make it easier to select the right negotiation

### Multiple Servers
To use the bot in multiple Discord servers:
1. Invite it to each server using the same OAuth2 URL
2. Configure separate channels for each server
3. Use different environment variables if needed

### Notification Customization
Combine bot features with notification customization:
- Add reaction buttons to notifications
- Include "Quick Reply" buttons
- Show negotiation status in bot responses

---

## 📋 Quick Reference

**Your Discord Bot URLs:**
- Developer Portal: [discord.com/developers/applications](https://discord.com/developers/applications)
- Bot Function: `https://your-site.netlify.app/.netlify/functions/discord-bot`

**Required Environment Variables:**
- `DISCORD_BOT_TOKEN` - Your bot's secret token
- `DISCORD_APPLICATION_ID` - Your application's ID
- `DISCORD_WEBHOOK_URL` - For notifications (from main setup)
- `DISCORD_CHANNEL_ID` - For notifications (from main setup)

**Slash Command Syntax:**
```
/reply hash:abc123def456 message:Your reply here
```

---

## 🔗 What's Next?

**Want more features?**
- [Customization Guide](Customization-Guide) - Modify notification appearance
- [Advanced Configuration](Advanced-Configuration) - Add security and monitoring

**Having problems?**
- [Troubleshooting](Troubleshooting) - General issue solutions
- [Environment Variables](Environment-Variables) - Complete variable reference

**Need help?**
- Create an issue on [GitHub](https://github.com/jenkor/UEX-Discord-Integration/issues)
- Check our [Discord community](https://discord.gg/your-invite)

*Last updated: December 2024* 