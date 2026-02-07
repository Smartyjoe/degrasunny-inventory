import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { storeSettingsService } from '../../services/storeSettingsService'
import { accountService } from '../../services/accountService'
import { useAuthStore } from '../../store/authStore'
import { StoreSettings } from '../../types'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)

  // Store Settings Form
  const [storeName, setStoreName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Account Form
  const [accountName, setAccountName] = useState(user?.name || '')

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Messages
  const [storeMessage, setStoreMessage] = useState('')
  const [accountMessage, setAccountMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settings = await storeSettingsService.getSettings()
      
      if (settings) {
        setStoreSettings(settings)
        setStoreName(settings.storeName)
        setLogoPreview(settings.storeLogo)
      } else {
        // Initialize with user's business name
        setStoreName(user?.businessName || user?.name + "'s Store" || '')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    if (storeSettings?.storeLogo) {
      try {
        await storeSettingsService.deleteLogo()
        setLogoPreview(null)
        setLogoFile(null)
        setStoreMessage('Logo removed successfully')
        setTimeout(() => setStoreMessage(''), 3000)
      } catch (error) {
        setStoreMessage('Failed to remove logo')
      }
    } else {
      setLogoPreview(null)
      setLogoFile(null)
    }
  }

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStoreMessage('')

    try {
      let logoUrl = storeSettings?.storeLogo || null

      // Upload logo if changed
      if (logoFile) {
        logoUrl = await storeSettingsService.uploadLogo(logoFile)
      }

      // Save settings
      const updated = await storeSettingsService.saveSettings({
        storeName,
        storeLogo: logoUrl,
      })

      setStoreSettings(updated)
      setLogoPreview(updated.storeLogo)
      setLogoFile(null)

      // IMPORTANT: Update the user's business name in the auth store
      if (user) {
        setUser({
          ...user,
          businessName: storeName,
        })
      }

      // Invalidate store settings cache to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ['store-settings'] })
      
      // Trigger sidebar refresh via custom event
      window.dispatchEvent(new CustomEvent('store-logo-updated', {
        detail: { logoUrl: updated.storeLogo }
      }))

      setStoreMessage('Store settings saved successfully!')
      setTimeout(() => setStoreMessage(''), 3000)
    } catch (error: any) {
      setStoreMessage(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setAccountMessage('')

    try {
      const updatedUser = await accountService.updateAccount({ name: accountName })
      setUser(updatedUser)
      setAccountMessage('Account updated successfully!')
      setTimeout(() => setAccountMessage(''), 3000)
    } catch (error: any) {
      setAccountMessage(error.response?.data?.message || 'Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    setPasswordMessage('')

    try {
      await accountService.resetPassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password reset successfully! Please login again.')
      
      // Logout after 2 seconds
      setTimeout(() => {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }, 2000)
    } catch (error: any) {
      setPasswordMessage(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store and account settings</p>
      </div>

      {/* Store Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Store Information</h2>
          
          <form onSubmit={handleSaveStore} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <Input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter store name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Logo
              </label>
              
              {logoPreview && (
                <div className="mb-3">
                  <img
                    src={logoPreview}
                    alt="Store logo"
                    className="h-32 w-32 object-contain border border-gray-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    Remove Logo
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG or JPG. Max 2MB.
              </p>
            </div>

            {storeMessage && (
              <div className={`text-sm ${storeMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {storeMessage}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Store Settings'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Account Management */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Management</h2>
          
          <form onSubmit={handleUpdateAccount} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <Input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {accountMessage && (
              <div className={`text-sm ${accountMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {accountMessage}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Update Account'}
            </Button>
          </form>

          <hr className="my-6" />

          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {passwordMessage && (
              <div className={`text-sm ${passwordMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMessage}
              </div>
            )}

            <Button type="submit" variant="danger" disabled={saving}>
              {saving ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
