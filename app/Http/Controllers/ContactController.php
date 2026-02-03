<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        $logo = SystemSetting::get('logo');
        $address = SystemSetting::get('contact_address', 'Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta');
        $email = SystemSetting::get('contact_email', 'support@irtiqa.com');
        $phone = SystemSetting::get('contact_phone', '+62 812-3456-7890');
        $hours = SystemSetting::get('contact_hours', 'Senin - Jumat | 09:00 - 17:00 WIB');

        return Inertia::render('Contact', [
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
            'contactInfo' => [
                'address' => $address,
                'email' => $email,
                'phone' => $phone,
                'hours' => $hours,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'recaptcha_token' => ['required', new \App\Rules\ReCaptcha],
        ]);

        ContactMessage::create($validated);

        return redirect()->back()->with('success', 'Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.');
    }
}
