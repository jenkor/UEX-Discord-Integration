# Customization Guide

**Personalize your UEX-Discord integration with custom features and styling**

This guide shows you how to modify notification appearance, add new features, and make the integration truly your own.

## 🎯 Prerequisites

Before customizing your integration:
- ✅ **Completed** [Setup Guide](Setup-Guide) with working notifications
- ✅ **Basic understanding** of JavaScript and JSON
- ✅ **Familiar** with editing files in GitHub
- ✅ **Know how to redeploy** your Netlify site

**New to coding?** Start with simple visual changes and work your way up!

---

## 🎨 Visual Customization

### Notification Colors

**Edit:** `netlify/functions/uex-webhook.js`

**Default colors:**
```javascript
const colors = {
  default: 3066993,  // Green
  urgent: 15158332,  // Red
  info: 3447003,     // Blue
  warning: 16776960  // Yellow
};
```

**Color based on message content:**
```javascript
function getNotificationColor(message) {
  const text = message.toLowerCase();
  
  if (text.includes('urgent') || text.includes('asap')) {
    return colors.urgent;
  }
  
  if (text.includes('offer') || text.includes('buying')) {
    return colors.info;
  }
  
  if (text.includes('question') || text.includes('?')) {
    return colors.warning;
  }
  
  return colors.default;
}
```

### Custom Emojis

**Basic emoji customization:**
```javascript
const emojis = {
  message: '📨',
  user: '👤',
  item: '📦',
  time: '⏰',
  money: '💰',
  location: '📍',
  urgent: '🚨',
  question: '❓'
};

const embed = {
  title: `${emojis.message} New UEX Message`,
  description: `${emojis.item} ${listing.title}`,
  fields: [
    {
      name: `${emojis.user} From`,
      value: sender.username,
      inline: true
    },
    {
      name: `${emojis.time} Time`,
      value: new Date().toLocaleString(),
      inline: true
    }
  ]
};
```

**Custom server emojis:**
```javascript
// Use your Discord server's custom emojis
const customEmojis = {
  uex: '<:uex:1234567890123456789>',
  credits: '<:credits:9876543210987654321>',
  ship: '<:ship:1111111111111111111>'
};

const embed = {
  title: `${customEmojis.uex} New UEX Message`,
  description: `${customEmojis.ship} ${listing.title}`
};
```

### Rich Embed Features

**Add thumbnails and images:**
```javascript
const embed = {
  title: "🔔 New UEX Message",
  description: listing.title,
  color: getNotificationColor(message.text),
  thumbnail: {
    url: "https://uexcorp.space/favicon.ico"
  },
  image: {
    url: "https://your-domain.com/uex-banner.png"  // Optional banner
  },
  author: {
    name: "UEX Corp Notifications",
    icon_url: "https://uexcorp.space/favicon.ico",
    url: "https://uexcorp.space"
  },
  footer: {
    text: `Negotiation: ${hash.substring(0, 8)}... • ${new Date().toLocaleString()}`,
    icon_url: "https://uexcorp.space/favicon.ico"
  },
  timestamp: new Date().toISOString()
};
```

---

## 📝 Message Content Customization

### Custom Message Templates

**Create different templates for different scenarios:**
```javascript
const messageTemplates = {
  newMessage: {
    title: "📨 New Message",
    description: "Someone messaged your listing!",
    color: 3066993
  },
  
  offer: {
    title: "💰 New Offer",
    description: "Someone made an offer on your item!",
    color: 3066993
  },
  
  question: {
    title: "❓ Question",
    description: "Someone has a question about your listing.",
    color: 16776960
  },
  
  urgent: {
    title: "🚨 Urgent Message",
    description: "High priority message received!",
    color: 15158332
  }
};

function getMessageTemplate(message) {
  const text = message.toLowerCase();
  
  if (text.includes('offer') || text.includes('buy')) {
    return messageTemplates.offer;
  }
  
  if (text.includes('?') || text.includes('question')) {
    return messageTemplates.question;
  }
  
  if (text.includes('urgent') || text.includes('asap')) {
    return messageTemplates.urgent;
  }
  
  return messageTemplates.newMessage;
}
```

### Dynamic Content

