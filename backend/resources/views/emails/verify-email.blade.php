@extends('emails.layout')

@section('title', 'Verify Your Email Address')

@section('content')
    <div class="greeting">
        Hello {{ $name }},
    </div>

    <div class="content">
        <p>Thank you for registering with {{ config('app.name') }}! To complete your registration, please verify your email address using the code below:</p>
    </div>

    <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
        <div class="otp-label">Your verification code</div>
    </div>

    <div class="info">
        <strong>Important:</strong> This code will expire in {{ $expiry_minutes }} minutes.
    </div>

    <div class="content">
        <p>Simply enter this code in the verification form to activate your account and start using all features.</p>
        <p>If you didn't create an account with {{ config('app.name') }}, you can safely ignore this email.</p>
    </div>

    <div class="warning">
        <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask you for this code.
    </div>
@endsection
