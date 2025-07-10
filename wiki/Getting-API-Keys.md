# Getting API Keys

**Detailed guide to finding your UEX Corp and Discord credentials**

This page provides specific instructions for getting the 4 required keys/tokens for your integration.

## 🎯 What You Need

You need exactly 4 pieces of information:
1. **Discord Webhook URL** - So your integration can send messages to Discord
2. **Discord Channel ID** - To identify which channel gets notifications  
3. **UEX API Token** - To authenticate with UEX Corp's API
4. **UEX Secret Key** - Your personal authentication key

---

## 🟦 Discord Setup

### Discord Webhook URL

**What is it?** A special URL that lets external services send messages to your Discord channel.

#### Step-by-Step Instructions:

1. **Open Discord** (desktop app or web browser)
2. **Go to your server** where you want notifications
3. **Right-click the channel** where you want UEX messages
4. **Click "Edit Channel"**
5. **Click "Integrations"** in the left sidebar
6. **Click "Webhooks"**
7. **Click "Create Webhook"**
8. **Name it** something like "UEX Notifications"
9. **Click "Copy Webhook URL"**
10. **Save this URL** - it looks like:
    ```
    https://discord.com/api/webhooks/1234567890123456789/abcdefghijklmnopqrstuvwxyz1234567890
    ```

#### Troubleshooting:
- **"I don't see Edit Channel"** → You need admin permissions in the server
- **"I don't see Integrations"** → Make sure you're editing a text channel, not voice channel
- **"Webhook creation failed"** → Check your server permissions

### Discord Channel ID

**What is it?** A unique number that identifies your Discord channel.

#### Step-by-Step Instructions:

1. **Enable Developer Mode** (one-time setup):
   - Click the ⚙️ (Settings) next to your username
   - Scroll to "Advanced" in the left sidebar
   - Turn ON "Developer Mode"
   - Close settings

2. **Get Channel ID**:
   - Right-click your notification channel
   - Click "Copy Channel ID"
   - Save this number - it looks like: `1234567890123456789`

#### Troubleshooting:
- **"I don't see Copy Channel ID"** → Make sure Developer Mode is enabled
- **"The number looks wrong"** → It should be 17-19 digits long

---

## 🟨 UEX Corp Setup

### UEX API Token (Bearer Token)

**What is it?** A token that proves your application has permission to use UEX Corp's API.

#### Method 1: My Apps Section
1. **Log into UEX Corp**
2. **Click your username** in the top-right corner
3. **Look for "My Apps"** in the dropdown menu
4. **Find your application** or create a new one
5. **Copy the "API Token"** or "Bearer Token"
6. **Save this token** - it looks like a long random string

#### Method 2: Profile/Account Settings
1. **Log into UEX Corp**
2. **Go to Profile** or **Account Settings**
3. **Look for "API" section**
4. **Find "API Token"** or "Access Token"
5. **Copy the token**

#### Method 3: Developer Section
1. **Log into UEX Corp**
2. **Look for "Developer"** or "API" in the main menu
3. **Find your application credentials**
4. **Copy the Bearer token**

**Example token format:**
```
c176bffee5f8c62849889554d173c90d78278a4b
```

### UEX Secret Key

**What is it?** Your personal authentication key, different from the API token.

#### Step-by-Step Instructions:
1. **Log into UEX Corp**
2. **Go to your Profile** (click your username)
3. **Look for an "API" tab or section**
4. **Find "Secret Key"** or "Personal Key"**
5. **Copy this key** - it's different from the API token!

**Example secret key format:**
```
f176bfee5f8c6204989554d173c90d78278a41
```

#### Common Locations for UEX Keys:
- **Profile → API**
- **Account Settings → Developer**
- **My Apps → Application Details**
- **Settings → API Access**

#### Troubleshooting:
- **"I can't find My Apps"** → Look for "Developer", "API", or "Applications"
- **"I don't have API access"** → You may need to request API access in your UEX account
- **"My keys expired"** → Generate new keys and update your Netlify environment variables
- **"I only see one key"** → Make sure you have both the API token AND secret key

---

## 🔒 Security Best Practices

### Keep Your Keys Safe
- ✅ **Never share** your API keys with anyone
- ✅ **Never post them** in Discord, forums, or public places
- ✅ **Only store them** in Netlify environment variables
- ✅ **Regenerate keys** if you think they're compromised

### What Each Key Does
- **Discord Webhook URL** → Sends messages to Discord
- **Discord Channel ID** → Identifies the target channel
- **UEX API Token** → Authenticates your app with UEX Corp
- **UEX Secret Key** → Authenticates you personally with UEX Corp

### Key Expiration
- **Discord webhooks** → Don't expire (unless you delete them)
- **UEX API tokens** → May expire (check UEX Corp settings)
- **UEX secret keys** → May expire (generate new ones if needed)

---

## 📋 Verification Checklist

Before proceeding to setup, make sure you have:

- [ ] **Discord Webhook URL** (starts with `https://discord.com/api/webhooks/`)
- [ ] **Discord Channel ID** (17-19 digit number)
- [ ] **UEX API Token** (long random string from My Apps)
- [ ] **UEX Secret Key** (different random string from Profile)

**All 4 items checked?** → Continue to [Setup Guide](Setup-Guide)

---

## 🆘 Common Problems

### "I can't find UEX Corp API settings"
**Solution:** UEX Corp's interface changes sometimes. Try these locations:
- Click your username → Profile → API
- Settings → Account → Developer
- Main menu → My Apps or Applications
- Account Settings → Advanced → API

### "My Discord webhook isn't working"
**Solution:** 
- Make sure you copied the FULL webhook URL
- Test it by pasting the URL in a browser (you should see "Method Not Allowed")
- Make sure the channel still exists and webhook wasn't deleted

### "UEX Corp says I don't have API access"
**Solution:**
- Check if you need to request API access in your account
- Verify your UEX Corp account is in good standing
- Contact UEX Corp support if you can't access API settings

### "My keys stopped working"
**Solution:**
- API keys can expire - generate new ones
- Update your Netlify environment variables with new keys
- Redeploy your site after updating variables

---

## 🔗 Related Pages

**Next:** [Setup Guide](Setup-Guide) - Use your keys to configure the integration  
**Help:** [Troubleshooting](Troubleshooting) - Fix common key-related issues  
**Reference:** [Environment Variables](Environment-Variables) - Complete variable documentation

*Last updated: December 2024* 