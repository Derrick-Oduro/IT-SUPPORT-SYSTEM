<?php
protected $routeMiddleware = [
    // ...existing middleware...
    'role' => \App\Http\Middleware\EnsureRole::class,
];