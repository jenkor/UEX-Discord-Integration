# Advanced Configuration

**Customize and enhance your UEX-Discord integration**

This guide covers advanced features, customizations, and optimizations for users who want to go beyond the basic setup.

## 🎯 Prerequisites

Before diving into advanced configuration:
- ✅ **Completed** [Setup Guide](Setup-Guide) with working notifications
- ✅ **Tested** basic functionality (webhooks and replies working)
- ✅ **Familiar** with basic JavaScript (for code modifications)
- ✅ **Understand** git and GitHub workflow (for advanced features)

**New to this?** Complete the basic setup first, then come back to this guide.

---

## 🎨 Notification Customization

### Custom Message Formats

**Default notification format:**
```javascript
{
  "embeds": [{
    "title": "🔔 New UEX Message",
    "description": listing.title,
    "color": 3066993,
    "fields": [
      {"name": "From", "value": sender.username, "inline": true},
      {"name": "Message", "value": message.text, "inline": false}
    ]
  }]
}
```

### Customizing Colors

**Edit:** `netlify/functions/uex-webhook.js`

**Color options:**
```javascript
// Predefined colors
const colors = {
  green: 3066993,    // Success/new messages
  yellow: 16776960,  // Warnings/urgent
  red: 15158332,     // Errors/critical
  blue: 3447003,     // Information
  purple: 10181046   // Special events
};
```

**Dynamic color based on message content:**
```javascript
function getMessageColor(message) {
  const text = message.toLowerCase();
  if (text.includes('urgent') || text.includes('asap')) {
    return colors.red;
  }
  if (text.includes('offer') || text.includes('deal')) {
    return colors.green;
  }
  if (text.includes('question') || text.includes('?')) {
    return colors.blue;
  }
  return colors.green; // default
}
```

### Rich Embed Features

**Add thumbnail with user avatar:**
```javascript
const embed = {
  title: "🔔 New UEX Message",
  description: listing.title,
  color: getMessageColor(message.text),
  thumbnail: {
    url: `https://uexcorp.space/api/users/${sender.id}/avatar`
  },
  fields: [
    {"name": "👤 From", "value": sender.username, "inline": true},
    {"name": "⏰ Time", "value": new Date().toLocaleString(), "inline": true},
    {"name": "💬 Message", "value": message.text, "inline": false}
  ],
  footer: {
    text: `Negotiation: ${negotiation.hash.substring(0, 8)}...`,
    icon_url: "https://uexcorp.space/favicon.ico"
  },
  timestamp: new Date().toISOString()
};
```

### Conditional Notifications

**Only notify for certain message types:**
```javascript
function shouldNotify(message, listing) {
  // Skip notifications for your own messages
  if (message.sender_id === YOUR_USER_ID) {
    return false;
  }
  
  // Only notify for high-value items
  if (listing.price && listing.price < 10000) {
    return false;
  }
  
  // Skip automated messages
  if (message.text.includes('[AUTOMATED]')) {
    return false;
  }
  
  return true;
}
```

---

## 🔒 Security Enhancements

### Webhook Signature Verification

**Why:** Prevents fake webhook requests from malicious sources.

**Implementation:**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
    
  return signature === `sha256=${expectedSignature}`;
}

// In your webhook function:
exports.handler = async (event, context) => {
  const signature = event.headers['x-uex-signature'];
  const secret = process.env.UEX_WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(event.body, signature, secret)) {
    return {
      statusCode: 401,
      body: JSON.stringify({error: 'Invalid signature'})
    };
  }
  
  // Process webhook...
};
```

### Rate Limiting

**Prevent spam and abuse:**
```javascript
const rateLimit = new Map();

function checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip);
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true; // Allow request
}
```

### API Key Rotation

**Automatically rotate UEX API keys:**
```javascript
// Set up key rotation schedule
const keyRotationSchedule = {
  primary: process.env.UEX_API_TOKEN,
  secondary: process.env.UEX_API_TOKEN_BACKUP,
  lastRotated: process.env.LAST_KEY_ROTATION,
  rotationIntervalDays: 30
};

function shouldRotateKeys() {
  const lastRotated = new Date(keyRotationSchedule.lastRotated);
  const daysSinceRotation = (Date.now() - lastRotated) / (1000 * 60 * 60 * 24);
  return daysSinceRotation >= keyRotationSchedule.rotationIntervalDays;
}
```

