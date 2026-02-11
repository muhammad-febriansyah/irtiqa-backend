import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    Package,
    CreditCard,
    AlertCircle,
    Star,
    Clock,
    Award,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface Transaction {
    id: number;
    invoice_number: string;
    total_amount: number;
    approval_status: string;
    case_urgency: string;
    case_analysis?: string;
    case_tags?: string[];
    assignment_notes?: string;
    paid_at: string;
    user: {
        name: string;
        email: string;
        profile?: {
            phone: string;
            birth_date: string;
            gender: string;
            city: string;
            province: string;
        };
    };
    package: {
        name: string;
        sessions_count: number;
        description: string;
    };
    ticket?: {
        form_submission?: {
            responses: any;
        };
    };
    assigned_consultant?: {
        id: number;
        user: {
            name: string;
        };
    };
}

interface Consultant {
    id: number;
    name: string;
    email: string;
    specialist_category: string[];
    level: string;
    rating_average: number;
    total_cases: number;
    city: string;
    province: string;
}

interface Props {
    transaction: Transaction;
    consultants: Consultant[];
}

const CASE_TAGS = [
    { value: 'trauma', label: 'Trauma' },
    { value: 'waswas', label: 'Waswas' },
    { value: 'mimpi', label: 'Mimpi Mengganggu' },
    { value: 'keluarga', label: 'Masalah Keluarga' },
    { value: 'ibadah', label: 'Kesulitan Ibadah' },
    { value: 'kegelisahan', label: 'Kegelisahan' },
    { value: 'kecemasan', label: 'Kecemasan' },
    { value: 'pernikahan', label: 'Pernikahan' },
];

