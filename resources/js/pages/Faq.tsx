import React, { useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Head } from '@inertiajs/react';
import { Plus, Minus, Search, HelpCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    category: string;
}

interface Props {
    faqs: Record<string, FaqItem[]>;
    logo: string | null;
}

export default function Faq({ faqs, logo }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [openId, setOpenId] = useState<number | null>(null);

    const breadcrumbs = [
        { label: 'Informasi' },
        { label: 'FAQ' }
    ];

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    // Filter FAQs based on search
    const filteredFaqs = Object.entries(faqs).reduce((acc, [category, items]) => {
        const filtered = items.filter(
            item =>
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
            acc[category] = filtered;
        }
        return acc;
    }, {} as Record<string, FaqItem[]>);

    return (
        <HomeLayout logo={logo} title="Pertanyaan Umum (FAQ)">
            <Head title="FAQ - IRTIQA" />

            <PageHeader
                title="FAQ"
                subtitle="Temukan jawaban cepat untuk pertanyaan yang sering diajukan seputar layanan kami."
                breadcrumbs={breadcrumbs}
            />

            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white min-h-[600px]">
                <div className="max-w-4xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-16">
                        <div className="relative group max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={20} className="text-neutral-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari pertanyaan... (contoh: cara daftar, paket, konsultan)"
                                className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-300 shadow-sm"
                            />
                        </div>
                    </div>

                    {Object.entries(filteredFaqs).length > 0 ? (
                        <div className="space-y-12">
                            {Object.entries(filteredFaqs).map(([category, items]) => (
                                <div key={category} className="space-y-6">
                                    <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2 pb-2 border-b border-neutral-100">
                                        <div className="w-2 h-6 bg-primary rounded-full" />
                                        {category}
                                    </h2>
                                    <div className="space-y-4">
                                        {items.map((faq) => (
                                            <div key={faq.id} className="relative group">
                                                {/* Background Blur Effect */}
                                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${openId === faq.id ? 'opacity-100' : ''}`} />

                                                <div
                                                    className={`relative border rounded-2xl transition-all duration-500 bg-white ${openId === faq.id
                                                        ? 'border-primary/50 shadow-xl shadow-primary/5 translate-y-[-2px]'
                                                        : 'border-neutral-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-1px]'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => toggleFaq(faq.id)}
                                                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                                                    >
                                                        <span className={`font-bold transition-colors duration-300 ${openId === faq.id ? 'text-primary' : 'text-[#374151]'}`}>
                                                            {faq.question}
                                                        </span>
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openId === faq.id ? 'bg-primary text-white rotate-0' : 'bg-neutral-50 text-neutral-400 rotate-0'}`}>
                                                            {openId === faq.id ? <Minus size={16} /> : <Plus size={16} />}
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {openId === faq.id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-6 pb-6 text-[#6B7280] leading-relaxed border-t border-neutral-50 pt-4">
                                                                    {faq.answer}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <HelpCircle size={32} className="text-neutral-300" />
                            </div>
                            <h3 className="text-lg font-bold text-[#111827] mb-2">Tidak ditemukan jawaban</h3>
                            <p className="text-neutral-500">
                                Maaf, kami tidak menemukan hasil untuk "{searchQuery}".<br />
                                Coba kata kunci lain atau hubungi bantuan kami.
                            </p>
                        </div>
                    )}

                    {/* Contact CTA */}
                    <div className="mt-32 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-[3rem] blur-2xl opacity-70 transition-opacity duration-500" />

                        <div className="relative p-10 sm:p-16 bg-white border border-neutral-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/5 flex flex-col sm:flex-row items-center justify-between gap-10">
                            <div className="relative z-10 text-center sm:text-left space-y-4">
                                <h3 className="text-3xl font-bold text-[#111827] tracking-tight">
                                    Masih punya pertanyaan lain?
                                </h3>
                                <p className="text-[#6B7280] text-lg max-w-md leading-relaxed">
                                    Tim kami siap membantu Anda memberikan penjelasan lebih lanjut melalui layanan chat WhatsApp.
                                </p>
                            </div>

                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                className="relative z-10 inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
                            >
                                <MessageCircle size={24} />
                                Hubungi Admin
                            </a>

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
