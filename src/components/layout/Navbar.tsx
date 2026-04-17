'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = async () => {
        await dispatch(logout());
        router.push('/login');
    };

    return (
        <>
            <header className="flex h-24 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-10 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="rounded-2xl p-3 text-slate-500 hover:bg-slate-100 transition-all lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 border border-slate-200 p-1.5 pr-5 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                        >
                            <div className="h-10 w-10 rounded-xl bg-[#008080] flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-primary/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-[13px] font-black text-slate-800">{user?.name || 'Administrator'}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Manager</span>
                            </div>
                            <ChevronDown className={clsx("h-4 w-4 text-slate-400 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-4 w-64 rounded-[1rem] bg-white p-3 ring-1 ring-black/5 border border-slate-100 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
                                <div className="px-2 py-2 border-b border-slate-50 mb-2">
                                    <p className="text-sm font-black text-slate-800">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-slate-400 font-bold truncate mt-1">{user?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={handleLogoutClick}
                                        className="flex w-full items-center gap-3 px-3.5 py-3.5 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                    >
                                        <LogOut className="h-4 w-4" strokeWidth={2.5} />
                                        Logout System
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>



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
