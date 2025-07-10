# UEX-Discord Integration (Netlify)

**Free serverless solution** for two-way communication between UEX Corp marketplace and Discord. Deploy your own instance with zero subscription fees.

## 🚀 What You Get

- 🔔 **Instant Notifications**: UEX messages appear immediately in Discord with rich formatting
- 💬 **Discord Replies**: Use `/reply` slash commands to respond directly to UEX negotiations  
- 🆓 **Completely Free**: No usage limits on this code, runs on Netlify's free tier
- ⚡ **Serverless**: Auto-scales, no server maintenance required
- 🛡️ **Secure**: Protected functions, your credentials never leave your environment
- 📊 **Health Monitoring**: Built-in diagnostics and connectivity testing

## ⚡ Current Status

**✅ Working Immediately After Setup:**
- UEX → Discord notifications (rich embeds with negotiation details)
- Health monitoring and detailed status checks
- UEX API integration with proper dual authentication
- Manual testing endpoints for development

**⚠️ Requires Discord Bot Setup:**
- `/reply` slash commands directly in Discord (see [DISCORD-SETUP.md](DISCORD-SETUP.md))

**👤 Deploy Time: ~10 minutes for full setup**

## 🔒 Security First

**⚠️ NEVER commit real credentials to GitHub repositories!**

- ✅ All credentials stored securely in Netlify environment variables only
- ✅ Functions use proper authentication methods (webhook signatures, Discord verification)
- ✅ No manual tokens required - security handled automatically

---

## 📋 Prerequisites

