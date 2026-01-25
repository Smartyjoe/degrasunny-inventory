# 🚀 AI Assistant - Quick Start Guide

## Get AI Running in 3 Minutes

---

## Step 1: Get Your Free API Key

1. **Visit OpenRouter:**
   - Go to https://openrouter.ai
   - Click "Sign In" (or "Sign Up" if you don't have an account)

2. **Create API Key:**
   - Once logged in, go to https://openrouter.ai/keys
   - Click "Create Key"
   - Copy the generated key

**Note:** OpenRouter offers free AI models - no credit card required for basic usage!

---

## Step 2: Configure Your Environment

1. **Create `.env` file** in your project root:

```bash
# Copy from .env.example
cp .env.example .env
```

2. **Edit `.env` file** and add your API key:

```bash
# OpenRouter API Key for AI Features
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Backend API (already configured)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

3. **Save the file**

---

## Step 3: Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

**That's it!** The AI is now active.

---

## 🎉 Try It Out

### Test the AI Chat

1. **Open your browser** to http://localhost:3000
2. **Login** to your account
3. **Look for the blue sparkles button** in the bottom-right corner
4. **Click it** to open the AI chat
5. **Ask a question:**
   - "How is my business doing today?"
   - "What products are running out of stock?"
   - "Should I increase my prices?"

### See AI Insights

1. **Go to Dashboard** - See daily summary insight at the top
2. **Scroll down** - See low stock insights (if you have low stock items)
3. **Go to Reports** - See performance and payment method insights
4. **All pages** - AI chat button follows you everywhere

---

## ✅ Verify It's Working

### Quick Test Checklist

- [ ] Blue sparkles button appears in bottom-right corner
- [ ] Clicking it opens the chat interface
- [ ] AI responds with "Hello! I'm your AI business assistant..."
- [ ] AI insight cards appear on Dashboard
- [ ] Asking AI about your business returns relevant answers

---

## 🐛 Troubleshooting

### AI Chat shows "AI service not configured"

**Solution:** Check that:
1. `.env` file exists in project root
2. `VITE_OPENROUTER_API_KEY` is set correctly
3. API key starts with `sk-or-v1-`
4. You've restarted the dev server after adding the key

**Command to restart:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### AI gives error "temporarily unavailable"

**Possible causes:**
1. Invalid API key
2. Network issues
3. API rate limit (rare with free tier)

**Solutions:**
- Verify API key is correct
- Check your internet connection
- Wait a few minutes and try again
- Check OpenRouter status: https://status.openrouter.ai

### No AI insights appearing

**This is normal if:**
- You just started using the app (no data yet)
- You have no low stock items (low stock insight won't show)
- Reports have no data (performance insight won't show)

**Solution:** Record some sales, add products, and the insights will appear automatically.

---

## 🎯 What the AI Can Do

### Ask About Your Business
```
"How many sales did I make today?"
"What's my total profit this week?"
"Which product is selling the best?"
"Do I have any products running out of stock?"
```

### Get Business Advice
```
"Should I restock rice now?"
"Is my profit margin too low?"
"Should I increase prices?"
"How can I improve my sales?"
```

### Understand Your Data
```
"Why is my profit low today?"
"What payment method is most popular?"
"How are my retail sales compared to wholesale?"
"Are my sales trending up or down?"
```

---

## 🔒 Privacy & Security

✅ **Your data stays private:**
- AI only sees YOUR store's data
- No other users can access your information
- AI context clears when you log out
- No data is stored on AI servers

✅ **AI is read-only:**
- Cannot modify your data
- Cannot perform actions
- Only provides advice and insights

✅ **Multi-tenant safe:**
- Each user gets personalized AI
- No cross-user data leakage
- Completely isolated per business

---

## 💡 Pro Tips

1. **Ask specific questions** - The more specific, the better the AI response
2. **Provide context** - E.g., "Why is my profit low compared to yesterday?"
3. **Use natural language** - No need for special commands, just ask naturally
4. **Check insights regularly** - They update automatically with your data
5. **Close insights you don't need** - They won't reappear for 5 minutes

---

## 📚 Need More Help?

- **Full Documentation:** See `AI_ASSISTANT_DOCUMENTATION.md`
- **Technical Details:** Check the documentation for architecture, API details, and advanced features
- **Issues?** Open an issue in the repository

---

## 🎊 Enjoy Your AI Assistant!

You now have a powerful business intelligence assistant that:
- Understands your store
- Provides actionable insights
- Answers your questions
- Helps you make better decisions

**Happy selling! 🛒✨**

---

**Last Updated:** 2026-01-25  
**Version:** 1.0  
**Status:** Production Ready
