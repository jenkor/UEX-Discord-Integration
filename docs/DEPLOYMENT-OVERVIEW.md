# UEX Discord Bot Deployment Overview

This guide helps you choose the best hosting platform for your UEX Discord Bot and provides links to detailed deployment instructions.

## 🤔 Which Platform Should I Choose?

### For Complete Beginners
**👉 Recommended: Render Free Tier**
- ✅ Simple setup with GitHub integration
- ✅ Automatic deployments on code changes
- ✅ Free 750 hours/month (covers most small bots)
- ❌ Auto-sleeps after 15 minutes of inactivity
- ❌ No persistent storage on free tier

**📖 [Render Deployment Guide →](RENDER-DEPLOYMENT.md)**

### For Maximum Savings
**👉 Recommended: GCP Always Free Tier**
- ✅ **$0/month forever** - truly free with no time limits
- ✅ No auto-sleep - runs 24/7 continuously  
- ✅ Persistent storage included
- ❌ Requires basic Linux knowledge
- ❌ Manual setup required

**📖 [GCP Deployment Guide →](GCP-DEPLOYMENT.md)**

### For Reliability & Performance
**👉 Recommended: AWS Lightsail**
- ✅ **$3.50/month** - very affordable
- ✅ No auto-sleep, persistent storage
- ✅ Simple setup, good documentation
- ✅ Predictable pricing
- ❌ Not free

**📖 [AWS Deployment Guide →](AWS-DEPLOYMENT.md)**

---

## 📊 Platform Comparison

| Platform | Cost/Month | Setup | Auto-Sleep | Persistent Storage | Best For |
|----------|------------|-------|------------|-------------------|----------|
| **GCP Free Tier** | $0 | Manual | ❌ No | ✅ Yes | Long-term free hosting |
| **Render Free** | $0 | Easy | ✅ Yes | ❌ No | Quick testing & demos |
| **Render Starter** | $7 | Easy | ❌ No | ✅ Yes | Managed hosting |
| **AWS Lightsail** | $3.50 | Manual | ❌ No | ✅ Yes | Cost-effective VPS |
| **Railway** | $5 | Easy | ❌ No | ✅ Yes | Developer-friendly |

---

## 🚀 Quick Start Guide

### Step 1: Validate Your Setup
```bash
npm run validate
```
This checks your environment variables, dependencies, and deployment readiness.

### Step 2: Choose Your Platform

#### 🆓 **Free Options**

**Option A: GCP Always Free (Recommended for Free)**
- **Cost**: $0/month forever
- **Perfect for**: Permanent hosting without time limits
- **Setup time**: 15-20 minutes
- **Skill level**: Beginner+ (basic command line)

**Option B: Render Free Tier**
- **Cost**: $0/month (750 hours)
- **Perfect for**: Testing and low-usage bots
- **Setup time**: 5 minutes
- **Skill level**: Beginner

#### 💰 **Paid Options**

**Option C: AWS Lightsail (Best Value)**
- **Cost**: $3.50/month
- **Perfect for**: Reliable, cheap hosting
- **Setup time**: 10-15 minutes
- **Skill level**: Beginner+

**Option D: Render Starter**
- **Cost**: $7/month
- **Perfect for**: Hands-off managed hosting
- **Setup time**: 5 minutes
- **Skill level**: Beginner

### Step 3: Follow Your Platform Guide

1. **GCP**: [docs/GCP-DEPLOYMENT.md](GCP-DEPLOYMENT.md)
2. **Render**: [docs/RENDER-DEPLOYMENT.md](RENDER-DEPLOYMENT.md)
3. **AWS**: [docs/AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md)

---

## 🔧 Environment Variable Setup

All platforms require these environment variables:

