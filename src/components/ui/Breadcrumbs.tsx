'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

export function Breadcrumbs() {
    const pathname = usePathname();

    const pathSegments = pathname.split('/').filter(Boolean).filter(segment => segment !== 'dashboard' && segment !== 'users');

    if (pathSegments.length === 0) return null;

    const breadcrumbs = pathSegments.map((segment, index) => {
        // Construct href based on original segments (including dashboard)
        const originalSegments = pathname.split('/').filter(Boolean);
        const dashboardIndex = originalSegments.indexOf('dashboard');
        const hrefSegments = originalSegments.slice(0, dashboardIndex + 1 + index + 1);
        const href = `/${hrefSegments.join('/')}`;

        let label = segment.charAt(0).toUpperCase() + segment.slice(1);

        // Custom labels
        if (segment === 'admins') label = 'Admin';
        if (segment === 'leads') label = 'All Leads';

        // Handle IDs
        const isId = segment.length > 20 || /^[0-9a-fA-F]{24}$/.test(segment);
        if (isId) {
            if (pathSegments[index - 1] === 'admins') label = 'Mobile Users';
            if (pathSegments[index - 1] === 'users') label = 'User Details';
        }

        if (segment === 'users') label = 'Mobile Users';

        return { label, href };
    });

    return (
        <nav className="flex items-center gap-2 mb-2">
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                    {index > 0 && (
                        <ChevronRight className="h-3 w-3 text-slate-300 mx-0.5" />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#008080]">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
