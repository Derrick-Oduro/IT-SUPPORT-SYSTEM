import { useState, useEffect } from 'react';
import axios from 'axios';
import { LoaderCircle, X, ArrowUp, ArrowDown, Package, Clock, User } from 'lucide-react';

type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_of_measure?: {
    abbreviation: string;
  };
};

type Transaction = {
  id: number;
  quantity: number;
  previous_quantity: number;
  transaction_type: string;
  reason: string;
  created_at: string;
  created_by?: {
    name: string;
  };
};

type ViewTransactionsModalProps = {
  show: boolean;
  onClose: () => void;
  item: InventoryItem | null;
};

export default function ViewTransactionsModal({ show, onClose, item }: ViewTransactionsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && item) {
      fetchTransactions();
    }
  }, [show, item]);

  const fetchTransactions = () => {
    if (!item) return;
    
    setIsLoading(true);
    setError('');
    
    axios.get(`/api/inventory/items/${item.id}/transactions`)
      .then(response => {
        console.log('Transaction data:', response.data); // Debug response
        setTransactions(response.data);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transaction history');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!show || !item) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString || 'Unknown date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Inventory Transactions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 bg-blue-50 p-4 rounded-md">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600">SKU: {item.sku}</p>
              <p className="text-sm font-medium text-gray-800">
                Current Stock: {item.quantity} {item.unit_of_measure?.abbreviation || ''}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading transaction history...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>{error}</p>
            <button 
              onClick={fetchTransactions}
              className="text-red-700 underline mt-2"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No transaction history available for this item</p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flow-root">
              <ul className="-mb-8">
                {transactions.map((transaction, index) => (
                  <li key={transaction.id}>
                    <div className="relative pb-8">
                      {index !== transactions.length - 1 ? (
                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${
                            transaction.transaction_type === 'add' 
                              ? 'bg-green-100' 
                              : transaction.transaction_type === 'remove' 
                                ? 'bg-red-100' 
                                : 'bg-gray-100'
                          }`}>
                            {transaction.transaction_type === 'add' ? (
                              <ArrowUp className="h-5 w-5 text-green-600" />
                            ) : transaction.transaction_type === 'remove' ? (
                              <ArrowDown className="h-5 w-5 text-red-600" />
                            ) : (
                              <Package className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {transaction.transaction_type === 'add' 
                                  ? 'Stock Added' 
                                  : transaction.transaction_type === 'remove' 
                                    ? 'Stock Removed' 
                                    : 'Adjustment'}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              <Clock className="inline-block h-3.5 w-3.5 mr-1" />
                              {formatDate(transaction.created_at)}
                              <span className="mx-1">•</span>
                              <User className="inline-block h-3.5 w-3.5 mr-1" />
                              {/* Fixed null check for created_by */}
                              {transaction.created_by ? transaction.created_by.name : 'Unknown User'}
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {transaction.transaction_type === 'add' 
                                  ? `Added ${transaction.quantity} ${item.unit_of_measure?.abbreviation || 'units'}`
                                  : `Removed ${transaction.quantity} ${item.unit_of_measure?.abbreviation || 'units'}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                {transaction.previous_quantity} → {
                                  // Calculate the new quantity based on transaction type
                                  transaction.previous_quantity + 
                                  (transaction.transaction_type === 'add' ? transaction.quantity : -transaction.quantity)
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{transaction.reason || 'No reason provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}