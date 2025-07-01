<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        // Only admin can view all tickets
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json(\App\Models\Ticket::all());
    }

    public function store(Request $request)
    {
        // Only staff can create
        if ($request->user()->role->name !== 'Staff') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);
        $ticket = \App\Models\Ticket::create([
            'title' => $request->title,
            'description' => $request->description,
            'user_id' => $request->user()->id,
        ]);
        return response()->json($ticket, 201);
    }
}
