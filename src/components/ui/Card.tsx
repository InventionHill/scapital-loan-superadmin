import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
            {children}
        </div>
    );
};

export const CardTitle = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
    return (
        <h3
            className={cn('font-semibold leading-none tracking-tight', className)}
            {...props}
        >
            {children}
        </h3>
    );
};

export const CardContent = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
};
