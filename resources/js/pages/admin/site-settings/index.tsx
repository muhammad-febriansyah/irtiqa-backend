import { Head, useForm, router } from '@inertiajs/react';
import { Eye, EyeOff, Info, Save, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import FileInput from '@/components/file-input';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface SiteSettings {
    app_name: string;
    tagline: string;
    description: string;
    logo: string | null;
    favicon: string | null;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    contact_hours: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    tiktok_url: string;
    // Email/SMTP Settings
    mail_from_name: string;
    mail_from_address: string;
    mail_username: string;
    mail_password: string;
    mail_api_key: string;
    // WhatsApp Settings (NotifWaBiz)
    whatsapp_api_key: string;
    whatsapp_sender: string;
    // Duitku Payment Settings
    duitku_merchant_code: string;
    duitku_api_key: string;
    duitku_environment: string;
}

interface Props {
    settings: SiteSettings;
}

export default function SiteSettingsIndex({ settings }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [showWhatsAppApiKey, setShowWhatsAppApiKey] = useState(false);
    const [showDuitkuApiKey, setShowDuitkuApiKey] = useState(false);

    // Test modal states
    const [showEmailTestModal, setShowEmailTestModal] = useState(false);
    const [showWhatsAppTestModal, setShowWhatsAppTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || '',
        tagline: settings.tagline || '',
        description: settings.description || '',
        logo: null as File | null,
        favicon: null as File | null,
        seo_title: settings.seo_title || '',
        seo_description: settings.seo_description || '',
        seo_keywords: settings.seo_keywords || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        contact_hours: settings.contact_hours || '',
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        twitter_url: settings.twitter_url || '',
        tiktok_url: settings.tiktok_url || '',
        // Email/SMTP Settings
        mail_from_name: settings.mail_from_name || '',
        mail_from_address: settings.mail_from_address || '',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_api_key: settings.mail_api_key || '0e0308f58826a968bcb2cf9007135815',
        // WhatsApp Settings (NotifWaBiz)
        whatsapp_api_key: settings.whatsapp_api_key || '',
        whatsapp_sender: settings.whatsapp_sender || '',
        // Duitku Payment Settings
        duitku_merchant_code: settings.duitku_merchant_code || '',
        duitku_api_key: settings.duitku_api_key || '',
        duitku_environment: settings.duitku_environment || 'sandbox',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/site-settings', {
            forceFormData: true,
        });
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Silakan masukkan email tujuan');
            return;
        }

        setIsTesting(true);

        try {
            const response = await fetch('/admin/site-settings/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    test_email: testEmail,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Email test failed:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setShowEmailTestModal(false);
                setTestEmail('');
            } else {
                console.error('Email test error:', result);
                toast.error(result.message || 'Gagal mengirim email test');
            }
        } catch (error) {
            console.error('Email test exception:', error);
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim email test';
            toast.error(errorMessage);
        } finally {
            setIsTesting(false);
        }
    };

    const handleTestWhatsApp = async () => {
        if (!testPhone) {
            toast.error('Silakan masukkan nomor WhatsApp tujuan');
            return;
        }

        setIsTesting(true);

        try {
            const response = await fetch('/admin/site-settings/test-whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    test_phone: testPhone,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('WhatsApp test failed:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setShowWhatsAppTestModal(false);
                setTestPhone('');
            } else {
                console.error('WhatsApp test error:', result);
                toast.error(result.message || 'Gagal mengirim pesan WhatsApp test');
            }
        } catch (error) {
            console.error('WhatsApp test exception:', error);
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim pesan WhatsApp';
            toast.error(errorMessage);
        } finally {
            setIsTesting(false);
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Pengaturan Situs', href: '/admin/site-settings' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Situs" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    title="Pengaturan Situs"
                    description="Kelola informasi website, logo, SEO, kontak, email, WhatsApp, dan pembayaran"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="website" className="w-full">
                        <TabsList className="grid w-full grid-cols-7">
                            <TabsTrigger value="website">Website</TabsTrigger>
                            <TabsTrigger value="seo">SEO</TabsTrigger>
                            <TabsTrigger value="contact">Kontak</TabsTrigger>
                            <TabsTrigger value="social">Sosial Media</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                            <TabsTrigger value="payment">Pembayaran</TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Informasi Website */}
                        <TabsContent value="website" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Website</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="app_name">
                                            Nama Website
                                            <span className="text-destructive ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="app_name"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            placeholder="Masukkan nama website"
                                            required
                                        />
                                        <InputError message={errors.app_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline</Label>
                                        <Input
                                            id="tagline"
                                            value={data.tagline}
                                            onChange={(e) => setData('tagline', e.target.value)}
                                            placeholder="Masukkan tagline website"
                                        />
                                        <InputError message={errors.tagline} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Masukkan deskripsi website"
                                            rows={4}
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Logo & Favicon</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FileInput
                                        label="Logo"
                                        value={data.logo}
                                        currentFileUrl={settings.logo}
                                        accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                                        onChange={(file) => setData('logo', file)}
                                        error={errors.logo}
                                        helpText="Format: JPEG, PNG, JPG, SVG. Maksimal 2MB. Rekomendasi: 200x60px"
                                    />

                                    <FileInput
                                        label="Favicon"
                                        value={data.favicon}
                                        currentFileUrl={settings.favicon}
                                        accept=".ico,image/png,image/x-icon"
                                        onChange={(file) => setData('favicon', file)}
                                        error={errors.favicon}
                                        helpText="Format: ICO, PNG. Maksimal 2MB. Rekomendasi: 32x32px atau lebih"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 2: SEO */}
                        <TabsContent value="seo" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Meta Tags</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="seo_title">SEO Title</Label>
                                        <Input
                                            id="seo_title"
                                            value={data.seo_title}
                                            onChange={(e) => setData('seo_title', e.target.value)}
                                            placeholder="Masukkan SEO title"
                                        />
                                        <InputError message={errors.seo_title} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="seo_description">SEO Description</Label>
                                        <Textarea
                                            id="seo_description"
                                            value={data.seo_description}
                                            onChange={(e) => setData('seo_description', e.target.value)}
                                            placeholder="Masukkan SEO description"
                                            rows={3}
                                        />
                                        <InputError message={errors.seo_description} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="seo_keywords">SEO Keywords</Label>
                                        <Input
                                            id="seo_keywords"
                                            value={data.seo_keywords}
                                            onChange={(e) => setData('seo_keywords', e.target.value)}
                                            placeholder="Masukkan keywords (pisahkan dengan koma)"
                                        />
                                        <InputError message={errors.seo_keywords} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 3: Kontak */}
                        <TabsContent value="contact" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kontak</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Email</Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            placeholder="email@example.com"
                                        />
                                        <InputError message={errors.contact_email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">Telepon</Label>
                                        <Input
                                            id="contact_phone"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            placeholder="+62 812 3456 7890"
                                        />
                                        <InputError message={errors.contact_phone} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_address">Alamat</Label>
                                        <Textarea
                                            id="contact_address"
                                            value={data.contact_address}
                                            onChange={(e) => setData('contact_address', e.target.value)}
                                            placeholder="Masukkan alamat lengkap"
                                            rows={3}
                                        />
                                        <InputError message={errors.contact_address} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_hours">Jam Operasional</Label>
                                        <Input
                                            id="contact_hours"
                                            value={data.contact_hours}
                                            onChange={(e) => setData('contact_hours', e.target.value)}
                                            placeholder="Senin - Jumat | 09:00 - 17:00 WIB"
                                        />
                                        <InputError message={errors.contact_hours} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 4: Media Sosial */}
                        <TabsContent value="social" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Media Sosial</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook_url">Facebook</Label>
                                        <Input
                                            id="facebook_url"
                                            type="url"
                                            value={data.facebook_url}
                                            onChange={(e) => setData('facebook_url', e.target.value)}
                                            placeholder="https://facebook.com/username"
                                        />
                                        <InputError message={errors.facebook_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instagram_url">Instagram</Label>
                                        <Input
                                            id="instagram_url"
                                            type="url"
                                            value={data.instagram_url}
                                            onChange={(e) => setData('instagram_url', e.target.value)}
                                            placeholder="https://instagram.com/username"
                                        />
                                        <InputError message={errors.instagram_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="twitter_url">Twitter</Label>
                                        <Input
                                            id="twitter_url"
                                            type="url"
                                            value={data.twitter_url}
                                            onChange={(e) => setData('twitter_url', e.target.value)}
                                            placeholder="https://twitter.com/username"
                                        />
                                        <InputError message={errors.twitter_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tiktok_url">TikTok</Label>
                                        <Input
                                            id="tiktok_url"
                                            type="url"
                                            value={data.tiktok_url}
                                            onChange={(e) => setData('tiktok_url', e.target.value)}
                                            placeholder="https://tiktok.com/@username"
                                        />
                                        <InputError message={errors.tiktok_url} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 5: Email */}
                        <TabsContent value="email" className="space-y-6">
                            {/* Info Banner */}
                            <div className="rounded-lg bg-primary p-4">
                                <div className="flex gap-3">
                                    <Info className="size-5 text-primary-foreground shrink-0 mt-0.5" />
                                    <div className="text-sm text-primary-foreground">
                                        <p className="font-medium">Pengaturan Email</p>
                                        <p className="mt-1 text-primary-foreground/90">
                                            Konfigurasi email untuk mengirim notifikasi dan email sistem kepada pengguna.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Email (Mailketing)</CardTitle>
                                    <CardDescription>
                                        Masukkan detail email pengirim dan token Mailketing
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mail_from_address">Nama Email</Label>
                                        <Input
                                            id="mail_from_address"
                                            type="email"
                                            value={data.mail_from_address}
                                            onChange={(e) => setData('mail_from_address', e.target.value)}
                                            placeholder="noreply@irtiqa.com"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Alamat email yang digunakan sebagai pengirim
                                        </p>
                                        <InputError message={errors.mail_from_address} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mail_api_key">Token</Label>
                                        <div className="relative">
                                            <Input
                                                id="mail_api_key"
                                                type={showApiKey ? 'text' : 'password'}
                                                value={data.mail_api_key}
                                                onChange={(e) => setData('mail_api_key', e.target.value)}
                                                placeholder="Masukkan Token Mailketing"
                                                className="pr-10 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Token API dari layanan Mailketing
                                        </p>
                                        <InputError message={errors.mail_api_key} />
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowEmailTestModal(true)}
                                        className="gap-2"
                                    >
                                        <Send className="size-4" />
                                        Test Email
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Tab 6: WhatsApp */}
                        <TabsContent value="whatsapp" className="space-y-6">
                            {/* Info Banner */}
                            <div className="rounded-lg bg-primary p-4">
                                <div className="flex gap-3">
                                    <Info className="size-5 text-primary-foreground shrink-0 mt-0.5" />
                                    <div className="text-sm text-primary-foreground">
                                        <p className="font-medium">Pengaturan WhatsApp</p>
                                        <p className="mt-1 text-primary-foreground/90">
                                            Konfigurasi WhatsApp untuk mengirim notifikasi dan pesan kepada pengguna.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi WhatsApp (NotifWaBiz)</CardTitle>
                                    <CardDescription>
                                        Masukkan API key dan nomor pengirim dari NotifWaBiz (m2.notifwabiz.my.id)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_api_key">API Key WhatsApp</Label>
                                        <div className="relative">
                                            <Input
                                                id="whatsapp_api_key"
                                                type={showWhatsAppApiKey ? 'text' : 'password'}
                                                value={data.whatsapp_api_key}
                                                onChange={(e) => setData('whatsapp_api_key', e.target.value)}
                                                placeholder="Masukkan API Key dari NotifWaBiz"
                                                className="pr-10 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowWhatsAppApiKey(!showWhatsAppApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showWhatsAppApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            API Key dari dashboard NotifWaBiz Anda
                                        </p>
                                        <InputError message={errors.whatsapp_api_key} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_sender">Nomor Pengirim (Sender)</Label>
                                        <Input
                                            id="whatsapp_sender"
                                            value={data.whatsapp_sender}
                                            onChange={(e) => setData('whatsapp_sender', e.target.value)}
                                            placeholder="62812345678900"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Nomor WhatsApp yang terdaftar di NotifWaBiz (format: 628xxx tanpa +)
                                        </p>
                                        <InputError message={errors.whatsapp_sender} />
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowWhatsAppTestModal(true)}
                                        className="gap-2"
                                    >
                                        <Send className="size-4" />
                                        Test WhatsApp
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        {/* Tab 7: Pembayaran (Duitku) */}
                        <TabsContent value="payment" className="space-y-6">
                            {/* Info Banner */}
                            <div className="rounded-lg bg-primary p-4">
                                <div className="flex gap-3">
                                    <Info className="size-5 text-primary-foreground shrink-0 mt-0.5" />
                                    <div className="text-sm text-primary-foreground">
                                        <p className="font-medium">Pengaturan Pembayaran (Duitku)</p>
                                        <p className="mt-1 text-primary-foreground/90">
                                            Konfigurasi Duitku Payment Gateway untuk menerima pembayaran dari pengguna.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Duitku</CardTitle>
                                    <CardDescription>
                                        Masukkan Merchant Code dan API Key dari dashboard Duitku
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duitku_merchant_code">Merchant Code</Label>
                                        <Input
                                            id="duitku_merchant_code"
                                            value={data.duitku_merchant_code}
                                            onChange={(e) => setData('duitku_merchant_code', e.target.value)}
                                            placeholder="Masukkan Duitku Merchant Code"
                                        />
                                        <InputError message={errors.duitku_merchant_code} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duitku_api_key">API Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="duitku_api_key"
                                                type={showDuitkuApiKey ? 'text' : 'password'}
                                                value={data.duitku_api_key}
                                                onChange={(e) => setData('duitku_api_key', e.target.value)}
                                                placeholder="Masukkan Duitku API Key"
                                                className="pr-10 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowDuitkuApiKey(!showDuitkuApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showDuitkuApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.duitku_api_key} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duitku_environment">Environment</Label>
                                        <select
                                            id="duitku_environment"
                                            value={data.duitku_environment}
                                            onChange={(e) => setData('duitku_environment', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="sandbox">Sandbox (Testing)</option>
                                            <option value="production">Production (Live)</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            Gunakan Sandbox untuk simulasi pembayaran dan Production untuk transaksi asli.
                                        </p>
                                        <InputError message={errors.duitku_environment} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Submit Button */}
                    <div className="flex justify-end pb-6">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="min-w-[200px]"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    Simpan Pengaturan
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Email Test Modal */}
                <Dialog open={showEmailTestModal} onOpenChange={setShowEmailTestModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Test Email</DialogTitle>
                            <DialogDescription>
                                Kirim email test untuk memastikan konfigurasi email sudah benar
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="test_email">Email Tujuan</Label>
                                <Input
                                    id="test_email"
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="test@example.com"
                                    onKeyDown={(e) => e.key === 'Enter' && handleTestEmail()}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Masukkan email yang ingin menerima pesan test
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEmailTestModal(false)}
                                disabled={isTesting}
                            >
                                Batal
                            </Button>
                            <Button type="button" onClick={handleTestEmail} disabled={isTesting}>
                                {isTesting ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 size-4" />
                                        Kirim Test Email
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* WhatsApp Test Modal */}
                <Dialog open={showWhatsAppTestModal} onOpenChange={setShowWhatsAppTestModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Test WhatsApp</DialogTitle>
                            <DialogDescription>
                                Kirim pesan WhatsApp test untuk memastikan konfigurasi WhatsApp gateway sudah benar
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="test_phone">Nomor WhatsApp Tujuan</Label>
                                <Input
                                    id="test_phone"
                                    type="text"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    placeholder="628123456789"
                                    onKeyDown={(e) => e.key === 'Enter' && handleTestWhatsApp()}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: 628xxx tanpa tanda + atau spasi
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowWhatsAppTestModal(false)}
                                disabled={isTesting}
                            >
                                Batal
                            </Button>
                            <Button type="button" onClick={handleTestWhatsApp} disabled={isTesting}>
                                {isTesting ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 size-4" />
                                        Kirim Test WhatsApp
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
