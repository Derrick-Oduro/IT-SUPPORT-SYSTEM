<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index()
    {
        $users = User::with('role')->get();
        return Inertia::render('users', ['users' => $users]);
    }

    // Add store, destroy, etc. methods here as needed
}
