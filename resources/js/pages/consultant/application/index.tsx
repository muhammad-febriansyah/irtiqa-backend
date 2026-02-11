import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import ApplicationForm from './components/ApplicationForm';
import ApplicationStatus from './components/ApplicationStatus';
import { Loader2 } from 'lucide-react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/consultant/dashboard' },
    { title: 'Aplikasi Konsultan', href: '/consultant/application' },
];

export default function ConsultantApplicationIndex() {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<ConsultantApplication[]>([]);
    const [latestApplication, setLatestApplication] = useState<ConsultantApplication | null>(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            // Use web route instead of API route for session auth
            const response = await fetch('/consultant/application/data', {
                method: 'GET',
                headers,
                credentials: 'same-origin', // Important: include cookies
            });

            console.log('API Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);

            if (data.success) {
                const apps = data.data || [];
                setApplications(apps);
                if (apps.length > 0) {
                    setLatestApplication(apps[0]);
                } else {
                    setLatestApplication(null);
                }
            } else {
                console.error('API returned success: false', data);
                toast.error(data.message || 'Gagal memuat data aplikasi');
            }
        } catch (error: any) {
            console.error('Error fetching applications:', error);

            // More specific error messages
            if (error.message.includes('401')) {
                toast.error('Anda harus login terlebih dahulu');
            } else if (error.message.includes('403')) {
                toast.error('Anda tidak memiliki akses ke halaman ini');
            } else if (error.message.includes('419')) {
                toast.error('Session expired. Silakan refresh halaman');
            } else {
                toast.error('Gagal memuat data aplikasi. Silakan refresh halaman.');
            }

            // Set empty state on error so form shows
            setApplications([]);
            setLatestApplication(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApplicationSuccess = () => {
        toast.success('Aplikasi konsultan berhasil diajukan!');
        fetchApplications();
    };

    // Show form if:
    // 1. No applications yet
    // 2. Latest application is rejected (allow reapply)
    const showForm = !latestApplication || latestApplication.status === 'rejected';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aplikasi Konsultan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
                            Aplikasi Konsultan
                        </h1>
                        <p className="text-base text-muted-foreground mt-2">
                            {showForm
                                ? 'Daftar sebagai konsultan IRTIQA dan mulai membantu pengguna'
                                : 'Status aplikasi konsultan Anda'
                            }
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <Loader2 className="size-8 animate-spin text-primary" />
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {showForm ? (
                            <ApplicationForm onSuccess={handleApplicationSuccess} />
                        ) : (
                            <ApplicationStatus
                                application={latestApplication!}
                                onReapply={fetchApplications}
                            />
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
