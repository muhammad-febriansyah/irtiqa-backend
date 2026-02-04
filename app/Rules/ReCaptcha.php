<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class ReCaptcha implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            $fail('Silakan selesaikan verifikasi reCAPTCHA.');
            return;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret_key'),
            'response' => $value,
            'remoteip' => request()->ip(),
        ]);

        $responseData = $response->json();

        // Log the response for debugging
        \Log::info('ReCAPTCHA Response:', $responseData);

        if (!$response->json('success')) {
            // Log error codes if available
            if (isset($responseData['error-codes'])) {
                \Log::error('ReCAPTCHA Error Codes:', $responseData['error-codes']);
            }
            $fail('Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
        }
    }
}
