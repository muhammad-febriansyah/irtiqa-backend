import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Plus, Save, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

interface Props {
    package: PackageData;
}

export default function PackageEdit({ package: pkg }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dasbor', href: '/admin/dashboard' },
        { title: 'Paket', href: '/admin/packages' },
        { title: 'Edit Paket', href: `/admin/packages/${pkg.id}/edit` },
    ];

    const [features, setFeatures] = useState<string[]>(
        pkg.features && pkg.features.length > 0 ? pkg.features : ['']
    );

    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name || '',
        description: pkg.description || '',
        type: pkg.type || 'session',
        sessions_count: pkg.sessions_count?.toString() || '',
        duration_days: pkg.duration_days?.toString() || '',
        price: pkg.price.toString() || '',
        is_active: pkg.is_active ?? true,
        is_featured: pkg.is_featured ?? false,
        sort_order: pkg.sort_order.toString() || '0',
    });

    const addFeature = () => {
        setFeatures([...features, '']);
    };

    const removeFeature = (index: number) => {
        if (features.length > 1) {
            setFeatures(features.filter((_, i) => i !== index));
        }
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
            sessions_count: data.sessions_count ? parseInt(data.sessions_count) : null,
            duration_days: data.duration_days ? parseInt(data.duration_days) : null,
            price: parseFloat(data.price),
            features: features.filter((f) => f.trim()).length > 0 ? features.filter((f) => f.trim()) : null,
            sort_order: parseInt(data.sort_order),
        };

        put(`/admin/packages/${pkg.id}`, {
            data: submitData,
            onSuccess: () => {
                toast.success('Paket berhasil diperbarui');
                router.visit('/admin/packages');
            },
            onError: () => {
                toast.error('Gagal memperbarui paket');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Paket: ${pkg.name}`} />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Edit Paket: ${pkg.name}`}
                        description="Perbarui informasi paket konsultasi"
                    />
                    <Button variant="outline" onClick={() => router.visit('/admin/packages')}>
                        <ArrowLeft className="mr-2 size-4" />
                        Kembali
                    </Button>
                </div>

                <Alert>
                    <Info className="size-4" />
                    <AlertDescription>
                        Anda sedang mengedit paket <strong>{pkg.name}</strong>. Perubahan akan langsung
                        mempengaruhi paket yang sudah dibeli pengguna.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informasi Dasar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Informasi utama tentang paket konsultasi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Paket <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Paket Basic, Paket Premium"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                <p className="text-sm text-muted-foreground">
                                    Nama paket yang akan ditampilkan kepada pengguna
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Paket</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan paket ini secara singkat..."
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Deskripsi singkat tentang paket ini (opsional)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Harga (Rp) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="1000"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="Contoh: 500000"
                                    required
                                />
                                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                                <p className="text-sm text-muted-foreground">
                                    Harga paket dalam Rupiah (tanpa titik atau koma)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tipe & Durasi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tipe & Durasi Paket</CardTitle>
                            <CardDescription>Tentukan bagaimana paket ini akan digunakan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    Tipe Paket <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value: 'session' | 'period' | 'unlimited') =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="session">Berdasarkan Sesi</SelectItem>
                                        <SelectItem value="period">Berdasarkan Periode Waktu</SelectItem>
                                        <SelectItem value="unlimited">Tidak Terbatas</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                <div className="rounded-md bg-muted p-3 text-sm">
                                    {data.type === 'session' && (
                                        <p>
                                            <strong>Berdasarkan Sesi:</strong> Pengguna mendapat jumlah sesi
                                            konsultasi tertentu (contoh: 5 sesi)
                                        </p>
                                    )}
                                    {data.type === 'period' && (
                                        <p>
                                            <strong>Berdasarkan Periode:</strong> Pengguna dapat konsultasi selama
                                            periode tertentu (contoh: 30 hari)
                                        </p>
                                    )}
                                    {data.type === 'unlimited' && (
                                        <p>
                                            <strong>Tidak Terbatas:</strong> Pengguna dapat konsultasi tanpa batas
                                            waktu atau sesi
                                        </p>
                                    )}
                                </div>
                            </div>

                            {data.type === 'session' && (
                                <div className="space-y-2">
                                    <Label htmlFor="sessions_count">
                                        Jumlah Sesi <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="sessions_count"
                                        type="number"
                                        min="1"
                                        value={data.sessions_count}
                                        onChange={(e) => setData('sessions_count', e.target.value)}
                                        placeholder="Contoh: 5"
                                        required
                                    />
                                    {errors.sessions_count && (
                                        <p className="text-sm text-destructive">{errors.sessions_count}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Berapa kali sesi konsultasi yang bisa dilakukan
                                    </p>
                                </div>
                            )}

                            {data.type === 'period' && (
                                <div className="space-y-2">
                                    <Label htmlFor="duration_days">
                                        Durasi (Hari) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="duration_days"
                                        type="number"
                                        min="1"
                                        value={data.duration_days}
                                        onChange={(e) => setData('duration_days', e.target.value)}
                                        placeholder="Contoh: 30"
                                        required
                                    />
                                    {errors.duration_days && (
                                        <p className="text-sm text-destructive">{errors.duration_days}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Berapa hari paket ini berlaku sejak pembelian
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Fitur & Detail */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Fitur & Detail</CardTitle>
                            <CardDescription>
                                Fitur-fitur yang didapatkan pengguna dalam paket ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Label>Fitur-Fitur Paket</Label>
                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            placeholder={`Fitur ${index + 1}, contoh: Konsultasi chat 24/7`}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeFeature(index)}
                                            disabled={features.length === 1}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addFeature}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 size-4" />
                                    Tambah Fitur
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Tambahkan fitur-fitur yang akan didapatkan pengguna dalam paket ini
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pengaturan Tambahan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Tambahan</CardTitle>
                            <CardDescription>Status dan urutan tampilan paket</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Urutan Tampilan</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    placeholder="0"
                                />
                                {errors.sort_order && (
                                    <p className="text-sm text-destructive">{errors.sort_order}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Urutan paket saat ditampilkan (semakin kecil, semakin di depan)
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                            Aktifkan Paket
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Paket akan ditampilkan dan dapat dibeli oleh pengguna
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) =>
                                            setData('is_featured', checked as boolean)
                                        }
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="is_featured" className="cursor-pointer font-medium">
                                            Tandai sebagai Unggulan
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Paket akan ditampilkan secara menonjol sebagai paket unggulan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/admin/packages')}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
