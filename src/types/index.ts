// User & Auth Types
export interface User {
  id: string
  email: string
  name: string
  businessName?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  businessName?: string
}

// Product Types
export interface Product {
  id: string
  name: string
  description?: string
  currentStock: number
  costPrice: number
  sellingPrice: number
  isRetailEnabled: boolean
  cupsPerBag?: number
  bucketsPerBag?: number
  cupPrice?: number
  bucketPrice?: number
  reorderLevel: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  description?: string
  costPrice: number
  sellingPrice: number
  isRetailEnabled: boolean
  cupsPerBag?: number
  bucketsPerBag?: number
  cupPrice?: number
  bucketPrice?: number
  reorderLevel: number
}

// Stock Types
export interface DailyStock {
  id: string
  productId: string
  date: string
  openingStock: number
  stockAdded: number
  stockSold: number
  closingStock: number
}

export interface StockAddition {
  id: string
  productId: string
  quantity: number
  costPrice: number
  totalCost: number
  date: string
  notes?: string
}

// Sales Types
export type SaleUnit = 'bag' | 'cup' | 'bucket'

export interface Sale {
  id: string
  productId: string
  productName: string
  unit: SaleUnit
  quantity: number
  pricePerUnit: number
  totalAmount: number
  profit: number
  date: string
  createdAt: string
}

export interface SaleFormData {
  productId: string
  unit: SaleUnit
  quantity: number
}

// Dashboard Stats Types
export interface DashboardStats {
  todaySales: number
  todayProfit: number
  todaySalesCount: number
  lowStockCount: number
  totalProducts: number
  activeProducts: number
}

// Report Types
export interface DailySummary {
  date: string
  totalSales: number
  totalProfit: number
  salesCount: number
  topProduct: string
}

export interface WeeklySummary {
  weekStart: string
  weekEnd: string
  totalSales: number
  totalProfit: number
  salesCount: number
  dailyBreakdown: DailySummary[]
}

export interface MonthlySummary {
  month: string
  year: number
  totalSales: number
  totalProfit: number
  salesCount: number
  weeklyBreakdown: WeeklySummary[]
}

export interface ProductPerformance {
  productId: string
  productName: string
  totalSales: number
  totalProfit: number
  quantitySold: number
  salesCount: number
}

export interface ChartData {
  date: string
  sales: number
  profit: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// Filter & Sorting Types
export interface DateRange {
  startDate: string
  endDate: string
}

export type SortOrder = 'asc' | 'desc'

export interface ProductFilters {
  search?: string
  isActive?: boolean
  lowStock?: boolean
}
