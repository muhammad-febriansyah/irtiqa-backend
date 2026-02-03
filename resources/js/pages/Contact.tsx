import React, { useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Head, useForm } from '@inertiajs/react';
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    Clock,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReCaptchaField from '@/components/recaptcha-field';

interface Props {
    logo: string | null;
    contactInfo: {
        address: string;
        email: string;
        phone: string;
        hours: string;
    };
}

export default function Contact({ logo, contactInfo }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        recaptcha_token: '',
    });

    const breadcrumbs = [
        { label: 'Informasi' },
        { label: 'Kontak' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kontak', {
            onSuccess: () => {
                reset();
                window.location.reload();
            },
        });
    };

    return (
        <HomeLayout logo={logo} title="Hubungi Kami">
            <Head title="Kontak - IRTIQA" />

            <PageHeader
                title="Kontak Kami"
                subtitle="Kami siap mendengarkan aspirasi, pertanyaan, atau masukan Anda demi layanan bimbingan yang lebih baik."
                breadcrumbs={breadcrumbs}
            />

            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Info Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-12"
                        >
                            <div>
                                <h2 className="text-3xl font-bold text-[#111827] mb-6">Mari Terhubung Bersama Kami</h2>
                                <p className="text-[#6B7280] leading-relaxed text-lg">
                                    IRTIQA berkomitmen untuk selalu hadir bagi Anda. Silakan pilih saluran komunikasi yang paling nyaman bagi Anda untuk berkonsultasi atau bertanya.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Mail size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Email Kami</p>
                                    <p className="text-[#374151] font-semibold break-words">{contactInfo.email}</p>
                                </div>
                                <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Phone size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Telepon / WA</p>
                                    <p className="text-[#374151] font-semibold">{contactInfo.phone}</p>
                                </div>
                                <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <MapPin size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Kantor Pusat</p>
                                    <p className="text-sm text-[#374151] font-medium leading-relaxed">{contactInfo.address}</p>
                                </div>
                                <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Clock size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Jam Operasional</p>
                                    <p className="text-sm text-[#374151] font-medium whitespace-pre-line">
                                        {contactInfo.hours.includes('|') ? (
                                            <>
                                                {contactInfo.hours.split('|')[0]}<br />
                                                {contactInfo.hours.split('|')[1]}
                                            </>
                                        ) : (
                                            contactInfo.hours
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Help Boxes */}
                            <div className="bg-primary/[0.03] p-8 rounded-[2.5rem] border border-primary/10 flex items-start gap-6">
                                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <MessageSquare size={28} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[#111827] mb-2">Punya Masalah Mendesak?</h4>
                                    <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                                        Gunakan fitur chat langsung di aplikasi kami setelah Anda daftar untuk respon yang lebih cepat.
                                    </p>
                                    <a href="/register" className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-1">
                                        Mulai Konsultasi <Globe size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Form Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-neutral-100 shadow-2xl shadow-neutral-100/50"
                        >
                            <h3 className="text-2xl font-bold text-[#111827] mb-8">Kirimkan Pesan</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 ml-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`w-full px-6 py-4 bg-neutral-50 border rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-all ${errors.name ? 'border-red-500' : 'border-neutral-100'}`}
                                            placeholder="Masukkan nama Anda"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 ml-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full px-6 py-4 bg-neutral-50 border rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-all ${errors.email ? 'border-red-500' : 'border-neutral-100'}`}
                                            placeholder="alamat@email.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Subjek</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className={`w-full px-6 py-4 bg-neutral-50 border rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-all ${errors.subject ? 'border-red-500' : 'border-neutral-100'}`}
                                        placeholder="Pilih topik pesan Anda"
                                    />
                                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Pesan</label>
                                    <textarea
                                        rows={5}
                                        required
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className={`w-full px-6 py-4 bg-neutral-50 border rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-all resize-none ${errors.message ? 'border-red-500' : 'border-neutral-100'}`}
                                        placeholder="Tuliskan pesan Anda di sini..."
                                    />
                                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                </div>

                                <ReCaptchaField
                                    onChange={(token) => setData('recaptcha_token', token || '')}
                                    errorMessage={errors.recaptcha_token}
                                />

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-neutral-900 hover:bg-primary text-white py-5 rounded-2xl font-bold transition-all duration-500 shadow-xl shadow-neutral-900/5 hover:shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Pesan Sekarang'}
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                                <p className="text-center text-xs text-neutral-400 mt-4 italic">
                                    "Data Anda kami lindungi sepenuhnya sesuai Kebijakan Privasi."
                                </p>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
