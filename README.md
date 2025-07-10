# UEX-Discord Integration (Netlify)

**Serverless functions** for two-way communication between UEX Corp marketplace and Discord. Deploy your own instance for free on Netlify.

## 🚀 Features

- 🔔 **Instant Notifications**: UEX messages appear immediately in Discord ✅ *Works immediately*
- 💬 **Reply from Discord**: Use `/reply` commands to respond directly to UEX ⚠️ *Requires Discord bot setup*
- 🆓 **100% Free**: No usage limits, no subscription fees
- ⚡ **Serverless**: Runs on Netlify's free tier (125,000 requests/month)
- 🛡️ **Secure**: Your API keys stay in your Netlify environment
- 📊 **Health Monitoring**: Built-in status checking and error handling

## ⚡ Quick Start Status

After basic setup, you'll have:

**✅ Working immediately:**
- UEX → Discord notifications (rich embeds with reply instructions)
- Health monitoring and status checks
- Function-based reply system (via API calls)

**⚠️ Requires additional Discord bot setup:**
- `/reply` slash commands directly in Discord
- Interactive Discord bot responses

**👉 Choose your setup level:**
- **Basic** (5 minutes): Get UEX notifications in Discord
- **Advanced** (15 minutes): Add Discord slash commands - see [DISCORD-SETUP.md](DISCORD-SETUP.md)

## 🔒 **SECURITY FIRST**

**⚠️ CRITICAL: Never commit real credentials to GitHub!**

- ✅ Real credentials go **ONLY** in Netlify environment variables
- ✅ Use `environment-variables.example` as a template
- ✅ Keep your `.env` file in `.gitignore` (never commit it)

## 📋 Prerequisites

Before you begin, you'll need:

