import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import consultant from '@/routes/consultant';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Banknote,
    Calendar,
    Clock,
    DollarSign,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface EarningsSummary {
    total_balance: number;
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
    this_month_earnings: number;
}

interface Transaction {
    id: number;
    ticket_number: string;
    user_name: string;
    package_name: string;
    amount: number;
    type: 'credit' | 'debit';
    status: string;
    created_at: string;
}

interface Withdrawal {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: string;
    requested_at: string;
    processed_at: string | null;
    notes: string | null;
}

interface Props {
    summary: EarningsSummary;
    transactions: Transaction[];
    withdrawals: Withdrawal[];
}

export default function ConsultantEarnings({ summary, transactions, withdrawals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: consultant.dashboard.url() },
        { title: 'Pendapatan', href: consultant.earnings.index.url() },
    ];

    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        bank_name: '',
        account_number: '',
        account_name: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();

        post(consultant.earnings.withdrawal.request.url(), {
            onSuccess: () => {
                setIsWithdrawDialogOpen(false);
                reset();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { class: string; label: string }> = {
            pending: { class: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Menunggu' },
            approved: { class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Disetujui' },
            rejected: { class: 'bg-rose-500/10 text-rose-600 border-rose-500/20', label: 'Ditolak' },
            completed: { class: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Selesai' },
        };
        const badge = variants[status] || variants.pending;
        return (
            <Badge variant="outline" className={cn('font-bold text-[10px] uppercase', badge.class)}>
                {badge.label}
            </Badge>
        );
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendapatan & Penarikan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
                            Pendapatan & Penarikan
                        </h1>
                        <p className="text-base text-muted-foreground mt-2">
                            Kelola pendapatan dan ajukan penarikan dana
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsWithdrawDialogOpen(true)}
                        disabled={summary.available_balance < 50000}
                        className="gap-2"
                    >
                        <ArrowDownCircle className="size-4" />
                        Ajukan Penarikan
                    </Button>
                </div>

                {/* Summary Cards */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {[
                        {
                            title: 'Total Saldo',
                            value: formatCurrency(summary.total_balance),
                            icon: Wallet,
                            color: 'from-primary to-emerald-400',
                            label: 'Semua Waktu',
                        },
                        {
                            title: 'Saldo Tersedia',
                            value: formatCurrency(summary.available_balance),
                            icon: DollarSign,
                            color: 'from-emerald-500 to-teal-400',
                            label: 'Dapat Ditarik',
                        },
                        {
                            title: 'Saldo Pending',
                            value: formatCurrency(summary.pending_balance),
                            icon: Clock,
                            color: 'from-amber-500 to-orange-400',
                            label: 'Dalam Proses',
                        },
                        {
                            title: 'Total Ditarik',
                            value: formatCurrency(summary.total_withdrawn),
                            icon: Banknote,
                            color: 'from-blue-500 to-sky-400',
                            label: 'Riwayat Penarikan',
                        },
                    ].map((stat, idx) => (
                        <motion.div key={idx} variants={item}>
                            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white relative">
                                <div
                                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform`}
                                />
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                {stat.title}
                                            </p>
                                            <div className="text-2xl font-black tracking-tight">
                                                {stat.value}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                {stat.label}
                                            </p>
                                        </div>
                                        <div
                                            className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                                        >
                                            <stat.icon className="size-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
                        <TabsTrigger value="withdrawals">Riwayat Penarikan</TabsTrigger>
                    </TabsList>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions" className="mt-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <TrendingUp className="size-5" />
                                    </div>
                                    Riwayat Transaksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="bg-white p-0">
                                <div className="divide-y divide-neutral-50">
                                    {transactions.length > 0 ? (
                                        transactions.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="p-4 hover:bg-neutral-50/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div
                                                            className={cn(
                                                                'p-2 rounded-xl',
                                                                transaction.type === 'credit'
                                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                                    : 'bg-rose-500/10 text-rose-600'
                                                            )}
                                                        >
                                                            {transaction.type === 'credit' ? (
                                                                <ArrowUpCircle className="size-4" />
                                                            ) : (
                                                                <ArrowDownCircle className="size-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-neutral-900 truncate">
                                                                {transaction.package_name}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                <span className="font-medium">
                                                                    {transaction.ticket_number}
                                                                </span>
                                                                <span>•</span>
                                                                <span>{transaction.user_name}</span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {transaction.created_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p
                                                            className={cn(
                                                                'text-base font-black',
                                                                transaction.type === 'credit'
                                                                    ? 'text-emerald-600'
                                                                    : 'text-rose-600'
                                                            )}
                                                        >
                                                            {transaction.type === 'credit' ? '+' : '-'}
                                                            {formatCurrency(transaction.amount)}
                                                        </p>
                                                        {getStatusBadge(transaction.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <TrendingUp className="size-12 text-neutral-200 mb-4" />
                                            <p className="text-lg font-bold text-neutral-400">
                                                Belum ada transaksi
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Withdrawals Tab */}
                    <TabsContent value="withdrawals" className="mt-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                                        <Banknote className="size-5" />
                                    </div>
                                    Riwayat Penarikan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="bg-white p-0">
                                <div className="divide-y divide-neutral-50">
                                    {withdrawals.length > 0 ? (
                                        withdrawals.map((withdrawal) => (
                                            <div
                                                key={withdrawal.id}
                                                className="p-4 hover:bg-neutral-50/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-base font-black text-neutral-900">
                                                                {formatCurrency(withdrawal.amount)}
                                                            </p>
                                                            {getStatusBadge(withdrawal.status)}
                                                        </div>
                                                        <div className="space-y-1 text-xs text-muted-foreground">
                                                            <p className="font-bold">
                                                                {withdrawal.bank_name} - {withdrawal.account_number}
                                                            </p>
                                                            <p>{withdrawal.account_name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="size-3" />
                                                                Diajukan: {withdrawal.requested_at}
                                                            </span>
                                                            {withdrawal.processed_at && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="size-3" />
                                                                    Diproses: {withdrawal.processed_at}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {withdrawal.notes && (
                                                            <div className="mt-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                                                                <p className="text-xs text-neutral-600">
                                                                    <span className="font-bold">Catatan:</span>{' '}
                                                                    {withdrawal.notes}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <Banknote className="size-12 text-neutral-200 mb-4" />
                                            <p className="text-lg font-bold text-neutral-400">
                                                Belum ada riwayat penarikan
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Withdrawal Dialog */}
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajukan Penarikan Dana</DialogTitle>
                        <DialogDescription>
                            Saldo tersedia: {formatCurrency(summary.available_balance)}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWithdrawal}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Jumlah Penarikan *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Minimal Rp 50.000"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                />
                                {errors.amount && (
                                    <p className="text-sm text-rose-600">{errors.amount}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bank_name">Nama Bank *</Label>
                                <Input
                                    id="bank_name"
                                    placeholder="Contoh: BCA, Mandiri, BRI"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                />
                                {errors.bank_name && (
                                    <p className="text-sm text-rose-600">{errors.bank_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account_number">Nomor Rekening *</Label>
                                <Input
                                    id="account_number"
                                    placeholder="1234567890"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                />
                                {errors.account_number && (
                                    <p className="text-sm text-rose-600">{errors.account_number}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account_name">Nama Pemilik Rekening *</Label>
                                <Input
                                    id="account_name"
                                    placeholder="Nama sesuai rekening"
                                    value={data.account_name}
                                    onChange={(e) => setData('account_name', e.target.value)}
                                />
                                {errors.account_name && (
                                    <p className="text-sm text-rose-600">{errors.account_name}</p>
                                )}
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-800">
                                    <span className="font-bold">Catatan:</span> Penarikan minimal Rp 50.000.
                                    Proses verifikasi membutuhkan waktu 1-3 hari kerja.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsWithdrawDialogOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Mengajukan...' : 'Ajukan Penarikan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
