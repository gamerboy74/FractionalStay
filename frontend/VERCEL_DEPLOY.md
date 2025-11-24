# 🚀 Vercel Deployment Guide

Complete guide to deploy your FractionalEstate frontend to Vercel.

## Quick Deploy (5 minutes)

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (updates)
# - Project name? fractional-estate (or your choice)
# - Directory? ./
# - Override settings? No
```

### Option 2: GitHub Integration (Automatic)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Add environment variables (see below)
   - Click "Deploy"

---

## Environment Variables Setup

### Required Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

#### 1. Contract Addresses
```
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=0x45e5923EB76Ee2b90B89d061436E3483f9DcC883
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0xaB6873d0F1E5bD08e10d46F21aEB6608963B7bAC
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x48336fEe63694a2c874209F7C88c17C8c286A0cb
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x8043964cA09E4c5F7A60ad4781749e53ca8C4973
NEXT_PUBLIC_USDC_ADDRESS=0x87917eE5e87Ed830F3D26A14Df3549f6A6Aa332C
NEXT_PUBLIC_USER_REGISTRY_ADDRESS=0xf77951f62ED3B92d6c8db131aca2D7b822301Ee2
NEXT_PUBLIC_ZK_REGISTRY_ADDRESS=0x4c01b3A4724D85Bf5d4913D2bF40CEA27b59a7d7
NEXT_PUBLIC_IDENTITY_SBT_ADDRESS=0x67905835BED0f5b633Ed8cA5B2e2506Cf2afF1F7
```

#### 2. Blockchain Configuration
```
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/_dehAHJ6i1FIe7mapiiDs
```

#### 3. WalletConnect
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=89d2a5f52e2b346dbb36a96dd712b81f
```

#### 4. Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://phzglkmanavjvsjeonnh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemdsa21hbmF2anZzamVvbm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDAzNjUsImV4cCI6MjA3OTM3NjM2NX0.rJ58PFmjTRMayNNOHj3xfdcSkXEi0ZTpcSIoYueLJOw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemdsa21hbmF2anZzamVvbm5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgwMDM2NSwiZXhwIjoyMDc5Mzc2MzY1fQ.tNpn0B-uDE6_gz9fKxHMtjL4wVPB1f8VSzPzSBi3zNg
```

#### 5. IPFS / Pinata
```
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZjdmMzUwOS1kMjAwLTQxNmQtYTdlNS05ZWM2MDU0MGQ1M2EiLCJlbWFpbCI6Imdib3kzMTIwMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWE5MDJjZDhjYWYyNGI1YzcyN2QiLCJzY29wZWRLZXlTZWNyZXQiOiJjMDViMTdlNjM5NGUyNTg1YWZlOGU2MDZhZmVlODYxN2YwN2I2NmVlZjYyNzc1YjdjZmZlN2QzZTdjNjg0YmQzIiwiZXhwIjoxNzk1MzU0ODE2fQ.JEJCC0IZidpE9usd4AHOYAvh3jwbkuNnlHko0tA7zls
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

#### 6. Relayer (Optional - for server-side operations)
```
RELAYER_PRIVATE_KEY=0x71faad5c8a331aab5b05474030048e8b21419ab80c43c6de648a7ed1d03da675
```

**⚠️ Important:** 
- Set `RELAYER_PRIVATE_KEY` only if you need server-side contract interactions
- Never commit private keys to Git
- Use Vercel's environment variables (encrypted)

---

## Step-by-Step Deployment

### 1. Prepare Your Code

```bash
cd frontend

# Make sure everything is committed
git status

# Test build locally
npm run build

# If build succeeds, you're ready!
```

### 2. Deploy via CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 3. Set Environment Variables

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS
# Paste value when prompted
# Select: Production, Preview, Development

