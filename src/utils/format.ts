/**
 * Format utilities for currency, numbers, and dates
 */

// Currency formatting
export const formatCurrency = (amount: number, currency: string = '₦'): string => {
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Compact currency (e.g., 1.5K, 2.3M)
export const formatCompactCurrency = (amount: number, currency: string = '₦'): string => {
  if (amount >= 1_000_000) {
    return `${currency}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${currency}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
};

// Number formatting
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
};

// Today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Stock status helpers
export const getStockStatus = (currentStock: number, reorderLevel: number): 'healthy' | 'low' | 'out' => {
  if (currentStock === 0) return 'out';
  if (currentStock <= reorderLevel) return 'low';
  return 'healthy';
};

export const getStockStatusColor = (status: 'healthy' | 'low' | 'out'): string => {
  switch (status) {
    case 'healthy':
      return 'text-success-600 bg-success-50';
    case 'low':
      return 'text-warning-600 bg-warning-50';
    case 'out':
      return 'text-danger-600 bg-danger-50';
  }
};

// Profit calculations
export const calculateProfit = (sellingPrice: number, costPrice: number): number => {
  return sellingPrice - costPrice;
};

export const calculateProfitMargin = (sellingPrice: number, costPrice: number): number => {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
};

// Input sanitization
export const sanitizeNumberInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};
