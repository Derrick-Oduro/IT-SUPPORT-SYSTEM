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
import { ClipboardList, Package, FileText, MapPin, User } from 'lucide-react';
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
    const [stockTransactionData, setStockTransactionData] = useState<LineChartData>({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        fetchStats();
        fetchTicketStatusData();
        fetchInventoryCategoryData();
        fetchStockTransactionData();
    }, []);

    const fetchStats = async () => {
        const [tickets, inventory, requisitions, transfers] = await Promise.all([
            axios.get('/api/tickets'),
            axios.get('/api/inventory/items'),
            axios.get('/api/requisitions'),
            axios.get('/api/stock-transfers'),
        ]);
        setStats({
            tickets: tickets.data.length,
            inventory: (inventory.data.items || inventory.data).length,
            requisitions: requisitions.data.length,
            transfers: transfers.data.length,
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
                        '#2563eb', '#f59e42', '#22c55e', '#ef4444', '#a855f7'
                    ],
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
                        '#2563eb', '#f59e42', '#22c55e', '#ef4444', '#a855f7', '#fbbf24'
                    ],
                },
            ],
        });
    };

    const fetchStockTransactionData = async () => {
        const res = await axios.get('/api/stock-transactions');
        const txs = res.data;
        const dateCounts: Record<string, number> = {};
        txs.forEach((tx: any) => {
            const date = new Date(tx.created_at).toLocaleDateString();
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        setStockTransactionData({
            labels: Object.keys(dateCounts),
            datasets: [
                {
                    label: 'Stock Transactions',
                    data: Object.values(dateCounts),
                    fill: false,
                    borderColor: '#2563eb',
                    backgroundColor: '#2563eb',
                    tension: 0.3,
                },
            ],
        });
    };

    // Role badge color
    const roleColor = {
        Admin: 'bg-blue-100 text-blue-800',
        'IT Agent': 'bg-green-100 text-green-800',
        Staff: 'bg-gray-100 text-gray-800',
    }[role] || 'bg-gray-100 text-gray-800';

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[#071A22]">Dashboard</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${roleColor}`}>
                    <User className="w-4 h-4 mr-1" />
                    {role}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<ClipboardList className="w-8 h-8 text-blue-600" />}
                    label="Tickets"
                    value={stats.tickets}
                />
                <StatCard
                    icon={<Package className="w-8 h-8 text-green-600" />}
                    label="Inventory Items"
                    value={stats.inventory}
                />
                <StatCard
                    icon={<FileText className="w-8 h-8 text-orange-500" />}
                    label="Requisitions"
                    value={stats.requisitions}
                />
                <StatCard
                    icon={<MapPin className="w-8 h-8 text-purple-600" />}
                    label="Transfers"
                    value={stats.transfers}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Tickets by Status</h2>
                    {ticketStatusData.datasets.length > 0 && (
                        <Bar
                            data={ticketStatusData}
                            options={{
                                responsive: true,
                                plugins: { legend: { display: false } },
                            }}
                        />
                    )}
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Inventory by Category</h2>
                    <Doughnut
                        data={inventoryCategoryData}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom' } },
                        }}
                    />
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <h2 className="text-lg font-semibold mb-4">Stock Transactions Over Time</h2>
                <Line
                    data={stockTransactionData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { title: { display: true, text: 'Date' } },
                            y: { title: { display: true, text: 'Transactions' }, beginAtZero: true },
                        },
                    }}
                />
            </div>
        </AppLayout>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
            <div className="bg-blue-50 rounded-full p-3">{icon}</div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-gray-500">{label}</div>
            </div>
        </div>
    );
}
