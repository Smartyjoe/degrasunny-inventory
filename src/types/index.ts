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
export type SaleUnit = 'bag' | 'cup' | 'bucket'
export type PaymentMethod = 'cash' | 'pos' | 'bank_transfer'

export interface Product {
  id: string
  name: string
  description?: string
  category: string
  currentStock: number
  costPrice: number
  sellingPrice: number
  reorderLevel: number
  isActive: boolean
  isRetailEnabled?: boolean
  cupsPerBag?: number
  bucketsPerBag?: number
  cupPrice?: number
  bucketPrice?: number
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  description?: string
  category: string
  costPrice: number
  sellingPrice: number
  reorderLevel: number
  isActive: boolean
  isRetailEnabled?: boolean
  cupsPerBag?: number
  bucketsPerBag?: number
  cupPrice?: number
  bucketPrice?: number
}

// Sales Types
export interface Sale {
  id: string
  productId: string
  productName: string
  unit: SaleUnit
  quantity: number
  pricePerUnit: number
  totalAmount: number
  profit: number
  paymentMethod: PaymentMethod
  date: string
  createdAt: string
}

export interface SaleFormData {
  productId: string
  unit: SaleUnit
  quantity: number
  paymentMethod: PaymentMethod
}

// Stock Types
export interface StockLedger {
  id: string
  productId: string
  productName: string
  date: string
  openingStock: number
  stockAdded: number
  stockSold: number
  closingStock: number
  manuallyEdited: boolean
}

export interface StockAddition {
  id: string
  productId: string
  productName: string
  quantity: number
  stockBefore?: number
  stockAfter?: number
  costPrice: number
  totalCost?: number
  date: string
  notes?: string
  createdAt?: string
}

// Dashboard Types
export interface DashboardStats {
  todaySales: number
  todayProfit: number
  todaySalesCount: number
  cashSales: number
  posSales: number
  bankTransferSales: number
  lowStockCount: number
  totalProducts: number
  activeProducts: number
}

// Report Types
export interface ReportSummary {
  totalSales: number
  totalProfit: number
  salesCount: number
  paymentBreakdown: {
    cash: number
    pos: number
    bankTransfer: number
  }
  chartData: ChartDataPoint[]
  topProducts: ProductPerformance[]
}

export interface ChartDataPoint {
  date: string
  sales: number
  profit: number
}

export interface ProductPerformance {
  productId: string
  productName: string
  totalSales: number
  totalProfit: number
  quantitySold: number
  salesCount: number
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

// Store Settings Types
export interface StoreSettings {
  id: string
  storeName: string
  storeLogo: string | null
  createdAt: string
  updatedAt: string
}

export interface StoreSettingsFormData {
  storeName: string
  storeLogo?: string | null
}

// Receipt Types
export interface Receipt {
  receiptId: string
  date: string
  time: string
  store: {
    name: string
    logo: string | null
  }
  sale: {
    id: string
    productName: string
    quantity: number
    unit: SaleUnit
    pricePerUnit: number
    totalAmount: number
    paymentMethod: string
  }
}

// Account Types
export interface UpdateAccountData {
  name: string
}

export interface ResetPasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
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
