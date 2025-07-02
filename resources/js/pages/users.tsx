import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import RegisterUserModal from '@/modals/registerUserModal';
import EditUserModal from '@/modals/EditUserModal';
import { Search, UserPlus, RefreshCw, Edit2, Trash2, Loader } from 'lucide-react';

type User = {
    id: number;
    name: string;
    email: string;
    role?: { name: string };
};

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch users from API when the component loads
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
            return;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(lowerCaseQuery) ||
            user.email.toLowerCase().includes(lowerCaseQuery) ||
            (user.role?.name && user.role.name.toLowerCase().includes(lowerCaseQuery))
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    const fetchUsers = () => {
        setIsLoading(true);
        axios.get('/api/users').then(response => {
            setUsers(response.data);
            setFilteredUsers(response.data);
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
        const user = users.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setShowEditModal(true);
        }
    };

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleAddUserSuccess = () => {
        fetchUsers();
    };

    const handleEditSuccess = () => {
        fetchUsers();
    };

    // Get badge color based on role
    const getRoleBadgeColor = (roleName?: string) => {
        switch (roleName?.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'it agent': return 'bg-blue-100 text-blue-800';
            case 'staff': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Users" />

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="pl-10 py-2 pr-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={fetchUsers}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>

                        <button
                            onClick={handleAddUser}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600">Loading users...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64">
                            <p className="text-gray-500 text-lg">No users found</p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2 text-blue-500 hover:text-blue-700"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="font-medium text-gray-600">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role?.name)}`}>
                                                {user.role?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2 justify-end">
                                                <button
                                                    onClick={() => handleEdit(user.id)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Register User Modal */}
            <RegisterUserModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddUserSuccess}
            />

            {/* Edit User Modal */}
            <EditUserModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
                user={selectedUser}
            />
        </AppLayout>
    );
}
