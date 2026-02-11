import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import consultant from '@/routes/consultant';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Calendar,
    DollarSign,
    Star,
    Ticket,
    TrendingUp,
    Users,
} from 'lucide-react';

interface DashboardStats {
    total_revenue: number;
    revenue_this_month: number;
    total_appointments: number;
    appointments_this_month: number;
    pending_consultations: number;
    average_rating: number;
    total_ratings: number;
}

interface RevenueChartItem {
    month: string;
    revenue: number;
}

interface Appointment {
    id: number;
    ticket_number: string;
    user_name: string;
    package_name: string;
    status: string;
    status_label: string;
    risk_level: string;
    created_at: string;
}

interface Rating {
    id: number;
    user_name: string;
    rating: number;
    review: string | null;
    created_at: string;
}

interface Props {
    stats: DashboardStats;
    revenueChart: RevenueChartItem[];
    recentAppointments: Appointment[];
    recentRatings: Rating[];
}

export default function ConsultantDashboard({
    stats,
    revenueChart,
    recentAppointments,
    recentRatings,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: consultant.dashboard.url() },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, string> = {
            waiting: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            in_progress: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
            completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            referred: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
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
            <Head title="Dashboard Konsultan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">Dashboard Konsultan</h1>
                        <p className="text-base text-muted-foreground mt-2">
                            Selamat datang kembali! Berikut adalah ringkasan performa Anda.
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
                        { title: 'Total Pendapatan', value: formatCurrency(stats.total_revenue), icon: DollarSign, color: 'from-primary to-emerald-400', label: 'Semua Waktu' },
                        { title: 'Pendapatan Bulan Ini', value: formatCurrency(stats.revenue_this_month), icon: TrendingUp, color: 'from-violet-500 to-purple-400', label: 'Bulan Berjalan' },
                        { title: 'Total Appointment', value: stats.total_appointments.toLocaleString('id-ID'), icon: Users, color: 'from-blue-500 to-sky-400', label: `${stats.appointments_this_month} Bulan Ini` },
                        { title: 'Rating Rata-rata', value: stats.average_rating.toFixed(1), icon: Star, color: 'from-amber-400 to-yellow-300', label: `${stats.total_ratings} Rating` },
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

                {/* Revenue Chart & Pending Consultations */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white pb-8">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <TrendingUp className="size-5" />
                                    </div>
                                    Performa Pendapatan
                                </CardTitle>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-full">
                                    6 Bulan Terakhir
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="bg-white pt-2">
                            <div className="space-y-6">
                                {revenueChart.map((item, index) => {
                                    const maxRevenue = Math.max(...revenueChart.map(r => r.revenue));
                                    const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-neutral-600">{item.month}</span>
                                                <span className="font-black text-neutral-900">{formatCurrency(item.revenue)}</span>
                                            </div>
                                            <div className="h-4 w-full bg-neutral-50 rounded-full overflow-hidden border border-neutral-100">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_4px_12px_rgba(20,184,166,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Consultations */}
                    <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                    <Ticket className="size-5" />
                                </div>
                                Konsultasi Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-white pt-2">
                            <div className="text-center py-8">
                                <div className="text-5xl font-black text-amber-600">{stats.pending_consultations}</div>
                                <p className="text-sm text-muted-foreground mt-2">Konsultasi menunggu respons</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Appointments */}
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between bg-white">
                            <CardTitle className="text-base font-bold">Appointment Terbaru</CardTitle>
                            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Ticket size={16} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            <div className="divide-y divide-neutral-50 px-6 pb-6">
                                {recentAppointments.length > 0 ? (
                                    recentAppointments.map((appointment) => (
                                        <div key={appointment.id} className="py-4 group hover:bg-neutral-50/50 -mx-2 px-2 transition-colors rounded-xl">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-xs font-black text-neutral-900 truncate">
                                                            {appointment.ticket_number}
                                                        </p>
                                                        {getStatusBadge(appointment.status, appointment.status_label)}
                                                    </div>
                                                    <p className="text-sm font-bold text-neutral-600 truncate mb-1">
                                                        {appointment.user_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                                                        <div className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 uppercase">{appointment.package_name}</div>
                                                        <span>•</span>
                                                        <span>{appointment.created_at}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Ticket className="size-6 text-neutral-200 mb-2" />
                                        <p className="text-sm text-neutral-400 font-medium">Belum ada appointment</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Ratings */}
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between bg-white">
                            <CardTitle className="text-base font-bold">Rating Terbaru</CardTitle>
                            <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Star size={16} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            <div className="divide-y divide-neutral-50 px-6 pb-6">
                                {recentRatings.length > 0 ? (
                                    recentRatings.map((rating) => (
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
