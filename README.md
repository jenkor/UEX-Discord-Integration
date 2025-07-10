# UEX-Discord Integration (Free & Easy Setup)

**Get UEX Corp marketplace notifications directly in your Discord server - completely free!**

Never miss another negotiation message. When someone replies to your UEX listing, you'll instantly see it in Discord and can reply right back without opening UEX Corp.

## 🎯 What This Does (In Simple Terms)

**Think of this as a bridge between UEX Corp and Discord:**

✅ **Instant Notifications**: When someone messages you in UEX Corp, you get a nice message in Discord  
✅ **Reply from Discord**: Type `/reply` in Discord to respond without opening UEX Corp  
✅ **100% Free**: No monthly fees, no subscription, no limits  
✅ **Always On**: Works 24/7 automatically  
✅ **Private**: Only you see your notifications in your Discord server  

## 📱 What You'll See

**When someone messages your UEX listing, Discord will show:**
```
🔔 New UEX Message
Polaris - LTI Package

👤 From: SpacePilot42
📝 Message: "Is this still available? Can you do 15% off?"

💬 To Reply:
/reply abc123 Yes, still available! I can do 10% off for quick sale

Negotiation: abc123def456...
```

**Then you can reply directly from Discord - no need to open UEX Corp!**

---

## 🚀 Before You Start

