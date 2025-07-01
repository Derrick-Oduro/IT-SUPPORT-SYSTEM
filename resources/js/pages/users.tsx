import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import axios from 'axios';

export default function Users() {
  const users = (usePage().props as any).users as any[];
  const [showForm, setShowForm] = useState(false);
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    email: '',
    password: '',
    role_id: '',
  });

  // Handle user creation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('users.store'), {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  // Handle user deletion
  const handleDelete = (id: number) => {
      // You should define route('users.destroy', id) in your web.php
      axios.delete(route('users.destroy', id));
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {showForm ? 'Cancel' : 'Add User'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-100 p-4 rounded">
          <div>
            <label>Name</label>
            <input
              type="text"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              className="block w-full"
              required
            />
            {errors.name && <div className="text-red-500">{errors.name}</div>}
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={data.email}
              onChange={e => setData('email', e.target.value)}
              className="block w-full"
              required
            />
            {errors.email && <div className="text-red-500">{errors.email}</div>}
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={data.password}
              onChange={e => setData('password', e.target.value)}
              className="block w-full"
              required
            />
            {errors.password && <div className="text-red-500">{errors.password}</div>}
          </div>
          <div>
            <label>Role</label>
            <select
              value={data.role_id}
              onChange={e => setData('role_id', e.target.value)}
              className="block w-full"
              required
            >
              <option value="">Select Role</option>
              <option value="1">Admin</option>
              <option value="2">IT Agent</option>
              <option value="3">Staff</option>
            </select>
            {errors.role_id && <div className="text-red-500">{errors.role_id}</div>}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={processing}
          >
            Add User
          </button>
        </form>
      )}
      <table className="w-full border">
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
              <td className="border px-2 py-1">{user.role?.name}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}