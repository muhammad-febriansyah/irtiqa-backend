import { Head, usePage } from '@inertiajs/react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { SharedData } from '@/types';
import {
    MessageCircle,
    Calendar,
    Users,
    Zap,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Timeline } from '@/components/ui/timeline';

interface Props {
    logo: string | null;
}

export default function HowItWorks({ logo }: Props) {
    const breadcrumbs = [
        { label: 'Informasi' },
        { label: 'Cara Kerja' }
    ];

    const { siteSettings } = usePage<SharedData>().props;
    const waNumber = siteSettings.contact_phone?.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${waNumber}`;

    const timelineData = [
        {
            title: "Pilih Konsultan",
            content: (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Users size={28} />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            01
                        </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 text-base md:text-lg leading-relaxed mb-8">
                        Pilih pakar yang sesuai dengan kebutuhan dan spesialisasi yang Anda cari. Setiap konsultan memiliki profil lengkap dengan pengalaman, rating, dan bidang keahlian.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                            <p className="text-sm font-bold text-primary mb-1">100+</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Konsultan Terverifikasi</p>
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                            <p className="text-sm font-bold text-primary mb-1">15+</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Spesialisasi</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Atur Jadwal",
            content: (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Calendar size={28} />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            02
                        </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 text-base md:text-lg leading-relaxed mb-8">
                        Tentukan waktu yang paling nyaman bagi Anda untuk mengikuti sesi. Sistem booking kami yang fleksibel memudahkan Anda mengatur jadwal sesuai ketersediaan konsultan.
                    </p>
                    <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                        <p className="text-sm font-bold text-primary mb-2">Fleksibilitas Waktu</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Pilih sesi pagi, siang, atau malam sesuai kenyamanan Anda</p>
                    </div>
                </div>
            ),
        },
        {
            title: "Mulai Sesi",
            content: (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <MessageCircle size={28} />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            03
                        </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 text-base md:text-lg leading-relaxed mb-8">
                        Lakukan percakapan bimbingan yang mendalam dan solutif melalui aplikasi. Sesi dilakukan dengan privasi terjamin dan dalam suasana yang nyaman.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Chat & Video Call</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">End-to-End Encryption</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Rekaman Sesi Tersimpan</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Evaluasi Diri",
            content: (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Zap size={28} />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            04
                        </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 text-base md:text-lg leading-relaxed mb-8">
                        Terima hasil analisis dan rencana tindak lanjut untuk pertumbuhan spiritual Anda. Konsultan akan memberikan rekomendasi dan panduan untuk perjalanan selanjutnya.
                    </p>
                    <div className="p-6 bg-gradient-to-br from-primary to-primary/90 rounded-2xl text-white">
                        <p className="text-sm font-bold mb-2">Laporan Komprehensif</p>
                        <p className="text-xs opacity-90">Dapatkan insight mendalam tentang perkembangan spiritual dan mental Anda</p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <HomeLayout logo={logo} title="Cara Kerja Layanan">
            <Head title="Cara Kerja - IRTIQA" />

            <PageHeader
                title="Cara Kerja"
                subtitle="Pahami alur bimbingan kami yang dirancang untuk kenyamanan dan ketenangan batin Anda."
                breadcrumbs={breadcrumbs}
            />

            <section className="bg-white">
                <Timeline data={timelineData} />
            </section>

            {/* Final CTA Note */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center bg-primary/5 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h3 className="text-3xl font-bold text-[#111827] mb-6">Siap Memulai Perjalanan Anda?</h3>
                            <p className="text-[#4B5563] text-lg mb-10 leading-relaxed">
                                Jangan biarkan keraguan menghambat langkah Anda. Tim ahli kami siap mendampingi Anda menemukan kembali kejernihan spiritual yang hilang.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-2 group"
                                >
                                    Daftar Sekarang
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a
                                    href="/faq"
                                    className="bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200 px-10 py-5 rounded-2xl font-bold transition-all duration-300"
                                >
                                    Lihat FAQ
                                </a>
                            </div>
                        </div>

                        {/* Abstract Background Shapes */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
