import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/settings/notifications',
    },
];

export default function Notifications() {
    const { data, setData, post, processing } = useForm({
        email_notifications: true,
        ticket_updates: true,
        inventory_alerts: true,
        low_stock_alerts: true,
        requisition_approvals: true,
        system_maintenance: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/settings/notifications');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Notifications" description="Configure your notification preferences" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="email_notifications"
                                    checked={data.email_notifications}
                                    onChange={(e) => setData('email_notifications', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="email_notifications">Enable Email Notifications</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="ticket_updates"
                                    checked={data.ticket_updates}
                                    onChange={(e) => setData('ticket_updates', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="ticket_updates">Ticket Status Updates</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="inventory_alerts"
                                    checked={data.inventory_alerts}
                                    onChange={(e) => setData('inventory_alerts', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="inventory_alerts">Inventory Alerts</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="low_stock_alerts"
                                    checked={data.low_stock_alerts}
                                    onChange={(e) => setData('low_stock_alerts', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="requisition_approvals"
                                    checked={data.requisition_approvals}
                                    onChange={(e) => setData('requisition_approvals', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="requisition_approvals">Requisition Approvals</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="system_maintenance"
                                    checked={data.system_maintenance}
                                    onChange={(e) => setData('system_maintenance', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="system_maintenance">System Maintenance Alerts</Label>
                            </div>
                        </div>

                        <Button disabled={processing}>Save Preferences</Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
