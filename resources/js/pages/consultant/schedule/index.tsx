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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import consultant from '@/routes/consultant';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Edit,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Schedule {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface Props {
    schedules: Schedule[];
}

const DAYS = [
    { value: 'sunday', label: 'Minggu', numValue: 0 },
    { value: 'monday', label: 'Senin', numValue: 1 },
    { value: 'tuesday', label: 'Selasa', numValue: 2 },
    { value: 'wednesday', label: 'Rabu', numValue: 3 },
    { value: 'thursday', label: 'Kamis', numValue: 4 },
    { value: 'friday', label: 'Jumat', numValue: 5 },
    { value: 'saturday', label: 'Sabtu', numValue: 6 },
];

export default function ConsultantSchedule({ schedules }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: consultant.dashboard.url() },
        { title: 'Jadwal', href: consultant.schedule.index.url() },
    ];

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        day_of_week: '',
        start_time: '',
        end_time: '',
        is_available: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSchedule) {
            put(consultant.schedule.update.url({ id: editingSchedule.id }), {
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        } else {
            post(consultant.schedule.store.url(), {
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setData({
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            is_available: schedule.is_available,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
            router.delete(consultant.schedule.destroy.url({ id }));
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingSchedule(null);
        reset();
    };

    const getDayLabel = (dayOfWeek: string) => {
        return DAYS.find((d) => d.value === dayOfWeek)?.label || '';
    };

    const groupedSchedules = DAYS.map((day) => ({
        ...day,
        schedules: schedules.filter((s) => s.day_of_week === day.value),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jadwal & Ketersediaan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
                            Jadwal & Ketersediaan
                        </h1>
                        <p className="text-base text-muted-foreground mt-2">
                            Atur jadwal ketersediaan Anda untuk konsultasi
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="size-4" />
                        Tambah Jadwal
                    </Button>
                </div>

                {/* Schedule Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    {groupedSchedules.map((day) => (
                        <Card key={day.value} className="border-none shadow-sm">
                            <CardHeader className="bg-white pb-4">
                                <CardTitle className="flex items-center gap-3 text-base font-bold">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Calendar className="size-4" />
                                    </div>
                                    {day.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="bg-white space-y-2">
                                {day.schedules.length > 0 ? (
                                    day.schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="group p-3 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Clock className="size-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-bold text-neutral-700">
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleEdit(schedule)}
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDelete(schedule.id)}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'text-[10px] font-bold',
                                                        schedule.is_available
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20'
                                                    )}
                                                >
                                                    {schedule.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        Belum ada jadwal
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
                        </DialogTitle>
                        <DialogDescription>
                            Atur waktu ketersediaan Anda untuk konsultasi
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="day_of_week">Hari</Label>
                                <Select
                                    value={data.day_of_week}
                                    onValueChange={(value) => setData('day_of_week', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih hari" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS.map((day) => (
                                            <SelectItem key={day.value} value={day.value}>
                                                {day.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.day_of_week && (
                                    <p className="text-sm text-rose-600">{errors.day_of_week}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    {errors.start_time && (
                                        <p className="text-sm text-rose-600">{errors.start_time}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    {errors.end_time && (
                                        <p className="text-sm text-rose-600">{errors.end_time}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_available">Status</Label>
                                <Select
                                    value={data.is_available ? '1' : '0'}
                                    onValueChange={(value) => setData('is_available', value === '1')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Tersedia</SelectItem>
                                        <SelectItem value="0">Tidak Tersedia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