# Repeat for all environment variables
```

**Via Dashboard (Easier):**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - Name: `NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS`
   - Value: `0x45e5923EB76Ee2b90B89d061436E3483f9DcC883`
   - Environment: Production, Preview, Development (select all)
5. Click "Save"
6. Repeat for all variables

### 4. Redeploy After Adding Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

Or trigger redeploy from Vercel Dashboard → Deployments → Redeploy

---

## Project Settings

### Root Directory

If your project is in a monorepo:
- Vercel Dashboard → Settings → General
- Root Directory: `frontend`

### Build Settings

Vercel auto-detects Next.js, but verify:
- Framework Preset: `Next.js`
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

### Node.js Version

Vercel uses Node.js 18.x by default. To change:
- Add `.nvmrc` file:
  ```
  18
  ```

---

## Custom Domain (Optional)

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL

---

## Monitoring & Logs

### View Logs

```bash
# Real-time logs
vercel logs

# Specific deployment
vercel logs [deployment-url]
```

### Vercel Dashboard

- **Deployments:** View all deployments
- **Analytics:** Performance metrics
- **Logs:** Real-time application logs
- **Functions:** Serverless function logs

---

## Troubleshooting

### Build Fails

**Error:** "Module not found"
**Solution:** 
- Check `package.json` dependencies
- Run `npm install` locally to verify

**Error:** "Environment variable missing"
**Solution:**
- Add all `NEXT_PUBLIC_*` variables in Vercel Dashboard
- Redeploy after adding variables

**Error:** "Build timeout"
**Solution:**
- Check `vercel.json` for function timeouts
- Optimize build (remove unused dependencies)

### Runtime Errors

**Error:** "Cannot connect to blockchain"
**Solution:**
- Verify `NEXT_PUBLIC_ARBITRUM_RPC_URL` is set
- Check RPC endpoint is accessible

**Error:** "Supabase connection failed"
**Solution:**
- Verify Supabase URLs and keys
- Check Supabase project is active

### Performance Issues

1. **Enable Analytics:**
   - Vercel Dashboard → Analytics
   - Enable Web Analytics

2. **Check Bundle Size:**
   ```bash
   npm run build
   # Check .next/analyze for bundle sizes
   ```

3. **Optimize Images:**
   - Use Next.js Image component
   - Configure `next.config.js` image domains

---

## CI/CD with GitHub

### Automatic Deployments

1. **Push to `main` branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull Requests** → Preview deployment with unique URL

### Branch Protection

- Vercel automatically creates preview deployments
- Each PR gets a unique URL
- Test before merging to main

---

## Environment-Specific Deployments

### Production
```bash
vercel --prod
```
- Uses production environment variables
- Deploys to main domain

### Preview
```bash
vercel
```
- Uses preview environment variables
- Creates unique preview URL

### Development
```bash
vercel dev
```
- Runs locally with Vercel's dev server
- Uses development environment variables

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Open project in browser
vercel open

# Remove deployment
vercel remove [deployment-url]
```

---

## Security Checklist

- ✅ All environment variables set in Vercel (not in code)
- ✅ Private keys never committed to Git
- ✅ `RELAYER_PRIVATE_KEY` only in Vercel (if needed)
- ✅ Supabase service role key secured
- ✅ Pinata JWT secured
- ✅ No sensitive data in logs

---

## Next Steps After Deployment

1. **Test the deployment:**
   - Visit your Vercel URL
   - Test wallet connection
   - Test property creation
   - Test transactions

2. **Set up monitoring:**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, etc.)

3. **Configure custom domain:**
   - Add your domain in Vercel
   - Update DNS records

4. **Set up webhooks:**
   - For deployment notifications
   - For error alerts

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Vercel Support:** https://vercel.com/support

---

## Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables added to Vercel
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All dependencies in `package.json`
- [ ] `.vercelignore` excludes unnecessary files
- [ ] `vercel.json` configured correctly
- [ ] Tested locally with `vercel dev`

---

**Ready to deploy? Run:**
```bash
cd frontend
vercel --prod
```

🎉 **Happy Deploying!**

