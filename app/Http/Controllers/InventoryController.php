<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\ItemCategory;
use App\Models\UnitOfMeasure;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display inventory page
     */
    public function index()
    {
        $user = Auth::user();
        $role = $user->role->name ?? null;

        // Initial data for inventory page
        $categories = ItemCategory::orderBy('name')->get();
        $units = UnitOfMeasure::orderBy('name')->get();

        return Inertia::render('inventory', [
            'categories' => $categories,
            'units' => $units,
            'canManageInventory' => $role === 'Admin'
        ]);
    }

    /**
     * Get all inventory items with related data
     */
    public function getItems(Request $request)
    {
        try {
            // Query for inventory items
            $query = InventoryItem::with(['category', 'unitOfMeasure', 'creator'])
                ->orderBy('name');

            // Filter by category if provided
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by active status if provided
            if ($request->has('active')) {
                $query->where('is_active', $request->boolean('active'));
            } else {
                // Default to active items only
                $query->where('is_active', true);
            }

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $items = $query->get();

            // Get categories and units for dropdowns
            $categories = ItemCategory::orderBy('name')->get();
            $units = UnitOfMeasure::orderBy('name')->get();

            // Return structured response
            return response()->json([
                'items' => $items,
                'categories' => $categories,
                'units' => $units
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching inventory data: ' . $e->getMessage());
            return response()->json([
                'items' => [],
                'categories' => [],
                'units' => []
            ], 500);
        }
    }

    /**
     * Store a new inventory item (Admin only)
     */
    public function store(Request $request)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:inventory_items',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:item_categories,id',
            'uom_id' => 'nullable|exists:units_of_measure,id',
            'quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
        ]);

        // Handle image upload if provided
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('inventory', 'public');
        }

        $userId = Auth::id();

        $item = InventoryItem::create([
            'name' => $request->name,
            'sku' => $request->sku,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'uom_id' => $request->uom_id,
            'quantity' => $request->quantity,
            'reorder_level' => $request->reorder_level,
            'unit_price' => $request->unit_price,
            'is_active' => true,
            'location' => $request->location,
            'image_path' => $imagePath,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        // Create initial inventory transaction
        if ($request->quantity > 0) {
            InventoryTransaction::create([
                'item_id' => $item->id,
                'type' => 'add',
                'quantity' => $request->quantity,
                'quantity_before' => 0,
                'quantity_after' => $request->quantity,
                'notes' => 'Initial inventory',
                'user_id' => $userId,
            ]);
        }

        return response()->json($item->load(['category', 'unitOfMeasure']), 201);
    }

    /**
     * Update an inventory item (Admin only)
     */
    public function update(Request $request, $id)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item = InventoryItem::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:inventory_items,sku,' . $id,
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:item_categories,id',
            'uom_id' => 'nullable|exists:units_of_measure,id',
            'reorder_level' => 'required|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'is_active' => 'required|boolean',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
        ]);

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($item->image_path && Storage::disk('public')->exists($item->image_path)) {
                Storage::disk('public')->delete($item->image_path);
            }

            $imagePath = $request->file('image')->store('inventory', 'public');
            $item->image_path = $imagePath;
        }

        $item->name = $request->name;
        $item->sku = $request->sku;
        $item->description = $request->description;
        $item->category_id = $request->category_id;
        $item->uom_id = $request->uom_id;
        $item->reorder_level = $request->reorder_level;
        $item->unit_price = $request->unit_price;
        $item->is_active = $request->is_active;
        $item->location = $request->location;
        $item->updated_by = Auth::id();

        $item->save();

        return response()->json($item->load(['category', 'unitOfMeasure']));
    }

    /**
     * Adjust inventory quantity (Admin only)
     */
    public function adjustQuantity(Request $request, $id)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item = InventoryItem::findOrFail($id);

        $request->validate([
            'adjustment_type' => 'required|in:add,remove,adjust',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $quantityBefore = $item->quantity;
        $adjustmentType = $request->adjustment_type;
        $adjustmentQty = $request->quantity;

        switch ($adjustmentType) {
            case 'add':
                $item->quantity += $adjustmentQty;
                break;
            case 'remove':
                if ($item->quantity < $adjustmentQty) {
                    return response()->json([
                        'message' => 'Insufficient quantity available',
                    ], 422);
                }
                $item->quantity -= $adjustmentQty;
                break;
            case 'adjust':
                $item->quantity = $adjustmentQty;
                break;
        }

        $item->updated_by = Auth::id();
        $item->save();

        // Record the transaction
        InventoryTransaction::create([
            'item_id' => $item->id,
            'type' => $adjustmentType,
            'quantity' => $adjustmentQty,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $item->quantity,
            'notes' => $request->notes,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'item' => $item->load(['category', 'unitOfMeasure']),
            'message' => 'Inventory adjusted successfully',
        ]);
    }

    /**
     * Get inventory transaction history for an item
     */
    public function getItemTransactions($id)
    {
        $item = InventoryItem::findOrFail($id);

        $transactions = InventoryTransaction::with('user')
            ->where('item_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    /**
     * Create a new category (Admin only)
     */
    public function storeCategory(Request $request)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:item_categories',
            'description' => 'nullable|string',
        ]);

        $category = ItemCategory::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json($category, 201);
    }

    /**
     * Create a new unit of measure (Admin only)
     */
    public function storeUnitOfMeasure(Request $request)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:units_of_measure',
            'abbreviation' => 'required|string|max:10|unique:units_of_measure',
        ]);

        $unit = UnitOfMeasure::create([
            'name' => $request->name,
            'abbreviation' => $request->abbreviation,
        ]);

        return response()->json($unit, 201);
    }

    /**
     * Remove the specified inventory item.
     */
    public function destroy($id)
    {
        try {
            $item = InventoryItem::findOrFail($id);

            // Delete associated image if exists
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }

            // Option 1: Soft delete (if you've added softDeletes to your model)
            // $item->delete();

            // Option 2: Hard delete, but keep transaction history
            // This allows you to still reference transactions for accounting purposes
            // even if the item is gone
            $item->is_active = false;
            $item->name = "[DELETED] " . $item->name;
            $item->save();
            $item->delete();

            return response()->json(['message' => 'Item deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error deleting inventory item: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete item: ' . $e->getMessage()], 500);
        }
    }
}
