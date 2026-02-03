import { Link, usePage } from '@inertiajs/react';
import {
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    MapPin,
    Mail,
    Phone,
    ArrowRight,
    MessageCircle
} from 'lucide-react';
import { SharedData } from '@/types';

export default function Footer() {
    const { siteSettings } = usePage<SharedData>().props;

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#f8fafc] border-t border-neutral-200">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Column 1: Brand & Description */}
                    <div className="space-y-6">
                        {siteSettings.logo ? (
                            <Link href="/">
                                <img src={siteSettings.logo} alt={siteSettings.app_name} className="h-16 w-auto object-contain" />
                            </Link>
                        ) : (
                            <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
                                {siteSettings.app_name}
                            </Link>
                        )}
                        <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                            {siteSettings.tagline || 'Platform pendampingan psiko-spiritual Islami yang aman, beradab, dan bertanggung jawab.'}
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-base font-bold text-neutral-900 mb-6 tracking-tight">Navigasi</h4>
                        <ul className="space-y-4 text-sm font-medium text-neutral-500">
                            <li><Link href="/" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Home</Link></li>
                            <li><Link href="/tentang-kami" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Tentang Kami</Link></li>
                            <li><Link href="/layanan" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Layanan</Link></li>
                            <li><Link href="/konsultan" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Konsultan</Link></li>
                            <li><Link href="/artikel" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Artikel</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info with Icons */}
                    <div>
                        <h4 className="text-base font-bold text-neutral-900 mb-6 tracking-tight">Hubungi Kami</h4>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                    <MapPin size={18} />
                                </div>
                                <span className="text-sm text-neutral-500 leading-relaxed py-1">
                                    {siteSettings.contact_address}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                    <Mail size={18} />
                                </div>
                                <span className="text-sm text-neutral-500 py-1">
                                    {siteSettings.contact_email}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                    <Phone size={18} />
                                </div>
                                <span className="text-sm text-neutral-500 py-1">
                                    {siteSettings.contact_phone}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Socials & CTA */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-base font-bold text-neutral-900 mb-4 tracking-tight">Ikuti Kami</h4>
                            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                                Tetap terhubung dengan kami di media sosial untuk mendapatkan pembaruan dan pengumuman menarik.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { icon: Instagram, href: siteSettings.instagram_url },
                                    { icon: Facebook, href: siteSettings.facebook_url },
                                    { icon: Twitter, href: siteSettings.twitter_url },
                                    { icon: Youtube, href: '#' },
                                ].map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                    >
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* CTA Card inspired by SkillUp */}
                        <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform text-primary">
                                <MessageCircle size={64} />
                            </div>
                            <div className="relative z-10">
                                <h5 className="font-bold text-neutral-900 mb-2">Ingin Bergabung?</h5>
                                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                                    Jadilah bagian dari mitra konsultan profesional kami.
                                </p>
                                <Link
                                    href="/register?role=consultant"
                                    className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group/btn"
                                >
                                    Daftar Sekarang
                                    <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Copyright Bottom Bar */}
            <div className="border-t border-neutral-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
                    <p className="text-sm text-neutral-500 font-medium">
                        © {currentYear} {siteSettings.app_name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
