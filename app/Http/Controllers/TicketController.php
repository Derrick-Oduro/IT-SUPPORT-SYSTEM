<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketUpdate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\TicketNotification;

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

        // Notify all admins about new ticket
        $admins = User::whereHas('role', function($query) {
            $query->where('name', 'Admin');
        })->get();

        foreach ($admins as $admin) {
            $admin->notify(new TicketNotification([
                'title' => 'New Ticket Created',
                'message' => "New {$request->priority} priority ticket: {$request->title}",
                'ticket_id' => $ticket->id,
                'action_url' => '/tickets',
                'icon' => 'ticket'
            ]));
        }

        return response()->json($ticket, 201);
    }

    /**
     * Assign a ticket to an IT agent (Admin only)
     */
    public function assignTicket(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role->name !== 'Admin') {
            return response()->json(['message' => 'Only admins can assign tickets'], 403);
        }

        $request->validate([
            'agent_id' => 'required|exists:users,id',
        ]);

        $ticket = Ticket::findOrFail($id);

        if ($ticket->status !== 'new') {
            return response()->json(['message' => 'Only new tickets can be assigned'], 400);
        }

        $agent = User::findOrFail($request->agent_id);
        if ($agent->role->name !== 'IT Agent') {
            return response()->json(['message' => 'Selected user is not an IT agent'], 400);
        }

        $ticket->assigned_to = $request->agent_id;
        $ticket->save();

        TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => 'Ticket has been assigned to ' . $agent->name,
        ]);

        // Notify the assigned agent
        $agent->notify(new TicketNotification([
            'title' => 'Ticket Assigned to You',
            'message' => "You have been assigned ticket: {$ticket->title}",
            'ticket_id' => $ticket->id,
            'action_url' => '/tickets',
            'icon' => 'ticket'
        ]));

        // Notify the ticket submitter
        $ticket->submittedBy->notify(new TicketNotification([
            'title' => 'Ticket Update',
            'message' => "Your ticket '{$ticket->title}' has been assigned to {$agent->name}",
            'ticket_id' => $ticket->id,
            'action_url' => '/tickets',
            'icon' => 'ticket'
        ]));

        return response()->json(['message' => 'Ticket assigned successfully']);
    }

    /**
     * Update a ticket's progress (IT Agent only)
     */
    public function updateTicket(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role->name !== 'IT Agent') {
            return response()->json(['message' => 'Only IT agents can update tickets'], 403);
        }

        $request->validate([
            'message' => 'required|string',
            'status' => 'sometimes|string|in:in_progress,resolved',
        ]);

        $ticket = Ticket::findOrFail($id);

        if ($ticket->assigned_to !== $user->id) {
            return response()->json(['message' => 'You can only update tickets assigned to you'], 403);
        }

        $oldStatus = $ticket->status;

        if ($request->filled('status')) {
            $ticket->status = $request->status;
            $ticket->save();
        }

        TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        // Notify ticket submitter about update
        $statusMessage = $request->filled('status') && $request->status !== $oldStatus
            ? " Status changed to: " . ucfirst(str_replace('_', ' ', $request->status))
            : "";

        $ticket->submittedBy->notify(new TicketNotification([
            'title' => 'Ticket Update',
            'message' => "Update on your ticket '{$ticket->title}': {$request->message}{$statusMessage}",
            'ticket_id' => $ticket->id,
            'action_url' => '/tickets',
            'icon' => 'ticket'
        ]));

        // If resolved, notify admins
        if ($request->status === 'resolved') {
            $admins = User::whereHas('role', function($query) {
                $query->where('name', 'Admin');
            })->get();

            foreach ($admins as $admin) {
                $admin->notify(new TicketNotification([
                    'title' => 'Ticket Resolved',
                    'message' => "Ticket '{$ticket->title}' has been resolved by {$user->name}",
                    'ticket_id' => $ticket->id,
                    'action_url' => '/tickets',
                    'icon' => 'ticket'
                ]));
            }
        }

        return response()->json(['message' => 'Ticket updated successfully']);
    }
}
