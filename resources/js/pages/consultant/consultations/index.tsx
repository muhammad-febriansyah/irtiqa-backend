import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import consultant from '@/routes/consultant';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    Clock,
    MessageSquare,
    Search,
    Send,
    Ticket,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Consultation {
    id: number;
    ticket_number: string;
    user_name: string;
    user_email: string;
    package_name: string;
    category_name: string;
    status: string;
    status_label: string;
    risk_level: string;
    dream_title: string;
    dream_description: string;
    created_at: string;
    responded_at: string | null;
}

interface Props {
    consultations: {
        data: Consultation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filter?: string;
}

export default function ConsultantConsultations({ consultations, filter = 'all' }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: consultant.dashboard.url() },
        { title: 'Konsultasi', href: consultant.consultations.index.url() },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        response: '',
        status: '',
    });

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

    const handleRespond = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setData({ response: '', status: 'in_progress' });
        setIsRespondDialogOpen(true);
    };

    const handleSubmitResponse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConsultation) return;

        post(consultant.consultations.respond.url({ ticket: selectedConsultation.id }), {
            onSuccess: () => {
                setIsRespondDialogOpen(false);
                reset();
                setSelectedConsultation(null);
            },
        });
    };

    const handleUpdateStatus = (consultationId: number, newStatus: string) => {
        router.put(
            consultant.consultations.updateStatus.url({ ticket: consultationId }),
            { status: newStatus }
        );
    };

    const filteredConsultations = consultations.data.filter((c) => {
        const matchesSearch =
            c.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.dream_title.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'all') return matchesSearch;
        return matchesSearch && c.status === filter;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konsultasi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
                            Konsultasi
                        </h1>
                        <p className="text-base text-muted-foreground mt-2">
                            Kelola dan tanggapi konsultasi dari klien Anda
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan nomor tiket, nama, atau judul mimpi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue={filter} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all" asChild>
                            <Link href={consultant.consultations.index.url()} preserveScroll>
                                Semua
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="waiting" asChild>
                            <Link
                                href={consultant.consultations.index.url({ query: { filter: 'waiting' } })}
                                preserveScroll
                            >
                                Menunggu
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="in_progress" asChild>
                            <Link
                                href={consultant.consultations.index.url({ query: { filter: 'in_progress' } })}
                                preserveScroll
                            >
                                Dalam Proses
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="completed" asChild>
                            <Link
                                href={consultant.consultations.index.url({ query: { filter: 'completed' } })}
                                preserveScroll
                            >
                                Selesai
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="referred" asChild>
                            <Link
                                href={consultant.consultations.index.url({ query: { filter: 'referred' } })}
                                preserveScroll
                            >
                                Dirujuk
                            </Link>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="mt-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredConsultations.length > 0 ? (
                                filteredConsultations.map((consultation) => (
                                    <Card
                                        key={consultation.id}
                                        className="border-none shadow-sm hover:shadow-lg transition-all group"
                                    >
                                        <CardHeader className="bg-white space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Ticket className="size-4 text-primary" />
                                                    <span className="text-xs font-black text-neutral-900">
                                                        {consultation.ticket_number}
                                                    </span>
                                                </div>
                                                {getStatusBadge(consultation.status, consultation.status_label)}
                                            </div>
                                            <CardTitle className="text-base font-bold line-clamp-2">
                                                {consultation.dream_title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="bg-white space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">{consultation.user_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="size-3.5" />
                                                    <span className="text-xs">{consultation.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="size-3.5 text-muted-foreground" />
                                                    {getRiskBadge(consultation.risk_level)}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <Link
                                                        href={consultant.consultations.show.url({ ticket: consultation.id })}
                                                    >
                                                        Detail
                                                    </Link>
                                                </Button>
                                                {consultation.status === 'waiting' && (
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 gap-2"
                                                        onClick={() => handleRespond(consultation)}
                                                    >
                                                        <MessageSquare className="size-3.5" />
                                                        Respons
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <Ticket className="size-12 text-neutral-200 mb-4" />
                                    <p className="text-lg font-bold text-neutral-400">
                                        Belum ada konsultasi
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchQuery
                                            ? 'Tidak ada hasil yang cocok dengan pencarian'
                                            : 'Konsultasi akan muncul di sini'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Respond Dialog */}
            <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Respons Konsultasi</DialogTitle>
                        <DialogDescription>
                            {selectedConsultation?.ticket_number} - {selectedConsultation?.user_name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitResponse}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Judul Mimpi</Label>
                                <p className="text-sm font-bold">{selectedConsultation?.dream_title}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Deskripsi</Label>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {selectedConsultation?.dream_description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="response">Respons Anda *</Label>
                                <Textarea
                                    id="response"
                                    rows={6}
                                    placeholder="Tulis respons atau saran Anda untuk klien..."
                                    value={data.response}
                                    onChange={(e) => setData('response', e.target.value)}
                                />
                                {errors.response && (
                                    <p className="text-sm text-rose-600">{errors.response}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in_progress">Dalam Proses</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                        <SelectItem value="referred">Perlu Dirujuk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsRespondDialogOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Send className="size-4" />
                                {processing ? 'Mengirim...' : 'Kirim Respons'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
