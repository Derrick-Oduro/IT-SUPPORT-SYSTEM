<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class UsersController extends Controller
{
    public function index()
    {
        // Optionally restrict to admin:
        // if (!Auth::user() || Auth::user()->role->name !== 'Admin') {
        //     abort(403, 'Unauthorized');
        // }

        $users = User::with('role')->get();

        // Return users to Inertia
        return Inertia::render('users', [
            'users' => $users
        ]);
    }


    public function getAllUsers()
    {
        $users = User::with('role')->get();

        return response()->json($users);
    }







}
