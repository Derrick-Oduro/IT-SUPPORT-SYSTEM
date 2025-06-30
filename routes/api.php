<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;

// Get all users
Route::get('/users', [UserController::class, 'getAllUsers']);

// Add a user
Route::post('/users', [UserController::class, 'addUser']);

// Delete a user
Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']); // Admin: List all tickets
    Route::post('/tickets', [TicketController::class, 'store']); // Staff: Create ticket
});