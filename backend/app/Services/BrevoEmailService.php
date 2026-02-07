<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class BrevoEmailService
{
    protected $client;
    protected $apiKey;
    protected $senderEmail;
    protected $senderName;

    public function __construct()
    {
        $this->apiKey = config('services.brevo.api_key');
        $this->senderEmail = config('services.brevo.sender_email');
        $this->senderName = config('services.brevo.sender_name');

        $this->client = new Client([
            'base_uri' => 'https://api.brevo.com/v3/',
            'headers' => [
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    /**
     * Send a transactional email using Brevo API
     */
    public function sendTransactionalEmail(array $data): array
    {
        try {
            $payload = [
                'sender' => [
                    'name' => $data['sender_name'] ?? $this->senderName,
                    'email' => $data['sender_email'] ?? $this->senderEmail,
                ],
                'to' => [
                    [
                        'email' => $data['to_email'],
                        'name' => $data['to_name'] ?? '',
                    ],
                ],
                'subject' => $data['subject'],
                'htmlContent' => $data['html_content'],
            ];

            // Add text content if provided
            if (isset($data['text_content'])) {
                $payload['textContent'] = $data['text_content'];
            }

            // Add template parameters if provided
            if (isset($data['params'])) {
                $payload['params'] = $data['params'];
            }

            // Add reply-to if provided
            if (isset($data['reply_to'])) {
                $payload['replyTo'] = [
                    'email' => $data['reply_to'],
                ];
            }

            $response = $this->client->post('smtp/email', [
                'json' => $payload,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            Log::info('Brevo email sent successfully', [
                'message_id' => $result['messageId'] ?? null,
                'to' => $data['to_email'],
                'subject' => $data['subject'],
            ]);

            return [
                'success' => true,
                'message_id' => $result['messageId'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Brevo email failed', [
                'error' => $e->getMessage(),
                'to' => $data['to_email'] ?? 'unknown',
                'subject' => $data['subject'] ?? 'unknown',
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send email verification OTP
     */
    public function sendEmailVerificationOTP(string $email, string $name, string $otp): array
    {
        $htmlContent = view('emails.verify-email', [
            'name' => $name,
            'otp' => $otp,
            'expiry_minutes' => config('app.otp_expiry_minutes', 10),
        ])->render();

        return $this->sendTransactionalEmail([
            'to_email' => $email,
            'to_name' => $name,
            'subject' => 'Verify Your Email Address',
            'html_content' => $htmlContent,
        ]);
    }

    /**
     * Send password reset OTP
     */
    public function sendPasswordResetOTP(string $email, string $name, string $otp): array
    {
        $htmlContent = view('emails.reset-password', [
            'name' => $name,
            'otp' => $otp,
            'expiry_minutes' => config('app.otp_expiry_minutes', 10),
        ])->render();

        return $this->sendTransactionalEmail([
            'to_email' => $email,
            'to_name' => $name,
            'subject' => 'Reset Your Password',
            'html_content' => $htmlContent,
        ]);
    }

    /**
     * Send welcome email
     */
    public function sendWelcomeEmail(string $email, string $name): array
    {
        $htmlContent = view('emails.welcome', [
            'name' => $name,
            'app_name' => config('app.name'),
            'app_url' => config('app.spa_url'),
        ])->render();

        return $this->sendTransactionalEmail([
            'to_email' => $email,
            'to_name' => $name,
            'subject' => 'Welcome to ' . config('app.name') . '!',
            'html_content' => $htmlContent,
        ]);
    }

    /**
     * Get account information
     */
    public function getAccount(): array
    {
        try {
            $response = $this->client->get('account');
            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('Failed to get Brevo account info', [
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get sender information
     */
    public function getSenders(): array
    {
        try {
            $response = $this->client->get('senders');
            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('Failed to get Brevo senders', [
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => $e->getMessage(),
            ];
        }
    }
}
