import Sidebar from '@/components/ui/sidebar';
import { Bell, User, LogOut, Search, Package, MapPin, ClipboardList, Users, Settings, LayoutGrid } from 'lucide-react';
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
    const { auth } = usePage().props as { auth?: Auth };
    if (!auth) {
        throw new Error("Auth prop is missing from page props.");
    }
    const user = auth.user;
    const isAdmin = user.role?.name === 'Admin';

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        }
        if (profileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileOpen, notifOpen]);

    const fetchNotifications = () => {
        axios.get('/api/notifications').then(res => setNotifications(res.data));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-[#071A22] to-[#17405e] text-white flex flex-col py-8 px-4 z-30 shadow-lg">
                <div className="mb-8 flex items-center gap-3 px-2">
                    <span className="text-2xl font-bold tracking-wide">IT Support</span>
                </div>
                <nav className="flex-1">
                    <ul className="space-y-1">
                        {navLinks
                            .filter(link => !link.adminOnly || isAdmin)
                            .map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition text-base font-medium"
                                        activeClassName="bg-white/20 text-blue-200"
                                    >
                                        <link.icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </nav>
                <div className="mt-auto flex items-center gap-3 px-2 pt-8 border-t border-white/10">
                    <User className="w-7 h-7 text-white/80" />
                    <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-blue-100">{user.email}</div>
                    </div>
                </div>
            </aside>
            {/* Main Content Area */}
            <div className="ml-64 flex flex-col min-h-screen w-full">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex items-center justify-end px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
                    {/* Right side only */}
                    <div className="flex items-center space-x-4">
                        {/* Notification Icon with Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => {
                                    setNotifOpen((open) => !open);
                                    if (!notifOpen) fetchNotifications();
                                }}
                                className="relative focus:outline-none hover:bg-gray-100 rounded-full p-2"
                            >
                                <Bell className="w-6 h-6 text-[#071A22]" />
                                {notifications.some(n => !n.read_at) && (
                                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white text-[#071A22] rounded shadow-lg z-50 p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">Notifications</span>
                                        <button
                                            className="text-xs text-blue-600 hover:underline"
                                            onClick={() => {
                                                axios.post('/api/notifications/read').then(() => {
                                                    setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
                                                });
                                            }}
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <ul className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <li className="text-gray-500 text-sm py-4 text-center">No notifications</li>
                                        ) : (
                                            notifications.map(n => (
                                                <li
                                                    key={n.id}
                                                    className={`py-2 px-2 rounded ${n.read_at ? 'bg-gray-50' : 'bg-blue-50 font-semibold'}`}
                                                >
                                                    <div>{n.data?.message || n.type}</div>
                                                    <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Profile Avatar */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen((open) => !open)}
                                className="focus:outline-none"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full border-2 border-[#071A22] object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-[#071A22] text-white flex items-center justify-center font-bold border-2 border-[#071A22]">
                                        {user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </div>
                                )}
                            </button>
                            {/* Profile Popup */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white text-[#071A22] rounded shadow-lg z-50 p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-[#071A22] text-white flex items-center justify-center font-bold">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    <hr className="my-2" />
                                    <button
                                        onClick={() => router.post('/logout')}
                                        className="w-full text-left px-3 py-2 rounded bg-[#071A22] text-white hover:bg-[#05303e] transition flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-8 bg-gray-50">{children}</main>
            </div>
        </div>
    );
}
