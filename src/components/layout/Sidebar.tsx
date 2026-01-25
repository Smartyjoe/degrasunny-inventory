import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText,
  Box,
  PlusCircle,
  Settings,
  X
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { storeSettingsService } from '@/services/storeSettingsService'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Sales Entry', href: '/sales', icon: ShoppingCart },
  { name: 'Daily Stock', href: '/daily-stock', icon: Box },
  { name: 'Add Stock', href: '/stock-addition', icon: PlusCircle },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const user = useAuthStore((state) => state.user)
  const [storeLogo, setStoreLogo] = useState<string | null>(null)
  const [storeName, setStoreName] = useState('Store Manager')

  // Fetch store settings for logo
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const settings = await storeSettingsService.getSettings()
        if (settings && settings.storeLogo) {
          setStoreLogo(settings.storeLogo)
        }
        if (settings && settings.storeName) {
          setStoreName(settings.storeName)
        }
      } catch (error) {
        // Use defaults if no settings found
        console.log('Using default store settings')
      }
    }

    if (user) {
      fetchStoreSettings()
    }
  }, [user])

  // Use business name if available, otherwise use fetched store name
  const displayName = user?.businessName || storeName

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <img 
                  src={storeLogo} 
                  alt="Store Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <img 
                  src="/logo.png" 
                  alt="Default Store Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              )}
              <span className="text-lg font-bold text-gray-900 truncate">
                {displayName}
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={user?.businessName || displayName}>
                  {user?.businessName || displayName}
                </p>
                <p className="text-xs text-gray-500 truncate" title={user?.email}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
