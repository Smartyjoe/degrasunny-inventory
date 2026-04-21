<?php

namespace App\Services;

use App\Models\Receipt;
use App\Models\Sale;
use App\Models\Product;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReceiptService
{
    public function __construct(private PricingService $pricingService)
    {
    }

    public function createReceipt(array $data): Receipt
    {
        return DB::transaction(function () use ($data) {
            $user = auth()->user();
            $now = now();

            $lastReceipt = Receipt::where('user_id', $user->id)
                ->orderBy('receipt_number', 'desc')
                ->first();
            
            $nextNumber = 1;
            if ($lastReceipt && preg_match('/RCP-(\d+)/', $lastReceipt->receipt_number, $matches)) {
                $nextNumber = (int)$matches[1] + 1;
            }
            
            $receiptNumber = 'RCP-' . str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);

            $receipt = Receipt::create([
                'receipt_number' => $receiptNumber,
                'user_id' => $user->id,
                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'total_amount' => 0,
                'total_profit' => 0,
                'date' => $now->toDateString(),
                'time' => $now->format('H:i:s'),
            ]);

            $totalAmount = 0;
            $totalProfit = 0;

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = (float) $item['quantity'];
                $unit = $item['unit'];

                $pricing = $this->pricingService->calculateProfit($product, $unit, $quantity);

                $unitPrice = $pricing['unit_price'];
                $total = $pricing['total_amount'];
                $costEquivalent = $pricing['cost_equivalent'];
                $profit = $pricing['profit'];

                $sale = Sale::create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit' => $unit,
                    'unit_price' => $unitPrice,
                    'total_amount' => $total,
                    'cost_equivalent' => $costEquivalent,
                    'profit' => $profit,
                    'date' => $now->toDateString(),
                    'payment_method' => $data['payment_method'] ?? 'cash',
                    'description' => $item['description'] ?? null,
                    'receipt_id' => $receipt->id,
                ]);

                $totalAmount += $total;
                $totalProfit += $profit;
            }

            $receipt->update([
                'total_amount' => $totalAmount,
                'total_profit' => $totalProfit,
            ]);

            return $receipt->fresh(['items.product']);
        });
    }
}