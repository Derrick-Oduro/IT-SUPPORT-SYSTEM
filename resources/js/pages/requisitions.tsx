import AppLayout from '@/layouts/app-layout';

export default function Requisitions() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Requisitions</h1>
      <p className="mb-6">Submit, view, and track your requisitions here. Stay updated on the status of your requests!</p>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-semibold mb-2">No requisitions yet</h2>
        <p className="text-gray-600">You have not created any requisitions. Click the button below to get started.</p>
        <button className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
          Create New Requisition
        </button>
      </div>
    </AppLayout>
  );
}