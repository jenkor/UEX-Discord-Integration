# Troubleshooting Guide

**Solutions to common problems and how to diagnose issues**

This guide will help you fix the most common problems people encounter when setting up or using the UEX-Discord integration.

## 🚨 Quick Diagnosis

**Start here:** Check your integration's health status.

### Health Check Steps
1. Go to: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/health`
2. Look at the response to understand what's wrong

**Good Response (Everything Working):**
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
    },
    "connectivity": {
      "discord": {"status": "healthy"},
      "uex": {"status": "reachable"}
    }
  }
}
```

**Problem Indicators:**
- ❌ `"status": "error"`
- ❌ Any variables showing `false`
- ❌ Connectivity showing `"error"`

---

## 🔧 Environment Variable Problems

### Problem: "Missing UEX API configuration"

**Symptoms:**
- Health check shows UEX variables as `false`
- Error messages about missing UEX_API_TOKEN or UEX_SECRET_KEY

**Solutions:**
1. **Check Netlify Environment Variables:**
   - Go to Netlify dashboard → Your site → Site settings → Environment variables
   - Verify you have all 4 required variables:
     - `DISCORD_WEBHOOK_URL`
     - `DISCORD_CHANNEL_ID`
     - `UEX_API_TOKEN`
     - `UEX_SECRET_KEY`

2. **Redeploy After Adding Variables:**
   - Go to Netlify dashboard → Your site → Deploys
   - Click "Trigger deploy" → "Deploy site"
   - Wait 2-3 minutes for deployment to complete

3. **Check Variable Values:**
   - Make sure there are no extra spaces
   - Verify you copied the complete values
   - UEX_API_TOKEN and UEX_SECRET_KEY should be different values

### Problem: Variables showing as `false` in health check

**Cause:** Netlify functions can't see your environment variables.

**Solutions:**
1. **Verify variable names are EXACT:**
   ```
   DISCORD_WEBHOOK_URL  ✅ Correct
   discord_webhook_url  ❌ Wrong (case sensitive)
   DISCORD_WEBHOOK_URl  ❌ Wrong (typo)
   ```

2. **Redeploy is required:**
   - Environment variables only take effect after redeployment
   - Always redeploy after adding/changing variables

3. **Check for typos in values:**
   - Discord webhook should start with `https://discord.com/api/webhooks/`
   - Channel ID should be 17-19 digits
   - UEX keys should be long random strings

---

## 💬 Discord Problems

### Problem: "Not getting Discord notifications"

**Symptoms:**
- Health check shows Discord as `false` or `error`
- UEX messages aren't appearing in Discord
- No error messages

**Diagnostic Steps:**
1. **Test Discord Webhook Manually:**
   ```bash
   curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message from webhook"}'
   ```
   If this doesn't work, your webhook URL is wrong.

2. **Check Webhook URL Format:**
   - Should look like: `https://discord.com/api/webhooks/1234567890123456789/abcdef...`
   - Should be the COMPLETE URL, not just part of it
   - Should not have extra characters or spaces

**Solutions:**
1. **Recreate Discord Webhook:**
   - Go to Discord → Your channel → Edit Channel → Integrations → Webhooks
   - Delete old webhook
   - Create new webhook
   - Copy the FULL URL
   - Update Netlify environment variable

2. **Check Discord Channel Permissions:**
   - Make sure the channel still exists
   - Verify you have permission to create webhooks
   - Try creating webhook in a different channel

### Problem: "Discord webhook returns error 404"

**Cause:** Webhook was deleted or URL is incorrect.

**Solution:**
1. Create a new webhook in Discord
2. Update the `DISCORD_WEBHOOK_URL` in Netlify
3. Redeploy your site

---

## 🟨 UEX Corp Problems

### Problem: "Authentication error" from UEX

**Symptoms:**
- Error message: `{"status":"not_allowed","http_code":403,"message":"Sorry. Authentication error."}`
- Health check shows UEX as unreachable

**Solutions:**
1. **Check UEX Key Expiration:**
   - Log into UEX Corp
   - Go to Profile → API or My Apps
   - Generate new API token and secret key if needed
   - Update Netlify environment variables

2. **Verify Both Keys Are Set:**
   - You need BOTH `UEX_API_TOKEN` AND `UEX_SECRET_KEY`
   - They should be different values
   - Both should be long random strings

3. **Check UEX Account Status:**
   - Make sure your UEX Corp account is in good standing
   - Verify you have API access enabled
   - Contact UEX support if you can't access API settings

### Problem: "UEX API not responding"

**Symptoms:**
- Health check shows UEX connectivity as `error`
- Timeout errors when trying to send replies

