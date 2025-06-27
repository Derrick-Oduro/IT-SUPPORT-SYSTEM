export default function Sidebar() {
  return (
    <nav>
      <div className="mb-8 text-2xl font-bold tracking-wide text-center">
        IT Support
      </div>
      <ul className="space-y-2">
        <li>
          <a href="/dashboard" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Dashboard
          </a>
        </li>
        <li>
          <a href="/tickets" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Tickets
          </a>
        </li>
        <li>
          <a href="/inventory" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Inventory
          </a>
        </li>
        <li>
          <a href="/requisitions" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Requisitions
          </a>
        </li>
        <li>
          <a href="/stock-transfers" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Stock Transfers
          </a>
        </li>
        <li>
          <a href="/reports" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Reports
          </a>
        </li>
        <li>
          <a href="/users" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Users
          </a>
        </li>
        <li>
          <a href="/settings" className="block rounded px-4 py-2 hover:bg-white hover:text-[#071A22] transition">
            Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}