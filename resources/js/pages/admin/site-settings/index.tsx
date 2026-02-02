import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Info, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import FileInput from '@/components/file-input';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    // WhatsApp Settings
    whatsapp_number: string;
    whatsapp_api_key: string;
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
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        twitter_url: settings.twitter_url || '',
        tiktok_url: settings.tiktok_url || '',
        // Email/SMTP Settings
        mail_from_name: settings.mail_from_name || '',
        mail_from_address: settings.mail_from_address || '',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_api_key: settings.mail_api_key || '',
        // WhatsApp Settings
        whatsapp_number: settings.whatsapp_number || '',
        whatsapp_api_key: settings.whatsapp_api_key || '',
        // Duitku Payment Settings
        duitku_merchant_code: settings.duitku_merchant_code || '',
        duitku_api_key: settings.duitku_api_key || '',
        duitku_environment: settings.duitku_environment || 'sandbox',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/site-settings', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Pengaturan berhasil disimpan');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan');
            },
        });
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
                                    <CardTitle>Informasi Email</CardTitle>
                                    <CardDescription>
                                        Masukkan detail email pengirim dan kredensial
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_name">Nama Pengirim</Label>
                                            <Input
                                                id="mail_from_name"
                                                value={data.mail_from_name}
                                                onChange={(e) => setData('mail_from_name', e.target.value)}
                                                placeholder="IRTIQA"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Nama yang muncul sebagai pengirim email
                                            </p>
                                            <InputError message={errors.mail_from_name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_address">Email Pengirim</Label>
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mail_username">Username</Label>
                                        <Input
                                            id="mail_username"
                                            value={data.mail_username}
                                            onChange={(e) => setData('mail_username', e.target.value)}
                                            placeholder="Masukkan username email"
                                            className="font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Username untuk SMTP atau layanan email
                                        </p>
                                        <InputError message={errors.mail_username} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mail_password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="mail_password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.mail_password}
                                                onChange={(e) => setData('mail_password', e.target.value)}
                                                placeholder="Masukkan password email"
                                                className="pr-10 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Password untuk autentikasi email
                                        </p>
                                        <InputError message={errors.mail_password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mail_api_key">API Key (Opsional)</Label>
                                        <div className="relative">
                                            <Input
                                                id="mail_api_key"
                                                type={showApiKey ? 'text' : 'password'}
                                                value={data.mail_api_key}
                                                onChange={(e) => setData('mail_api_key', e.target.value)}
                                                placeholder="Masukkan API Key jika menggunakan layanan API"
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
                                            Untuk layanan seperti SendGrid, Mailgun, Postmark, dll.
                                        </p>
                                        <InputError message={errors.mail_api_key} />
                                    </div>
                                </CardContent>
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
                                    <CardTitle>Informasi WhatsApp</CardTitle>
                                    <CardDescription>
                                        Masukkan nomor telepon dan API key untuk layanan WhatsApp
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
                                        <Input
                                            id="whatsapp_number"
                                            value={data.whatsapp_number}
                                            onChange={(e) => setData('whatsapp_number', e.target.value)}
                                            placeholder="+62812345678900"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Format: +62 diikuti nomor telepon tanpa spasi
                                        </p>
                                        <InputError message={errors.whatsapp_number} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_api_key">API Key WhatsApp</Label>
                                        <div className="relative">
                                            <Input
                                                id="whatsapp_api_key"
                                                type={showWhatsAppApiKey ? 'text' : 'password'}
                                                value={data.whatsapp_api_key}
                                                onChange={(e) => setData('whatsapp_api_key', e.target.value)}
                                                placeholder="Masukkan API Key WhatsApp"
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
                                            API Key dari layanan WhatsApp Business API (Fonnte, Wablas, dll.)
                                        </p>
                                        <InputError message={errors.whatsapp_api_key} />
                                    </div>
                                </CardContent>
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
            </div>
        </AppLayout>
    );
}
