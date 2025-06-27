import Sidebar from '@/components/ui/sidebar';
import { Bell, User } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { router } from '@inertiajs/react';

const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
};

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
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
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-[#071A22] text-white flex flex-col py-8 px-4 min-h-screen">
                <Sidebar />
            </aside>
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="flex items-center justify-end px-8 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        {/* Notification Icon */}
                        <button className="relative focus:outline-none">
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
