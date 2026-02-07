import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/salesService'
import { SaleFormData } from '@/types'
import toast from 'react-hot-toast'

export const useSales = (filters?: { startDate?: string; endDate?: string; productId?: string }) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => salesService.getSales(filters),
  })
}

export const useTodaySales = () => {
  return useQuery({
    queryKey: ['sales', 'today'],
    queryFn: () => salesService.getTodaySales(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SaleFormData) => salesService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      toast.success('Sale recorded successfully')
    },
  })
}

export const useUpdateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SaleFormData> }) =>
      salesService.updateSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      toast.success('Sale updated successfully')
    },
  })
}

export const useDeleteSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      toast.success('Sale deleted successfully')
    },
  })
}