1. **GitHub Account** - For repository hosting
2. **Netlify Account** - Free tier at [netlify.com](https://netlify.com)
3. **Discord Server** - With admin permissions to create webhooks
4. **UEX Corp Account** - With API access and an active secret key

---

## 🛠️ Setup Guide

### Step 1: Deploy to Netlify

1. **Fork/Clone this repository** to your GitHub account
2. **Connect to Netlify**:
   - Log into [Netlify](https://netlify.com)
   - Click **New site from Git** → **GitHub**
   - Select your forked repository
   - Build settings: 
     - Build command: `echo "Static site"`
     - Publish directory: `public`
   - Click **Deploy site**

3. **Note your site URL**: `https://your-site-name.netlify.app`

### Step 2: Configure Environment Variables

Go to **Site settings** → **Environment variables** in Netlify and add:

#### Required Variables
```bash
# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN
DISCORD_CHANNEL_ID=1234567890123456789

# UEX API Authentication (Both Required!)
UEX_API_TOKEN=your_api_bearer_token_from_uex_apps_page
UEX_SECRET_KEY=your_personal_secret_key_from_uex_profile
```

#### Optional Variables (for Discord Bot)
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id  
DISCORD_PUBLIC_KEY=your_discord_app_public_key
```

#### Optional Webhook Security
```bash
UEX_WEBHOOK_SECRET=your_webhook_signing_secret
```

### Step 3: Get Your Credentials

#### Discord Webhook
1. In Discord, right-click your target channel → **Edit Channel**
2. **Integrations** → **Webhooks** → **Create Webhook**
3. Name: "UEX Notifications", copy the webhook URL
4. For Channel ID: Right-click channel → **Copy Channel ID** (enable Developer Mode first)

#### UEX API Credentials  
You need **TWO** different tokens from UEX:

1. **API Token** (Bearer Token):
   - UEX Corp → **My Apps** section
   - Copy the Bearer token for API access

2. **Secret Key** (Personal Key):
   - UEX Corp → **Profile** → **API** section  
   - Copy your personal secret key



### Step 4: Configure UEX Webhooks

1. In UEX Corp, go to webhook settings
2. Add webhook URL for **negotiation events**:
   ```
   https://your-site-name.netlify.app/.netlify/functions/uex-webhook
   ```
3. **Activate** the webhook

### Step 5: Test Your Setup

1. **Health Check**: Visit `https://your-site-name.netlify.app/.netlify/functions/health`
   - Should show `"status": "healthy"` 
   - All required variables marked as `true`
   - Connectivity tests showing `"healthy"` or `"reachable"`

2. **Test Notification**: Create a negotiation in UEX Corp
   - Should appear in Discord within seconds
   - Rich embed format with reply instructions

---

## 📖 Usage

### Discord Notifications

When UEX negotiations happen, you'll see rich Discord messages:

```
🔔 New UEX Message
Polaris - LTI Package

👤 From: TraderName  
📝 Message: "What's your best price for immediate purchase?"

💬 To Reply:
/reply 5a0e527f Hello! I can do 15% off for immediate payment

Negotiation: 5a0e527f2e255caa9bada578cc84a5613666cf77
```

### Replying from Discord

**Option 1**: Discord Slash Commands (requires bot setup)
```
/reply 5a0e527f2e255caa9bada578cc84a5613666cf77 I can offer 15% off for quick sale
```

**Option 2**: Direct Function Call (for testing)
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
  -H "Content-Type: application/json" \
  -d '{"content": "/reply 5a0e527f2e255caa9bada578cc84a5613666cf77 Hello!"}'
```

### Success Response
```
✅ Reply Sent Successfully
Negotiation: 5a0e527f2e255caa9bada578cc84a5613666cf77
Message: "Hello!"
Message ID: 220096
```

---

## 🔧 Technical Details

### UEX API Integration

**Endpoint**: `https://api.uexcorp.space/2.0/marketplace_negotiations_messages/`

**Authentication** (Dual Required):
```javascript
headers: {
  'Authorization': 'Bearer ' + UEX_API_TOKEN,
  'secret_key': UEX_SECRET_KEY,
  'Content-Type': 'application/json'
}
```

**Request Format**:
```json
{
  "hash": "negotiation_hash_from_webhook",
  "message": "Your reply text",
  "is_production": 1
}
```

**Response Format**:
```json
{
  "status": "ok",
  "http_code": 200,
  "data": {"id_message": "220096"},
  "message": ""
}
```

### Function Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/health` | GET | System status | No |
| `/uex-webhook` | POST | Receive UEX events | Optional* |
| `/discord-command` | POST | Process commands (testing) | No |
| `/discord-bot` | POST | Handle Discord interactions | Discord signature** |

\* Optional webhook signature verification if `UEX_WEBHOOK_SECRET` configured  
\** Discord handles authentication via Ed25519 signature verification

### Error Codes

**UEX API Responses**:
- `"ok"` → Success, message sent
- `"negotiation_not_found"` → Invalid hash
- `"negotiation_closed"` → Cannot reply
- `"Authentication error"` → Invalid credentials

---

## 🐛 Troubleshooting

### 1. Check Health Status
Visit: `https://your-site.netlify.app/.netlify/functions/health`

Look for:
- `"status": "healthy"` 
- All required environment variables: `true`
- Connectivity tests: `"healthy"` or `"reachable"`

### 2. Common Issues

**"Missing UEX API configuration"**:
- Verify both `UEX_API_TOKEN` and `UEX_SECRET_KEY` are set
- Redeploy site after adding environment variables

**"Authentication error" from UEX**:
- Check your UEX secret key is current (they expire)
- Verify API token has proper permissions

**Discord notifications not appearing**:
- Verify webhook URL is correct
- Check UEX webhook is activated
- Review Netlify function logs

**"/reply not working"**:
- For slash commands: Complete Discord bot setup (see [DISCORD-SETUP.md](DISCORD-SETUP.md))
- For function calls: Ensure UEX credentials are properly configured

### 3. Function Logs
1. Netlify Dashboard → **Functions** tab
2. Click function name to view recent executions
3. Look for errors, timeouts, or authentication failures

### 4. Manual Testing

```bash
# Test Discord notification
curl -X POST https://your-site.netlify.app/.netlify/functions/uex-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "negotiation_hash": "test123",
    "last_message": "Test message", 
    "sender_username": "TestUser",
    "listing_title": "Test Item"
  }'

# Test UEX reply (testing endpoint)
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
  -H "Content-Type: application/json" \
  -d '{"content": "/reply test123 Hello from API"}'
```

---

## 🔒 Security Features

### Webhook Verification  
- Optional `UEX_WEBHOOK_SECRET` for UEX webhook signature validation
- Discord interactions verified with Ed25519 signatures
- Request logging for audit trails

### Function Security
- UEX webhooks use signature verification (when configured)
- Discord bot uses Discord's built-in authentication
- Testing endpoints available for manual integration testing

### Best Practices
1. **Rotate credentials regularly** (especially UEX secret keys)
2. **Monitor function logs** for suspicious activity  
3. **Use webhook signatures** when available for additional security
4. **Keep environment variables secure** in Netlify only
5. **Never commit credentials** to version control

---

## 📊 Monitoring & Limits

### Netlify Free Tier
- **125,000 function invocations/month**
- **10-second timeout per function**
- **50MB total deployment size**

### Rate Limits
- **Discord Webhooks**: ~5 requests/second
- **UEX API**: Check their documentation for current limits
- **Function calls**: Open for testing, monitored via Netlify analytics

### Analytics
Monitor usage in Netlify:
- Function execution count and duration
- Error rates and response codes  
- Deployment history and status

---

## 🆙 Advanced Setup

### Discord Bot Integration
For full `/reply` slash command support:
1. Follow [DISCORD-SETUP.md](DISCORD-SETUP.md)
2. Add Discord bot environment variables
3. Register slash commands with Discord

### Additional Security
1. **Enable webhook signatures**:
   ```bash
   UEX_WEBHOOK_SECRET=your_signing_secret
   ```

2. **Restrict function access**:
   - Use firewall rules in Netlify
   - Monitor access logs regularly

### Custom Domain
1. **Netlify Pro**: Add custom domain
2. **Update UEX webhooks**: Use your custom domain
3. **SSL**: Automatically provided by Netlify

---

## 🤝 Contributing

1. Fork this repository
2. Create feature branch: `git checkout -b feature-name`
3. **Test thoroughly** with your own Netlify deployment
4. **Never commit real credentials** (use examples only)
5. Submit pull request with detailed description

---

## 📄 License & Support

**MIT License** - Use freely for personal or commercial projects.

### Getting Help
1. **Check health endpoint** and function logs first
2. **Review this README** and [DISCORD-SETUP.md](DISCORD-SETUP.md)
3. **Create GitHub issue** with:
   - Health endpoint output (remove sensitive data)
   - Function logs showing errors
   - Steps to reproduce issue

### Community
- **Star this repo** if it helps you!
- **Share improvements** via pull requests
- **Report bugs** to help others

---

*Built for UEX Corp traders who want reliable Discord integration without recurring costs. Deploy once, use forever.* 🚀 