import api from './api'
import { ApiResponse, StoreSettings, StoreSettingsFormData } from '../types'

export const storeSettingsService = {
  /**
   * Get store settings
   */
  async getSettings(): Promise<StoreSettings | null> {
    const response = await api.get<ApiResponse<StoreSettings | null>>('/store-settings')
    return response.data.data
  },

  /**
   * Create or update store settings
   */
  async saveSettings(data: StoreSettingsFormData): Promise<StoreSettings> {
    const response = await api.post<ApiResponse<StoreSettings>>('/store-settings', {
      store_name: data.storeName,
      store_logo: data.storeLogo,
    })
    return response.data.data
  },

  /**
   * Update store settings
   */
  async updateSettings(data: StoreSettingsFormData): Promise<StoreSettings> {
    const response = await api.put<ApiResponse<StoreSettings>>('/store-settings', {
      store_name: data.storeName,
      store_logo: data.storeLogo,
    })
    return response.data.data
  },

  /**
   * Upload store logo
   */
  async uploadLogo(file: File): Promise<string> {
    // Frontend validation BEFORE upload
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 25MB limit. Please choose a smaller image.')
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPG, PNG, or WEBP image.')
    }

    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await api.post<ApiResponse<{ storeLogo: string }>>('/store-settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for large files
      })
      return response.data.data.storeLogo
    } catch (error: any) {
      console.error('Upload logo error:', error)
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try a smaller file or check your connection.')
      }
      
      if (error.response?.status === 413) {
        throw new Error('File too large. Server rejected the upload.')
      }
      
      if (error.response?.status === 422) {
        const message = error.response.data.message || 'Validation failed'
        throw new Error(message)
      }
      
      if (error.response?.status === 500) {
        const errorMsg = error.response.data.error || 'Server error'
        throw new Error(`Upload failed: ${errorMsg}. Please check server logs.`)
      }
      
      throw new Error(error.response?.data?.message || 'Failed to upload logo. Please try again.')
    }
  },

  /**
   * Delete store logo
   */
  async deleteLogo(): Promise<void> {
    await api.delete('/store-settings/logo')
  },
}
