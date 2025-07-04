import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import {
    Search, Plus, ClipboardList, X, CheckCircle,
    AlertTriangle, Clock, Package, Filter, RefreshCw,
    ChevronDown, ChevronUp, Eye, ShoppingCart
} from 'lucide-react';
import type { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CreateRequisitionModal from '@/modals/CreateRequisitionModal';
import ViewRequisitionModal from '@/modals/ViewRequisitionModal';
import ApproveRequisitionModal from '@/modals/ApproveRequisitionModal';
import { Requisition as BaseRequisition, RequisitionItem } from '@/types/requisition';

type Requisition = BaseRequisition & {
    urgency_level?: 'low' | 'medium' | 'high' | 'critical';
};

export default function Requisitions() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.role?.name;
    const isAdmin = role === 'Admin';

    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [filteredRequisitions, setFilteredRequisitions] = useState<Requisition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
    const [sortField, setSortField] = useState<'created_at' | 'urgency_level'>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        fetchRequisitions();
    }, []);

    useEffect(() => {
        filterRequisitions();
    }, [requisitions, searchQuery, statusFilter, sortField, sortDirection]);

    const fetchRequisitions = () => {
        setIsLoading(true);

        axios.get('/api/requisitions')
            .then(response => {
                console.log('Requisitions API response:', response.data);
                setRequisitions(response.data);
            })
            .catch(error => {
                console.error('Error fetching requisitions:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const filterRequisitions = () => {
        if (!requisitions || !Array.isArray(requisitions)) {
            setFilteredRequisitions([]);
            return;
        }

        let filtered = [...requisitions];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(req =>
                req.reference_number?.toLowerCase().includes(query) ||
                req.created_by?.name?.toLowerCase().includes(query) ||
                req.item?.name?.toLowerCase().includes(query) ||
                req.item?.sku?.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(req => req.status === statusFilter);
        }

        // Apply sorting
        const urgencyOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        filtered.sort((a, b) => {
            if (sortField === 'created_at') {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortField === 'urgency_level') {
                const levelA = urgencyOrder[(a.urgency_level ?? 'low') as keyof typeof urgencyOrder] || 0;
                const levelB = urgencyOrder[(b.urgency_level ?? 'low') as keyof typeof urgencyOrder] || 0;
                return sortDirection === 'asc' ? levelA - levelB : levelB - levelA;
            }
            return 0;
        });

        setFilteredRequisitions(filtered);
    };

    const handleSort = (field: 'created_at' | 'urgency_level') => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handleCreateRequisition = () => {
        setShowCreateModal(true);
    };

    const handleViewRequisition = (requisition: Requisition) => {
        setSelectedRequisition(requisition);
        setShowViewModal(true);
    };

    const handleApproveRequisition = (requisition: Requisition) => {
        setSelectedRequisition(requisition);
        setShowApproveModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'partially_approved':
                return (
                    <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Partial
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
            case 'fulfilled':
                return (
                    <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Fulfilled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getUrgencyBadge = (level: string) => {
        switch (level) {
            case 'low':
                return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
            case 'medium':
                return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
            case 'high':
                return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
            case 'critical':
                return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
            default:
                return <Badge variant="outline">{level}</Badge>;
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
        <AppLayout>
            <Head title="Requisitions" />

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="h-8 w-8 mr-2 text-blue-600" />
                        Requisitions
                    </h1>

                    <Button
                        onClick={handleCreateRequisition}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Requisition
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="pl-10 py-2 pr-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Search by reference number, requestor, or items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="py-2 px-3 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="partially_approved">Partially Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>

                    <button
                        onClick={fetchRequisitions}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Requisitions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Loading requisitions...</span>
                    </div>
                ) : filteredRequisitions.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No requisitions found</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-blue-500 hover:text-blue-700"
                            >
                                Clear search
                            </button>
                        )}
                        <button
                            onClick={handleCreateRequisition}
                            className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create a requisition
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <span>Date</span>
                                            {sortField === 'created_at' && (
                                                sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requested By
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequisitions.map((requisition) => (
                                    <tr
                                        key={requisition.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Package className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {requisition.item?.name || 'Unknown Item'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        SKU: {requisition.item?.sku || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(requisition.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {requisition.created_by?.name || 'Unknown User'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {requisition.quantity} {requisition.item?.unit_of_measure?.abbreviation || 'units'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(requisition.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    onClick={() => handleViewRequisition(requisition)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>

                                                {isAdmin && requisition.status === 'pending' && (
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900"
                                                        onClick={() => handleApproveRequisition(requisition)}
                                                        title="Review Requisition"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
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
            <CreateRequisitionModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchRequisitions}
            />

            <ViewRequisitionModal
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                requisition={selectedRequisition}
            />

            <ApproveRequisitionModal
                show={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onSuccess={fetchRequisitions}
                requisition={selectedRequisition}
            />
        </AppLayout>
    );
}
