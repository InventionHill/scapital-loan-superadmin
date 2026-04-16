'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut } from 'lucide-react';
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
        setIsDropdownOpen(false); // Close dropdown
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = async () => {
        await dispatch(logout());
        router.push('/login');
    };

    return (
        <>
            <header className="flex h-16 items-center justify-end border-b bg-white px-4 shadow-sm lg:px-8">
                <button
                    onClick={onMenuClick}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div className="flex w-full justify-end lg:w-auto">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 hover:bg-gray-100 transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
                            </div>
                            <span className="hidden text-sm font-medium text-gray-700 md:block">
                                {user?.name || 'Admin'}
                            </span>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="px-4 py-2 border-b">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogoutClick}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </button>
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