1. **GitHub Account**: For version control and Netlify deployment
2. **Netlify Account**: Sign up free at [netlify.com](https://netlify.com)
3. **Discord Server**: With a channel for notifications
4. **UEX Corp Account**: With API access enabled

## 🛠️ Quick Setup

### Step 1: Deploy to Netlify

#### Connect Repository
1. Push this code to your GitHub repository
2. Log into [Netlify](https://netlify.com)
3. Click **New site from Git**
4. Choose **GitHub** and select your repository
5. Build settings:
   - **Build command**: `echo "No build required"`
   - **Publish directory**: `public`
6. Click **Deploy site**

#### Configure Environment Variables
1. In Netlify, go to **Site settings** → **Environment variables**
2. Add these variables with YOUR actual values:

   ```bash
   # Required Variables - REPLACE WITH YOUR ACTUAL VALUES
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   DISCORD_CHANNEL_ID=YOUR_DISCORD_CHANNEL_ID_HERE
   UEX_SECRET_KEY=your_uex_secret_key_here
   
   # Optional Variables
   UEX_WEBHOOK_SECRET=your_webhook_secret_here
   ```

3. **Redeploy** the site after adding variables

### Step 2: Get Your Credentials Safely

#### Discord Setup
1. In your Discord server, right-click the target channel
2. Select **Edit Channel** → **Integrations** → **Create Webhook**
3. Name it "UEX Notifier" and copy the webhook URL
4. **Add to Netlify environment variables ONLY** (never commit to git)

#### UEX API Setup
1. Log into your UEX Corp account
2. Go to **Account Settings** → **API** section  
3. Copy your **Secret Key**
4. **Add to Netlify environment variables ONLY** (never commit to git)

### Step 3: Configure UEX Webhooks

1. In UEX Corp, go to **Webhooks** settings
2. Add these webhook URLs:

   **Negotiation Started:**
   ```
   https://YOUR-SITE.netlify.app/.netlify/functions/uex-webhook
   ```

   **Negotiation Replied:**
   ```
   https://YOUR-SITE.netlify.app/.netlify/functions/uex-webhook
   ```

3. Replace `YOUR-SITE` with your actual Netlify site name
4. **Activate** both webhooks

## 🧪 Testing

### Verify Deployment
1. Visit your health check endpoint:
   ```
   https://YOUR-SITE.netlify.app/.netlify/functions/health
   ```
2. You should see a JSON response with configuration status

### Test UEX → Discord Notifications
1. Create a negotiation in UEX Corp
2. Check your Discord channel for notifications
3. **✅ This should work immediately after setup**

### Test Discord → UEX Replies (Requires Additional Setup)

**⚠️ Important**: Typing `/reply` in Discord **won't work yet** because Discord doesn't know our functions exist!

**Quick Option**: Use manual function call:
```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/discord-command \
  -H "Authorization: your_auth_token" \
  -H "Content-Type: application/json" \
  -d '{"content":"/reply abc123 Hello World"}'
```

**Full Option**: Set up Discord bot for `/reply` slash commands - see [DISCORD-SETUP.md](DISCORD-SETUP.md)

## 📖 Usage

### Receiving Notifications
When someone starts a negotiation or replies in UEX, you'll see:

```
🔔 New UEX Message
Polaris - LTI Package

👤 From: TraderName
📝 Message: "Interested in this package, what's your best price?"

💬 Reply Command
/reply abc123def your message here

Negotiation: abc123def
```

### Sending Replies
To reply from Discord:

```
/reply abc123def I can offer 15% off for immediate payment
```

You'll get a confirmation:

```
✅ Reply Sent Successfully
Reply sent to negotiation: abc123def
Message: "I can offer 15% off for immediate payment"
```

## 🔧 API Details

### UEX API Integration
- **Endpoint**: `https://api.uexcorp.space/2.0/marketplace_negotiations_messages/`
- **Method**: POST
- **Authentication**: `secret_key` header
- **Parameters**:
  - `hash`: Negotiation hash from webhook
  - `message`: Your reply text
  - `is_production`: 1 (production mode)

### Discord Integration
- **Webhooks**: For sending notifications to Discord
- **Embeds**: Rich message formatting with colors and fields
- **Commands**: Simple `/reply` text parsing

### Response Handling
UEX API returns text responses:
- `ok`: Success
- `negotiation_not_found`: Invalid hash
- `negotiation_closed`: Can't reply to closed negotiation
- `missing_message`: Empty message
- `invalid_secret_key`: Authentication failed

## 🐛 Troubleshooting

### Check Function Logs
1. Go to Netlify **Site overview** → **Functions**
2. Click on any function to see recent logs
3. Look for error messages or failed requests

### Common Issues

**Discord notifications not appearing:**
- Verify `DISCORD_WEBHOOK_URL` is correct
- Check UEX webhook configuration
- Look at function logs for errors

**Replies not sending to UEX:**
- Verify `UEX_SECRET_KEY` is correct
- Check if secret key has proper permissions
- Test the health endpoint for connectivity

**Function timeout errors:**
- Functions have 10-second timeout
- Large responses may need optimization
- Check for infinite loops or blocking calls

### Manual Testing

Test individual functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development
netlify dev

# Test webhook function
curl -X POST http://localhost:8888/.netlify/functions/uex-webhook \
  -H "Content-Type: application/json" \
  -d '{"negotiation_hash":"test123","last_message":"Hello","sender_username":"TestUser","listing_title":"Test Listing"}'
```

## 📊 Monitoring

### Health Checks
Monitor your integration at:
```
https://YOUR-SITE.netlify.app/.netlify/functions/health
```

### Netlify Analytics
- View function usage in Netlify dashboard
- Monitor deployment history
- Track error rates and response times

### Discord Logging
All function activity is logged to Netlify, including:
- Webhook receptions from UEX
- Discord message sending
- API calls to UEX
- Error conditions

## 🔒 Security

### Best Practices
1. **Never commit credentials to git/GitHub**
2. **Use webhook signatures** for validation (set `UEX_WEBHOOK_SECRET`)
3. **Monitor function logs** for suspicious activity
4. **Limit Discord permissions** to minimum required
5. **Rotate API keys regularly**
6. **Keep environment variables secure in Netlify only**

### Rate Limiting
- Netlify: 125,000 function invocations/month (free tier)
- Discord: ~5 requests/second (webhook)
- UEX: Check their API documentation for limits

## 🆙 Upgrades

### Netlify Pro Features
If you need more capacity:
- **Pro Plan**: $19/month for 2M function invocations
- **Background Functions**: For long-running tasks
- **Edge Functions**: For faster response times

### Additional Features
This integration can be extended with:
- **Web Dashboard**: For managing negotiations
- **Database Storage**: For persistent data
- **Email Notifications**: As backup to Discord
- **Mobile App**: Using same API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. **Never commit real credentials**
5. Submit a pull request with detailed description

## 📄 License

MIT License - Feel free to use and modify for your needs.

## 🆘 Support

Having issues? Here's how to get help:

1. **Check the health endpoint** first
2. **Review function logs** in Netlify
3. **Create an issue** in this repository with:
   - Error messages from logs
   - Steps to reproduce
   - Your configuration (**without sensitive data**)

---

## 📚 API Endpoints

Your deployed integration provides these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/.netlify/functions/uex-webhook` | POST | Receive webhooks from UEX |
| `/.netlify/functions/discord-command` | POST | Process Discord commands |
| `/.netlify/functions/health` | GET | Health check and status |

## 🔗 Related Links

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Discord Webhook Guide](https://discord.com/developers/docs/resources/webhook)
- [UEX Corp API Documentation](https://uexcorp.space/api/documentation/)
- [Node.js Fetch API](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch) 