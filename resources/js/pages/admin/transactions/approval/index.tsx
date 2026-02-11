import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Clock,
    Eye,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    AlertCircle,
    AlertTriangle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface Transaction {
    id: number;
    invoice_number: string;
    amount: number;
    total_amount: number;
    status: string;
    approval_status: 'pending' | 'under_review' | 'approved' | 'rejected';
    case_urgency: 'normal' | 'urgent' | 'emergency';
    paid_at: string;
    user: {
        name: string;
        email: string;
        profile?: {
            city: string;
            province: string;
        };
    };
    package: {
        name: string;
        sessions_count: number;
    };
    approved_by?: {
        name: string;
    };
}

interface Stats {
    pending: number;
    under_review: number;
    approved_today: number;
    rejected_today: number;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
    filters: {
        approval_status?: string;
        urgency?: string;
        search?: string;
    };
}

export default function ApprovalIndex({ transactions, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/transactions/approval',
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/transactions/approval',
            { ...filters, search },
            { preserveState: true }
        );
    };

    const getApprovalStatusBadge = (status: string) => {
        const variants = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu' },
            under_review: { color: 'bg-blue-100 text-blue-800', label: 'Ditinjau' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Disetujui' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Ditolak' },
        };
        const variant = variants[status as keyof typeof variants];
        return (
            <Badge className={variant.color}>
                {variant.label}
            </Badge>
        );
    };

    const getUrgencyBadge = (urgency: string) => {
        const variants = {
            emergency: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Darurat', icon: AlertCircle },
            urgent: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Mendesak', icon: AlertTriangle },
            normal: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Normal', icon: Clock },
        };
        const variant = variants[urgency as keyof typeof variants];
        const Icon = variant.icon;
        return (
            <Badge variant="outline" className={variant.color}>
                <Icon className="w-3 h-3 mr-1" />
                {variant.label}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Approval Transaksi" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Approval Transaksi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review dan assign konsultan untuk transaksi yang masuk
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Menunggu Review
                            </CardTitle>
                            <Clock className="w-4 h-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.pending}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Transaksi pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Sedang Ditinjau
                            </CardTitle>
                            <Eye className="w-4 h-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.under_review}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Dalam proses review
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Approved Hari Ini
                            </CardTitle>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.approved_today}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Transaksi disetujui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Rejected Hari Ini
                            </CardTitle>
                            <XCircle className="w-4 h-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.rejected_today}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Transaksi ditolak
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Cari invoice, nama client..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </form>

                            {/* Status Filter */}
                            <Select
                                value={filters.approval_status || 'all'}
                                onValueChange={(value) =>
                                    handleFilter('approval_status', value === 'all' ? '' : value)
                                }
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="under_review">Ditinjau</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Urgency Filter */}
                            <Select
                                value={filters.urgency || 'all'}
                                onValueChange={(value) =>
                                    handleFilter('urgency', value === 'all' ? '' : value)
                                }
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Urgensi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Urgensi</SelectItem>
                                    <SelectItem value="emergency">Darurat</SelectItem>
                                    <SelectItem value="urgent">Mendesak</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paket
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Urgensi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-sm font-medium">Tidak ada transaksi</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Transaksi yang menunggu approval akan muncul di sini
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.data.map((transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.invoice_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {transaction.user.profile?.city},{' '}
                                                        {transaction.user.profile?.province}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {transaction.package.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {transaction.package.sessions_count} sesi
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(transaction.total_amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getApprovalStatusBadge(transaction.approval_status)}
                                                    {transaction.approved_by && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            oleh: {transaction.approved_by.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getUrgencyBadge(transaction.case_urgency)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(transaction.paid_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={`/admin/transactions/approval/${transaction.id}`}
                                                    >
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            {transaction.approval_status === 'pending'
                                                                ? 'Review'
                                                                : 'Detail'}
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Halaman {transactions.current_page} dari {transactions.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {transactions.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm rounded ${link.active
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
