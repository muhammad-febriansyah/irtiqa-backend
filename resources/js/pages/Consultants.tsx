import React, { useState, useEffect } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import Pagination from '@/components/app/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import {
    Star,
    Award,
    MapPin,
    CheckCircle2,
    User,
    ArrowRight,
    Search,
    X
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';

interface Consultant {
    id: number;
    specialist_category: string;
    level: string;
    city: string;
    province: string;
    bio: string;
    rating_average: number;
    total_cases: number;
    total_ratings: number;
    user: {
        name: string;
        avatar?: string;
    };
}

interface PaginationItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedConsultants {
    data: Consultant[];
    links: PaginationItem[];
    current_page: number;
    total: number;
}

interface Props {
    consultants: PaginatedConsultants;
    filters: {
        search: string | null;
    };
    logo: string | null;
}

export default function Consultants({ consultants, filters, logo }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const breadcrumbs = [
        { label: 'Layanan' },
        { label: 'Daftar Konsultan' }
    ];

    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            router.get('/konsultan',
                { search: debouncedSearch },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ['consultants', 'filters']
                }
            );
        }
    }, [debouncedSearch]);

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'expert': return 'Ahli Utama';
            case 'senior': return 'Senior';
            case 'junior': return 'Partner';
            default: return level;
        }
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
        <HomeLayout logo={logo} title="Daftar Konsultan Ahli">
            <Head title="Daftar Konsultan - IRTIQA" />

            <PageHeader
                title="Konsultan Ahli"
                subtitle="Dibimbing oleh tenaga ahli psiko-spiritual yang kompeten dan tersertifikasi di bidangnya."
                breadcrumbs={breadcrumbs}
                action={
                    <Link
                        href="/register?role=consultant"
                        className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                        Mulai Bergabung
                        <ArrowRight size={18} />
                    </Link>
                }
            />

            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white min-h-[600px]">
                <div className="max-w-6xl mx-auto">

                    {/* Filter / Search section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div>
                            <h2 className="text-2xl font-bold text-[#111827]">
                                {filters.search
                                    ? `Hasil pencarian: "${filters.search}"`
                                    : `Menampilkan ${consultants.total} Konsultan`
                                }
                            </h2>
                            <p className="text-neutral-500">Temukan pendamping yang sesuai dengan kebutuhan batin Anda.</p>
                        </div>
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={20} className="text-neutral-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, bidang, atau lokasi..."
                                className="w-full pl-12 pr-12 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm"
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
                    </div>

                    {/* Grid */}
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${filters.search || 'list'}-${consultants.current_page}`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {consultants.data.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {consultants.data.map((consultant, index) => (
                                        <motion.div
                                            key={consultant.id}
                                            variants={cardVariants}
                                            className="group bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                                        >
                                            {/* Header / Avatar Area */}
                                            <div className="p-8 pb-0 flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-2 border-white shadow-md">
                                                        {consultant.user.avatar ? (
                                                            <img
                                                                src={consultant.user.avatar.startsWith('http')
                                                                    ? consultant.user.avatar
                                                                    : `/storage/${consultant.user.avatar}`}
                                                                alt={consultant.user.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User size={32} />
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                                                        <CheckCircle2 size={12} fill="currentColor" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Star size={14} className="text-amber-400 fill-current" />
                                                        <span className="text-sm font-bold text-[#111827]">{Number(consultant.rating_average).toFixed(1)}</span>
                                                        <span className="text-xs text-neutral-400">({consultant.total_ratings} ulasan)</span>
                                                    </div>
                                                    <Link href={`/konsultan/${consultant.id}`}>
                                                        <h3 className="text-lg font-bold text-[#111827] group-hover:text-primary transition-colors leading-tight">
                                                            {consultant.user.name}
                                                        </h3>
                                                    </Link>
                                                    <span className="inline-block mt-1 px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/10">
                                                        {getLevelLabel(consultant.level)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-8 flex flex-col flex-grow">
                                                <div className="space-y-4 mb-8">
                                                    <div className="flex items-start gap-3">
                                                        <Award size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Spesialisasi</p>
                                                            <p className="text-sm font-semibold text-[#374151] line-clamp-1">{consultant.specialist_category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lokasi Praktik</p>
                                                            <p className="text-sm font-semibold text-[#374151] line-clamp-1">{consultant.city}, {consultant.province}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-3 italic mb-8">
                                                    "{consultant.bio}"
                                                </p>

                                                <div className="mt-auto pt-8 border-t border-neutral-50 flex items-center justify-between">
                                                    <div className="text-center bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100">
                                                        <p className="text-xs font-bold text-[#111827]">{consultant.total_cases}+</p>
                                                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-tighter">Kasus Selesai</p>
                                                    </div>

                                                    <Link
                                                        href={`/konsultan/${consultant.id}`}
                                                        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-bold group/btn"
                                                    >
                                                        Lihat Profil
                                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Search size={32} className="text-neutral-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#111827] mb-2">Tidak ada hasil</h3>
                                    <p className="text-neutral-500 max-w-sm mx-auto">
                                        Maaf, kami tidak menemukan konsultan yang cocok dengan kata kunci "{filters.search}".
                                    </p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-8 text-primary font-bold hover:underline"
                                    >
                                        Tampilkan Semua Konsultan
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination */}
                    {consultants.links.length > 3 && (
                        <div className="mt-20">
                            <Pagination links={consultants.links} />
                        </div>
                    )}

                    {/* Registration CTA */}
                    <div className="mt-32 text-center p-12 sm:p-20 bg-neutral-900 rounded-[4rem] relative overflow-hidden">
                        <div className="relative z-10 text-center flex flex-col items-center">
                            <h3 className="text-3xl font-bold text-white mb-6">Ingin bergabung sebagai mitra kami?</h3>
                            <p className="text-neutral-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">Kami membuka kesempatan kolaborasi bagi para tenaga profesional psikologi dan spiritual untuk berkontribusi dalam ekosistem IRTIQA.</p>
                            <Link
                                href="/register?role=consultant"
                                className="bg-white text-neutral-900 hover:bg-primary hover:text-white px-12 py-5 rounded-2xl font-bold transition-all duration-300 inline-block shadow-xl hover:shadow-primary/20"
                            >
                                Daftar Sebagai Mitra
                            </Link>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
