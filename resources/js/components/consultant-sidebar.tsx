import { Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    ClipboardList,
    DollarSign,
    LayoutGrid,
    MessageSquare,
    User,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import consultant from '@/routes/consultant';
import { type NavItem, type SharedData } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: consultant.dashboard.url(),
        icon: LayoutGrid,
    },
];

const consultationNavItems: NavItem[] = [
    {
        title: 'Jadwal & Ketersediaan',
        href: consultant.schedule.index.url(),
        icon: Calendar,
    },
    {
        title: 'Konsultasi',
        href: consultant.consultations.index.url(),
        icon: MessageSquare,
    },
];

const earningsNavItems: NavItem[] = [
    {
        title: 'Pendapatan & Penarikan',
        href: consultant.earnings.index.url(),
        icon: DollarSign,
    },
];

const applicationNavItems: NavItem[] = [
    {
        title: 'Aplikasi Konsultan',
        href: '/consultant/application',
        icon: ClipboardList,
    },
];

const profileNavItems: NavItem[] = [
    {
        title: 'Profil & Spesialisasi',
        href: consultant.profile.edit.url(),
        icon: User,
    },
];

export function ConsultantSidebar() {
    const { siteSettings } = usePage<SharedData>().props;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-border/50"
        >
            <SidebarHeader className="border-b border-border/50 from-primary/5 via-transparent to-transparent">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="group">
                            <Link
                                href={consultant.dashboard.url()}
                                prefetch
                                className="flex items-center justify-center"
                            >
                                {siteSettings?.logo ? (
                                    <img
                                        src={siteSettings.logo}
                                        alt={siteSettings.app_name || 'Logo'}
                                        className="h-14 w-auto object-contain"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                                        <span className="text-xl font-bold text-primary-foreground">
                                            {siteSettings?.app_name?.charAt(0) || 'I'}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4 gap-4">
                <NavMain items={mainNavItems} label="Utama" />

                <NavMain items={consultationNavItems} label="Konsultasi" />

                <NavMain items={earningsNavItems} label="Keuangan" />

                <NavMain items={applicationNavItems} label="Pendaftaran" />

                <NavMain items={profileNavItems} label="Profil" />
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 from-primary/5 via-transparent to-transparent">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
