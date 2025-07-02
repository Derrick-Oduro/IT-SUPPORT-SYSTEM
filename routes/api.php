<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\TicketController;


Route::middleware('api')->group(function () {
    Route::get('/api/tickets', [TicketController::class, 'index']); // Admin: List all tickets
    Route::post('/api/tickets', [TicketController::class, 'store']);
    Route::post('/api/tickets/{id}/assign', [TicketController::class, 'assignTicket']);
    Route::post('/api/tickets/{id}/update', [TicketController::class, 'updateTicket']); // IT Agent: Update ticket // Admin: Assign ticket // Staff: Create ticket

    Route::get('/api/users/agents', [UsersController::class, 'getAgents']); // Get IT agents for assignment
});


// User api routes

Route::middleware('api')->group(function () {
    Route::get('/api/users', [UsersController::class, 'getAllUsers']);
    Route::post('/api/users', [UsersController::class, 'addUser']);
    Route::delete('/api/users/{id}', [UsersController::class, 'deleteUser']);
    Route::put('/api/users/{id}', [UsersController::class, 'updateUser']);
});
