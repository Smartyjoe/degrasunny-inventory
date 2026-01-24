import api from './api'
import { delay, mockUser } from './mockData'
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  ApiResponse 
} from '@/types'

// Use mock data for development
const USE_MOCK_DATA = false

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      
      // Mock validation
      if (credentials.email === 'trader@example.com' && credentials.password === 'password') {
        const token = 'mock-jwt-token-' + Date.now()
        return {
          user: mockUser,
          token,
        }
      }
      throw new Error('Invalid credentials')
    }
    
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return response.data.data
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      
      const newUser = {
        ...mockUser,
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        businessName: data.businessName,
        createdAt: new Date().toISOString(),
      }
      
      const token = 'mock-jwt-token-' + Date.now()
      return {
        user: newUser,
        token,
      }
    }
    
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'Password reset link sent to your email',
      }
    }
    
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
    return response.data.data
  },

  // Logout
  logout: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      await delay(300)
      return
    }
    
    await api.post('/auth/logout')
  },

  // Get current user
  getCurrentUser: async () => {
    if (USE_MOCK_DATA) {
      await delay(300)
      return mockUser
    }
    
    const response = await api.get<ApiResponse<typeof mockUser>>('/auth/me')
    return response.data.data
  },
}