**Solutions:**
1. **Check UEX Corp Status:**
   - Visit [UEX Corp](https://uexcorp.space) to see if it's down
   - Check their status page or social media

2. **Verify API Endpoint:**
   - The integration uses: `https://api.uexcorp.space/2.0/marketplace_negotiations_messages/`
   - If UEX Corp changed their API, this might need updating

---

## 🌐 Netlify Problems

### Problem: "Site not deploying"

**Symptoms:**
- Deploy failed status in Netlify
- Functions not updating after code changes
- Build errors

**Solutions:**
1. **Check Deploy Logs:**
   - Go to Netlify dashboard → Your site → Deploys
   - Click on the failed deploy
   - Read the error messages

2. **Common Deploy Fixes:**
   - Make sure your build command is `echo "Static site"`
   - Verify publish directory is `public`
   - Check that your repository is connected correctly

### Problem: "Functions returning 503 errors"

**Symptoms:**
- Health check returns 503 Service Unavailable
- All functions return server errors

**Solutions:**
1. **Wait for Deploy to Complete:**
   - Deployments can take 2-3 minutes
   - Don't test functions until deploy is finished

2. **Check Function Logs:**
   - Netlify dashboard → Your site → Functions
   - Click on function name to see execution logs
   - Look for specific error messages

---

## 🔄 Integration Flow Problems

### Problem: "Getting notifications but can't reply"

**Symptoms:**
- Discord notifications work perfectly
- Reply attempts fail or do nothing

**Solutions:**
1. **For Manual Testing:**
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
     -H "Content-Type: application/json" \
     -d '{"content": "/reply NEGOTIATION_HASH Your message here"}'
   ```

2. **For Discord Bot Commands:**
   - See [Discord Bot Setup](Discord-Bot-Setup) guide
   - Verify bot is properly configured and registered

3. **Check UEX Authentication:**
   - Make sure both UEX API keys are working
   - Test with the health endpoint

### Problem: "Replies not appearing in UEX Corp"

**Symptoms:**
- No error messages
- Command seems to work
- Message doesn't show up in UEX Corp negotiation

**Diagnostic Steps:**
1. **Check Function Logs:**
   - Go to Netlify → Functions → discord-command
   - Look for the response from UEX Corp API

2. **Verify Negotiation Hash:**
   - Make sure you're using the correct hash from the Discord notification
   - Hash should be exactly as shown (case sensitive)

**Solutions:**
1. **Negotiation might be closed:**
   - Check if the negotiation is still active in UEX Corp
   - You can't reply to closed negotiations

2. **UEX Corp API changes:**
   - API endpoints or authentication might have changed
   - Check UEX Corp documentation for updates

---

## 🔍 Advanced Diagnosis

### Reading Function Logs

**How to access logs:**
1. Netlify dashboard → Your site → Functions
2. Click on function name (e.g., "uex-webhook")
3. View recent invocations and their logs

**What to look for:**
- **Success logs:** `[INFO] Notification sent to Discord successfully`
- **Error logs:** `[ERROR]` messages with specific details
- **Authentication issues:** `401` or `403` error codes
- **Network issues:** Timeout or connection errors

### Testing Individual Functions

**Test UEX Webhook:**
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/uex-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "negotiation_hash": "test123",
    "last_message": "Test message",
    "sender_username": "TestUser",
    "listing_title": "Test Item"
  }'
```

**Test Discord Command:**
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
  -H "Content-Type: application/json" \
  -d '{"content": "/reply test123 Hello from API"}'
```

---

## 📞 Getting Help

### Before Asking for Help

1. **Check the health endpoint** and include the response
2. **Look at function logs** in Netlify
3. **Try the diagnostic steps** above
4. **Search existing issues** on GitHub

### How to Report Issues

**Include this information:**
1. **Health endpoint response** (remove sensitive data):
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "configuration": { ... }
     }
   }
   ```

2. **Error messages** from function logs
3. **Steps to reproduce** the problem
4. **What you expected** to happen
5. **What actually happened**

### Where to Get Help

1. **GitHub Issues:** [Create an issue](https://github.com/jenkor/UEX-Discord-Integration/issues/new)
2. **Discord Community:** [Join our server](https://discord.gg/your-invite)
3. **Wiki:** Check other wiki pages for related issues

---

## 🎯 Quick Fixes Checklist

When something's not working, try these in order:

- [ ] Check health endpoint for obvious issues
- [ ] Verify all 4 environment variables are set correctly
- [ ] Redeploy the site after any environment variable changes
- [ ] Test Discord webhook manually with curl
- [ ] Check UEX Corp API keys haven't expired
- [ ] Review function logs for specific error messages
- [ ] Try creating new Discord webhook if webhook issues persist
- [ ] Generate new UEX Corp API keys if authentication fails

**Still having issues?** Don't hesitate to ask for help - we're here to help you get it working!

---

## 🔗 Related Pages

**Setup:** [Setup Guide](Setup-Guide) - Complete installation instructions  
**Keys:** [Getting API Keys](Getting-API-Keys) - How to get your credentials  
**Variables:** [Environment Variables](Environment-Variables) - Complete reference  
**Advanced:** [Advanced Configuration](Advanced-Configuration) - Additional features

*Last updated: December 2024* 