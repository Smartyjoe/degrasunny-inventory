@extends('emails.layout')

@section('title', 'Welcome to ' . config('app.name'))

@section('content')
    <div class="greeting">
        Welcome {{ $name }}! 🎉
    </div>

    <div class="content">
        <p>Thank you for verifying your email address! Your account is now fully activated and you're ready to start using {{ config('app.name') }}.</p>
        
        <h3 style="color: #667eea; margin-top: 30px;">Getting Started</h3>
        
        <p>Here are a few things you can do to get started:</p>
        
        <ul style="line-height: 1.8;">
            <li><strong>Set up your store:</strong> Configure your store settings and add your business information</li>
            <li><strong>Add products:</strong> Start adding your product inventory to the system</li>
            <li><strong>Manage stock:</strong> Track your daily stock levels and additions</li>
            <li><strong>Record sales:</strong> Easily record and manage your sales transactions</li>
            <li><strong>View reports:</strong> Get insights with detailed sales and inventory reports</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $app_url }}" class="button">Go to Dashboard</a>
        </div>

        <p>If you have any questions or need help getting started, feel free to reach out to our support team.</p>
    </div>

    <div class="info">
        <strong>Need help?</strong> Visit our help center or contact support for assistance.
    </div>
@endsection
