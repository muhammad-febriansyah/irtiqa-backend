import { Head, router } from '@inertiajs/react';
import { CheckCircle, Eye, XCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ConsultantApplicationData {
    id: number;
    user_name: string;
    full_name: string;
    phone: string;
    certification_type: string;
    certification_type_label: string;
    certification_number: string;
    institution: string;
    experience_years: number;
    specialization: string;
    motivation: string;
    certification_file_url: string | null;
    status: string;
    status_label: string;
    reviewed_by_admin_name: string | null;
    admin_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
}

interface Props {
    applications: {
        data: ConsultantApplicationData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        certification_type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Aplikasi Konsultan', href: '/admin/consultant-applications' },
];

export default function ConsultantApplicationsIndex({ applications, filters }: Props) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<ConsultantApplicationData | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    const handleFilter = (key: string, value: string) => {
        const filterValue = value === 'all' ? undefined : value;
        router.get(
            '/admin/consultant-applications',
            { ...filters, [key]: filterValue },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (search: string) => {
        router.get(
            '/admin/consultant-applications',
            { ...filters, search },
            { preserveState: true, replace: true }
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/consultant-applications',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleViewDetail = (application: ConsultantApplicationData) => {
        setSelectedApplication(application);
        setAdminNotes(application.admin_notes || '');
        setIsDetailOpen(true);
    };

    const handleApprove = (application: ConsultantApplicationData) => {
        if (confirm('Yakin ingin approve aplikasi ini? Konsultan akan otomatis dibuat.')) {
            router.post(`/admin/consultant-applications/${application.id}/approve`, {
                admin_notes: adminNotes,
            }, {
                onSuccess: () => {
                    toast.success('Aplikasi berhasil di-approve');
                    setIsDetailOpen(false);
                },
                onError: () => {
                    toast.error('Gagal approve aplikasi');
                },
            });
        }
    };

    const handleReject = (application: ConsultantApplicationData) => {
        if (!adminNotes.trim()) {
            toast.error('Silakan masukkan alasan penolakan');
            return;
        }

        if (confirm('Yakin ingin reject aplikasi ini?')) {
            router.post(`/admin/consultant-applications/${application.id}/reject`, {
                reason: adminNotes,
                notes: adminNotes,
            }, {
                onSuccess: () => {
                    toast.success('Aplikasi berhasil di-reject');
                    setIsDetailOpen(false);
                },
                onError: () => {
                    toast.error('Gagal reject aplikasi');
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
    };

    const columns: Column<ConsultantApplicationData>[] = [
        {
            key: 'full_name',
            label: 'Nama Lengkap',
            sortable: false,
        },
        {
            key: 'certification_type_label',
            label: 'Tipe Sertifikasi',
            sortable: false,
        },
        {
            key: 'institution',
            label: 'Institusi',
            sortable: false,
        },
        {
            key: 'experience_years',
            label: 'Pengalaman',
            sortable: false,
            render: (app) => <span>{app.experience_years} tahun</span>,
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (app) => getStatusBadge(app.status),
        },
        {
            key: 'created_at',
            label: 'Tanggal Apply',
            sortable: false,
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (app) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(app)}
                        title="Lihat Detail"
                    >
                        <Eye className="size-4" />
                    </Button>
                    {app.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    handleViewDetail(app);
                                    setTimeout(() => handleApprove(app), 100);
                                }}
                                title="Approve"
                            >
                                <CheckCircle className="size-4 text-green-600" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    handleViewDetail(app);
                                    setTimeout(() => handleReject(app), 100);
                                }}
                                title="Reject"
                            >
                                <XCircle className="size-4 text-red-600" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aplikasi Konsultan" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Aplikasi Konsultan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => handleFilter('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.certification_type || 'all'}
                                onValueChange={(value) => handleFilter('certification_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="psikolog">Psikolog</SelectItem>
                                    <SelectItem value="konselor">Konselor</SelectItem>
                                    <SelectItem value="kyai">Kyai/Ustadz</SelectItem>
                                    <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DataTable
                            columns={columns}
                            data={applications.data}
                            searchable
                            searchPlaceholder="Cari nama atau institusi..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: applications.current_page,
                                lastPage: applications.last_page,
                                perPage: applications.per_page,
                                total: applications.total,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada aplikasi konsultan."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Aplikasi Konsultan</DialogTitle>
                    </DialogHeader>
                    {selectedApplication && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Nama Lengkap</Label>
                                    <p>{selectedApplication.full_name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Nomor Telepon</Label>
                                    <p>{selectedApplication.phone}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Tipe Sertifikasi</Label>
                                    <p>{selectedApplication.certification_type_label}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Nomor Sertifikat</Label>
                                    <p>{selectedApplication.certification_number}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Institusi</Label>
                                    <p>{selectedApplication.institution}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Pengalaman</Label>
                                    <p>{selectedApplication.experience_years} tahun</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Spesialisasi</Label>
                                    <p>{selectedApplication.specialization}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Motivasi</Label>
                                <p className="mt-2 text-sm whitespace-pre-wrap">{selectedApplication.motivation}</p>
                            </div>

                            {selectedApplication.certification_file_url && (
                                <div>
                                    <Label className="text-muted-foreground">File Sertifikat</Label>
                                    <div className="mt-2">
                                        <a
                                            href={selectedApplication.certification_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <FileText className="size-4" />
                                            Lihat File
                                        </a>
                                    </div>
                                </div>
                            )}

                            {selectedApplication.status === 'pending' && (
                                <div>
                                    <Label>Catatan Admin {selectedApplication.status === 'rejected' && '(Wajib untuk reject)'}</Label>
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Masukkan catatan untuk aplikasi ini..."
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                            )}

                            {selectedApplication.admin_notes && selectedApplication.status !== 'pending' && (
                                <div>
                                    <Label className="text-muted-foreground">Catatan Admin</Label>
                                    <p className="mt-2 text-sm whitespace-pre-wrap">{selectedApplication.admin_notes}</p>
                                </div>
                            )}

                            {selectedApplication.reviewed_by_admin_name && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Reviewed By</Label>
                                        <p>{selectedApplication.reviewed_by_admin_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Reviewed At</Label>
                                        <p>{selectedApplication.reviewed_at}</p>
                                    </div>
                                </div>
                            )}

                            {selectedApplication.status === 'pending' && (
                                <div className="flex gap-2 justify-end pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(selectedApplication)}
                                    >
                                        <XCircle className="size-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button onClick={() => handleApprove(selectedApplication)}>
                                        <CheckCircle className="size-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
