import { useState } from 'react';
import axios from 'axios';
import { LoaderCircle, X, Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_of_measure?: {
    abbreviation: string;
  };
};

type AdjustQuantityModalProps = {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: InventoryItem | null;
};

export default function AdjustQuantityModal({ show, onClose, onSuccess, item }: AdjustQuantityModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!quantity || parseFloat(quantity) <= 0) {
      setErrors({ quantity: 'Please enter a valid quantity' });
      setIsSubmitting(false);
      return;
    }

    if (!reason.trim()) {
      setErrors({ reason: 'Please provide a reason for the adjustment' });
      setIsSubmitting(false);
      return;
    }

    const adjustmentData = {
      quantity: parseFloat(quantity),
      adjustment_type: adjustmentType,
      reason: reason
    };

    axios.post(`/api/inventory/items/${item.id}/adjust`, adjustmentData)
      .then(() => {
        onSuccess();
        onClose();
        // Reset form
        setAdjustmentType('add');
        setQuantity('1');
        setReason('');
      })
      .catch(error => {
        console.error('Error adjusting quantity:', error);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Adjust Inventory Quantity</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 bg-blue-50 p-3 rounded-md">
          <div className="flex items-center">
            {item.unit_of_measure ? (
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            ) : (
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-700">{item.name}</p>
              <p className="text-sm text-gray-500">
                Current Stock: {item.quantity} {item.unit_of_measure?.abbreviation || ''}
              </p>
              <p className="text-sm text-gray-500">SKU: {item.sku}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center px-4 py-2 rounded-md border ${
                  adjustmentType === 'add'
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setAdjustmentType('add')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </button>
              <button
                type="button"
                className={`flex items-center justify-center px-4 py-2 rounded-md border ${
                  adjustmentType === 'remove'
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setAdjustmentType('remove')}
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove Stock
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'}</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
              className="w-full"
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <textarea
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder="Explain why you're adjusting the quantity"
              className="w-full p-2 border rounded-md min-h-[80px]"
              rows={3}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {errors.general && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
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
              className={adjustmentType === 'add' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              {adjustmentType === 'add' ? 'Add to Inventory' : 'Remove from Inventory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}