import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    id: string | number;
    label: string;
    value: string | number;
}

interface SelectProps {
    label?: string;
    options: Option[];
    value: string | number;
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
    valueClassName?: (value: any) => string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Select option',
    className,
    valueClassName
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Also check if the click was inside the portal
                const portal = document.getElementById('select-portal-root');
                if (portal && portal.contains(event.target as Node)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            const handleScroll = () => updateCoords();
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', updateCoords);
            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', updateCoords);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) setSearch('');
    }, [isOpen]);

    const renderDropdown = () => {
        if (!mounted || !isOpen) return null;

        return createPortal(
            <div
                id="select-portal-root"
                style={{
                    position: 'absolute',
                    top: `${coords.top + 8}px`,
                    left: `${coords.left}px`,
                    width: `${coords.width}px`,
                    zIndex: 9999
                }}
                className="bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden origin-top"
            >
                {options.length > 8 && (
                    <div className="p-3 border-b border-slate-50 bg-slate-50/30">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                autoFocus
                                placeholder="Search options..."
                                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <Search size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No results found</span>
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "mx-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-between group/opt",
                                    option.value === value
                                        ? "bg-primary/5 text-primary"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                                )}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span>{option.label}</span>
                                </div>
                                {option.value === value ? (
                                    <div className="h-6 w-6 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                ) : (
                                    <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 opacity-0 group-hover/opt:opacity-100 transition-all">
                                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className={cn("w-full relative", className)} ref={containerRef}>
            {label && (
                <label className="mb-2.5 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative flex h-14 w-full items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-3 text-sm font-bold text-[#111827] cursor-pointer transition-all duration-300 hover:bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-primary/10",
                    isOpen && "ring-4 ring-primary/10 border-primary shadow-sm"
                )}
            >
                <span className={cn(
                    !selectedOption && "text-slate-300 font-medium",
                    selectedOption && valueClassName?.(selectedOption.value)
                )}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300",
                    isOpen ? "bg-primary/10 text-primary rotate-180" : "bg-white text-slate-400"
                )}>
                    <ChevronDown size={18} strokeWidth={3} />
                </div>
            </div>

            {renderDropdown()}
        </div>
    );
};
