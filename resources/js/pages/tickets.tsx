import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import {
    Search, Plus, RefreshCw, ClipboardList, CheckCircle,
    Clock, AlertCircle, MessageSquare, X, ChevronDown,
    User, Calendar, Tag, FileText, Flag
} from 'lucide-react';
import type { PageProps } from '@/types';
import CreateTicketModal from '@/modals/CreateTicketModal';
import AssignTicketModal from '@/modals/AssignTicketModal';
import UpdateTicketModal from '@/modals/UpdateTicketModal';

type Ticket = {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    submitted_by: {
        id: number;
        name: string;
        email: string;
    };
    assigned_to?: {
        id: number;
        name: string;
        email: string;
    } | null;
    updates?: {
        id: number;
        message: string;
        created_at: string;
        user: {
            name: string;
        };
    }[];
};

export default function Tickets() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.role?.name;
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

    // Fetch tickets based on user role
    useEffect(() => {
        fetchTickets();
    }, [role]);

    // Filter tickets when search query, status filter, or priority filter changes
    useEffect(() => {
        filterTickets();
    }, [searchQuery, statusFilter, priorityFilter, tickets]);

    const fetchTickets = () => {
        setIsLoading(true);
        axios.get('/api/tickets')
            .then(response => {
                setTickets(response.data);
            })
            .catch(error => {
                console.error('Error fetching tickets:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const filterTickets = () => {
        let filtered = [...tickets];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(ticket => ticket.status.toLowerCase() === statusFilter);
        }

        // Apply priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(ticket => ticket.priority.toLowerCase() === priorityFilter);
        }

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(ticket =>
                ticket.title.toLowerCase().includes(query) ||
                ticket.description.toLowerCase().includes(query) ||
                ticket.submitted_by.name.toLowerCase().includes(query) ||
                (ticket.assigned_to && ticket.assigned_to.name.toLowerCase().includes(query))
            );
        }

        setFilteredTickets(filtered);
    };

    const handleCreateTicket = () => {
        setShowCreateModal(true);
    };

    const handleAssignTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowAssignModal(true);
    };

    const handleUpdateTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowUpdateModal(true);
    };

    const toggleTicketDetails = (ticketId: number) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new':
                return <AlertCircle className="h-4 w-4" />;
            case 'in_progress':
                return <Clock className="h-4 w-4" />;
            case 'resolved':
                return <CheckCircle className="h-4 w-4" />;
            case 'closed':
                return <X className="h-4 w-4" />;
            default:
                return <ClipboardList className="h-4 w-4" />;
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

    const getReadableStatus = (status: string) => {
        return status.replace('_', ' ');
    };

    return (
        <AppLayout>
            <Head title="Tickets" />

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="pl-10 py-2 pr-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select
                            className="py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            className="py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>

                        <button
                            onClick={fetchTickets}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>

                        {role === 'Staff' && (
                            <button
                                onClick={handleCreateTicket}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                            <span className="ml-2 text-gray-600">Loading tickets...</span>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64">
                            <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">No tickets found</p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2 text-blue-500 hover:text-blue-700"
                                >
                                    Clear search
                                </button>
                            )}
                            {role === 'Staff' && (
                                <button
                                    onClick={handleCreateTicket}
                                    className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create your first ticket
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 p-4">
                            {filteredTickets.map(ticket => (
                                <div key={ticket.id} className="border rounded-lg overflow-hidden shadow-sm">
                                    {/* Ticket Header */}
                                    <div
                                        className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleTicketDetails(ticket.id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${getStatusBadge(ticket.status)}`}>
                                                {getStatusIcon(ticket.status)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 text-lg">{ticket.title}</h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <User className="h-3.5 w-3.5 mr-1" />
                                                    <span className="mr-3">{ticket.submitted_by.name}</span>
                                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                                    <span>{formatDate(ticket.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityBadge(ticket.priority)}`}>
                                                <span className="flex items-center">
                                                    <Flag className="h-3 w-3 mr-1" />
                                                    {ticket.priority}
                                                </span>
                                            </span>
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(ticket.status)}`}>
                                                {getReadableStatus(ticket.status)}
                                            </span>
                                            <ChevronDown className={`h-5 w-5 transition-transform ${expandedTicket === ticket.id ? 'transform rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expandable Details */}
                                    {expandedTicket === ticket.id && (
                                        <div className="p-4 border-t">
                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                    <FileText className="h-4 w-4 mr-1" /> Description
                                                </h4>
                                                <div className="bg-gray-50 p-3 rounded-md text-gray-800">
                                                    {ticket.description}
                                                </div>
                                            </div>

                                            {ticket.assigned_to && (
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                        <User className="h-4 w-4 mr-1" /> Assigned Agent
                                                    </h4>
                                                    <div className="bg-yellow-50 p-3 rounded-md flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center mr-2">
                                                            <span className="font-medium text-yellow-800">
                                                                {ticket.assigned_to.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{ticket.assigned_to.name}</p>
                                                            <p className="text-xs text-gray-500">{ticket.assigned_to.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Ticket Updates */}
                                            {ticket.updates && ticket.updates.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                        <MessageSquare className="h-4 w-4 mr-1" /> Updates
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {ticket.updates.map(update => (
                                                            <div key={update.id} className="bg-blue-50 p-3 rounded-md">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="font-medium text-gray-800">{update.user.name}</p>
                                                                    <span className="text-xs text-gray-500">{formatDate(update.created_at)}</span>
                                                                </div>
                                                                <p className="text-gray-600 mt-1">{update.message}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex justify-end space-x-3 mt-4">
                                                {role === 'Admin' && ticket.status === 'new' && (
                                                    <button
                                                        onClick={() => handleAssignTicket(ticket)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        <User className="h-4 w-4 mr-1" /> Assign Agent
                                                    </button>
                                                )}
                                                {role === 'IT Agent' && (ticket.status === 'new' || ticket.status === 'in_progress') && ticket.assigned_to?.id === auth.user.id && (
                                                    <button
                                                        onClick={() => handleUpdateTicket(ticket)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                                    >
                                                        <MessageSquare className="h-4 w-4 mr-1" /> Add Update
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreateTicketModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchTickets}
            />

            <AssignTicketModal
                show={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSuccess={fetchTickets}
                ticket={selectedTicket}

            />

            <UpdateTicketModal
                show={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onSuccess={fetchTickets}
                ticket={selectedTicket}
            />
        </AppLayout>
    );
}
