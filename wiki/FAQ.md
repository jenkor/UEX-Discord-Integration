# Frequently Asked Questions (FAQ)

**Quick answers to the most common questions**

## 🚀 Getting Started

### Q: Is this completely free?
**A: Yes!** Everything we use is free:
- ✅ **Netlify:** Free tier includes 125k function calls/month
- ✅ **GitHub:** Free for public repositories
- ✅ **Discord:** Free service, always
- ✅ **UEX Corp:** Free API access (with rate limits)

You won't pay anything unless you exceed Netlify's generous free limits.

### Q: Do I need programming experience?
**A: No!** This guide is designed for complete beginners. If you can:
- Copy and paste text
- Click buttons in web browsers
- Follow step-by-step instructions

Then you can set this up! We explain everything as we go.

### Q: How long does setup take?
**A: 15-20 minutes for basic setup.** Here's the breakdown:
- **Basic notifications:** 15-20 minutes
- **Discord bot (optional):** +10-15 minutes  
- **Customization:** +30-60 minutes

### Q: What if I get stuck?
**A: We have extensive help resources:**
1. Check the [Troubleshooting Guide](Troubleshooting) first
2. Search [existing GitHub issues](https://github.com/jenkor/UEX-Discord-Integration/issues)
3. Create a new issue with details about your problem
4. Join our Discord community for real-time help

---

## 🔧 Technical Questions

### Q: Why Netlify? Can I use other hosting?
**A: Netlify is ideal for beginners because:**
- ✅ **Zero configuration** - works out of the box
- ✅ **Free tier** is very generous 
- ✅ **Automatic deployment** from GitHub
- ✅ **Built-in environment variables** for secrets
- ✅ **No server management** required

**Can you use other hosting?** Yes, but you'd need to:
- Set up your own server (AWS, Google Cloud, etc.)
- Configure environment variables manually
- Handle deployment and scaling
- Manage security and SSL certificates

For beginners, Netlify is the easiest choice.

### Q: Is my data secure?
**A: Yes, we follow security best practices:**
- ✅ **API keys stored securely** in Netlify environment variables
- ✅ **No sensitive data logged** or stored permanently
- ✅ **HTTPS encryption** for all communications
- ✅ **Webhook signature verification** prevents fake requests
- ✅ **No third-party tracking** or analytics

**Your UEX Corp credentials never leave your Netlify instance.**

### Q: What data is stored?
**A: Minimal data storage:**
- ✅ **Temporary:** Recent negotiation hashes (for bot autocomplete)
- ✅ **Environment variables:** Your API keys (encrypted by Netlify)
- ✅ **Function logs:** Error messages for debugging (auto-deleted after 1 week)

**We don't store:** Messages, negotiation details, or personal information.

### Q: Can UEX Corp or Discord see my setup?
**A: Limited visibility:**
- **UEX Corp:** Only sees webhook delivery attempts (success/failure)
- **Discord:** Only sees messages sent via webhook/bot
- **Neither can see:** Your environment variables or Netlify configuration

---

## 💬 Discord Integration

### Q: Why do I need both webhook URL and channel ID?
**A: They serve different purposes:**
- **Webhook URL:** Sends notifications to Discord
- **Channel ID:** Identifies the target channel for advanced features

**Think of it like mailing a letter:**
- Webhook URL = the entire postal address
- Channel ID = the apartment number

### Q: Can I send notifications to multiple channels?
**A: Not with the basic setup, but it's possible:**

**Option 1 (Easy):** Set up separate integrations
- Fork the repository multiple times
- Deploy each fork with different Discord settings
- Each gets its own Netlify site

**Option 2 (Advanced):** Modify the webhook function
- Edit `netlify/functions/uex-webhook.js`
- Add logic to send to multiple channels
- Requires some JavaScript knowledge

### Q: Can I customize notification appearance?
**A: Yes!** See our [Customization Guide](Customization-Guide) for:
- ✅ **Custom colors** and emojis
- ✅ **Additional fields** (date, urgency, etc.)
- ✅ **Rich embeds** with images and links
- ✅ **Different formats** for different types of messages

### Q: Why isn't the Discord bot working?
**A: Common causes:**
1. **Commands not registered:** Wait 5-10 minutes after setup
2. **Missing permissions:** Bot needs "Use Slash Commands" permission
3. **Wrong environment variables:** Check `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID`
4. **Function not deployed:** Redeploy after adding bot variables

**Check:** [Discord Bot Troubleshooting](Discord-Bot-Setup#troubleshooting)

---

## 🟨 UEX Corp Integration

### Q: Where do I find my UEX Corp API keys?
**A: Location varies, try these places:**
1. **Profile → API** (most common)
2. **Account Settings → Developer**
3. **My Apps → Application Details**
4. **Settings → API Access**

**Detailed instructions:** [Getting API Keys](Getting-API-Keys)

### Q: I can't find UEX Corp API settings!
**A: UEX Corp's interface changes sometimes. Solutions:**
1. **Look for these terms:** "API", "Developer", "My Apps", "Applications"
2. **Check account settings** and profile pages thoroughly
3. **Contact UEX Corp support** if you can't find API access
4. **Make sure your account is in good standing** - some restrictions may apply

### Q: What's the difference between API Token and Secret Key?
**A: They're used for different purposes:**
- **API Token (Bearer):** Authenticates your application with UEX Corp
- **Secret Key:** Your personal authentication key

**Both are required** - the integration uses both for different API calls.

### Q: My UEX keys stopped working!
**A: API keys can expire. Solutions:**
1. **Generate new keys** in your UEX Corp account
2. **Update Netlify environment variables** with new keys
3. **Redeploy your site** after updating variables
4. **Test with health endpoint** to verify they work

### Q: Can I reply to any negotiation?
**A: No, there are limitations:**
- ✅ You can only reply to **your own** negotiations
- ✅ Negotiations must be **active** (not closed)
- ✅ You need **proper permissions** in UEX Corp
- ❌ Can't reply to others' negotiations
- ❌ Can't reply to expired/closed negotiations

---

## 🌐 Hosting & Performance

### Q: Will this work 24/7?
**A: Yes, with some caveats:**
- ✅ **Netlify functions** run 24/7 on their servers
- ✅ **No maintenance required** from you
- ⚠️ **Rare outages** can happen (Netlify or UEX Corp)
- ⚠️ **Rate limits** apply if you get tons of messages

**Netlify's uptime is typically 99.9%+**

### Q: What are the rate limits?
**A: Free tier limits:**
- **Netlify:** 125,000 function invocations/month
- **Discord:** 50 webhook messages/second (very high)
- **UEX Corp:** Varies, but generous for personal use

**For most users:** You'll never hit these limits unless you're processing hundreds of negotiations daily.

### Q: What happens if I exceed limits?
**A: Graceful degradation:**
- **Netlify:** Functions stop working until next month
- **Discord:** Temporarily rate-limited (automatic retry)
- **UEX Corp:** API calls rejected (error messages logged)

**Solution:** Upgrade to Netlify Pro ($19/month) for higher limits.

### Q: Can I monitor usage?
**A: Yes, multiple ways:**
1. **Netlify Dashboard:** Shows function usage and logs
2. **Health endpoint:** `your-site.netlify.app/.netlify/functions/health`
3. **Function logs:** Detailed execution history
4. **Discord notifications:** You'll see if messages stop coming

---

## 🛠️ Maintenance & Updates

### Q: Do I need to update the code?
**A: Occasionally, but it's easy:**
1. **Watch the main repository** for updates
2. **Check release notes** for new features
3. **Sync your fork** when updates are available
4. **Redeploy automatically** happens via Netlify

**Most updates:** Bug fixes and new features (optional).

### Q: What if UEX Corp changes their API?
**A: We monitor for changes:**
1. **We'll update the code** to handle API changes
2. **You'll see notifications** if your integration breaks
3. **Update your fork** to get the fixes
4. **Check GitHub issues** for status updates

### Q: How do I update my fork?
**A: GitHub makes this easy:**
1. Go to your forked repository
2. Click **"Sync fork"** button
3. Confirm the sync
4. Netlify will automatically redeploy

---

## 🔍 Troubleshooting

### Q: Health check shows "false" for variables
**A: This means Netlify can't see your environment variables:**
1. **Double-check variable names** (case-sensitive)
2. **Verify all 4 variables** are set
3. **Redeploy your site** after adding variables
4. **Wait 2-3 minutes** for deployment to complete

### Q: Getting "CORS errors"
**A: Usually means:**
1. **Function isn't deployed** yet
2. **Wrong URL** in your testing
3. **Netlify build failed** (check deploy logs)

**Solution:** Check Netlify dashboard for deploy status.

### Q: Discord notifications stopped working
**A: Check these in order:**
1. **Discord webhook still exists?** (someone might have deleted it)
2. **Channel still exists?** (server changes)
3. **UEX Corp still sending webhooks?** (check UEX settings)
4. **Netlify functions working?** (check health endpoint)

### Q: No notifications at all
**A: Diagnostic steps:**
1. **Test health endpoint** first
2. **Check UEX Corp webhook settings** (is it active?)
3. **Verify negotiation activity** (are you getting messages?)
4. **Look at Netlify function logs** for errors

**Detailed diagnosis:** [Troubleshooting Guide](Troubleshooting)

---

## 💰 Costs & Limits

### Q: When would I need to pay?
**A: Only if you exceed free limits:**
- **Netlify Pro:** $19/month for 2M+ function calls
- **UEX Corp:** Currently free for personal use
- **Discord & GitHub:** Always free for this use case

**Most users never need to upgrade.**

### Q: Can I use this for commercial purposes?
**A: Check the terms:**
- **This integration:** MIT license (commercial use OK)
- **Netlify:** Commercial use allowed on paid plans
- **UEX Corp:** Check their API terms for commercial limits
- **Discord:** Commercial bots require verification for large servers

---

## 🔗 Related Resources

**Next Steps:**
- [Setup Guide](Setup-Guide) - Complete installation
- [Discord Bot Setup](Discord-Bot-Setup) - Add slash commands
- [Customization Guide](Customization-Guide) - Modify appearance

**Need Help:**
- [Troubleshooting](Troubleshooting) - Fix common problems
- [Environment Variables](Environment-Variables) - Complete reference
- [GitHub Issues](https://github.com/jenkor/UEX-Discord-Integration/issues) - Report problems

**Can't find your question?** Create an issue and we'll add it to this FAQ!

*Last updated: December 2024* 