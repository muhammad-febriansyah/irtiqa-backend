import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const page = usePage();

    // Handle flash messages
    useEffect(() => {
        const flash = page.props.flash as any;
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [page.props.flash]);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <Toaster position="top-right" richColors />
                {children}
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={isOpen}>
            <Toaster position="top-right" richColors />
            {children}
        </SidebarProvider>
    );
}
