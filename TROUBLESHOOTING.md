# Troubleshooting Guide

## App Link Not Working

### Problem: Page shows 404 or blank
**Solution:**
1. Check URL is correct: `https://saumya-choudhuri.github.io/CyberShield-Security-Monitor/`
2. Wait 2-3 minutes for GitHub Pages to rebuild
3. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. Check GitHub Actions build status:
   - Go to https://github.com/Saumya-Choudhuri/CyberShield-Security-Monitor/actions
   - Click latest workflow run
   - Check if "Deploy to GitHub Pages" succeeded

### Problem: Page loads but dashboard is empty
**Solution:**
1. Press F12 to open Developer Console
2. Check for errors (red text)
3. Look for errors about Supabase not connecting
4. Make sure your GitHub secret `VITE_SUPABASE_ANON_KEY` is set correctly

## Supabase Backend Not Found

### Problem: "Connection failed" or authentication not working
**Solution:**

1. **Verify Supabase project exists:**
   - Go to https://app.supabase.com
   - You should see "AI_Cybersecurity_Detector" project
   - If not, create a new project

2. **Check environment variables are in GitHub:**
   - Go to Settings → Secrets and variables → Actions
   - You should see `VITE_SUPABASE_ANON_KEY` secret
   - If not, add it

3. **Verify Supabase functions are deployed:**
   - Go to Supabase Dashboard
   - Click on "Functions" in left sidebar
   - You should see "security-monitor" function
   - If not, run: `supabase functions deploy security-monitor`

4. **Check database tables exist:**
   - Go to Supabase Dashboard
   - Click on "Table Editor" in left sidebar
   - Look for: `threat_logs`, `blocked_ips`, `security_events`
   - If they don't exist, they'll be created on first use

## Environment Variables Not Being Picked Up

### Problem: Build succeeds but app still can't connect
**Solution:**

The build environment gets variables from these places (in order):
1. GitHub repository secrets (highest priority)
2. Hardcoded in deploy.yml workflow file

Your current setup:
- ✓ `VITE_SUPABASE_URL` is hardcoded in deploy.yml
- ✗ `VITE_SUPABASE_ANON_KEY` must be in GitHub secrets (not hardcoded for security)

**To fix:**
1. Go to GitHub Settings → Secrets → Add `VITE_SUPABASE_ANON_KEY`
2. Trigger rebuild: `git commit -m "fix" --allow-empty && git push`

## Supabase Functions Not Responding

### Problem: "Error calling security-monitor function"
**Solution:**

1. **Check function is deployed:**
   ```bash
   supabase functions list
   ```
   You should see `security-monitor` in the list

2. **Check function has no errors:**
   - Supabase Dashboard → Functions → Click "security-monitor"
   - Look for any error messages

3. **Redeploy the function:**
   ```bash
   supabase link --project-ref pfrfeebtiktnfgdeoqvl
   supabase functions deploy security-monitor --remove-locals
   ```

4. **Check function permissions:**
   - Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM pg_namespace WHERE nspname = 'public';`
   - Make sure the `public` schema exists

## Data Not Being Saved

### Problem: Created entries but they disappear after refresh
**Solution:**

1. **Check table permissions:**
   - Supabase Dashboard → Authentication → Policies
   - Verify policies exist for your tables
   - If not, they're added via migrations

2. **Check real-time is enabled:**
   - Supabase Dashboard → Table Editor
   - Click on table → "Realtime" toggle should be ON

3. **Verify data actually exists:**
   - Supabase Dashboard → SQL Editor
   - Run: `SELECT COUNT(*) FROM threat_logs;`
   - Should show number of records

## Local Development Not Working

### Problem: `npm run dev` doesn't work
**Solution:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment file:**
   ```bash
   cp .env.example .env.local
   # Then edit .env.local with your Supabase credentials
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. **If still failing:**
   ```bash
   npm run typecheck  # Check for TypeScript errors
   npm run lint       # Check for code issues
   ```

## Need Help?

Check these resources:
- Supabase Docs: https://supabase.com/docs
- GitHub Pages Docs: https://pages.github.com/
- Your Supabase Project: https://app.supabase.com

## Quick Checklist

- [ ] Supabase account created
- [ ] Database tables migrated
- [ ] Supabase functions deployed
- [ ] GitHub secret `VITE_SUPABASE_ANON_KEY` set
- [ ] Latest commit built successfully on GitHub Actions
- [ ] Website is loading at GitHub Pages URL
- [ ] Dashboard shows data from Supabase
