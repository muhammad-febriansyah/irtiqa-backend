import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PackageData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'session' | 'period' | 'unlimited';
    sessions_count: number | null;
    duration_days: number | null;
    price: number;
    features: string[] | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    packages: {
        data: PackageData[];
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
    { title: 'Paket', href: '/admin/packages' },
];

export default function PackagesIndex({ packages, filters }: Props) {
    const handleDelete = (pkg: PackageData) => {
        if (confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"?`)) {
            router.delete(`/admin/packages/${pkg.id}`, {
                onSuccess: () => {
                    toast.success('Paket berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus paket');
                },
            });
        }
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/packages',
            { ...filters, search: query },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/packages',
            { ...filters, page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const columns: Column<PackageData>[] = [
        {
            header: 'Nama Paket',
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground">{row.slug}</div>
                </div>
            ),
        },
        {
            header: 'Tipe',
            cell: (row) => {
                const typeConfig = {
                    session: {
                        label: 'Berdasarkan Sesi',
                        className: 'bg-blue-500/10 text-blue-600 border-blue-200',
                    },
                    period: {
                        label: 'Berdasarkan Periode',
                        className: 'bg-green-500/10 text-green-600 border-green-200',
                    },
                    unlimited: {
                        label: 'Tidak Terbatas',
                        className: 'bg-purple-500/10 text-purple-600 border-purple-200',
                    },
                };
                const config = typeConfig[row.type];
                return (
                    <Badge variant="outline" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            header: 'Detail',
            cell: (row) => (
                <div className="text-sm">
                    {row.type === 'session' && row.sessions_count && (
                        <span>{row.sessions_count} sesi</span>
                    )}
                    {row.type === 'period' && row.duration_days && (
                        <span>{row.duration_days} hari</span>
                    )}
                    {row.type === 'unlimited' && <span>Tidak Terbatas</span>}
                </div>
            ),
        },
        {
            header: 'Harga',
            cell: (row) => (
                <div className="font-medium">Rp {row.price.toLocaleString('id-ID')}</div>
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
                    {row.is_featured && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                            Unggulan
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
                    <Link href={`/admin/packages/${row.id}`}>
                        <Button size="sm" variant="outline" title="Lihat Detail">
                            <Eye className="size-4" />
                        </Button>
                    </Link>
                    <Link href={`/admin/packages/${row.id}/edit`}>
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
            <Head title="Paket Konsultasi" />

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Paket Konsultasi</CardTitle>
                        <CardDescription>
                            Kelola paket layanan konsultasi untuk pengguna
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={packages.data}
                            searchable
                            searchPlaceholder="Cari nama paket..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: packages.current_page,
                                lastPage: packages.last_page,
                                perPage: packages.per_page,
                                total: packages.total,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Belum ada paket konsultasi tersedia."
                            actions={
                                <Link href="/admin/packages/create">
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Paket
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

