import { Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    ClipboardList,
    CreditCard,
    FolderTree,
    Globe,
    HelpCircle,
    Image,
    LayoutGrid,
    Mail,
    MessageSquare,
    Moon,
    Package,
    Settings,
    Ticket,
    UserCheck,
    Users,
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
import admin from '@/routes/admin';
import { type NavItem, type SharedData } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dasbor',
        href: admin.dashboard.url(),
        icon: LayoutGrid,
    },
];

const serviceNavItems: NavItem[] = [
    {
        title: 'Tiket Pendampingan',
        href: '/admin/tickets',
        icon: Ticket,
    },
    {
        title: 'Laporan Mimpi',
        href: '/admin/dreams',
        icon: Moon,
    },
    {
        title: 'Transaksi',
        href: '/admin/transactions',
        icon: CreditCard,
    },
];

const personnelNavItems: NavItem[] = [
    {
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Konsultan',
        href: '/admin/consultants',
        icon: Users,
    },
    {
        title: 'Aplikasi Konsultan',
        href: '/admin/consultant-applications',
        icon: ClipboardList,
    },
    {
        title: 'Praktisi Rujukan',
        href: '/admin/practitioners',
        icon: UserCheck,
    },
];

const contentNavItems: NavItem[] = [
    {
        title: 'Konten Edukasi',
        href: '/admin/educational-contents',
        icon: BookOpenText,
    },
    {
        title: 'FAQ',
        href: '/admin/faqs',
        icon: HelpCircle,
    },
    {
        title: 'Pesan Kontak',
        href: '/admin/contact-messages',
        icon: Mail,
    },
    {
        title: 'Banner',
        href: '/admin/banners',
        icon: Image,
    },
    {
        title: 'Slider',
        href: '/admin/sliders',
        icon: Image,
    },
    {
        title: 'Tentang Kami',
        href: '/admin/about-us',
        icon: BookOpenText,
    },
    {
        title: 'Syarat & Ketentuan',
        href: '/admin/legal/terms-and-conditions',
        icon: ClipboardList,
    },
    {
        title: 'Kebijakan Privasi',
        href: '/admin/legal/privacy-policy',
        icon: UserCheck,
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Paket',
        href: '/admin/packages',
        icon: Package,
    },
    {
        title: 'Kategori Konsultasi',
        href: '/admin/consultation-categories',
        icon: FolderTree,
    },
    {
        title: 'Pertanyaan Screening',
        href: '/admin/screening-questions',
        icon: ClipboardList,
    },
    {
        title: 'Template Pesan',
        href: '/admin/message-templates',
        icon: MessageSquare,
    },
];

const settingNavItems: NavItem[] = [
    {
        title: 'Pengaturan Situs',
        href: '/admin/site-settings',
        icon: Globe,
    },
];

export function AppSidebar() {
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
                                href={admin.dashboard.url()}
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
                                            {siteSettings?.app_name?.charAt(
                                                0,
                                            ) || 'I'}
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

                <NavMain items={serviceNavItems} label="Layanan & Operasional" />

                <NavMain items={personnelNavItems} label="Manajemen Personil" />

                <NavMain items={contentNavItems} label="Konten & Publik" />

                <NavMain items={masterNavItems} label="Master Data" />

                <NavMain items={settingNavItems} label="Pengaturan" />
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 from-primary/5 via-transparent to-transparent">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
