import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    FileText,
    Package as PackageIcon,
    Star,
    Tag,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem } from '@/types';

interface PackageData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'session' | 'period' | 'unlimited';
    sessions_count: number | null;
    duration_days: number | null;
    price: number;
    features: string[] | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    package: PackageData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Paket', href: '/admin/packages' },
    { title: 'Detail Paket', href: '#' },
];

export default function PackagesShow({ package: pkg }: Props) {
    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"?`)) {
            router.delete(`/admin/packages/${pkg.id}`, {
                onSuccess: () => {
                    toast.success('Paket berhasil dihapus');
                    router.visit('/admin/packages');
                },
                onError: () => {
                    toast.error('Gagal menghapus paket');
                },
            });
        }
    };

    // Parse features if it's a JSON string
    const features = pkg.features
        ? (typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features)
        : null;

    const typeConfig = {
        session: {
            label: 'Berdasarkan Sesi',
            className: 'bg-blue-500/10 text-blue-600 border-blue-200',
            icon: Clock,
        },
        period: {
            label: 'Berdasarkan Periode',
            className: 'bg-green-500/10 text-green-600 border-green-200',
            icon: Calendar,
        },
        unlimited: {
            label: 'Tidak Terbatas',
            className: 'bg-purple-500/10 text-purple-600 border-purple-200',
            icon: Star,
        },
    };

    const config = typeConfig[pkg.type];
    const TypeIcon = config.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Paket - ${pkg.name}`} />

            <div className="space-y-6 p-4 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/packages">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{pkg.name}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Detail lengkap paket konsultasi
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/packages/${pkg.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 size-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="mr-2 size-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Informasi Utama */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <PackageIcon className="size-5 text-primary" />
                                    <CardTitle>Informasi Paket</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Nama Paket</span>
                                        <span className="text-sm font-semibold">{pkg.name}</span>
                                    </div>
                                    <Separator />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Slug</span>
                                        <code className="text-sm bg-muted px-2 py-1 rounded">
                                            {pkg.slug}
                                        </code>
                                    </div>
                                    <Separator />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-sm font-medium">Tipe Paket</span>
                                        <Badge variant="outline" className={config.className}>
                                            <TypeIcon className="mr-1 size-3" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <Separator />
                                </div>

                                {pkg.type === 'session' && pkg.sessions_count && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Jumlah Sesi</span>
                                            <span className="text-sm font-semibold">
                                                {pkg.sessions_count} sesi
                                            </span>
                                        </div>
                                        <Separator />
                                    </div>
                                )}

                                {pkg.type === 'period' && pkg.duration_days && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Durasi</span>
                                            <span className="text-sm font-semibold">
                                                {pkg.duration_days} hari
                                            </span>
                                        </div>
                                        <Separator />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Harga</span>
                                        <span className="text-lg font-bold text-primary">
                                            Rp {pkg.price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <Separator />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Urutan Tampilan</span>
                                        <span className="text-sm">{pkg.sort_order}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deskripsi */}
                        {pkg.description && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-5 text-primary" />
                                        <CardTitle>Deskripsi</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Penjelasan lengkap tentang paket ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {pkg.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Fitur */}
                        {features && features.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="size-5 text-primary" />
                                        <CardTitle>Fitur & Benefit</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Keuntungan yang didapat dari paket ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Paket</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status Aktif</span>
                                        {pkg.is_active ? (
                                            <Badge variant="default">Aktif</Badge>
                                        ) : (
                                            <Badge variant="secondary">Nonaktif</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {pkg.is_active
                                            ? 'Paket ditampilkan dan dapat dibeli pengguna'
                                            : 'Paket disembunyikan dari pengguna'}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Paket Unggulan</span>
                                        {pkg.is_featured ? (
                                            <Badge
                                                variant="outline"
                                                className="bg-amber-500/10 text-amber-600 border-amber-200"
                                            >
                                                <Star className="mr-1 size-3" />
                                                Unggulan
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Tidak
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {pkg.is_featured
                                            ? 'Paket ditampilkan sebagai pilihan unggulan'
                                            : 'Paket tidak ditampilkan sebagai unggulan'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informasi Tambahan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="size-4" />
                                        <span>Dibuat</span>
                                    </div>
                                    <p className="text-sm">
                                        {new Date(pkg.created_at).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="size-4" />
                                        <span>Terakhir Diperbarui</span>
                                    </div>
                                    <p className="text-sm">
                                        {new Date(pkg.updated_at).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/packages/${pkg.id}/edit`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 size-4" />
                                        Edit Paket
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-destructive hover:text-destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Hapus Paket
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
