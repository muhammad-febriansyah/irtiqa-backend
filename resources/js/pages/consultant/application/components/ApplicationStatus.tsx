import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    Calendar,
    User,
    MapPin,
    Award,
    Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsultantApplication {
    id: number;
    full_name: string;
    phone: string;
    province: string;
    city: string;
    certification_type: string;
    certification_number: string | null;
    certification_file: string | null;
    experience_years: number;
    bio: string;
    specializations: string | null;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by_admin_id: number | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    application: ConsultantApplication;
    onReapply: () => void;
}

const certificationTypeLabels: Record<string, string> = {
    psikolog: 'Psikolog',
    konselor: 'Konselor',
    kyai: 'Kyai/Ustadz',
    therapist: 'Therapist',
    other: 'Lainnya',
};

export default function ApplicationStatus({ application, onReapply }: Props) {
    const getStatusConfig = () => {
        switch (application.status) {
            case 'pending':
                return {
                    icon: Clock,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    label: 'Sedang Diproses',
                    description: 'Aplikasi Anda sedang ditinjau oleh tim kami. Proses review biasanya memakan waktu 3-5 hari kerja.',
                };
            case 'approved':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    label: 'Disetujui',
                    description: 'Selamat! Aplikasi Anda telah disetujui. Anda sekarang adalah konsultan IRTIQA.',
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    label: 'Ditolak',
                    description: 'Mohon maaf, aplikasi Anda tidak dapat disetujui saat ini.',
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <Card className={cn('border-2', statusConfig.borderColor)}>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={cn('p-3 rounded-full', statusConfig.bgColor)}>
                            <StatusIcon className={cn('size-8', statusConfig.color)} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">
                                Status: {statusConfig.label}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {statusConfig.description}
                            </p>

                            {application.status === 'rejected' && application.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-semibold text-red-900 mb-1">
                                        Alasan Penolakan:
                                    </p>
                                    <p className="text-sm text-red-700">
                                        {application.rejection_reason}
                                    </p>
                                </div>
                            )}

                            {application.admin_notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                        Catatan Admin:
                                    </p>
                                    <p className="text-sm text-blue-700 whitespace-pre-wrap">
                                        {application.admin_notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    <span>Diajukan: {new Date(application.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}</span>
                                </div>
                                {application.reviewed_at && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="size-4" />
                                        <span>Ditinjau: {new Date(application.reviewed_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}</span>
                                    </div>
                                )}
                            </div>

                            {application.status === 'rejected' && (
                                <div className="mt-4">
                                    <Button onClick={onReapply} variant="outline">
                                        Ajukan Aplikasi Baru
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Detail Aplikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Informasi Pribadi
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <User className="size-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                                    <p className="font-medium">{application.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="size-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-xs text-muted-foreground">Lokasi</Label>
                                    <p className="font-medium">{application.city}, {application.province}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Certification Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Informasi Sertifikasi
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <Award className="size-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-xs text-muted-foreground">Tipe Sertifikasi</Label>
                                    <p className="font-medium">
                                        {certificationTypeLabels[application.certification_type] || application.certification_type}
                                    </p>
                                </div>
                            </div>
                            {application.certification_number && (
                                <div className="flex items-start gap-3">
                                    <FileText className="size-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Nomor Sertifikat</Label>
                                        <p className="font-medium">{application.certification_number}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Briefcase className="size-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-xs text-muted-foreground">Pengalaman</Label>
                                    <p className="font-medium">{application.experience_years} Tahun</p>
                                </div>
                            </div>
                            {application.certification_file && (
                                <div className="flex items-start gap-3">
                                    <FileText className="size-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <Label className="text-xs text-muted-foreground">File Sertifikat</Label>
                                        <a
                                            href={`/storage/${application.certification_file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline font-medium flex items-center gap-1"
                                        >
                                            Lihat File
                                            <FileText className="size-3" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Informasi Profesional
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">Bio</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                                    {application.bio}
                                </p>
                            </div>
                            {application.specializations && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Spesialisasi</Label>
                                    <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                                        {application.specializations}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
