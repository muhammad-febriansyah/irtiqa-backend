<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): Response
    {
        $user = auth()->user();

        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        $redirectPath = $this->getRedirectPath($user);

        if ($request->expectsJson()) {
            return new JsonResponse(['redirect' => $redirectPath], 200);
        }

        return redirect()->intended($redirectPath);
    }

    /**
     * Get redirect path based on user role
     *
     * @param  \App\Models\User|null  $user
     * @return string
     */
    protected function getRedirectPath($user): string
    {
        if (!$user) {
            return '/';
        }

        if ($user->hasRole('admin')) {
            return '/admin/dashboard';
        }

        if ($user->hasRole('consultant') || $user->hasRole('kyai')) {
            return '/consultant/dashboard';
        }

        return '/';
    }
}
