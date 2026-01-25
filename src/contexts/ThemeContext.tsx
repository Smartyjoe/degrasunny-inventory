/**
 * Theme Context
 * Manages dark/light mode state across the application
 * Single source of truth for theme state
 */

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  // Check localStorage first
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  
  // Fallback to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  return 'light'
}

// Apply theme to DOM - single source of truth
const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
  
  // Set data-theme attribute for custom CSS
  root.setAttribute('data-theme', theme)
  
  // Set color-scheme for native elements (scrollbars, form controls)
  root.style.colorScheme = theme
  
  // Persist to localStorage
  localStorage.setItem('theme', theme)
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // Apply theme immediately on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
