@extends('emails.layout')

@section('title', 'Weekly Sales Report - ' . $storeName)

@section('content')
    <div class="greeting">
        Hello {{ $user->name }},
    </div>

    <div class="content">
        <p>Here's your weekly sales performance report for <strong>{{ $storeName }}</strong> from {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }} to {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}.</p>
    </div>

    <!-- Summary Cards -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Total Sales</div>
            <div style="font-size: 28px; font-weight: bold;">₦{{ number_format($salesData['total_sales'] ?? 0, 2) }}</div>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Total Profit</div>
            <div style="font-size: 28px; font-weight: bold;">₦{{ number_format($salesData['total_profit'] ?? 0, 2) }}</div>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Transactions</div>
            <div style="font-size: 28px; font-weight: bold;">{{ number_format($salesData['total_transactions'] ?? 0) }}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Items Sold</div>
            <div style="font-size: 28px; font-weight: bold;">{{ number_format($salesData['total_items_sold'] ?? 0) }}</div>
        </div>
    </div>

    <!-- Performance Insights -->
    <div class="content">
        <h3 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">📊 Performance Insights</h3>
        
        @if(isset($salesData['average_transaction_value']) && $salesData['average_transaction_value'] > 0)
        <p>
            <strong>Average Transaction Value:</strong> ₦{{ number_format($salesData['average_transaction_value'], 2) }}<br>
            <strong>Profit Margin:</strong> {{ number_format($salesData['profit_margin'] ?? 0, 2) }}%
        </p>
        @else
        <p style="color: #6c757d;">No sales recorded this week. Start recording your sales to see insights!</p>
        @endif
    </div>

    <!-- Top Selling Products -->
    @if(isset($productPerformance) && count($productPerformance) > 0)
    <div class="content">
        <h3 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">🏆 Top Selling Products</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #6c757d;">#</th>
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #6c757d;">Product</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px; color: #6c757d;">Qty Sold</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px; color: #6c757d;">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach(array_slice($productPerformance, 0, 5) as $index => $product)
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-size: 14px;">{{ $index + 1 }}</td>
                    <td style="padding: 12px; font-size: 14px; font-weight: 500;">{{ $product['product_name'] }}</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px;">{{ number_format($product['total_quantity']) }}</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #28a745;">₦{{ number_format($product['total_revenue'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Payment Methods Breakdown -->
    @if(isset($salesData['payment_breakdown']) && count($salesData['payment_breakdown']) > 0)
    <div class="content">
        <h3 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">💳 Payment Methods</h3>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
            @foreach($salesData['payment_breakdown'] as $method => $amount)
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <span style="font-size: 14px; text-transform: capitalize;">{{ $method }}</span>
                <span style="font-size: 14px; font-weight: 600;">₦{{ number_format($amount, 2) }}</span>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Action Button -->
    <div style="text-align: center; margin: 35px 0 25px;">
        <a href="{{ config('app.spa_url') }}/reports" class="button">
            View Detailed Report
        </a>
    </div>

    <!-- Tips Section -->
    <div class="info">
        <strong>💡 Business Tip:</strong>
        @if(isset($salesData['total_profit']) && $salesData['total_profit'] > 0)
            Keep up the great work! Consider promoting your top-selling products to maximize profits.
        @else
            Start recording your daily sales to track your business performance and make data-driven decisions.
        @endif
    </div>

    <div class="content">
        <p style="margin-top: 20px; font-size: 13px; color: #6c757d;">
            This report is automatically generated every Saturday. If you have questions or need help, feel free to reach out to our support team.
        </p>
    </div>
@endsection
