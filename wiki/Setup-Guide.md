# Complete Setup Guide

**Step-by-step instructions to get UEX Corp notifications in Discord (15-20 minutes)**

This guide assumes you have ZERO technical experience. We'll explain everything as we go.

## 🎯 What We're Building

By the end of this guide, you'll have:
- Discord notifications when someone messages your UEX Corp listings
- Ability to reply directly from Discord (optional)
- A system that runs 24/7 for free

## 📋 Before We Start

**You'll need accounts on these free services:**
- ✅ UEX Corp (you already have this)
- ✅ Discord (free account at [discord.com](https://discord.com))
- ✅ GitHub (free account at [github.com](https://github.com))
- ✅ Netlify (free account at [netlify.com](https://netlify.com))

**⏱️ Total time: About 15-20 minutes**

---

## Step 1: Fork This Repository

**What is forking?** It's like making your own copy of this project that you can customize.

### 1.1 Get the Code
1. Go to the [main project page](https://github.com/jenkor/UEX-Discord-Integration)
2. Click the **"Fork"** button in the top-right corner
3. GitHub will ask where to create the fork - choose your account
4. Wait for GitHub to copy the files (takes 10-20 seconds)

### 1.2 Verify Your Fork
- You should now be on YOUR copy of the project
- The URL should show `https://github.com/YOUR-USERNAME/UEX-Discord-Integration`
- You'll see "forked from jenkor/UEX-Discord-Integration" under the title

✅ **Checkpoint:** You now have your own copy of the code!

---

## Step 2: Deploy to Netlify

**What is Netlify?** It's a free service that will run your integration 24/7 without you needing a server.

### 2.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (easiest option)
4. Authorize Netlify to access your GitHub account

### 2.2 Deploy Your Fork
1. On Netlify dashboard, click **"New site from Git"**
2. Choose **"GitHub"** as your Git provider
3. Find and select your forked repository `UEX-Discord-Integration`
4. **Important:** Set these exact settings:
   - **Build command:** `echo "Static site"`
   - **Publish directory:** `public`
   - **Branch to deploy:** `main`
5. Click **"Deploy site"**

### 2.3 Get Your Site URL
1. Wait for deployment to finish (1-2 minutes)
2. Your site will get a random name like `amazing-cupcake-123456.netlify.app`
3. **Write this URL down** - you'll need it later!

✅ **Checkpoint:** Your integration is now running on Netlify!

---

## Step 3: Set Up Discord

**Goal:** Create a way for your integration to send messages to Discord.

### 3.1 Enable Discord Developer Mode
1. Open Discord (desktop or web app)
2. Click the ⚙️ (Settings) gear next to your username (bottom left)
3. Scroll down to **"Advanced"** in the left sidebar
4. Turn ON **"Developer Mode"**
5. Close the settings

*Why do this? It lets you copy channel IDs, which we need later.*

### 3.2 Create a Discord Webhook
1. Go to your Discord server (create one if you don't have one)
2. Find the channel where you want UEX notifications
3. Right-click the channel name → **"Edit Channel"**
4. Click **"Integrations"** in the left sidebar
5. Click **"Webhooks"** → **"Create Webhook"**
6. Give it a name like "UEX Notifications"
7. **CRITICAL:** Click **"Copy Webhook URL"**
8. **Paste this URL somewhere safe** - you'll need it in Step 5!

### 3.3 Get Your Channel ID
1. Right-click your notification channel name
2. Click **"Copy Channel ID"** (you'll see this because Developer Mode is on)
3. **Save this number** - it looks like `1234567890123456789`

✅ **Checkpoint:** You have a Discord webhook URL and channel ID!

---

## Step 4: Get UEX Corp API Keys

**Goal:** Get two different keys that let your integration talk to UEX Corp.

### 4.1 Get Your API Token (Bearer Token)
1. Log into [UEX Corp](https://uexcorp.space)
2. Click your username/profile in the top-right
3. Look for **"My Apps"** or **"API"** section
4. Find your **"API Token"** or **"Bearer Token"**
5. **Copy this token** and save it somewhere safe

*This token looks like a long random string of letters and numbers.*

### 4.2 Get Your Secret Key
1. Still in UEX Corp, go to your **"Profile"** or **"Account Settings"**
2. Look for an **"API"** section (might be under "Advanced" or "Developer")
3. Find your **"Secret Key"** (this is different from the API token!)
4. **Copy this key** and save it somewhere safe

**💡 Important:** These are like passwords for your UEX account. Keep them secret!

✅ **Checkpoint:** You have both UEX API keys!

---

## Step 5: Configure Environment Variables

**What are environment variables?** Think of them as a secure safe where Netlify stores your passwords.

### 5.1 Access Netlify Settings
1. Go back to [Netlify](https://netlify.com)
2. Click on your site (the one you deployed in Step 2)
3. Click **"Site settings"** (in the top navigation)
4. Click **"Environment variables"** in the left sidebar

### 5.2 Add Your Variables
You need to add exactly 4 variables. For each one:
1. Click **"Add variable"**
2. Enter the **Key** and **Value** exactly as shown below
3. Click **"Create variable"**

**Variable 1: Discord Webhook**
- **Key:** `DISCORD_WEBHOOK_URL`
- **Value:** The Discord webhook URL you copied in Step 3.2

**Variable 2: Discord Channel ID**
- **Key:** `DISCORD_CHANNEL_ID`
- **Value:** The channel ID number you copied in Step 3.3

**Variable 3: UEX API Token**
- **Key:** `UEX_API_TOKEN`
- **Value:** Your UEX API/Bearer token from Step 4.1

**Variable 4: UEX Secret Key**
- **Key:** `UEX_SECRET_KEY`
- **Value:** Your UEX secret key from Step 4.2

### 5.3 Redeploy Your Site
1. After adding all 4 variables, go back to your site dashboard
2. Click **"Deploys"** in the top navigation
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait 1-2 minutes for the new deployment to finish

✅ **Checkpoint:** Your integration now has all the credentials it needs!

---

## Step 6: Connect UEX Corp to Your Integration

**Goal:** Tell UEX Corp where to send notifications when someone messages you.

### 6.1 Find UEX Webhook Settings
1. Log into [UEX Corp](https://uexcorp.space)
2. Go to your account settings or profile
3. Look for **"Webhooks"**, **"API"**, **"Integrations"**, or **"Notifications"**

*The exact location varies, but it's usually in account/profile settings.*

### 6.2 Add Your Webhook URL
1. Click **"Add Webhook"** or **"Create New Webhook"**
2. For the webhook URL, enter:
   ```
   https://YOUR-SITE-NAME.netlify.app/.netlify/functions/uex-webhook
   ```
   **Replace `YOUR-SITE-NAME`** with your actual Netlify site name from Step 2.3
3. Choose events like **"Negotiation Started"** and **"Negotiation Replied"**
4. **Activate/Enable** the webhook
5. **Save** the settings

### 6.3 Example Webhook URL
If your Netlify site is `amazing-cupcake-123456.netlify.app`, your webhook URL would be:
```
https://amazing-cupcake-123456.netlify.app/.netlify/functions/uex-webhook
```

✅ **Checkpoint:** UEX Corp will now send notifications to your integration!

---

## Step 7: Test Your Setup

**Goal:** Make sure everything is working correctly.

### 7.1 Check Integration Health
1. Open your browser
2. Go to: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/health`
3. You should see something like this:
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "configuration": {
         "configured": {
           "discord_webhook_url": true,
           "discord_channel_id": true,
           "uex_api_token": true,
           "uex_secret_key": true
         }
       }
     }
   }
   ```

**Good signs:**
- ✅ `"status": "healthy"`
- ✅ All variables show `true`

**Bad signs:**
- ❌ `"status": "error"`
- ❌ Any variables show `false`

### 7.2 Test with Real Negotiation
1. Create a test listing in UEX Corp (or use an existing one)
2. Have someone message the listing (or message it from another account)
3. **Check your Discord channel** - you should see a notification within 30 seconds!

### 7.3 What You Should See in Discord
```
🔔 New UEX Message
Your Listing Title

👤 From: Username
📝 Message: "Their message content"

💬 To Reply:
/reply abc123 your response here

Negotiation: abc123def456...
```

✅ **Checkpoint:** You're receiving Discord notifications!

---

## Step 8: Test Replying (Optional)

**Goal:** Make sure you can reply to messages.

### 8.1 Quick Test (No Bot Required)
1. Copy a negotiation hash from a Discord notification (the long code at the bottom)
2. Open your browser's developer tools (F12)
3. Go to the Console tab
4. Run this command (replace with your details):
   ```javascript
   fetch('https://YOUR-SITE-NAME.netlify.app/.netlify/functions/discord-command', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({content: '/reply YOUR_HASH Your test message here'})
   }).then(r => r.json()).then(console.log)
   ```

### 8.2 For Discord Slash Commands
If you want to type `/reply` directly in Discord, see our [Discord Bot Setup Guide](Discord-Bot-Setup).

---

## 🎉 Congratulations!

You now have:
- ✅ Instant Discord notifications for UEX Corp messages
- ✅ A system running 24/7 for free
- ✅ The ability to reply to negotiations

## 🔧 What's Next?

**Want more features?**
- [Discord Bot Setup](Discord-Bot-Setup) - Enable `/reply` slash commands
- [Customization Guide](Customization-Guide) - Modify notification appearance
- [Advanced Configuration](Advanced-Configuration) - Add security and monitoring

**Having problems?**
- [Troubleshooting Guide](Troubleshooting) - Fix common issues
- [FAQ](FAQ) - Common questions and answers

**Need help?**
- Create an issue on [GitHub](https://github.com/jenkor/UEX-Discord-Integration/issues)
- Check our [Discord community](https://discord.gg/your-invite)

---

## 📋 Quick Reference

**Your Important URLs:**
- Health Check: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/health`
- UEX Webhook: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/uex-webhook`
- Netlify Dashboard: [app.netlify.com](https://app.netlify.com)

**Your Environment Variables:**
- `DISCORD_WEBHOOK_URL` - Your Discord webhook
- `DISCORD_CHANNEL_ID` - Your Discord channel ID
- `UEX_API_TOKEN` - Your UEX Bearer token
- `UEX_SECRET_KEY` - Your UEX secret key

*Last updated: December 2024* 