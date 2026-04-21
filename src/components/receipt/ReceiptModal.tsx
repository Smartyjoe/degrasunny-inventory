import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import Button from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { receiptService } from '../../services/receiptService'
import { Receipt } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'
import { Download, Printer, X } from 'lucide-react'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  saleId: string
}

export function ReceiptModal({ isOpen, onClose, saleId }: ReceiptModalProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && saleId) {
      loadReceipt()
    }
  }, [isOpen, saleId])

  const loadReceipt = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await receiptService.getReceipt(saleId)
      setReceipt(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load receipt')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    receiptService.downloadReceipt(saleId)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt">
      <div className="p-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {receipt && (
          <>
            {/* Receipt Content */}
            <div id="receipt-content" className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 print:border-0">
              {/* Header */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                {receipt.store.logo && (
                  <img
                    src={receipt.store.logo}
                    alt="Store Logo"
                    className="h-20 w-20 object-contain mx-auto mb-3"
                  />
                )}
                <h2 className="text-xl font-bold text-gray-900">{receipt.store.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{receipt.receiptId}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(receipt.date)} at {receipt.time}
                </p>
              </div>

              {/* Items */}
              <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900">
                    {receipt.sale.productName}
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Quantity:</span>
                    <span>{receipt.sale.quantity} {receipt.sale.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Price per {receipt.sale.unit}:</span>
                    <span>{formatCurrency(receipt.sale.pricePerUnit)}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(receipt.sale.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t-2 border-dashed border-gray-300 pt-4 text-center">
                <p className="font-semibold text-gray-900 mb-1">
                  Payment Method: {receipt.sale.paymentMethod}
                </p>
                {receipt.sale.description && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    Note: {receipt.sale.description}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated receipt</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 print:hidden">
              <Button onClick={handlePrint} variant="secondary" className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload} variant="primary" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={onClose} variant="secondary">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  )
}
