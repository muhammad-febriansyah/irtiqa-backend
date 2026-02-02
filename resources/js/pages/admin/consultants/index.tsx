import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}

interface ConsultantData {
    id: number;
    user_id: number;
    user: User;
    specialist_category: string | null;
    level: 'junior' | 'senior' | 'expert';
    city: string | null;
    province: string | null;
    is_active: boolean;
    is_verified: boolean;
    certificate_number: string | null;
    verified_at: string | null;
    bio: string | null;
    rating_average: number;
    total_cases: number;
    total_ratings: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    consultants: {
        data: ConsultantData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        level?: string;
        is_verified?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Konsultan', href: '/admin/consultants' },
];

export default function ConsultantsIndex({ consultants, filters }: Props) {
    const handleDelete = (consultant: ConsultantData) => {
        if (confirm(`Apakah Anda yakin ingin menghapus konsultan ${consultant.user.name}?`)) {
            router.delete(`/admin/consultants/${consultant.id}`, {
                onSuccess: () => {
                    toast.success('Konsultan berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus konsultan');
                },
            });
        }
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/consultants',
            { ...filters, search: query },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/consultants',
            { ...filters, page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const columns: Column<ConsultantData>[] = [
        {
            header: 'Konsultan',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                        <AvatarImage
                            src={row.user.avatar ? `/storage/${row.user.avatar}` : undefined}
                            alt={row.user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {row.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.user.name}</div>
                        <div className="text-xs text-muted-foreground">{row.user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Spesialisasi',
            cell: (row) => <div className="text-sm">{row.specialist_category || '-'}</div>,
        },
        {
            header: 'Tingkat',
            cell: (row) => {
                const levelConfig: Record<
                    string,
                    { label: string; className: string }
                > = {
                    junior: {
                        label: 'Junior',
                        className: 'bg-slate-500 text-white border-slate-500',
                    },
                    senior: {
                        label: 'Senior',
                        className: 'bg-blue-500 text-white border-blue-500',
                    },
                    expert: {
                        label: 'Expert',
                        className: 'bg-amber-500 text-white border-amber-500',
                    },
                };
                const config = levelConfig[row.level] || levelConfig.junior;
                return (
                    <Badge variant="outline" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            header: 'Lokasi',
            cell: (row) => (
                <div className="text-sm">
                    {row.city && row.province
                        ? `${row.city}, ${row.province}`
                        : row.city || row.province || '-'}
                </div>
            ),
        },
        {
            header: 'Statistik',
            cell: (row) => (
                <div className="text-xs">
                    <div className="flex items-center gap-1">
                        <span className="font-medium">★</span>
                        <span>
                            {row.rating_average
                                ? Number(row.rating_average).toFixed(1)
                                : '0.0'}
                        </span>
                    </div>
                    <div className="text-muted-foreground">{row.total_cases || 0} kasus</div>
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (row) => (
                <div className="flex gap-1 flex-wrap">
                    {row.is_active ? (
                        <Badge variant="default">Aktif</Badge>
                    ) : (
                        <Badge variant="secondary">Nonaktif</Badge>
                    )}
                    {row.is_verified && (
                        <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 border-green-200"
                        >
                            Terverifikasi
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (row) => (
                <div className="flex justify-end gap-2">
                    <Link href={`/admin/consultants/${row.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit">
                            <Pencil className="size-4" />
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(row)}
                        title="Hapus"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengelolaan Konsultan" />

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Konsultan</CardTitle>
                        <CardDescription>
                            Kelola data konsultan yang terdaftar di sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={consultants.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari nama, email, atau lokasi konsultan..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: consultants.current_page,
                                lastPage: consultants.last_page,
                                total: consultants.total,
                                perPage: consultants.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Belum ada konsultan terdaftar."
                            actions={
                                <Link href="/admin/consultants/create">
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Konsultan
                                    </Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
