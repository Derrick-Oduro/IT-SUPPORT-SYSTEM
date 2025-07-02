import { useState, useEffect } from 'react';
import axios from 'axios';
import { LoaderCircle, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ITAgent = {
    id: number;
    name: string;
    email: string;
};

type Ticket = {
    id: number;
    title: string;
    status: string;
    submitted_by: {
        name: string;
    };
};

type AssignTicketModalProps = {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    ticket: Ticket | null;
};

export default function AssignTicketModal({ show, onClose, onSuccess, ticket }: AssignTicketModalProps) {
    const [itAgents, setITAgents] = useState<ITAgent[]>([]);
    const [selectedITAgent, setSelectedITAgent] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredITAgents, setFilteredITAgents] = useState<ITAgent[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            fetchITAgents();
        }
    }, [show]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredITAgents(itAgents);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = itAgents.filter(agent =>
                agent.name.toLowerCase().includes(query) ||
                agent.email.toLowerCase().includes(query)
            );
            setFilteredITAgents(filtered);
        }
    }, [searchQuery, itAgents]);

    const fetchITAgents = () => {
        setIsLoading(true);
        setError(''); // Clear previous errors

        // Fetch IT agents (role_id = 2)
        axios.get('/api/users/agents')
            .then(response => {
                console.log('IT Agents API response:', response.data); // Debug the response

                if (!Array.isArray(response.data)) {
                    console.error('Response is not an array:', response.data);
                    setError('Invalid response format from server');
                    return;
                }

                if (response.data.length === 0) {
                    setError('No IT Agents found in the system');
                    return;
                }

                // Make sure we're properly handling the response data structure
                const formattedAgents = response.data.map(agent => ({
                    id: agent.id,
                    name: agent.name || 'Unknown Name',
                    email: agent.email || 'No Email'
                }));

                setITAgents(formattedAgents);
                setFilteredITAgents(formattedAgents);
            })
            .catch(error => {
                console.error('Error fetching IT Agents:', error);

                // Provide more detailed error information
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                    setError(`Failed to load IT Agents (${error.response.status})`);
                } else {
                    setError('Failed to connect to server');
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedITAgent) {
            setError('Please select an IT Agent to assign this ticket');
            return;
        }

        setIsSubmitting(true);
        setError('');

        axios.post(`/api/tickets/${ticket?.id}/assign`, { agent_id: selectedITAgent })
            .then(() => {
                onSuccess();
                onClose();
                setSelectedITAgent(null);
            })
            .catch(error => {
                console.error('Error assigning ticket:', error);
                setError('Failed to assign ticket. Please try again.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    if (!show || !ticket) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Assign Ticket to IT Agent</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <p className="font-medium text-gray-700">Ticket: {ticket.title}</p>
                    <p className="text-sm text-gray-500">Submitted by: {ticket.submitted_by.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="agent">Select an IT Agent</Label>

                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="pl-10 py-2 pr-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Search IT Agents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredITAgents.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                No IT Agents available
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-60 border rounded-md">
                                {filteredITAgents.map(agent => (
                                    <div
                                        key={agent.id}
                                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b ${selectedITAgent === agent.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedITAgent(agent.id)}
                                    >
                                        <div className={`h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 ${selectedITAgent === agent.id ? 'ring-2 ring-blue-500' : ''}`}>
                                            <User className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{agent.name}</p>
                                            <p className="text-sm text-gray-500">{agent.email}</p>
                                        </div>
                                        <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-gray-300 mr-2">
                                            {selectedITAgent === agent.id && (
                                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>

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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={isSubmitting || !selectedITAgent}
                        >
                            {isSubmitting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                            Assign Ticket
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
