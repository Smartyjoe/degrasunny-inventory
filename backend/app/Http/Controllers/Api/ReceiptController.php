<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Get receipt data for a sale
     */
    public function show(Request $request, Sale $sale): JsonResponse
    {
        // Verify ownership - cast both to string to avoid type mismatch
        if ((string) $sale->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Receipt not found or access denied',
            ], 404);
        }

        $user = $request->user();
        $storeSetting = $user->storeSetting;

        // Build receipt data
        $receiptData = [
            'receiptId' => 'RCP-' . str_pad($sale->id, 6, '0', STR_PAD_LEFT),
            'date' => $sale->date->format('Y-m-d'),
            'time' => $sale->created_at->format('H:i:s'),
            'store' => [
                'name' => $storeSetting?->store_name ?? $user->business_name ?? $user->name . "'s Store",
                'logo' => $storeSetting?->store_logo ? asset('storage/' . $storeSetting->store_logo) : null,
            ],
            'sale' => [
                'id' => (string) $sale->id,
                'productName' => $sale->product ? $sale->product->name : 'Unknown Product',
                'quantity' => (float) $sale->quantity,
                'unit' => $sale->unit,
                'pricePerUnit' => (float) $sale->unit_price,
                'totalAmount' => (float) $sale->total_amount,
                'paymentMethod' => $this->formatPaymentMethod($sale->payment_method),
            ],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Receipt retrieved successfully',
            'data' => $receiptData,
        ]);
    }

    /**
     * Generate receipt HTML for printing/download
     */
    public function generateHtml(Request $request, Sale $sale): string
    {
        // Verify ownership - cast both to string to avoid type mismatch
        if ((string) $sale->user_id !== (string) $request->user()->id) {
            abort(404, 'Receipt not found');
        }

        $user = $request->user();
        $storeSetting = $user->storeSetting;

        $storeName = $storeSetting?->store_name ?? $user->business_name ?? $user->name . "'s Store";
        $storeLogo = $storeSetting?->store_logo ? asset('storage/' . $storeSetting->store_logo) : null;
        $receiptId = 'RCP-' . str_pad($sale->id, 6, '0', STR_PAD_LEFT);
        $productName = $sale->product ? $sale->product->name : 'Unknown Product';
        $paymentMethod = $this->formatPaymentMethod($sale->payment_method);

        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - {$receiptId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .receipt {
            border: 2px solid #000;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px dashed #000;
        }
        
        .store-logo {
            max-width: 150px;
            max-height: 100px;
            margin: 0 auto 10px;
            display: block;
        }
        
        .store-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .receipt-id {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .date-time {
            font-size: 12px;
            color: #666;
        }
        
        .items {
            margin: 20px 0;
            border-bottom: 2px dashed #000;
            padding-bottom: 15px;
        }
        
        .item-row {
            margin-bottom: 10px;
        }
        
        .item-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 3px;
        }
        
        .total-section {
            margin: 15px 0;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .total-row.grand-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 10px;
        }
        
        .payment-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px dashed #000;
            text-align: center;
        }
        
        .payment-method {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .receipt {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
HTML;

        if ($storeLogo) {
            $html .= <<<HTML
            <img src="{$storeLogo}" alt="Store Logo" class="store-logo">
HTML;
        }

        $html .= <<<HTML
            <div class="store-name">{$storeName}</div>
            <div class="receipt-id">{$receiptId}</div>
            <div class="date-time">{$sale->date->format('F d, Y')} at {$sale->created_at->format('h:i A')}</div>
        </div>
        
        <div class="items">
            <div class="item-row">
                <div class="item-name">{$productName}</div>
                <div class="item-details">
                    <span>Quantity:</span>
                    <span>{$sale->quantity} {$sale->unit}</span>
                </div>
                <div class="item-details">
                    <span>Price per {$sale->unit}:</span>
                    <span>KES {$sale->unit_price}</span>
                </div>
            </div>
        </div>
        
        <div class="total-section">
            <div class="total-row grand-total">
                <span>TOTAL:</span>
                <span>KES {$sale->total_amount}</span>
            </div>
        </div>
        
        <div class="payment-info">
            <div class="payment-method">Payment Method: {$paymentMethod}</div>
        </div>
        
        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated receipt</p>
        </div>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    /**
     * Download receipt as HTML
     */
    public function download(Request $request, Sale $sale)
    {
        $html = $this->generateHtml($request, $sale);
        $receiptId = 'RCP-' . str_pad($sale->id, 6, '0', STR_PAD_LEFT);
        
        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="receipt-' . $receiptId . '.html"');
    }

    /**
     * Format payment method for display
     */
    private function formatPaymentMethod(string $method): string
    {
        return match($method) {
            'cash' => 'Cash',
            'pos' => 'POS/Card',
            'bank_transfer' => 'Bank Transfer',
            default => ucfirst($method),
        };
    }
}
