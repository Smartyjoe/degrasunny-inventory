import api from './api'
import { ApiResponse, User, UpdateAccountData, ResetPasswordData } from '../types'

export const accountService = {
  /**
   * Update account name
   */
  async updateAccount(data: UpdateAccountData): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/account', data)
    return response.data.data
  },

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<{ token: string }> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/reset-password', data)
    return response.data.data
  },
}
