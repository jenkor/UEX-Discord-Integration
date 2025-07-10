# API Reference

**Technical documentation for UEX-Discord integration endpoints**

This page documents all available API endpoints, their parameters, responses, and usage examples.

## 🎯 Base URL

Your integration endpoints are available at:
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/
```

Replace `YOUR-SITE-NAME` with your actual Netlify site URL.

---

## 📡 Endpoints Overview

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| [`/health`](#health) | GET | System health check | None |
| [`/uex-webhook`](#uex-webhook) | POST | Receive UEX Corp webhooks | Signature |
| [`/discord-command`](#discord-command) | POST | Process Discord commands | None |
| [`/discord-bot`](#discord-bot) | POST | Discord bot interactions | Discord |

---

## 🏥 Health Endpoint

**URL:** `/.netlify/functions/health`  
**Method:** `GET`  
**Purpose:** Check integration health and configuration status

### Request

**No parameters required**

```bash
curl https://your-site.netlify.app/.netlify/functions/health
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-20T10:30:00.000Z",
    "configuration": {
      "configured": {
        "discord_webhook_url": true,
        "discord_channel_id": true,
        "uex_api_token": true,
        "uex_secret_key": true
      }
    },
    "connectivity": {
      "discord": {
        "status": "healthy",
        "response_time": 150
      },
      "uex": {
        "status": "reachable",
        "response_time": 300
      }
    },
    "version": "1.0.0"
  }
}
```

**Error (500):**
```json
{
  "success": false,
  "error": "Configuration validation failed",
  "details": {
    "missing_variables": ["UEX_API_TOKEN"],
    "timestamp": "2024-12-20T10:30:00.000Z"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall health: `healthy`, `degraded`, `error` |
| `configuration.configured` | object | Boolean flags for each required environment variable |
| `connectivity` | object | Connection test results for external services |
| `version` | string | Current integration version |

### Usage Examples

**Check if integration is working:**
```javascript
fetch('https://your-site.netlify.app/.netlify/functions/health')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.data.status === 'healthy') {
      console.log('Integration is working!');
    } else {
      console.error('Integration has issues:', data);
    }
  });
```

---

## 📥 UEX Webhook Endpoint

**URL:** `/.netlify/functions/uex-webhook`  
**Method:** `POST`  
**Purpose:** Receive and process webhooks from UEX Corp

### Request

**Headers:**
```
Content-Type: application/json
X-UEX-Signature: sha256=<signature> (if signature verification enabled)
```

**Body:**
```json
{
  "negotiation_hash": "abc123def456789",
  "last_message": "I'm interested in this item. Is it still available?",
  "sender_username": "SpaceTrader42",
  "sender_id": "12345",
  "listing_title": "Mining Equipment - Size 2 Refinery",
  "listing_id": "listing_67890",
  "timestamp": "2024-12-20T10:30:00.000Z",
  "event_type": "negotiation_message"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `negotiation_hash` | string | ✅ Yes | Unique identifier for the negotiation |
| `last_message` | string | ✅ Yes | Text content of the message |
| `sender_username` | string | ✅ Yes | UEX Corp username of message sender |
| `sender_id` | string | ⚪ No | UEX Corp user ID of sender |
| `listing_title` | string | ✅ Yes | Title of the listing being negotiated |
| `listing_id` | string | ⚪ No | UEX Corp listing identifier |
| `timestamp` | string | ⚪ No | ISO 8601 timestamp of the message |
| `event_type` | string | ⚪ No | Type of webhook event |

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "processed": true,
    "notification_sent": true,
    "discord_message_id": "1234567890123456789",
    "timestamp": "2024-12-20T10:30:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Missing required field: negotiation_hash",
  "timestamp": "2024-12-20T10:30:00.000Z"
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid webhook signature",
  "timestamp": "2024-12-20T10:30:00.000Z"
}
```

### Usage Examples

**Manual webhook test:**
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/uex-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "negotiation_hash": "test123456789",
    "last_message": "Test message from API",
    "sender_username": "TestUser",
    "listing_title": "Test Item - Mining Equipment"
  }'
```

**JavaScript webhook simulation:**
```javascript
const webhookData = {
  negotiation_hash: 'abc123def456',
  last_message: 'Is this item still available?',
  sender_username: 'SpaceTrader',
  listing_title: 'Mining Equipment - Size 2 Refinery'
};

fetch('https://your-site.netlify.app/.netlify/functions/uex-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookData)
})
.then(response => response.json())
.then(data => console.log('Webhook processed:', data));
```

---

## 💬 Discord Command Endpoint

**URL:** `/.netlify/functions/discord-command`  
**Method:** `POST`  
**Purpose:** Process commands from Discord (like manual replies)

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "content": "/reply abc123def456 Thank you for your interest! The item is still available.",
  "user_id": "987654321098765432",
  "channel_id": "1234567890123456789"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ✅ Yes | Command text (e.g., "/reply hash message") |
| `user_id` | string | ⚪ No | Discord user ID who sent the command |
| `channel_id` | string | ⚪ No | Discord channel ID where command was sent |

### Command Format

**Reply command:**
```
/reply <negotiation_hash> <message>
```

**Examples:**
```
/reply abc123def456 Thank you for your interest!
/reply xyz789 The item is still available. Are you ready to proceed?
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "message_sent": true,
    "negotiation_hash": "abc123def456",
    "message": "Thank you for your interest!",
    "timestamp": "2024-12-20T10:30:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Invalid command format. Use: /reply <hash> <message>",
  "timestamp": "2024-12-20T10:30:00.000Z"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Negotiation not found or no longer active",
  "timestamp": "2024-12-20T10:30:00.000Z"
}
```

### Usage Examples

**Send reply via browser console:**
```javascript
fetch('https://your-site.netlify.app/.netlify/functions/discord-command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: '/reply abc123def456 Thank you for your message!'
  })
})
.then(response => response.json())
.then(data => console.log('Reply sent:', data));
```

**Batch reply processing:**
```javascript
const replies = [
  { hash: 'abc123', message: 'Thank you for your interest!' },
  { hash: 'def456', message: 'The item is still available.' }
];

