import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrudModal } from '@/components/crud-modal';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface ConsultationCategoryData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    categories: {
        data: ConsultationCategoryData[];
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
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Kategori Konsultasi', href: '/admin/consultation-categories' },
];

export default function ConsultationCategoriesIndex({ categories, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ConsultationCategoryData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        sort_order: '0',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            is_active: true,
            sort_order: '0',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (category: ConsultationCategoryData) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active,
            sort_order: category.sort_order.toString(),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            ...formData,
            sort_order: parseInt(formData.sort_order),
        };

        if (editingCategory) {
            router.put(`/admin/consultation-categories/${editingCategory.id}`, data, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        } else {
            router.post('/admin/consultation-categories', data, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            router.delete(`/admin/consultation-categories/${id}`);
        }
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/consultation-categories',
            { search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/consultation-categories',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns: Column<ConsultationCategoryData>[] = [
        {
            header: 'Nama',
            cell: row => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground">{row.slug}</div>
                </div>
            ),
        },
        {
            header: 'Deskripsi',
            cell: row => (
                <div className="max-w-md text-sm text-muted-foreground">
                    {row.description || '-'}
                </div>
            ),
        },
        {
            header: 'Urutan',
            cell: row => <div className="text-sm">{row.sort_order}</div>,
        },
        {
            header: 'Status',
            cell: row =>
                row.is_active ? (
                    <Badge variant="default">Aktif</Badge>
                ) : (
                    <Badge variant="secondary">Tidak Aktif</Badge>
                ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: row => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengelolaan Kategori Konsultasi" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Kategori Konsultasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={categories.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari kategori..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: categories.current_page,
                                lastPage: categories.last_page,
                                total: categories.total,
                                perPage: categories.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                            actions={
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Kategori
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <FormItem>
                        <FormLabel>Nama *</FormLabel>
                        <FormControl>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Masukkan nama kategori (contoh: Konseling Pernikahan)"
                                required
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                            <Textarea
                                value={formData.description}
                                onChange={e =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Masukkan deskripsi kategori"
                                rows={3}
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Urutan</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                value={formData.sort_order}
                                onChange={e =>
                                    setFormData({ ...formData, sort_order: e.target.value })
                                }
                                placeholder="Masukkan urutan tampilan (contoh: 1)"
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={formData.is_active}
                                onCheckedChange={checked =>
                                    setFormData({ ...formData, is_active: checked as boolean })
                                }
                            />
                        </FormControl>
                        <FormLabel className="!mt-0">Aktif</FormLabel>
                    </FormItem>
                </div>
            </CrudModal>
        </AppLayout>
    );
}
