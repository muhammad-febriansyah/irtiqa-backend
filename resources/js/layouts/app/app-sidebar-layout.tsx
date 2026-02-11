import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { ConsultantSidebar } from '@/components/consultant-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem, type SharedData } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth } = usePage<SharedData>().props;

    // Determine which sidebar to show based on user role
    const isConsultant = auth?.user?.roles?.some((role: { name: string }) => role.name === 'consultant');

    return (
        <AppShell variant="sidebar">
            {isConsultant ? <ConsultantSidebar /> : <AppSidebar />}
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
