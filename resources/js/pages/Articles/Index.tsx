import React, { useState, useEffect } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import Pagination from '@/components/app/Pagination';
import { Link, Head, router } from '@inertiajs/react';
import { Calendar, User, ArrowRight, Eye, Search, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    published_at: string;
    author?: {
        name: string;
    };
    views_count: number;
}

interface PaginationItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedArticles {
    data: Article[];
    links: PaginationItem[];
    current_page: number;
}

interface Props {
    articles: PaginatedArticles;
    filters: {
        search: string | null;
    };
    logo: string | null;
}

export default function Index({ articles, filters, logo }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const breadcrumbs = [
        { label: 'Artikel' }
    ];

    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            router.get('/artikel',
                { search: debouncedSearch },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ['articles', 'filters']
                }
            );
        }
    }, [debouncedSearch]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            }
        },
        exit: {
            opacity: 0,
            y: 20,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <HomeLayout logo={logo} title="Artikel & Edukasi">
            <Head title="Artikel & Edukasi - IRTIQA" />

            <PageHeader
                title="Artikel & Edukasi"
                subtitle="Wawasan psiko-spiritual untuk kejernihan batin dan kedewasaan spiritual."
                breadcrumbs={breadcrumbs}
            />

            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-50 relative z-20">
                <div className="max-w-6xl mx-auto">
                    {/* Search Bar */}
                    <div className="max-w-2xl">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={20} className="text-neutral-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari artikel (contoh: kesehatan mental, spiritual...)"
                                className="block w-full pl-12 pr-12 py-4 bg-[#F9FAFB] border border-neutral-200 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-primary transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        {filters.search && (
                            <p className="mt-4 text-sm text-neutral-500">
                                Menampilkan hasil pencarian untuk: <span className="font-bold text-primary">"{filters.search}"</span>
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white min-h-[600px]">
                <div className="max-w-6xl mx-auto">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${filters.search || 'list'}-${articles.current_page}`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {articles.data.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {articles.data.map((article) => (
                                        <motion.div
                                            key={article.id}
                                            variants={cardVariants}
                                            className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                                        >
                                            {/* Thumbnail */}
                                            <Link href={`/artikel/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                                                <img
                                                    src={article.thumbnail ? (article.thumbnail.startsWith('http') ? article.thumbnail : `/storage/${article.thumbnail}`) : '/images/placeholder-article.jpg'}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </Link>

                                            {/* Content */}
                                            <div className="p-8 flex flex-col flex-grow">
                                                {/* Meta */}
                                                <div className="flex items-center gap-4 text-neutral-400 text-xs mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(article.published_at)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Eye size={14} />
                                                        {article.views_count}
                                                    </div>
                                                </div>

                                                <Link href={`/artikel/${article.slug}`}>
                                                    <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                        {article.title}
                                                    </h3>
                                                </Link>

                                                <p className="text-[#6B7280] text-sm leading-relaxed mb-6 line-clamp-3">
                                                    {article.excerpt}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                                            <User size={14} />
                                                        </div>
                                                        <span className="text-xs font-medium text-neutral-700">
                                                            {article.author?.name || 'Admin'}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/artikel/${article.slug}`}
                                                        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-xs font-bold group/btn"
                                                    >
                                                        Baca
                                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-[#F9FAFB] rounded-3xl border border-dashed border-neutral-200">
                                    <p className="text-neutral-500">
                                        {filters.search
                                            ? `Tidak ditemukan artikel dengan kata kunci "${filters.search}"`
                                            : 'Belum ada artikel yang diterbitkan.'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination */}
                    <div className="mt-16">
                        <Pagination links={articles.links} />
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
