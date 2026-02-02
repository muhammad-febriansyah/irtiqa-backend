import { Head, router } from '@inertiajs/react';
import { Image as ImageIcon, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { CrudModal } from '@/components/crud-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface BannerData extends Record<string, unknown> {
    id: number;
    title: string;
    description: string | null;
    image: string;
    created_at: string;
}

interface Props {
    banners: {
        data: BannerData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Banner', href: '/admin/banners' },
];

export default function BannersIndex({ banners, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            description: '',
            image: null,
        });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner: BannerData) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            description: banner.description || '',
            image: null,
        });
        setImagePreview(banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`);
        setIsModalOpen(true);
    };

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
            setImagePreview(editingBanner ? (editingBanner.image.startsWith('http') ? editingBanner.image : `/storage/${editingBanner.image}`) : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingBanner ? `/admin/banners/${editingBanner.id}` : '/admin/banners';

        // Inertia file upload requirements for PUT: use POST + _method: 'PUT'
        const data = {
            ...formData,
            _method: editingBanner ? 'PUT' : undefined,
        };

        router.post(url, data as any, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(`Banner berhasil ${editingBanner ? 'diperbarui' : 'ditambahkan'}`);
                setIsModalOpen(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Gagal menyimpan banner');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (banner: BannerData) => {
        if (confirm('Yakin ingin menghapus banner ini?')) {
            router.delete(`/admin/banners/${banner.id}`, {
                onSuccess: () => {
                    toast.success('Banner berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus banner');
                },
            });
        }
    };

    const columns: Column<BannerData>[] = [
        {
            header: 'Gambar',
            cell: (banner) => (
                <div className="size-20 overflow-hidden rounded-md border bg-muted">
                    <img
                        src={banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                    />
                </div>
            ),
        },
        {
            header: 'Judul',
            accessor: 'title',
            className: 'font-medium',
        },
        {
            header: 'Deskripsi',
            cell: (banner) => (
                <span className="text-sm text-muted-foreground line-clamp-2">
                    {banner.description || '-'}
                </span>
            ),
            className: 'max-w-md',
        },
        {
            header: 'Aksi',
            cell: (banner) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(banner)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(banner)}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 size-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Banner" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Manajemen Banner"
                        description="Kelola banner utama untuk halaman publik"
                    />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 size-4" />
                        Tambah Banner
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <DataTable<BannerData>
                            columns={columns}
                            data={banners.data}
                            searchable
                            searchPlaceholder="Cari banner..."
                            onSearch={(query) => {
                                router.get('/admin/banners', { ...filters, search: query }, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            pagination={{
                                currentPage: banners.current_page,
                                lastPage: banners.last_page,
                                perPage: banners.per_page,
                                total: banners.total,
                                onPageChange: (page) => {
                                    router.get('/admin/banners', { ...filters, page }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                },
                            }}
                            emptyMessage="Belum ada banner tersedia"
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBanner ? 'Edit Banner' : 'Tambah Banner'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Judul <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Masukkan judul banner"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Masukkan deskripsi singkat banner"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Gambar Banner <span className="text-destructive">*</span>
                        </Label>
                        <div
                            className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:border-primary/50"
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
                </div>
            </CrudModal>
        </AppLayout>
    );
}
