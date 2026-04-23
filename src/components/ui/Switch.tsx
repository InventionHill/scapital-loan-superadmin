'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function Switch({ checked, onChange, disabled, size = 'md' }: SwitchProps) {
    const sizes = {
        sm: 'w-8 h-4.5',
        md: 'w-11 h-6',
        lg: 'w-14 h-8'
    };
    
    const circleSizes = {
        sm: 'h-3.5 w-3.5',
        md: 'h-5 w-5',
        lg: 'h-7 w-7'
    };
    
    const translate = {
        sm: checked ? 'translate-x-3.5' : 'translate-x-0.5',
        md: checked ? 'translate-x-5' : 'translate-x-1',
        lg: checked ? 'translate-x-6' : 'translate-x-1'
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={clsx(
                "relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none items-center",
                sizes[size],
                checked ? "bg-[#00a878]" : "bg-slate-200",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span
                aria-hidden="true"
                className={clsx(
                    "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    circleSizes[size],
                    translate[size]
                )}
            />
        </button>
    );
}
