<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsConsultant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        if (!$request->user()->consultant()->exists()) {
            return redirect()
                ->route('home')
                ->with('error', 'Anda tidak memiliki akses sebagai konsultan. Silakan daftar sebagai konsultan terlebih dahulu.');
        }

        return $next($request);
    }
}