---

## 📊 Monitoring & Analytics

### Custom Logging

**Enhanced logging system:**
```javascript
class Logger {
  static info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, data);
  }
  
  static error(message, error = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, {
      error: error.message,
      stack: error.stack,
      ...error
    });
  }
  
  static webhook(action, data = {}) {
    console.log(`[WEBHOOK] ${new Date().toISOString()} ${action}`, {
      negotiation: data.hash?.substring(0, 8),
      user: data.username,
      timestamp: data.timestamp
    });
  }
}
```

### Health Check Enhancements

**Extended health monitoring:**
```javascript
async function extendedHealthCheck() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    configuration: await checkConfiguration(),
    connectivity: await checkConnectivity(),
    performance: await checkPerformance(),
    usage: await checkUsage()
  };
  
  return health;
}

async function checkPerformance() {
  const start = Date.now();
  
  // Test Discord webhook speed
  const discordTime = await measureApiCall(() => 
    testDiscordWebhook()
  );
  
  // Test UEX API speed
  const uexTime = await measureApiCall(() => 
    testUexApi()
  );
  
  return {
    total_check_time: Date.now() - start,
    discord_response_time: discordTime,
    uex_response_time: uexTime
  };
}
```

### Usage Analytics

**Track integration usage:**
```javascript
const analytics = {
  messages_processed: 0,
  replies_sent: 0,
  errors_encountered: 0,
  last_activity: null,
  daily_stats: {}
};

function recordActivity(type, data = {}) {
  const today = new Date().toISOString().split('T')[0];
  
  if (!analytics.daily_stats[today]) {
    analytics.daily_stats[today] = {
      messages: 0,
      replies: 0,
      errors: 0
    };
  }
  
  analytics[`${type}s_${type === 'error' ? 'encountered' : 'processed'}`]++;
  analytics.daily_stats[today][type === 'message' ? 'messages' : type + 's']++;
  analytics.last_activity = new Date().toISOString();
}
```

---

## 🚀 Performance Optimization

### Caching Strategy

**Cache frequently accessed data:**
```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Example: Cache user information
async function getUserInfo(userId) {
  const cacheKey = `user_${userId}`;
  const cached = getCached(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const userInfo = await fetchUserFromUex(userId);
  setCache(cacheKey, userInfo);
  return userInfo;
}
```

### Connection Pooling

**Reuse HTTP connections:**
```javascript
const https = require('https');

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const httpOptions = {
  agent: agent,
  timeout: 10000
};
```

### Async Processing

**Handle multiple requests efficiently:**
```javascript
const processingQueue = [];
const MAX_CONCURRENT = 5;

async function processWebhooksBatch() {
  const batch = processingQueue.splice(0, MAX_CONCURRENT);
  
  if (batch.length === 0) return;
  
  const promises = batch.map(webhook => 
    processWebhook(webhook).catch(error => 
      Logger.error('Webhook processing failed', error)
    )
  );
  
  await Promise.allSettled(promises);
  
  // Process next batch if queue has items
  if (processingQueue.length > 0) {
    setImmediate(processingWebhooksBatch);
  }
}
```

---

## 🌐 Multi-Environment Setup

### Environment-Specific Configuration

**Different settings for dev/staging/production:**

**netlify.toml:**
```toml
[build]
  functions = "netlify/functions"

[context.production.environment]
  NODE_ENV = "production"
  LOG_LEVEL = "error"

[context.branch-deploy.environment]
  NODE_ENV = "staging"
  LOG_LEVEL = "debug"

[context.deploy-preview.environment]
  NODE_ENV = "development"
  LOG_LEVEL = "debug"
```

**Environment-aware configuration:**
```javascript
const config = {
  production: {
    logLevel: 'error',
    rateLimit: 10,
    cacheTimeout: 300000
  },
  staging: {
    logLevel: 'debug',
    rateLimit: 100,
    cacheTimeout: 60000
  },
  development: {
    logLevel: 'debug',
    rateLimit: 1000,
    cacheTimeout: 10000
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];
```

