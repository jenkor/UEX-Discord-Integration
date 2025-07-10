# Environment Variables Reference

**Complete guide to all configuration variables**

This page documents every environment variable used by the UEX-Discord integration, what they do, and how to set them.

## 🎯 Quick Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DISCORD_WEBHOOK_URL` | ✅ Yes | Send notifications to Discord | `https://discord.com/api/webhooks/...` |
| `DISCORD_CHANNEL_ID` | ✅ Yes | Target Discord channel | `1234567890123456789` |
| `UEX_API_TOKEN` | ✅ Yes | UEX Corp API authentication | `c176bffee5f8c62849889554d173c90d...` |
| `UEX_SECRET_KEY` | ✅ Yes | UEX Corp personal key | `f176bfee5f8c6204989554d173c90d...` |
| `DISCORD_BOT_TOKEN` | ⚪ Optional | Discord bot for slash commands | `MTEyMzQ1Njc4OTAxMjM0NTY3OA...` |
| `DISCORD_APPLICATION_ID` | ⚪ Optional | Discord application ID | `1123456789012345678` |

---

## 🔑 Required Variables

### DISCORD_WEBHOOK_URL

**Purpose:** Allows the integration to send notification messages to your Discord channel.

**How to get it:**
1. Go to Discord → Your channel → Edit Channel
2. Click Integrations → Webhooks → Create Webhook
3. Copy the webhook URL

**Format:** `https://discord.com/api/webhooks/[WEBHOOK_ID]/[WEBHOOK_TOKEN]`

**Example:**
```
https://discord.com/api/webhooks/1234567890123456789/abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn
```

**Common mistakes:**
- ❌ Only copying part of the URL
- ❌ Including extra spaces or characters
- ❌ Using an expired/deleted webhook

**Test it:**
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

---

### DISCORD_CHANNEL_ID

**Purpose:** Identifies the specific Discord channel for advanced features and logging.

**How to get it:**
1. Enable Discord Developer Mode (Settings → Advanced → Developer Mode)
2. Right-click your channel → Copy Channel ID

**Format:** 17-19 digit number

**Example:**
```
1234567890123456789
```

**Common mistakes:**
- ❌ Using the server ID instead of channel ID
- ❌ Adding quotes around the number
- ❌ Including non-numeric characters

**Test it:** Paste the ID into Discord search - it should find your channel.

---

### UEX_API_TOKEN

**Purpose:** Authenticates your application with UEX Corp's API for sending replies.

**How to get it:**
1. Log into UEX Corp
2. Go to Profile → API or My Apps
3. Copy your API Token/Bearer Token

**Format:** Long hexadecimal string (32-64 characters)

**Example:**
```
c176bffee5f8c62849889554d173c90d78278a4b
```

**Common mistakes:**
- ❌ Using the secret key instead of API token
- ❌ Using an expired token
- ❌ Including extra spaces

**Test it:** Check the health endpoint for "uex_api_token": true

---

### UEX_SECRET_KEY

**Purpose:** Your personal authentication key for UEX Corp API access.

**How to get it:**
1. Log into UEX Corp
2. Go to Profile → API section
3. Copy your Secret Key (different from API token!)

**Format:** Long hexadecimal string (different from API token)

**Example:**
```
f176bfee5f8c6204989554d173c90d78278a41
```

**Common mistakes:**
- ❌ Using the API token instead of secret key
- ❌ Using the same value as UEX_API_TOKEN
- ❌ Not having both keys set

**Test it:** Check the health endpoint for "uex_secret_key": true

---

## 🤖 Optional Variables (Discord Bot)

### DISCORD_BOT_TOKEN

**Purpose:** Enables Discord bot functionality for slash commands like `/reply`.

**Required for:** Discord bot features only. Basic notifications work without this.

**How to get it:**
1. Go to Discord Developer Portal
2. Create application → Add Bot
3. Copy the bot token

**Format:** Base64-encoded string starting with bot user ID

**Example:**
```
BOT_TOKEN_STARTS_HERE.6_CHARS.27_CHARACTER_SECRET_PORTION
```

**Security note:** This is like a password for your bot. Never share it!

**Common mistakes:**
- ❌ Regenerating the token without updating the variable
- ❌ Using the application secret instead of bot token
- ❌ Sharing the token publicly

---

### DISCORD_APPLICATION_ID

**Purpose:** Identifies your Discord application for bot commands.

**Required for:** Discord bot features only.

**How to get it:**
1. Discord Developer Portal → Your application
2. Copy the Application ID from General Information

**Format:** 17-19 digit number (similar to channel ID)

**Example:**
```
1123456789012345678
```

**Common mistakes:**
- ❌ Using the bot user ID instead of application ID
- ❌ Using the client secret instead of application ID

