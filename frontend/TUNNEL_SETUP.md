# 🌐 Tunnel Setup Guide

Expose your local development server to the internet using tunnels.

## Quick Start (No Installation Required)

```bash
# Start dev server + tunnel in one command
npm run dev:tunnel
```

This uses **localtunnel** (free, no signup).

---

## Tunnel Options

### Option 1: LocalTunnel (Recommended - No Signup) ⭐

**Pros:**

- ✅ Free, no signup required
- ✅ Works immediately
- ✅ No installation needed (uses npx)

**Usage:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start tunnel
npm run tunnel:localtunnel
```

**Output:**

```
your-url is now available at:
https://random-name.loca.lt
```

---

### Option 2: ngrok (Popular)

**Pros:**

- ✅ Very popular and reliable
- ✅ Web dashboard
- ✅ Custom domains (paid)

**Setup:**

1. Sign up at https://ngrok.com (free)
2. Get your auth token
3. Install: `npm install -g ngrok`
4. Authenticate: `ngrok config add-authtoken YOUR_TOKEN`

**Usage:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start tunnel
npm run tunnel:ngrok
```

**Output:**

```
Forwarding  https://random-name.ngrok.io -> http://localhost:3000
```

---

### Option 3: Cloudflare Tunnel (Free & Reliable)

**Pros:**

- ✅ Free, no signup required
- ✅ Very reliable
- ✅ Fast

**Setup:**

1. Download from: https://github.com/cloudflare/cloudflared/releases
2. Or install: `brew install cloudflared` (Mac)

**Usage:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start tunnel
npm run tunnel:cloudflare
```

**Output:**

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take a minute to be reachable): |
|  https://random-name.trycloudflare.com                                                    |
+--------------------------------------------------------------------------------------------+
```

---

## Combined Commands

### Start Dev Server + Tunnel Together

```bash
# Uses localtunnel by default
npm run dev:tunnel

# Use specific tunnel
TUNNEL_TYPE=ngrok npm run dev:tunnel
TUNNEL_TYPE=cloudflare npm run dev:tunnel
TUNNEL_TYPE=localtunnel npm run dev:tunnel
```

---

## Use Cases

### 1. **Testing on Mobile**

- Get tunnel URL
- Open on your phone
- Test responsive design

### 2. **Webhook Testing**

- Set tunnel URL in webhook config
- Test webhooks from external services

### 3. **Sharing with Team**

- Share tunnel URL
- Team can access your local dev server

### 4. **Testing WalletConnect**

- Some wallets need HTTPS
- Tunnel provides HTTPS automatically

---

## Troubleshooting

### LocalTunnel Issues

**Problem:** "Tunnel not available"
**Solution:** Try again, or use a different tunnel:

```bash
npm run tunnel:ngrok
```

### ngrok Issues

**Problem:** "authtoken required"
**Solution:**

```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Cloudflare Issues

**Problem:** "cloudflared not found"
**Solution:** Download from https://github.com/cloudflare/cloudflared/releases

---

## Environment Variables

You can set these in `.env.local`:

```env
PORT=3000
TUNNEL_TYPE=localtunnel  # localtunnel, ngrok, or cloudflare
```

---

## Security Notes

⚠️ **Important:**

- Tunnels expose your local server to the internet
- Only use in development
- Don't expose production servers
- Be careful with sensitive data

---

## Quick Reference

| Command                      | Description                        |
| ---------------------------- | ---------------------------------- |
| `npm run tunnel`             | Start localtunnel (default)        |
| `npm run tunnel:localtunnel` | Start localtunnel                  |
| `npm run tunnel:ngrok`       | Start ngrok tunnel                 |
| `npm run tunnel:cloudflare`  | Start Cloudflare tunnel            |
| `npm run dev:tunnel`         | Start dev server + tunnel together |

---

## Recommended Setup

For quick testing, use **LocalTunnel** (no installation):

```bash
npm run tunnel:localtunnel
```

For production-like testing, use **ngrok**:

```bash
npm run tunnel:ngrok
```
