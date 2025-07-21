import Sidebar from '@/components/ui/sidebar';
import { Bell, User, LogOut, Package, MapPin, ClipboardList, Users, Settings, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import axios from 'axios';

type AppLayoutProps = {
    children: ReactNode;
};

type Auth = {
    user: {
        name: string;
        email: string;
        avatar?: string;
        role?: { name: string };
    };
};

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/tickets', label: 'Tickets', icon: ClipboardList },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/requisitions', label: 'Requisitions', icon: ClipboardList },
    { href: '/stock-transfers', label: 'Stock Transfers', icon: MapPin, adminOnly: true },
    { href: '/users', label: 'Users', icon: Users, adminOnly: true },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: AppLayoutProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const userRole = user.role?.name;

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const notificationsRef = useRef<HTMLDivElement>(null);

    // Filter navigation links based on user role
    const filteredNavLinks = navLinks.filter(link => {
        if (link.adminOnly && userRole !== 'Admin') {
            return false;
        }
        return true;
    });

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <Sidebar
                className="fixed top-0 left-0 z-40 w-64 h-screen"
                navLinks={filteredNavLinks}
                user={user}
            />

            {/* Main Content Area */}
            <div className="ml-64 flex flex-col min-h-screen w-full">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex items-center justify-end px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
                    {/* Right side - only notifications now */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setNotificationsOpen((open) => !open)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                                    {notifications.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center py-4">No new notifications</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {notifications.map((notification: any, index) => (
                                                <li key={index} className="p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-b-0">
                                                    {notification.message}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
