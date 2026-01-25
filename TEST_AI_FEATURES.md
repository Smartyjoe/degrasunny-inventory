# AI Features Testing Checklist

## Pre-Testing Setup

- [ ] OpenRouter API key added to `.env.local`
- [ ] Development server restarted
- [ ] At least 3 products created
- [ ] At least 5 sales recorded
- [ ] One product with low stock (at or below reorder level)
- [ ] One product with negative margin (optional, for loss leader test)

## Test 1: AI Service Configuration

**Location**: Browser Console

```javascript
// Test API key detection
import { openRouterService } from '@/services/ai/openRouterService'
console.log('AI Configured:', openRouterService.isConfigured())
// Expected: true
```

**Result**: ☐ Pass ☐ Fail

---

## Test 2: Context Builder

**Location**: Browser Console

```javascript
// Test context generation
import { contextBuilder } from '@/services/ai/contextBuilder'
const context = contextBuilder.buildContext({
  products: [], // Add your products
  sales: [],    // Add your sales
})
console.log('Context:', context)
// Expected: Structured business context object
```

**Result**: ☐ Pass ☐ Fail

---

## Test 3: Dashboard - Daily Summary

**Steps**:
1. Navigate to Dashboard
2. Scroll to top
3. Look for blue gradient card "Daily Business Summary"

**Expected**:
- [ ] Summary card visible
- [ ] Shows current date
- [ ] Has "Executive Overview" section
- [ ] Shows highlights/concerns
- [ ] Lists top performers
- [ ] Shows action items

**Result**: ☐ Pass ☐ Fail

**Screenshot**: _[Optional]_

---

## Test 4: Dashboard - Profit Insights

**Steps**:
1. Stay on Dashboard
2. Find "Business Insights" panel (left side)

**Expected**:
- [ ] Panel shows 3-5 insights
- [ ] Each insight has type badge (success/warning/error)
- [ ] Each insight has impact level
- [ ] Recommendations are specific
- [ ] Related products listed
- [ ] "Refresh" button works

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 5: Dashboard - Stock Alerts

**Steps**:
1. Find "Stock Alerts" panel (right side)
2. Should show low-stock products

**Expected**:
- [ ] Shows products with stock ≤ reorder level
- [ ] Sorted by urgency (critical → low)
- [ ] Shows current stock
- [ ] Shows suggested reorder quantity
- [ ] Shows estimated stockout date
- [ ] "Add X Units to Stock" button present

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 6: AI Chat - Basic Interaction

**Steps**:
1. Click sparkle icon (bottom-right)
2. Chat widget opens
3. Type: "What were today's sales?"

**Expected**:
- [ ] Chat opens smoothly
- [ ] Message sends
- [ ] Response appears within 2 seconds
- [ ] Response shows actual numbers
- [ ] Response is formal (no emojis)
- [ ] Timestamp visible

**Result**: ☐ Pass ☐ Fail

**Response Time**: _____ seconds

---

## Test 7: AI Chat - Complex Query

**Steps**:
1. In chat, type: "How can I improve my profit margins?"
2. Wait for response

**Expected**:
- [ ] Response addresses profit specifically
- [ ] Mentions actual products/numbers
- [ ] Provides concrete recommendations
- [ ] Formal professional tone
- [ ] No "I think" or "maybe"
- [ ] Response completes within 30 seconds

**Result**: ☐ Pass ☐ Fail

**Response Quality**: ☐ Excellent ☐ Good ☐ Poor

---

## Test 8: AI Chat - Suggested Questions

**Steps**:
1. Clear chat (click "Clear conversation")
2. Look at suggested questions

**Expected**:
- [ ] Shows 3-6 suggested questions
- [ ] Questions are contextual
- [ ] Clicking a question fills input
- [ ] Suggested questions update based on data

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 9: Error Prevention - Insufficient Stock

**Steps**:
1. Go to Sales Entry
2. Select a product with 0 or low stock
3. Select "Bag" unit
4. Enter quantity greater than available stock
5. Click "Record Sale"

**Expected**:
- [ ] Warning modal appears
- [ ] Shows "Transaction Cannot Proceed"
- [ ] Message says "Insufficient stock"
- [ ] Shows available vs required
- [ ] Suggests adding stock
- [ ] Cannot proceed (no proceed button or disabled)

**Result**: ☐ Pass ☐ Fail

**Screenshot**: _[Optional]_

---

## Test 10: Error Prevention - Selling Below Cost

**Prerequisites**: Product with price < cost

**Steps**:
1. Go to Sales Entry
2. Select product with negative margin
3. Enter quantity
4. Click "Record Sale"

**Expected**:
- [ ] Warning modal appears
- [ ] Shows "Transaction Warning"
- [ ] Message says "Selling below cost"
- [ ] Shows loss per unit
- [ ] Suggests price adjustment
- [ ] CAN proceed (warning only)

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 11: Error Prevention - Proceed Anyway

**Steps**:
1. Continue from Test 10 (selling below cost warning)
2. Click "Proceed Anyway"

