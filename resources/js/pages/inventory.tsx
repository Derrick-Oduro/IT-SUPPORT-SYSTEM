import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import {
    Search, Plus, RefreshCw, Archive, Filter, Package,
    Edit, Trash2, Eye, ArrowUpDown, Clipboard, Boxes,
    AlertTriangle, CheckCircle, FileText, PlusCircle, MapPin
} from 'lucide-react';
import type { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CreateItemModal from '@/modals/CreateItemModal';
import EditItemModal from '@/modals/EditItemModal';
import AdjustQuantityModal from '@/modals/AdjustQuantityModal';
import ViewTransactionsModal from '@/modals/ViewTransactionsModal';
import CreateCategoryModal from '@/modals/CreateCategoryModal';
import CreateUnitModal from '@/modals/CreateUnitModal';
import CreateLocationModal from '@/modals/CreateLocationModal';
import ViewLocationsModal from '@/modals/ViewLocationsModal';

type Category = {
    id: number;
    name: string;
};

type UnitOfMeasure = {
    id: number;
    name: string;
    abbreviation: string;
};

type InventoryItem = {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    category_id: number | null;
    category?: {
        id: number;
        name: string;
    };
    uom_id: number | null;
    unit_of_measure?: {
        id: number;
        name: string;
        abbreviation: string;
    };
    quantity: number;
    reorder_level: number;
    unit_price: number | null;
    is_active: boolean;
    location: string | null;
    image_path: string | null;
    created_at: string;
    updated_at: string;
};

export default function Inventory() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.role?.name;
    const isAdmin = role === 'Admin';

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showInactiveItems, setShowInactiveItems] = useState(false);
    const [showLowStock, setShowLowStock] = useState(false);
    const [sortField, setSortField] = useState<keyof InventoryItem>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);
    const [showCreateLocationModal, setShowCreateLocationModal] = useState(false);
    const [showViewLocationsModal, setShowViewLocationsModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    useEffect(() => {
        // Only run filtering if items is available
        if (items && Array.isArray(items)) {
            filterItems();
        }
    }, [items, searchQuery, categoryFilter, statusFilter, showInactiveItems, showLowStock, sortField, sortDirection]);

    const fetchInventoryData = () => {
        setIsLoading(true);

        // Fetch inventory items
        axios.get('/api/inventory/items')
            .then(response => {
                console.log('API response:', response.data); // Debug the response

                // Initialize with empty arrays if the properties don't exist
                setItems(response.data.items || []);
                setCategories(response.data.categories || []);
                setUnits(response.data.units || []);
            })
            .catch(error => {
                console.error('Error fetching inventory data:', error);
                // Set empty arrays on error
                setItems([]);
                setCategories([]);
                setUnits([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Update the filterItems function with this safer implementation
    const filterItems = () => {
        // Check if items exists and is an array before attempting to filter
        if (!items || !Array.isArray(items)) {
            setFilteredItems([]);
            return;
        }

        let filtered = [...items];

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.sku.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (item.location && item.location.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category_id === parseInt(categoryFilter));
        }

        // Apply status filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(item => item.is_active);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(item => !item.is_active);
        }

        // Apply low stock filter
        if (showLowStock) {
            filtered = filtered.filter(item => item.quantity <= item.reorder_level);
        }

        // Apply inactive filter (if not already filtered by status)
        if (!showInactiveItems && statusFilter !== 'inactive') {
            filtered = filtered.filter(item => item.is_active);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let valueA = a[sortField];
            let valueB = b[sortField];

            // Handle null values
            if (valueA === null) valueA = '';
            if (valueB === null) valueB = '';

            // String comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortDirection === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            // Number comparison
            return sortDirection === 'asc'
                ? Number(valueA) - Number(valueB)
                : Number(valueB) - Number(valueA);
        });

        setFilteredItems(filtered);
    };

    const handleSort = (field: keyof InventoryItem) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleCreateItem = () => {
        setShowCreateModal(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleAdjustQuantity = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowAdjustModal(true);
    };

    const handleViewTransactions = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowTransactionsModal(true);
    };

    const handleCreateCategory = () => {
        setShowCreateCategoryModal(true);
    };

    const handleCreateUnit = () => {
        setShowCreateUnitModal(true);
    };

    const handleCreateLocation = () => {
        setShowCreateLocationModal(true);
    };

    const handleViewLocations = () => {
        setShowViewLocationsModal(true);
    };

    const renderStockStatus = (item: InventoryItem) => {
        if (item.quantity <= 0) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Out of Stock
                </Badge>
            );
        } else if (item.quantity <= item.reorder_level) {
            return (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    In Stock
                </Badge>
            );
        }
    };

    // Add this function to your inventory.tsx if you need to refresh location data
    const fetchLocations = () => {
        axios.get('/api/locations')  // Note the /api prefix!
            .then(response => {
                // Handle the updated locations data
                console.log('Locations refreshed:', response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
            });
    };

    return (
        <AppLayout>
            <Head title="Inventory Management" />

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Boxes className="h-8 w-8 mr-2 text-blue-600" />
                        Inventory Management
                    </h1>

                    {isAdmin && (
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            <Button
                                onClick={handleCreateItem}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>

                            <Button
                                onClick={handleCreateCategory}
                                variant="outline"
                                className="border-gray-300"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                New Category
                            </Button>

                            <Button
                                onClick={handleCreateUnit}
                                variant="outline"
                                className="border-gray-300"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                New Unit
                            </Button>

                            <button
                                onClick={handleCreateLocation}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                Add Location
                            </button>

                            <button
                                onClick={handleViewLocations}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                Manage Locations
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="pl-10 py-2 pr-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Search items by name, SKU, description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="py-2 px-3 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories && categories.length > 0 ? (
                            categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))
                        ) : (
                            <option value="" disabled>No categories available</option>
                        )}
                    </select>

                    <select
                        className="py-2 px-3 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>

                    <button
                        onClick={fetchInventoryData}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            checked={showInactiveItems}
                            onChange={(e) => setShowInactiveItems(e.target.checked)}
                        />
                        <span className="ml-2">Show Inactive Items</span>
                    </label>

                    <label className="inline-flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            checked={showLowStock}
                            onChange={(e) => setShowLowStock(e.target.checked)}
                        />
                        <span className="ml-2">Show Low Stock Items Only</span>
                    </label>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Loading inventory...</span>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <Package className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No inventory items found</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-blue-500 hover:text-blue-700"
                            >
                                Clear search
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                onClick={handleCreateItem}
                                className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add your first inventory item
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => handleSort('name')}
                                        >
                                            <span>Item</span>
                                            {sortField === 'name' && (
                                                <ArrowUpDown className="h-3 w-3" />
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => handleSort('sku')}
                                        >
                                            <span>SKU</span>
                                            {sortField === 'sku' && (
                                                <ArrowUpDown className="h-3 w-3" />
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => handleSort('quantity')}
                                        >
                                            <span>Stock</span>
                                            {sortField === 'quantity' && (
                                                <ArrowUpDown className="h-3 w-3" />
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => handleSort('unit_price')}
                                        >
                                            <span>Price</span>
                                            {sortField === 'unit_price' && (
                                                <ArrowUpDown className="h-3 w-3" />
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={!item.is_active ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50'}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.image_path ? (
                                                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                        <img
                                                            className="h-10 w-10 rounded object-cover"
                                                            src={`/storage/${item.image_path}`}
                                                            alt={item.name}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                                                        <Package className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.name}
                                                    </div>
                                                    {item.location && (
                                                        <div className="text-sm text-gray-500">
                                                            Location: {item.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.category?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {item.quantity} {item.unit_of_measure?.abbreviation || ''}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Reorder at: {item.reorder_level}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="mb-1">
                                                {renderStockStatus(item)}
                                            </div>
                                            {!item.is_active && (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.unit_price ? `$${parseFloat(item.unit_price.toString()).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    onClick={() => handleViewTransactions(item)}
                                                    title="View Transaction History"
                                                >
                                                    <Clipboard className="h-5 w-5" />
                                                </button>

                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            className="text-blue-600 hover:text-blue-900"
                                                            onClick={() => handleAdjustQuantity(item)}
                                                            title="Adjust Quantity"
                                                        >
                                                            <Package className="h-5 w-5" />
                                                        </button>

                                                        <button
                                                            className="text-amber-600 hover:text-amber-900"
                                                            onClick={() => handleEditItem(item)}
                                                            title="Edit Item"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateItemModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchInventoryData}
                categories={categories}
                units={units}
            />

            <EditItemModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={fetchInventoryData}
                item={selectedItem}
                categories={categories}
                units={units}
            />

            <AdjustQuantityModal
                show={showAdjustModal}
                onClose={() => setShowAdjustModal(false)}
                onSuccess={fetchInventoryData}
                item={selectedItem}
            />

            <ViewTransactionsModal
                show={showTransactionsModal}
                onClose={() => setShowTransactionsModal(false)}
                item={selectedItem}
            />

            <CreateCategoryModal
                show={showCreateCategoryModal}
                onClose={() => setShowCreateCategoryModal(false)}
                onSuccess={fetchInventoryData}
            />

            <CreateUnitModal
                show={showCreateUnitModal}
                onClose={() => setShowCreateUnitModal(false)}
                onSuccess={fetchInventoryData}
            />

            <CreateLocationModal
                show={showCreateLocationModal}
                onClose={() => setShowCreateLocationModal(false)}
                onSuccess={() => {
                    setShowCreateLocationModal(false);
                    // If you need to refresh locations in any dropdowns
                    fetchLocations(); // Add this function if you don't have it already
                }}
            />

            <ViewLocationsModal
                show={showViewLocationsModal}
                onClose={() => setShowViewLocationsModal(false)}
            />
        </AppLayout>
    );
}
