@extends('emails.layout')

@section('title', 'Reset Your Password')

@section('content')
    <div class="greeting">
        Hello {{ $name }},
    </div>

    <div class="content">
        <p>We received a request to reset your password for your {{ config('app.name') }} account. Use the code below to reset your password:</p>
    </div>

    <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
        <div class="otp-label">Your password reset code</div>
    </div>

    <div class="info">
        <strong>Important:</strong> This code will expire in {{ $expiry_minutes }} minutes.
    </div>

    <div class="content">
        <p>Enter this code on the password reset page to create a new password for your account.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>

    <div class="warning">
        <strong>Security alert:</strong> If you didn't request this password reset, someone may be trying to access your account. Please consider changing your password immediately after logging in.
    </div>
@endsection
