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

interface User {
    id: number;
    name: string;
    email: string;
}

interface Consultant {
    id: number;
    user: User;
}

interface MessageTemplateData {
    id: number;
    title: string;
    content: string;
    type: 'greeting' | 'screening' | 'guidance' | 'closing' | 'other';
    consultant_id: number | null;
    consultant: Consultant | null;
    is_global: boolean;
    is_active: boolean;
    usage_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    templates: {
        data: MessageTemplateData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    consultants: Consultant[];
    filters: {
        search?: string;
        type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Template Pesan', href: '/admin/message-templates' },
];

export default function MessageTemplatesIndex({ templates, consultants, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplateData | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'other' as 'greeting' | 'screening' | 'guidance' | 'closing' | 'other',
        consultant_id: '',
        is_global: false,
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({
            title: '',
            content: '',
            type: 'other',
            consultant_id: '',
            is_global: false,
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (template: MessageTemplateData) => {
        setEditingTemplate(template);
        setFormData({
            title: template.title,
            content: template.content,
            type: template.type,
            consultant_id: template.consultant_id?.toString() || '',
            is_global: template.is_global,
            is_active: template.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            ...formData,
            consultant_id: formData.consultant_id ? parseInt(formData.consultant_id) : null,
        };

        if (editingTemplate) {
            router.put(`/admin/message-templates/${editingTemplate.id}`, data, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        } else {
            router.post('/admin/message-templates', data, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus template pesan ini?')) {
            router.delete(`/admin/message-templates/${id}`);
        }
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/message-templates',
            { search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/message-templates',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns: Column<MessageTemplateData>[] = [
        {
            header: 'Judul',
            cell: row => (
                <div>
                    <div className="font-medium">{row.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                        {row.content}
                    </div>
                </div>
            ),
        },
        {
            header: 'Tipe',
            cell: row => (
                <Badge variant="outline">
                    {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                </Badge>
            ),
        },
        {
            header: 'Cakupan',
            cell: row => (
                <div className="text-sm">
                    {row.is_global ? (
                        <Badge variant="default">Global</Badge>
                    ) : row.consultant ? (
                        <span className="text-muted-foreground">
                            {row.consultant.user.name}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Belum ditugaskan</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Penggunaan',
            cell: row => <span className="text-sm">{row.usage_count}</span>,
        },
        {
            header: 'Status',
            cell: row => (
                <div>
                    {row.is_active ? (
                        <Badge variant="default">Aktif</Badge>
                    ) : (
                        <Badge variant="secondary">Tidak Aktif</Badge>
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
            <Head title="Pengelolaan Template Pesan" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Template Pesan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={templates.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari template pesan..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: templates.current_page,
                                lastPage: templates.last_page,
                                total: templates.total,
                                perPage: templates.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                            actions={
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Template
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Edit Template Pesan' : 'Tambah Template Pesan'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <FormItem>
                        <FormLabel>Judul *</FormLabel>
                        <FormControl>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="Masukkan judul template (contoh: Pesan Sambutan Awal)"
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Konten *</FormLabel>
                        <FormControl>
                            <Textarea
                                value={formData.content}
                                onChange={e =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                rows={6}
                                required
                                placeholder="Masukkan konten pesan template"
                            />
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
                                <option value="greeting">Salam</option>
                                <option value="screening">Screening</option>
                                <option value="guidance">Panduan</option>
                                <option value="closing">Penutup</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Konsultan</FormLabel>
                        <FormControl>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={formData.consultant_id}
                                onChange={e =>
                                    setFormData({ ...formData, consultant_id: e.target.value })
                                }
                            >
                                <option value="">Tidak Ada</option>
                                {consultants.map(consultant => (
                                    <option key={consultant.id} value={consultant.id}>
                                        {consultant.user.name} ({consultant.user.email})
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                    </FormItem>

                    <div className="flex gap-4">
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={formData.is_global}
                                    onCheckedChange={checked =>
                                        setFormData({ ...formData, is_global: checked as boolean })
                                    }
                                />
                            </FormControl>
                            <FormLabel className="!mt-0">
                                Global (Tersedia untuk semua konsultan)
                            </FormLabel>
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
                </div>
            </CrudModal>
        </AppLayout>
    );
}
