import { Head } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Search, Filter, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Logs',
        href: '/settings/audit-logs',
    },
];

export default function AuditLogs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [logs] = useState([
        { id: 1, user: 'John Doe', action: 'Created inventory item', entity: 'Laptop Dell XPS', timestamp: '2025-07-19 14:30:00', ip: '192.168.1.100' },
        { id: 2, user: 'Jane Smith', action: 'Updated ticket status', entity: 'Ticket #123', timestamp: '2025-07-19 14:25:00', ip: '192.168.1.101' },
        { id: 3, user: 'Admin User', action: 'Created user account', entity: 'mike.wilson@company.com', timestamp: '2025-07-19 14:20:00', ip: '192.168.1.102' },
        { id: 4, user: 'John Doe', action: 'Deleted location', entity: 'Storage Room B', timestamp: '2025-07-19 14:15:00', ip: '192.168.1.100' },
        { id: 5, user: 'IT Agent', action: 'Approved requisition', entity: 'REQ-2025-001', timestamp: '2025-07-19 14:10:00', ip: '192.168.1.103' },
    ]);

    const filteredLogs = logs.filter(log =>
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <HeadingSmall title="Audit Logs" description="View system activity and user actions" />
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Logs
                        </Button>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Entity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.user}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.entity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.ip}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}