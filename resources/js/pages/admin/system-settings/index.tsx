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

interface SystemSettingData {
    id: number;
    key: string;
    value: string | null;
    type: 'text' | 'number' | 'boolean' | 'json' | 'array';
    group: string | null;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    settings: {
        data: SystemSettingData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        group?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Pengaturan Sistem', href: '/admin/system-settings' },
];

export default function SystemSettingsIndex({ settings, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<SystemSettingData | null>(null);
    const [formData, setFormData] = useState({
        key: '',
        value: '',
        type: 'text' as 'text' | 'number' | 'boolean' | 'json' | 'array',
        group: '',
        description: '',
        is_public: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingSetting(null);
        setFormData({
            key: '',
            value: '',
            type: 'text',
            group: '',
            description: '',
            is_public: false,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (setting: SystemSettingData) => {
        setEditingSetting(setting);
        setFormData({
            key: setting.key,
            value: setting.value || '',
            type: setting.type,
            group: setting.group || '',
            description: setting.description || '',
            is_public: setting.is_public,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingSetting) {
            router.put(`/admin/system-settings/${editingSetting.id}`, formData, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        } else {
            router.post('/admin/system-settings', formData, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengaturan sistem ini?')) {
            router.delete(`/admin/system-settings/${id}`);
        }
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/system-settings',
            { search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/system-settings',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns: Column<SystemSettingData>[] = [
        {
            header: 'Kunci',
            cell: row => (
                <div>
                    <div className="font-medium font-mono text-sm">{row.key}</div>
                    {row.description && (
                        <div className="text-xs text-muted-foreground">{row.description}</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Nilai',
            cell: row => (
                <div className="font-mono text-sm max-w-xs truncate">{row.value || '-'}</div>
            ),
        },
        {
            header: 'Tipe',
            cell: row => <Badge variant="outline">{row.type}</Badge>,
        },
        {
            header: 'Grup',
            cell: row => (
                <div className="text-sm">
                    {row.group ? <Badge variant="secondary">{row.group}</Badge> : '-'}
                </div>
            ),
        },
        {
            header: 'Visibilitas',
            cell: row => (
                <div>
                    {row.is_public ? (
                        <Badge variant="default">Publik</Badge>
                    ) : (
                        <Badge variant="secondary">Privat</Badge>
                    )}
                </div>
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
            <Head title="Pengelolaan Pengaturan Sistem" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Pengaturan Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={settings.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari pengaturan sistem..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: settings.current_page,
                                lastPage: settings.last_page,
                                total: settings.total,
                                perPage: settings.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                            actions={
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Pengaturan
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSetting ? 'Edit Pengaturan Sistem' : 'Tambah Pengaturan Sistem'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <FormItem>
                        <FormLabel>Kunci *</FormLabel>
                        <FormControl>
                            <Input
                                value={formData.key}
                                onChange={e => setFormData({ ...formData, key: e.target.value })}
                                required
                                disabled={!!editingSetting}
                                placeholder="Masukkan kunci pengaturan (contoh: max_upload_size)"
                            />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                            Kunci tidak dapat diubah setelah dibuat
                        </p>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Nilai</FormLabel>
                        <FormControl>
                            {formData.type === 'json' || formData.type === 'array' ? (
                                <Textarea
                                    value={formData.value}
                                    onChange={e =>
                                        setFormData({ ...formData, value: e.target.value })
                                    }
                                    rows={4}
                                    placeholder='{"key": "value"}'
                                />
                            ) : (
                                <Input
                                    type={formData.type === 'number' ? 'number' : 'text'}
                                    value={formData.value}
                                    onChange={e =>
                                        setFormData({ ...formData, value: e.target.value })
                                    }
                                    placeholder="Masukkan nilai pengaturan"
                                />
                            )}
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Tipe *</FormLabel>
                        <FormControl>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={formData.type}
                                onChange={e =>
                                    setFormData({ ...formData, type: e.target.value as any })
                                }
                            >
                                <option value="text">Teks</option>
                                <option value="number">Angka</option>
                                <option value="boolean">Boolean</option>
                                <option value="json">JSON</option>
                                <option value="array">Array</option>
                            </select>
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Grup</FormLabel>
                        <FormControl>
                            <Input
                                value={formData.group}
                                onChange={e => setFormData({ ...formData, group: e.target.value })}
                                placeholder="Masukkan grup pengaturan (contoh: general, payment)"
                            />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                            Digunakan untuk mengelompokkan pengaturan (contoh: revenue_sharing,
                            payment, general)
                        </p>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                            <Textarea
                                value={formData.description}
                                onChange={e =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                placeholder="Masukkan deskripsi pengaturan"
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={formData.is_public}
                                onCheckedChange={checked =>
                                    setFormData({ ...formData, is_public: checked as boolean })
                                }
                            />
                        </FormControl>
                        <FormLabel className="!mt-0">
                            Publik (Dapat diakses oleh pengguna non-admin)
                        </FormLabel>
                    </FormItem>
                </div>
            </CrudModal>
        </AppLayout>
    );
}
