import Sidebar from '@/components/ui/sidebar';
import { Bell, User } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';

type AppLayoutProps = {
    children: ReactNode;
};

type Auth = {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
};

export default function AppLayout({ children }: AppLayoutProps) {
    const { auth } = usePage().props as { auth?: Auth };
    if (!auth) {
        throw new Error("Auth prop is missing from page props.");
    }
    const user = auth.user;

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
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
    }, [profileOpen]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Static Sidebar */}
            <aside className="fixed top-0 left-0 w-64 h-screen bg-[#071A22] text-white flex flex-col py-8 px-4 z-30">
                <Sidebar />
            </aside>
            {/* Main Content Area */}
            <div className="ml-64 flex flex-col min-h-screen">
                {/* Sticky Topbar */}
                <header className="sticky top-0 z-20 flex items-center justify-end px-8 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        {/* Notification Icon */}
                        <button
                            onClick={() => {
                                router.post('/alert');
                            }}
                            className="relative focus:outline-none"
                        >
                            <Bell className="w-6 h-6 text-[#071A22]" />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                        </button>
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
                                        onClick={() => {
                                            router.post('/logout');
                                        }}
                                        className="w-full text-left px-3 py-2 rounded bg-[#071A22] text-white hover:bg-[#05303e] transition"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
