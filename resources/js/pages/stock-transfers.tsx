import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import { Plus, RefreshCw, Package, MapPin, X } from 'lucide-react';

type Location = { id: number; name: string };
type Item = { id: number; name: string; quantity: number };
type Transfer = {
    id: number;
    reference: string;
    date: string;
    from_location: Location;
    to_location: Location;
    items: { item: Item; quantity: number }[];
    status: string;
    created_by: { name: string };
    notes?: string;
};
type StockTransaction = {
    id: number;
    item: { id: number; name: string };
    type: 'in' | 'out';
    quantity: number;
    reason?: string;
    location: { id: number; name: string };
    user: { id: number; name: string };
    created_at: string;
};

export default function StockTransfers() {
    const [showModal, setShowModal] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [form, setForm] = useState({
        from_location_id: '',
        to_location_id: '',
        item_id: '',
        quantity: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/api/locations').then(res => setLocations(res.data));
        axios.get('/api/inventory/items').then(res => setItems(res.data.items || res.data));
        fetchTransactions();
    }, []);

    function fetchTransfers() {
        setLoading(true);
        axios.get('/api/stock-transfers')
            .then(res => setTransfers(res.data))
            .finally(() => setLoading(false));
    }
    function fetchTransactions() {
        axios.get('/api/stock-transactions').then(res => setTransactions(res.data));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (
            !form.from_location_id ||
            !form.to_location_id ||
            !form.item_id ||
            !form.quantity ||
            form.from_location_id === form.to_location_id
        ) {
            setError('Please fill all fields and select different locations.');
            setIsSubmitting(false);
            return;
        }

        axios.post('/api/stock-transfers', form)
            .then(() => {
                setShowModal(false);
                setForm({
                    from_location_id: '',
                    to_location_id: '',
                    item_id: '',
                    quantity: '',
                    notes: '',
                });
                fetchTransfers();
            })
            .catch(err => setError(err.response?.data?.error || 'Failed to create transfer'))
            .finally(() => setIsSubmitting(false));
    }

    return (
        <AppLayout>
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Package className="h-8 w-8 mr-2 text-blue-600" />
                        Stock Transfers
                    </h1>
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Transfer
                    </button>
                </div>
                <p className="text-gray-600 mb-2">
                    Transfer inventory between locations and track transfer history.
                </p>
                <button
                    onClick={fetchTransfers}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* --- Transfer History Section --- */}
            <section className="mb-10">
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-semibold p-4 border-b">Transfer History</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <caption className="sr-only">Transfer History Table</caption>
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Reference</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">From</th>
                                <th className="px-4 py-2 text-left">To</th>
                                <th className="px-4 py-2 text-left">Item(s)</th>
                                <th className="px-4 py-2 text-left">Qty</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Created By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-400 animate-pulse">
                                        Loading...
                                    </td>
                                </tr>
                            ) : transfers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-400">
                                        <MapPin className="mx-auto mb-2 h-8 w-8" />
                                        No transfers found.
                                    </td>
                                </tr>
                            ) : (
                                transfers.map(tr => (
                                    <tr key={tr.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{tr.reference}</td>
                                        <td className="px-4 py-2">{new Date(tr.date).toLocaleString()}</td>
                                        <td className="px-4 py-2">{tr.from_location?.name}</td>
                                        <td className="px-4 py-2">{tr.to_location?.name}</td>
                                        <td className="px-4 py-2">
                                            {Array.isArray(tr.items) ? tr.items.map(i => i.item.name).join(', ') : '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                            {Array.isArray(tr.items) ? tr.items.map(i => i.quantity).join(', ') : '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${tr.status === 'completed' ? 'bg-green-100 text-green-800' : tr.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {tr.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{tr.created_by?.name}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* --- Stock Transactions Section --- */}
            <section>
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-semibold p-4 border-b">Stock Transactions</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <caption className="sr-only">Stock Transactions Table</caption>
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Item</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Quantity</th>
                                <th className="px-4 py-2 text-left">Reason</th>
                                <th className="px-4 py-2 text-left">Location</th>
                                <th className="px-4 py-2 text-left">User</th>
                                <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-400">
                                        <Package className="mx-auto mb-2 h-8 w-8" />
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{tx.id}</td>
                                        <td className="px-4 py-2">{tx.item?.name}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${tx.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {tx.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{tx.quantity}</td>
                                        <td className="px-4 py-2">{tx.reason || '-'}</td>
                                        <td className="px-4 py-2">{tx.location?.name}</td>
                                        <td className="px-4 py-2">{tx.user?.name}</td>
                                        <td className="px-4 py-2">{new Date(tx.created_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Package className="h-5 w-5 mr-2 text-blue-600" />
                            New Stock Transfer
                        </h2>
                        {error && <div className="mb-2 text-red-600">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block mb-1 font-medium">From Location</label>
                                <select
                                    name="from_location_id"
                                    value={form.from_location_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-1"
                                    required
                                >
                                    <option value="">Select location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="block mb-1 font-medium">To Location</label>
                                <select
                                    name="to_location_id"
                                    value={form.to_location_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-1"
                                    required
                                >
                                    <option value="">Select location</option>
                                    {locations
                                        .filter(loc => loc.id.toString() !== form.from_location_id)
                                        .map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="block mb-1 font-medium">Item</label>
                                <select
                                    name="item_id"
                                    value={form.item_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-1"
                                    required
                                >
                                    <option value="">Select item</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Available: {item.quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="block mb-1 font-medium">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-1"
                                    min={1}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block mb-1 font-medium">Notes</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
