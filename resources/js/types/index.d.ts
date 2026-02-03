import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SiteSettings {
    app_name: string;
    tagline: string;
    logo: string | null;
    favicon: string | null;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    contact_hours: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    tiktok_url: string;
    recaptcha_site_key: string | null;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    siteSettings: SiteSettings;
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
