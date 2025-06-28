import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.role?.name;

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <h1 className="text-3xl font-bold mb-6 text-[#071A22]">Dashboard</h1>
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-700">
                <div className="mb-4 font-semibold">
                    Welcome, {role}! Here is your dashboard.
                </div>
                {/* Add stats, charts, or widgets here */}
            </div>
        </AppLayout>
    );
}
