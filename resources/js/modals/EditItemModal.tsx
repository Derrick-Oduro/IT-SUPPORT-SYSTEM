import { useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { LoaderCircle, X, Upload, Camera, Package, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Category = {
    id: number;
    name: string;
};

type UnitOfMeasure = {
    id: number;
    name: string;
    abbreviation: string;
};

type Location = {
    id: number;
    name: string;
};

type InventoryItem = {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    category_id: number | null;
    uom_id: number | null;
    location_id: number | null;
    quantity: number;
    reorder_level: number;
    unit_price: number | null;
    is_active: boolean;
    image_path: string | null;
};

type EditItemModalProps = {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: InventoryItem | null;
    categories: Category[];
    units: UnitOfMeasure[];
    locations: Location[];
};

export default function EditItemModal({ show, onClose, onSuccess, item, categories, units, locations }: EditItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        uom_id: '',
        location_id: '',
        reorder_level: '0',
        unit_price: '',
        is_active: true,
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Update form when item prop changes
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                sku: item.sku || '',
                description: item.description || '',
                category_id: item.category_id ? String(item.category_id) : '',
                uom_id: item.uom_id ? String(item.uom_id) : '',
                location_id: item.location_id ? String(item.location_id) : '',
                reorder_level: String(item.reorder_level) || '0',
                unit_price: item.unit_price ? String(item.unit_price) : '',
                is_active: item.is_active,
            });

            // Set image preview if item has an image
            if (item.image_path) {
                setImagePreview(`/storage/${item.image_path}`);
            } else {
                setImagePreview(null);
            }
        }
    }, [item]);

    if (!show || !item) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);

            // Create a preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string || null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formDataToSend = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'is_active') {
                formDataToSend.append(key, value ? '1' : '0');
            } else if (value !== '') {
                formDataToSend.append(key, String(value));
            }
        });

        if (selectedImage) {
            formDataToSend.append('image', selectedImage);
        }

        axios.post(`/api/inventory/items/${item.id}?_method=PUT`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(() => {
                onSuccess();
                onClose();
            })
            .catch(error => {
                console.error('Error updating inventory item:', error);
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleDelete = () => {
        if (!item) return;

        setIsDeleting(true);

        axios.delete(`/api/inventory/items/${item.id}`)
            .then(() => {
                onSuccess();
                onClose();
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                setErrors({ general: 'Failed to delete item. Please try again.' });
            })
            .finally(() => {
                setIsDeleting(false);
                setShowDeleteConfirm(false);
            });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Inventory Item</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Item name"
                            className="w-full"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            type="text"
                            required
                            value={formData.sku}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Stock keeping unit"
                            className="w-full"
                        />
                        {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Item description"
                            className="w-full p-2 border rounded-md min-h-[80px]"
                            rows={3}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="uom_id">Unit of Measure</Label>
                        <select
                            id="uom_id"
                            name="uom_id"
                            value={formData.uom_id}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select a unit</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</option>
                            ))}
                        </select>
                        {errors.uom_id && <p className="text-red-500 text-xs mt-1">{errors.uom_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location_id">Storage Location (optional)</Label>
                        <select
                            id="location_id"
                            name="location_id"
                            value={formData.location_id}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select a location</option>
                            {(locations || []).map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        {errors.location_id && <p className="text-red-500 text-xs mt-1">{errors.location_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reorder_level">Reorder Level</Label>
                        <Input
                            id="reorder_level"
                            name="reorder_level"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={formData.reorder_level}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full"
                        />
                        {errors.reorder_level && <p className="text-red-500 text-xs mt-1">{errors.reorder_level}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="unit_price">Unit Price (optional)</Label>
                        <Input
                            id="unit_price"
                            name="unit_price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.unit_price}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="0.00"
                            className="w-full"
                        />
                        {errors.unit_price && <p className="text-red-500 text-xs mt-1">{errors.unit_price}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Item Image (optional)</Label>
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                            className="w-full"
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}

                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-32 w-32 object-cover rounded border p-1"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleCheckboxChange}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <Label htmlFor="is_active" className="text-sm text-gray-700">Item is active</Label>
                    </div>
                    {errors.is_active && <p className="text-red-500 text-xs mt-1">{errors.is_active}</p>}

                    <div className="flex justify-end gap-2 mt-6">
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
                            Save Changes
                        </Button>
                    </div>
                </form>

                {showDeleteConfirm ? (
                    <div className="mt-4 border-t pt-4">
                        <div className="bg-red-50 p-4 rounded-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Are you sure you want to delete this item?
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>This action cannot be undone. This will permanently delete the item and all associated transaction history.</p>
                                    </div>
                                    <div className="mt-4 flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                                            Yes, delete item
                                        </Button>
                                        <button
                                            type="button"
                                            className="text-red-700 bg-red-100 px-4 py-2 rounded-md hover:bg-red-200"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete this item
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            Remove this item completely from inventory
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
