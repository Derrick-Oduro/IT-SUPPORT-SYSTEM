import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { MapPin, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import CreateLocationModal from '@/modals/CreateLocationModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Locations',
        href: '/settings/locations',
    },
];

type Location = {
    id: number;
    name: string;
    description: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export default function Locations() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        filterLocations();
    }, [locations, searchQuery, statusFilter]);

    const fetchLocations = () => {
        setIsLoading(true);
        axios.get('/api/locations')
            .then(response => {
                setLocations(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                setLocations([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const filterLocations = () => {
        let filtered = [...locations];

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(location =>
                location.name.toLowerCase().includes(query) ||
                (location.description && location.description.toLowerCase().includes(query)) ||
                (location.address && location.address.toLowerCase().includes(query))
            );
        }

        // Apply status filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(location => location.is_active);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(location => !location.is_active);
        }

        setFilteredLocations(filtered);
    };

    const handleCreateLocation = () => {
        setShowCreateModal(true);
    };

    const handleEditLocation = (location: Location) => {
        const newName = prompt('Enter new location name:', location.name);
        const newDescription = prompt('Enter new description:', location.description || '');
        const newAddress = prompt('Enter new address:', location.address || '');

        if (newName && newName !== location.name) {
            axios.put(`/api/locations/${location.id}`, {
                name: newName,
                description: newDescription || null,
                address: newAddress || null,
            })
            .then(() => {
                fetchLocations();
            })
            .catch(error => {
                console.error('Error updating location:', error);
                alert('Error updating location. Please try again.');
            });
        }
    };

    const handleToggleStatus = (id: number) => {
        axios.post(`/api/locations/${id}/toggle-status`)
            .then(() => {
                fetchLocations();
            })
            .catch(error => {
                console.error('Error toggling location status:', error);
            });
    };

    const handleDeleteLocation = (id: number) => {
        if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
            axios.delete(`/api/locations/${id}`)
                .then(() => {
                    fetchLocations();
                })
                .catch(error => {
                    console.error('Error deleting location:', error);
                    alert('Error deleting location. Please try again.');
                });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Locations" />

            <SettingsLayout>
                <div className="space-y-4">
                    {/* Compact Header */}
                    <div className="flex justify-between items-center">
                        <HeadingSmall title="Locations" description="Manage locations" />
                        <Button onClick={handleCreateLocation} size="sm" className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Add
                        </Button>
                    </div>

                    {/* Compact Search and Filter */}
                    <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <select
                                className="py-1.5 px-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchLocations}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Compact Locations List */}
                    <div className="bg-white rounded border border-gray-200">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredLocations.length === 0 ? (
                            <div className="text-center py-8">
                                <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No locations</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    {searchQuery ? 'No matches found.' : 'Create your first location.'}
                                </p>
                                {!searchQuery && (
                                    <div className="mt-4">
                                        <Button onClick={handleCreateLocation} size="sm">
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Location
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Name
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredLocations.map((location) => (
                                            <tr key={location.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {location.name}
                                                    </div>
                                                    {location.description && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {location.description}
                                                        </div>
                                                    )}
                                                    {location.address && (
                                                        <div className="text-xs text-gray-400 truncate">
                                                            {location.address}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                                        location.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {location.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditLocation(location)}
                                                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(location.id)}
                                                            className={`h-6 w-6 p-0 ${location.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                            title={location.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {location.is_active ? '⏸' : '▶'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteLocation(location.id)}
                                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                <CreateLocationModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchLocations}
                />
            </SettingsLayout>
        </AppLayout>
    );
}