**You'll need accounts on these free services:**
1. **Discord** - Where you'll receive notifications ([discord.com](https://discord.com))
2. **GitHub** - To store your code ([github.com](https://github.com))  
3. **Netlify** - To run your integration ([netlify.com](https://netlify.com))
4. **UEX Corp** - Your existing account ([uexcorp.space](https://uexcorp.space))

**Total setup time: About 15 minutes**  
**Technical skills needed: Copy/paste and following instructions**

---

## 📝 Step-by-Step Setup

### Step 1: Get This Code

**Option A: Fork on GitHub (Recommended)**
1. Click the **Fork** button at the top of this page
2. This copies the code to your GitHub account
3. You now have your own copy you can modify

**Option B: Download and Upload**
1. Click **Code** → **Download ZIP** 
2. Extract the files
3. Create a new repository on GitHub and upload the files

### Step 2: Connect to Netlify (The Free Hosting)

**What is Netlify?** It's a free service that will run your integration 24/7.

1. **Sign up** at [netlify.com](https://netlify.com) (free account)
2. Click **"New site from Git"**
3. Choose **GitHub** and log in
4. Select your forked repository
5. **Important settings:**
   - Build command: `echo "Static site"` (type exactly this)
   - Publish directory: `public` (type exactly this)
6. Click **"Deploy site"**
7. **Write down your site URL** - looks like `https://your-name-123.netlify.app`

### Step 3: Set Up Discord (Where You'll Get Notifications)

#### What You Need to Do:
Create a special Discord "webhook" (think of it as a mailbox where UEX can send messages).

#### Detailed Steps:

**3.1 Enable Developer Mode (One-time setup)**
1. Open Discord
2. Click the ⚙️ (Settings) next to your username
3. Go to **Advanced** → Turn on **Developer Mode**
4. Close settings

**3.2 Create a Webhook**
1. Go to your Discord server
2. Find the channel where you want UEX notifications
3. Right-click the channel name → **Edit Channel**
4. Click **Integrations** on the left
5. Click **Webhooks** → **Create Webhook**
6. Name it "UEX Notifications"
7. **IMPORTANT**: Click **Copy Webhook URL** - save this somewhere safe!

**3.3 Get Your Channel ID**
1. Right-click your notification channel
2. Click **Copy Channel ID** (you'll see this because Developer Mode is on)
3. Save this number somewhere - it looks like `1234567890123456789`

### Step 4: Get Your UEX Corp API Keys

**You need 2 different keys from UEX Corp:**

#### 4.1 Get Your API Token (Bearer Token)
1. Log into UEX Corp
2. Go to **My Apps** section (look in your account menu)
3. Find your **API Token** or **Bearer Token**
4. Copy it (looks like a long random string)

#### 4.2 Get Your Secret Key  
1. Still in UEX Corp, go to your **Profile**
2. Look for an **API** section
3. Find your **Secret Key** (different from the API token!)
4. Copy it (another long random string)

**💡 Tip:** These are like passwords - keep them safe and never share them!

### Step 5: Tell Netlify Your Secrets (Environment Variables)

**What are environment variables?** They're like a safe where Netlify stores your passwords so your code can use them without anyone else seeing them.

#### How to Add Them:
1. Go back to your Netlify dashboard
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. For each variable below, click **Add variable**:

#### Required Variables (Add These 4):

**Variable 1:**
- **Key:** `DISCORD_WEBHOOK_URL`
- **Value:** The Discord webhook URL you copied (starts with `https://discord.com/api/webhooks/`)

**Variable 2:**
- **Key:** `DISCORD_CHANNEL_ID`  
- **Value:** The channel ID number you copied (just the numbers)

**Variable 3:**
- **Key:** `UEX_API_TOKEN`
- **Value:** Your UEX API/Bearer token

**Variable 4:**
- **Key:** `UEX_SECRET_KEY`
- **Value:** Your UEX secret key

**Important:** After adding all 4, click **"Redeploy site"** so Netlify picks up the new variables.

### Step 6: Connect UEX Corp to Your Integration

**Now tell UEX Corp where to send notifications:**

1. In UEX Corp, find **Webhook** or **API** settings (usually in account settings)
2. Add a new webhook with this URL:
   ```
   https://your-site-name.netlify.app/.netlify/functions/uex-webhook
   ```
   (Replace `your-site-name` with your actual Netlify site name)
3. **Activate** the webhook
4. Save the settings

### Step 7: Test Everything Works

#### 7.1 Check Your Integration Health
1. Visit: `https://your-site-name.netlify.app/.netlify/functions/health`
2. You should see something like `"status": "healthy"`
3. Look for all your variables showing as `true`

#### 7.2 Test with a Real Negotiation
1. Create a test listing in UEX Corp (or use an existing one)
2. Have someone message it (or message yourself from another account)
3. Check your Discord channel - you should see a notification within seconds!

---

## 🎉 You're Done! Here's How to Use It

### Getting Notifications
- Every time someone messages your UEX listing, you'll see it in Discord
- The message shows who wrote it, what they said, and how to reply

### Replying to Messages
**Option 1: Set up Discord bot** (see [DISCORD-SETUP.md](DISCORD-SETUP.md) for advanced users)
- Type `/reply abc123 your message` directly in Discord

**Option 2: Test with a simple web request** (for testing)
```bash
# Replace with your site name and actual negotiation hash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/discord-command \
  -H "Content-Type: application/json" \
  -d '{"content": "/reply abc123def your reply message here"}'
```

---

## 🆘 Help! Something's Not Working

### Check This First
Visit your health page: `https://your-site-name.netlify.app/.netlify/functions/health`

**If you see errors:**
- ❌ `"status": "error"` = Something's wrong
- ✅ `"status": "healthy"` = Everything's good

### Common Problems & Solutions

**"I'm not getting Discord notifications"**
1. Check your Discord webhook URL is correct
2. Make sure UEX webhook is activated  
3. Test by creating a new negotiation

**"Authentication error from UEX"**
1. Double-check your UEX_SECRET_KEY is correct
2. Make sure your UEX_API_TOKEN has permissions
3. UEX keys sometimes expire - get new ones

**"Discord notifications appear but reply doesn't work"**
1. For `/reply` commands: You need Discord bot setup (advanced)
2. For testing: Use the curl command above
3. Check your UEX credentials are still valid

**"Environment variables not found"**
1. Make sure all 4 variables are set in Netlify
2. Click "Redeploy site" after adding variables
3. Wait 2-3 minutes for deployment to complete

### Still Need Help?
1. Check the **Function logs** in your Netlify dashboard
2. Look at the **detailed troubleshooting** section below
3. Create an issue on GitHub with your error message (remove any passwords!)

---

## 🔧 Technical Details (For Curious Users)

<details>
<summary>Click to expand technical information</summary>

### How It Works
1. **UEX Corp** sends a webhook (message) when someone replies to your listing
2. **Netlify function** receives this webhook and formats it nicely
3. **Discord** gets the formatted message via webhook and shows it in your channel
4. **When you reply**, the message goes back to UEX Corp through their API

### What Each Function Does
- `uex-webhook.js` - Receives messages from UEX Corp
- `discord-bot.js` - Handles Discord slash commands (if you set up the bot)
- `discord-command.js` - Testing endpoint for manual replies
- `health.js` - Shows if everything is working

### API Information
**UEX API Endpoint:** `https://api.uexcorp.space/2.0/marketplace_negotiations_messages/`
**Authentication:** Uses both Bearer token and secret key (that's why you need both)
**Request Format:** JSON with negotiation hash, message, and production flag

</details>

---

## 🔒 Security & Privacy

**Your data is safe:**
- ✅ Your credentials stay in Netlify (never in the code)
- ✅ Only you can see your notifications
- ✅ Code is open-source so you can verify it's safe
- ✅ No one else can access your UEX account

**Best practices:**
- Don't share your API keys with anyone
- If you think keys are compromised, generate new ones in UEX Corp
- Your webhook URLs are not secret, but don't share them unnecessarily

---

## 🆙 What's Next?

### Want Discord Slash Commands?
Follow the advanced setup in [DISCORD-SETUP.md](DISCORD-SETUP.md) to type `/reply` directly in Discord.

### Want to Customize?
- Edit the message format in `uex-webhook.js`
- Add more Discord channels
- Change notification styling
- Add emoji or custom formatting

### Want to Help Others?
- Share this project with other UEX traders
- Report bugs or suggest improvements
- Contribute code improvements

---

## 📄 License & Support

**MIT License** - Free to use and modify for anyone.

### Getting Help
1. **First:** Check your health endpoint and read common problems above
2. **Then:** Look at Netlify function logs for error details  
3. **Finally:** Create a GitHub issue with:
   - What you were trying to do
   - What happened instead
   - Your health endpoint response (remove sensitive data)

### Community
- ⭐ **Star this repo** if it helps you!
- 🐛 **Report bugs** to help improve it
- 💡 **Suggest features** for future versions

---

*Built by UEX traders, for UEX traders. Get your notifications instantly and never miss a deal! 🚀* 