<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\UsersController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('tickets', function () {
        return Inertia::render('tickets');
    })->name('tickets');

    Route::get('inventory', function () {
        return Inertia::render('inventory');
    })->name('inventory');

    Route::get('requisitions', function () {
        return Inertia::render('requisitions');
    })->name('requisitions');

    Route::get('stock-transfers', function () {
        return Inertia::render('stock-transfers');
    })->name('stock-transfers');

    Route::get('settings', function () {
        return Inertia::render('settings');
    })->name('settings');
});

Route::middleware(['auth', 'role:Admin'])->group(function () {
    Route::resource('users', UsersController::class)->except(['show', 'edit', 'update']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
