<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
        // ... other middleware ...
        'role' => \App\Http\Middleware\EnsureRole::class,
    ];
}