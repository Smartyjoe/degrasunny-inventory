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
    const formData = new FormData()
    formData.append('logo', file)

    const response = await api.post<ApiResponse<{ storeLogo: string }>>('/store-settings/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.storeLogo
  },

  /**
   * Delete store logo
   */
  async deleteLogo(): Promise<void> {
    await api.delete('/store-settings/logo')
  },
}