---

## 🔧 How to Set Variables in Netlify

### Step-by-Step Process

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click on your site

2. **Access Environment Variables**
   - Click "Site settings" (top navigation)
   - Click "Environment variables" (left sidebar)

3. **Add Each Variable**
   - Click "Add variable"
   - Enter **Key** (exact name from table above)
   - Enter **Value** (your actual credential)
   - Click "Create variable"

4. **Redeploy Site**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait 2-3 minutes

### Variable Names Must Be Exact

**Correct:**
```
DISCORD_WEBHOOK_URL  ✅
UEX_API_TOKEN       ✅  
DISCORD_CHANNEL_ID  ✅
```

**Wrong:**
```
discord_webhook_url  ❌ (lowercase)
DISCORD_WEBHOOK_URl  ❌ (typo)
UEX_API_KEY         ❌ (wrong name)
```

---

## 🚨 Security Best Practices

### Do's and Don'ts

**✅ DO:**
- Store all secrets in Netlify environment variables
- Use different values for API token and secret key
- Regenerate keys if you think they're compromised
- Keep API keys private and secure

**❌ DON'T:**
- Hard-code secrets in your source code
- Share API keys in Discord, forums, or public places
- Use the same key for multiple purposes
- Store keys in plain text files

### If Keys Are Compromised

1. **Immediately regenerate** all affected keys
2. **Update Netlify variables** with new keys
3. **Redeploy your site**
4. **Test with health endpoint**

---

## 🩺 Diagnostic Commands

### Check Variable Configuration

**Health endpoint:**
```
https://your-site.netlify.app/.netlify/functions/health
```

**Good response:**
```json
{
  "configuration": {
    "configured": {
      "discord_webhook_url": true,
      "discord_channel_id": true,
      "uex_api_token": true,
      "uex_secret_key": true
    }
  }
}
```

### Test Individual Variables

**Test Discord webhook:**
```bash
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test from environment variables"}'
```

**Test UEX authentication:**
```bash
curl -H "Authorization: Bearer $UEX_API_TOKEN" \
  https://api.uexcorp.space/2.0/marketplace_negotiations_messages/
```

---

## 🔄 Environment-Specific Configuration

### Development vs Production

If you want separate configurations for testing:

**Option 1:** Use branch-specific variables in Netlify
- Set different variables for `develop` branch
- Deploy previews use different credentials

**Option 2:** Create separate Netlify sites
- Fork repository twice (dev/prod)
- Each fork has its own environment variables

### Multiple Discord Servers

To send notifications to multiple Discord servers:

**Option 1:** Deploy multiple instances
- Fork repository for each server
- Each gets its own Discord webhook

**Option 2:** Modify the webhook function (advanced)
- Edit `netlify/functions/uex-webhook.js`
- Add logic for multiple webhooks

---

## 🔍 Troubleshooting Variables

### Common Problems

**Variables showing as `false` in health check:**
1. Variable names have typos (case-sensitive)
2. Values have extra spaces or characters
3. Site wasn't redeployed after adding variables
4. Variables were deleted or expired

**"Cannot read environment variable" errors:**
1. Check Netlify function logs for specific errors
2. Verify variable exists in Netlify dashboard
3. Try redeploying the site

**Discord/UEX authentication failures:**
1. Regenerate the specific failing credentials
2. Update environment variables with new values
3. Redeploy and test

### Debug Checklist

- [ ] All 4 required variables are set in Netlify
- [ ] Variable names match exactly (case-sensitive)
- [ ] No extra spaces in variable values
- [ ] Site was redeployed after adding variables
- [ ] Health endpoint shows all variables as `true`
- [ ] Keys haven't expired or been revoked

---

## 📋 Environment Variable Template

**Copy this template** for your own reference:

```bash
# Required Variables
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_CHANNEL_ID=YOUR_CHANNEL_ID_NUMBER
UEX_API_TOKEN=YOUR_UEX_API_TOKEN_HERE
UEX_SECRET_KEY=YOUR_UEX_SECRET_KEY_HERE

# Optional (Discord Bot)
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_APPLICATION_ID=YOUR_APPLICATION_ID_HERE
```

**Replace** all `YOUR_*` placeholders with your actual values.

---

## 🔗 Related Pages

**Setup:** [Setup Guide](Setup-Guide) - How to get and set these variables  
**Keys:** [Getting API Keys](Getting-API-Keys) - Where to find your credentials  
**Bot:** [Discord Bot Setup](Discord-Bot-Setup) - Setting up optional bot variables  
**Help:** [Troubleshooting](Troubleshooting) - Fix variable-related problems

*Last updated: December 2024* 