**Add dynamic information to notifications:**
```javascript
async function createEnhancedNotification(webhookData) {
  const template = getMessageTemplate(webhookData.last_message);
  
  const embed = {
    title: template.title,
    description: `**${webhookData.listing_title}**`,
    color: template.color,
    fields: [
      {
        name: "👤 From",
        value: webhookData.sender_username,
        inline: true
      },
      {
        name: "📝 Message",
        value: webhookData.last_message.substring(0, 200) + 
               (webhookData.last_message.length > 200 ? '...' : ''),
        inline: false
      },
      {
        name: "⏰ Received",
        value: `<t:${Math.floor(Date.now() / 1000)}:R>`, // Discord timestamp
        inline: true
      },
      {
        name: "📊 Message Length",
        value: `${webhookData.last_message.length} characters`,
        inline: true
      }
    ]
  };
  
  // Add reply instructions
  embed.fields.push({
    name: "💬 To Reply",
    value: `\`/reply ${webhookData.negotiation_hash.substring(0, 8)} your message here\``,
    inline: false
  });
  
  return embed;
}
```

---

## 🔔 Smart Notifications

### Conditional Notifications

**Only notify for important messages:**
```javascript
function shouldSendNotification(webhookData) {
  const message = webhookData.last_message.toLowerCase();
  const title = webhookData.listing_title.toLowerCase();
  
  // Skip your own messages (if you have the sender ID)
  if (webhookData.sender_username === 'YourUEXUsername') {
    return false;
  }
  
  // Only notify for high-value items
  if (title.includes('mining') || title.includes('cargo') || title.includes('capital')) {
    return true;
  }
  
  // Always notify for offers and urgent messages
  if (message.includes('offer') || message.includes('urgent') || message.includes('buy')) {
    return true;
  }
  
  // Skip automated/system messages
  if (message.includes('[automated]') || message.includes('system message')) {
    return false;
  }
  
  return true; // Default: send notification
}

// In your webhook function:
if (!shouldSendNotification(webhookData)) {
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Notification skipped' })
  };
}
```

### Priority Levels

**Different notification styles based on priority:**
```javascript
function getMessagePriority(message, listing) {
  const text = message.toLowerCase();
  const title = listing.toLowerCase();
  
  // High priority
  if (text.includes('urgent') || text.includes('buying now') || 
      text.includes('ready to purchase')) {
    return 'high';
  }
  
  // Medium priority  
  if (text.includes('offer') || text.includes('interested') ||
      text.includes('want to buy')) {
    return 'medium';
  }
  
  // Low priority
  if (text.includes('question') || text.includes('info') ||
      text.includes('details')) {
    return 'low';
  }
  
  return 'medium'; // default
}

function customizeByPriority(embed, priority) {
  switch (priority) {
    case 'high':
      embed.color = 15158332; // Red
      embed.title = `🚨 ${embed.title}`;
      // Add Discord ping for high priority
      return {
        content: `<@&ROLE_ID>`, // Ping a role
        embeds: [embed]
      };
      
    case 'medium':
      embed.color = 16776960; // Yellow
      return { embeds: [embed] };
      
    case 'low':
      embed.color = 3066993; // Green
      embed.title = `ℹ️ ${embed.title}`;
      return { embeds: [embed] };
      
    default:
      return { embeds: [embed] };
  }
}
```

---

## 🤖 Auto-Reply Features

### Smart Auto-Responses

**Automatically respond to common questions:**
```javascript
const autoReplyRules = [
  {
    triggers: ['price', 'cost', 'how much'],
    response: "Thanks for your interest! The price is as listed, but I'm open to reasonable offers.",
    conditions: {
      listingTypes: ['sale'], // Only for sale listings
      minDelay: 300000 // Wait 5 minutes before auto-reply
    }
  },
  
  {
    triggers: ['available', 'still there'],
    response: "Yes, this item is still available. Are you ready to proceed?",
    conditions: {
      timeWindow: { start: 8, end: 22 } // Only during business hours
    }
  },
  
  {
    triggers: ['location', 'where', 'meet'],
    response: "I can meet at any major landing zone. Port Olisar, Lorville, and Area18 work best for me.",
    conditions: {
      requireKeywords: ['pickup', 'delivery', 'meet']
    }
  }
];

function generateAutoReply(message, listing) {
  const text = message.toLowerCase();
  
  for (const rule of autoReplyRules) {
    const hasKeyword = rule.triggers.some(trigger => text.includes(trigger));
    
    if (hasKeyword && meetsConditions(rule.conditions, message, listing)) {
      return rule.response;
    }
  }
  
  return null; // No auto-reply
}

