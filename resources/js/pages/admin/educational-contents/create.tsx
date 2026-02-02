import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, ImagePlus, Info, Megaphone, Plus, Settings, Tag, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    authors: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Konten Edukasi', href: '/admin/educational-contents' },
    { title: 'Tambah Konten', href: '/admin/educational-contents/create' },
];

const FormHelper = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs text-muted-foreground mt-1.5">{children}</p>
);

export default function CreateEducationalContent({ authors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        content: '',
        type: 'article' as 'article' | 'video' | 'audio' | 'infographic' | 'guide',
        category: '',
        tags: [] as string[],
        thumbnail: null as File | null,
        media_url: '',
        duration_minutes: '',
        level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        reading_time_minutes: '',
        is_published: false,
        is_featured: false,
        published_at: '',
        author_id: '',
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailChange = (file: File | null) => {
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('thumbnail', null);
            setThumbnailPreview(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleThumbnailChange(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/educational-contents', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Konten berhasil disimpan', {
                    description: 'Konten edukasi baru telah berhasil ditambahkan.',
                });
            },
            onError: () => {
                toast.error('Gagal menyimpan konten', {
                    description: 'Terjadi kesalahan. Periksa kembali isian form Anda.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Konten Edukasi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit('/admin/educational-contents')}
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Konten Edukasi</h1>
                        <p className="text-sm text-muted-foreground">Buat artikel, video, atau materi edukasi baru untuk pengguna</p>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="rounded-lg bg-primary p-4">
                    <div className="flex gap-3">
                        <Info className="size-5 text-primary-foreground shrink-0 mt-0.5" />
                        <div className="text-sm text-primary-foreground">
                            <p className="font-medium">Tips membuat konten yang baik:</p>
                            <ul className="mt-1 list-disc list-inside space-y-0.5 text-primary-foreground/90">
                                <li>Gunakan judul yang menarik dan jelas</li>
                                <li>Tulis ringkasan singkat agar pembaca tertarik</li>
                                <li>Tambahkan gambar thumbnail yang relevan</li>
                                <li>Pilih kategori dan tag yang sesuai agar mudah ditemukan</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="size-5 text-primary" />
                                <div>
                                    <CardTitle>Informasi Utama</CardTitle>
                                    <CardDescription>Isi judul, ringkasan, dan isi konten edukasi Anda</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormItem>
                                <FormLabel>
                                    Judul Konten <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Cara Mengatasi Stres dengan Dzikir"
                                        required
                                    />
                                </FormControl>
                                <FormHelper>Buat judul yang menarik dan menjelaskan isi konten (maksimal 255 karakter)</FormHelper>
                                {errors.title && <FormMessage>{errors.title}</FormMessage>}
                            </FormItem>

                            <FormItem>
                                <FormLabel>Ringkasan / Deskripsi Singkat</FormLabel>
                                <FormControl>
                                    <Textarea
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        placeholder="Tulis ringkasan singkat tentang isi konten ini (2-3 kalimat)..."
                                        rows={3}
                                    />
                                </FormControl>
                                <FormHelper>Ringkasan ini akan muncul di daftar konten dan hasil pencarian. Buat singkat tapi menarik!</FormHelper>
                                {errors.excerpt && <FormMessage>{errors.excerpt}</FormMessage>}
                            </FormItem>

                            <FormItem>
                                <FormLabel>
                                    Isi Konten <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <RichTextEditor
                                        content={data.content}
                                        onChange={(content) => setData('content', content)}
                                        placeholder="Tulis isi konten edukasi Anda di sini. Anda bisa menambahkan format teks, heading, list, dan lainnya..."
                                    />
                                </FormControl>
                                <FormHelper>Gunakan toolbar di atas untuk memformat teks (bold, italic, heading, list, dll)</FormHelper>
                                {errors.content && <FormMessage>{errors.content}</FormMessage>}
                            </FormItem>
                        </CardContent>
                    </Card>

                    {/* Content Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="size-5 text-primary" />
                                <div>
                                    <CardTitle>Pengaturan Konten</CardTitle>
                                    <CardDescription>Tentukan jenis, kategori, dan tingkat kesulitan konten</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormItem>
                                    <FormLabel>
                                        Jenis Konten <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value as 'article' | 'video' | 'audio' | 'infographic' | 'guide')}
                                        >
                                            <option value="article">Artikel - Tulisan/bacaan</option>
                                            <option value="video">Video - Konten video</option>
                                            <option value="audio">Audio - Podcast/rekaman suara</option>
                                            <option value="infographic">Infografis - Gambar informatif</option>
                                            <option value="guide">Panduan - Tutorial langkah demi langkah</option>
                                        </select>
                                    </FormControl>
                                    <FormHelper>Pilih jenis konten yang paling sesuai</FormHelper>
                                    {errors.type && <FormMessage>{errors.type}</FormMessage>}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>
                                        Tingkat Kesulitan <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            value={data.level}
                                            onChange={(e) => setData('level', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                                        >
                                            <option value="beginner">Pemula - Untuk yang baru belajar</option>
                                            <option value="intermediate">Menengah - Sudah paham dasar</option>
                                            <option value="advanced">Lanjutan - Untuk yang sudah mahir</option>
                                        </select>
                                    </FormControl>
                                    <FormHelper>Sesuaikan dengan target pembaca konten ini</FormHelper>
                                    {errors.level && <FormMessage>{errors.level}</FormMessage>}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            placeholder="Contoh: Kesehatan Mental, Parenting, dll"
                                        />
                                    </FormControl>
                                    <FormHelper>Kelompokkan konten berdasarkan topik utama</FormHelper>
                                    {errors.category && <FormMessage>{errors.category}</FormMessage>}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>
                                        Penulis <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            value={data.author_id}
                                            onChange={(e) => setData('author_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Penulis --</option>
                                            {authors.map((author) => (
                                                <option key={author.id} value={author.id}>
                                                    {author.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormHelper>Pilih nama penulis yang akan ditampilkan</FormHelper>
                                    {errors.author_id && <FormMessage>{errors.author_id}</FormMessage>}
                                </FormItem>
                            </div>

                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Tag className="size-4" />
                                    Kata Kunci Pencarian
                                </FormLabel>
                                <div className="space-y-3">
                                    {/* Display current tags */}
                                    {data.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('tags', data.tags.filter((_, i) => i !== index))}
                                                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                                                        title="Hapus kata kunci"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input for new tag */}
                                    <div className="flex gap-2">
                                        <Input
                                            id="tag-input"
                                            placeholder="Ketik kata kunci, lalu tekan Enter atau klik Tambah"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.currentTarget;
                                                    const value = input.value.trim();
                                                    if (value && !data.tags.includes(value)) {
                                                        setData('tags', [...data.tags, value]);
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const input = document.getElementById('tag-input') as HTMLInputElement;
                                                const value = input?.value.trim();
                                                if (value && !data.tags.includes(value)) {
                                                    setData('tags', [...data.tags, value]);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="size-4 mr-1" />
                                            Tambah
                                        </Button>
                                    </div>

                                    {/* Suggested tags */}
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                            Saran kata kunci (klik untuk menambahkan):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {['kesehatan mental', 'parenting', 'keluarga', 'pernikahan', 'keuangan', 'ibadah', 'dzikir', 'doa', 'stress', 'kecemasan', 'motivasi', 'produktivitas'].map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    disabled={data.tags.includes(suggestion)}
                                                    onClick={() => {
                                                        if (!data.tags.includes(suggestion)) {
                                                            setData('tags', [...data.tags, suggestion]);
                                                        }
                                                    }}
                                                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                                                        data.tags.includes(suggestion)
                                                            ? 'border-primary/30 bg-primary/10 text-primary/50 cursor-not-allowed'
                                                            : 'border-border hover:border-primary hover:bg-primary/5 hover:text-primary'
                                                    }`}
                                                >
                                                    + {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <FormHelper>
                                    Kata kunci membantu pengguna menemukan konten ini saat mencari. Tambahkan 3-5 kata kunci yang relevan.
                                </FormHelper>
                                {errors.tags && <FormMessage>{errors.tags}</FormMessage>}
                            </FormItem>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ImagePlus className="size-5 text-primary" />
                                <div>
                                    <CardTitle>Media & Gambar</CardTitle>
                                    <CardDescription>Tambahkan gambar sampul dan link media pendukung</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormItem>
                                <FormLabel>Gambar Sampul (Thumbnail)</FormLabel>
                                <FormControl>
                                    <div
                                        className={`relative overflow-hidden rounded-lg transition-colors ${
                                            thumbnailPreview
                                                ? 'border border-border'
                                                : isDragging
                                                    ? 'border-2 border-dashed border-primary bg-primary/5'
                                                    : 'border-2 border-dashed border-muted-foreground/25 hover:border-primary/50'
                                        }`}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                handleThumbnailChange(file);
                                            }}
                                        />
                                        {thumbnailPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Preview gambar sampul"
                                                    className="h-52 w-full object-contain bg-muted/50"
                                                />
                                                <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleThumbnailChange(null)}
                                                    className="absolute right-3 top-3 rounded-full bg-destructive p-2 text-destructive-foreground shadow-md hover:bg-destructive/90"
                                                    title="Hapus gambar"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-3 right-3 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-md hover:bg-white"
                                                >
                                                    Ganti Gambar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex w-full flex-col items-center justify-center gap-3 p-8"
                                            >
                                                <div className="rounded-full bg-muted p-4">
                                                    <ImagePlus className="size-8 text-muted-foreground" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium">
                                                        Klik di sini untuk upload gambar
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        atau seret dan lepas file gambar ke area ini
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Format: PNG, JPG, GIF, WEBP (Maksimal 2MB)
                                                    </p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </FormControl>
                                <FormHelper>Gambar ini akan muncul sebagai sampul konten di daftar dan halaman utama</FormHelper>
                                {errors.thumbnail && <FormMessage>{errors.thumbnail}</FormMessage>}
                            </FormItem>

                            {(data.type === 'video' || data.type === 'audio') && (
                                <FormItem>
                                    <FormLabel>Link Video / Audio</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={data.media_url}
                                            onChange={(e) => setData('media_url', e.target.value)}
                                            placeholder="Contoh: https://youtube.com/watch?v=xxxxx atau https://soundcloud.com/xxxxx"
                                        />
                                    </FormControl>
                                    <FormHelper>Masukkan link YouTube, Vimeo, SoundCloud, atau platform media lainnya</FormHelper>
                                    {errors.media_url && <FormMessage>{errors.media_url}</FormMessage>}
                                </FormItem>
                            )}

                            <div className="grid gap-6 md:grid-cols-2">
                                {(data.type === 'video' || data.type === 'audio') && (
                                    <FormItem>
                                        <FormLabel>Durasi Media (dalam menit)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={data.duration_minutes}
                                                onChange={(e) => setData('duration_minutes', e.target.value)}
                                                placeholder="Contoh: 15"
                                            />
                                        </FormControl>
                                        <FormHelper>Berapa menit durasi video/audio ini?</FormHelper>
                                        {errors.duration_minutes && <FormMessage>{errors.duration_minutes}</FormMessage>}
                                    </FormItem>
                                )}

                                {(data.type === 'article' || data.type === 'guide') && (
                                    <FormItem>
                                        <FormLabel>Estimasi Waktu Baca (dalam menit)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={data.reading_time_minutes}
                                                onChange={(e) => setData('reading_time_minutes', e.target.value)}
                                                placeholder="Contoh: 5"
                                            />
                                        </FormControl>
                                        <FormHelper>Perkiraan berapa menit untuk membaca konten ini</FormHelper>
                                        {errors.reading_time_minutes && <FormMessage>{errors.reading_time_minutes}</FormMessage>}
                                    </FormItem>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publish Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Megaphone className="size-5 text-primary" />
                                <div>
                                    <CardTitle>Pengaturan Publikasi</CardTitle>
                                    <CardDescription>Atur kapan dan bagaimana konten ini ditampilkan</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormItem>
                                <FormLabel>Jadwal Publikasi</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={(e) => setData('published_at', e.target.value)}
                                    />
                                </FormControl>
                                <FormHelper>Kosongkan jika ingin dipublikasikan segera setelah disimpan</FormHelper>
                                {errors.published_at && <FormMessage>{errors.published_at}</FormMessage>}
                            </FormItem>

                            <div className="rounded-lg border p-4 space-y-4">
                                <FormItem className="flex items-start gap-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={data.is_published}
                                            onCheckedChange={(checked) =>
                                                setData('is_published', checked as boolean)
                                            }
                                            className="mt-0.5"
                                        />
                                    </FormControl>
                                    <div className="space-y-1">
                                        <FormLabel className="!mt-0 font-medium">Publikasikan Konten</FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Jika dicentang, konten akan langsung tampil untuk pengguna. Jika tidak, konten akan disimpan sebagai draft.
                                        </p>
                                    </div>
                                </FormItem>

                                <FormItem className="flex items-start gap-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={data.is_featured}
                                            onCheckedChange={(checked) =>
                                                setData('is_featured', checked as boolean)
                                            }
                                            className="mt-0.5"
                                        />
                                    </FormControl>
                                    <div className="space-y-1">
                                        <FormLabel className="!mt-0 font-medium">Tampilkan di Konten Unggulan</FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Jika dicentang, konten akan muncul di bagian "Konten Unggulan" di halaman utama.
                                        </p>
                                    </div>
                                </FormItem>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                            <span className="text-destructive">*</span> Menandakan kolom wajib diisi
                        </p>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/admin/educational-contents')}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Konten'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
