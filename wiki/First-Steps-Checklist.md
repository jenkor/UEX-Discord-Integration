# First Steps Checklist

**Everything you need before starting the setup**

Complete this checklist before following the [Setup Guide](Setup-Guide) to ensure a smooth installation process.

## 🎯 Goal

By completing this checklist, you'll have all the accounts, information, and tools needed for a successful setup.

**⏱️ Time required:** 10-15 minutes

---

## 📋 Account Requirements

### ✅ Discord Account
**What you need:** A Discord account and access to a server where you can create webhooks.

**Steps:**
- [ ] **Create Discord account** (if needed): [discord.com](https://discord.com)
- [ ] **Join or create a Discord server** where you want notifications
- [ ] **Verify you have permission** to create webhooks in that server
- [ ] **Enable Developer Mode** in Discord settings

**Why this matters:** You need webhook creation permissions to receive notifications.

**How to check webhook permissions:**
1. Right-click any channel in your server
2. If you see "Edit Channel", you likely have the right permissions
3. If not, ask a server admin to help

---

### ✅ GitHub Account
**What you need:** A free GitHub account to fork the project repository.

**Steps:**
- [ ] **Create GitHub account** (if needed): [github.com](https://github.com)
- [ ] **Verify your email** with GitHub
- [ ] **Complete basic profile setup**

**Why this matters:** You'll fork the project to your GitHub account so you can customize it.

**What is forking?** Making your own copy of the project that you can modify.

---

### ✅ Netlify Account
**What you need:** A free Netlify account for hosting your integration.

**Steps:**
- [ ] **Go to Netlify**: [netlify.com](https://netlify.com)
- [ ] **Sign up with GitHub** (recommended - easier setup)
- [ ] **Verify account** if required
- [ ] **Familiarize yourself** with the Netlify dashboard

**Why this matters:** Netlify will run your integration 24/7 for free.

**Pro tip:** Use "Sign up with GitHub" for easier repository integration.

---

### ✅ UEX Corp Account
**What you need:** An active UEX Corp account with API access.

**Steps:**
- [ ] **Verify you can log into** [UEX Corp](https://uexcorp.space)
- [ ] **Check account status** (must be in good standing)
- [ ] **Locate API settings** in your profile (even if you don't get keys yet)
- [ ] **Note any restrictions** on your account

**Why this matters:** You need API access to integrate with UEX Corp.

**Can't find API settings?** Check these locations:
- Profile → API
- Account Settings → Developer
- My Apps section
- Settings → Advanced

---

## 🔑 Information Gathering

### ✅ Discord Information
**What you'll collect:**
- [ ] **Discord webhook URL** (you'll create this during setup)
- [ ] **Discord channel ID** (you'll get this during setup)

**Preparation:**
- [ ] **Choose which channel** will receive UEX notifications
- [ ] **Make sure you can edit** that channel
- [ ] **Consider creating a dedicated channel** like #uex-notifications

**Channel recommendations:**
- Create a dedicated channel (e.g., #uex-notifications)
- Use a channel you check regularly
- Avoid busy channels with lots of other messages

---

### ✅ UEX Corp Information
**What you'll collect:**
- [ ] **UEX API Token** (you'll get this during setup)
- [ ] **UEX Secret Key** (you'll get this during setup)

**Preparation:**
- [ ] **Confirm you can access** UEX Corp account settings
- [ ] **Note where API settings are located** (for quick access later)
- [ ] **Consider which negotiations** you want notifications for

**Important:** Don't get your actual keys yet - we'll do that in the setup guide.

---

## 🛠️ Tool Preparation

### ✅ Browser Setup
**Recommended browsers:** Chrome, Firefox, Safari, or Edge (latest versions)

**Steps:**
- [ ] **Update your browser** to the latest version
- [ ] **Enable JavaScript** (should be enabled by default)
- [ ] **Clear cache** if you've had issues with any of these sites
- [ ] **Disable ad blockers** for Discord, GitHub, and Netlify (they can interfere)

**Pro tip:** Use your primary browser for consistency across all steps.

---

### ✅ Notepad/Text Editor
**What you need:** A way to temporarily store information during setup.

**Options:**
- [ ] **Notepad** (Windows)
- [ ] **TextEdit** (Mac)
- [ ] **Any text editor** you prefer
- [ ] **Sticky notes** or similar

**What you'll store:**
- Webhook URLs
- Channel IDs  
- API keys (temporarily, during setup)
- Your Netlify site URL

**Security note:** Delete any saved API keys after setup is complete!

---

## ⚠️ Important Notes

### Security Awareness
- [ ] **Understand** that API keys are like passwords
- [ ] **Never share** API keys in public forums or Discord
- [ ] **Know** that you'll store keys securely in Netlify environment variables
- [ ] **Plan** to delete any keys you save in text files during setup

### Time Management
- [ ] **Set aside 15-20 minutes** of uninterrupted time
- [ ] **Have all accounts logged in** and ready
- [ ] **Close unnecessary browser tabs** to avoid confusion
- [ ] **Follow steps in order** - don't skip around

### Backup Plan
- [ ] **Know** that you can ask for help on GitHub issues
- [ ] **Bookmark** the [Troubleshooting Guide](Troubleshooting) for quick access
- [ ] **Understand** that you can restart if something goes wrong

---

## 🔍 Pre-Setup Verification

**Before proceeding to the setup guide, verify:**

### Account Access
- [ ] ✅ Can log into Discord and access your target server
- [ ] ✅ Can log into GitHub and see the dashboard
- [ ] ✅ Can log into Netlify and see the dashboard  
- [ ] ✅ Can log into UEX Corp and access account settings

### Permissions
- [ ] ✅ Can create webhooks in your Discord server
- [ ] ✅ Can see API settings in your UEX Corp account
- [ ] ✅ Have admin or sufficient permissions for your Discord channel

### Preparation
- [ ] ✅ Have chosen your notification channel in Discord
- [ ] ✅ Have a notepad ready for temporary information storage
- [ ] ✅ Have 15-20 minutes of uninterrupted time available

---

## 🚀 Ready to Start?

**All checkboxes completed?** You're ready for the main setup!

**👉 [Continue to Setup Guide](Setup-Guide)**

---

## 🆘 Common Pre-Setup Problems

### "I don't have webhook permissions in Discord"
**Solution:** Ask a server admin to either:
- Give you permission to manage webhooks
- Help you create the webhook during setup
- Create a test server where you have admin rights

### "I can't find UEX Corp API settings"
**Solution:** 
- Try the different locations listed above
- Contact UEX Corp support for guidance
- Make sure your account is verified and in good standing

### "GitHub wants me to verify my account"
**Solution:**
- Check your email for verification messages
- Follow GitHub's verification process completely
- This is normal for new accounts

### "Netlify signup isn't working"
**Solution:**
- Try signing up with GitHub instead of email
- Check if you have ad blockers interfering
- Try a different browser or incognito mode

---

## 📱 Quick Reference

**Account URLs:**
- **Discord:** [discord.com](https://discord.com)
- **GitHub:** [github.com](https://github.com)
- **Netlify:** [netlify.com](https://netlify.com)
- **UEX Corp:** [uexcorp.space](https://uexcorp.space)

**What's Next:**
- **Complete this checklist** → **[Setup Guide](Setup-Guide)** → **Working integration!**

**Need Help:**
- [Troubleshooting](Troubleshooting) - Fix common problems
- [FAQ](FAQ) - Answers to common questions
- [GitHub Issues](https://github.com/jenkor/UEX-Discord-Integration/issues) - Ask for help

*Last updated: December 2024* 