### Branch-Based Deployments

**Test changes safely:**
1. **Create feature branch:** `git checkout -b feature/new-notification-format`
2. **Make changes** to your webhook function
3. **Push branch:** `git push origin feature/new-notification-format`
4. **Netlify automatically creates** a preview deployment
5. **Test with preview URL** before merging

---

## 🔧 Custom Functions

### Automatic Reply System

**Auto-respond to certain messages:**
```javascript
const autoReplyRules = [
  {
    trigger: /\b(price|cost|how much)\b/i,
    response: "Thanks for your interest! The price is as listed, but I'm open to reasonable offers."
  },
  {
    trigger: /\b(available|still available)\b/i,
    response: "Yes, this item is still available. Would you like to proceed with the transaction?"
  },
  {
    trigger: /\b(meet|meetup|location)\b/i,
    response: "I can meet at any major landing zone. What location works best for you?"
  }
];

function generateAutoReply(message) {
  for (const rule of autoReplyRules) {
    if (rule.trigger.test(message)) {
      return rule.response;
    }
  }
  return null;
}
```

### Smart Notifications

**AI-powered message classification:**
```javascript
function classifyMessage(message) {
  const text = message.toLowerCase();
  
  // Simple keyword-based classification
  if (text.includes('offer') || text.includes('buy')) {
    return { type: 'offer', priority: 'high' };
  }
  
  if (text.includes('question') || text.includes('?')) {
    return { type: 'question', priority: 'medium' };
  }
  
  if (text.includes('thank') || text.includes('confirm')) {
    return { type: 'confirmation', priority: 'low' };
  }
  
  return { type: 'general', priority: 'medium' };
}

function customizeNotification(message, classification) {
  const embed = baseEmbed;
  
  switch (classification.priority) {
    case 'high':
      embed.color = 15158332; // Red
      embed.title = "🚨 HIGH PRIORITY UEX Message";
      break;
    case 'medium':
      embed.color = 16776960; // Yellow
      embed.title = "⚠️ UEX Message";
      break;
    case 'low':
      embed.color = 3066993; // Green
      embed.title = "ℹ️ UEX Message";
      break;
  }
  
  return embed;
}
```

---

## 📱 Mobile Optimization

### Push Notifications

**Enhanced mobile alerts:**
```javascript
// Add Discord ping for urgent messages
function addMobilePing(embed, classification) {
  if (classification.priority === 'high') {
    return {
      content: `<@${process.env.YOUR_DISCORD_USER_ID}>`, // Pings you
      embeds: [embed]
    };
  }
  
  return { embeds: [embed] };
}
```

### SMS Integration (Advanced)

**Send SMS for critical notifications:**
```javascript
// Using Twilio (requires additional setup)
const twilio = require('twilio');

async function sendSmsNotification(message, classification) {
  if (classification.priority !== 'high') return;
  
  const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_TOKEN
  );
  
  await client.messages.create({
    body: `UEX Alert: ${message.text.substring(0, 100)}...`,
    from: process.env.TWILIO_PHONE,
    to: process.env.YOUR_PHONE_NUMBER
  });
}
```

---

## 🔍 Debugging Tools

### Request Tracing

**Track requests through the system:**
```javascript
function generateTraceId() {
  return Math.random().toString(36).substring(2, 15);
}

function addTracing(req, res, next) {
  req.traceId = generateTraceId();
  Logger.info('Request started', { traceId: req.traceId });
  
  const start = Date.now();
  res.on('finish', () => {
    Logger.info('Request completed', {
      traceId: req.traceId,
      duration: Date.now() - start,
      status: res.statusCode
    });
  });
  
  next();
}
```

### Test Webhook Simulator

**Test your webhook without real UEX messages:**
```javascript
// Add to your functions for testing
exports.testWebhook = async (event, context) => {
  const testPayload = {
    negotiation_hash: 'test123456789',
    last_message: 'This is a test message',
    sender_username: 'TestUser',
    listing_title: 'Test Item - Mining Equipment',
    timestamp: new Date().toISOString()
  };
  
  return processWebhook(testPayload);
};
```

