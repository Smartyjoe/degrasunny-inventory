# Trader Inventory Dashboard

A professional, mobile-first inventory, pricing, and profit-tracking dashboard built for small and medium-scale traders. This application helps business owners manage products, track daily stock, record sales, and generate insightful reports.

## 🚀 Features

### Core Functionality
- **Product Management**: Add, edit, and manage inventory items with pricing and stock levels
- **Pricing Configuration**: Set cost price, selling price, and retail prices (cups/buckets)
- **Live Profit Calculations**: Automatic profit and margin calculations for all pricing tiers
- **Sales Entry**: Fast, calculator-like interface for recording sales
- **Stock Management**: Track daily stock movements, additions, and closing balances
- **Low Stock Alerts**: Automatic notifications when inventory reaches reorder levels
- **Reports & Analytics**: Visual charts and insights for business performance

### UI/UX Highlights
- ✅ Mobile-first responsive design
- ✅ Large, touch-friendly inputs and buttons
- ✅ Clean, minimal interface
- ✅ Real-time calculations
- ✅ Toast notifications for user feedback
- ✅ Optimistic UI updates
- ✅ Error prevention with inline validation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **React Router** for navigation
- **TailwindCSS** for styling

### State Management & Data
- **Zustand** for global state
- **React Query** for server state and caching
- **Axios** for API communication

### Forms & Validation
- **React Hook Form** for form handling
- **Zod** for schema validation

### Charts & Visualization
- **Recharts** for data visualization

### Icons & UI
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd trader-inventory-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card, etc.)
│   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   ├── auth/           # Authentication components
│   └── products/       # Product-specific components
├── pages/              # Page components
│   ├── auth/           # Login, Register, Forgot Password
│   ├── products/       # Products list and details
│   ├── sales/          # Sales entry
│   ├── stock/          # Stock management
│   └── reports/        # Reports and analytics
├── services/           # API services and mock data
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions (formatting, validation)
```

## 🎯 Key Pages

### Dashboard
- Today's sales and profit summary
- Low stock alerts
- Recent sales activity
- Quick action buttons

### Products
- Product list with search and filters
- Add/Edit product with pricing configuration
- Stock status indicators
- Retail pricing setup (cups/buckets)

### Sales Entry
- Quick product selection
- Unit selection (bag/cup/bucket)
- Real-time price and profit calculation
- Today's sales summary

### Stock Addition
- Add inventory with cost tracking
- View recent stock additions
- Automatic stock level updates

### Daily Stock
- View daily stock movements
- Opening, added, sold, and closing stock
- Stock status indicators
- Date range filtering

### Reports
- Sales and profit trends (charts)
- Top performing products
- Unit distribution analysis
- CSV export functionality

## 🔐 Authentication

The app includes a complete authentication flow:

**Demo Credentials:**
- Email: `trader@example.com`
- Password: `password`

### Features:
- Login with email/password
- User registration
- Forgot password flow
- Protected routes
- Persistent sessions (localStorage)

## 📊 Mock Data

The application currently uses mock data for development. All CRUD operations work with in-memory state, perfect for:
- Frontend development
- UI/UX testing
- Demonstrations
- Prototyping

To switch to a real backend, update the `USE_MOCK_DATA` flag in service files and ensure your API matches the expected endpoints.

## 🔌 API Integration

### Expected Backend Endpoints

```
Authentication:
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password
GET    /api/auth/me

Products:
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
PATCH  /api/products/:id/stock

Sales:
GET    /api/sales
POST   /api/sales
DELETE /api/sales/:id

Stock:
GET    /api/stock/daily
PUT    /api/stock/daily/:id
POST   /api/stock/add
GET    /api/stock/additions

Dashboard:
GET    /api/dashboard/stats
```

### API Request Format
All authenticated requests include:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```js
colors: {
  primary: { ... },
  success: { ... },
  danger: { ... },
  warning: { ... },
}
```

### Currency Symbol
Update the currency symbol in `src/utils/format.ts`:
```typescript
export const formatCurrency = (amount: number, currency: string = '₦')
```

### Business Logic
Modify calculation functions in `src/utils/format.ts` for custom:
- Profit calculations
- Margin calculations
- Stock status thresholds

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview production build:
```bash
npm run preview
```

## 📱 Mobile-First Design

The application is optimized for mobile devices with:
- Large touch targets (minimum 44x44px)
- Readable font sizes (minimum 16px for inputs)
- Responsive grid layouts
- Touch-friendly navigation
- Optimized for slow networks

## 🔧 Development Tools

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Component-based architecture

## 🎓 Learning Resources

This project demonstrates:
- Modern React patterns (hooks, context)
- TypeScript in React applications
- Form handling with validation
- API integration patterns
- State management with Zustand
- Server state with React Query
- Responsive design with Tailwind
- Data visualization with charts

## 📄 License

This project is open source and available for educational and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💡 Future Enhancements

Potential features for future versions:
- Multi-user support with roles
- Advanced reporting (weekly/monthly summaries)
- Invoice generation
- Barcode scanning
- Supplier management
- Purchase order tracking
- WhatsApp notifications
- Cloud backup
- Multi-currency support
- Dark mode

## 📞 Support

For questions or support, please open an issue on the repository.

---

Built with ❤️ for traders who want to grow their business with data-driven insights.
#   d e g r a s u n n y - i n v e n t o r y  
 