import { Head, router } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    FileText,
    Image as ImageIcon,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
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

interface TransactionData {
    id: number;
    invoice_number: string;
    user_name: string;
    consultant_name: string;
    package_name: string;
    amount: number;
    admin_fee: number;
    total_amount: number;
    status: string;
    status_label: string;
    payment_method: string;
    payment_method_label: string;
    escrow_status: string | null;
    escrow_status_label: string | null;
    transfer_proof: string | null;
    verified_at: string | null;
    paid_at: string | null;
    created_at: string;
}

interface TransactionDetail {
    id: number;
    invoice_number: string;
    user: { id: number; name: string; email: string };
    consultant: { id: number; name: string; email: string };
    package: { id: number; name: string; type: string };
    ticket: { id: number; ticket_number: string; category: string };
    amount: number;
    admin_fee: number;
    total_amount: number;
    status: string;
    status_label: string;
    payment_method: string;
    payment_method_label: string;
    escrow_status: string | null;
    escrow_status_label: string | null;
    escrow_held_amount: number;
    escrow_released_amount: number;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    transfer_proof: string | null;
    transfer_proof_uploaded_at: string | null;
    duitku_merchant_code: string | null;
    duitku_reference: string | null;
    duitku_payment_method: string | null;
    duitku_va_number: string | null;
    verified_by: string | null;
    verification_notes: string | null;
    verified_at: string | null;
    paid_at: string | null;
    expired_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    transactions: {
        data: TransactionData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        pending_verification?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Transaksi', href: '/admin/transactions' },
];

export default function TransactionsIndex({ transactions, filters }: Props) {
    const [detailModal, setDetailModal] = useState(false);
    const [verifyModal, setVerifyModal] = useState(false);
    const [imageModal, setImageModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<TransactionDetail | null>(null);
    const [verifyAction, setVerifyAction] = useState<'approve' | 'reject'>(
        'approve',
    );
    const [verifyNotes, setVerifyNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string>('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
            paid: 'default',
            pending: 'secondary',
            failed: 'destructive',
            expired: 'outline',
            refunded: 'outline',
        };
        return <Badge variant={variants[status] || 'outline'}>{label}</Badge>;
    };

    const getEscrowBadge = (status: string | null, label: string | null) => {
        if (!status || !label) return null;
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
            held: 'secondary',
            partially_released: 'default',
            fully_released: 'default',
            refunded: 'outline',
        };
        return <Badge variant={variants[status] || 'outline'}>{label}</Badge>;
    };

    const handleViewDetail = async (transaction: TransactionData) => {
        const response = await fetch(`/admin/transactions/${transaction.id}`);
        const data = await response.json();
        setSelectedTransaction(data);
        setDetailModal(true);
    };

    const handleVerify = (
        transaction: TransactionData,
        action: 'approve' | 'reject',
    ) => {
        fetch(`/admin/transactions/${transaction.id}`)
            .then((res) => res.json())
            .then((data) => {
                setSelectedTransaction(data);
                setVerifyAction(action);
                setVerifyNotes('');
                setVerifyModal(true);
            });
    };

    const submitVerification = () => {
        if (!selectedTransaction) return;

        setIsSubmitting(true);
        router.post(
            `/admin/transactions/${selectedTransaction.id}/verify`,
            {
                action: verifyAction,
                notes: verifyNotes,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setVerifyModal(false);
                    setSelectedTransaction(null);
                    setVerifyNotes('');
                },
            },
        );
    };

