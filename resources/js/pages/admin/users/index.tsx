import { Head, router } from '@inertiajs/react';
import {
    CheckCircle,
    Info,
    Lock,
    Mail,
    Pencil,
    Plus,
    Shield,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { CrudModal } from '@/components/crud-modal';
import FileInput from '@/components/file-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface RoleData {
    id: number;
    name: string;
    display_name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    is_verified: boolean;
    roles: string[];
    role_names: string[];
    created_at: string;
}

interface Props {
    users: {
        data: UserData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    roles: RoleData[];
    filters: {
        search?: string;
        role?: string;
        verified?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Pengguna', href: '/admin/users' },
];

export default function UsersIndex({ users, roles, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: null as File | null,
        roles: [] as number[],
        email_verified: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            avatar: null,
            roles: [],
            email_verified: true, // Auto-verified saat dibuat oleh admin
        });
        setIsModalOpen(true);
    };

    const handleEdit = (user: UserData) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            avatar: null,
            roles: roles
                .filter((r) => user.role_names.includes(r.name))
                .map((r) => r.id),
            email_verified: user.is_verified,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);

        if (formData.password) {
            data.append('password', formData.password);
        }

        if (formData.avatar) {
            data.append('avatar', formData.avatar);
        }

        formData.roles.forEach((roleId) => {
            data.append('roles[]', roleId.toString());
        });

        data.append('email_verified', formData.email_verified ? '1' : '0');

        if (editingUser) {
            data.append('_method', 'PUT');
            router.post(`/admin/users/${editingUser.id}`, data, {
                forceFormData: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        } else {
            router.post('/admin/users', data, {
                forceFormData: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    const handleToggleVerification = (id: number) => {
        router.post(`/admin/users/${id}/toggle-verification`);
    };

    const handleSearch = (query: string) => {
        router.get(
            '/admin/users',
            { ...filters, search: query },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/admin/users',
            { ...filters, [key]: value || undefined },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/users',
            { ...filters, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleRoleToggle = (roleId: number) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(roleId)
                ? prev.roles.filter((id) => id !== roleId)
                : [...prev.roles, roleId],
        }));
    };

    const columns: Column<UserData>[] = [
        {
            header: 'Nama',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                        <AvatarImage
                            src={row.avatar ? `/storage/${row.avatar}` : undefined}
                            alt={row.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {row.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {row.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            cell: (row) => {
                const roleConfig: Record<string, { label: string; className: string }> = {
                    admin: {
                        label: 'Admin',
                        className: 'bg-red-500 text-white border-red-500',
                    },
                    consultant: {
                        label: 'Konsultan',
                        className: 'bg-blue-500 text-white border-blue-500',
                    },
                    user: {
                        label: 'Pengguna',
                        className: 'bg-slate-500 text-white border-slate-500',
                    },
                };
                return (
                    <div className="flex flex-wrap gap-1">
                        {row.role_names.length > 0 ? (
                            row.role_names.map((role, index) => {
                                const config = roleConfig[role] || {
                                    label: role,
                                    className: 'bg-gray-500 text-white border-gray-500',
                                };
                                return (
                                    <Badge key={index} variant="outline" className={config.className}>
                                        {config.label}
                                    </Badge>
                                );
                            })
                        ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Status Email',
            cell: (row) =>
                row.is_verified ? (
                    <Badge variant="default">Terverifikasi</Badge>
                ) : (
                    <Badge variant="secondary">Belum Verifikasi</Badge>
                ),
        },
        {
            header: 'Terdaftar',
            cell: (row) => (
                <div className="text-sm text-muted-foreground">
                    {row.created_at}
                </div>
            ),
        },
        {
            header: 'Aksi',
            className: 'text-right',
            cell: (row) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVerification(row.id)}
                        title={
                            row.is_verified
                                ? 'Batalkan Verifikasi'
                                : 'Verifikasi Email'
                        }
                    >
                        {row.is_verified ? (
                            <XCircle className="size-4 text-red-600" />
                        ) : (
                            <CheckCircle className="size-4 text-green-600" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(row.id)}
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
            <Head title="Pengelolaan Pengguna" />

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengelolaan Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Select
                                value={filters.role || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange(
                                        'role',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Role
                                    </SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.id}
                                            value={role.name}
                                        >
                                            {role.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.verified || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange(
                                        'verified',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="yes">
                                        Terverifikasi
                                    </SelectItem>
                                    <SelectItem value="no">
                                        Belum Verifikasi
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <br />
                        <DataTable
                            className="mt-4"
                            data={users.data}
                            columns={columns}
                            searchable
                            searchPlaceholder="Cari nama atau email..."
                            onSearch={handleSearch}
                            pagination={{
                                currentPage: users.current_page,
                                lastPage: users.last_page,
                                total: users.total,
                                perPage: users.per_page,
                                onPageChange: handlePageChange,
                            }}
                            emptyMessage="Tidak ada data tersedia."
                            headerActions={
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Pengguna
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                <div className="space-y-6">
                    {/* Informasi Dasar */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Informasi Dasar</h3>
                        </div>

                        <div className="space-y-4 pl-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    Nama Lengkap <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Ahmad Fauzi"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nama lengkap yang akan ditampilkan di tabel pengguna
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="size-3" />
                                    Alamat Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="contoh@email.com"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email untuk login dan notifikasi sistem
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="size-3" />
                                    Password{' '}
                                    {editingUser ? (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (opsional)
                                        </span>
                                    ) : (
                                        <span className="text-destructive">*</span>
                                    )}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="Minimal 8 karakter"
                                    required={!editingUser}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {editingUser
                                        ? 'Biarkan kosong jika tidak ingin mengubah password'
                                        : 'Password harus minimal 8 karakter untuk keamanan'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <FileInput
                                    label="Foto Profil (Avatar)"
                                    value={formData.avatar}
                                    currentFileUrl={editingUser?.avatar ? `/storage/${editingUser.avatar}` : null}
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    onChange={(file) => setFormData({ ...formData, avatar: file })}
                                    helpText="Format: JPG, PNG, GIF. Maksimal 2MB"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Avatar akan ditampilkan di tabel pengguna dan profil
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Role / Hak Akses */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="size-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Hak Akses (Role)</h3>
                        </div>

                        <div className="space-y-3 pl-6">
                            <p className="text-xs text-muted-foreground">
                                Pilih role yang sesuai dengan tugas pengguna (bisa lebih dari satu)
                            </p>

                            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                {roles.map((role) => {
                                    const roleInfo: Record<string, { description: string; badgeClass: string }> = {
                                        admin: {
                                            description: 'Akses penuh ke semua fitur sistem',
                                            badgeClass: 'bg-red-500/10 text-red-600 border-red-200',
                                        },
                                        consultant: {
                                            description: 'Dapat mengelola konsultasi dan klien',
                                            badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-200',
                                        },
                                        user: {
                                            description: 'Akses dasar sebagai pengguna biasa',
                                            badgeClass: 'bg-slate-500/10 text-slate-600 border-slate-200',
                                        },
                                    };

                                    const info = roleInfo[role.name] || {
                                        description: 'Role khusus',
                                        badgeClass: 'bg-gray-500/10 text-gray-600 border-gray-200',
                                    };

                                    return (
                                        <div
                                            key={role.id}
                                            className="flex items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={formData.roles.includes(role.id)}
                                                onCheckedChange={() => handleRoleToggle(role.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 space-y-1">
                                                <Label
                                                    htmlFor={`role-${role.id}`}
                                                    className="flex cursor-pointer items-center gap-2 font-medium"
                                                >
                                                    {role.display_name}
                                                    <Badge variant="outline" className={info.badgeClass}>
                                                        {role.name}
                                                    </Badge>
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    {info.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </CrudModal>
        </AppLayout>
    );
}
