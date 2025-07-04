<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // Get latest 10 unread notifications
        $notifications = $user->unreadNotifications()->take(10)->get();
        return response()->json($notifications);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
    public function test(Request $request)
    {
        $user = $request->user();
        $user->notify(new \App\Notifications\GenericNotification(['message' => 'You have a new ticket!']));
        return response()->json(['success' => true]);
    }
}
