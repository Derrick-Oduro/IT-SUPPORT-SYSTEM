import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <h1 className="text-3xl font-bold mb-6 text-[#071A22]">Dashboard</h1>
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-400 text-center">
                Welcome to your IT Support System dashboard!
            </div>
        </AppLayout>
    );
}
