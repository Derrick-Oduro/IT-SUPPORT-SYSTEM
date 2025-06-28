<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, $role)
    {
        if ($request->user()->role->name !== $role) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
Route::middleware(['auth', 'role:Admin'])->group(function () {
    Route::get('users', function () {
        return Inertia::render('users');
    })->name('users');
    // ...other admin-only routes...
});