import { Head, router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface LegalPageData {
    id: number;
    slug: string;
    title: string;
    content: string;
}

interface Props {
    legalPage: LegalPageData;
}

export default function LegalPageEdit({ legalPage }: Props) {
    const [formData, setFormData] = useState({
        title: legalPage?.title || '',
        content: legalPage?.content || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dasbor', href: '/admin/dashboard' },
        { title: legalPage.title, href: `/admin/legal/${legalPage.slug}` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/admin/legal/${legalPage.slug}`, formData, {
            onSuccess: () => {
                toast.success(`${legalPage.title} berhasil diperbarui`);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Gagal memperbarui halaman');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manajemen ${legalPage.title}`} />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Manajemen ${legalPage.title}`}
                        description={`Kelola konten halaman ${legalPage.title}`}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Konten Halaman</CardTitle>
                            <CardDescription>
                                Perbarui judul dan isi konten hukum platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Judul <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Masukkan judul halaman"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">
                                    Konten Lengkap <span className="text-destructive">*</span>
                                </Label>
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    placeholder="Tuliskan konten hukum di sini..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            {!isSubmitting && <Save className="ml-2 size-4" />}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
