# Deployment Fix Guide - CyberShield Security Monitor

## Issues Found
✗ Supabase backend environment variables not properly configured in deployment
✗ Supabase functions may not be deployed
✗ Frontend can't communicate with Supabase

## Step 1: Find Your Supabase Credentials

Go to https://app.supabase.com and follow these steps:

1. **Select your project**: Click on "AI_Cybersecurity_Detector" (or find the project with your data)
2. **Get Anon Key**:
   - Click on "Settings" → "API"
   - Copy the "Anon" key (public key) - this is safe to share publicly
3. **Verify Project URL**: 
   - It should be: `https://pfrfeebtiktnfgdeoqvl.supabase.co` (already in your workflow)

## Step 2: Add GitHub Secret

1. Go to your GitHub repo: https://github.com/Saumya-Choudhuri/CyberShield-Security-Monitor
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `VITE_SUPABASE_ANON_KEY`
5. Value: Paste your Supabase anon key from Step 1
6. Click **Add secret**

## Step 3: Deploy Supabase Functions

Run these commands in your terminal:

```bash
# Install supabase CLI locally if not already done
npm i -D supabase

# Login to Supabase
npx supabase login

# Link to your remote project
npx supabase link --project-ref pfrfeebtiktnfgdeoqvl

# Deploy functions
npx supabase functions deploy security-monitor
```

## Step 4: Verify Database Tables Exist

Your Supabase project needs these tables (from migrations):
- `threat_logs`
- `blocked_ips`
- `security_events`

If they don't exist, run the migrations:
1. Go to Supabase Dashboard
2. Click on **SQL Editor**
3. Run the migration files from `supabase/migrations/`

## Step 5: Trigger Redeploy

After setting the GitHub secret:

```bash
git add .
git commit -m "Update deployment configuration"
git push origin main
```

This will trigger GitHub Actions to rebuild and deploy with the correct env vars.

## Verification

After deploying, check if the app works:

1. Visit: https://saumya-choudhuri.github.io/CyberShield-Security-Monitor/
2. Try to log in or view the dashboard
3. Check browser console (F12) for errors
4. Verify Supabase functions are being called

## If Still Having Issues

Run this to check your setup:

```bash
# Verify your .env is correct
cat .env

# Test Supabase connection
npm run dev

# Check if builds locally
npm run build
```

## Important Notes

⚠️ **Your data is not lost** - Even if the frontend wasn't working, your Supabase database still has all your data
⚠️ **Anon keys are public** - It's OK to have them in GitHub Actions (that's what they're for)
✓ **Service role keys** - Keep these PRIVATE, never share in workflows
