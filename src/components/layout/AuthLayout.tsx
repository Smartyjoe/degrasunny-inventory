import { Outlet } from 'react-router-dom'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children?: ReactNode
  title?: string
  subtitle?: string
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Smart Store Manager" 
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Store Manager</h1>
          <p className="text-gray-600 mt-1">Manage your inventory with ease</p>
        </div>

        {/* Auth Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {title ? (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle ? (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              ) : null}
            </div>
          ) : null}
          {children ?? <Outlet />}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © {currentYear} Smart Store Manager. All rights reserved.{' '}
          <a 
            href="https://smatatech.com.ng" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            Smatatech Technologies
          </a>
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