### Required Variables
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
USER_ENCRYPTION_KEY=your_random_32_character_encryption_key
```

### Optional Variables
```bash
UEX_WEBHOOK_SECRET=your_webhook_secret_for_validation
NODE_ENV=production
PORT=3000
```

### Platform-Specific Setup

#### **Managed Platforms** (Render, Railway, Vercel)
- ✅ Set variables in platform dashboard
- ✅ No .env file needed
- ✅ Automatic detection by bot

#### **Self-Hosted** (AWS, GCP, VPS)
- ✅ Create .env file with variables
- ✅ Copy env.example to .env
- ✅ Fill in your actual values

---

## 📚 Detailed Deployment Guides

### 🎯 Primary Guides

- **[Render Deployment](RENDER-DEPLOYMENT.md)** - Easiest setup, managed platform
- **[AWS Deployment](AWS-DEPLOYMENT.md)** - Cost-effective, reliable hosting
- **[GCP Deployment](GCP-DEPLOYMENT.md)** - Free forever with Always Free tier

### 🔧 Advanced Options

- **Docker**: Use provided Dockerfile for containerized deployment
- **Digital Ocean**: Similar to AWS/GCP setup
- **Linode**: Linux VPS hosting
- **Heroku**: Similar to Render (more expensive)

---

## 🛠️ Pre-Deployment Checklist

Run this checklist before deploying to any platform:

### ✅ Discord Bot Setup
- [ ] Created Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Copied bot token (keep this secret!)
- [ ] Enabled "Message Content Intent" under Privileged Gateway Intents
- [ ] Invited bot to at least one Discord server

### ✅ Environment Configuration
- [ ] Generated secure USER_ENCRYPTION_KEY (32+ characters)
- [ ] Prepared environment variables for your platform
- [ ] Run `npm run validate` to check setup

### ✅ Code Preparation
- [ ] All dependencies installed (`npm install`)
- [ ] No syntax errors (`npm test`)
- [ ] Bot starts locally (`npm run dev`)

### ✅ Platform Account
- [ ] Created account on chosen platform (Render/AWS/GCP)
- [ ] Have credit card ready (even for free tiers, for verification)
- [ ] Reviewed platform pricing and limitations

---

## 🔍 Testing Your Deployment

After deploying to any platform:

### 1. Health Check
Visit: `https://your-bot-domain.com/health`

Should return bot status and platform information.

### 2. Discord Commands
Test these commands in Discord:
```
/admin info  # View bot configuration
/register    # Test user registration (with dummy data)
```

### 3. Webhook Test
- Configure webhook URL in UEX Corp: `https://your-bot-domain.com/webhook/uex`
- Test with a dummy notification
- Check bot logs for webhook processing

---

## 🆘 Troubleshooting

### Common Issues Across All Platforms

**Bot won't start:**
```bash
# Check environment variables
npm run validate

# Check logs for errors
# Platform-specific log viewing in each guide
```

**Webhooks not working:**
- Verify URL is accessible: `curl https://your-domain.com/health`
- Check firewall settings (self-hosted platforms)
- Verify webhook secret configuration

**Commands not responding:**
- Check Discord bot permissions
- Verify bot is online in Discord
- Check bot logs for errors

### Platform-Specific Troubleshooting

- **Render**: Check build logs and runtime logs in dashboard
- **AWS**: Check security groups and EC2 instance status
- **GCP**: Check firewall rules and instance health

---

## 💡 Pro Tips

### Cost Optimization
1. **Start free**: Begin with GCP Free Tier or Render Free
2. **Monitor usage**: Set up billing alerts on paid platforms
3. **Scale gradually**: Upgrade only when needed

### Security Best Practices
1. **Rotate keys**: Change encryption keys periodically
2. **Monitor access**: Review platform access logs
3. **Backup data**: Regular backups of user_data directory

### Performance Tips
1. **Choose nearby regions**: Deploy close to your users
2. **Monitor resources**: Watch CPU/memory usage
3. **Update regularly**: Keep dependencies updated

---

## 🎯 Quick Decision Matrix

**Need it free forever?** → GCP Always Free Tier  
**Want easy setup?** → Render  
**Need reliability cheap?** → AWS Lightsail  
**Want managed hosting?** → Render Starter  
**Have specific cloud preference?** → Follow respective guide  

---

Your UEX Discord Bot can run on any of these platforms! Choose the one that best fits your needs and technical comfort level. All guides include step-by-step instructions and troubleshooting help. 🚀 