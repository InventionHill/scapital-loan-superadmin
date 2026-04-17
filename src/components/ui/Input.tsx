import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-[#111827] placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-rose-500 focus:ring-rose-200',
                            leftIcon && 'pl-11',
                            rightIcon && 'pr-11',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div
                            className={cn(
                                "absolute inset-y-0 right-0 flex items-center pr-4",
                                onRightIconClick && "cursor-pointer text-slate-400 hover:text-primary transition-colors"
                            )}
                            onClick={onRightIconClick}
                        >
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-rose-500" /> {error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
