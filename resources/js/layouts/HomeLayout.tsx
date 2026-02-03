import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/components/app/Navbar';
import Footer from '@/components/app/Footer';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { SharedData } from '@/types';

interface Props {
    children: React.ReactNode;
    logo?: string | null;
    canRegister?: boolean;
    title?: string;
}

export default function HomeLayout({ children, logo, title }: Props) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success as string);
        }
        if (flash.error) {
            toast.error(flash.error as string);
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-[#F6FAFE] font-sans selection:bg-primary/30 text-[#1A1A1A]">
            <Head title={title ? `${title} - IRTIQA` : 'IRTIQA - Pendampingan Psiko-Spiritual Islami'} />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster position="top-center" richColors />
        </div>
    );
}
