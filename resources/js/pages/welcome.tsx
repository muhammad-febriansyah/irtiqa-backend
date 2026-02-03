import { Link } from '@inertiajs/react';
import {
    MessageCircle,
    Moon,
    BookOpen,
    ShieldCheck,
    Heart,
    ArrowRight,
    CheckCircle2,
    Star,
    Users,
    User,
    Award,
    MapPin,
    Zap,
    BarChart3,
    Calendar,
    Quote
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Timeline } from '@/components/ui/timeline';
import HomeLayout from '@/layouts/HomeLayout';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface Banner {
    title: string;
    description: string;
    image: string;
}

interface Slider {
    id: number;
    title: string;
    desc: string;
    image: string;
}

interface Consultant {
    id: number;
    specialist_category: string;
    level: string;
    rating_average: string | number;
    city: string;
    province: string;
    bio: string;
    total_cases: number;
    user: {
        name: string;
        avatar: string | null;
    };
}

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    published_at: string;
}

interface Stats {
    total_consultants: number;
    total_cases: number;
    average_rating: number;
}

interface Testimonial {
    id: number;
    name: string;
    role: string;
    quote: string;
    rating: number;
}

export default function Welcome({
    banner,
    sliders = [],
    canRegister,
    featuredConsultants = [],
    latestArticles = [],
    stats,
    testimonials = []
}: {
    banner: Banner | null;
    sliders: Slider[];
    canRegister: boolean;
    featuredConsultants: Consultant[];
    latestArticles: Article[];
    stats: Stats;
    testimonials: Testimonial[];
}) {
    const { siteSettings } = usePage<SharedData>().props;
    const logo = siteSettings.logo;
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (sliders.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % sliders.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [sliders.length]);

    // Fallback if no sliders
    const displaySliders =
        sliders.length > 0
            ? sliders
            : [
                {
                    id: 0,
                    title:
                        banner?.title ||
                        'Temukan Ketenangan & Arah Hidup yang Lebih Baik',
                    desc:
                        banner?.description ||
                        'Membantu Anda menghadapi tantangan hidup melalui pendekatan psikologis yang selaras dengan nilai-nilai Islam.',
                    image: banner?.image || '/images/hero_serenity.png',
                },
            ];

    return (
        <HomeLayout logo={logo} canRegister={canRegister}>
            {/* Hero Section with Slider */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white min-h-[600px] flex items-center">
                <BackgroundBeams className="opacity-40" />

                <div className="max-w-6xl mx-auto w-full relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
                        >
                            <div className="flex-1 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6"
                                >
                                    <ShieldCheck size={16} className="mr-2" />
                                    Aplikasi Pendampingan Aman & Terpercaya
                                </motion.div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] mb-6 tracking-tight text-[#111827]">
                                    {displaySliders[currentSlide].title}
                                </h1>

                                <p className="text-lg text-[#4B5563] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    {displaySliders[currentSlide].desc}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link
                                        href="/register?role=consultant"
                                        className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white text-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Gabung Sebagai Mitra
                                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <a
                                        href="#"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#4B5563] text-sm font-medium hover:bg-slate-50 transition-all"
                                    >
                                        Unduh Aplikasi User
                                    </a>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-xl lg:max-w-none">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-4 border-2 border-primary/20 rounded-3xl" />
                                    <img
                                        src={
                                            displaySliders[currentSlide].image.startsWith('http')
                                                ? displaySliders[currentSlide].image
                                                : `/storage/${displaySliders[currentSlide].image}`
                                        }
                                        alt={displaySliders[currentSlide].title}
                                        className="relative rounded-2xl w-full h-[300px] sm:h-[450px] shadow-2xl object-cover"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Slider Navigation Dots */}
                    {displaySliders.length > 1 && (
                        <div className="mt-12 flex justify-center lg:justify-start gap-3">
                            {displaySliders.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2.5 transition-all duration-300 rounded-full ${index === currentSlide ? 'w-10 bg-primary' : 'w-2.5 bg-primary/20 hover:bg-primary/40'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-primary text-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <NumberTicker value={stats.total_consultants} className="text-white" />+
                            </div>
                            <p className="text-white/70 text-xs uppercase tracking-wider">Konsultan Terverifikasi</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <NumberTicker value={stats.total_cases} className="text-white" />+
                            </div>
                            <p className="text-white/70 text-xs uppercase tracking-wider">Total Sesi Konsultasi</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <NumberTicker value={stats.average_rating} decimalPlaces={1} className="text-white" />/5.0
                            </div>
                            <p className="text-white/70 text-xs uppercase tracking-wider">Rating Kepuasan</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="cara-kerja" className="bg-white">
                <Timeline data={[
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
                ]} />
            </section>

            {/* Featured Consultants */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-primary/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold text-[#111827] mb-4">Konsultan Unggulan</h2>
                            <p className="text-[#6B7280] text-lg">Para profesional terpilih yang siap membantu Anda mencapai kejernihan batin.</p>
                        </div>
                        <Link
                            href="/konsultan"
                            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                        >
                            Lihat Semua Konsultan
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {featuredConsultants.map((consultant, idx) => (
                            <motion.div
                                key={consultant.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 flex flex-col min-w-[350px] snap-start"
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
                                        </div>
                                        <Link href={`/konsultan/${consultant.id}`}>
                                            <h3 className="text-lg font-bold text-[#111827] group-hover:text-primary transition-colors leading-tight">
                                                {consultant.user.name}
                                            </h3>
                                        </Link>
                                        <span className="inline-block mt-1 px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/10">
                                            {consultant.level === 'expert' ? 'Ahli Utama' : consultant.level === 'senior' ? 'Senior' : 'Partner'}
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
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#111827] mb-4">Testimoni Pengguna</h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            Apa yang mereka katakan setelah menemukan kedamaian bersama IRTIQA.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* First Row - Normal Direction */}
                        <Marquee pauseOnHover className="[--duration:60s]">
                            {testimonials.slice(0, Math.ceil(testimonials.length / 2)).map((testi) => (
                                <div
                                    key={testi.id}
                                    className="w-[400px] bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm relative mx-4"
                                >
                                    <Quote className="absolute top-6 right-6 text-primary/20" size={40} />
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testi.rating)].map((_, i) => (
                                            <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-neutral-700 text-base leading-relaxed mb-6 italic">"{testi.quote}"</p>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">{testi.name}</h4>
                                        <p className="text-primary text-sm font-bold uppercase tracking-widest">{testi.role}</p>
                                    </div>
                                </div>
                            ))}
                        </Marquee>

                        {/* Second Row - Reverse Direction */}
                        <Marquee pauseOnHover reverse className="[--duration:60s]">
                            {testimonials.slice(Math.ceil(testimonials.length / 2)).map((testi) => (
                                <div
                                    key={testi.id}
                                    className="w-[400px] bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm relative mx-4"
                                >
                                    <Quote className="absolute top-6 right-6 text-primary/20" size={40} />
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testi.rating)].map((_, i) => (
                                            <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-neutral-700 text-base leading-relaxed mb-6 italic">"{testi.quote}"</p>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">{testi.name}</h4>
                                        <p className="text-primary text-sm font-bold uppercase tracking-widest">{testi.role}</p>
                                    </div>
                                </div>
                            ))}
                        </Marquee>
                    </div>
                </div>
            </section>

            {/* Latest Articles */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 via-white to-primary/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold text-[#111827] mb-4">Wawasan Terbaru</h2>
                            <p className="text-[#6B7280] text-lg">Edukasi psiko-spiritual untuk memperkaya wawasan dan kejernihan batin Anda.</p>
                        </div>
                        <Link
                            href="/artikel"
                            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                        >
                            Baca Artikel Lainnya
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {latestArticles.map((article, idx) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500"
                            >
                                <Link href={`/artikel/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-neutral-100">
                                    <img
                                        src={article.thumbnail ? (article.thumbnail.startsWith('http') ? article.thumbnail : `/storage/${article.thumbnail}`) : '/images/placeholder-article.jpg'}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                        <div className="flex items-center gap-2 text-primary text-xs font-bold">
                                            <Calendar size={14} />
                                            {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-8 space-y-4">
                                    <Link href={`/artikel/${article.slug}`}>
                                        <h4 className="text-xl font-bold text-[#111827] group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {article.title}
                                        </h4>
                                    </Link>
                                    <p className="text-[#6B7280] text-sm line-clamp-3 leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                    <Link
                                        href={`/artikel/${article.slug}`}
                                        className="inline-flex items-center gap-2 text-primary font-bold text-sm group/btn pt-4 border-t border-neutral-50"
                                    >
                                        Baca Selengkapnya
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-100 bg-[#F9FAFB]/50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {[
                            { icon: <ShieldCheck size={32} />, text: "DATA ENCRYPTION" },
                            { icon: <BarChart3 size={32} />, text: "ISLAMIC ETHICS COMPLIANT" },
                            { icon: <Heart size={32} />, text: "VERIFIED PSYCHOLOGISTS" }
                        ].map((badge, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-md border border-neutral-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    {badge.icon}
                                </div>
                                <span className="font-bold text-neutral-900 tracking-tighter text-sm">{badge.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white">
                <div className="max-w-5xl mx-auto p-16 md:p-24 bg-white rounded-[3rem] text-center relative overflow-hidden border border-neutral-100">
                    {/* Gradient Blur Circles */}
                    <div className="absolute top-[-20%] right-[-15%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-20%] left-[-15%] w-[45%] h-[45%] bg-primary/15 rounded-full blur-[100px]" />
                    <div className="absolute top-[30%] left-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight text-[#111827]">Mulai Perjalanan Spiritual Anda Hari Ini</h2>
                        <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
                            Unduh aplikasi IRTIQA sekarang dan temukan pendamping yang tepat untuk kesehatan mental dan kedamaian batin Anda.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <a
                                href="#"
                                className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-primary text-white text-lg font-bold hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
                            >
                                <Zap size={20} className="mr-2" />
                                Mulai di Aplikasi
                            </a>
                            <Link href="/register?role=consultant">
                                <ShimmerButton
                                    className="px-10 py-5 text-lg font-bold"
                                    background="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                                    shimmerColor="#ffffff"
                                    shimmerSize="0.1em"
                                    borderRadius="1rem"
                                >
                                    Daftar Sebagai Mitra
                                </ShimmerButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
