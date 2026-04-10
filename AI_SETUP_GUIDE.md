# AI Threat Detection Setup Guide

## 📋 Overview

This guide walks you through adding AI-powered threat detection to your CyberShield Security Monitor. The AI analyzes login attempts in real-time to detect sophisticated attacks.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get HuggingFace API Key (Free)

1. Go to [HuggingFace.co](https://huggingface.co/settings/tokens)
2. Sign up (free account)
3. Click **"Create new token"**
4. Name: `CyberShield`
5. Token type: `read`
6. Copy the token

### Step 2: Update Environment Variables

Create `.env.local` in your project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
VITE_HUGGINGFACE_API_KEY=hf_your_token_here
VITE_ENABLE_AI_THREAT_DETECTION=true
VITE_AI_ANALYSIS_MODE=hybrid
```

### Step 3: Install Dependencies & Run

```bash
npm install
npm run dev
```

**Done!** 🎉 AI threat detection is now active.

---

## 🔧 What Changed in Your Code

### New Files Added:

1. **`src/lib/aiThreatAnalysis.ts`**
   - Connects to HuggingFace AI
   - Analyzes threat data
   - Returns risk score (0-100)

2. **`src/lib/enhancedSecurityMonitor.ts`**
   - Combines AI with traditional rules
   - Makes smart blocking decisions
   - Generates threat reports

3. **`.env.example`** (Updated)
   - New AI configuration options

### Updated Files:

1. **`src/components/AuthPortal.tsx`**
   - Integrates AI threat detection
   - Shows AI analysis to users
   - Blocks based on AI recommendations

2. **`src/types/security.ts`**
   - New `AIThreatAnalysis` interface

3. **`package.json`**
   - Added `@huggingface/inference` dependency

---

## 🛡️ How AI Threat Detection Works

### Threat Analysis Process:

```
User attempts login
    ↓
Collect data:
  - Email
  - IP address
  - Failed attempts
  - Device info
  - Location
    ↓
Send to AI (HuggingFace)
    ↓
AI analyzes patterns:
  - Is this person's normal behavior?
  - Does it match known attacks?
  - Calculate risk score (0-100)
    ↓
Make decision:
  - Risk < 30%: Allow login
  - Risk 30-60%: Warn user
  - Risk 60-80%: Require 2FA
  - Risk > 80%: Block immediately
    ↓
Display result to user
```

---

## 📊 Risk Score Meanings

| Risk Score | Level | Action |
|-----------|-------|--------|
| 0-30 | Low | ✅ Allow |
| 30-60 | Medium | ⚠️ Warn |
| 60-80 | High | 🔐 Require 2FA |
| 80-100 | Critical | ❌ Block |

---

## 🔍 What AI Detects

### Threat Types:

1. **Brute Force Attacks**
   - Multiple failed attempts
   - AI recommends block

2. **Credential Stuffing**
   - 100+ rapid failures
   - AI detects bot pattern

3. **Unusual Location**
   - New country/city
   - AI asks for 2FA

4. **Device Fingerprint Change**
   - New browser/OS
   - AI monitors

5. **Geographic Impossibilities**
   - Login from 2 countries in seconds
   - AI blocks immediately

---

## 🧪 Testing the AI

### Test Case 1: Normal Login
```
Email: normal@example.com
Password: correct_password
Expected: ✅ Login succeeds, Low risk score
```

### Test Case 2: Failed Attempts
```
Email: test@example.com
Failed attempts: 3 times
Expected: ⚠️ Blocked, High risk score
```

### Test Case 3: New Location
```
Email: user@example.com
Normal: USA
Now trying: India
Expected: 🔐 Requires 2FA
```

---

## 🚨 Troubleshooting

### Issue: "HuggingFace API key not configured"

**Solution:**
```bash
# Check .env.local has:
cat .env.local | grep HUGGINGFACE

# Should show:
VITE_HUGGINGFACE_API_KEY=hf_...
```

### Issue: AI analysis takes too long

**Solution 1:** Use rule-based fallback
```env
VITE_AI_ANALYSIS_MODE=rules_only
```

**Solution 2:** Check HuggingFace API status
```bash
curl https://api-inference.huggingface.co/status
```

### Issue: "No JSON found in response"

**Solution:**
- Retry (HuggingFace might be loading model)
- Check API key is valid
- Check internet connection

---

## 📈 Performance Optimization

### Option 1: Local AI (Best Performance)

Install Ollama locally (for production):
```bash
# Install from https://ollama.ai
ollama pull mistral

# Use local endpoint:
VITE_AI_ENDPOINT=http://localhost:11434
```

### Option 2: Caching

Add to `enhancedSecurityMonitor.ts`:
```typescript
const analysisCache = new Map();

// Check cache first
if (analysisCache.has(`${email}:${ipAddress}`)) {
  return analysisCache.get(`${email}:${ipAddress}`);
}
```

---

## 🔐 Deployment

### Deploy to Production:

1. **Test locally first:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Add secrets to Supabase:**
   ```bash
   supabase secrets set HUGGINGFACE_API_KEY=hf_...
   ```

3. **Update edge functions** (if using server-side AI):
   ```bash
   supabase functions deploy security-monitor-ai
   ```

4. **Deploy to production:**
   ```bash
   git push main
   ```

---

## 📚 Advanced Configuration

### Custom AI Model:

```typescript
// In aiThreatAnalysis.ts
const response = await hf.textGeneration({
  model: 'custom-model-id', // Change this
  inputs: analysisPrompt,
});
```

### Available Models:
- `mistralai/Mistral-7B-Instruct-v0.1` (Fast)
- `meta-llama/Llama-2-7b-chat` (Accurate)
- `google/flan-t5-large` (Lightweight)

---

## 🎓 Learning Resources

- [HuggingFace Docs](https://huggingface.co/docs)
- [API Reference](https://huggingface.co/docs/api-inference)
- [Threat Detection Best Practices](https://owasp.org/www-community/attacks/)

---

## ✅ Checklist

- [ ] Created HuggingFace account
- [ ] Got API key
- [ ] Updated `.env.local`
- [ ] Ran `npm install`
- [ ] Started dev server
- [ ] Tested login with AI enabled
- [ ] Saw AI analysis result
- [ ] Pushed to feature branch

---

**Next Step:** Test the AI integration and then create a Pull Request! 🚀
