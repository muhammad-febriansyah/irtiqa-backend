import { Head } from '@inertiajs/react';
import {
    Users,
    UserCheck,
    CreditCard,
    DollarSign,
    Calendar,
    Ticket,
    BookOpen,
    AlertCircle,
    Star,
    TrendingUp,
    Activity,
    AlertTriangle,
    UserPlus,
    CheckCircle
} from 'lucide-react';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

interface DashboardStats {
    total_users: number;
    total_consultants: number;
    total_transactions: number;
    total_revenue: number;
    revenue_this_month: number;
    pending_tickets: number;
    active_programs: number;
    pending_verifications: number;
    average_rating: number;
    pending_crisis_alerts: number;
    critical_alerts: number;
    resolved_alerts_this_month: number;
    pending_applications: number;
    approved_applications_this_month: number;
    rejected_applications_this_month: number;
}

interface RevenueChartItem {
    month: string;
    revenue: number;
}

interface TransactionStatusItem {
    status: string;
    count: number;
    label: string;
}

interface TicketCategoryItem {
    category: string;
    count: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    user_name: string;
    consultant_name: string;
    package_name: string;
    amount: number;
    status: string;
    status_label: string;
    created_at: string;
}

interface Ticket {
    id: number;
    ticket_number: string;
    user_name: string;
    category: string;
    status: string;
    status_label: string;
    risk_level: string;
    created_at: string;
}

interface Rating {
    id: number;
    user_name: string;
    consultant_name: string;
    rating: number;
    review: string | null;
    created_at: string;
}

interface Props {
    stats: DashboardStats;
    revenueChart: RevenueChartItem[];
    transactionsByStatus: TransactionStatusItem[];
    ticketsByCategory: TicketCategoryItem[];
    latestTransactions: Transaction[];
    latestTickets: Ticket[];
    latestRatings: Rating[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
];

export default function Dashboard({
    stats,
    revenueChart,
    transactionsByStatus,
    ticketsByCategory,
    latestTransactions,
    latestTickets,
    latestRatings,
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // ApexCharts configuration for revenue trend
    const revenueChartOptions = useMemo(() => ({
        chart: {
            type: 'area' as const,
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        },
        colors: ['#2D5A27', '#3a7030'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth' as const,
            width: 3,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.6,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 4,
        },
        xaxis: {
            categories: revenueChart.map(item => item.month),
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                },
                formatter: (value: number) => {
                    return new Intl.NumberFormat('id-ID', {
                        notation: 'compact',
                        compactDisplay: 'short',
                    }).format(value);
                }
            }
        },
        tooltip: {
            theme: 'light',
            y: {
                formatter: (value: number) => formatCurrency(value)
            }
        },
        legend: { show: false },
    }), [revenueChart]);

    const revenueChartSeries = useMemo(() => [{
        name: 'Pendapatan',
        data: revenueChart.map(item => item.revenue)
    }], [revenueChart]);

