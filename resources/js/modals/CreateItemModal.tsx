import { useState, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import { LoaderCircle, X, Upload, Camera, Package } from 'lucide-react';
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

type CreateItemModalProps = {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: Category[];
    units: UnitOfMeasure[];
    locations: Location[]; // <-- Add this
};

export default function CreateItemModal({
    show,
    onClose,
    onSuccess,
    categories,
    units,
    locations // <-- Add this
}: CreateItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        uom_id: '',
        quantity: '0',
        reorder_level: '0',
        unit_price: '',
        location_id: '',
        is_active: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!show) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty string or valid numbers
        if (value === '' || !isNaN(parseFloat(value))) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            setErrors(prev => ({ ...prev, image: 'Please select an image file (JPEG, PNG, GIF)' }));
            return;
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Image size should be less than 2MB' }));
            return;
        }

        setImageFile(file);

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const generateSKU = () => {
        // Simple SKU generator: prefix + timestamp
        const prefix = formData.name.trim() ? formData.name.substring(0, 3).toUpperCase() : 'ITM';
        const timestamp = new Date().getTime().toString().slice(-6);
        const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();

        const sku = `${prefix}-${randomChars}${timestamp}`;
        setFormData(prev => ({ ...prev, sku }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Item name is required';
        }

        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU is required';
        }

        if (formData.quantity && parseFloat(formData.quantity) < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }

        if (formData.reorder_level && parseFloat(formData.reorder_level) < 0) {
            newErrors.reorder_level = 'Reorder level cannot be negative';
        }

        if (formData.unit_price && parseFloat(formData.unit_price) < 0) {
            newErrors.unit_price = 'Price cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Create FormData object for file upload
        const submitData = new FormData();

        // Add all form fields
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'is_active') {
                submitData.append(key, value ? '1' : '0');
            } else {
                submitData.append(key, value.toString());
            }
        });

        // Add image if exists
        if (imageFile) {
            submitData.append('image', imageFile);
        }

        axios.post('/api/inventory/items', submitData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                onSuccess();
                onClose();
                resetForm();
            })
            .catch(error => {
                console.error('Error creating inventory item:', error);

                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setErrors({ general: 'Failed to create item. Please try again.' });
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sku: '',
            description: '',
            category_id: '',
            uom_id: '',
            quantity: '0',
            reorder_level: '0',
            unit_price: '',
            location_id: '',
            is_active: true
        });
        setImagePreview(null);
        setImageFile(null);
        setErrors({});
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Inventory Item</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Item Name *
                            </Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                                    SKU (Stock Keeping Unit) *
                                </Label>
                                <button
                                    type="button"
                                    onClick={generateSKU}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Generate SKU
                                </button>
                            </div>
                            <Input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="mt-1"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </Label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                rows={3}
                                disabled={isSubmitting}
                            ></textarea>
                        </div>

                        <div>
                            <Label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                                Category
                            </Label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={isSubmitting}
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
                                Storage Location
                            </Label>
                            <select
                                id="location_id"
                                name="location_id"
                                value={formData.location_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={isSubmitting}
                                required
                            >
                                <option value="">Select a location</option>
                                {(locations || []).map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleCheckboxChange}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="is_active" className="text-sm text-gray-700">
                                Item is active and available
                            </Label>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="uom_id" className="block text-sm font-medium text-gray-700">
                                Unit of Measure
                            </Label>
                            <select
                                id="uom_id"
                                name="uom_id"
                                value={formData.uom_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={isSubmitting}
                            >
                                <option value="">Select a unit</option>
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name} ({unit.abbreviation})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Initial Quantity
                            </Label>
                            <Input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleNumberChange}
                                className="mt-1"
                                min="0"
                                step="0.01"
                                disabled={isSubmitting}
                            />
                            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                        </div>

                        <div>
                            <Label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700">
                                Reorder Level
                            </Label>
                            <Input
                                type="number"
                                id="reorder_level"
                                name="reorder_level"
                                value={formData.reorder_level}
                                onChange={handleNumberChange}
                                className="mt-1"
                                min="0"
                                step="1"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum quantity before restocking is recommended
                            </p>
                            {errors.reorder_level && <p className="text-red-500 text-xs mt-1">{errors.reorder_level}</p>}
                        </div>

                        <div>
                            <Label htmlFor="unit_price" className="block text-sm font-medium text-gray-700">
                                Unit Price ($)
                            </Label>
                            <Input
                                type="number"
                                id="unit_price"
                                name="unit_price"
                                value={formData.unit_price}
                                onChange={handleNumberChange}
                                className="mt-1"
                                min="0"
                                step="0.01"
                                disabled={isSubmitting}
                            />
                            {errors.unit_price && <p className="text-red-500 text-xs mt-1">{errors.unit_price}</p>}
                        </div>

                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Image
                            </Label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageChange}
                                accept="image/*"
                                disabled={isSubmitting}
                            />

                            {imagePreview ? (
                                <div className="mt-2 relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 w-32 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={triggerFileInput}
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="space-y-1 text-center">
                                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                                                <span>Upload an image</span>
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                    </div>
                                </div>
                            )}
                            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                        </div>
                    </div>

                    {/* Full width section for errors and buttons */}
                    <div className="col-span-1 md:col-span-2">
                        {errors.general && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
                                {errors.general}
                            </div>
                        )}

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
                                Create Item
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
