import React from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Head, Link } from '@inertiajs/react';
import {
    Star,
    MapPin,
    ShieldCheck,
    MessageCircle,
    Clock,
    Award,
    ArrowRight,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Consultant {
    id: number;
    user: {
        name: string;
        avatar: string | null;
    };
    specialist_category: string;
    level: string;
    city: string;
    province: string;
    bio: string;
    rating_average: string | number;
    total_ratings: number;
    total_cases: number;
    working_hours: string[];
}

interface Props {
    consultant: Consultant;
}

export default function ConsultantDetail({ consultant }: Props) {
    const breadcrumbs = [
        { label: 'Konsultan', href: '/konsultan' },
        { label: consultant.user.name }
    ];

    return (
        <HomeLayout title={consultant.user.name}>
            <Head title={`${consultant.user.name} - Konsultan IRTIQA`} />

            <PageHeader
                title="Profil Konsultan"
                subtitle="Kenali lebih dekat konsultan ahli kami yang siap mendampingi Anda."
                breadcrumbs={breadcrumbs}
            />

            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Sidebar: Photo & Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="sticky top-32 space-y-8">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-colors" />
                                    <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-neutral-100">
                                        {consultant.user.avatar ? (
                                            <img
                                                src={consultant.user.avatar.startsWith('http')
                                                    ? consultant.user.avatar
                                                    : `/storage/${consultant.user.avatar}`}
                                                alt={consultant.user.name}
                                                className="w-full aspect-[4/5] object-cover"
                                            />
                                        ) : (
                                            <div className="w-full aspect-[4/5] flex items-center justify-center text-neutral-300">
                                                <User className="w-20 h-20" size={80} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs font-bold text-neutral-800">{consultant.rating_average}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-neutral-50 rounded-[2.5rem] p-8 border border-neutral-100 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Level</p>
                                            <p className="font-bold text-neutral-800">{consultant.level}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lokasi</p>
                                            <p className="font-bold text-neutral-800">{consultant.city}, {consultant.province}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Sesi</p>
                                            <p className="font-bold text-neutral-800">{consultant.total_cases}+ Selesai</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Content: Bio & Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 space-y-12"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
                                    {consultant.specialist_category}
                                </div>
                                <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight">
                                    {consultant.user.name}
                                </h2>
                                <div className="flex items-center gap-2 text-neutral-500 font-medium">
                                    <ShieldCheck size={18} className="text-green-500" />
                                    Konsultan Terverifikasi IRTIQA
                                </div>
                            </div>

                            <div className="prose prose-neutral max-w-none">
                                <h4 className="text-xl font-bold text-neutral-900 mb-4">Tentang Konsultan</h4>
                                <p className="text-neutral-600 leading-relaxed text-lg">
                                    {consultant.bio || 'Belum ada deskripsi singkat untuk konsultan ini.'}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xl font-bold text-neutral-900">Jadwal Praktik</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {consultant.working_hours && consultant.working_hours.length > 0 ? (
                                        consultant.working_hours.map((hour, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                                <Clock size={16} className="text-primary" />
                                                <span className="text-sm font-medium text-neutral-700">{hour}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-neutral-400 italic">Jadwal belum dikonfigurasi.</p>
                                    )}
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="relative p-10 bg-primary rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-primary/20">
                                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                                    <MessageCircle size={160} />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-3xl font-bold font-serif leading-tight">
                                        Mulai Konsultasi Bersama {consultant.user.name.split(' ')[0]}?
                                    </h3>
                                    <p className="text-white/80 text-lg max-w-lg leading-relaxed">
                                        Dapatkan pendampingan psiko-spiritual yang dipersonalisasi khusus untuk Anda. Fitur konsultasi tersedia eksklusif melalui aplikasi IRTIQA.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <a
                                            href="#"
                                            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-primary font-bold hover:bg-neutral-50 transition-all active:scale-95 shadow-xl shadow-black/10"
                                        >
                                            Mulai di Aplikasi
                                            <ArrowRight size={20} className="ml-2" />
                                        </a>
                                        <Link
                                            href="/tentang-kami"
                                            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-bold hover:bg-white/20 transition-all active:scale-95"
                                        >
                                            Cara Kerja
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </motion.div>

                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
