import { Menu, Bell, LogOut, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const user = useAuthStore((state) => state.user)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    clearAuth()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.businessName || 'De Grasunny Inventory'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Manage your inventory and track profits
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="hidden sm:flex"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}

export default Header
