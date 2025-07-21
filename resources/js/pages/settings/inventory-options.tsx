import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Options',
        href: '/settings/inventory-options',
    },
];

export default function InventoryOptions() {
    const { data, setData, post, processing, errors, reset } = useForm({
        low_stock_threshold: '10',
        auto_reorder: false,
        reorder_point: '5',
        enable_barcode: true,
        track_serial_numbers: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/settings/inventory-options');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Options" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Inventory Options" description="Configure inventory management settings" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                <Input
                                    id="low_stock_threshold"
                                    type="number"
                                    value={data.low_stock_threshold}
                                    onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                    placeholder="10"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reorder_point">Automatic Reorder Point</Label>
                                <Input
                                    id="reorder_point"
                                    type="number"
                                    value={data.reorder_point}
                                    onChange={(e) => setData('reorder_point', e.target.value)}
                                    placeholder="5"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="auto_reorder"
                                    checked={data.auto_reorder}
                                    onChange={(e) => setData('auto_reorder', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="auto_reorder">Enable Automatic Reordering</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="enable_barcode"
                                    checked={data.enable_barcode}
                                    onChange={(e) => setData('enable_barcode', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="enable_barcode">Enable Barcode Scanning</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="track_serial_numbers"
                                    checked={data.track_serial_numbers}
                                    onChange={(e) => setData('track_serial_numbers', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="track_serial_numbers">Track Serial Numbers</Label>
                            </div>
                        </div>

                        <Button disabled={processing}>Save Settings</Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
