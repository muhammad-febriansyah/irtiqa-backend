import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import consultantRoutes from '@/routes/consultant';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Award,
    Briefcase,
    Camera,
    CheckCircle2,
    FileText,
    Mail,
    Phone,
    Save,
    Star,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Consultant {
    id: number;
    user_id: number;
    specialization: string;
    bio: string;
    experience_years: number;
    certification: string | null;
    phone: string;
    is_verified: boolean;
    rating: number;
    total_consultations: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    consultant: Consultant;
    user: User;
    categories: Category[];
    selectedCategories: number[];
}

export default function ConsultantProfile({
    consultant,
    user,
    categories,
    selectedCategories,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: consultantRoutes.dashboard.url() },
        { title: 'Profil', href: consultantRoutes.profile.edit.url() },
    ];

    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`) : null
    );

    const profileForm = useForm({
        specialization: consultant.specialization || '',
        bio: consultant.bio || '',
        experience_years: consultant.experience_years || 0,
        certification: consultant.certification || '',
        phone: consultant.phone || '',
        avatar: null as File | null,
    });

    const specializationForm = useForm({
        categories: selectedCategories,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        profileForm.transform((data) => ({
            ...data,
            _method: 'put',
        }));

        profileForm.post(consultantRoutes.profile.update.url(), {
            forceFormData: true,
        });
    };

    const handleSpecializationSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        specializationForm.put(consultantRoutes.profile.specializations.update.url());
    };

    const handleCategoryToggle = (categoryId: number) => {
        const current = specializationForm.data.categories;
        const updated = current.includes(categoryId)
            ? current.filter((id) => id !== categoryId)
            : [...current, categoryId];
        specializationForm.setData('categories', updated);
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
            <Head title="Profil Konsultan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
                            Profil Konsultan
                        </h1>
                        <p className="text-base text-muted-foreground mt-2">
                            Kelola informasi profil dan spesialisasi Anda
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <Card className="border-none shadow-sm sticky top-4">
                            <CardContent className="p-6 space-y-6">
                                {/* Avatar & Basic Info */}
                                <div className="text-center space-y-4">
                                    <div className="relative inline-block group">
                                        <div className="size-24 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <Camera className="size-6 text-white" />
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                        {consultant.is_verified && (
                                            <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-lg">
                                                <CheckCircle2 className="size-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-neutral-900">
                                            {user.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Klik avatar untuk mengubah foto
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <Star className="size-4 text-amber-600" />
                                            <span className="text-sm font-bold text-amber-900">
                                                Rating
                                            </span>
                                        </div>
                                        <span className="text-base font-black text-amber-600">
                                            {consultant.rating.toFixed(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="size-4 text-primary" />
                                            <span className="text-sm font-bold text-primary">
                                                Total Konsultasi
                                            </span>
                                        </div>
                                        <span className="text-base font-black text-primary">
                                            {consultant.total_consultations}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="flex items-center gap-2">
                                            <Award className="size-4 text-blue-600" />
                                            <span className="text-sm font-bold text-blue-900">
                                                Pengalaman
                                            </span>
                                        </div>
                                        <span className="text-base font-black text-blue-600">
                                            {consultant.experience_years} Tahun
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="size-4 text-muted-foreground" />
                                        <span className="text-neutral-600">{user.email}</span>
                                    </div>
                                    {consultant.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="size-4 text-muted-foreground" />
                                            <span className="text-neutral-600">{consultant.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Forms */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Profile Form */}
                        <motion.div variants={item}>
                            <Card className="border-none shadow-sm">
                                <CardHeader className="bg-white">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <User className="size-5" />
                                        </div>
                                        Informasi Profil
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="bg-white pt-6">
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="specialization">Spesialisasi *</Label>
                                            <Input
                                                id="specialization"
                                                placeholder="Contoh: Psikologi Klinis, Terapi Kognitif"
                                                value={profileForm.data.specialization}
                                                onChange={(e) =>
                                                    profileForm.setData('specialization', e.target.value)
                                                }
                                            />
                                            {profileForm.errors.specialization && (
                                                <p className="text-sm text-rose-600">
                                                    {profileForm.errors.specialization}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio / Deskripsi *</Label>
                                            <Textarea
                                                id="bio"
                                                rows={5}
                                                placeholder="Ceritakan tentang diri Anda, pengalaman, dan keahlian..."
                                                value={profileForm.data.bio}
                                                onChange={(e) => profileForm.setData('bio', e.target.value)}
                                            />
                                            {profileForm.errors.bio && (
                                                <p className="text-sm text-rose-600">
                                                    {profileForm.errors.bio}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="experience_years">
                                                    Pengalaman (Tahun) *
                                                </Label>
                                                <Input
                                                    id="experience_years"
                                                    type="number"
                                                    min="0"
                                                    value={profileForm.data.experience_years}
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'experience_years',
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                />
                                                {profileForm.errors.experience_years && (
                                                    <p className="text-sm text-rose-600">
                                                        {profileForm.errors.experience_years}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Nomor Telepon *</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="08123456789"
                                                    value={profileForm.data.phone}
                                                    onChange={(e) =>
                                                        profileForm.setData('phone', e.target.value)
                                                    }
                                                />
                                                {profileForm.errors.phone && (
                                                    <p className="text-sm text-rose-600">
                                                        {profileForm.errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="certification">
                                                Sertifikasi / Lisensi (Opsional)
                                            </Label>
                                            <Textarea
                                                id="certification"
                                                rows={3}
                                                placeholder="Contoh: Sertifikat Psikolog Klinis (HIMPSI), Lisensi Praktik No. 12345"
                                                value={profileForm.data.certification}
                                                onChange={(e) =>
                                                    profileForm.setData('certification', e.target.value)
                                                }
                                            />
                                            {profileForm.errors.certification && (
                                                <p className="text-sm text-rose-600">
                                                    {profileForm.errors.certification}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <Button
                                                type="submit"
                                                disabled={profileForm.processing}
                                                className="gap-2"
                                            >
                                                <Save className="size-4" />
                                                {profileForm.processing ? 'Menyimpan...' : 'Simpan Profil'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Specialization Form */}
                        <motion.div variants={item}>
                            <Card className="border-none shadow-sm">
                                <CardHeader className="bg-white">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                                            <FileText className="size-5" />
                                        </div>
                                        Kategori Spesialisasi
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Pilih kategori konsultasi yang Anda kuasai
                                    </p>
                                </CardHeader>
                                <CardContent className="bg-white pt-6">
                                    <form onSubmit={handleSpecializationSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {categories.map((category) => {
                                                const isSelected = specializationForm.data.categories.includes(
                                                    category.id
                                                );
                                                return (
                                                    <label
                                                        key={category.id}
                                                        className={cn(
                                                            'flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer group hover:border-primary/50',
                                                            isSelected
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-neutral-100 hover:bg-neutral-50'
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() =>
                                                                handleCategoryToggle(category.id)
                                                            }
                                                        />
                                                        <div className="flex-1">
                                                            <p
                                                                className={cn(
                                                                    'text-sm font-bold transition-colors',
                                                                    isSelected
                                                                        ? 'text-primary'
                                                                        : 'text-neutral-700 group-hover:text-primary'
                                                                )}
                                                            >
                                                                {category.name}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {specializationForm.errors.categories && (
                                            <p className="text-sm text-rose-600">
                                                {specializationForm.errors.categories}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-sm text-muted-foreground">
                                                {specializationForm.data.categories.length} kategori dipilih
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={specializationForm.processing}
                                                className="gap-2"
                                            >
                                                <Save className="size-4" />
                                                {specializationForm.processing
                                                    ? 'Menyimpan...'
                                                    : 'Simpan Spesialisasi'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
