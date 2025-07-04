<?php

use App\Http\Controllers\StockTransactionController;
use App\Http\Controllers\StockTransferController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\RequisitionController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\NotificationController;


Route::middleware('api')->group(function () {
    // Existing ticket routes
    Route::get('/api/tickets', [TicketController::class, 'index']); // Admin: List all tickets
    Route::post('/api/tickets', [TicketController::class, 'store']);
    Route::post('/api/tickets/{id}/assign', [TicketController::class, 'assignTicket']);
    Route::post('/api/tickets/{id}/update', [TicketController::class, 'updateTicket']); // IT Agent: Update ticket // Admin: Assign ticket // Staff: Create ticket

    Route::get('/api/users/agents', [UsersController::class, 'getAgents']); // Get IT agents for assignment

    // Inventory routes
    Route::get('/api/inventory/items', [InventoryController::class, 'getItems']);
    Route::get('/api/inventory/items/{id}/transactions', [InventoryController::class, 'getItemTransactions']);

    // Admin only routes for inventory management
    Route::post('/api/inventory/items', [InventoryController::class, 'store']);
    Route::put('/api/inventory/items/{id}', [InventoryController::class, 'update']);
    Route::post('/api/inventory/items/{id}/adjust', [InventoryController::class, 'adjustQuantity']);
    Route::post('/api/inventory/categories', [InventoryController::class, 'storeCategory']);
    Route::post('/api/inventory/units', [InventoryController::class, 'storeUnitOfMeasure']);
    Route::delete('/api/inventory/items/{id}', [InventoryController::class, 'destroy']);

    // Requisition routes
    Route::get('/api/requisitions', [RequisitionController::class, 'index']);
    Route::post('/api/requisitions', [RequisitionController::class, 'store']);
    Route::get('/api/requisitions/{id}', [RequisitionController::class, 'show']);
    Route::put('/api/requisitions/{id}', [RequisitionController::class, 'update']);

    // Location management routes
    Route::get('/api/locations', [LocationController::class, 'index']); // Already exists
    Route::post('/api/locations', [LocationController::class, 'store']);
    Route::put('/api/locations/{id}', [LocationController::class, 'update']);
    Route::post('/api/locations/{id}/toggle-status', [LocationController::class, 'toggleStatus']);
    Route::get('/api/locations/stats', [LocationController::class, 'getLocationsWithStats']);

    // Add this for stock transactions history
    Route::get('/api/stock-transactions', [StockTransactionController::class, 'index']);

    // Add this for creating a transfer (if not already present)
    Route::post('/api/stock-transfers', [StockTransferController::class, 'store']);
    Route::get('/api/stock-transfers', [StockTransferController::class, 'index']);

    // Notification routes
    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::post('/api/notifications/read', [NotificationController::class, 'markAllRead']);
});


// User api routes
Route::middleware('api')->group(function () {
    Route::get('/api/users', [UsersController::class, 'getAllUsers']);
    Route::post('/api/users', [UsersController::class, 'addUser']);
    Route::delete('/api/users/{id}', [UsersController::class, 'deleteUser']);
    Route::put('/api/users/{id}', [UsersController::class, 'updateUser']);
});
