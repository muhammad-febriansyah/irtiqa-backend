import { Head, router } from '@inertiajs/react';
import { CheckCircle, Eye, AlertTriangle } from 'lucide-react';
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

interface CrisisAlertData {
    id: number;
    user_name: string;
    alert_type: string;
    alert_type_label: string;
    severity: string;
    severity_label: string;
    status: string;
    status_label: string;
    assigned_admin_name: string | null;
    created_at: string;
    acknowledged_at: string | null;
    resolved_at: string | null;
}

interface Props {
    alerts: {
        data: CrisisAlertData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        severity?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Crisis Alerts', href: '/admin/crisis-alerts' },
];

export default function CrisisAlertsIndex({ alerts, filters }: Props) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<CrisisAlertData | null>(null);
    const [resolveNotes, setResolveNotes] = useState('');

    const handleFilter = (key: string, value: string) => {
        const filterValue = value === 'all' ? undefined : value;
        router.get(
            '/admin/crisis-alerts',
            { ...filters, [key]: filterValue },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (search: string) => {
        router.get(
            '/admin/crisis-alerts',
            { ...filters, search },
            { preserveState: true, replace: true }
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/crisis-alerts',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleViewDetail = (alert: CrisisAlertData) => {
        setSelectedAlert(alert);
        setResolveNotes('');
        setIsDetailOpen(true);
    };

    const handleAcknowledge = (alert: CrisisAlertData) => {
        if (confirm('Yakin ingin acknowledge alert ini?')) {
            router.post(`/admin/crisis-alerts/${alert.id}/acknowledge`, {}, {
                onSuccess: () => {
                    toast.success('Alert berhasil di-acknowledge');
                    setIsDetailOpen(false);
                },
                onError: () => {
                    toast.error('Gagal acknowledge alert');
                },
            });
        }
    };

    const handleResolve = (alert: CrisisAlertData) => {
        if (!resolveNotes.trim()) {
            toast.error('Silakan masukkan catatan penyelesaian');
            return;
        }

        if (confirm('Yakin ingin resolve alert ini?')) {
            router.post(`/admin/crisis-alerts/${alert.id}/resolve`, {
                notes: resolveNotes,
            }, {
                onSuccess: () => {
                    toast.success('Alert berhasil di-resolve');
                    setIsDetailOpen(false);
                    setResolveNotes('');
                },
                onError: () => {
                    toast.error('Gagal resolve alert');
                },
            });
        }
    };

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            low: 'outline',
            medium: 'secondary',
            high: 'default',
            critical: 'destructive',
        };
        return <Badge variant={variants[severity] || 'default'}>{severity.toUpperCase()}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'destructive',
            acknowledged: 'secondary',
            resolved: 'default',
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    };

    const columns: Column<CrisisAlertData>[] = [
        {
            key: 'user_name',
            label: 'Pengguna',
            sortable: false,
        },
        {
            key: 'alert_type_label',
            label: 'Tipe Alert',
            sortable: false,
        },
        {
            key: 'severity',
            label: 'Severity',
            sortable: false,
            render: (alert) => getSeverityBadge(alert.severity),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (alert) => getStatusBadge(alert.status),
        },
        {
            key: 'assigned_admin_name',
            label: 'Assigned To',
            sortable: false,
            render: (alert) => (
                <span className="text-sm">
                    {alert.assigned_admin_name || <span className="text-muted-foreground">-</span>}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Waktu',
            sortable: false,
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (alert) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(alert)}
                        title="Lihat Detail"
                    >
                        <Eye className="size-4" />
                    </Button>
                    {alert.status === 'pending' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert)}
                            title="Acknowledge"
                        >
                            <CheckCircle className="size-4" />
                        </Button>
                    )}
                    {alert.status === 'acknowledged' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(alert)}
                            title="Resolve"
                        >
                            <CheckCircle className="size-4 text-green-600" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crisis Alerts" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Crisis Alerts Management</CardTitle>
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
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.severity || 'all'}
                                onValueChange={(value) => handleFilter('severity', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Severity</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DataTable
                            columns={columns}
                            data={alerts.data}
                            searchable
                            searchPlaceholder="Cari nama pengguna..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: alerts.current_page,
                                lastPage: alerts.last_page,
                                perPage: alerts.per_page,
                                total: alerts.total,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada crisis alerts."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Crisis Alert</DialogTitle>
                    </DialogHeader>
                    {selectedAlert && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Pengguna</Label>
                                    <p>{selectedAlert.user_name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Tipe Alert</Label>
                                    <p>{selectedAlert.alert_type_label}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Severity</Label>
                                    <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Waktu Dibuat</Label>
                                    <p>{selectedAlert.created_at}</p>
                                </div>
                                {selectedAlert.assigned_admin_name && (
                                    <div>
                                        <Label className="text-muted-foreground">Assigned To</Label>
                                        <p>{selectedAlert.assigned_admin_name}</p>
                                    </div>
                                )}
                                {selectedAlert.acknowledged_at && (
                                    <div>
                                        <Label className="text-muted-foreground">Acknowledged At</Label>
                                        <p>{selectedAlert.acknowledged_at}</p>
                                    </div>
                                )}
                                {selectedAlert.resolved_at && (
                                    <div>
                                        <Label className="text-muted-foreground">Resolved At</Label>
                                        <p>{selectedAlert.resolved_at}</p>
                                    </div>
                                )}
                            </div>

                            {selectedAlert.status === 'acknowledged' && (
                                <div>
                                    <Label>Catatan Penyelesaian <span className="text-red-600">*</span></Label>
                                    <Textarea
                                        value={resolveNotes}
                                        onChange={(e) => setResolveNotes(e.target.value)}
                                        placeholder="Masukkan catatan penyelesaian crisis alert..."
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 justify-end pt-4 border-t">
                                {selectedAlert.status === 'pending' && (
                                    <Button onClick={() => handleAcknowledge(selectedAlert)}>
                                        <CheckCircle className="size-4 mr-2" />
                                        Acknowledge
                                    </Button>
                                )}
                                {selectedAlert.status === 'acknowledged' && (
                                    <Button onClick={() => handleResolve(selectedAlert)}>
                                        <CheckCircle className="size-4 mr-2" />
                                        Resolve
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
