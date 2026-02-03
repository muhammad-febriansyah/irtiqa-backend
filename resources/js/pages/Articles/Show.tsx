import React from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Link, Head } from '@inertiajs/react';
import { Calendar, User, Eye, ArrowLeft, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string | null;
    published_at: string;
    author?: {
        name: string;
    };
    views_count: number;
}

interface Props {
    article: Article;
    logo: string | null;
}

export default function Show({ article, logo }: Props) {
    const breadcrumbs = [
        { label: 'Artikel', href: '/artikel' },
        { label: 'Detail' }
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <HomeLayout logo={logo} title={article.title}>
            <Head title={`${article.title} - IRTIQA`} />

            <PageHeader
                title="Detail Artikel"
                subtitle="Dalami wawasan spiritual dan psikologis melalui ulasan lengkap berikut."
                breadcrumbs={breadcrumbs}
            />

            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <Link
                        href="/artikel"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-all duration-300 group text-sm font-medium mb-12"
                    >
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Kembali ke Daftar Artikel
                    </Link>

                    {/* Article Header */}
                    <div className="mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] mb-8 leading-tight tracking-tight text-center sm:text-left"
                        >
                            {article.title}
                        </motion.h1>

                        {/* Integrated Meta Bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 py-6 border-y border-neutral-100"
                        >
                            <div className="flex items-center gap-2.5 text-neutral-600">
                                <Calendar size={18} className="text-primary" />
                                <span className="text-sm font-medium">{formatDate(article.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-neutral-600">
                                <User size={18} className="text-primary" />
                                <span className="text-sm font-medium">{article.author?.name || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-neutral-600">
                                <Eye size={18} className="text-primary" />
                                <span className="text-sm font-medium">{article.views_count} Kali Dilihat</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Featured Image */}
                    {article.thumbnail && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 mb-16"
                        >
                            <img
                                src={article.thumbnail.startsWith('http') ? article.thumbnail : `/storage/${article.thumbnail}`}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}

                    {/* Content Area */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="rich-text-content"
                        >
                            <div
                                className="text-lg sm:text-xl text-[#374151] leading-[1.8] space-y-8"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </motion.div>

                        {/* Footer Action */}
                        <div className="mt-24 pt-10 border-t border-neutral-100 flex justify-center bg-neutral-50/50 p-8 rounded-3xl">
                            <Link
                                href="/artikel"
                                className="w-full sm:w-auto text-center bg-neutral-900 hover:bg-primary text-white px-10 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg shadow-neutral-900/5 hover:shadow-primary/20"
                            >
                                Lihat Daftar Artikel Lainnya
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
