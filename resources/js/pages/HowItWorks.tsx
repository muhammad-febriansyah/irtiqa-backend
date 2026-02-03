import React from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Head } from '@inertiajs/react';
import {
    UserPlus,
    ClipboardCheck,
    MessageSquare,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    logo: string | null;
}

export default function HowItWorks({ logo }: Props) {
    const breadcrumbs = [
        { label: 'Informasi' },
        { label: 'Cara Kerja' }
    ];

    const steps = [
        {
            title: 'Pendaftaran Akun',
            description: 'Buat akun IRTIQA Anda dengan mudah menggunakan alamat email. Proses cepat dan privasi Anda terjamin.',
            icon: <UserPlus size={32} />,
            color: 'bg-blue-600'
        },
        {
            title: 'Pengisian Screening',
            description: 'Lengkapi kuesioner awal untuk membantu kami memahami kondisi psiko-spiritual Anda secara mendalam.',
            icon: <ClipboardCheck size={32} />,
            color: 'bg-amber-500'
        },
        {
            title: 'Konsultasi Penjernihan',
            description: 'Sesi awal gratis dengan konsultan untuk memvalidasi keluhan (Was-was/Gangguan/Psikologis).',
            icon: <MessageSquare size={32} />,
            color: 'bg-emerald-600'
        },
        {
            title: 'Program Bimbingan',
            description: 'Dapatkan program terstruktur yang disesuaikan dengan kondisi Anda untuk pemulihan bertahap.',
            icon: <Zap size={32} />,
            color: 'bg-indigo-600'
        },
        {
            title: 'Monitoring & Selesai',
            description: 'Pantau perkembangan Anda melalui aplikasi hingga mencapai kemantapan batin yang diharapkan.',
            icon: <CheckCircle2 size={32} />,
            color: 'bg-primary'
        }
    ];

    return (
        <HomeLayout logo={logo} title="Cara Kerja Layanan">
            <Head title="Cara Kerja - IRTIQA" />

            <PageHeader
                title="Cara Kerja"
                subtitle="Pahami alur bimbingan kami yang dirancang untuk kenyamanan dan ketenangan batin Anda."
                breadcrumbs={breadcrumbs}
            />

            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section of the page */}
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold text-[#111827] mb-4">5 Langkah Menuju Ketenangan Batin</h2>
                        <p className="text-neutral-500 max-w-2xl mx-auto">Kami menggunakan metode Tadarruj (bertahap) untuk memastikan setiap proses bimbingan berjalan secara alami dan efektif.</p>
                    </div>

                    {/* Step by Step */}
                    <div className="relative">
                        {/* Connection Line (Desktop) */}
                        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-100 -translate-x-1/2" />

                        <div className="space-y-16 lg:space-y-24 relative z-10">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-0 ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                                        }`}
                                >
                                    {/* Content Area */}
                                    <div className={`flex-1 w-full lg:w-auto ${index % 2 === 0 ? 'lg:text-right lg:pr-20' : 'lg:text-left lg:pl-20'
                                        }`}>
                                        <div className="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 hover:shadow-xl hover:shadow-neutral-100 transition-all duration-500">
                                            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/10">
                                                Langkah {index + 1}
                                            </span>
                                            <h3 className="text-2xl font-bold text-[#111827] mb-4">{step.title}</h3>
                                            <p className="text-[#6B7280] leading-relaxed italic">
                                                "{step.description}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Icon / Circle Area */}
                                    <div className="relative flex-shrink-0 z-20">
                                        <div className={`w-20 h-20 rounded-3xl ${step.color} text-white flex items-center justify-center shadow-2xl shadow-neutral-200 transform rotate-45 group hover:rotate-0 transition-transform duration-500`}>
                                            <div className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                                                {step.icon}
                                            </div>
                                        </div>
                                        {/* Pulse for current active step - just for visual */}
                                        <div className={`absolute inset-0 rounded-3xl ${step.color} animate-ping opacity-20`} />
                                    </div>

                                    {/* Empty area for balance */}
                                    <div className="hidden lg:block flex-1" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Final Note */}
                    <div className="mt-32 text-center bg-primary/5 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h3 className="text-3xl font-bold text-[#111827] mb-6">Siap Memulai Perjalanan Anda?</h3>
                            <p className="text-[#4B5563] text-lg mb-10 leading-relaxed">
                                Jangan biarkan keraguan menghambat langkah Anda. Tim ahli kami siap mendampingi Anda menemukan kembali kejernihan spiritual yang hilang.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="/register"
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
