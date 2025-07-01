import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import RegisterUserModal from '@/modals/registerUserModal';
import { constrainedMemory } from 'node:process';

type User = {
    id: number;
    name: string;
    email: string;
    role?: { name: string };
};

export default function Users() {
    const [users, setUsers] = useState<User[]>([]); // Create state to hold users
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch users from API when the component loads
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setIsLoading(true);
        axios.get('/api/users').then(response => {
            setUsers(response.data); // Set the fetched users
        }).catch(error => {
            console.error('Error fetching users:', error);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setIsLoading(true);
            axios.delete(`/api/users/${userId}`)
                .then(() => {
                    // Filter out the deleted user from the state
                    setUsers(users.filter(user => user.id !== userId));
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleEdit = (userId: number) => {
        // This will be implemented in the next step
        alert(`Edit user with ID: ${userId}`);
    };

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleAddUserSuccess = () => {
        // Refresh the user list after successfully adding a new user
        // fetchUsers();
        console.log('User added successfully');
    };

    return (
        <AppLayout>
            <Head title="Users" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#071A22]">Users</h1>
                <button
                    onClick={handleAddUser}
                    className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                    Add User
                </button>
            </div>
            <table className="min-w-full border">
                <thead>
                    <tr>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Email</th>
                        <th className="border px-2 py-1">Role</th>
                        <th className="border px-2 py-1">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="border px-2 py-1">{user.name}</td>
                            <td className="border px-2 py-1">{user.email}</td>
                            <td className="border px-2 py-1">{user.role?.name ?? 'N/A'}</td>
                            <td className="border px-2 py-1">
                                <div className="flex space-x-2 justify-center">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isLoading && <div className="mt-4 text-center">Loading...</div>}

            {/* Register User Modal */}
            <RegisterUserModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddUserSuccess}
            />
        </AppLayout>
    );
}
