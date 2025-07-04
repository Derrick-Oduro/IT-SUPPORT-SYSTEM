<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    /**
     * Display a listing of all locations.
     * Used for dropdowns in requisition forms.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Get all active locations ordered by name
        $locations = Location::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($locations);
    }

    /**
     * Store a newly created location.
     * Only accessible to administrators.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:locations,name',
            'description' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create location
        $location = new Location();
        $location->name = $request->name;
        $location->description = $request->description;
        $location->address = $request->address;
        $location->is_active = true;
        $location->created_by = Auth::id();
        $location->save();

        return response()->json($location, 201);
    }

    /**
     * Display the specified location.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $location = Location::findOrFail($id);
        return response()->json($location);
    }

    /**
     * Update the specified location.
     * Only accessible to administrators.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Find the location
        $location = Location::findOrFail($id);

        // Validate request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:locations,name,' . $location->id,
            'description' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update the location
        $location->update([
            'name' => $request->name,
            'description' => $request->description,
            'address' => $request->address,
            'is_active' => $request->has('is_active') ? $request->is_active : $location->is_active,
        ]);

        return response()->json($location);
    }

    /**
     * Toggle the active status of a location.
     * Only accessible to administrators.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function toggleStatus($id)
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Find the location
        $location = Location::findOrFail($id);

        // Toggle status
        $location->is_active = !$location->is_active;
        $location->save();

        return response()->json([
            'message' => 'Location status updated successfully',
            'is_active' => $location->is_active
        ]);
    }

    /**
     * Get all locations with requisition counts.
     * Used for admin dashboard and reporting.
     * Only accessible to administrators.
     *
     * @return \Illuminate\Http\Response
     */
    public function getLocationsWithStats()
    {
        // Check if user is admin
        if (Auth::user()->role->name !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $locations = Location::withCount([
            'requisitions',
            'requisitions as pending_count' => function ($query) {
                $query->where('status', 'pending');
            },
            'requisitions as approved_count' => function ($query) {
                $query->where('status', 'approved');
            },
            'requisitions as declined_count' => function ($query) {
                $query->where('status', 'declined');
            }
        ])
            ->orderBy('name')
            ->get();

        return response()->json($locations);
    }
}
