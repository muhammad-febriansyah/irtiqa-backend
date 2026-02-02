<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuService
{
    protected string $merchantCode;
    protected string $apiKey;
    protected string $baseUrl;
    protected bool $isProduction;

    public function __construct()
    {
        $this->merchantCode = \App\Models\SystemSetting::get('duitku_merchant_code', '');
        $this->apiKey = \App\Models\SystemSetting::get('duitku_api_key', '');
        $this->isProduction = \App\Models\SystemSetting::get('duitku_environment', 'sandbox') === 'production';
        $this->baseUrl = $this->isProduction
            ? 'https://passport.duitku.com/webapi/api/merchant'
            : 'https://sandbox.duitku.com/webapi/api/merchant';
    }

    /**
     * Create payment request to Duitku
     */
    public function createPayment(Transaction $transaction, string $paymentMethod, string $customerEmail): array
    {
        try {
            $params = [
                'merchantCode' => $this->merchantCode,
                'paymentAmount' => (int) $transaction->total_amount,
                'paymentMethod' => $paymentMethod,
                'merchantOrderId' => $transaction->invoice_number,
                'productDetails' => 'Paket Konsultasi IRTIQA',
                'customerVaName' => $transaction->user->name,
                'email' => $customerEmail,
                'phoneNumber' => $transaction->user->profile->phone ?? '08123456789',
                'callbackUrl' => route('payment.callback'),
                'returnUrl' => route('payment.return'),
                'expiryPeriod' => 1440, // 24 hours in minutes
            ];

            // Generate signature
            $signature = $this->generateSignature(
                $this->merchantCode,
                $transaction->invoice_number,
                (int) $transaction->total_amount
            );

            $params['signature'] = $signature;

            // Send request to Duitku
            $response = Http::post($this->baseUrl . '/v2/inquiry', $params);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['statusCode']) && $data['statusCode'] === '00') {
                    // Update transaction with Duitku data
                    $transaction->update([
                        'duitku_merchant_code' => $this->merchantCode,
                        'duitku_reference' => $data['reference'] ?? null,
                        'duitku_payment_method' => $paymentMethod,
                        'duitku_payment_url' => $data['paymentUrl'] ?? null,
                        'duitku_va_number' => $data['vaNumber'] ?? null,
                        'duitku_qr_string' => $data['qrString'] ?? null,
                        'duitku_response' => $data,
                    ]);

                    return [
                        'success' => true,
                        'data' => $data,
                    ];
                }
            }

            Log::error('Duitku payment creation failed', [
                'response' => $response->json(),
                'transaction_id' => $transaction->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create payment',
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Duitku payment exception', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id,
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus(string $merchantOrderId): array
    {
        try {
            $signature = md5($this->merchantCode . $merchantOrderId . $this->apiKey);

            $params = [
                'merchantCode' => $this->merchantCode,
                'merchantOrderId' => $merchantOrderId,
                'signature' => $signature,
            ];

            $response = Http::post($this->baseUrl . '/transactionStatus', $params);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to check status',
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Duitku status check exception', [
                'error' => $e->getMessage(),
                'order_id' => $merchantOrderId,
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate callback from Duitku
     */
    public function validateCallback(array $callbackData): bool
    {
        $merchantOrderId = $callbackData['merchantOrderId'] ?? '';
        $resultCode = $callbackData['resultCode'] ?? '';
        $amount = $callbackData['amount'] ?? 0;
        $receivedSignature = $callbackData['signature'] ?? '';

        $calculatedSignature = md5(
            $this->merchantCode . $amount . $merchantOrderId . $this->apiKey
        );

        return hash_equals($calculatedSignature, $receivedSignature);
    }

    /**
     * Process payment callback
     */
    public function processCallback(array $callbackData): array
    {
        try {
            // Validate signature
            if (!$this->validateCallback($callbackData)) {
                Log::warning('Invalid Duitku callback signature', $callbackData);
                return [
                    'success' => false,
                    'message' => 'Invalid signature',
                ];
            }

            $merchantOrderId = $callbackData['merchantOrderId'];
            $resultCode = $callbackData['resultCode'];

            // Find transaction
            $transaction = Transaction::where('invoice_number', $merchantOrderId)->first();

            if (!$transaction) {
                Log::warning('Transaction not found for callback', [
                    'order_id' => $merchantOrderId,
                ]);
                return [
                    'success' => false,
                    'message' => 'Transaction not found',
                ];
            }

            // Check if payment is successful (00 = success)
            if ($resultCode === '00') {
                $transaction->markAsPaid();

                Log::info('Payment successful via Duitku', [
                    'transaction_id' => $transaction->id,
                    'invoice' => $merchantOrderId,
                ]);

                return [
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'transaction' => $transaction,
                ];
            } else {
                // Payment failed
                $transaction->update([
                    'status' => 'failed',
                    'notes' => 'Payment failed: ' . ($callbackData['resultMsg'] ?? 'Unknown error'),
                ]);

                Log::warning('Payment failed via Duitku', [
                    'transaction_id' => $transaction->id,
                    'result_code' => $resultCode,
                ]);

                return [
                    'success' => false,
                    'message' => 'Payment failed',
                    'transaction' => $transaction,
                ];
            }
        } catch (\Exception $e) {
            Log::error('Duitku callback processing exception', [
                'error' => $e->getMessage(),
                'callback_data' => $callbackData,
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods(int $amount): array
    {
        try {
            $datetime = date('Y-m-d H:i:s');
            $signature = md5($this->merchantCode . $amount . $datetime . $this->apiKey);

            $params = [
                'merchantcode' => $this->merchantCode,
                'amount' => $amount,
                'datetime' => $datetime,
                'signature' => $signature,
            ];

            $response = Http::post($this->baseUrl . '/paymentmethod/getpaymentmethod', $params);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()['paymentFee'] ?? [],
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get payment methods',
            ];
        } catch (\Exception $e) {
            Log::error('Duitku get payment methods exception', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate signature for payment request
     */
    protected function generateSignature(string $merchantCode, string $merchantOrderId, int $paymentAmount): string
    {
        return md5($merchantCode . $merchantOrderId . $paymentAmount . $this->apiKey);
    }
}
