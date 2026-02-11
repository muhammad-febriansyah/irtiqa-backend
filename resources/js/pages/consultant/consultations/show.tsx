import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import consultant from '@/routes/consultant';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, SharedData } from '@/types';

interface Message {
    id: number;
    message: string;
    sender_name: string;
    sender_id: number;
    created_at: string;
}

interface Consultation {
    id: number;
    ticket_number: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    package_name: string;
    status: string;
    status_label: string;
    risk_level: string;
    category: string;
    description: string;
    created_at: string;
    messages: Message[];
}

interface Props {
    consultation: Consultation;
}

export default function ConsultationShow({ consultation }: Props) {
    const { auth } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: consultant.dashboard.url() },
        { title: 'Konsultasi', href: consultant.consultations.index.url() },
        { title: consultation.ticket_number, href: '' },
    ];

    const messageForm = useForm({
        message: '',
    });

    const statusForm = useForm({
        status: consultation.status,
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        messageForm.post(consultant.consultations.respond.url({ ticket: consultation.id }), {
            onSuccess: () => messageForm.reset(),
        });
    };

    const handleUpdateStatus = (value: string) => {
        statusForm.setData('status', value);
        statusForm.put(consultant.consultations.updateStatus.url({ ticket: consultation.id }), {
            onSuccess: () => {
                // Flash success or message handling if needed
            }
        });
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, string> = {
            waiting: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            in_progress: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
            completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            referred: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        };
        return (
            <Badge
                variant="outline"
                className={cn('font-bold uppercase tracking-wider text-[10px]', variants[status] || '')}
            >
                {label}
            </Badge>
        );
    };

    const getRiskBadge = (riskLevel: string) => {
        const variants: Record<string, { class: string; label: string }> = {
            low: { class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Rendah' },
            medium: { class: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Sedang' },
            high: { class: 'bg-rose-500/10 text-rose-600 border-rose-500/20', label: 'Tinggi' },
        };
        const risk = variants[riskLevel] || variants.low;
        return (
            <Badge variant="outline" className={cn('font-bold text-[10px]', risk.class)}>
                {risk.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Konsultasi ${consultation.ticket_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={consultant.consultations.index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                                {consultation.ticket_number}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">{consultation.category}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{consultation.created_at}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {getStatusBadge(consultation.status, consultation.status_label)}
                        <Select value={statusForm.data.status} onValueChange={handleUpdateStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="waiting">Menunggu</SelectItem>
                                <SelectItem value="in_progress">Dalam Proses</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="referred">Dirujuk</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Left Panel: Info and History */}
                    <div className="lg:col-span-1 space-y-6 flex flex-col min-h-0 overflow-y-auto pr-2">
                        {/* Client Info */}
                        <Card className="border-none shadow-sm flex-shrink-0">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Informasi Klien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                                    <p className="font-semibold text-gray-900">{consultation.user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <p className="text-sm text-gray-700">{consultation.user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Tingkat Risiko</Label>
                                    <div>{getRiskBadge(consultation.risk_level)}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Paket</Label>
                                    <p className="text-sm font-medium">{consultation.package_name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Problem Description */}
                        <Card className="border-none shadow-sm flex-shrink-0">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <MessageSquare className="size-4 text-primary" />
                                    Deskripsi Konsultasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 italic text-sm text-gray-600 leading-relaxed">
                                    "{consultation.description}"
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Panel: Chat/Messages */}
                    <div className="lg:col-span-2 flex flex-col min-h-0 h-full">
                        <Card className="border-none shadow-sm flex flex-col flex-1 min-h-[500px]">
                            <CardHeader className="border-b py-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <MessageSquare className="size-4 text-primary" />
                                    Diskusi & Riwayat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-neutral-50/50">
                                {consultation.messages.length > 0 ? (
                                    consultation.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "max-w-[80%] space-y-1",
                                                message.sender_id === auth.user.id ? "ml-auto text-right" : "mr-auto text-left"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "p-3 rounded-2xl text-sm shadow-sm",
                                                    message.sender_id === auth.user.id
                                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                                        : "bg-white border rounded-tl-none"
                                                )}
                                            >
                                                {message.message}
                                            </div>
                                            <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                                                <span className="font-medium">{message.sender_name}</span>
                                                <span>•</span>
                                                <span>{message.created_at}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
                                        <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                                            <MessageSquare className="size-6 text-neutral-300" />
                                        </div>
                                        <p className="text-sm">Belum ada diskusi.</p>
                                        <p className="text-xs">Tulis pesan pertama Anda di bawah ini.</p>
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-4 border-t bg-white">
                                <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                                    <Textarea
                                        placeholder="Ketik pesan atau catatan konsultasi Anda di sini..."
                                        value={messageForm.data.message}
                                        onChange={(e) => messageForm.setData('message', e.target.value)}
                                        className="min-h-[100px] resize-none border-none focus-visible:ring-0 bg-neutral-50"
                                        disabled={messageForm.processing}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-muted-foreground">
                                            Tekan Kirim untuk mengirimkan pesan ke klien
                                        </div>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={messageForm.processing || !messageForm.data.message.trim()}
                                            className="gap-2"
                                        >
                                            <Send className="size-4" />
                                            {messageForm.processing ? 'Mengirim...' : 'Kirim Respons'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
