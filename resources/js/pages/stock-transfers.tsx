import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import {
    Plus, RefreshCw, Package, MapPin, X, Eye, ArrowRight,
    TrendingUp, TrendingDown, Activity, Search, Filter,
    ChevronDown, Calendar, User, Hash, FileText
} from 'lucide-react';

type Location = {
    id: number;
    name: string;
};

type Item = {
    id: number;
    name: string;
    sku?: string;
    quantity: number;
};

type User = {
    id: number;
    name: string;
};

type Transfer = {
    id: number;
    reference: string;
    date: string;
    from_location: Location;
    to_location: Location;
    items: { item: Item; quantity: number }[];
    status: string;
    created_by: User;
    notes?: string;
};

type StockTransaction = {
    id: number;
    item: { id: number; name: string; sku?: string };
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    reason?: string;
    location: Location;
    user: User;
    created_at: string;
    reference?: string;
    from_location?: Location;
    to_location?: Location;
    notes?: string;
};

export default function StockTransfers() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<StockTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const [form, setForm] = useState({
        from_location_id: '',
        to_location_id: '',
        item_id: '',
        quantity: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, searchQuery, typeFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [locationsRes, itemsRes, transactionsRes] = await Promise.all([
                axios.get('/api/locations'),
                axios.get('/api/inventory/items'),
                axios.get('/api/stock-transactions')
            ]);

            setLocations(locationsRes.data);
            setItems(itemsRes.data.items || itemsRes.data);
            setTransactions(transactionsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterTransactions = () => {
        let filtered = [...transactions];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(tx =>
                tx.item?.name?.toLowerCase().includes(query) ||
                tx.item?.sku?.toLowerCase().includes(query) ||
                tx.reference?.toLowerCase().includes(query) ||
                tx.user?.name?.toLowerCase().includes(query) ||
                tx.location?.name?.toLowerCase().includes(query)
            );
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(tx => tx.type === typeFilter);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setFilteredTransactions(filtered);
    };

    const handleViewDetails = (transaction: StockTransaction) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

        try {
            await axios.post('/api/stock-transfers', form);
            setShowCreateModal(false);
            setForm({
                from_location_id: '',
                to_location_id: '',
                item_id: '',
                quantity: '',
                notes: '',
            });
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create transfer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'in':
                return <TrendingUp className="h-4 w-4" />;
            case 'out':
                return <TrendingDown className="h-4 w-4" />;
            case 'transfer':
                return <ArrowRight className="h-4 w-4" />;
            case 'adjustment':
                return <Activity className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'in':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                        <TrendingUp className="h-3 w-3" />
                        Stock In
                    </span>
                );
            case 'out':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
                        <TrendingDown className="h-3 w-3" />
                        Stock Out
                    </span>
                );
            case 'transfer':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                        <ArrowRight className="h-3 w-3" />
                        Transfer
                    </span>
                );
            case 'adjustment':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                        <Activity className="h-3 w-3" />
                        Adjustment
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {type}
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get transaction stats
    const getTransactionStats = () => {
        const total = filteredTransactions.length;
        const stockIn = filteredTransactions.filter(tx => tx.type === 'in').length;
        const stockOut = filteredTransactions.filter(tx => tx.type === 'out').length;
        const transfers = filteredTransactions.filter(tx => tx.type === 'transfer').length;
        return { total, stockIn, stockOut, transfers };
    };

    const stats = getTransactionStats();

    return (
        <AppLayout>
            <Head title="Stock Transfers & Transactions" />

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                            Stock Movement
                        </h1>
                        <p className="text-gray-600">Track all stock transactions and transfers</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        New Transfer
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Activity className="w-6 h-6" />}
                    label="Total Transactions"
                    value={stats.total}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Stock In"
                    value={stats.stockIn}
                    color="green"
                />
                <StatCard
                    icon={<TrendingDown className="w-6 h-6" />}
                    label="Stock Out"
                    value={stats.stockOut}
                    color="red"
                />
                <StatCard
                    icon={<ArrowRight className="w-6 h-6" />}
                    label="Transfers"
                    value={stats.transfers}
                    color="purple"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                placeholder="Search by item, SKU, reference, user, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            showFilters
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all duration-200"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                                <select
                                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="in">Stock In</option>
                                    <option value="out">Stock Out</option>
                                    <option value="transfer">Transfers</option>
                                    <option value="adjustment">Adjustments</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                            <span className="text-gray-600 font-medium">Loading transactions...</span>
                        </div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-4">
                            <Activity className="h-16 w-16 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery ? 'Try adjusting your search terms' : 'No stock movements recorded yet'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Item Details
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date & User
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-lg">
                                                    {getTypeIcon(transaction.type)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-lg mb-1">
                                                        {transaction.item?.name || 'Unknown Item'}
                                                    </div>
                                                    {transaction.item?.sku && (
                                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                                            <Hash className="h-3 w-3" />
                                                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                                {transaction.item.sku}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {transaction.reference && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Ref: {transaction.reference}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getTypeBadge(transaction.type)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-lg font-bold ${
                                                transaction.type === 'in' ? 'text-green-600' :
                                                transaction.type === 'out' ? 'text-red-600' :
                                                'text-blue-600'
                                            }`}>
                                                {transaction.type === 'out' ? '-' : '+'}{transaction.quantity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {transaction.location?.name || 'Unknown Location'}
                                                </span>
                                            </div>
                                            {transaction.type === 'transfer' && transaction.from_location && transaction.to_location && (
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <span>{transaction.from_location.name}</span>
                                                    <ArrowRight className="h-3 w-3" />
                                                    <span>{transaction.to_location.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(transaction.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-xs">
                                                    {(transaction.user?.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {transaction.user?.name || 'Unknown User'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <button
                                                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                                                    onClick={() => handleViewDetails(transaction)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Transfer Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            onClick={() => setShowCreateModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-lg">
                                <Package className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">New Stock Transfer</h2>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="text-red-800 text-sm">{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">From Location</label>
                                <select
                                    name="from_location_id"
                                    value={form.from_location_id}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="">Select source location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">To Location</label>
                                <select
                                    name="to_location_id"
                                    value={form.to_location_id}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="">Select destination location</option>
                                    {locations
                                        .filter(loc => loc.id.toString() !== form.from_location_id)
                                        .map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Item</label>
                                <select
                                    name="item_id"
                                    value={form.item_id}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="">Select item to transfer</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Available: {item.quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    min={1}
                                    placeholder="Enter quantity to transfer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Add any notes about this transfer..."
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Transfer...' : 'Create Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Detail Modal */}
            {showDetailModal && selectedTransaction && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            onClick={() => setShowDetailModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-3 shadow-lg">
                                {getTypeIcon(selectedTransaction.type)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                                <p className="text-gray-600">ID: #{selectedTransaction.id}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Item Information
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">Name:</span>
                                            <p className="font-medium">{selectedTransaction.item?.name}</p>
                                        </div>
                                        {selectedTransaction.item?.sku && (
                                            <div>
                                                <span className="text-sm text-gray-500">SKU:</span>
                                                <p className="font-mono text-sm bg-white px-2 py-1 rounded">{selectedTransaction.item.sku}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Transaction Info
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">Type:</span>
                                            <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Quantity:</span>
                                            <p className={`font-bold text-lg ${
                                                selectedTransaction.type === 'in' ? 'text-green-600' :
                                                selectedTransaction.type === 'out' ? 'text-red-600' :
                                                'text-blue-600'
                                            }`}>
                                                {selectedTransaction.type === 'out' ? '-' : '+'}{selectedTransaction.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location Details
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm text-gray-500">Location:</span>
                                        <p className="font-medium">{selectedTransaction.location?.name}</p>
                                    </div>
                                    {selectedTransaction.type === 'transfer' && selectedTransaction.from_location && selectedTransaction.to_location && (
                                        <div>
                                            <span className="text-sm text-gray-500">Transfer Route:</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-white px-3 py-1 rounded-lg font-medium">{selectedTransaction.from_location.name}</span>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                                <span className="bg-white px-3 py-1 rounded-lg font-medium">{selectedTransaction.to_location.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        User & Date
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">Created by:</span>
                                            <p className="font-medium">{selectedTransaction.user?.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Date:</span>
                                            <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {(selectedTransaction.reference || selectedTransaction.reason) && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Additional Info
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedTransaction.reference && (
                                                <div>
                                                    <span className="text-sm text-gray-500">Reference:</span>
                                                    <p className="font-mono text-sm bg-white px-2 py-1 rounded">{selectedTransaction.reference}</p>
                                                </div>
                                            )}
                                            {selectedTransaction.reason && (
                                                <div>
                                                    <span className="text-sm text-gray-500">Reason:</span>
                                                    <p className="font-medium">{selectedTransaction.reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedTransaction.notes && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                                    <p className="text-gray-700">{selectedTransaction.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}) {
    const colorClasses = {
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
        green: 'bg-gradient-to-br from-green-500 to-green-600',
        red: 'bg-gradient-to-br from-red-500 to-red-600',
        purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    }[color];

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`${colorClasses} text-white rounded-xl p-3 shadow-lg`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
            <div className="text-gray-600 font-medium">{label}</div>
        </div>
    );
}
