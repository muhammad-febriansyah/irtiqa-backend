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

interface ConsultationCategory {
    id: number;
    name: string;
}

interface ScreeningQuestionData {
    id: number;
    category_id: number | null;
    category: ConsultationCategory | null;
    question: string;
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'number';
    options: string[] | null;
    is_required: boolean;
    helper_text: string | null;
    sort_order: number;
    is_active: boolean;
    risk_scoring: any | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    questions: {
        data: ScreeningQuestionData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: ConsultationCategory[];
    filters: {
        search?: string;
        category_id?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Pertanyaan Screening', href: '/admin/screening-questions' },
];

export default function ScreeningQuestionsIndex({ questions, categories, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<ScreeningQuestionData | null>(null);
    const [formData, setFormData] = useState({
        category_id: '',
        question: '',
        type: 'text' as 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'number',
        options: '',
        is_required: true,
        helper_text: '',
        sort_order: '0',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingQuestion(null);
        setFormData({
            category_id: '',
            question: '',
            type: 'text',
            options: '',
            is_required: true,
            helper_text: '',
            sort_order: '0',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (question: ScreeningQuestionData) => {
        setEditingQuestion(question);
        setFormData({
            category_id: question.category_id?.toString() || '',
            question: question.question,
            type: question.type,
            options: question.options?.join('\n') || '',
            is_required: question.is_required,
            helper_text: question.helper_text || '',
            sort_order: question.sort_order.toString(),
            is_active: question.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            ...formData,
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
            options:
                ['radio', 'checkbox', 'select'].includes(formData.type) && formData.options
                    ? formData.options.split('\n').filter(o => o.trim())
                    : null,
            sort_order: parseInt(formData.sort_order),
        };

        if (editingQuestion) {
            router.put(`/admin/screening-questions/${editingQuestion.id}`, data, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        } else {
            router.post('/admin/screening-questions', data, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pertanyaan screening ini?')) {
            router.delete(`/admin/screening-questions/${id}`);
        }
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/screening-questions',
            { search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/screening-questions',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns: Column<ScreeningQuestionData>[] = [
        {
            header: 'Pertanyaan',
            cell: row => (
                <div>
                    <div className="font-medium">{row.question}</div>
                    {row.category && (
                        <div className="text-xs text-muted-foreground">
                            Kategori: {row.category.name}
                        </div>
                    )}
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
            header: 'Status',
            cell: row => (
                <div className="flex gap-1">
                    {row.is_active && <Badge variant="default">Aktif</Badge>}
                    {!row.is_active && <Badge variant="secondary">Tidak Aktif</Badge>}
                    {row.is_required && <Badge variant="outline">Wajib</Badge>}
                </div>
            ),
        },
        {
            header: 'Urutan',
            cell: row => <span className="text-sm">{row.sort_order}</span>,
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
            <Head title="Pengelolaan Pertanyaan Screening" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Pertanyaan Screening</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={questions.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari pertanyaan screening..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: questions.current_page,
                                lastPage: questions.last_page,
                                total: questions.total,
                                perPage: questions.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                            actions={
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Pertanyaan
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    editingQuestion
                        ? 'Edit Pertanyaan Screening'
                        : 'Tambah Pertanyaan Screening'
                }
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <FormControl>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={formData.category_id}
                                onChange={e =>
                                    setFormData({ ...formData, category_id: e.target.value })
                                }
                            >
                                <option value="">Tidak Ada (Umum)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Pertanyaan *</FormLabel>
                        <FormControl>
                            <Input
                                value={formData.question}
                                onChange={e =>
                                    setFormData({ ...formData, question: e.target.value })
                                }
                                required
                                placeholder="Masukkan pertanyaan (contoh: Apakah Anda pernah merasakan kecemasan berlebihan?)"
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Tipe Pertanyaan *</FormLabel>
                        <FormControl>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={formData.type}
                                onChange={e =>
                                    setFormData({ ...formData, type: e.target.value as any })
                                }
                            >
                                <option value="text">Teks</option>
                                <option value="textarea">Area Teks</option>
                                <option value="radio">Radio</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="select">Pilihan</option>
                                <option value="date">Tanggal</option>
                                <option value="number">Angka</option>
                            </select>
                        </FormControl>
                    </FormItem>

                    {['radio', 'checkbox', 'select'].includes(formData.type) && (
                        <FormItem>
                            <FormLabel>Opsi (satu per baris)</FormLabel>
                            <FormControl>
                                <Textarea
                                    value={formData.options}
                                    onChange={e =>
                                        setFormData({ ...formData, options: e.target.value })
                                    }
                                    rows={4}
                                    placeholder="Ya&#10;Tidak&#10;Kadang-kadang"
                                />
                            </FormControl>
                        </FormItem>
                    )}

                    <FormItem>
                        <FormLabel>Teks Bantuan</FormLabel>
                        <FormControl>
                            <Textarea
                                value={formData.helper_text}
                                onChange={e =>
                                    setFormData({ ...formData, helper_text: e.target.value })
                                }
                                rows={2}
                                placeholder="Masukkan teks bantuan untuk pengguna"
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

                    <div className="flex gap-4">
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={formData.is_required}
                                    onCheckedChange={checked =>
                                        setFormData({
                                            ...formData,
                                            is_required: checked as boolean,
                                        })
                                    }
                                />
                            </FormControl>
                            <FormLabel className="!mt-0">Wajib</FormLabel>
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