for (const reply of replies) {
  const command = `/reply ${reply.hash} ${reply.message}`;
  
  fetch('https://your-site.netlify.app/.netlify/functions/discord-command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: command })
  })
  .then(response => response.json())
  .then(data => console.log(`Reply to ${reply.hash}:`, data));
}
```

---

## 🤖 Discord Bot Endpoint

**URL:** `/.netlify/functions/discord-bot`  
**Method:** `POST`  
**Purpose:** Handle Discord bot interactions (slash commands)

### Request

**Headers:**
```
Content-Type: application/json
X-Signature-Ed25519: <discord_signature>
X-Signature-Timestamp: <timestamp>
```

**Body (Ping):**
```json
{
  "type": 1
}
```

**Body (Application Command):**
```json
{
  "type": 2,
  "id": "1234567890123456789",
  "application_id": "9876543210987654321",
  "token": "unique_interaction_token",
  "data": {
    "id": "1111111111111111111",
    "name": "reply",
    "options": [
      {
        "name": "hash",
        "value": "abc123def456"
      },
      {
        "name": "message",
        "value": "Thank you for your interest!"
      }
    ]
  },
  "user": {
    "id": "2222222222222222222",
    "username": "DiscordUser"
  },
  "channel_id": "3333333333333333333"
}
```

### Interaction Types

| Type | Value | Description |
|------|-------|-------------|
| PING | 1 | Discord verification ping |
| APPLICATION_COMMAND | 2 | Slash command invocation |

### Response

**Ping Response (200):**
```json
{
  "type": 1
}
```

**Command Response (200):**
```json
{
  "type": 4,
  "data": {
    "content": "✅ Message sent to UEX Corp successfully!",
    "flags": 64
  }
}
```

**Error Response (200):**
```json
{
  "type": 4,
  "data": {
    "content": "❌ Failed to send message: Negotiation not found",
    "flags": 64
  }
}
```

### Response Types

| Type | Value | Description |
|------|-------|-------------|
| PONG | 1 | Response to ping |
| CHANNEL_MESSAGE_WITH_SOURCE | 4 | Respond with a message |

### Response Flags

| Flag | Value | Description |
|------|-------|-------------|
| EPHEMERAL | 64 | Message visible only to user |

---

## 🔒 Authentication & Security

### Webhook Signature Verification

**UEX Corp webhooks** (if enabled):
```javascript
const crypto = require('crypto');

function verifyUexSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

**Discord bot interactions:**
```javascript
const nacl = require('tweetnacl');

function verifyDiscordSignature(body, signature, timestamp, publicKey) {
  const message = timestamp + body;
  const signatureBuffer = Buffer.from(signature, 'hex');
  const messageBuffer = Buffer.from(message);
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');
  
  return nacl.sign.detached.verify(
    messageBuffer,
    signatureBuffer,
    publicKeyBuffer
  );
}
```

