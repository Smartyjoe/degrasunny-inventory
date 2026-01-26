# ⚠️ AI Setup Required

## Issue: AI API 401 Unauthorized Error

You're seeing this error because the OpenRouter API key is not configured or is invalid.

---

## 🔧 Quick Fix (2 Minutes)

### Step 1: Get Your Free API Key

1. Visit: https://openrouter.ai/keys
2. Sign up for a free account (no credit card required)
3. Click "Create Key"
4. Copy the generated key (starts with `sk-or-v1-`)

### Step 2: Add Key to .env File

1. Open (or create) `.env` file in your project root
2. Add this line:
   ```
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```
3. Replace `sk-or-v1-your-actual-key-here` with your real key
4. Save the file

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verify It Works

1. Open the app in browser
2. Click the blue sparkles button (AI chat)
3. Ask: "How is my business doing?"
4. AI should respond (no 401 error)

---

## 🚫 Common Mistakes

### ❌ Wrong:
```
OPENROUTER_API_KEY=sk-or-v1-...
```

### ✅ Correct:
```
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

**Note:** Must start with `VITE_` for Vite to recognize it!

---

## 🆓 Free Tier Info

OpenRouter free tier includes:
- Generous daily quotas
- Multiple free models
- No credit card required
- Perfect for testing and small-scale use

---

## 📝 Example .env File

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api

# OpenRouter API Key for AI Features
VITE_OPENROUTER_API_KEY=sk-or-v1-abc123def456...
```

---

## 🔍 Troubleshooting

### Still getting 401 after adding key?

1. **Check key is correct:**
   - Must start with `sk-or-v1-`
   - No spaces before or after
   - No quotes around the key

2. **Restart dev server:**
   - Environment changes require restart
   - Stop with Ctrl+C
   - Run `npm run dev` again

3. **Check .env location:**
   - Must be in project root (same folder as package.json)
   - Not in `src/` folder
   - Not in `backend/` folder

4. **Verify key is active:**
   - Go back to https://openrouter.ai/keys
   - Make sure key is not disabled or deleted

---

## 🎯 Quick Test

Run this in terminal to check if env var is set:

```bash
# Windows PowerShell
echo $env:VITE_OPENROUTER_API_KEY

# Mac/Linux
echo $VITE_OPENROUTER_API_KEY
```

If it shows your key, you're good! If empty, the .env file isn't loaded.

---

## 📞 Need Help?

1. Check `.env.example` for reference
2. Review `AI_QUICK_START.md` for detailed setup
3. Verify you've restarted the dev server

---

**Once configured, the AI assistant will work perfectly!**
