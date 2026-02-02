import { Head, router } from '@inertiajs/react';
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { CrudModal } from '@/components/crud-modal';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface FaqData {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    order: number;
    is_published: boolean;
    views_count: number;
    helpful_count: number;
    tags: string[] | null;
    created_at: string;
}

interface Props {
    faqs: {
        data: FaqData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        is_published?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'FAQ', href: '/admin/faqs' },
];

const faqCategories = [
    'Psiko-Spiritual',
    'Mimpi & Tidur',
    'Waswas & Ibadah',
    'Keluarga & Anak',
    'Adab Menghadapi Ujian',
];

export default function FaqsIndex({ faqs, categories, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqData | null>(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        order: 0,
        is_published: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingFaq(null);
        setFormData({
            question: '',
            answer: '',
            category: '',
            order: 0,
            is_published: true,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (faq: FaqData) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category || '',
            order: faq.order,
            is_published: faq.is_published,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingFaq ? `/admin/faqs/${editingFaq.id}` : '/admin/faqs';
        const method = editingFaq ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                toast.success(`FAQ berhasil ${editingFaq ? 'diperbarui' : 'ditambahkan'}`);
                setIsModalOpen(false);
            },
            onError: () => {
                toast.error('Gagal menyimpan FAQ');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (faq: FaqData) => {
        if (confirm('Yakin ingin menghapus FAQ ini?')) {
            router.delete(`/admin/faqs/${faq.id}`, {
                onSuccess: () => {
                    toast.success('FAQ berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus FAQ');
                },
            });
        }
    };

    const handleTogglePublish = (faq: FaqData) => {
        router.post(`/admin/faqs/${faq.id}/toggle-publish`, {}, {
            onSuccess: () => {
                toast.success(`FAQ berhasil ${faq.is_published ? 'disembunyikan' : 'dipublikasikan'}`);
            },
        });
    };

    const columns: Column<FaqData>[] = [
        {
            header: 'Pertanyaan',
            accessor: 'question',
            className: 'max-w-md',
        },
        {
            header: 'Jawaban',
            cell: (faq) => (
                <span className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</span>
            ),
            className: 'max-w-sm',
        },
        {
            header: 'Kategori',
            cell: (faq) => faq.category || '-',
        },
        {
            header: 'Urutan',
            accessor: 'order',
            className: 'text-center',
        },
        {
            header: 'Status',
            cell: (faq) => (
                <Badge variant={faq.is_published ? 'default' : 'outline'}>
                    {faq.is_published ? 'Publik' : 'Draft'}
                </Badge>
            ),
        },
        {
            header: 'Views',
            accessor: 'views_count',
            className: 'text-center',
        },
        {
            header: 'Aksi',
            cell: (faq) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(faq)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(faq)}>
                            {faq.is_published ? (
                                <>
                                    <EyeOff className="mr-2 size-4" />
                                    Sembunyikan
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 size-4" />
                                    Publikasikan
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(faq)}
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
            <Head title="FAQ - Tanya Jawab Umum" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="FAQ - Tanya Jawab Umum"
                        description="Kelola pertanyaan dan jawaban yang sering ditanyakan"
                    />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 size-4" />
                        Tambah FAQ
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-6">
                        <DataTable
                            columns={columns}
                            data={faqs.data}
                            searchable
                            searchPlaceholder="Cari FAQ..."
                            onSearch={(query) => {
                                router.get('/admin/faqs', { ...filters, search: query }, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            pagination={{
                                currentPage: faqs.current_page,
                                lastPage: faqs.last_page,
                                perPage: faqs.per_page,
                                total: faqs.total,
                                onPageChange: (page) => {
                                    router.get('/admin/faqs', { ...filters, page }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                },
                            }}
                            emptyMessage="Belum ada FAQ tersedia"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFaq ? 'Edit FAQ' : 'Tambah FAQ'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question">
                            Pertanyaan <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="question"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            placeholder="Masukkan pertanyaan"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="answer">
                            Jawaban <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="answer"
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            placeholder="Masukkan jawaban"
                            rows={6}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {faqCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="order">Urutan</Label>
                            <Input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="is_published">Status</Label>
                            <Select
                                value={formData.is_published.toString()}
                                onValueChange={(value) => setFormData({ ...formData, is_published: value === 'true' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Dipublikasikan</SelectItem>
                                    <SelectItem value="false">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CrudModal>
        </AppLayout>
    );
}
