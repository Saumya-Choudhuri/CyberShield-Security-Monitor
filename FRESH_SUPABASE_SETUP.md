# Setting Up Supabase from Scratch

## ✅ What You Can Do

Yes! You can:
- Create a brand new Supabase project
- Update your app to use new credentials
- Deploy all database tables and functions
- Have everything working fresh

## 📋 Step 1: Create New Supabase Project

1. Go to https://app.supabase.com
2. Click **"New project"** (or sign up if needed)
3. Fill in:
   - **Name**: `CyberShield-Monitor` (or any name you like)
   - **Database Password**: Create a strong password (save it, you'll need it)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
4. Click **"Create new project"** and wait 2-3 minutes
5. You'll see your new project dashboard

## 🔑 Step 2: Get Your New Credentials

Once the project is created:

1. Click **Settings** → **API** in the left sidebar
2. Copy these two values:
   - **URL**: `https://xxxxx.supabase.co` (Project URL)
   - **ANON Key**: The longer key starting with `eyJ...` (public key)
3. Save both somewhere safe

## 📝 Step 3: Update Your Project Code

### Option A: Use the Automated Script (Recommended)

Run this command in your terminal:

```bash
./deploy-fix.sh
```

It will ask for your new credentials and set everything up.

### Option B: Manual Setup

1. **Create `.env.local` file** in your project root with:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SECURITY_MONITOR_URL=https://xxxxx.supabase.co/functions/v1/security-monitor
```

Replace:
- `xxxxx.supabase.co` with your actual project URL
- `your_anon_key_here` with your actual anon key

2. **Update GitHub Actions workflow** (`.github/workflows/deploy.yml`):
   - Change `https://pfrfeebtiktnfgdeoqvl.supabase.co` to your new project URL
   - Update `VITE_SECURITY_MONITOR_URL` similarly

3. **Test locally:**
```bash
npm run build
```

Should work without errors.

## 🗄️ Step 4: Deploy Database Schema

The database needs the tables defined. Run:

```bash
# Login to Supabase
npx supabase login

# Link to your new project (replace project-ref with your new one)
npx supabase link --project-ref YOUR_NEW_PROJECT_REF

# Push migrations to create tables
npx supabase migration up
```

**How to find your project ref:**
- Supabase Dashboard → Settings → General
- Look for "Project Reference ID" (short code like `abc123def`)

**What this does:**
- Creates `threat_logs` table
- Creates `blocked_ips` table  
- Creates `security_events` table
- Sets up authentication policies
- All from your existing migration files

## 🔧 Step 5: Deploy Supabase Functions

```bash
# Make sure you're linked (from Step 4)
npx supabase link --project-ref YOUR_NEW_PROJECT_REF

# Deploy the security-monitor function
npx supabase functions deploy security-monitor
```

## 🔐 Step 6: Add GitHub Secret

1. Go to https://github.com/Saumya-Choudhuri/CyberShield-Security-Monitor
2. Settings → Secrets and variables → Actions
3. Click **New repository secret**
4. **Name**: `VITE_SUPABASE_ANON_KEY`
5. **Value**: Paste your NEW anon key from Step 2
6. Click **Add secret**

## 🚀 Step 7: Update Workflow File and Deploy

Update `.github/workflows/deploy.yml`:

Replace:
```yaml
VITE_SUPABASE_URL: https://pfrfeebtiktnfgdeoqvl.supabase.co
```

With:
```yaml
VITE_SUPABASE_URL: https://YOUR_NEW_PROJECT_URL.supabase.co
```

Also update:
```yaml
VITE_SECURITY_MONITOR_URL: https://YOUR_NEW_PROJECT_URL.supabase.co/functions/v1/security-monitor
```

Then push:
```bash
git add .
git commit -m "Configure new Supabase project"
git push origin main
```

GitHub Actions will rebuild and deploy automatically.

## ✅ Verification

After everything deploys (5-10 minutes):

1. Visit: https://saumya-choudhuri.github.io/CyberShield-Security-Monitor/
2. Try to **sign up** or **log in**
3. Create test data
4. Refresh page - data should persist
5. Check Supabase Dashboard → Table Editor to see your data

## 🎯 You Now Have:

✅ Fresh Supabase project (empty, ready for new data)
✅ Database tables created from your migrations
✅ Security functions deployed and working
✅ Frontend connected and deployed on GitHub Pages
✅ Real-time dashboard working

## 📝 Commands Reference

```bash
# Quick setup shortcut
./deploy-fix.sh

# Or do it step by step:
npx supabase login
npx supabase link --project-ref PROJECT_REF
npx supabase migration up
npx supabase functions deploy security-monitor
npm run build
git push
```

## ⏱️ Total Time
- Create project: 5 min
- Run setup: 5 min  
- Deploy & test: 5 min
- **Total: ~15 minutes**

## 🆘 Issues?

If something goes wrong:
- Read: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Check: Supabase Dashboard → Functions for error logs
- Look: GitHub Actions → Latest workflow for build errors
