import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { PageProps } from '@/types';

export default function Tickets() {
  const { auth } = usePage<PageProps>().props;
  const role = auth.user.role?.name;
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  // Admin: Fetch all tickets
  useEffect(() => {
    if (role === 'Admin') {
      fetch('/api/tickets')
        .then(res => res.json())
        .then(data => setTickets(data));
    }
  }, [role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', description: '' });
      alert('Ticket created!');
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>
      {role === 'Staff' && (
        <form onSubmit={handleCreate} className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            className="border px-2 py-1 mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
            className="border px-2 py-1 mr-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Create Ticket</button>
        </form>
      )}
      {role === 'Admin' && (
        <div>
          <h2 className="font-bold mb-2">All Tickets</h2>
          <ul>
            {tickets.map((ticket: any) => (
              <li key={ticket.id}>
                <strong>{ticket.title}</strong>: {ticket.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
}