function meetsConditions(conditions, message, listing) {
  if (!conditions) return true;
  
  // Check time window
  if (conditions.timeWindow) {
    const hour = new Date().getHours();
    if (hour < conditions.timeWindow.start || hour > conditions.timeWindow.end) {
      return false;
    }
  }
  
  // Check required keywords
  if (conditions.requireKeywords) {
    const hasRequired = conditions.requireKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (!hasRequired) return false;
  }
  
  return true;
}
```

### Delayed Auto-Reply

**Send automatic replies after a delay:**
```javascript
// Store this in a database or memory for production use
const pendingReplies = new Map();

function scheduleAutoReply(negotiationHash, message, delayMs = 300000) {
  setTimeout(async () => {
    try {
      await sendReplyToUEX(negotiationHash, message);
      console.log(`Auto-reply sent to ${negotiationHash}`);
    } catch (error) {
      console.error('Auto-reply failed:', error);
    }
  }, delayMs);
}

// In your webhook function:
const autoReply = generateAutoReply(webhookData.last_message, webhookData.listing_title);
if (autoReply) {
  scheduleAutoReply(webhookData.negotiation_hash, autoReply, 5 * 60 * 1000); // 5 minutes
}
```

---

## 📊 Analytics and Tracking

### Message Analytics

**Track notification statistics:**
```javascript
const analytics = {
  totalMessages: 0,
  messagesByType: {},
  responsesByHour: {},
  topSenders: {},
  averageResponseTime: 0
};

function trackMessage(webhookData) {
  analytics.totalMessages++;
  
  // Track by message type
  const type = classifyMessage(webhookData.last_message);
  analytics.messagesByType[type] = (analytics.messagesByType[type] || 0) + 1;
  
  // Track by hour
  const hour = new Date().getHours();
  analytics.responsesByHour[hour] = (analytics.responsesByHour[hour] || 0) + 1;
  
  // Track top senders
  const sender = webhookData.sender_username;
  analytics.topSenders[sender] = (analytics.topSenders[sender] || 0) + 1;
  
  // Store for later analysis
  saveAnalytics(analytics);
}

function classifyMessage(message) {
  const text = message.toLowerCase();
  
  if (text.includes('offer') || text.includes('buy')) return 'offer';
  if (text.includes('?')) return 'question';
  if (text.includes('thank') || text.includes('confirm')) return 'confirmation';
  if (text.includes('urgent')) return 'urgent';
  
  return 'general';
}
```

### Performance Monitoring

**Monitor integration performance:**
```javascript
const performance = {
  responseTime: [],
  errorRate: 0,
  uptime: Date.now(),
  lastError: null
};

