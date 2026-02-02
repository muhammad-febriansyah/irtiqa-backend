import { ImageIcon, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import InputError from './input-error';
import { Button } from './ui/button';

interface FileInputProps {
    label: string;
    value: File | null;
    currentFileUrl?: string | null;
    accept: string;
    onChange: (file: File | null) => void;
    error?: string;
    helpText?: string;
    required?: boolean;
}

export default function FileInput({
    label,
    value,
    currentFileUrl,
    accept,
    onChange,
    error,
    helpText,
    required = false,
}: FileInputProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file) {
            onChange(file);

            // Generate preview for images
            if (file.type.startsWith('image/') || file.name.endsWith('.ico')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFileChange(file || null);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const displayUrl = preview || currentFileUrl;

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Upload Area */}
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        flex-1 relative flex cursor-pointer flex-col items-center justify-center
                        rounded-lg border-2 border-dashed p-6 transition-colors
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'}
                        ${error ? 'border-destructive' : ''}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        className="hidden"
                        id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
                    />

                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Upload className="size-6 text-primary" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {isDragging
                                    ? 'Lepas file di sini'
                                    : 'Klik atau drag & drop file'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {helpText || 'Pilih file untuk diupload'}
                            </p>
                        </div>

                        {value && (
                            <div className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
                                <ImageIcon className="size-3.5" />
                                <span className="font-medium truncate max-w-[150px]">
                                    {value.name}
                                </span>
                                <span className="text-muted-foreground">
                                    ({(value.size / 1024).toFixed(2)} KB)
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/10"
                                >
                                    <X className="size-3.5 text-destructive" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                {displayUrl && (
                    <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                        <div className="relative">
                            <img
                                src={displayUrl}
                                alt="Preview"
                                className="h-32 w-32 rounded-lg border border-border object-contain bg-white shadow-sm"
                            />
                            {value && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-xs font-medium">
                                Preview
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {value ? 'File baru' : 'File saat ini'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <InputError message={error} />
        </div>
    );
}
