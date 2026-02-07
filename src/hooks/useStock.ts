import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockService } from '@/services/stockService'
import { StockAddition } from '@/types'
import toast from 'react-hot-toast'

export const useDailyStock = (date: string) => {
  return useQuery({
    queryKey: ['stock', 'daily', date],
    queryFn: () => stockService.getDailyStock(date),
    enabled: !!date,
  })
}

export const useUpdateDailyStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      stockService.updateDailyStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'daily'] })
      toast.success('Daily stock updated')
    },
  })
}

export const useAddStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<StockAddition, 'id' | 'totalCost'>) => stockService.addStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock added successfully')
    },
  })
}

export const useStockAdditions = (filters?: { startDate?: string; endDate?: string; productId?: string }) => {
  return useQuery({
    queryKey: ['stock', 'additions', filters],
    queryFn: () => stockService.getStockAdditions(filters),
  })
}

export const useUpdateStockAddition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<StockAddition, 'id' | 'totalCost'>> }) =>
      stockService.updateStockAddition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock addition updated successfully')
    },
  })
}
