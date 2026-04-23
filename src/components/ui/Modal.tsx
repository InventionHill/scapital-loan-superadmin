'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

export function Modal({ isOpen, onClose, children, title, footer, size = 'lg' }: ModalProps) {
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

    const maxWidthClass = {
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        'full': 'max-w-[95vw]'
    }[size];

    return (
        <div className={clsx(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={clsx(
                "relative w-full max-h-[80vh] flex flex-col transform rounded-[1.5rem] bg-white shadow-2xl transition-all duration-300 overflow-hidden",
                maxWidthClass,
                isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
            )}>
                {/* Header */}
                <div className="shrink-0 p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div className="flex-1">
                        {typeof title === 'string' ? (
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
                        ) : (
                            title
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-all ml-4"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="shrink-0 p-8 pt-4 border-t border-slate-50 bg-white">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
