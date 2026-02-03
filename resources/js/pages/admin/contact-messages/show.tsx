import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Calendar, User, Send } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    admin_reply: string | null;
    replied_at: string | null;
    replied_by: {
        name: string;
    } | null;
    created_at: string;
}

interface Props {
    message: ContactMessage;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/admin/dashboard' },
    { title: 'Pesan Kontak', href: '/admin/contact-messages' },
    { title: 'Detail Pesan' },
];

export default function ContactMessageShow({ message }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        admin_reply: message.admin_reply || '',
    });

    const { data: statusData, setData: setStatusData, patch } = useForm({
        status: message.status,
    });

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/contact-messages/${message.id}/reply`);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusData('status', newStatus as 'new' | 'read' | 'replied');
        patch(`/admin/contact-messages/${message.id}/status`);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            new: 'bg-blue-100 text-blue-800',
            read: 'bg-yellow-100 text-yellow-800',
            replied: 'bg-green-100 text-green-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts = {
            new: 'Baru',
            read: 'Dibaca',
            replied: 'Dibalas',
        };
        return texts[status as keyof typeof texts] || status;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pesan - ${message.name}`} />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Detail Pesan Kontak"
                        description="Lihat detail dan balas pesan"
                    />
                    <Link href="/admin/contact-messages">
                        <Button variant="outline">
                            <ArrowLeft size={16} className="mr-2" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Message Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl mb-2">{message.subject}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                {message.name}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} />
                                                {message.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(message.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                                        {getStatusText(message.status)}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Pesan:</Label>
                                        <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                                            {message.message}
                                        </div>
                                    </div>

                                    {message.admin_reply && (
                                        <div>
                                            <Label className="text-sm font-semibold mb-2 block">Balasan Admin:</Label>
                                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                                <p className="whitespace-pre-wrap">{message.admin_reply}</p>
                                                {message.replied_at && message.replied_by && (
                                                    <p className="text-xs text-muted-foreground mt-3">
                                                        Dibalas oleh {message.replied_by.name} pada{' '}
                                                        {new Date(message.replied_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reply Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Balas Pesan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleReply} className="space-y-4">
                                    <div>
                                        <Label htmlFor="reply">Balasan Anda</Label>
                                        <Textarea
                                            id="reply"
                                            rows={6}
                                            value={data.admin_reply}
                                            onChange={(e) => setData('admin_reply', e.target.value)}
                                            placeholder="Tulis balasan Anda di sini..."
                                            className="mt-2"
                                        />
                                        {errors.admin_reply && (
                                            <p className="text-sm text-destructive mt-1">{errors.admin_reply}</p>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Mengirim...' : 'Kirim Balasan'}
                                        <Send size={16} className="ml-2" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Pesan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={statusData.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Baru</SelectItem>
                                        <SelectItem value="read">Dibaca</SelectItem>
                                        <SelectItem value="replied">Dibalas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informasi Pengirim</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Nama</Label>
                                    <p className="font-medium">{message.name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <a href={`mailto:${message.email}`} className="font-medium text-primary hover:underline">
                                        {message.email}
                                    </a>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Dikirim Pada</Label>
                                    <p className="font-medium">
                                        {new Date(message.created_at).toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
