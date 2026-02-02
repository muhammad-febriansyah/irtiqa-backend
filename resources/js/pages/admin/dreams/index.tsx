import { Head, router } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface DreamData {
    id: number;
    user_name: string;
    dream_content: string;
    dream_date: string;
    dream_time: string;
    classification: string | null;
    classification_label: string;
    requested_consultation: boolean;
    has_ticket: boolean;
    ticket_number: string;
    created_at: string;
}

interface Props {
    dreams: {
        data: DreamData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        classification?: string;
        requested_consultation?: boolean;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Laporan Mimpi', href: '/admin/dreams' },
];

export default function DreamsIndex({ dreams, filters }: Props) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedDream, setSelectedDream] = useState<DreamData | null>(null);

    const handleFilter = (key: string, value: string) => {
        const filterValue = value === 'all' ? undefined : value;
        router.get(
            '/admin/dreams',
            { ...filters, [key]: filterValue },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (search: string) => {
        router.get(
            '/admin/dreams',
            { ...filters, search },
            { preserveState: true, replace: true }
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/dreams',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleViewDetail = (dream: DreamData) => {
        setSelectedDream(dream);
        setIsDetailOpen(true);
    };

    const handleDelete = (dream: DreamData) => {
        if (confirm('Yakin ingin menghapus laporan mimpi ini?')) {
            router.delete(`/admin/dreams/${dream.id}`, {
                onSuccess: () => {
                    toast.success('Laporan mimpi berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus laporan mimpi');
                },
            });
        }
    };

    const getClassificationBadge = (classification: string | null) => {
        if (!classification) return <Badge variant="outline">-</Badge>;

        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            khayali_nafsani: 'secondary',
            emotional: 'default',
            sensitive_indication: 'default',
            needs_consultation: 'destructive',
        };
        return <Badge variant={variants[classification] || 'default'}>{classification}</Badge>;
    };

    const columns: Column<DreamData>[] = [
        {
            key: 'user_name',
            label: 'Pengguna',
            sortable: false,
        },
        {
            key: 'dream_content',
            label: 'Isi Mimpi',
            sortable: false,
            render: (dream) => (
                <span className="text-sm text-muted-foreground line-clamp-2">{dream.dream_content}</span>
            ),
        },
        {
            key: 'dream_date',
            label: 'Tanggal',
            sortable: false,
        },
        {
            key: 'dream_time',
            label: 'Waktu',
            sortable: false,
        },
        {
            key: 'classification_label',
            label: 'Klasifikasi',
            sortable: false,
            render: (dream) => getClassificationBadge(dream.classification),
        },
        {
            key: 'requested_consultation',
            label: 'Konsultasi',
            sortable: false,
            render: (dream) => (
                <Badge variant={dream.requested_consultation ? 'default' : 'outline'}>
                    {dream.requested_consultation ? 'Ya' : 'Tidak'}
                </Badge>
            ),
        },
        {
            key: 'ticket_number',
            label: 'Tiket',
            sortable: false,
            render: (dream) =>
                dream.has_ticket ? (
                    <span className="font-mono text-sm">{dream.ticket_number}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (dream) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(dream)}
                        title="Lihat Detail"
                    >
                        <Eye className="size-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(dream)}
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
            <Head title="Laporan Mimpi" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Laporan Mimpi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3 mb-4">
                            <Select
                                value={filters.classification || 'all'}
                                onValueChange={(value) => handleFilter('classification', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Klasifikasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Klasifikasi</SelectItem>
                                    <SelectItem value="khayali_nafsani">Khayali Nafsani</SelectItem>
                                    <SelectItem value="emotional">Emosional</SelectItem>
                                    <SelectItem value="sensitive_indication">Indikasi Sensitif</SelectItem>
                                    <SelectItem value="needs_consultation">Perlu Konsultasi</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.requested_consultation ? 'true' : 'all'}
                                onValueChange={(value) => handleFilter('requested_consultation', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status Konsultasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="true">Minta Konsultasi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DataTable
                            columns={columns}
                            data={dreams.data}
                            searchable
                            searchPlaceholder="Cari isi mimpi atau nama pengguna..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: dreams.current_page,
                                lastPage: dreams.last_page,
                                perPage: dreams.per_page,
                                total: dreams.total,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada laporan mimpi."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Laporan Mimpi</DialogTitle>
                    </DialogHeader>
                    {selectedDream && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Pengguna</Label>
                                    <p>{selectedDream.user_name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Tanggal Mimpi</Label>
                                    <p>{selectedDream.dream_date}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Waktu</Label>
                                    <p>{selectedDream.dream_time}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Klasifikasi</Label>
                                    <p>{selectedDream.classification_label}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Isi Mimpi</Label>
                                <p className="mt-2 text-sm">{selectedDream.dream_content}</p>
                            </div>
                            {selectedDream.has_ticket && (
                                <div>
                                    <Label className="text-muted-foreground">Tiket Konsultasi</Label>
                                    <p className="font-mono">{selectedDream.ticket_number}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
