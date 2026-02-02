import { Head, router, Link } from '@inertiajs/react';
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface EducationalContentData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    type: 'article' | 'video' | 'audio' | 'infographic' | 'guide';
    category: string | null;
    tags: string[] | null;
    thumbnail: string | null;
    media_url: string | null;
    duration_minutes: number | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    reading_time_minutes: number | null;
    is_published: boolean;
    is_featured: boolean;
    published_at: string | null;
    author_id: number;
    author: User;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    contents: {
        data: EducationalContentData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
        level?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Konten Edukasi', href: '/admin/educational-contents' },
];

export default function EducationalContentsIndex({ contents, filters }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; content: EducationalContentData | null }>({
        open: false,
        content: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (content: EducationalContentData) => {
        setDeleteDialog({ open: true, content });
    };

    const handleDeleteConfirm = () => {
        if (!deleteDialog.content) return;

        setIsDeleting(true);
        router.delete(`/admin/educational-contents/${deleteDialog.content.id}`, {
            onSuccess: () => {
                toast.success('Konten berhasil dihapus', {
                    description: `"${deleteDialog.content?.title}" telah dihapus dari daftar.`,
                });
                setDeleteDialog({ open: false, content: null });
            },
            onError: () => {
                toast.error('Gagal menghapus konten', {
                    description: 'Terjadi kesalahan saat menghapus konten. Silakan coba lagi.',
                });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/educational-contents',
            { ...filters, search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/educational-contents',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            article: 'Artikel',
            video: 'Video',
            audio: 'Audio',
            infographic: 'Infografis',
            guide: 'Panduan',
        };
        return labels[type] || type;
    };

    const getLevelLabel = (level: string) => {
        const labels: Record<string, string> = {
            beginner: 'Pemula',
            intermediate: 'Menengah',
            advanced: 'Lanjutan',
        };
        return labels[level] || level;
    };

    const columns: Column<EducationalContentData>[] = [
        {
            header: 'Judul',
            cell: row => (
                <div>
                    <div className="font-medium">{row.title}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.author.name} • {row.category || 'Tanpa Kategori'}
                    </div>
                </div>
            ),
        },
        {
            header: 'Tipe',
            cell: row => <Badge variant="outline">{getTypeLabel(row.type)}</Badge>,
        },
        {
            header: 'Level',
            cell: row => <Badge variant="secondary">{getLevelLabel(row.level)}</Badge>,
        },
        {
            header: 'Status',
            cell: row => (
                <div className="flex flex-col gap-1">
                    {row.is_published ? (
                        <Badge variant="default">Dipublikasi</Badge>
                    ) : (
                        <Badge variant="secondary">Draft</Badge>
                    )}
                    {row.is_featured && <Badge variant="default">Unggulan</Badge>}
                </div>
            ),
        },
        {
            header: 'Statistik',
            cell: row => (
                <div className="text-xs text-muted-foreground">
                    <div>{row.views_count} views</div>
                    <div>{row.likes_count} likes</div>
                </div>
            ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: row => (
                <div className="flex justify-end gap-2">
                    <Link href={`/admin/educational-contents/${row.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit konten">
                            <Pencil className="size-4" />
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(row)}
                        title="Hapus konten"
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengelolaan Konten Edukasi" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Konten Edukasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={contents.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari konten..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: contents.current_page,
                                lastPage: contents.last_page,
                                total: contents.total,
                                perPage: contents.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                            actions={
                                <Link href="/admin/educational-contents/create">
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Konten
                                    </Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, content: open ? deleteDialog.content : null })}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="size-5 text-destructive" />
                            </div>
                            <div>
                                <DialogTitle>Hapus Konten Edukasi</DialogTitle>
                                <DialogDescription>
                                    Tindakan ini tidak dapat dibatalkan
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            Apakah Anda yakin ingin menghapus konten berikut?
                        </p>
                        {deleteDialog.content && (
                            <div className="mt-3 rounded-lg border bg-muted/50 p-3">
                                <p className="font-medium">{deleteDialog.content.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {getTypeLabel(deleteDialog.content.type)} • {deleteDialog.content.author.name}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, content: null })}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Konten'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