function measurePerformance(startTime, success, error = null) {
  const duration = Date.now() - startTime;
  performance.responseTime.push(duration);
  
  // Keep only last 100 measurements
  if (performance.responseTime.length > 100) {
    performance.responseTime.shift();
  }
  
  if (!success) {
    performance.errorRate++;
    performance.lastError = {
      error: error?.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Usage in your functions:
const startTime = Date.now();
try {
  await processWebhook(webhookData);
  measurePerformance(startTime, true);
} catch (error) {
  measurePerformance(startTime, false, error);
  throw error;
}
```

---

## 🎛️ Advanced Features

### Multi-Channel Support

**Send different types of messages to different channels:**
```javascript
const channelConfig = {
  offers: process.env.DISCORD_OFFERS_CHANNEL,
  questions: process.env.DISCORD_QUESTIONS_CHANNEL,
  urgent: process.env.DISCORD_URGENT_CHANNEL,
  general: process.env.DISCORD_GENERAL_CHANNEL
};

function getTargetChannel(message, listing) {
  const text = message.toLowerCase();
  
  if (text.includes('offer') || text.includes('buy')) {
    return channelConfig.offers;
  }
  
  if (text.includes('urgent') || text.includes('asap')) {
    return channelConfig.urgent;
  }
  
  if (text.includes('?') || text.includes('question')) {
    return channelConfig.questions;
  }
  
  return channelConfig.general;
}

async function sendToMultipleChannels(embed, message) {
  const primaryChannel = getTargetChannel(message);
  const webhookUrl = getWebhookForChannel(primaryChannel);
  
  await sendDiscordMessage(webhookUrl, { embeds: [embed] });
  
  // Also send urgent messages to general channel
  if (primaryChannel === channelConfig.urgent) {
    const generalWebhook = getWebhookForChannel(channelConfig.general);
    await sendDiscordMessage(generalWebhook, { embeds: [embed] });
  }
}
```

### Custom Commands

**Add new slash commands beyond /reply:**
```javascript
const customCommands = {
  '/status': async (args) => {
    const hash = args[0];
    const status = await checkNegotiationStatus(hash);
    return `Negotiation ${hash}: ${status}`;
  },
  
  '/block': async (args) => {
    const username = args[0];
    await addToBlockList(username);
    return `User ${username} has been blocked from notifications.`;
  },
  
  '/summary': async (args) => {
    const stats = await getAnalyticsSummary();
    return `Today: ${stats.messages} messages, ${stats.replies} replies sent.`;
  }
};

function processCustomCommand(content) {
  const parts = content.trim().split(' ');
  const command = parts[0];
  const args = parts.slice(1);
  
  if (customCommands[command]) {
    return customCommands[command](args);
  }
  
  return null; // Unknown command
}
```

### Webhook Filtering

**Filter webhooks before processing:**
```javascript
const filterRules = {
  blockedUsers: ['SpamUser1', 'SpamUser2'],
  blockedKeywords: ['[automated]', 'system message'],
  minimumMessageLength: 10,
  allowedListingTypes: ['sale', 'auction']
};

function shouldProcessWebhook(webhookData) {
  // Block specific users
  if (filterRules.blockedUsers.includes(webhookData.sender_username)) {
    return false;
  }
  
  // Block messages with certain keywords
  const hasBlockedKeyword = filterRules.blockedKeywords.some(keyword =>
    webhookData.last_message.toLowerCase().includes(keyword)
  );
  if (hasBlockedKeyword) return false;
  
  // Minimum message length
  if (webhookData.last_message.length < filterRules.minimumMessageLength) {
    return false;
  }
  
  return true;
}
```

---

## 🎨 CSS and HTML Customization

### Custom Dashboard (Optional)

**Create a simple status dashboard:**

**Create:** `public/dashboard.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>UEX Integration Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .healthy { background-color: #d4edda; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; border: 1px solid #f5c6cb; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { padding: 15px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🚀 UEX-Discord Integration Dashboard</h1>
    
    <div id="status" class="status">
        <h2>System Status</h2>
        <p id="status-text">Loading...</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>📊 Statistics</h3>
            <p id="stats-text">Loading...</p>
        </div>
        
        <div class="stat-card">
            <h3>⚡ Performance</h3>
            <p id="performance-text">Loading...</p>
        </div>
    </div>
    
    <script>
        async function loadDashboard() {
            try {
                const healthResponse = await fetch('/.netlify/functions/health');
                const health = await healthResponse.json();
                
                const statusDiv = document.getElementById('status');
                const statusText = document.getElementById('status-text');
                
                if (health.success && health.data.status === 'healthy') {
                    statusDiv.className = 'status healthy';
                    statusText.textContent = '✅ All systems operational';
                } else {
                    statusDiv.className = 'status error';
                    statusText.textContent = '❌ System issues detected';
                }
                
                // Load additional stats if available
                updateStats(health.data);
                
            } catch (error) {
                document.getElementById('status-text').textContent = '❌ Cannot connect to integration';
                document.getElementById('status').className = 'status error';
            }
        }
        
        function updateStats(data) {
            const statsText = document.getElementById('stats-text');
            const perfText = document.getElementById('performance-text');
            
            statsText.innerHTML = `
                Discord: ${data.configuration?.configured?.discord_webhook_url ? '✅' : '❌'}<br>
                UEX Corp: ${data.configuration?.configured?.uex_api_token ? '✅' : '❌'}
            `;
            
            if (data.connectivity) {
                perfText.innerHTML = `
                    Discord: ${data.connectivity.discord?.response_time || 'N/A'}ms<br>
                    UEX Corp: ${data.connectivity.uex?.response_time || 'N/A'}ms
                `;
            }
        }
        
        // Load dashboard on page load
        loadDashboard();
        
        // Refresh every 30 seconds
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>
```

**Access your dashboard at:** `https://your-site.netlify.app/dashboard.html`

---

## 🔧 Configuration Management

### Environment-Based Customization

**Different settings for different environments:**
```javascript
const config = {
  production: {
    autoReply: false,
    notifications: true,
    analytics: true,
    debugMode: false
  },
  
  staging: {
    autoReply: true,
    notifications: true,
    analytics: true,
    debugMode: true
  },
  
  development: {
    autoReply: true,
    notifications: false, // Don't spam Discord during dev
    analytics: false,
    debugMode: true
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// Use throughout your functions:
if (currentConfig.debugMode) {
  console.log('Debug: Processing webhook', webhookData);
}

if (currentConfig.notifications) {
  await sendDiscordNotification(embed);
}
```

### User Preferences

**Store user preferences:**
```javascript
const userPreferences = {
  notifications: {
    enabled: true,
    quietHours: { start: 22, end: 8 },
    priority: 'medium', // 'low', 'medium', 'high'
    types: ['offers', 'questions'] // What to notify about
  },
  
  autoReply: {
    enabled: false,
    delay: 300000, // 5 minutes
    templates: {
      greeting: "Thank you for your message! I'll get back to you soon.",
      availability: "This item is still available."
    }
  },
  
  display: {
    theme: 'blue', // Color theme
    showTimestamps: true,
    showAnalytics: false
  }
};

function isQuietTime() {
  const hour = new Date().getHours();
  const { start, end } = userPreferences.notifications.quietHours;
  
  if (start > end) { // Overnight quiet hours (e.g., 22-8)
    return hour >= start || hour < end;
  } else { // Same day quiet hours (e.g., 12-14)
    return hour >= start && hour < end;
  }
}
```

---

## 🚀 Deployment and Testing

### Testing Customizations

**Before deploying changes:**
1. **Test locally** with `netlify dev` if possible
2. **Use preview deployments** for testing
3. **Check health endpoint** after deployment
4. **Send test webhooks** to verify changes

**Test command:**
```bash
# Test your customized webhook
curl -X POST https://your-site.netlify.app/.netlify/functions/uex-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "negotiation_hash": "test123",
    "last_message": "This is a test offer message",
    "sender_username": "TestUser",
    "listing_title": "Test Mining Equipment"
  }'
```

### Version Control

**Keep track of your customizations:**
```javascript
// Add to your functions:
const INTEGRATION_VERSION = '1.2.0-custom';
const CUSTOMIZATIONS = [
  'custom-colors',
  'auto-reply',
  'multi-channel',
  'analytics'
];

// Include in health response:
{
  version: INTEGRATION_VERSION,
  customizations: CUSTOMIZATIONS,
  last_updated: '2024-12-20'
}
```

---

## 🔗 Sharing Customizations

### Contributing Back

**Share your improvements:**
1. **Fork the main repository**
2. **Create a feature branch** for your customization
3. **Submit a pull request** with your changes
4. **Document your customization** in the PR description

### Community Themes

**Popular customization themes:**
- **Gaming theme:** Gaming-specific emojis and colors
- **Corporate theme:** Professional styling and auto-replies
- **Trader theme:** Market-focused notifications and analytics
- **Minimal theme:** Clean, simple notifications

---

## 📚 Advanced Resources

### External Integrations

**Connect with other tools:**
- **Google Sheets:** Export analytics data
- **Slack:** Cross-post to Slack channels
- **Email:** Send email notifications for urgent messages
- **Telegram:** Alternative notification platform

### Performance Optimization

**Optimize your customizations:**
- **Cache frequently used data**
- **Minimize external API calls**
- **Use efficient data structures**
- **Monitor memory usage**

### Security Considerations

**Keep your customizations secure:**
- **Validate all input data**
- **Don't log sensitive information**
- **Use environment variables for secrets**
- **Implement rate limiting for custom endpoints**

---

## 🔗 Related Documentation

**Setup and Configuration:**
- [Setup Guide](Setup-Guide) - Basic installation
- [Advanced Configuration](Advanced-Configuration) - Technical customizations
- [Environment Variables](Environment-Variables) - Configuration reference

**Help and Support:**
- [Troubleshooting](Troubleshooting) - Fix customization issues
- [API Reference](API-Reference) - Technical documentation
- [FAQ](FAQ) - Common questions

**Community:**
- [GitHub Issues](https://github.com/jenkor/UEX-Discord-Integration/issues) - Report bugs or request features
- [GitHub Discussions](https://github.com/jenkor/UEX-Discord-Integration/discussions) - Share customizations

*Last updated: December 2024* 