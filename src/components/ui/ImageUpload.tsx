'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    onFileSelect?: (file: File | null) => void;
    uploadProgress?: number;
    isUploading?: boolean;
    className?: string;
    error?: string;
}

export function ImageUpload({
    value,
    onChange,
    onFileSelect,
    uploadProgress = 0,
    isUploading = false,
    className,
    error,
    label = "Banner Image",
    variant = "banner"
}: ImageUploadProps & { label?: string; variant?: 'banner' | 'avatar' }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(value);

    // Sync preview with value prop changes ONLY if we are not currently previewing a local file
    // Ideally, we reset local preview when value changes (e.g. after successful upload/save)
    React.useEffect(() => {
        if (!isUploading) {
            setPreview(value);
        }
    }, [value, isUploading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Determine file type for preview
            if (file.type.startsWith('image/')) {
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);
            }

            // Pass file to parent
            if (onFileSelect) {
                onFileSelect(file);
            }
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        if (onFileSelect) {
            onFileSelect(null);
        }
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label} <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col gap-4">
                {preview ? (
                    <div className={`relative ${variant === 'avatar' ? 'w-32 mx-auto' : 'w-full'}`}>
                        <div className={`relative overflow-hidden border border-gray-200 ${variant === 'avatar' ? 'h-32 w-32 rounded-full' : 'h-48 w-full rounded-lg'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={preview}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                            {/* Show overlay if uploading */}
                            {isUploading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                                    <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                                    {variant !== 'avatar' && (
                                        <>
                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/30">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-white mt-1">{uploadProgress}%</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {!isUploading && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className={`absolute bg-white shadow-md hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors z-10 ${variant === 'avatar' ? 'top-0 right-0 rounded-full h-6 w-6' : 'right-0 top-0 rounded-bl-lg p-1'}`}
                            >
                                <X className="h-4 w-4 text-gray-600" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${variant === 'avatar' ? 'h-32 w-32 rounded-full mx-auto' : 'h-48 w-full rounded-lg'}`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                        <Upload className={`${variant === 'avatar' ? 'h-6 w-6' : 'h-8 w-8'} mb-2 text-gray-400`} />
                        {variant !== 'avatar' && (
                            <>
                                <p className="text-sm text-gray-500">Click to upload image</p>
                                <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                            </>
                        )}
                        {variant === 'avatar' && <span className="text-xs text-gray-400">Photo</span>}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        </div>
    );
}
