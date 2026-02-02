import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { siteSettings } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="transition-transform hover:scale-105"
                        >
                            {siteSettings.logo ? (
                                <img
                                    src={siteSettings.logo}
                                    alt={siteSettings.app_name}
                                    className="h-24 w-auto object-contain"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                                    <AppLogoIcon className="size-14 fill-current text-primary" />
                                </div>
                            )}
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="rounded-xl border bg-card p-8 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Pattern */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative z-10 max-w-lg space-y-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight">
                            Selamat Datang di {siteSettings.app_name}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Platform konsultasi islami terpercaya untuk membantu Anda dalam perjalanan spiritual dan kehidupan sehari-hari.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid gap-4 text-left">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Konsultan Berpengalaman</h3>
                                <p className="text-sm text-muted-foreground">
                                    Tim konsultan islami yang berpengalaman dan terpercaya
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Privasi Terjaga</h3>
                                <p className="text-sm text-muted-foreground">
                                    Konsultasi Anda dijamin kerahasiaannya
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Fleksibel & Mudah</h3>
                                <p className="text-sm text-muted-foreground">
                                    Akses kapan saja, di mana saja sesuai kebutuhan Anda
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
