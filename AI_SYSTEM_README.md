# AI Intelligence Layer - Complete Documentation

## Overview

This document describes the fully client-side AI intelligence layer implemented for the business management application. All AI computation runs through OpenRouter API calls directly from the frontend, with no backend AI logic.

## Architecture

### Core Services

#### 1. OpenRouter Service (`src/services/ai/openRouterService.ts`)
- **Purpose**: Direct API communication with OpenRouter
- **Features**:
  - Automatic model fallback (3 models with priority)
  - Request caching (5-minute TTL)
  - Timeout handling (30 seconds per model)
  - Rate limit detection and recovery
  - Request throttling
- **Primary Model**: `openai/gpt-4o-mini`
- **Fallback Models**: 
  - `deepseek/deepseek-r1-distill-llama-70b`
  - `google/gemini-2.0-flash-001`

#### 2. Context Builder (`src/services/ai/contextBuilder.ts`)
- **Purpose**: Aggregates frontend data into structured context
- **Data Sources**:
  - Products from state/cache
  - Sales transactions
  - Dashboard statistics
  - Inventory levels
- **Context Types**:
  - ProductContext (margins, stock levels)
  - SalesContext (revenue, profit, trends)
  - InventoryContext (stock alerts, valuations)
  - PerformanceContext (best/worst performers)
  - DateContext (temporal references)

#### 3. AI Engine (`src/services/ai/aiEngine.ts`)
- **Purpose**: Main orchestrator for AI-powered business intelligence
- **Features**:
  - Smart Profit Insights
  - Auto Price Suggestions
  - Low-Stock & Reorder Intelligence
  - Retail vs Wholesale Advisor
  - Daily Business Summary
  - Smart Error Prevention
  - Forecasting & Trend Analysis

#### 4. Chat Service (`src/services/ai/chatService.ts`)
- **Purpose**: Natural language interface for business queries
- **Features**:
  - Conversational AI with memory (last 10 messages)
  - Quick response detection (no AI call needed)
  - Rule-based fallbacks when AI unavailable
  - Suggested questions based on context

### State Management

#### AI Store (`src/store/aiStore.ts`)
- **Framework**: Zustand with persistence
- **State**:
  - Chat messages and UI state
  - Cached insights (profit, pricing, stock, retail)
  - Error warnings for transactions
  - User preferences (AI enabled, auto-refresh)
- **Persistence**: Settings only (not cached data)

### React Hooks (`src/hooks/useAI.ts`)

- `useProfitInsights()` - Profit analysis and recommendations
- `usePriceSuggestions()` - Intelligent pricing suggestions
- `useStockRecommendations()` - Reorder recommendations
- `useRetailAnalysis()` - Retail vs wholesale insights
- `useDailySummary()` - Executive-style daily summary
- `useForecasting()` - Sales forecasts and predictions
- `useAIChat()` - Chat interface management
- `useTransactionValidation()` - Pre-transaction error prevention
- `useAIAutoRefresh()` - Automatic insight refresh

## AI Features

### 1. Smart Profit Insights

**Location**: Dashboard, displayed in `AIInsightsPanel`

**Analysis**:
- Low-margin products (< 20%)
- Loss-making products (negative margins)
- High-performing products
- Pricing opportunities

**Output**: Structured insights with:
- Type (success/warning/error)
- Title and description
- Impact level (high/medium/low)
- Actionable recommendations
- Related products

**Refresh**: Every 5 minutes (auto) or manual

### 2. Auto Price Suggestions

**Location**: Dashboard/Products, displayed in `AIPriceSuggestions`

**Logic**:
- Products with margins < 25% → suggest increase
- Low sales velocity → may be overpriced
- High sales + good margins → optimization potential
- Market positioning analysis

**Output**: Price suggestions with:
- Current vs suggested price
- Percentage change
- Reasoning
- Expected impact

**Safety**: Never suggests prices below cost

### 3. Low-Stock & Reorder Intelligence

**Location**: Dashboard, displayed in `AIStockAlerts`

**Analysis**:
- Sales velocity (last 30 days)
- Average daily sales rate
- Current stock levels
- Estimated stockout date

