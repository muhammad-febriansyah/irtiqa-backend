import { Head, router } from '@inertiajs/react';
import { Image as ImageIcon, Pencil, Save, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface AboutUsData {
    id: number;
    title: string;
    desc: string;
    image: string | null;
}

interface Props {
    aboutUs: AboutUsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Tentang Kami', href: '/admin/about-us' },
];

export default function AboutUsEdit({ aboutUs }: Props) {
    const [formData, setFormData] = useState({
        title: aboutUs?.title || '',
        desc: aboutUs?.desc || '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(
        aboutUs?.image ? (aboutUs.image.startsWith('http') ? aboutUs.image : `/storage/${aboutUs.image}`) : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | null) => {
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData({ ...formData, image: null });
            setImagePreview(aboutUs?.image ? (aboutUs.image.startsWith('http') ? aboutUs.image : `/storage/${aboutUs.image}`) : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            ...formData,
            _method: 'post', // We use POST for file uploads
        };

        router.post('/admin/about-us', data as any, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Halaman Tentang Kami berhasil diperbarui');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Gagal memperbarui halaman');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Tentang Kami" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Manajemen Tentang Kami"
                        description="Kelola konten halaman Tentang Kami"
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Konten Utama</CardTitle>
                            <CardDescription>
                                Masukkan judul dan deskripsi lengkap untuk halaman Tentang Kami.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Judul <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Masukkan judul halaman"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc">
                                    Deskripsi Lengkap <span className="text-destructive">*</span>
                                </Label>
                                <RichTextEditor
                                    content={formData.desc}
                                    onChange={(content) => setFormData({ ...formData, desc: content })}
                                    placeholder="Tuliskan deskripsi lengkap di sini..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Gambar Utama (Opsional)</Label>
                                <div
                                    className="relative flex aspect-video max-w-2xl items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:border-primary/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                                    />
                                    {imagePreview ? (
                                        <div className="group relative h-full w-full">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2 text-white">
                                                    <Pencil className="size-6" />
                                                    <span className="text-sm font-medium">Ganti Gambar</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleImageChange(null);
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow hover:bg-destructive/90"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <ImageIcon className="size-10" />
                                            <span className="text-sm">Klik untuk upload gambar</span>
                                            <span className="text-xs">PNG, JPG up to 2MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            {!isSubmitting && <Save className="ml-2 size-4" />}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
