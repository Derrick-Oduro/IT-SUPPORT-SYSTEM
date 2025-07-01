<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\TicketController;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']); // Admin: List all tickets
    Route::post('/tickets', [TicketController::class, 'store']); // Staff: Create ticket
});


// User api routes

Route::middleware('api')->group(function () {
    Route::get('/api/users', [UsersController::class, 'getAllUsers']);
    Route::post('/api/users', [UsersController::class, 'addUser']);
    Route::delete('/api/users/{id}', [UsersController::class, 'deleteUser']);
});