**Output**: Recommendations with:
- Urgency level (critical/high/medium/low)
- Suggested reorder quantity (30-60 days supply)
- Days until stockout
- Data-driven reasoning

**Sorting**: By urgency (critical first)

### 4. Retail vs Wholesale Advisor

**Logic**:
- Analyzes sales by unit type (bag/cup/bucket)
- Profit margins per unit
- Operational efficiency
- Customer preferences

**Output**: Analysis with:
- Recommendation (retail/wholesale/both)
- Reasoning with data
- Suggested minimums
- Trade-off explanations

### 5. Daily Business Summary

**Location**: Dashboard top section, `AIDailySummary`

**Style**: Executive briefing format

**Includes**:
- Overview paragraph (performance summary)
- Highlights (3-5 achievements)
- Concerns (2-3 issues)
- Top performers
- Action items

**Refresh**: Every 30 minutes

### 6. Smart Error Prevention

**Location**: Sales Entry page (pre-submission)

**Validates**:
- Insufficient stock (blocks transaction)
- Selling below cost (warning)
- Unusually large quantities (warning)
- Duplicate operations (warning)

**Output**: Warning modal with:
- Severity (critical/warning/info)
- Clear message
- Corrective suggestion
- Can proceed flag

**UX**: Shows modal before submission, allows proceeding on warnings only

### 7. Forecasting & Trend Analysis

**Location**: Dashboard/Reports, `AIForecast`

**Method**: Time-series analysis using historical data

**Calculations**:
- Average daily sales (last 30 days)
- Projected demand (7/30 days)
- Stockout date prediction
- Confidence level (data-based/limited-data)

**Output**: Forecasts with:
- Forecasted demand
- Stockout warnings
- Confidence indicator
- Reasoning explanation

### 8. AI Chat (Natural Language Interface)

**Location**: Floating widget (bottom-right on all pages)

**Capabilities**:
- "What were today's sales?"
- "Which products are low on stock?"
- "What are my best sellers?"
- "Which products are losing money?"
- "How can I improve profit?"
- "Forecast next week's sales"

**Features**:
- Conversational context (last 10 messages)
- Quick responses (no AI call for simple queries)
- Suggested questions
- Formal tone, no emojis
- References actual data only

## Communication Rules

### Formal Tone Guidelines

✅ **Correct**:
- "The product requires restocking."
- "Revenue has increased by 15% this week."
- "This pricing adjustment will improve margins."

❌ **Incorrect**:
- "I think you should probably restock 😊"
- "Maybe increase the price?"
- "There's a 73% confidence that..."

### Data Binding Rules

✅ **Correct**:
- "Based on 47 sales in the last 30 days..."
- "Current stock is 12 units, with an average daily sale of 0.8 units..."
- "Product X has generated $450 in profit this week."

❌ **Incorrect**:
- "You probably sell about 10-15 units per week."
- "The database shows..."
- "According to our backend analytics..."

## Configuration

### Environment Variables

```env
# .env or .env.local
VITE_OPENROUTER_API_KEY=your_api_key_here
```

### Getting an API Key

1. Visit https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Add to `.env.local` file
5. Restart development server

### AI Settings

Located in `useAIStore`:
- `aiEnabled` - Master toggle (default: true)
- `autoRefreshEnabled` - Auto-refresh insights (default: true)
- `refreshInterval` - Refresh interval in minutes (default: 5)

## Integration Points

### Dashboard Page
- Profit insights panel
- Stock alerts panel
- Daily summary card
- AI chat widget

### Sales Entry Page
- Transaction validation (before submission)
- Error warning modal
- AI chat widget

### Future Integration Points
- Products page (price suggestions)
- Reports page (forecasting)
- Stock addition page (smart recommendations)

## Performance Optimization

### Caching Strategy
- **Service Level**: OpenRouter responses cached for 5 minutes
- **Store Level**: Insights cached with timestamps
- **Query Level**: React Query with stale time

### Request Throttling
- Maximum 50 cached responses in memory
- FIFO eviction when limit reached
- Cache cleared on logout

### Fallback Mechanisms
1. **Model Fallback**: 3 models tried in sequence
2. **AI Unavailable**: Rule-based fallbacks for all features
3. **Network Errors**: Graceful degradation with user messaging

## Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] Chat responds to questions
- [ ] Insights load on dashboard
- [ ] Daily summary generates
- [ ] Stock alerts appear for low stock items
- [ ] Price suggestions show for low-margin products

#### Error Prevention
- [ ] Warning shows when selling below cost
- [ ] Warning shows for insufficient stock
- [ ] Can proceed on warnings (not critical errors)
- [ ] Cannot proceed on critical errors (no stock)

#### Fallback Testing
- [ ] Works without API key (rule-based fallbacks)
- [ ] Handles API errors gracefully
- [ ] Model fallback works on timeout
- [ ] Cache works (repeat queries faster)

#### UI/UX
- [ ] Chat widget opens/closes smoothly
- [ ] Insights panel refreshes on demand
- [ ] Warning modal displays correctly
- [ ] Loading states show appropriately
- [ ] No console errors

### Test Scenarios

**Scenario 1: New Day**
1. Start app with no sales today
2. Check daily summary (should show zero activity)
3. Record a sale
4. Wait 1 minute
5. Insights should update

**Scenario 2: Low Stock**
1. Product with stock <= reorder level
2. Check dashboard
3. Stock alert should appear
4. Click "Add Stock" button
5. Should navigate to stock addition page

**Scenario 3: Selling Below Cost**
1. Create product with cost = 100, price = 80
2. Try to record sale
3. Warning modal should appear
4. Should show loss calculation
5. Can proceed with warning

**Scenario 4: Chat Interaction**
1. Open chat widget
2. Ask "What were today's sales?"
3. Should get immediate response (cached)
4. Ask "How can I improve profit?"
5. Should get AI-generated advice

## Security Considerations

### API Key Safety
- ✅ Stored in environment variables only
- ✅ Not logged to console
- ✅ Not exposed in network requests (in Authorization header)
- ✅ Not committed to version control

### Data Privacy
- ✅ All data processing happens client-side
- ✅ Only aggregated context sent to AI
- ✅ No sensitive customer data sent
- ✅ No PII (personally identifiable information) sent

### Rate Limiting
- OpenRouter handles rate limiting
- Client-side caching reduces requests
- Fallback models prevent lockout
- Graceful degradation on limits

## Troubleshooting

### Issue: "OpenRouter API key not configured"
**Solution**: Add `VITE_OPENROUTER_API_KEY` to `.env.local` and restart

### Issue: AI responses are slow
**Solution**: 
- Check network connection
- Verify API key is valid
- Check OpenRouter status page
- Enable caching (default)

### Issue: Insights not updating
**Solution**:
- Check auto-refresh is enabled
- Manually click "Refresh" button
- Clear browser cache
- Check console for errors

### Issue: Chat not responding
**Solution**:
- Check API key configuration
- Look for rule-based fallback responses
- Check browser console for errors
- Verify products/sales data is loaded

### Issue: Warning modal not appearing
**Solution**:
- Check `aiEnabled` setting
- Verify product data is loaded
- Check transaction validation logic
- Look for console errors

## Future Enhancements

### Planned Features
- [ ] Product performance comparison charts
- [ ] Competitive pricing insights
- [ ] Seasonal trend detection
- [ ] Customer segmentation analysis
- [ ] Inventory optimization algorithms
- [ ] Multi-language support
- [ ] Voice interface for chat
- [ ] Export AI reports to PDF

### Model Improvements
- [ ] Fine-tune prompts for better accuracy
- [ ] Add GPT-4 as premium option
- [ ] Implement streaming responses
- [ ] Add confidence scores (internal only)

### UX Improvements
- [ ] Onboarding tour for AI features
- [ ] Keyboard shortcuts for chat
- [ ] Insight notifications
- [ ] AI settings page
- [ ] Customizable insight panels

## Credits

**AI Models Powered By**: OpenRouter.ai
**Primary Model**: OpenAI GPT-4o-mini
**Fallback Models**: DeepSeek, Google Gemini
**Framework**: React + TypeScript + Zustand
**UI Components**: Tailwind CSS + Lucide Icons

## Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Test with fallback mode (no API key)
4. Check OpenRouter status page

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-25  
**Status**: Production Ready ✅
