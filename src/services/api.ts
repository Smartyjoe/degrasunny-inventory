import axios, { AxiosInstance, AxiosError } from 'axios'
import toast from 'react-hot-toast'

interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Extract error message from response
function getErrorMessage(error: AxiosError<ApiErrorResponse>): string {
  const data = error.response?.data
  
  // Check for validation errors (Laravel style)
  if (data?.errors) {
    const firstField = Object.keys(data.errors)[0]
    if (firstField && data.errors[firstField]?.[0]) {
      return data.errors[firstField][0]
    }
  }
  
  // Check for direct message
  if (data?.message) {
    return data.message
  }
  
  // Check for error key
  if (data?.error) {
    return data.error
  }
  
  // Fallback to axios error message
  return error.message || 'An error occurred'
}

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message = getErrorMessage(error)
    const status = error.response?.status
    
    // Handle specific error codes
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 404) {
      toast.error('Resource not found.')
    } else if (status === 422) {
      // Validation errors - show toast to prevent silent failures
      toast.error(message)
      console.warn('Validation error:', message)
    } else if (status === 429) {
      toast.error('Too many requests. Please wait a moment.')
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status !== 422) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api
