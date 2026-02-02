import { Head, router } from '@inertiajs/react';
import { CheckCircle, Pencil, Plus, Shield, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { CrudModal } from '@/components/crud-modal';
import FileInput from '@/components/file-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type Column } from '@/components/ui/data-table';
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

interface PractitionerData {
    id: number;
    name: string;
    title: string | null;
    province: string;
    city: string;
    phone: string | null;
    whatsapp: string | null;
    specialties: string[] | null;
    verification_status: string;
    is_active: boolean;
    accepting_referrals: boolean;
    referral_count: number;
    average_rating: number | null;
    verified_at: string | null;
    verifier_name: string | null;
    created_at: string;
}

interface Props {
    practitioners: {
        data: PractitionerData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    provinces: string[];
    cities: string[];
    filters: {
        search?: string;
        verification_status?: string;
        province?: string;
        city?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Praktisi Rujukan', href: '/admin/practitioners' },
];

export default function PractitionersIndex({ practitioners, provinces, cities, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPractitioner, setEditingPractitioner] = useState<PractitionerData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        photo: null as File | null,
        province: '',
        city: '',
        address: '',
        phone: '',
        whatsapp: '',
        email: '',
        is_active: true,
        accepting_referrals: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingPractitioner(null);
        setFormData({
            name: '',
            title: '',
            bio: '',
            photo: null,
            province: '',
            city: '',
            address: '',
            phone: '',
            whatsapp: '',
            email: '',
            is_active: true,
            accepting_referrals: true,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (practitioner: PractitionerData) => {
        setEditingPractitioner(practitioner);
        setFormData({
            name: practitioner.name,
            title: practitioner.title || '',
            bio: '',
            photo: null,
            province: practitioner.province,
            city: practitioner.city,
            address: '',
            phone: practitioner.phone || '',
            whatsapp: practitioner.whatsapp || '',
            email: '',
            is_active: practitioner.is_active,
            accepting_referrals: practitioner.accepting_referrals,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingPractitioner ? `/admin/practitioners/${editingPractitioner.id}` : '/admin/practitioners';
        const method = editingPractitioner ? 'put' : 'post';

        router[method](url, formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(`Praktisi berhasil ${editingPractitioner ? 'diperbarui' : 'ditambahkan'}`);
                setIsModalOpen(false);
            },
            onError: () => {
                toast.error('Gagal menyimpan praktisi');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (practitioner: PractitionerData) => {
        if (confirm('Yakin ingin menghapus praktisi ini?')) {
            router.delete(`/admin/practitioners/${practitioner.id}`, {
                onSuccess: () => {
                    toast.success('Praktisi berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus praktisi');
                },
            });
        }
    };

    const handleVerify = (practitioner: PractitionerData) => {
        router.post(`/admin/practitioners/${practitioner.id}/verify`, {}, {
            onSuccess: () => {
                toast.success('Praktisi berhasil diverifikasi');
            },
        });
    };

    const handleReject = (practitioner: PractitionerData) => {
        const notes = prompt('Alasan penolakan:');
        if (notes) {
            router.post(`/admin/practitioners/${practitioner.id}/reject`, { verification_notes: notes }, {
                onSuccess: () => {
                    toast.success('Praktisi ditolak');
                },
            });
        }
    };

    const handleToggleActive = (practitioner: PractitionerData) => {
        router.post(`/admin/practitioners/${practitioner.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(`Praktisi berhasil ${practitioner.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
            },
        });
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/practitioners',
            { ...filters, search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/practitioners',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getVerificationBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            pending: 'outline',
            verified: 'default',
            rejected: 'destructive',
        };
        const labels: Record<string, string> = {
            pending: 'Menunggu',
            verified: 'Terverifikasi',
            rejected: 'Ditolak',
        };
        return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
    };

    const columns: Column<PractitionerData>[] = [
        {
            key: 'name',
            label: 'Nama',
            sortable: false,
        },
        {
            key: 'title',
            label: 'Gelar',
            sortable: false,
            render: (practitioner) => practitioner.title || '-',
        },
        {
            key: 'province',
            label: 'Wilayah',
            sortable: false,
            render: (practitioner) => `${practitioner.city}, ${practitioner.province}`,
        },
        {
            key: 'phone',
            label: 'Kontak',
            sortable: false,
            render: (practitioner) => practitioner.phone || practitioner.whatsapp || '-',
        },
        {
            key: 'verification_status',
            label: 'Verifikasi',
            sortable: false,
            render: (practitioner) => getVerificationBadge(practitioner.verification_status),
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: false,
            render: (practitioner) => (
                <Badge variant={practitioner.is_active ? 'default' : 'outline'}>
                    {practitioner.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'referral_count',
            label: 'Rujukan',
            sortable: false,
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (practitioner) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(practitioner)}
                        title="Edit"
                    >
                        <Pencil className="size-4" />
                    </Button>
                    {practitioner.verification_status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerify(practitioner)}
                                title="Verifikasi"
                            >
                                <CheckCircle className="size-4 text-green-600" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(practitioner)}
                                title="Tolak"
                            >
                                <XCircle className="size-4 text-red-600" />
                            </Button>
                        </>
                    )}
                    {practitioner.verification_status === 'verified' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(practitioner)}
                            title={practitioner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                            <Shield className="size-4" />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(practitioner)}
                        title="Hapus"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Praktisi Rujukan" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Praktisi Rujukan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={practitioners.data}
                            searchable
                            searchPlaceholder="Cari nama atau lokasi praktisi..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: practitioners.current_page,
                                lastPage: practitioners.last_page,
                                perPage: practitioners.per_page,
                                total: practitioners.total,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data praktisi."
                            headerActions={
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Praktisi
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPractitioner ? 'Edit Praktisi' : 'Tambah Praktisi'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nama <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Gelar</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ustadz, Kyai, Dr., dll."
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="province">
                                Provinsi <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="province"
                                value={formData.province}
                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                placeholder="Masukkan provinsi"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">
                                Kota/Kabupaten <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Masukkan kota/kabupaten"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telepon</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+62812345678"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input
                                id="whatsapp"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                placeholder="+62812345678"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Alamat lengkap"
                            rows={3}
                        />
                    </div>

                    {editingPractitioner && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_active: checked as boolean })
                                    }
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Aktif
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="accepting_referrals"
                                    checked={formData.accepting_referrals}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, accepting_referrals: checked as boolean })
                                    }
                                />
                                <Label htmlFor="accepting_referrals" className="cursor-pointer">
                                    Menerima Rujukan
                                </Label>
                            </div>
                        </div>
                    )}
                </div>
            </CrudModal>
        </AppLayout>
    );
}
