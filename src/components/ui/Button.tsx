import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all',
            outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-600 hover:text-[#111827] transition-all',
            ghost: 'hover:bg-slate-50 text-slate-500 hover:text-[#111827] transition-all',
            danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all',
        };

        const sizes = {
            sm: 'h-9 px-4 text-xs font-bold uppercase tracking-wider',
            md: 'h-12 px-6 py-3 font-extrabold uppercase tracking-widest text-[10px]',
            lg: 'h-14 px-10 text-base font-bold',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    fullWidth ? 'w-full' : '',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