    const getRiskLevelBadge = (level: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            low: 'secondary',
            medium: 'default',
            high: 'destructive',
        };
        return <Badge variant={variants[level] || 'outline'}>{level.toUpperCase()}</Badge>;
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, string> = {
            paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            failed: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
            expired: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
            completed: 'bg-primary/10 text-primary border-primary/20',
            waiting: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
            in_progress: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        };
        return (
            <Badge
                variant="outline"
                className={cn('font-bold uppercase tracking-wider text-[10px]', variants[status] || 'bg-slate-500/10 text-slate-600')}
            >
                {label}
            </Badge>
        );
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Analytics" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">Dasbor Analytics</h1>
                        <p className="text-base text-muted-foreground mt-2">
                            Selamat datang kembali! Berikut adalah ringkasan performa IRTIQA.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-xl border border-neutral-200 shadow-sm flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            <span className="text-sm font-bold text-neutral-600">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {[
                        { title: 'Total Pengguna', value: stats.total_users.toLocaleString('id-ID'), icon: Users, color: 'from-blue-500 to-sky-400', label: 'User Terdaftar' },
                        { title: 'Konsultan Aktif', value: stats.total_consultants.toLocaleString('id-ID'), icon: UserCheck, color: 'from-emerald-500 to-teal-400', label: 'Mitra Terverifikasi' },
                        { title: 'Total Pendapatan', value: formatCurrency(stats.total_revenue), icon: DollarSign, color: 'from-primary to-emerald-400', label: 'Semua Transaksi' },
                        { title: 'Pendapatan Bulan Ini', value: formatCurrency(stats.revenue_this_month), icon: TrendingUp, color: 'from-violet-500 to-purple-400', label: 'Performa Bulanan' },
                        { title: 'Tiket Menunggu', value: stats.pending_tickets.toLocaleString('id-ID'), icon: Ticket, color: 'from-orange-500 to-amber-400', label: 'Sesi Mendatang' },
                        { title: 'Program Aktif', value: stats.active_programs.toLocaleString('id-ID'), icon: BookOpen, color: 'from-pink-500 to-rose-400', label: 'Layanan Berjalan' },
                        { title: 'Crisis Alerts', value: stats.pending_crisis_alerts.toLocaleString('id-ID'), icon: AlertTriangle, color: 'from-red-600 to-rose-500', label: 'Butuh Perhatian' },
                        { title: 'Rating Rata-rata', value: stats.average_rating.toFixed(1), icon: Star, color: 'from-amber-400 to-yellow-300', label: 'Kepuasan User' },
                    ].map((stat, idx) => (
                        <motion.div key={idx} variants={item}>
                            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white relative">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform`} />
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                            <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                                            <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                                        </div>
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                                            <stat.icon className="size-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* HIDDEN: Crisis Alerts & Applications Section */}
                {/* Uncomment below to show Crisis Management section
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-4">Crisis Management & Aplikasi</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-red-200 dark:border-red-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Crisis Alerts Pending</CardTitle>
                                <AlertTriangle className="size-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.pending_crisis_alerts.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Memerlukan perhatian segera</p>
                            </CardContent>
                        </Card>
                        <Card className="border-orange-200 dark:border-orange-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                                <AlertTriangle className="size-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{stats.critical_alerts.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Severity tinggi/kritis</p>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 dark:border-green-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved Bulan Ini</CardTitle>
                                <CheckCircle className="size-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.resolved_alerts_this_month.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Crisis alerts diselesaikan</p>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-200 dark:border-blue-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Aplikasi Pending</CardTitle>
                                <UserPlus className="size-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.pending_applications.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Menunggu review</p>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 dark:border-green-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Approved Bulan Ini</CardTitle>
                                <CheckCircle className="size-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.approved_applications_this_month.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Konsultan baru</p>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rejected Bulan Ini</CardTitle>
                                <AlertCircle className="size-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-600">{stats.rejected_applications_this_month.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Aplikasi ditolak</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                */}

                {/* Charts and Stats Row */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                    {/* Revenue Chart - ApexCharts */}
                    <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-white shadow-lg">
                                        <TrendingUp className="size-5" />
                                    </div>
                                    Performa Pendapatan
                                </CardTitle>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-gradient-to-r from-primary/10 to-emerald-400/10 px-3 py-1.5 rounded-full border border-primary/20">
                                    6 Bulan Terakhir
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="bg-white pt-2 pb-6">
                            <Chart
                                options={revenueChartOptions}
                                series={revenueChartSeries}
                                type="area"
                                height={320}
                            />
                        </CardContent>
                    </Card>

                    {/* Stats Column */}
                    <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <Activity className="size-5" />
                                </div>
                                Analytics Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 bg-white pt-2">
                            {/* Transactions by Status */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status Transaksi</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {transactionsByStatus.map((item, index) => (
                                        <div key={index} className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-primary/20 transition-all group">
                                            <div className="text-xl font-bold text-neutral-900 group-hover:text-primary transition-colors">{item.count}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Categories */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Top Kategori Tiket</p>
                                <div className="space-y-3">
                                    {ticketsByCategory.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <div className="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                <span className="text-sm font-semibold text-neutral-600 group-hover:text-neutral-900 transition-colors truncate max-w-[150px]">{item.category}</span>
                                            </div>
                                            <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Latest Transactions */}
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between bg-white">
                            <CardTitle className="text-base font-bold">Transaksi Terbaru</CardTitle>
                            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CreditCard size={16} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            <div className="divide-y divide-neutral-50 px-6 pb-6">
                                {latestTransactions.length > 0 ? (
                                    latestTransactions.map((transaction) => (
                                        <div key={transaction.id} className="py-4 group hover:bg-neutral-50/50 -mx-2 px-2 transition-colors rounded-xl">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-xs font-black text-neutral-900 truncate">
                                                            {transaction.invoice_number}
                                                        </p>
                                                        {getStatusBadge(transaction.status, transaction.status_label)}
                                                    </div>
                                                    <p className="text-sm font-bold text-neutral-600 truncate mb-1">
                                                        {transaction.user_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                                                        <div className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 uppercase">{transaction.package_name}</div>
                                                        <span>•</span>
                                                        <span>{transaction.created_at}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-primary">
                                                        {formatCurrency(transaction.amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <CreditCard className="size-6 text-neutral-200 mb-2" />
                                        <p className="text-sm text-neutral-400 font-medium">Belum ada transaksi</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Tickets */}
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between bg-white">
                            <CardTitle className="text-base font-bold">Tiket Terbaru</CardTitle>
                            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Ticket size={16} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            <div className="divide-y divide-neutral-50 px-6 pb-6">
                                {latestTickets.length > 0 ? (
                                    latestTickets.map((ticket) => (
                                        <div key={ticket.id} className="py-4 group hover:bg-neutral-50/50 -mx-2 px-2 transition-colors rounded-xl">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-xs font-black text-neutral-900 truncate">
                                                            {ticket.ticket_number}
                                                        </p>
                                                        {getRiskLevelBadge(ticket.risk_level)}
                                                    </div>
                                                    <p className="text-sm font-bold text-neutral-600 truncate mb-1">
                                                        {ticket.user_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                                                        <div className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 uppercase">{ticket.category}</div>
                                                        <span>•</span>
                                                        <span>{ticket.created_at}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {getStatusBadge(ticket.status, ticket.status_label)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Ticket className="size-6 text-neutral-200 mb-2" />
                                        <p className="text-sm text-neutral-400 font-medium">Belum ada tiket</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Ratings */}
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between bg-white">
                            <CardTitle className="text-base font-bold">Rating Terbaru</CardTitle>
                            <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Star size={16} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            <div className="divide-y divide-neutral-50 px-6 pb-6">
                                {latestRatings.length > 0 ? (
                                    latestRatings.map((rating) => (
                                        <div key={rating.id} className="py-4 group hover:bg-neutral-50/50 -mx-2 px-2 transition-colors rounded-xl">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`size-2.5 ${i < rating.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-black text-neutral-400 ml-1">{rating.created_at}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-neutral-900 truncate mb-0.5">
                                                        {rating.user_name}
                                                    </p>
                                                    <p className="text-xs font-semibold text-primary/80 truncate mb-2 uppercase tracking-tight">
                                                        Mitra: {rating.consultant_name}
                                                    </p>
                                                    {rating.review && (
                                                        <p className="text-xs text-neutral-500 italic line-clamp-2 bg-neutral-50/80 p-2 rounded-lg border border-neutral-100">
                                                            "{rating.review}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Star className="size-6 text-neutral-200 mb-2" />
                                        <p className="text-sm text-neutral-400 font-medium">Belum ada rating</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