---

## 📊 Advanced Analytics Dashboard

### Usage Metrics

**Create a simple analytics endpoint:**
```javascript
exports.analytics = async (event, context) => {
  const stats = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: await getPerformanceMetrics(),
    usage: await getUsageStats(),
    health: await quickHealthCheck()
  };
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats, null, 2)
  };
};
```

### Data Export

**Export your integration data:**
```javascript
exports.exportData = async (event, context) => {
  const data = {
    configuration: await getConfigSummary(),
    recent_activity: await getRecentActivity(),
    performance_history: await getPerformanceHistory(),
    error_logs: await getErrorLogs()
  };
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="uex-integration-data.json"'
    },
    body: JSON.stringify(data, null, 2)
  };
};
```

---

## 🚦 Best Practices

### Code Organization

**Structure your functions properly:**
```
netlify/functions/
├── uex-webhook.js          # Main webhook handler
├── discord-command.js      # Discord commands
├── health.js              # Health checking
├── analytics.js           # Usage analytics
└── utils/
    ├── logger.js          # Logging utilities
    ├── cache.js           # Caching system
    ├── discord.js         # Discord helpers
    └── uex-api.js         # UEX API helpers
```

### Error Handling

**Comprehensive error management:**
```javascript
class IntegrationError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

function handleError(error, context = {}) {
  Logger.error(error.message, {
    type: error.type,
    context,
    stack: error.stack
  });
  
  // Send error notification to Discord if critical
  if (error.type === 'critical') {
    sendErrorNotification(error);
  }
  
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: error.message,
      type: error.type,
      timestamp: error.timestamp
    })
  };
}
```

### Testing Strategy

**Automated testing setup:**
```javascript
// tests/webhook.test.js
const { handler } = require('../netlify/functions/uex-webhook');

describe('UEX Webhook', () => {
  test('processes valid webhook', async () => {
    const event = {
      body: JSON.stringify({
        negotiation_hash: 'test123',
        last_message: 'Test message',
        sender_username: 'testuser'
      })
    };
    
    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);
  });
});
```

---

## 🔗 Integration Extensions

### Multiple UEX Accounts

**Support multiple UEX Corp accounts:**
```javascript
const accounts = [
  {
    name: 'primary',
    apiToken: process.env.UEX_API_TOKEN_1,
    secretKey: process.env.UEX_SECRET_KEY_1,
    discordChannel: process.env.DISCORD_CHANNEL_1
  },
  {
    name: 'secondary',
    apiToken: process.env.UEX_API_TOKEN_2,
    secretKey: process.env.UEX_SECRET_KEY_2,
    discordChannel: process.env.DISCORD_CHANNEL_2
  }
];
```

### Third-Party Integrations

**Connect with other services:**
- **Slack:** Similar to Discord webhook setup
- **Email:** SMTP or service like SendGrid
- **Database:** Store negotiation history
- **Calendar:** Schedule follow-ups

---

## 🔧 Troubleshooting Advanced Features

### Performance Issues

**Common causes and solutions:**
1. **Too many requests:** Implement rate limiting
2. **Slow API calls:** Add caching and connection pooling
3. **Memory leaks:** Monitor memory usage and clean up resources
4. **Cold starts:** Keep functions warm with scheduled pings

### Configuration Conflicts

**Debug configuration issues:**
```javascript
function validateAdvancedConfig() {
  const issues = [];
  
  if (!process.env.CUSTOM_FEATURE_ENABLED) {
    issues.push('Custom features disabled');
  }
  
  if (issues.length > 0) {
    throw new IntegrationError(
      'Configuration validation failed',
      'config_error',
      { issues }
    );
  }
}
```

---

## 📚 Further Reading

**Related Documentation:**
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

**Community Resources:**
- [GitHub Issues](https://github.com/jenkor/UEX-Discord-Integration/issues) - Report bugs or request features
- [Discord Community](https://discord.gg/your-invite) - Get help from other users
- [Discussions](https://github.com/jenkor/UEX-Discord-Integration/discussions) - Share your customizations

*Last updated: December 2024* 