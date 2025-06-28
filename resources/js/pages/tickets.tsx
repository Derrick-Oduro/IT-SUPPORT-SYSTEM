import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Tickets() {
  const { auth } = usePage<PageProps>().props;
  const role = auth.user.role?.name;

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>
      {role === 'Admin' && (
        <div>
          {/* Admin: Full management */}
          <button>Create Ticket</button>
          <button>Delete Ticket</button>
          {/* ...other admin actions... */}
        </div>
      )}
      {role === 'IT Agent' && (
        <div>
          {/* IT Agent: Full management */}
          <button>Create Ticket</button>
          {/* ...other agent actions... */}
        </div>
      )}
      {role === 'Staff' && (
        <div>
          {/* Staff: Create/View only */}
          <button>Create Ticket</button>
          {/* ...no delete/edit actions... */}
        </div>
      )}
      {/* Common ticket list for all */}
      <div>
        {/* Ticket list here */}
      </div>
    </AppLayout>
  );
}