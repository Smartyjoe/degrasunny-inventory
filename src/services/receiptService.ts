import api from './api'
import { ApiResponse, Receipt } from '../types'

export const receiptService = {
  /**
   * Get receipt data for a sale
   */
  async getReceipt(saleId: string): Promise<Receipt> {
    const response = await api.get<ApiResponse<Receipt>>(`/receipts/${saleId}`)
    return response.data.data
  },

  /**
   * Get receipt download URL
   */
  getDownloadUrl(saleId: string): string {
    const token = localStorage.getItem('auth_token')
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    return `${baseURL}/receipts/${saleId}/download?token=${token}`
  },

  /**
   * Download receipt
   */
  downloadReceipt(saleId: string): void {
    const url = this.getDownloadUrl(saleId)
    window.open(url, '_blank')
  },
}