export default function ApprovalShow({ transaction, consultants }: Props) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [consultantSearch, setConsultantSearch] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Filter consultants based on search
    const filteredConsultants = consultants.filter((consultant) => {
        const searchLower = consultantSearch.toLowerCase();
        return (
            consultant.name.toLowerCase().includes(searchLower) ||
            consultant.email.toLowerCase().includes(searchLower) ||
            consultant.level.toLowerCase().includes(searchLower) ||
            consultant.city.toLowerCase().includes(searchLower) ||
            consultant.province.toLowerCase().includes(searchLower) ||
            consultant.specialist_category.some(cat => cat.toLowerCase().includes(searchLower))
        );
    });

    const assignForm = useForm({
        consultant_id: transaction.assigned_consultant?.id?.toString() || '',
        assignment_notes: transaction.assignment_notes || '',
        case_analysis: transaction.case_analysis || '',
        case_tags: transaction.case_tags || [],
        case_urgency: transaction.case_urgency || 'normal',
    });

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleMarkUnderReview = () => {
        router.post(
            `/admin/transactions/approval/${transaction.id}/mark-under-review`,
            {},
            {
                preserveState: true,
                onSuccess: () => {
                    alert('Transaksi ditandai sedang ditinjau');
                },
            }
        );
    };

    const handleAssignConsultant = (e: React.FormEvent) => {
        e.preventDefault();
        assignForm.post(
            `/admin/transactions/approval/${transaction.id}/assign-consultant`,
            {
                preserveState: true,
                onSuccess: () => {
                    alert('Konsultan berhasil di-assign');
                },
            }
        );
    };

    const handleApprove = () => {
        router.post(
            `/admin/transactions/approval/${transaction.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    router.visit('/admin/transactions/approval');
                },
            }
        );
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(
            `/admin/transactions/approval/${transaction.id}/reject`,
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    router.visit('/admin/transactions/approval');
                },
            }
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu' },
            under_review: { color: 'bg-blue-100 text-blue-800', label: 'Ditinjau' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Disetujui' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Ditolak' },
        };
        const variant = variants[status as keyof typeof variants];
        return <Badge className={variant.color}>{variant.label}</Badge>;
    };

    const canEdit = transaction.approval_status === 'pending' || transaction.approval_status === 'under_review';
    const canApprove = transaction.approval_status === 'under_review' && assignForm.data.consultant_id;

    return (
        <AppLayout>
            <Head title={`Review Transaksi ${transaction.invoice_number}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit('/admin/transactions/approval')}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Review Transaksi
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {transaction.invoice_number}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(transaction.approval_status)}
                        {transaction.approval_status === 'pending' && (
                            <Button onClick={handleMarkUnderReview} variant="outline">
                                <Clock className="w-4 h-4 mr-2" />
                                Tandai Sedang Ditinjau
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Client & Package Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Client Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Nama</Label>
                                    <p className="font-medium">{transaction.user.name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Email</Label>
                                    <p className="text-sm">{transaction.user.email}</p>
                                </div>
                                {transaction.user.profile && (
                                    <>
                                        <div>
                                            <Label className="text-xs text-gray-500">Telepon</Label>
                                            <p className="text-sm">{transaction.user.profile.phone}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Usia</Label>
                                            <p className="text-sm">
                                                {calculateAge(transaction.user.profile.birth_date)} tahun
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Jenis Kelamin</Label>
                                            <p className="text-sm capitalize">
                                                {transaction.user.profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Lokasi</Label>
                                            <p className="text-sm">
                                                {transaction.user.profile.city}, {transaction.user.profile.province}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Package Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Paket yang Dibeli
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Nama Paket</Label>
                                    <p className="font-medium">{transaction.package.name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Jumlah Sesi</Label>
                                    <p className="text-sm">{transaction.package.sessions_count} sesi</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Total Pembayaran</Label>
                                    <p className="text-lg font-bold text-primary">
                                        {formatCurrency(transaction.total_amount)}
                                    </p>
                                </div>
                                {transaction.package.description && (
                                    <div>
                                        <Label className="text-xs text-gray-500">Deskripsi</Label>
                                        <p className="text-sm text-gray-600">
                                            {transaction.package.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Assignment Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analisa Kasus & Assignment Konsultan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAssignConsultant} className="space-y-6">
                                    {/* Case Analysis */}
                                    <div>
                                        <Label htmlFor="case_analysis">
                                            Analisa Kasus <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="case_analysis"
                                            value={assignForm.data.case_analysis}
                                            onChange={(e) => assignForm.setData('case_analysis', e.target.value)}
                                            placeholder="Tulis analisa mendalam tentang kasus client..."
                                            rows={4}
                                            disabled={!canEdit}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Jelaskan kondisi client, gejala yang terlihat, dan assessment awal
                                        </p>
                                    </div>

                                    {/* Case Tags */}
                                    <div>
                                        <Label>Kategori Kasus</Label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            {CASE_TAGS.map((tag) => (
                                                <div key={tag.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={tag.value}
                                                        checked={assignForm.data.case_tags.includes(tag.value)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                assignForm.setData('case_tags', [
                                                                    ...assignForm.data.case_tags,
                                                                    tag.value,
                                                                ]);
                                                            } else {
                                                                assignForm.setData(
                                                                    'case_tags',
                                                                    assignForm.data.case_tags.filter(
                                                                        (t) => t !== tag.value
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        disabled={!canEdit}
                                                    />
                                                    <Label
                                                        htmlFor={tag.value}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {tag.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Urgency */}
                                    <div>
                                        <Label htmlFor="case_urgency">
                                            Tingkat Urgensi <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={assignForm.data.case_urgency}
                                            onValueChange={(value) =>
                                                assignForm.setData('case_urgency', value)
                                            }
                                            disabled={!canEdit}
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">
                                                    Normal - Dapat ditangani dengan jadwal reguler
                                                </SelectItem>
                                                <SelectItem value="urgent">
                                                    Mendesak - Perlu perhatian segera
                                                </SelectItem>
                                                <SelectItem value="emergency">
                                                    Darurat - Butuh penanganan immediate
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Consultant Selection */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="consultant_id">
                                                Pilih Konsultan <span className="text-red-500">*</span>
                                            </Label>
                                            <span className="text-xs text-gray-500">
                                                {filteredConsultants.length} konsultan tersedia
                                            </span>
                                        </div>

                                        {/* Search Input */}
                                        <Input
                                            type="text"
                                            placeholder="Cari konsultan (nama, email, spesialisasi, lokasi)..."
                                            value={consultantSearch}
                                            onChange={(e) => setConsultantSearch(e.target.value)}
                                            className="mb-2"
                                            disabled={!canEdit}
                                        />

                                        <Select
                                            value={assignForm.data.consultant_id}
                                            onValueChange={(value) =>
                                                assignForm.setData('consultant_id', value)
                                            }
                                            disabled={!canEdit}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih konsultan yang sesuai..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {filteredConsultants.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-gray-500">
                                                        Tidak ada konsultan yang sesuai dengan pencarian
                                                    </div>
                                                ) : (
                                                    filteredConsultants.map((consultant) => (
                                                    <SelectItem
                                                        key={consultant.id}
                                                        value={consultant.id.toString()}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <div>
                                                                <div className="font-medium">{consultant.name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {consultant.specialist_category?.length > 0
                                                                        ? consultant.specialist_category.join(', ') + ' • '
                                                                        : ''}
                                                                    Level: {consultant.level}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs">
                                                                <span className="flex items-center gap-1">
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    {Number(consultant.rating_average || 0).toFixed(1)}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Award className="w-3 h-3 text-gray-400" />
                                                                    {consultant.total_cases || 0} kasus
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>

                                        {/* Show selected consultant info */}
                                        {assignForm.data.consultant_id && (
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                {(() => {
                                                    const selected = consultants.find(
                                                        c => c.id.toString() === assignForm.data.consultant_id
                                                    );
                                                    return selected ? (
                                                        <div className="text-sm">
                                                            <p className="font-medium text-blue-900">{selected.name}</p>
                                                            <p className="text-xs text-blue-700 mt-1">
                                                                {selected.email} • {selected.city}, {selected.province}
                                                            </p>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Assignment Notes */}
                                    <div>
                                        <Label htmlFor="assignment_notes">
                                            Alasan Assignment <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="assignment_notes"
                                            value={assignForm.data.assignment_notes}
                                            onChange={(e) =>
                                                assignForm.setData('assignment_notes', e.target.value)
                                            }
                                            placeholder="Jelaskan kenapa konsultan ini yang paling sesuai untuk kasus ini..."
                                            rows={3}
                                            disabled={!canEdit}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Contoh: "Konsultan ini memiliki expertise dalam trauma healing dan
                                            pengalaman 10 tahun menangani kasus serupa"
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    {canEdit && (
                                        <div className="flex items-center gap-3 pt-4 border-t">
                                            <Button
                                                type="submit"
                                                disabled={assignForm.processing}
                                            >
                                                {assignForm.processing ? 'Menyimpan...' : 'Simpan Assignment'}
                                            </Button>

                                            {canApprove && (
                                                <Button
                                                    type="button"
                                                    onClick={() => setShowApproveModal(true)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Approve & Buat Program
                                                </Button>
                                            )}

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => setShowRejectModal(true)}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject Transaksi
                                            </Button>
                                        </div>
                                    )}

                                    {transaction.approval_status === 'approved' && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-green-900">
                                                        Transaksi Telah Disetujui
                                                    </p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Program telah dibuat dan konsultan telah di-notify
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {transaction.approval_status === 'rejected' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-red-900">
                                                        Transaksi Telah Ditolak
                                                    </p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Refund sedang diproses
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Approve Confirmation Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Transaksi?</DialogTitle>
                        <DialogDescription>
                            Setelah approve, program akan otomatis dibuat dan client dapat mulai konsultasi
                            dengan konsultan yang telah di-assign.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                                <strong>Client:</strong> {transaction.user.name}
                            </p>
                            <p className="text-sm text-blue-900 mt-1">
                                <strong>Konsultan:</strong>{' '}
                                {consultants.find((c) => c.id.toString() === assignForm.data.consultant_id)
                                    ?.name}
                            </p>
                            <p className="text-sm text-blue-900 mt-1">
                                <strong>Paket:</strong> {transaction.package.name} (
                                {transaction.package.sessions_count} sesi)
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Ya, Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <form onSubmit={handleReject}>
                        <DialogHeader>
                            <DialogTitle>Reject Transaksi</DialogTitle>
                            <DialogDescription>
                                Transaksi akan di-reject dan refund akan diproses otomatis. Berikan alasan
                                rejection yang jelas dan empatik.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="rejection_reason">Alasan Rejection</Label>
                            <Textarea
                                id="rejection_reason"
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) =>
                                    rejectForm.setData('rejection_reason', e.target.value)
                                }
                                placeholder="Contoh: Kasus memerlukan penanganan psikiater profesional karena menunjukkan tanda-tanda gangguan mental yang lebih serius..."
                                rows={4}
                                className="mt-2"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={rejectForm.processing}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                {rejectForm.processing ? 'Memproses...' : 'Reject Transaksi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
