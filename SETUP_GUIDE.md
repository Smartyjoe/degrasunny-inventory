# Quick Setup Guide

This guide will help you get the Trader Inventory Dashboard up and running in minutes.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** version 18 or higher
- **npm** or **yarn** package manager

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

## Installation Steps

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- React, React Router, React Query
- TailwindCSS for styling
- Zustand for state management
- React Hook Form & Zod for forms
- Recharts for data visualization
- And more...

### 2. Start the Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 3. Open in Browser

Navigate to `http://localhost:3000` in your web browser.

### 4. Login with Demo Credentials

On the login page, use:
- **Email**: `trader@example.com`
- **Password**: `password`

## What's Included

The application comes with **mock data** pre-loaded:

### Products
- Rice (50kg bag) - 45 bags in stock
- Beans (25kg bag) - 8 bags (low stock)
- Garri (50kg bag) - 30 bags
- Groundnut Oil (25L keg) - Out of stock
- Palm Oil (25L keg) - 22 bags

### Today's Sales
- 3 recent sales transactions
- Total sales: ₦122,750
- Total profit: ₦23,500

### Features Available
✅ Dashboard with stats
✅ Product management (CRUD)
✅ Sales entry with calculator-like interface
✅ Stock addition and tracking
✅ Daily stock movements
✅ Reports with charts
✅ CSV export

## Testing the Application

### 1. Explore the Dashboard
- View today's sales and profit
- Check low stock alerts
- See recent transactions

### 2. Try Adding a Product
1. Go to **Products** page
2. Click **Add Product**
3. Fill in the form with:
   - Name: "Test Product"
   - Cost Price: 10000
   - Selling Price: 12000
   - Enable retail sales (optional)
4. Click **Create Product**

### 3. Record a Sale
1. Go to **Sales Entry**
2. Select a product
3. Choose unit (bag/cup/bucket)
4. Enter quantity
5. See real-time calculation
6. Click **Record Sale**

### 4. Add Stock
1. Go to **Add Stock**
2. Select a product
3. Enter quantity and cost
4. Add notes (optional)
5. Click **Add Stock**

### 5. View Reports
1. Go to **Reports**
2. Adjust date range
3. View charts and analytics
4. Export data as CSV

## Common Issues

### Port Already in Use

If port 3000 is busy, Vite will automatically use the next available port (3001, 3002, etc.).

Or specify a custom port:
```bash
npm run dev -- --port 3500
```

### Clear Cache

If you encounter issues, try:
```bash
rm -rf node_modules
npm install
```

### Build Issues

Ensure TypeScript types are correct:
```bash
npm run build
```

## Project Structure Overview

```
src/
├── pages/           # All page components
│   ├── auth/       # Login, Register, Forgot Password
│   ├── products/   # Products list and details
│   ├── sales/      # Sales entry
│   ├── stock/      # Stock management
│   └── reports/    # Analytics and reports
├── components/      # Reusable components
│   ├── ui/         # Base components (Button, Input, etc.)
│   └── layout/     # Layout components (Sidebar, Header)
├── services/        # API and mock data
├── hooks/          # Custom React hooks
├── store/          # Zustand state management
└── utils/          # Helper functions
```

## Next Steps

### Using with a Real Backend

1. Update the API URL in `.env`:
```env
VITE_API_BASE_URL=https://your-api.com/api
```

2. Change `USE_MOCK_DATA` to `false` in service files:
```typescript
// src/services/productService.ts
const USE_MOCK_DATA = false
```

3. Ensure your backend matches the expected API endpoints (see README.md)

### Customization

- **Colors**: Edit `tailwind.config.js`
- **Currency**: Update `src/utils/format.ts`
- **Logo**: Replace logo in `src/components/layout/`
- **Business Name**: Update in login/register pages

## Production Build

To create a production build:

```bash
npm run build
```

Output will be in `dist/` directory.

Preview the build:
```bash
npm run preview
```

## Getting Help

- Check the main **README.md** for detailed documentation
- Review the **API Integration** section for backend requirements
- Inspect browser console for errors
- Check the terminal for build errors

## Tips for Best Experience

1. **Use Chrome/Edge** for best compatibility
2. **Test on mobile** - the app is mobile-first
3. **Open DevTools** to see network requests
4. **Check the console** for helpful logs
5. **Use keyboard navigation** - inputs are keyboard-friendly

---

Enjoy building your inventory management system! 🚀
