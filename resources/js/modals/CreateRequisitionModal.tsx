import { useState, useEffect } from 'react';
import axios from 'axios';
import { LoaderCircle, X, Plus, Trash2, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequisitionItem } from '@/types/requisition';

type InventoryItem = {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    is_active: boolean;
    unit_of_measure?: {
        abbreviation: string;
    };
};

type RequisitionItemForm = {
    item_id: number;
    item: InventoryItem;
    quantity: number;
};

type CreateRequisitionModalProps = {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CreateRequisitionModal({ show, onClose, onSuccess }: CreateRequisitionModalProps) {
    const [formData, setFormData] = useState({
        item_id: '',
        quantity: 1,
        location_id: '',
    });

    const [items, setItems] = useState<RequisitionItemForm[]>([]);
    const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    useEffect(() => {
        if (show) {
            // Reset form when modal opens
            setFormData({
                item_id: '',
                quantity: 1,
                location_id: '',
            });
            setItems([]);
            setErrors({});
            fetchInventoryItems();
            fetchLocations();
        }
    }, [show]);

    useEffect(() => {
        filterItems();
    }, [searchQuery, availableItems]);

    // Modify the fetchInventoryItems function
    const fetchInventoryItems = () => {
        setIsLoadingItems(true);

        axios.get('/api/inventory/items')
            .then(response => {
                console.log('Inventory API response:', response.data);

                // Get items from the response
                let items = [];

                // Check if response.data.items exists (from getItems method)
                if (response.data && response.data.items && Array.isArray(response.data.items)) {
                    items = response.data.items;
                }
                // Check if response.data is an array directly (from index method)
                else if (Array.isArray(response.data)) {
                    items = response.data;
                }

                console.log('Extracted items:', items);

                // Debug each item for filtering issues
                items.forEach((item, index) => {
                    console.log(`Item ${index}:`, item);
                    console.log(`- is object:`, typeof item === 'object' && item !== null);
                    console.log(`- is_active:`, item.is_active);
                    console.log(`- quantity type:`, typeof item.quantity);
                    console.log(`- quantity value:`, item.quantity);
                    console.log(`- Would pass filter:`, 
                        item && 
                        typeof item === 'object' && 
                        item.is_active !== false && 
                        typeof item.quantity === 'number' && 
                        item.quantity > 0
                    );
                });

                // Use more lenient filtering to include items
                const activeItems = items.filter(item => {
                    // Make sure item exists and is an object
                    if (!item || typeof item !== 'object') {
                        return false;
                    }
                    
                    // Check active status - consider it active unless explicitly set to false
                    const isActive = item.is_active !== false;
                    
                    // Check quantity - try to convert to number if it's a string
                    let itemQuantity = item.quantity;
                    if (typeof itemQuantity === 'string') {
                        itemQuantity = parseFloat(itemQuantity);
                    }
                    
                    const hasStock = typeof itemQuantity === 'number' && !isNaN(itemQuantity) && itemQuantity > 0;
                    
                    return isActive && hasStock;
                });

                console.log('Active items with stock:', activeItems);
                setAvailableItems(activeItems);
                
                // If we still have no items, add a test item for debugging
                if (activeItems.length === 0 && items.length > 0) {
                    console.log('Adding the first inventory item regardless of filters for testing');
                    // Take the first item and force it to have the right properties
                    const testItem = {
                        ...items[0],
                        is_active: true,
                        quantity: items[0].quantity > 0 ? items[0].quantity : 10
                    };
                    setAvailableItems([testItem]);
                }
            })
            .catch(error => {
                console.error('Error fetching inventory items:', error);
            })
            .finally(() => {
                setIsLoadingItems(false);
            });
    };

    const fetchLocations = () => {
        setIsLoadingLocations(true);

        axios.get('/api/locations')
            .then(response => {
                console.log('Locations API response:', response.data);
                setLocations(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
            })
            .finally(() => {
                setIsLoadingLocations(false);
            });
    };

    // Update the filterItems function to be more robust
    const filterItems = () => {
        console.log('Filtering items. Search query:', searchQuery, 'Available items count:', availableItems.length);

        if (!searchQuery.trim()) {
            console.log('Empty search query, clearing filtered items');
            setFilteredItems([]);
            return;
        }

        // If no available items, show a more helpful message
        if (availableItems.length === 0) {
            console.log('No available items to filter');
            setFilteredItems([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = availableItems.filter((item: any) => {
            // Safely check name and sku
            const nameMatch = item.name && typeof item.name === 'string' &&
                item.name.toLowerCase().includes(query);
            const skuMatch = item.sku && typeof item.sku === 'string' &&
                item.sku.toLowerCase().includes(query);

            return nameMatch || skuMatch;
        });

        console.log('Filtered items by search:', filtered.length);
        setFilteredItems(filtered);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = (item: InventoryItem) => {
        setItems(prev => [
            ...prev,
            {
                item_id: item.id,
                item: item,
                quantity: 1
            }
        ]);
        setSearchQuery('');
        setShowItemSearch(false);
    };

    const handleRemoveItem = (itemId: number) => {
        setItems(prev => prev.filter(item => item.item_id !== itemId));
    };

    const handleQuantityChange = (index: number, value: string) => {
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) return;

        setItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], quantity };
            return updated;
        });
    };

    // Update your validateForm function
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.item_id) {
            newErrors.item_id = 'Please select an item';
        }

        if (!formData.quantity || formData.quantity < 1) {
            newErrors.quantity = 'Quantity must be at least 1';
        }

        if (!formData.location_id) {
            newErrors.location_id = 'Please select a location';
        }

        // Check if quantity exceeds available stock
        if (formData.item_id && formData.quantity) {
            const selectedItem = availableItems.find(item => item.id.toString() === formData.item_id.toString());
            if (selectedItem && formData.quantity > selectedItem.quantity) {
                newErrors.quantity = `Requested quantity exceeds available stock (${selectedItem.quantity})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Update your handleSubmit function
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const requestData = {
            item_id: parseInt(formData.item_id as string),
            quantity: parseInt(formData.quantity.toString()),
            location_id: parseInt(formData.location_id as string)
        };

        console.log('Submitting requisition:', requestData);

        axios.post('/api/requisitions', requestData)
            .then(response => {
                console.log('Requisition created:', response.data);
                onSuccess();
                onClose();
            })
            .catch(error => {
                console.error('Error creating requisition:', error);

                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setErrors({ general: 'Failed to create requisition. Please try again.' });
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create New Requisition</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="item_id" className="block text-sm font-medium text-gray-700">
                            Select Item *
                        </Label>
                        <select
                            id="item_id"
                            name="item_id"
                            value={formData.item_id}
                            onChange={handleTextChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={isSubmitting || isLoadingItems}
                        >
                            <option value="">Select an item</option>
                            {availableItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} - {item.sku} ({item.quantity} {item.unit_of_measure?.abbreviation || 'units'} available)
                                </option>
                            ))}
                        </select>
                        {isLoadingItems && (
                            <div className="mt-1 flex items-center">
                                <LoaderCircle className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                                <span className="text-sm text-gray-500">Loading items...</span>
                            </div>
                        )}
                        {errors.item_id && <p className="text-red-500 text-xs mt-1">{errors.item_id}</p>}
                    </div>

                    <div>
                        <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                            Quantity *
                        </Label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleTextChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.quantity
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            min="1"
                            disabled={isSubmitting}
                        />
                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                    </div>

                    <div>
                        <Label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
                            Select Location *
                        </Label>
                        <select
                            id="location_id"
                            name="location_id"
                            value={formData.location_id}
                            onChange={handleTextChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={isSubmitting || isLoadingLocations}
                        >
                            <option value="">Select a location</option>
                            {locations.map(location => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                        {isLoadingLocations && (
                            <div className="mt-1 flex items-center">
                                <LoaderCircle className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                                <span className="text-sm text-gray-500">Loading locations...</span>
                            </div>
                        )}
                        {errors.location_id && <p className="text-red-500 text-xs mt-1">{errors.location_id}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="block text-sm font-medium text-gray-700">
                                Items to Request
                            </Label>
                            <button
                                type="button"
                                onClick={() => setShowItemSearch(true)}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                disabled={isSubmitting}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                            </button>
                        </div>

                        {errors.items && <p className="text-red-500 text-xs mb-2">{errors.items}</p>}

                        {showItemSearch && (
                            <div className="mb-4 border p-3 rounded-md bg-gray-50">
                                <div className="flex items-center mb-3">
                                    <div className="relative flex-grow">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="pl-10 py-2 pr-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="Search items by name or SKU..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowItemSearch(false);
                                            setSearchQuery('');
                                        }}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {isLoadingItems ? (
                                    <div className="flex justify-center items-center h-24">
                                        <LoaderCircle className="h-5 w-5 animate-spin text-blue-500" />
                                        <span className="ml-2 text-sm text-gray-600">Loading items...</span>
                                    </div>
                                ) : availableItems.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No inventory items available</p>
                                        <p className="text-xs text-gray-400 mt-1">Make sure you have active items with stock in your inventory</p>
                                    </div>
                                ) : searchQuery.trim() === '' ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">Type to search for items</p>
                                        <p className="text-xs text-gray-400 mt-1">Available items: {availableItems.length}</p>
                                    </div>
                                ) : filteredItems.length > 0 ? (
                                    <div className="max-h-48 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200">
                                            {filteredItems.map(item => (
                                                <li key={item.id} className="py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddItem(item)}
                                                        className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center">
                                                            <Package className="h-5 w-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            Available: {item.quantity} {item.unit_of_measure?.abbreviation || ''}
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No matching items found for "{searchQuery}"</p>
                                        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {items.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Available
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.map((item, index) => (
                                            <tr key={item.item_id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.item.name}</div>
                                                            <div className="text-xs text-gray-500">SKU: {item.item.sku}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                        {item.item.quantity} {item.item.unit_of_measure?.abbreviation || ''}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.item.quantity}
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                            className={`block w-20 rounded-md shadow-sm sm:text-sm ${errors[`item_${index}`]
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            disabled={isSubmitting}
                                                        />
                                                        <span className="ml-1 text-xs text-gray-500">
                                                            {item.item.unit_of_measure?.abbreviation || ''}
                                                        </span>
                                                    </div>
                                                    {errors[`item_${index}`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`item_${index}`]}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.item_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={isSubmitting}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed rounded-md">
                                <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No items added yet</p>
                                <button
                                    type="button"
                                    onClick={() => setShowItemSearch(true)}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Click "Add Item" to start
                                </button>
                            </div>
                        )}
                    </div>

                    {errors.general && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                            Create Requisition
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
