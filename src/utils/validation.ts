import { z } from 'zod'

// Auth Validation Schemas
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
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Product Validation Schemas
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  costPrice: z.number().min(0.01, 'Cost price must be greater than 0'),
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  isRetailEnabled: z.boolean(),
  cupsPerBag: z.number().optional(),
  bucketsPerBag: z.number().optional(),
  cupPrice: z.number().optional(),
  bucketPrice: z.number().optional(),
  reorderLevel: z.number().min(0, 'Reorder level must be 0 or greater'),
}).superRefine((data, ctx) => {
  // Validate selling price is greater than cost price
  if (data.sellingPrice <= data.costPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selling price must be greater than cost price',
      path: ['sellingPrice'],
    })
  }

  // Validate retail fields if retail is enabled
  if (data.isRetailEnabled) {
    if (!data.cupsPerBag || data.cupsPerBag <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cups per bag is required when retail is enabled',
        path: ['cupsPerBag'],
      })
    }
    if (!data.cupPrice || data.cupPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cup price is required when retail is enabled',
        path: ['cupPrice'],
      })
    }
  }
})

// Sales Validation Schema
export const saleSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  unit: z.enum(['bag', 'cup', 'bucket'], {
    errorMap: () => ({ message: 'Please select a valid unit' }),
  }),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
})

// Stock Addition Validation Schema
export const stockAdditionSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.number().min(0.01, 'Cost price must be greater than 0'),
  notes: z.string().optional(),
})

// Daily Stock Validation Schema
export const dailyStockSchema = z.object({
  openingStock: z.number().min(0, 'Opening stock cannot be negative'),
  stockAdded: z.number().min(0, 'Stock added cannot be negative'),
  closingStock: z.number().min(0, 'Closing stock cannot be negative'),
})

// Utility validation functions
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
