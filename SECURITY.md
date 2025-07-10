# 🔒 Security Configuration

This guide explains how to secure your UEX-Discord integration deployment while keeping the source code public.

## 🚨 Security Issue

**By default, your Netlify functions are PUBLIC** - anyone can call them! This means:
- ❌ Unauthorized users can abuse your UEX API quota
- ❌ Spam can be sent through your Discord webhook
- ❌ Your API keys could be exhausted by malicious actors

## 🛡️ Solution: Function Authentication

We've added authentication to protect your functions while keeping the GitHub repo public for others to use.

### Step 1: Generate a Secure Token

Create a strong, random token (32+ characters):

```bash
# Example secure token (generate your own!)
FUNCTION_AUTH_TOKEN=sk_uex_discord_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Generate your own token:**
- Use a password manager
- Or online generator: [generate.plus/en/base64](https://generate.plus/en/base64)
- Or PowerShell: `[System.Web.Security.Membership]::GeneratePassword(32, 5)`

### Step 2: Add to Netlify Environment Variables

1. **Go to Netlify Dashboard** → Your site → **Site settings**
2. **Environment variables** → **Add a variable**
3. **Key:** `FUNCTION_AUTH_TOKEN`
4. **Value:** `your_secure_token_here`
5. **Save** and **redeploy**

### Step 3: Update Your UEX Webhook Configuration

**Important:** UEX Corp must send the auth token when calling your webhook.

**In UEX webhook settings, add a header:**
```
Authorization: your_secure_token_here
```

Or if UEX doesn't support custom headers, you can temporarily disable authentication for the webhook endpoint by setting an empty `FUNCTION_AUTH_TOKEN`.

### Step 4: Authenticate Your Own Requests

When calling your functions (for testing), include the auth token:

**PowerShell example:**
```powershell
$headers = @{ 'Authorization' = 'your_secure_token_here' }
$body = @{ content = '/reply abc123 Hello World' } | ConvertTo-Json
Invoke-RestMethod -Uri "https://your-site.netlify.app/.netlify/functions/discord-command" -Method POST -Body $body -Headers $headers -ContentType "application/json"
```

**curl example:**
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-command \
  -H "Authorization: your_secure_token_here" \
  -H "Content-Type: application/json" \
  -d '{"content":"/reply abc123 Hello World"}'
```

## 🔧 How It Works

### Protected Endpoints

All function endpoints now require authentication:
- `/.netlify/functions/discord-command` ✅ **Protected**
- `/.netlify/functions/uex-webhook` ✅ **Protected**  
- `/.netlify/functions/health` ⚠️ **Public** (for monitoring)

### Authentication Flow

1. **Request received** with `Authorization` header
2. **Token extracted** (supports both `token` and `Bearer token` formats)
3. **Token compared** with `FUNCTION_AUTH_TOKEN` environment variable
4. **Request allowed** if tokens match, **rejected** if not

### Logging

Unauthorized requests are logged with IP and User-Agent for monitoring:

```
[WARN] Unauthorized request detected: { ip: "1.2.3.4", userAgent: "BadBot/1.0" }
```

### Fallback Behavior

If `FUNCTION_AUTH_TOKEN` is not set:
- **Warning logged** about unprotected functions
- **Requests allowed** (for initial setup)
- **Recommend setting** auth token for production

## 🛠️ Advanced Security Options

### Option 1: IP Allowlisting (Enterprise)

For Netlify Pro/Enterprise, you can restrict by IP:

```toml
# netlify.toml
[[edge_functions]]
function = "auth-check"
path = "/.netlify/functions/*"

[build.environment]
ALLOWED_IPS = "192.168.1.1,10.0.0.1"
```

### Option 2: Discord Bot Integration

Instead of public functions, create a Discord bot that handles commands internally:
- Bot runs on your server/cloud
- Only bot can call Netlify functions
- Users interact through Discord slash commands

### Option 3: VPN/Private Network

Deploy functions inside a private network:
- Use Netlify's private functions (Enterprise)
- Or deploy to AWS Lambda with VPC
- Access only through VPN

## ✅ Security Checklist

- [ ] Set `FUNCTION_AUTH_TOKEN` in Netlify
- [ ] Redeploy your site
- [ ] Test with auth token - should work
- [ ] Test without auth token - should get 401 error
- [ ] Update UEX webhook to include auth header
- [ ] Monitor function logs for unauthorized attempts
- [ ] Rotate auth token periodically (monthly/quarterly)

## 🔑 Best Practices

1. **Strong Tokens**: Use 32+ character random tokens
2. **Token Rotation**: Change tokens regularly  
3. **Monitor Logs**: Watch for unauthorized access attempts
4. **Principle of Least Privilege**: Only grant necessary permissions
5. **Environment Variables**: Never hardcode tokens in source code
6. **HTTPS Only**: Always use HTTPS endpoints
7. **Rate Limiting**: Consider implementing rate limits for additional protection

## 🚨 If Your Token is Compromised

1. **Immediately change** `FUNCTION_AUTH_TOKEN` in Netlify
2. **Redeploy** your site
3. **Update** UEX webhook configuration
4. **Monitor logs** for suspicious activity
5. **Consider changing** UEX API key as well

## 🤝 Sharing This Project

The beauty of this setup:
- ✅ **Source code** remains public on GitHub
- ✅ **Others can deploy** their own secure instances
- ✅ **Your deployment** is private and secure
- ✅ **No sensitive data** in the repository

When others fork your repo, they'll need to set their own `FUNCTION_AUTH_TOKEN` and credentials.

## 📞 Support

If you need help with security setup:
1. Check Netlify deployment logs
2. Verify environment variables are set
3. Test authentication with provided examples
4. Review this documentation for troubleshooting steps 