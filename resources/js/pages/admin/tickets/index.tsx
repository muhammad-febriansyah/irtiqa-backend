import { Head, router } from '@inertiajs/react';
import { Eye, Filter } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface TicketData {
    id: number;
    ticket_number: string;
    user_name: string;
    consultant_name: string;
    category: string;
    status: string;
    status_label: string;
    risk_level: string | null;
    risk_level_label: string;
    urgency: string;
    urgency_label: string;
    assigned_at: string | null;
    completed_at: string | null;
    created_at: string;
}

interface Props {
    tickets: {
        data: TicketData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: string[];
    filters: {
        search?: string;
        status?: string;
        risk_level?: string;
        category?: string;
        urgency?: string;
        waiting_assignment?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Tiket Pendampingan', href: '/admin/tickets' },
];

export default function TicketsIndex({ tickets, categories, filters }: Props) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

    const handleFilter = (key: string, value: string) => {
        const filterValue = value === 'all' ? undefined : value;
        router.get(
            '/admin/tickets',
            { ...filters, [key]: filterValue },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (search: string) => {
        router.get(
            '/admin/tickets',
            { ...filters, search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/tickets',
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleViewDetail = (ticket: TicketData) => {
        setSelectedTicket(ticket);
        setIsDetailOpen(true);
    };

    const columns: Column<TicketData>[] = [
        {
            header: 'No. Tiket',
            cell: (ticket) => (
                <span className="font-mono text-sm font-medium">{ticket.ticket_number}</span>
            ),
        },
        {
            header: 'Pengguna',
            cell: (ticket) => (
                <div>
                    <div className="font-medium">{ticket.user_name}</div>
                    <div className="text-xs text-muted-foreground">{ticket.category}</div>
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (ticket) => {
                const statusConfig: Record<string, { label: string; className: string }> = {
                    waiting: { label: 'Menunggu', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
                    in_progress: { label: 'Diproses', className: 'bg-blue-500/10 text-blue-600 border-blue-200' },
                    completed: { label: 'Selesai', className: 'bg-green-500/10 text-green-600 border-green-200' },
                    referred: { label: 'Dirujuk', className: 'bg-purple-500/10 text-purple-600 border-purple-200' },
                    rejected: { label: 'Ditolak', className: 'bg-red-500/10 text-red-600 border-red-200' },
                };
                const config = statusConfig[ticket.status] || { label: ticket.status_label, className: '' };
                return (
                    <Badge variant="outline" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            header: 'Risk Level',
            cell: (ticket) => {
                if (!ticket.risk_level) {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                const riskConfig: Record<string, { label: string; className: string }> = {
                    low: { label: 'Rendah', className: 'bg-slate-500/10 text-slate-600 border-slate-200' },
                    medium: { label: 'Sedang', className: 'bg-amber-500/10 text-amber-600 border-amber-200' },
                    high: { label: 'Tinggi', className: 'bg-orange-500/10 text-orange-600 border-orange-200' },
                    critical: { label: 'Kritis', className: 'bg-red-500/10 text-red-600 border-red-200' },
                };
                const config = riskConfig[ticket.risk_level] || { label: ticket.risk_level_label, className: '' };
                return (
                    <Badge variant="outline" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            header: 'Konsultan',
            cell: (ticket) => (
                <span className="text-sm">{ticket.consultant_name || '-'}</span>
            ),
        },
        {
            header: 'Dibuat',
            cell: (ticket) => (
                <span className="text-sm text-muted-foreground">{ticket.created_at}</span>
            ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (ticket) => (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(ticket)}
                        title="Lihat Detail"
                    >
                        <Eye className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tiket Pendampingan" />

            <div className="space-y-6 p-4">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter className="size-5 text-primary" />
                            <CardTitle>Filter Tiket</CardTitle>
                        </div>
                        <CardDescription>
                            Filter dan cari tiket berdasarkan kriteria tertentu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => handleFilter('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="waiting">Menunggu</SelectItem>
                                        <SelectItem value="in_progress">Diproses</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                        <SelectItem value="referred">Dirujuk</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Risk Level</Label>
                                <Select
                                    value={filters.risk_level || 'all'}
                                    onValueChange={(value) => handleFilter('risk_level', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Level</SelectItem>
                                        <SelectItem value="low">Rendah</SelectItem>
                                        <SelectItem value="medium">Sedang</SelectItem>
                                        <SelectItem value="high">Tinggi</SelectItem>
                                        <SelectItem value="critical">Kritis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select
                                    value={filters.category || 'all'}
                                    onValueChange={(value) => handleFilter('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Tiket Pendampingan</CardTitle>
                        <CardDescription>
                            Kelola dan pantau tiket pendampingan pengguna
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={tickets.data}
                            searchable
                            searchPlaceholder="Cari nomor tiket atau nama pengguna..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: tickets.current_page,
                                lastPage: tickets.last_page,
                                perPage: tickets.per_page,
                                total: tickets.total,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Belum ada tiket pendampingan."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal - Simplified version */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Tiket</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">No. Tiket</Label>
                                    <p className="font-mono">{selectedTicket.ticket_number}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <p>{selectedTicket.status_label}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Pengguna</Label>
                                    <p>{selectedTicket.user_name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Konsultan</Label>
                                    <p>{selectedTicket.consultant_name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Kategori</Label>
                                    <p>{selectedTicket.category}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Risk Level</Label>
                                    <p>{selectedTicket.risk_level_label}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
