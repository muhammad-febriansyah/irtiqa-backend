import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Bell,
    CheckCircle2,
    Info,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import FileInput from '@/components/file-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/app/Pagination';
import type { BreadcrumbItem } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

interface Announcement {
    id: number;
    title: string;
    content: string;
    raw_content: string;
    type: string;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    priority: 'low' | 'medium' | 'high';
    image: string | null;
    published_at: string | null;
    created_at: string;
}

interface Props {
    announcements: {
        data: Announcement[];
        links: any[];
    };
    filters: {
        search: string;
        type: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Pengumuman', href: '#' },
];

export default function AnnouncementsIndex({ announcements, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        router.get(
            '/admin/announcements',
            { search: debouncedSearch, type: filters.type, status: filters.status },
            { preserveState: true, replace: true }
        );
    }, [debouncedSearch]);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        title: '',
        content: '',
        type: 'info',
        status: 'published' as 'draft' | 'published' | 'scheduled' | 'archived',
        priority: 'medium' as 'low' | 'medium' | 'high',
        image: null as File | null,
        published_at: new Date().toISOString().split('T')[0],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/announcements', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAnnouncement) {
            // Use post with _method=PUT to support file upload in Inertia
            post(`/admin/announcements/${selectedAnnouncement.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsEditOpen(false);
                    reset();
                },
                headers: {
                    'X-HTTP-Method-Override': 'PUT',
                },
            });
        }
    };

    const handleDelete = () => {
        if (selectedAnnouncement) {
            router.delete(`/admin/announcements/${selectedAnnouncement.id}`, {
                onSuccess: () => setIsDeleteOpen(false),
            });
        }
    };

    const toggleStatus = (announcement: Announcement) => {
        router.post(`/admin/announcements/${announcement.id}/toggle-publish`);
    };

    const openEditModal = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setData({
            title: announcement.title,
            content: announcement.raw_content,
            type: announcement.type,
            status: announcement.status,
            priority: announcement.priority,
            published_at: announcement.published_at || '',
        });
        setIsEditOpen(true);
    };

    const openDeleteModal = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsDeleteOpen(true);
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'info':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Info</Badge>;
            case 'warning':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Peringatan</Badge>;
            case 'urgent':
            case 'danger':
                return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Mendesak</Badge>;
            case 'success':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sukses</Badge>;
            case 'maintenance':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Pemeliharaan</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-emerald-500">Aktif</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draf</Badge>;
            case 'scheduled':
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Terjadwal</Badge>;
            case 'archived':
                return <Badge variant="outline">Arsip</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengumuman" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pengumuman</h1>
                        <p className="text-muted-foreground">
                            Kelola pengumuman sistem untuk semua pengguna.
                        </p>
                    </div>
                    <Button onClick={() => {
                        reset();
                        setData('published_at', new Date().toISOString().split('T')[0]);
                        setIsCreateOpen(true);
                    }}>
                        <Plus className="mr-2 size-4" />
                        Tambah Pengumuman
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari judul atau isi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(val) => router.get('/admin/announcements', { ...filters, status: val === 'all' ? '' : val })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="published">Aktif</SelectItem>
                                <SelectItem value="draft">Draf</SelectItem>
                                <SelectItem value="scheduled">Terjadwal</SelectItem>
                                <SelectItem value="archived">Arsip</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pengumuman</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tgl Publikasi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcements.data.length > 0 ? (
                                announcements.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="size-10 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="size-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-400">
                                                        <Bell size={18} />
                                                    </div>
                                                )}
                                                <div className="max-w-md">
                                                    <p className="font-bold text-[#111827] line-clamp-1">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-sm">
                                            {item.published_at || <span className="text-muted-foreground italic">Seketika</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => openEditModal(item)}>
                                                        Edit Pengumuman
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleStatus(item)}>
                                                        {item.status === 'published' ? 'Jadikan Draf' : 'Publikasikan'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => openDeleteModal(item)}
                                                    >
                                                        Hapus Pengumuman
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Tidak ada pengumuman ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination links={announcements.links} />

                {/* Create Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Tambah Pengumuman Baru</DialogTitle>
                                <DialogDescription>
                                    Buat pengumuman yang akan ditampilkan di dasbor pengguna.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Pengumuman</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Pemeliharaan Sistem, Fitur Baru, dll."
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Tipe</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(val: any) => setData('type', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="warning">Peringatan</SelectItem>
                                                <SelectItem value="urgent">Mendesak</SelectItem>
                                                <SelectItem value="maintenance">Pemeliharaan</SelectItem>
                                                <SelectItem value="feature">Fitur Baru</SelectItem>
                                                <SelectItem value="event">Acara</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Prioritas</Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(val: any) => setData('priority', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Rendah</SelectItem>
                                                <SelectItem value="medium">Sedang</SelectItem>
                                                <SelectItem value="high">Tinggi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status Awal</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val: any) => setData('status', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draf</SelectItem>
                                                <SelectItem value="published">Publikasikan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="published_at">Tanggal Publikasi</Label>
                                        <Input
                                            id="published_at"
                                            type="date"
                                            value={data.published_at}
                                            onChange={(e) => setData('published_at', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <FileInput
                                    label="Thumbnail Pengumuman"
                                    value={data.image}
                                    accept="image/*"
                                    onChange={(file) => setData('image', file)}
                                    error={errors.image}
                                    helpText="Format: JPG, PNG, WEBP. Maks: 2MB."
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="content">Isi Pengumuman</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Tuliskan detail pengumuman di sini..."
                                        rows={5}
                                    />
                                    {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan Pengumuman</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleEdit}>
                            <DialogHeader>
                                <DialogTitle>Edit Pengumuman</DialogTitle>
                                <DialogDescription>
                                    Perbarui detail pengumuman yang sudah ada.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit_title">Judul Pengumuman</Label>
                                    <Input
                                        id="edit_title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_type">Tipe</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(val: any) => setData('type', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="warning">Peringatan</SelectItem>
                                                <SelectItem value="urgent">Mendesak</SelectItem>
                                                <SelectItem value="maintenance">Pemeliharaan</SelectItem>
                                                <SelectItem value="feature">Fitur Baru</SelectItem>
                                                <SelectItem value="event">Acara</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_priority">Prioritas</Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(val: any) => setData('priority', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Rendah</SelectItem>
                                                <SelectItem value="medium">Sedang</SelectItem>
                                                <SelectItem value="high">Tinggi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val: any) => setData('status', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draf</SelectItem>
                                                <SelectItem value="published">Publikasi</SelectItem>
                                                <SelectItem value="scheduled">Terjadwal</SelectItem>
                                                <SelectItem value="archived">Arsip</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_published_at">Tanggal Publikasi</Label>
                                        <Input
                                            id="edit_published_at"
                                            type="date"
                                            value={data.published_at}
                                            onChange={(e) => setData('published_at', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <FileInput
                                    label="Thumbnail Pengumuman"
                                    value={data.image}
                                    currentFileUrl={selectedAnnouncement?.image}
                                    accept="image/*"
                                    onChange={(file) => setData('image', file)}
                                    error={errors.image}
                                    helpText="Kosongkan jika tidak ingin mengubah gambar."
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="edit_content">Isi Pengumuman</Label>
                                    <Textarea
                                        id="edit_content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={5}
                                    />
                                    {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertCircle size={20} />
                                Konfirmasi Hapus
                            </DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus pengumuman <strong>"{selectedAnnouncement?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
                            <Button type="button" variant="destructive" onClick={handleDelete}>Ya, Hapus Permanen</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        </AppLayout >
    );
}