### Rate Limiting

**Default limits:**
- Health endpoint: 60 requests/minute
- Webhook endpoint: 300 requests/minute  
- Command endpoint: 30 requests/minute
- Bot endpoint: 100 requests/minute

### CORS Headers

**All endpoints return:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## 📊 Error Codes

### HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid request format or missing required fields |
| 401 | Unauthorized | Invalid signature or authentication |
| 403 | Forbidden | Request blocked by rate limiting |
| 404 | Not Found | Resource not found (e.g., invalid negotiation hash) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error or misconfiguration |
| 503 | Service Unavailable | Temporary service outage |

### Application Error Codes

**Configuration Errors:**
- `CONFIG_MISSING_VARIABLE` - Required environment variable missing
- `CONFIG_INVALID_FORMAT` - Environment variable has invalid format

**Authentication Errors:**
- `AUTH_INVALID_SIGNATURE` - Webhook signature verification failed
- `AUTH_MISSING_TOKEN` - Required authentication token missing
- `AUTH_EXPIRED_TOKEN` - Authentication token has expired

**UEX API Errors:**
- `UEX_API_UNREACHABLE` - Cannot connect to UEX Corp API
- `UEX_AUTH_FAILED` - UEX Corp authentication failed
- `UEX_NEGOTIATION_NOT_FOUND` - Negotiation hash not found
- `UEX_NEGOTIATION_CLOSED` - Cannot reply to closed negotiation

**Discord Errors:**
- `DISCORD_WEBHOOK_FAILED` - Failed to send Discord notification
- `DISCORD_INVALID_CHANNEL` - Discord channel not found or inaccessible
- `DISCORD_BOT_ERROR` - Discord bot interaction failed

---

## 🧪 Testing

### Test Endpoints

**Health check test:**
```bash
# Should return healthy status
curl https://your-site.netlify.app/.netlify/functions/health
```

**Webhook test:**
```bash
# Should trigger Discord notification
curl -X POST https://your-site.netlify.app/.netlify/functions/uex-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "negotiation_hash": "test123",
    "last_message": "Test message",
    "sender_username": "TestUser",
    "listing_title": "Test Item"
  }'
```

**Command test:**
```bash
# Should attempt to send reply (may fail if hash is invalid)
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
  -H "Content-Type: application/json" \
  -d '{
    "content": "/reply test123 Hello from API test"
  }'
```

### Integration Testing

**Complete flow test:**
1. **Trigger webhook** → Check Discord for notification
2. **Copy negotiation hash** from Discord notification
3. **Send command** with real hash → Check UEX Corp for reply

### Load Testing

**Simple load test:**
```bash
# Test 10 concurrent health checks
for i in {1..10}; do
  curl https://your-site.netlify.app/.netlify/functions/health &
done
wait
```

---

## 📚 SDK Examples

### JavaScript/Node.js

**Create a simple client:**
```javascript
class UexDiscordClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
  
  async sendReply(hash, message) {
    const response = await fetch(`${this.baseUrl}/discord-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `/reply ${hash} ${message}`
      })
    });
    return response.json();
  }
  
  async triggerWebhook(webhookData) {
    const response = await fetch(`${this.baseUrl}/uex-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });
    return response.json();
  }
}

// Usage
const client = new UexDiscordClient('https://your-site.netlify.app/.netlify/functions');
const health = await client.healthCheck();
console.log('Health:', health);
```

### Python

**Simple Python client:**
```python
import requests
import json

class UexDiscordClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def health_check(self):
        response = requests.get(f"{self.base_url}/health")
        return response.json()
    
    def send_reply(self, hash, message):
        data = {
            "content": f"/reply {hash} {message}"
        }
        response = requests.post(
            f"{self.base_url}/discord-command",
            json=data
        )
        return response.json()

# Usage
client = UexDiscordClient('https://your-site.netlify.app/.netlify/functions')
health = client.health_check()
print('Health:', health)
```

---

## 🔗 Related Documentation

**Setup Guides:**
- [Setup Guide](Setup-Guide) - Basic integration setup
- [Discord Bot Setup](Discord-Bot-Setup) - Bot configuration
- [Environment Variables](Environment-Variables) - Configuration reference

**Advanced Topics:**
- [Advanced Configuration](Advanced-Configuration) - Customization options
- [Troubleshooting](Troubleshooting) - Common issues and solutions

**External APIs:**
- [Discord API Documentation](https://discord.com/developers/docs)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)

*Last updated: December 2024* 