import { 
  Product, 
  Sale, 
  StockAddition,
  DashboardStats,
  User 
} from '@/types'

// Mock User
export const mockUser: User = {
  id: '1',
  email: 'trader@example.com',
  name: 'John Trader',
  businessName: 'John\'s Trading Store',
  createdAt: '2024-01-01T00:00:00Z',
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Rice (50kg bag)',
    description: 'Premium quality long grain rice',
    category: 'Grains',
    currentStock: 45,
    costPrice: 25000,
    sellingPrice: 30000,
    isRetailEnabled: true,
    cupsPerBag: 100,
    bucketsPerBag: 10,
    cupPrice: 350,
    bucketPrice: 3200,
    reorderLevel: 10,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Beans (25kg bag)',
    description: 'Fresh brown beans',
    category: 'Legumes',
    currentStock: 8,
    costPrice: 18000,
    sellingPrice: 22000,
    isRetailEnabled: true,
    cupsPerBag: 50,
    bucketsPerBag: 5,
    cupPrice: 500,
    bucketPrice: 4800,
    reorderLevel: 10,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'Garri (50kg bag)',
    description: 'White garri from Benin',
    category: 'Grains',
    currentStock: 30,
    costPrice: 15000,
    sellingPrice: 18500,
    isRetailEnabled: true,
    cupsPerBag: 80,
    bucketsPerBag: 8,
    cupPrice: 250,
    bucketPrice: 2400,
    reorderLevel: 15,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Groundnut Oil (25L keg)',
    description: 'Pure groundnut oil',
    category: 'Oils',
    currentStock: 0,
    costPrice: 35000,
    sellingPrice: 42000,
    isRetailEnabled: false,
    reorderLevel: 5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '5',
    name: 'Palm Oil (25L keg)',
    description: 'Red palm oil',
    category: 'Oils',
    currentStock: 22,
    costPrice: 28000,
    sellingPrice: 34000,
    isRetailEnabled: false,
    reorderLevel: 8,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
]

// Mock Sales
export const mockSales: Sale[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Rice (50kg bag)',
    unit: 'bag',
    quantity: 3,
    pricePerUnit: 30000,
    totalAmount: 90000,
    profit: 15000,
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    productId: '1',
    productName: 'Rice (50kg bag)',
    unit: 'cup',
    quantity: 25,
    pricePerUnit: 350,
    totalAmount: 8750,
    profit: 2500,
    paymentMethod: 'pos',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    productId: '2',
    productName: 'Beans (25kg bag)',
    unit: 'bucket',
    quantity: 5,
    pricePerUnit: 4800,
    totalAmount: 24000,
    profit: 6000,
    paymentMethod: 'bank_transfer',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
]

// Mock Daily Stock (type removed - using dynamic typing)
export const mockDailyStock: any[] = [
  {
    id: '1',
    productId: '1',
    date: new Date().toISOString().split('T')[0],
    openingStock: 50,
    stockAdded: 0,
    stockSold: 5,
    closingStock: 45,
  },
  {
    id: '2',
    productId: '2',
    date: new Date().toISOString().split('T')[0],
    openingStock: 10,
    stockAdded: 0,
    stockSold: 2,
    closingStock: 8,
  },
  {
    id: '3',
    productId: '3',
    date: new Date().toISOString().split('T')[0],
    openingStock: 30,
    stockAdded: 5,
    stockSold: 5,
    closingStock: 30,
  },
]

// Mock Stock Additions
export const mockStockAdditions: StockAddition[] = [
  {
    id: '1',
    productId: '3',
    productName: 'Garri (50kg bag)',
    quantity: 5,
    stockBefore: 10,
    stockAfter: 15,
    costPrice: 15000,
    totalCost: 75000,
    date: new Date().toISOString().split('T')[0],
    notes: 'Restocked from main supplier',
    createdAt: new Date().toISOString(),
  },
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  todaySales: 122750,
  todayProfit: 23500,
  todaySalesCount: 3,
  cashSales: 90000,
  posSales: 8750,
  bankTransferSales: 24000,
  lowStockCount: 2,
  totalProducts: 5,
  activeProducts: 5,
}

// Helper to simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))
