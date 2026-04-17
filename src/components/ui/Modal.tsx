'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setIsVisible(true);
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = 'unset';
            }, 200);
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={clsx(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={clsx(
                "relative w-full max-w-lg transform rounded-lg bg-white p-6 shadow-xl transition-all duration-200",
                isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            )}>
                {/* Header (Optional or if title provided) */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                >
                    <X className="h-5 w-5" />
                </button>

                {title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">{title}</h3>
                )}

                {children}
            </div>
        </div>
    );
}
