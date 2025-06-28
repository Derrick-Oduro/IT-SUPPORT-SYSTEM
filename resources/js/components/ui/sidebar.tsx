import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Sidebar() {
  const { auth } = usePage<PageProps>().props;
  const role = auth.user.role?.name;
  console.log('Sidebar role:', role);

  return (
    <nav>
      <div className="mb-8 text-2xl font-bold tracking-wide text-center">
        IT Support
      </div>
      <ul className="space-y-2">
        {/* Dashboard: All roles */}
        <li>
          <a href="/dashboard" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Dashboard
          </a>
        </li>
        {/* Tickets: All roles */}
        <li>
          <a href="/tickets" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Tickets
          </a>
        </li>
        {/* Inventory: All roles */}
        <li>
          <a href="/inventory" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Inventory
          </a>
        </li>
        {/* Requisitions: All roles */}
        <li>
          <a href="/requisitions" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Requisitions
          </a>
        </li>
        {/* Stock Transfers: Admin only */}
        {role === 'Admin' && (
          <li>
            <a href="/stock-transfers" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
              Stock Transfers
            </a>
          </li>
        )}
        {/* Users: Admin only */}
        {role === 'Admin' && (
          <li>
            <a href="/users" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
              Users
            </a>
          </li>
        )}
        {/* Settings: All roles */}
        <li>
          <a href="/settings" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}