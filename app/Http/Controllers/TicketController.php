<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketUpdate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * Display tickets based on user role
     */
    public function index()
    {
        $user = Auth::user();
        $role = $user->role->name ?? null;
        
        if ($role === 'Admin') {
            // Admin sees all tickets
            $tickets = Ticket::with(['submittedBy', 'assignedTo', 'updates.user'])
                        ->orderBy('created_at', 'desc')
                        ->get();
        } elseif ($role === 'IT Agent') {
            // IT agents see tickets assigned to them
            $tickets = Ticket::with(['submittedBy', 'assignedTo', 'updates.user'])
                        ->where('assigned_to', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->get();
        } else {
            // Staff see their own tickets
            $tickets = Ticket::with(['submittedBy', 'assignedTo', 'updates.user'])
                        ->where('submitted_by', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->get();
        }
        
        return response()->json($tickets);
    }

    /**
     * Store a new ticket (Staff only)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Make sure user is a staff member
        if ($user->role->name !== 'Staff') {
            return response()->json(['message' => 'Only staff members can create tickets'], 403);
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,critical',
        ]);
        
        $ticket = Ticket::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'new',
            'priority' => $request->priority,
            'submitted_by' => $user->id,
        ]);
        
        return response()->json($ticket, 201);
    }

    /**
     * Assign a ticket to an IT agent (Admin only)
     */
    public function assignTicket(Request $request, $id)
    {
        $user = Auth::user();
        
        // Make sure user is an admin
        if ($user->role->name !== 'Admin') {
            return response()->json(['message' => 'Only admins can assign tickets'], 403);
        }
        
        $request->validate([
            'agent_id' => 'required|exists:users,id',
        ]);
        
        $ticket = Ticket::findOrFail($id);
        
        // Make sure the ticket is in 'new' status
        if ($ticket->status !== 'new') {
            return response()->json(['message' => 'Only new tickets can be assigned'], 400);
        }
        
        // Make sure the agent has IT Agent role
        $agent = User::findOrFail($request->agent_id);
        if ($agent->role->name !== 'IT Agent') {
            return response()->json(['message' => 'Selected user is not an IT agent'], 400);
        }
        
        $ticket->assigned_to = $request->agent_id;
        $ticket->save();
        
        // Create an update record for the assignment
        TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => 'Ticket has been assigned to ' . $agent->name,
        ]);
        
        return response()->json(['message' => 'Ticket assigned successfully']);
    }

    /**
     * Update a ticket's progress (IT Agent only)
     */
    public function updateTicket(Request $request, $id)
    {
        $user = Auth::user();
        
        // Make sure user is an IT Agent
        if ($user->role->name !== 'IT Agent') {
            return response()->json(['message' => 'Only IT agents can update tickets'], 403);
        }
        
        $request->validate([
            'message' => 'required|string',
            'status' => 'sometimes|string|in:in_progress,resolved',
        ]);
        
        $ticket = Ticket::findOrFail($id);
        
        // Make sure the ticket is assigned to this agent
        if ($ticket->assigned_to !== $user->id) {
            return response()->json(['message' => 'You can only update tickets assigned to you'], 403);
        }
        
        // Update ticket status if provided
        if ($request->filled('status')) {
            $ticket->status = $request->status;
            $ticket->save();
        }
        
        // Create update record
        TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message,
        ]);
        
        return response()->json(['message' => 'Ticket updated successfully']);
    }
}
