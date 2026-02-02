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

interface SliderData extends Record<string, unknown> {
    id: number;
    title: string;
    desc: string | null;
    image: string;
    created_at: string;
}

interface Props {
    sliders: {
        data: SliderData[];
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
    { title: 'Slider', href: '/admin/sliders' },
];

export default function SlidersIndex({ sliders, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<SliderData | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = () => {
        setEditingSlider(null);
        setFormData({
            title: '',
            desc: '',
            image: null,
        });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleEdit = (slider: SliderData) => {
        setEditingSlider(slider);
        setFormData({
            title: slider.title,
            desc: slider.desc || '',
            image: null,
        });
        setImagePreview(slider.image.startsWith('http') ? slider.image : `/storage/${slider.image}`);
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
            setImagePreview(editingSlider ? (editingSlider.image.startsWith('http') ? editingSlider.image : `/storage/${editingSlider.image}`) : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingSlider ? `/admin/sliders/${editingSlider.id}` : '/admin/sliders';
        console.log('Submission URL:', url);
        console.log('Editing Slider State:', editingSlider);

        // Inertia file upload requirements for PUT: use POST + _method: 'PUT'
        const data = {
            ...formData,
            _method: editingSlider ? 'PUT' : undefined,
        };

        router.post(url, data as any, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(`Slider berhasil ${editingSlider ? 'diperbarui' : 'ditambahkan'}`);
                setIsModalOpen(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Gagal menyimpan slider');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (slider: SliderData) => {
        if (confirm('Yakin ingin menghapus slider ini?')) {
            router.delete(`/admin/sliders/${slider.id}`, {
                onSuccess: () => {
                    toast.success('Slider berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus slider');
                },
            });
        }
    };

    const columns: Column<SliderData>[] = [
        {
            header: 'Gambar',
            cell: (slider) => (
                <div className="size-20 overflow-hidden rounded-md border bg-muted">
                    <img
                        src={slider.image.startsWith('http') ? slider.image : `/storage/${slider.image}`}
                        alt={slider.title}
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
            cell: (slider) => (
                <span className="text-sm text-muted-foreground line-clamp-2">
                    {slider.desc || '-'}
                </span>
            ),
            className: 'max-w-md',
        },
        {
            header: 'Aksi',
            cell: (slider) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(slider)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(slider)}
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
            <Head title="Manajemen Slider" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Manajemen Slider"
                        description="Kelola slider utama untuk halaman publik"
                    />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 size-4" />
                        Tambah Slider
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <DataTable<SliderData>
                            columns={columns}
                            data={sliders.data}
                            searchable
                            searchPlaceholder="Cari slider..."
                            onSearch={(query) => {
                                router.get('/admin/sliders', { ...filters, search: query }, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            pagination={{
                                currentPage: sliders.current_page,
                                lastPage: sliders.last_page,
                                perPage: sliders.per_page,
                                total: sliders.total,
                                onPageChange: (page) => {
                                    router.get('/admin/sliders', { ...filters, page }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                },
                            }}
                            emptyMessage="Belum ada slider tersedia"
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSlider ? 'Edit Slider' : 'Tambah Slider'}
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
                            placeholder="Masukkan judul slider"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Deskripsi</Label>
                        <Textarea
                            id="desc"
                            value={formData.desc}
                            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                            placeholder="Masukkan deskripsi singkat slider"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Gambar Slider <span className="text-destructive">*</span>
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
