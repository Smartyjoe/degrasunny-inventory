import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),    
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),    
  confirmPassword: z.string(),
  businessName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),    
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  costPrice: z.number().min(0.01, 'Cost price must be greater than 0'),     
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),      
  isActive: z.boolean().default(true),
  isRetailEnabled: z.boolean().optional(),
  cupsPerBag: z.number().optional(),
  bucketsPerBag: z.number().optional(),
  cupPrice: z.number().optional(),
  bucketPrice: z.number().optional(),
}).refine((data) => {
  if (data.isRetailEnabled) {
    return (
      data.cupsPerBag &&
      data.bucketsPerBag &&
      data.cupPrice &&
      data.bucketPrice &&
      data.cupsPerBag > 0 &&
      data.bucketsPerBag > 0 &&
      data.cupPrice > 0 &&
      data.bucketPrice > 0
    )
  }
  return true
}, {
  message: 'All retail fields are required when retail is enabled',
  path: ['isRetailEnabled'],
})

export const saleSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  unit: z.enum(['bag', 'cup', 'bucket'], {
    errorMap: () => ({ message: 'Please select a valid unit' }),
  }),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),        
  paymentMethod: z.enum(['cash', 'pos', 'bank_transfer'], {
    errorMap: () => ({ message: 'Please select a payment method' }),        
  }),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export const stockAdditionSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.number().min(0.01, 'Cost price must be greater than 0'),     
  notes: z.string().optional(),
})

export const validatePositiveNumber = (value: number, fieldName: string): string | null => {
  if (isNaN(value) || value < 0) {
    return `${fieldName} must be a positive number`
  }
  return null
}

export const validateNonNegativeNumber = (value: number, fieldName: string): string | null => {
  if (isNaN(value) || value < 0) {
    return `${fieldName} cannot be negative`
  }
  return null
}

export const validateStockAvailability = (
  requestedQuantity: number,
  availableStock: number,
  unit: string
): string | null => {
  if (requestedQuantity > availableStock) {
    return `Insufficient stock. Only ${availableStock} ${unit}(s) available`
  }
  return null
}