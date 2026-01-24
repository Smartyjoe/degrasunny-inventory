# Quick Reference Guide

## 🚀 Getting Started in 30 Seconds

```bash
npm install
npm run dev
```

Login: `trader@example.com` / `password`

## 📍 Main Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard` | Overview, stats, alerts |
| Products | `/products` | Manage inventory items |
| Sales Entry | `/sales` | Record new sales |
| Add Stock | `/stock-addition` | Increase inventory |
| Daily Stock | `/daily-stock` | Track stock movements |
| Reports | `/reports` | Analytics & charts |

## 🎯 Common Tasks

### Add a New Product
1. Go to **Products**
2. Click **Add Product**
3. Fill: Name, Cost Price, Selling Price
4. Optional: Enable retail (cups/buckets)
5. Set reorder level
6. Click **Create Product**

### Record a Sale
1. Go to **Sales Entry**
2. Select product
3. Choose unit (bag/cup/bucket)
4. Enter quantity
5. Review total & profit
6. Click **Record Sale**

### Add Stock
1. Go to **Add Stock**
2. Select product
3. Enter quantity & cost
4. Add notes (optional)
5. Click **Add Stock**

### View Reports
1. Go to **Reports**
2. Select date range
3. View charts & stats
4. Click **Export CSV** to download

## 💡 Key Features

### Live Calculations
✓ Profit calculated automatically
✓ Margin percentage shown
✓ Retail pricing computed
✓ Total amounts real-time

### Stock Alerts
✓ Dashboard shows low stock count
✓ Red badges for out of stock
✓ Yellow badges for low stock
✓ Green badges for healthy stock

### Smart Validation
✓ Cannot sell more than stock
✓ Prices must be positive
✓ Selling price > cost price
✓ All required fields enforced

## 🎨 UI Components

### Buttons
```tsx
<Button>Primary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button isLoading>Loading...</Button>
```

### Inputs
```tsx
<Input label="Name" placeholder="Enter name" />
<Input type="number" error="Error message" />
<Select options={[...]} />
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## 🔧 Customization

### Change Currency
Edit `src/utils/format.ts`:
```typescript
export const formatCurrency = (amount: number, currency: string = '₦')
```

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: { 500: '#0ea5e9', ... },
}
```

### API URL
Edit `.env`:
```env
VITE_API_BASE_URL=https://your-api.com/api
```

## 📊 Mock Data

### Products (5 items)
- Rice (50kg bag) - 45 bags
- Beans (25kg bag) - 8 bags (low)
- Garri (50kg bag) - 30 bags
- Groundnut Oil - 0 bags (out)
- Palm Oil (25L keg) - 22 bags

### Today's Sales
- 3 transactions
- ₦122,750 total
- ₦23,500 profit

## 🎓 Tips & Tricks

### Fast Sales Entry
1. Tab through fields for speed
2. Cost/selling price auto-fills
3. Hit Enter to submit
4. Form resets after sale

### Product Search
- Type in search box on Products page
- Filters instantly as you type
- Case-insensitive matching

### Date Filters
- Daily Stock: View any past date
- Reports: Select date range
- Defaults to today/last 7 days

### Stock Status
- **Green**: Above reorder level
- **Yellow**: At or below reorder level
- **Red**: Out of stock (0)

## 🐛 Troubleshooting

### Port Already Used
```bash
npm run dev -- --port 3500
```

### Build Errors
```bash
rm -rf node_modules
npm install
```

### Can't See Changes
- Hard refresh: Ctrl+Shift+R
- Clear cache
- Restart dev server

## 📱 Mobile Usage

### Best Practices
✓ Use in portrait mode
✓ Tap on large buttons
✓ Sidebar auto-collapses
✓ Tables scroll horizontally

### Gestures
- Swipe to scroll tables
- Tap menu icon for sidebar
- Pull to refresh (browser)

## 🔐 Security

### Demo Mode
- Uses mock data (local)
- No real backend calls
- Data persists in browser
- Safe to experiment

### Production Mode
- Enable real API
- Add proper authentication
- Use HTTPS
- Implement rate limiting

## 📈 Performance

### Optimizations
✓ React Query caching (5 min)
✓ Optimistic UI updates
✓ Code splitting ready
✓ Lazy loading ready

### Best Practices
- Keep products < 1000
- Archive old sales
- Export reports regularly
- Clear browser cache monthly

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Next field |
| Enter | Submit form |
| Esc | Close modal |
| / | Focus search (planned) |

## 📦 Export Data

### CSV Export
1. Go to **Reports**
2. Select date range
3. Click **Export CSV**
4. File downloads automatically

### Format
```csv
Date,Product,Unit,Quantity,Price,Total,Profit
2024-01-24,Rice,bag,3,30000,90000,15000
```

## 🔗 Quick Links

- [Full Documentation](README.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Project Summary](PROJECT_SUMMARY.md)

## 💬 Common Questions

**Q: Can I use offline?**  
A: Currently no, but PWA support can be added.

**Q: How to backup data?**  
A: Export CSV regularly. Cloud backup requires backend.

**Q: Mobile app available?**  
A: Web app works on mobile. Native app can be built.

**Q: Multiple users?**  
A: Single user now. Multi-user requires backend changes.

**Q: Different languages?**  
A: English only. i18n can be added with react-i18next.

**Q: Print reports?**  
A: Use browser print (Ctrl+P) or export CSV.

---

**Need Help?** Check README.md or open an issue on GitHub.

**Ready to Start?** Run `npm run dev` and login! 🚀