**Expected**:
- [ ] Modal closes
- [ ] Sale is recorded
- [ ] Success message appears
- [ ] Product stock decreases
- [ ] Sale appears in today's list

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 12: Forecasting (Manual)

**Steps**:
1. Open browser console
2. Run:

```javascript
import { aiEngine } from '@/services/ai/aiEngine'
const products = [] // Get from useProducts
const sales = []    // Get from useSales
const forecasts = await aiEngine.generateForecast(products, sales, 7)
console.log('Forecasts:', forecasts)
```

**Expected**:
- [ ] Returns array of forecast objects
- [ ] Each has forecastedDemand
- [ ] Shows stockoutDate if applicable
- [ ] Has confidence level
- [ ] Includes reasoning

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 13: Cache Functionality

**Steps**:
1. In chat, ask: "What were today's sales?"
2. Note response time
3. Immediately ask the same question again
4. Note response time

**Expected**:
- [ ] First response: 1-5 seconds
- [ ] Second response: < 0.5 seconds (cached)
- [ ] Responses are identical

**Result**: ☐ Pass ☐ Fail

**Times**: First: ___s, Second: ___s

---

## Test 14: Model Fallback (Optional)

**Note**: This test requires temporarily breaking the primary model

**Steps**:
1. Open `src/services/ai/openRouterService.ts`
2. Change primary model to invalid name: `'invalid/model'`
3. Try asking a chat question
4. Check console logs

**Expected**:
- [ ] Console shows "Model ... failed, trying fallback"
- [ ] Second model is attempted
- [ ] Response eventually returns
- [ ] User sees response (not error)

**Result**: ☐ Pass ☐ Fail

**Revert Changes**: ☐ Done

---

## Test 15: No API Key Fallback

**Steps**:
1. Remove API key from `.env.local`
2. Restart server
3. Go to Dashboard
4. Check AI components

**Expected**:
- [ ] Dashboard still loads
- [ ] Insights show rule-based fallbacks
- [ ] Stock alerts show (rule-based)
- [ ] Daily summary shows (rule-based)
- [ ] Chat shows fallback responses
- [ ] No JavaScript errors in console

**Result**: ☐ Pass ☐ Fail

**Restore API Key**: ☐ Done

---

## Test 16: Auto-Refresh

**Steps**:
1. Ensure `autoRefreshEnabled: true` in settings
2. Set `refreshInterval: 1` (1 minute for testing)
3. Open Dashboard
4. Record a new sale
5. Wait 1 minute
6. Check if insights update

**Expected**:
- [ ] Insights refresh automatically
- [ ] Loading states show briefly
- [ ] New data reflected in panels
- [ ] No user action required

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 17: Multiple Tabs

**Steps**:
1. Open Dashboard in Tab 1
2. Open Dashboard in Tab 2
3. Record a sale in Tab 1
4. Switch to Tab 2

**Expected**:
- [ ] Both tabs show AI features
- [ ] Chat history syncs (if using same store)
- [ ] Cached data is shared
- [ ] No conflicts or errors

**Result**: ☐ Pass ☐ Fail

**Notes**: _____________________

---

## Test 18: Mobile Responsiveness

**Steps**:
1. Open Dashboard on mobile device or resize browser to mobile width
2. Check all AI components

**Expected**:
- [ ] Daily summary card readable
- [ ] Insights panel stacks vertically
- [ ] Stock alerts panel readable
- [ ] Chat widget accessible
- [ ] Chat modal fits screen
- [ ] No horizontal scroll

**Result**: ☐ Pass ☐ Fail

**Device/Width**: _____________________

---

## Test 19: Performance

**Steps**:
1. Open browser DevTools → Performance tab
2. Start recording
3. Load Dashboard
4. Stop recording
5. Check metrics

**Expected**:
- [ ] Page loads in < 3 seconds
- [ ] AI components render in < 5 seconds
- [ ] No layout shifts
- [ ] FPS stays above 30
- [ ] Memory usage acceptable

**Result**: ☐ Pass ☐ Fail

**Load Time**: _____ seconds

---

## Test 20: Error Handling

**Steps**:
1. Open Network tab in DevTools
2. Set network to "Offline"
3. Try asking a chat question

**Expected**:
- [ ] Error is caught gracefully
- [ ] User sees helpful message
- [ ] Fallback response provided
- [ ] No unhandled exceptions
- [ ] Can recover when back online

**Result**: ☐ Pass ☐ Fail

**Error Message**: _____________________

---

## Summary

**Tests Passed**: ____ / 20  
**Tests Failed**: ____ / 20  
**Tests Skipped**: ____ / 20

**Overall Status**: ☐ All Pass ☐ Minor Issues ☐ Major Issues

**Critical Issues Found**:
1. _____________________
2. _____________________
3. _____________________

**Recommendations**:
- _____________________
- _____________________
- _____________________

**Tested By**: _____________________  
**Date**: _____________________  
**Environment**: ☐ Development ☐ Staging ☐ Production

---

## Notes & Observations

_Use this space for any additional observations, bugs found, or suggestions for improvement._

---

**All tests complete?** Sign off below:

**Signature**: _____________________  
**Status**: ☐ Approved for Production ☐ Needs Fixes ☐ Blocked
