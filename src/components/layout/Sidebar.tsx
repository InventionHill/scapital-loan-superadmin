'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight, PhoneForwarded, UserCheck, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = async () => {
        await dispatch(logout());
        router.push('/login');
    };

    const menuItems = [
        { name: 'Admins Management', icon: Users, href: '/dashboard/admins' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    'fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={clsx(
                    'fixed inset-y-0 left-0 z-30 transform bg-white shadow-lg transition-all duration-300 lg:static lg:translate-x-0 flex flex-col h-full',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    isCollapsed ? 'w-20' : 'w-64'
                )}
            >
                <div className={clsx("flex h-16 items-center border-b transition-all flex-shrink-0", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
                    {!isCollapsed && <h1 className="text-2xl font-bold text-primary truncate">Super Admin</h1>}
                    {isCollapsed && <span className="text-2xl font-bold text-primary">SA</span>}

                    <button onClick={toggleCollapse} className={clsx("hidden lg:block text-gray-400 hover:text-gray-600", !isCollapsed && "ml-auto")}>
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'flex items-center rounded-lg py-3 text-sm font-medium transition-colors flex-shrink-0',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                    isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
                                )}
                                onClick={() => onClose()}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={handleLogoutClick}
                        className={clsx(
                            "flex w-full items-center rounded-lg py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
                            isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                        )}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Sign out"
                message="Are you sure you want to sign out of your account?"
                confirmLabel="Sign out"
            />
        </>
    );
}
