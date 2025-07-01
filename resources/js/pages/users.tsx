import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Users() {
    return (
        <AppLayout>
            <Head title="Users" />
            <h1 className="text-3xl font-bold mb-6 text-[#071A22]">Users</h1>
            {/* Blank white page */}
        </AppLayout>
    );
}