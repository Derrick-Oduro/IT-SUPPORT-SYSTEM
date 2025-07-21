import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    TimeScale,
} from 'chart.js';
import { ClipboardList, Package, FileText, MapPin, User, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { ChartData, ChartDataset } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    TimeScale
);

export default function Dashboard() {
    const { auth } = (usePage().props as unknown as { auth?: { user: { name: string; role?: { name: string } } } });
    const user = auth?.user ?? { name: '', role: { name: 'Staff' } };
    const role = user.role?.name || 'Staff';

    const [stats, setStats] = useState({
        tickets: 0,
        inventory: 0,
        requisitions: 0,
        transfers: 0,
        pendingTickets: 0,
        completedTickets: 0,
    });

    type BarChartData = ChartData<'bar', number[], string>;
    type DoughnutChartData = ChartData<'doughnut', number[], string>;
    type LineChartData = ChartData<'line', number[], string>;

    const [ticketStatusData, setTicketStatusData] = useState<BarChartData>({
        labels: [],
        datasets: [],
    });
    const [inventoryCategoryData, setInventoryCategoryData] = useState<DoughnutChartData>({
        labels: [],
        datasets: [],
    });
    const [requisitionStatusData, setRequisitionStatusData] = useState<LineChartData>({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        fetchStats();
        fetchTicketStatusData();
        fetchInventoryCategoryData();
        fetchRequisitionStatusData();
    }, []);

    const fetchStats = async () => {
        const [tickets, inventory, requisitions, transfers] = await Promise.all([
            axios.get('/api/tickets'),
            axios.get('/api/inventory/items'),
            axios.get('/api/requisitions'),
            axios.get('/api/stock-transfers'),
        ]);

        const ticketData = tickets.data;
        const pendingTickets = ticketData.filter((t: any) => t.status === 'open' || t.status === 'in_progress').length;
        const completedTickets = ticketData.filter((t: any) => t.status === 'closed' || t.status === 'resolved').length;

        setStats({
            tickets: ticketData.length,
            inventory: (inventory.data.items || inventory.data).length,
            requisitions: requisitions.data.length,
            transfers: transfers.data.length,
            pendingTickets,
            completedTickets,
        });
    };

    const fetchTicketStatusData = async () => {
        const res = await axios.get('/api/tickets');
        const statusCounts: Record<string, number> = {};
        res.data.forEach((t: any) => {
            statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
        });
        setTicketStatusData({
            labels: Object.keys(statusCounts),
            datasets: [
                {
                    label: 'Tickets',
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#3B82F6', // Blue
                        '#10B981', // Emerald
                        '#F59E0B', // Amber
                        '#EF4444', // Red
                        '#8B5CF6', // Violet
                        '#06B6D4', // Cyan
                    ],
                    borderColor: [
                        '#2563EB',
                        '#059669',
                        '#D97706',
                        '#DC2626',
                        '#7C3AED',
                        '#0891B2',
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                },
            ],
        });
    };

    const fetchInventoryCategoryData = async () => {
        const res = await axios.get('/api/inventory/items');
        const items = res.data.items || res.data;
        const categoryCounts: Record<string, number> = {};
        items.forEach((item: any) => {
            const cat = item.category?.name || 'Uncategorized';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        setInventoryCategoryData({
            labels: Object.keys(categoryCounts),
            datasets: [
                {
                    label: 'Items',
                    data: Object.values(categoryCounts),
                    backgroundColor: [
                        '#3B82F6', // Blue
                        '#10B981', // Emerald
                        '#F59E0B', // Amber
                        '#EF4444', // Red
                        '#8B5CF6', // Violet
                        '#06B6D4', // Cyan
                        '#F97316', // Orange
                        '#84CC16', // Lime
                    ],
                    borderWidth: 0,
                },
            ],
        });
    };

    const fetchRequisitionStatusData = async () => {
        const res = await axios.get('/api/requisitions');
        const reqs = res.data;
        const dateCounts: Record<string, number> = {};
        reqs.forEach((req: any) => {
            const date = new Date(req.created_at).toLocaleDateString();
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        setRequisitionStatusData({
            labels: Object.keys(dateCounts),
            datasets: [
                {
                    label: 'Requisitions',
                    data: Object.values(dateCounts),
                    fill: true,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                },
            ],
        });
    };

    // Role badge color
    const roleColor = {
        Admin: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
        'IT Agent': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
        Staff: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
    }[role] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                        Welcome back, {user.name}!
                    </h1>
                    <p className="text-gray-600">Here's what's happening with your systems today.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${roleColor}`}>
                        <User className="w-4 h-4 mr-2" />
                        {role}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<ClipboardList className="w-8 h-8" />}
                    label="Total Tickets"
                    value={stats.tickets}
                    color="blue"
                    trend="+12%"
                />
                <StatCard
                    icon={<Package className="w-8 h-8" />}
                    label="Inventory Items"
                    value={stats.inventory}
                    color="green"
                    trend="+5%"
                />
                <StatCard
                    icon={<FileText className="w-8 h-8" />}
                    label="Requisitions"
                    value={stats.requisitions}
                    color="amber"
                    trend="+8%"
                />
                <StatCard
                    icon={<MapPin className="w-8 h-8" />}
                    label="Transfers"
                    value={stats.transfers}
                    color="purple"
                    trend="-2%"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <QuickStatCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="Pending Tickets"
                    value={stats.pendingTickets}
                    color="red"
                />
                <QuickStatCard
                    icon={<CheckCircle className="w-6 h-6" />}
                    label="Completed Tickets"
                    value={stats.completedTickets}
                    color="green"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ChartCard title="Tickets by Status" icon={<ClipboardList className="w-5 h-5" />}>
                    {ticketStatusData.datasets.length > 0 && (
                        <Bar
                            data={ticketStatusData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: '#3B82F6',
                                        borderWidth: 1,
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                                        ticks: { color: '#6B7280' }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: '#6B7280' }
                                    }
                                }
                            }}
                        />
                    )}
                </ChartCard>

                <ChartCard title="Inventory by Category" icon={<Package className="w-5 h-5" />}>
                    <Doughnut
                        data={inventoryCategoryData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true,
                                        font: { size: 12 }
                                    }
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    titleColor: 'white',
                                    bodyColor: 'white',
                                }
                            },
                            cutout: '60%',
                        }}
                    />
                </ChartCard>
            </div>

            {/* Requisitions Chart */}
            <ChartCard title="Requisitions Over Time" icon={<FileText className="w-5 h-5" />} fullWidth>
                <Line
                    data={requisitionStatusData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white',
                                borderColor: '#3B82F6',
                                borderWidth: 1,
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Date', color: '#6B7280' },
                                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                                ticks: { color: '#6B7280' }
                            },
                            y: {
                                title: { display: true, text: 'Requisitions', color: '#6B7280' },
                                beginAtZero: true,
                                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                                ticks: { color: '#6B7280' }
                            },
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index',
                        },
                    }}
                />
            </ChartCard>
        </AppLayout>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    trend
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    trend: string;
}) {
    const colorClasses = {
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
        green: 'bg-gradient-to-br from-green-500 to-green-600',
        amber: 'bg-gradient-to-br from-amber-500 to-amber-600',
        purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    }[color];

    const isPositive = trend.startsWith('+');

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`${colorClasses} text-white rounded-xl p-3 shadow-lg`}>
                    {icon}
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    isPositive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                    {trend}
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{value.toLocaleString()}</div>
            <div className="text-gray-600 font-medium">{label}</div>
        </div>
    );
}

function QuickStatCard({
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
        red: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
        green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    }[color];

    return (
        <div className={`${colorClasses} rounded-2xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold mb-1">{value}</div>
                    <div className="text-white/90 font-medium">{label}</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ChartCard({
    title,
    icon,
    children,
    fullWidth = false
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-2">
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            <div className="h-80">
                {children}
            </div>
        </div>
    );
}
