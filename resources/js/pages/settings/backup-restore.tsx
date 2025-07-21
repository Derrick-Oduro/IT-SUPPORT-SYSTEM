import { Head } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Download, Upload, Clock, Database } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Backup & Restore',
        href: '/settings/backup-restore',
    },
];

export default function BackupRestore() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backups, setBackups] = useState([
        { id: 1, name: 'Full Backup - 2025-07-19', size: '24.5 MB', created_at: '2025-07-19 10:30:00' },
        { id: 2, name: 'Full Backup - 2025-07-18', size: '23.8 MB', created_at: '2025-07-18 10:30:00' },
        { id: 3, name: 'Full Backup - 2025-07-17', size: '23.2 MB', created_at: '2025-07-17 10:30:00' },
    ]);

    const handleCreateBackup = () => {
        setIsBackingUp(true);
        // Simulate backup process
        setTimeout(() => {
            setIsBackingUp(false);
            // Add new backup to list
        }, 3000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backup & Restore" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Backup & Restore" description="Manage system backups and restoration" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6">
                            <h3 className="font-medium text-lg mb-4 flex items-center">
                                <Database className="h-5 w-5 mr-2" />
                                Create Backup
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Create a full backup of your system data including database, files, and configurations.
                            </p>
                            <Button onClick={handleCreateBackup} disabled={isBackingUp} className="w-full">
                                {isBackingUp ? (
                                    <>
                                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                                        Creating Backup...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Create Full Backup
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="border rounded-lg p-6">
                            <h3 className="font-medium text-lg mb-4 flex items-center">
                                <Upload className="h-5 w-5 mr-2" />
                                Restore from Backup
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Upload a backup file to restore your system to a previous state.
                            </p>
                            <input
                                type="file"
                                accept=".sql,.zip"
                                className="w-full p-2 border rounded mb-4"
                            />
                            <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload & Restore
                            </Button>
                        </div>
                    </div>

                    <div className="border rounded-lg p-6">
                        <h3 className="font-medium text-lg mb-4">Recent Backups</h3>
                        <div className="space-y-3">
                            {backups.map(backup => (
                                <div key={backup.id} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                        <p className="font-medium">{backup.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {backup.size} • {backup.created_at}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Restore
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
