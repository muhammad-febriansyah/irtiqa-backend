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

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

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

    const getRiskLevelBadge = (level: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            low: 'secondary',
            medium: 'default',
            high: 'destructive',
        };
        return <Badge variant={variants[level] || 'outline'}>{level.toUpperCase()}</Badge>;
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            paid: 'default',
            pending: 'secondary',
            failed: 'destructive',
            expired: 'outline',
            completed: 'default',
            waiting: 'secondary',
            in_progress: 'default',
        };
        return <Badge variant={variants[status] || 'outline'}>{label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Analytics" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dasbor Analytics</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ringkasan statistik dan aktivitas terkini
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Konsultan Aktif</CardTitle>
                            <UserCheck className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_consultants.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_transactions.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
                            <Calendar className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenue_this_month)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tiket Menunggu</CardTitle>
                            <Ticket className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_tickets.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Program Aktif</CardTitle>
                            <BookOpen className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_programs.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Verifikasi Pending</CardTitle>
                            <AlertCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_verifications.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Crisis Alerts & Applications Section */}
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-4">Crisis Management & Aplikasi</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Crisis Alerts */}
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

                        {/* Consultant Applications */}
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

                {/* Charts and Stats Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Revenue Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5" />
                                Pendapatan 6 Bulan Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {revenueChart.map((item, index) => {
                                    const maxRevenue = Math.max(...revenueChart.map(r => r.revenue));
                                    const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{item.month}</span>
                                                <span className="text-muted-foreground">{formatCurrency(item.revenue)}</span>
                                            </div>
                                            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Column */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="size-5" />
                                Ringkasan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Average Rating */}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                    Rating Rata-rata
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-2xl font-bold">
                                        {stats.average_rating.toFixed(1)}
                                    </span>
                                    <span className="text-muted-foreground">/ 5.0</span>
                                </div>
                            </div>

                            {/* Transactions by Status */}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-3">
                                    Transaksi berdasarkan Status
                                </div>
                                <div className="space-y-2">
                                    {transactionsByStatus.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm">{item.label}</span>
                                            <Badge variant="outline">{item.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Categories */}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-3">
                                    Top 5 Kategori Tiket
                                </div>
                                <div className="space-y-2">
                                    {ticketsByCategory.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm truncate">{item.category}</span>
                                            <Badge variant="secondary">{item.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Latest Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {latestTransactions.length > 0 ? (
                                    latestTransactions.map((transaction) => (
                                        <div key={transaction.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {transaction.invoice_number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {transaction.user_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {transaction.package_name}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(transaction.amount)}
                                                    </p>
                                                    {getStatusBadge(transaction.status, transaction.status_label)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{transaction.created_at}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Belum ada transaksi
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Tickets */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tiket Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {latestTickets.length > 0 ? (
                                    latestTickets.map((ticket) => (
                                        <div key={ticket.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {ticket.ticket_number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {ticket.user_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {ticket.category}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0 space-y-1">
                                                    {getStatusBadge(ticket.status, ticket.status_label)}
                                                    {getRiskLevelBadge(ticket.risk_level)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{ticket.created_at}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Belum ada tiket
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Ratings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Rating Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {latestRatings.length > 0 ? (
                                    latestRatings.map((rating) => (
                                        <div key={rating.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {rating.user_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {rating.consultant_name}
                                                    </p>
                                                    {rating.review && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                            {rating.review}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="shrink-0">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-medium">{rating.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{rating.created_at}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Belum ada rating
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
