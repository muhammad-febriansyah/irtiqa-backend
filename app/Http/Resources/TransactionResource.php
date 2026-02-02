<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'user_id' => $this->user_id,
            'package' => new PackageResource($this->whenLoaded('package')),
            'amount' => $this->amount,
            'admin_fee' => $this->admin_fee,
            'total_amount' => $this->total_amount,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'duitku_reference' => $this->duitku_reference,
            'duitku_payment_url' => $this->duitku_payment_url,
            'duitku_va_number' => $this->duitku_va_number,
            'duitku_qr_string' => $this->duitku_qr_string,
            'transfer_proof_url' => $this->transfer_proof ? asset('storage/' . $this->transfer_proof) : null,
            'paid_at' => $this->paid_at?->toISOString(),
            'expired_at' => $this->expired_at?->toISOString(),
            'escrow_status' => $this->escrow_status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
