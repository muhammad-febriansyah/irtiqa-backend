<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DuitkuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected DuitkuService $duitkuService;

    public function __construct(DuitkuService $duitkuService)
    {
        $this->duitkuService = $duitkuService;
    }

    /**
     * Handle payment callback from Duitku
     */
    public function callback(Request $request)
    {
        Log::info('Duitku Callback Received', $request->all());

        $result = $this->duitkuService->processCallback($request->all());

        if ($result['success']) {
            return response()->json(['message' => 'Callback processed successfully'], 200);
        }

        return response()->json(['message' => $result['message']], 400);
    }

    /**
     * Handle return URL after payment
     */
    public function return(Request $request)
    {
        Log::info('Duitku Return Received', $request->all());

        $merchantOrderId = $request->get('merchantOrderId');
        $resultCode = $request->get('resultCode');

        // You might want to redirect to a frontend page here
        // For API, we just return status
        return response()->json([
            'success' => $resultCode === '00',
            'order_id' => $merchantOrderId,
            'message' => $resultCode === '00' ? 'Pembayaran berhasil' : 'Pembayaran gagal atau dibatalkan',
        ]);
    }

    /**
     * Get available payment methods from Duitku
     */
    public function methods(Request $request)
    {
        $amount = $request->get('amount', 10000);
        $result = $this->duitkuService->getPaymentMethods((int) $amount);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'data' => $result['data'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'],
        ], 400);
    }
}
