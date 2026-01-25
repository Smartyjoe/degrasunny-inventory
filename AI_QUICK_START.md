# AI Intelligence Layer - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Get Your OpenRouter API Key

1. Go to **https://openrouter.ai/keys**
2. Sign up or log in (free tier available)
3. Click "Create Key"
4. Copy your API key

### Step 2: Configure Your Environment

Create or edit `.env.local` in the project root:

```bash
# Required for AI features
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Existing configuration (keep these)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Trader Inventory Dashboard
```

### Step 3: Restart the Development Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 4: Verify AI is Working

1. **Open the Dashboard** - You should see:
   - AI Daily Summary card (blue gradient)
   - Business Insights panel (left side)
   - Stock Alerts panel (right side)
   - Floating chat icon (bottom-right)

2. **Test the Chat**:
   - Click the sparkle icon (bottom-right)
   - Type: "What were today's sales?"
   - You should get an instant response

3. **Test Error Prevention**:
   - Go to Sales Entry
   - Try to record a sale with 0 stock
   - AI warning modal should appear

## 📊 What You Get

### Automatic Features (No Configuration)

✅ **Profit Insights** - Analyzes margins, detects loss leaders  
✅ **Stock Alerts** - Predicts stockouts, suggests reorder quantities  
✅ **Daily Summary** - Executive-style business briefing  
✅ **Error Prevention** - Validates transactions before submission  
✅ **Price Optimization** - Suggests price adjustments  
✅ **Sales Forecasting** - Predicts demand based on history  

### On-Demand Features

✅ **AI Chat** - Ask anything about your business  
✅ **Natural Language Queries** - "How can I increase profit?"  
✅ **Retail Analysis** - Recommends wholesale vs retail strategy  

## 🎯 Try These Commands in Chat

### Quick Stats
- "What were today's sales?"
- "How much profit did I make?"
- "Which products are low on stock?"

### Analysis
- "What are my best-selling products?"
- "Which products are losing money?"
- "How can I improve my profit margins?"

### Planning
- "What should I reorder?"
- "Forecast next week's sales"
- "Suggest pricing changes"

## ⚡ Features by Page

### Dashboard
- **AI Daily Summary** - Top section, blue card
- **Profit Insights** - Left panel, shows 3-5 insights
- **Stock Alerts** - Right panel, sorted by urgency
- **AI Chat** - Bottom-right floating widget

### Sales Entry
- **Smart Validation** - Before recording sale
- **Error Prevention** - Warns about stock/pricing issues
- **AI Chat** - Available for quick questions

### Products (Future)
- Price suggestions per product
- Performance analysis

### Reports (Future)
- Advanced forecasting
- Trend analysis

## 🛠️ Settings

AI settings are stored in browser storage. To adjust:

```typescript
// In browser console (for testing)
localStorage.setItem('ai-storage', JSON.stringify({
  aiEnabled: true,           // Master toggle
  autoRefreshEnabled: true,  // Auto-update insights
  refreshInterval: 5,        // Minutes between updates
  showInsightsPanel: true,   // Show/hide panels
}))

// Refresh page to apply
```

## 🚨 Troubleshooting

### Issue: "OpenRouter API key not configured"

**Quick Fix**:
```bash
# Check .env.local exists and has:
VITE_OPENROUTER_API_KEY=sk-or-v1-...

# Restart server
npm run dev
```

### Issue: AI responses are slow

**Solutions**:
- First response is always slower (no cache)
- Repeat questions are instant (cached 5 min)
- Check OpenRouter status: https://openrouter.ai/status
- Try the fallback mode (remove API key temporarily)

### Issue: No insights showing

**Quick Fixes**:
1. Add products to your inventory
2. Record some sales
3. Wait 30 seconds for data to load
4. Click "Refresh" button on insights panel

### Issue: Chat not responding

**Debug Steps**:
1. Open browser console (F12)
2. Look for errors
3. Check API key is set correctly
4. Try rule-based questions: "What were today's sales?"

## 🎓 Understanding AI Behavior

### Formal Communication
The AI **always speaks formally and professionally**:

✅ "The product requires immediate restocking."  
❌ "Hey! You should probably restock this 😊"

### Data-Only Responses
The AI **only uses your actual business data**:

✅ "Based on 23 sales in the last 7 days..."  
❌ "You probably sell around 20-30 per week"

### No Confidence Scores
The AI **never shows probabilities**:

✅ "Stock will deplete in approximately 5 days."  
❌ "There's a 73% chance of stockout in 5 days."

### No Backend Assumptions
The AI **never mentions databases or backends**:

✅ "Current inventory shows..."  
❌ "According to the database..."

## 🔐 Security & Privacy

### What Gets Sent to OpenRouter?
- Aggregated business metrics (totals, averages)
- Product names and quantities
- Sales summaries
- NO customer personal data
- NO payment information
- NO authentication tokens

### What Stays Private?
- Your API key (stored in env only)
- Customer details
- User passwords
- Transaction IDs

### API Key Safety
- ✅ Never logged to console
- ✅ Not in version control (.gitignore)
- ✅ Sent only in secure headers
- ✅ Can be revoked anytime at openrouter.ai

## 💰 Cost Estimation

### OpenRouter Pricing (as of 2026)

**GPT-4o-mini** (Primary Model):
- ~$0.0001 per request (typical business query)
- ~$1-5 per month for active usage
- Free tier: $5 credits on signup

**Example Usage**:
- 10 chat messages/day = $0.001/day = $0.30/month
- Auto insights (every 5 min) = $0.50/month
- Daily summary = $0.10/month
- **Total: ~$1-2/month for typical use**

### Cost Optimization
- ✅ Automatic caching (5 min TTL)
- ✅ Rule-based fallbacks (no cost)
- ✅ Quick response detection (no AI call)
- ✅ Adjustable refresh intervals

## 📈 Performance Tips

### Optimize Refresh Rates
```typescript
// Reduce API calls (increase interval)
refreshInterval: 10  // 10 minutes instead of 5

// Or disable auto-refresh
autoRefreshEnabled: false  // Refresh manually only
```

### Use Quick Responses
These questions **don't call AI** (instant, free):
- "What were today's sales?"
- "Which products are low on stock?"
- "What are my best sellers?"
- "Show me top products"

### Cache Effectively
- Repeat questions within 5 minutes = cached (free)
- Clear cache: `openRouterService.clearCache()`

## 🎯 Next Steps

1. **Record Some Sales** - AI needs data to analyze
2. **Add Products** - More products = better insights
3. **Try the Chat** - Ask about your business
4. **Check Daily Summary** - See executive briefing
5. **Review Insights** - Act on recommendations
6. **Test Error Prevention** - Try invalid transactions

## 📚 More Information

- **Full Documentation**: See `AI_SYSTEM_README.md`
- **Architecture Details**: See code comments in `src/services/ai/`
- **API Reference**: https://openrouter.ai/docs
- **Support**: Check browser console for errors

## ✨ Pro Tips

1. **Ask Specific Questions** - "Why is profit lower this week?" works better than "How's business?"

2. **Use Context** - AI remembers last 10 messages in chat

3. **Trust the Warnings** - AI error prevention is based on actual data

4. **Review Suggestions** - Price and stock recommendations are data-driven

5. **Check Daily Summaries** - Start each day by reviewing the AI summary

---

**Ready to use AI?** Just add your API key and start the server! 🚀

**Questions?** Check `AI_SYSTEM_README.md` or your browser console.

**Status**: ✅ All 8 AI features implemented and ready
