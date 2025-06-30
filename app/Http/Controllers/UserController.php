<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Get all users with their role name
    public function getAllUsers()
    {
        $users = User::with('role')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role ? $user->role->name : null,
            ];
        });
        return response()->json($users);
    }

    // Add a new user
    public function addUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|in:Admin,IT agent,Staff',
        ]);

        // Find role_id by name
        $role = Role::where('name', $request->role)->first();
        if (!$role) {
            return response()->json(['error' => 'Invalid role'], 422);
        }

        // Generate a random email and password for demo (customize as needed)
        $email = strtolower(str_replace(' ', '.', $request->name)) . rand(100, 999) . '@example.com';
        $password = Hash::make('password'); // Default password

        $user = User::create([
            'name' => $request->name,
            'email' => $email,
            'password' => $password,
            'role_id' => $role->id,
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'role' => $role->name,
        ]);
    }

    // Delete a user
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['success' => true]);
    }
}
