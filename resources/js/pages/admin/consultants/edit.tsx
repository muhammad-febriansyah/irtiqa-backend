import { Head, router, useForm } from '@inertiajs/react';
import {
    Award,
    Briefcase,
    CheckCircle,
    Info,
    MapPin,
    Save,
    User,
    X,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Consultant {
    id: number;
    user_id: number;
    user: User;
    specialist_category: string | null;
    level: 'junior' | 'senior' | 'expert';
    city: string | null;
    province: string | null;
    is_active: boolean;
    is_verified: boolean;
    certificate_number: string | null;
    verified_at: string | null;
    bio: string | null;
}

interface Props {
    consultant: Consultant;
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Konsultan', href: '/admin/consultants' },
    { title: 'Edit Konsultan', href: '#' },
];

export default function ConsultantsEdit({ consultant, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: consultant.user_id.toString(),
        specialist_category: consultant.specialist_category || '',
        level: consultant.level,
        city: consultant.city || '',
        province: consultant.province || '',
        is_active: consultant.is_active,
        is_verified: consultant.is_verified,
        certificate_number: consultant.certificate_number || '',
        verified_at: consultant.verified_at ? consultant.verified_at.split('T')[0] : '',
        bio: consultant.bio || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/consultants/${consultant.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Konsultan - ${consultant.user.name}`} />

            <div className="space-y-6 p-4 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Data Konsultan
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Perbarui informasi konsultan: <strong>{consultant.user.name}</strong>
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/consultants')}
                    >
                        <X className="mr-2 size-4" />
                        Batal
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informasi Pengguna */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="size-5 text-primary" />
                                <CardTitle>Informasi Pengguna</CardTitle>
                            </div>
                            <CardDescription>
                                Data pengguna yang terkait dengan konsultan ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user_id">Pengguna</Label>
                                <Select value={data.user_id} disabled>
                                    <SelectTrigger className="bg-muted">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={consultant.user_id.toString()}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {consultant.user.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {consultant.user.email}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                    <Info className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <strong>Catatan:</strong> Pengguna tidak dapat diubah setelah
                                        konsultan dibuat
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Profesional */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Briefcase className="size-5 text-primary" />
                                <CardTitle>Informasi Profesional</CardTitle>
                            </div>
                            <CardDescription>
                                Detail keahlian dan pengalaman konsultan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="specialist_category">Kategori Spesialis</Label>
                                <Input
                                    id="specialist_category"
                                    value={data.specialist_category}
                                    onChange={(e) =>
                                        setData('specialist_category', e.target.value)
                                    }
                                    placeholder="Contoh: Psikolog Klinis, Konselor Keluarga, Terapis"
                                    className={errors.specialist_category ? 'border-destructive' : ''}
                                />
                                {errors.specialist_category && (
                                    <p className="text-sm text-destructive">
                                        {errors.specialist_category}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Bidang keahlian atau spesialisasi konsultan
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">
                                    Tingkat Keahlian <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.level}
                                    onValueChange={(value) =>
                                        setData('level', value as 'junior' | 'senior' | 'expert')
                                    }
                                    required
                                >
                                    <SelectTrigger className={errors.level ? 'border-destructive' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="junior">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-slate-500 text-white border-slate-500"
                                                >
                                                    Junior
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Pengalaman 0-2 tahun
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="senior">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-500 text-white border-blue-500"
                                                >
                                                    Senior
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Pengalaman 3-5 tahun
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="expert">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-amber-500 text-white border-amber-500"
                                                >
                                                    Expert
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Pengalaman 5+ tahun
                                                </span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.level && (
                                    <p className="text-sm text-destructive">{errors.level}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Biografi</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={6}
                                    placeholder="Ceritakan latar belakang pendidikan, pengalaman kerja, dan keahlian konsultan secara detail..."
                                    className={errors.bio ? 'border-destructive' : ''}
                                />
                                {errors.bio && (
                                    <p className="text-sm text-destructive">{errors.bio}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Biografi akan ditampilkan di halaman profil konsultan dan membantu
                                    klien memahami keahlian konsultan
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lokasi Praktik */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MapPin className="size-5 text-primary" />
                                <CardTitle>Lokasi Praktik</CardTitle>
                            </div>
                            <CardDescription>
                                Informasi lokasi tempat konsultan berpraktik
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Jakarta"
                                        className={errors.city ? 'border-destructive' : ''}
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-destructive">{errors.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province">Provinsi</Label>
                                    <Input
                                        id="province"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        placeholder="Contoh: DKI Jakarta"
                                        className={errors.province ? 'border-destructive' : ''}
                                    />
                                    {errors.province && (
                                        <p className="text-sm text-destructive">{errors.province}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sertifikasi */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Award className="size-5 text-primary" />
                                <CardTitle>Sertifikasi & Verifikasi</CardTitle>
                            </div>
                            <CardDescription>
                                Informasi sertifikat dan status verifikasi konsultan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="certificate_number">Nomor Sertifikat</Label>
                                <Input
                                    id="certificate_number"
                                    value={data.certificate_number}
                                    onChange={(e) => setData('certificate_number', e.target.value)}
                                    placeholder="Contoh: PSI-2024-001, STR-123456"
                                    className={errors.certificate_number ? 'border-destructive' : ''}
                                />
                                {errors.certificate_number && (
                                    <p className="text-sm text-destructive">
                                        {errors.certificate_number}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Nomor sertifikat profesi atau lisensi praktik
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="verified_at">Tanggal Verifikasi</Label>
                                <Input
                                    id="verified_at"
                                    type="date"
                                    value={data.verified_at}
                                    onChange={(e) => setData('verified_at', e.target.value)}
                                    className={errors.verified_at ? 'border-destructive' : ''}
                                />
                                {errors.verified_at && (
                                    <p className="text-sm text-destructive">{errors.verified_at}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Tanggal sertifikat diverifikasi oleh sistem
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="size-5 text-primary" />
                                <CardTitle>Status Konsultan</CardTitle>
                            </div>
                            <CardDescription>
                                Atur status aktif dan verifikasi konsultan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData('is_active', checked as boolean)
                                        }
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                            Status Aktif
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Konsultan dapat menerima kasus baru dan akan ditampilkan di
                                            daftar konsultan aktif
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="is_verified"
                                        checked={data.is_verified}
                                        onCheckedChange={(checked) =>
                                            setData('is_verified', checked as boolean)
                                        }
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor="is_verified"
                                            className="cursor-pointer font-medium"
                                        >
                                            Terverifikasi
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Konsultan sudah diverifikasi kredensialnya oleh admin dan
                                            mendapat badge terverifikasi
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/consultants')}
                                    disabled={processing}
                                >
                                    <X className="mr-2 size-4" />
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <span className="mr-2 size-4 animate-spin">⏳</span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 size-4" />
                                            Perbarui Konsultan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
