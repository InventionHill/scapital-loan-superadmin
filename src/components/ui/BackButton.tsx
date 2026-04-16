'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.back();
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-500 hover:text-gray-900 mb-2 pl-0 hover:bg-transparent self-start cursor-pointer"
            onClick={handleClick}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    );
}
