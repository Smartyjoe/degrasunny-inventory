import api from './api'
import { delay, mockUser } from './mockData'
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  ApiResponse,
  OTPRequest,
  OTPVerificationRequest,
  OTPResponse,
  VerifyEmailResponse,
  ResendOTPRequest,
  ResetPasswordWithOTPRequest
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

  // Send email verification OTP
  sendEmailVerificationOTP: async (data: OTPRequest): Promise<OTPResponse> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'Verification code sent to your email.',
        expiresInMinutes: 10,
      }
    }

    const response = await api.post<ApiResponse<OTPResponse>>('/auth/send-email-verification-otp', data)
    return response.data.data
  },

  // Verify email with OTP
  verifyEmail: async (data: OTPVerificationRequest): Promise<VerifyEmailResponse> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'Email verified successfully.',
        user: { ...mockUser, emailVerified: true },
      }
    }

    const response = await api.post<ApiResponse<VerifyEmailResponse>>('/auth/verify-email', data)
    return response.data.data
  },

  // Send password reset OTP
  sendPasswordResetOTP: async (data: OTPRequest): Promise<OTPResponse> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'Password reset code sent to your email.',
        expiresInMinutes: 10,
      }
    }

    const response = await api.post<ApiResponse<OTPResponse>>('/auth/send-password-reset-otp', data)
    return response.data.data
  },

  // Verify password reset OTP
  verifyPasswordResetOTP: async (data: OTPVerificationRequest): Promise<{ message: string; verified: boolean }> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'OTP verified successfully.',
        verified: true,
      }
    }

    const response = await api.post<ApiResponse<{ message: string; verified: boolean }>>('/auth/verify-password-reset-otp', data)
    return response.data.data
  },

  // Reset password with OTP
  resetPasswordWithOTP: async (data: ResetPasswordWithOTPRequest): Promise<{ message: string }> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'Password reset successfully. Please login with your new password.',
      }
    }

    const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password-with-otp', data)
    return response.data.data
  },

  // Resend OTP
  resendOTP: async (data: ResendOTPRequest): Promise<OTPResponse> => {
    if (USE_MOCK_DATA) {
      await delay(800)
      return {
        message: 'New code sent to your email.',
        expiresInMinutes: 10,
      }
    }

    const response = await api.post<ApiResponse<OTPResponse>>('/auth/resend-otp', data)
    return response.data.data
  },
}
