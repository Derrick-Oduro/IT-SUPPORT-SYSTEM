import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Users() {
    const [users, setUsers] = useState<{ id: number; name: string; role: string }[]>([]);
    const [form, setForm] = useState({ name: '', role: 'Staff' });
    const [loading, setLoading] = useState(false);

    // Fetch users from backend
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            alert('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed to add user');
            setForm({ name: '', role: 'Staff' });
            await fetchUsers();
        } catch (err) {
            alert('Error adding user');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete user');
            await fetchUsers();
        } catch (err) {
            alert('Error deleting user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Users" />
            <h1 className="text-3xl font-bold mb-6 text-[#071A22]">Users</h1>

            {/* Add User Form */}
            <form onSubmit={handleAddUser} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="border px-2 py-1"
                    required
                    disabled={loading}
                />
                <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="border px-2 py-1"
                    disabled={loading}
                >
                    <option value="Admin">Admin</option>
                    <option value="IT agent">IT agent</option>
                    <option value="Staff">Staff</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading}>
                    {loading ? 'Adding...' : 'Add User'}
                </button>
            </form>

            {/* Users List */}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Name</th>
                            <th className="border px-2 py-1">Role</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="border px-2 py-1">{user.name}</td>
                                <td className="border px-2 py-1">{user.role}</td>
                                <td className="border px-2 py-1">
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="bg-red-600 text-white px-2 py-1 rounded"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </AppLayout>
    );
}