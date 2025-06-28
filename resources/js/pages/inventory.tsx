import AppLayout from '@/layouts/app-layout';

export default function Inventory() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <p>Welcome to the Inventory page. Here you can view and manage inventory items based on your role.</p>
      {/* Add inventory table or actions here */}
    </AppLayout>
  );
}