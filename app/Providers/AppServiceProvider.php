<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Inertia::share('auth', function () {
            $user = Auth::user();
            if ($user) {
                $user->load('role');
                \Log::info('Shared user', ['user' => $user->toArray()]);
            }
            return [
                'user' => $user,
            ];
        });
    }
}