    const handleViewImage = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setImageModal(true);
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/transactions',
            { ...filters, search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        router.get(
            '/admin/transactions',
            { ...filters, [key]: value || undefined },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/transactions',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns: Column<TransactionData>[] = [
        {
            header: 'Invoice',
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.invoice_number}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.created_at}
                    </div>
                </div>
            ),
        },
        {
            header: 'Pengguna',
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.user_name}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.consultant_name}
                    </div>
                </div>
            ),
        },
        {
            header: 'Paket',
            cell: (row) => <div className="text-sm">{row.package_name}</div>,
        },
        {
            header: 'Total',
            cell: (row) => (
                <div className="font-medium">
                    {formatCurrency(row.total_amount)}
                </div>
            ),
        },
        {
            header: 'Metode',
            cell: (row) => (
                <div className="text-sm">{row.payment_method_label}</div>
            ),
        },
        {
            header: 'Status',
            cell: (row) => (
                <div className="space-y-1">
                    {getStatusBadge(row.status, row.status_label)}
                    {row.escrow_status &&
                        getEscrowBadge(
                            row.escrow_status,
                            row.escrow_status_label,
                        )}
                </div>
            ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (row) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(row)}
                    >
                        <Eye className="size-4" />
                    </Button>
                    {row.status === 'pending' &&
                        row.payment_method === 'manual_transfer' &&
                        row.transfer_proof && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerify(row, 'approve')}
                                >
                                    <CheckCircle className="size-4 text-green-600" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerify(row, 'reject')}
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
            <Head title="Pengelolaan Transaksi" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange(
                                        'status',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Menunggu
                                    </SelectItem>
                                    <SelectItem value="paid">
                                        Dibayar
                                    </SelectItem>
                                    <SelectItem value="failed">
                                        Gagal
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Kedaluwarsa
                                    </SelectItem>
                                    <SelectItem value="refunded">
                                        Dikembalikan
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.payment_method || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange(
                                        'payment_method',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Metode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Metode
                                    </SelectItem>
                                    <SelectItem value="payment_gateway">
                                        Payment Gateway
                                    </SelectItem>
                                    <SelectItem value="manual_transfer">
                                        Transfer Manual
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={
                                    filters.pending_verification
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    handleFilterChange(
                                        'pending_verification',
                                        !filters.pending_verification,
                                    )
                                }
                            >
                                <FileText className="mr-2 size-4" />
                                Perlu Verifikasi
                            </Button>
                        </div>
                        <br />
                        <DataTable
                            className="mt-4"
                            data={transactions.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari invoice atau nama pengguna..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: transactions.current_page,
                                lastPage: transactions.last_page,
                                total: transactions.total,
                                perPage: transactions.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={detailModal} onOpenChange={setDetailModal}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Detail Transaksi</DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4">
                            {/* Invoice Info */}
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">
                                    Informasi Invoice
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">
                                        Nomor Invoice:
                                    </div>
                                    <div className="font-medium">
                                        {selectedTransaction.invoice_number}
                                    </div>
                                    <div className="text-muted-foreground">
                                        Status:
                                    </div>
                                    <div>
                                        {getStatusBadge(
                                            selectedTransaction.status,
                                            selectedTransaction.status_label,
                                        )}
                                    </div>

                                    <div className="text-muted-foreground">
                                        Metode Pembayaran:
                                    </div>
                                    <div>
                                        {
                                            selectedTransaction.payment_method_label
                                        }
                                    </div>
                                    {selectedTransaction.escrow_status && (
                                        <>
                                            <div className="text-muted-foreground">
                                                Status Escrow:
                                            </div>
                                            <div>
                                                {getEscrowBadge(
                                                    selectedTransaction.escrow_status,
                                                    selectedTransaction.escrow_status_label,
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">
                                    Informasi Pengguna
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">
                                        Nama:
                                    </div>
                                    <div>{selectedTransaction.user.name}</div>
                                    <div className="text-muted-foreground">
                                        Email:
                                    </div>
                                    <div>{selectedTransaction.user.email}</div>
                                    <div className="text-muted-foreground">
                                        Konsultan:
                                    </div>
                                    <div>
                                        {selectedTransaction.consultant.name}
                                    </div>
                                    <div className="text-muted-foreground">
                                        Paket:
                                    </div>
                                    <div>
                                        {selectedTransaction.package.name}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">
                                    Informasi Pembayaran
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">
                                        Jumlah:
                                    </div>
                                    <div>
                                        {formatCurrency(
                                            selectedTransaction.amount,
                                        )}
                                    </div>
                                    <div className="text-muted-foreground">
                                        Biaya Admin:
                                    </div>
                                    <div>
                                        {formatCurrency(
                                            selectedTransaction.admin_fee,
                                        )}
                                    </div>
                                    <div className="text-muted-foreground">
                                        Total:
                                    </div>
                                    <div className="font-bold">
                                        {formatCurrency(
                                            selectedTransaction.total_amount,
                                        )}
                                    </div>
                                    {selectedTransaction.escrow_held_amount >
                                        0 && (
                                        <>
                                            <div className="text-muted-foreground">
                                                Dana Ditahan:
                                            </div>
                                            <div>
                                                {formatCurrency(
                                                    selectedTransaction.escrow_held_amount,
                                                )}
                                            </div>
                                            <div className="text-muted-foreground">
                                                Dana Dirilis:
                                            </div>
                                            <div>
                                                {formatCurrency(
                                                    selectedTransaction.escrow_released_amount,
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Manual Transfer Info */}
                            {selectedTransaction.payment_method ===
                                'manual_transfer' && (
                                <div className="rounded-lg border p-4">
                                    <h3 className="mb-2 font-semibold">
                                        Informasi Transfer
                                    </h3>
                                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                                        {selectedTransaction.bank_name && (
                                            <>
                                                <div className="text-muted-foreground">
                                                    Bank:
                                                </div>
                                                <div>
                                                    {
                                                        selectedTransaction.bank_name
                                                    }
                                                </div>
                                            </>
                                        )}
                                        {selectedTransaction.account_number && (
                                            <>
                                                <div className="text-muted-foreground">
                                                    No. Rekening:
                                                </div>
                                                <div>
                                                    {
                                                        selectedTransaction.account_number
                                                    }
                                                </div>
                                            </>
                                        )}
                                        {selectedTransaction.account_name && (
                                            <>
                                                <div className="text-muted-foreground">
                                                    Atas Nama:
                                                </div>
                                                <div>
                                                    {
                                                        selectedTransaction.account_name
                                                    }
                                                </div>
                                            </>
                                        )}
                                        {selectedTransaction.transfer_proof_uploaded_at && (
                                            <>
                                                <div className="text-muted-foreground">
                                                    Waktu Upload:
                                                </div>
                                                <div>
                                                    {
                                                        selectedTransaction.transfer_proof_uploaded_at
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {selectedTransaction.transfer_proof && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleViewImage(
                                                    selectedTransaction.transfer_proof!,
                                                )
                                            }
                                        >
                                            <ImageIcon className="mr-2 size-4" />
                                            Lihat Bukti Transfer
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Verification Info */}
                            {selectedTransaction.verified_at && (
                                <div className="rounded-lg border p-4">
                                    <h3 className="mb-2 font-semibold">
                                        Informasi Verifikasi
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-muted-foreground">
                                            Diverifikasi oleh:
                                        </div>
                                        <div>
                                            {selectedTransaction.verified_by}
                                        </div>
                                        <div className="text-muted-foreground">
                                            Waktu Verifikasi:
                                        </div>
                                        <div>
                                            {selectedTransaction.verified_at}
                                        </div>
                                        {selectedTransaction.verification_notes && (
                                            <>
                                                <div className="text-muted-foreground">
                                                    Catatan:
                                                </div>
                                                <div>
                                                    {
                                                        selectedTransaction.verification_notes
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">Waktu</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">
                                        Dibuat:
                                    </div>
                                    <div>{selectedTransaction.created_at}</div>
                                    {selectedTransaction.paid_at && (
                                        <>
                                            <div className="text-muted-foreground">
                                                Dibayar:
                                            </div>
                                            <div>
                                                {selectedTransaction.paid_at}
                                            </div>
                                        </>
                                    )}
                                    {selectedTransaction.expired_at && (
                                        <>
                                            <div className="text-muted-foreground">
                                                Kedaluwarsa:
                                            </div>
                                            <div>
                                                {selectedTransaction.expired_at}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Verify Modal */}
            <Dialog open={verifyModal} onOpenChange={setVerifyModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {verifyAction === 'approve'
                                ? 'Verifikasi Pembayaran'
                                : 'Tolak Pembayaran'}
                        </DialogTitle>
                        <DialogDescription>
                            {verifyAction === 'approve'
                                ? 'Pastikan bukti transfer sudah sesuai sebelum menyetujui.'
                                : 'Berikan alasan penolakan pembayaran ini.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <FormItem>
                            <FormLabel>
                                Catatan {verifyAction === 'reject' && '*'}
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    value={verifyNotes}
                                    onChange={(e) =>
                                        setVerifyNotes(e.target.value)
                                    }
                                    placeholder={
                                        verifyAction === 'approve'
                                            ? 'Catatan tambahan (opsional)'
                                            : 'Masukkan alasan penolakan'
                                    }
                                    rows={4}
                                    required={verifyAction === 'reject'}
                                />
                            </FormControl>
                        </FormItem>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setVerifyModal(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={
                                verifyAction === 'approve'
                                    ? 'default'
                                    : 'destructive'
                            }
                            onClick={submitVerification}
                            disabled={
                                isSubmitting ||
                                (verifyAction === 'reject' &&
                                    !verifyNotes.trim())
                            }
                        >
                            {verifyAction === 'approve' ? 'Setujui' : 'Tolak'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Viewer Modal */}
            <Dialog open={imageModal} onOpenChange={setImageModal}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Bukti Transfer</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                        <img
                            src={selectedImage}
                            alt="Bukti Transfer"
                            className="max-h-[70vh] w-auto rounded-lg"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
