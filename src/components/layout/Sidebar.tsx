'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
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
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Admins', icon: Users, href: '/dashboard/admins' },
        { name: 'All Leads', icon: FileSpreadsheet, href: '/dashboard/leads' },
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
                    'fixed inset-y-0 left-0 z-30 transform bg-white border-r border-slate-100 transition-all duration-500 ease-in-out lg:static lg:translate-x-0 flex flex-col h-full',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    isCollapsed ? 'w-[88px]' : 'w-72',
                    'shadow-[20px_0_40px_-15px_rgba(0,0,0,0.03)]'
                )}
            >
                <div className="flex h-24 items-center justify-between px-8 flex-shrink-0">
                    {!isCollapsed && (
                        <div className="flex items-center justify-between w-full animate-in fade-in duration-500">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[#008080] flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="text-white font-black text-xl">SA</span>
                                </div>
                                <span className="text-lg font-black text-slate-800 tracking-tight">Super Admin</span>
                            </div>
                            <button
                                onClick={toggleCollapse}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#008080] hover:bg-slate-50 transition-all duration-300 group"
                            >
                                <ChevronLeft className="h-5 w-5 transform group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                    {isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#008080] hover:bg-slate-50 transition-all duration-300 group"
                        >
                            <ChevronRight className="h-6 w-6 transform group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <div className="flex-1  px-4 space-y-2 overflow-y-auto custom-scrollbar">

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/dashboard' 
                            ? pathname === '/dashboard' 
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'flex items-center rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group relative overflow-hidden',
                                    isActive
                                        ? 'bg-slate-50 text-[#008080] shadow-sm shadow-slate-100'
                                        : 'text-slate-800 hover:bg-slate-50 hover:text-slate-600',
                                    isCollapsed ? 'justify-center px-0 h-14' : 'px-5 gap-4'
                                )}
                                onClick={() => onClose()}
                                title={isCollapsed ? item.name : undefined}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 " />
                                )}
                                <Icon className={clsx("h-[22px] w-[22px] transition-all duration-300",
                                    isActive ? "text-[#008080] scale-110" : "text-slate-800 group-hover:text-slate-500")}
                                />
                                {!isCollapsed && <span className="tracking-tight">{item.name}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-slate-50 flex-shrink-0">
                    <button
                        onClick={handleLogoutClick}
                        className={clsx(
                            "flex items-center rounded-2xl py-4 transition-all duration-300 group",
                            "text-slate-400 hover:text-rose-500 hover:bg-rose-50",
                            isCollapsed ? "justify-center h-14 px-0" : "px-5 gap-4 w-full"
                        )}
                    >
                        <LogOut className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">Logout System</span>}
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
