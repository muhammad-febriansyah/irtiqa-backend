import { Head, Link } from '@inertiajs/react';
import {
    MessageCircle,
    Moon,
    BookOpen,
    ShieldCheck,
    Heart,
    ArrowRight,
    Menu,
    X,
    CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import {
    Navbar,
    NavItems,
    NavbarButton,
    MobileNav,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu
} from '@/components/ui/resizable-navbar';

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

export default function Welcome({
    banner,
    sliders = [],
    logo,
    favicon,
}: {
    banner: Banner | null;
    sliders: Slider[];
    logo: string | null;
    favicon: string | null;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const navLinks = [
        { name: 'Layanan', link: '#layanan' },
        { name: 'Tentang Kami', link: '#tentang' },
        { name: 'Artikel', link: '#' },
    ];

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
        <div className="min-h-screen bg-[#F6FAFE] font-sans selection:bg-primary/30 text-[#1A1A1A]">
            <Head title="IRTIQA - Pendampingan Psiko-Spiritual Islami" />

            {/* Resizable Navbar */}
            <Navbar>
                <div className="flex items-center">
                    <img
                        src={logo || '/logo.svg'}
                        alt="IRTIQA"
                        className="h-20 object-cover"
                    />
                </div>

                <NavItems items={navLinks} />

                <div className="hidden md:flex items-center gap-4">
                    <NavbarButton href="/login" variant="secondary">
                        Masuk
                    </NavbarButton>
                    <NavbarButton href="/register">Mulai</NavbarButton>
                </div>

                <MobileNav>
                    <MobileNavHeader>
                        <img
                            src={logo || '/logo.svg'}
                            alt="IRTIQA"
                            className="h-10 object-cover"
                        />
                        <MobileNavToggle
                            isOpen={isMenuOpen}
                            setIsOpen={setIsMenuOpen}
                        />
                    </MobileNavHeader>
                    <MobileNavMenu
                        items={[
                            ...navLinks,
                            { name: 'Masuk', link: '/login' },
                            { name: 'Daftar', link: '/register' },
                        ]}
                        isOpen={isMenuOpen}
                    />
                </MobileNav>
            </Navbar>

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
                                        href="/register"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white text-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Mulai Sekarang
                                        <ArrowRight size={20} className="ml-2" />
                                    </Link>
                                    <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#4B5563] text-lg font-bold hover:bg-slate-50 transition-all">
                                        Pelajari Lebih Lanjut
                                    </button>
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

            {/* Stats/Logo Cloud (Subtle) */}
            <div className="bg-[#F9FAFB] py-12 border-y border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-around items-center gap-8 grayscale opacity-70">
                    <span className="font-bold text-xl tracking-widest text-[#9CA3AF]">INSTITUSI A</span>
                    <span className="font-bold text-xl tracking-widest text-[#9CA3AF]">YAYASAN B</span>
                    <span className="font-bold text-xl tracking-widest text-[#9CA3AF]">KLINIK C</span>
                    <span className="font-bold text-xl tracking-widest text-[#9CA3AF]">KOMUNITAS D</span>
                </div>
            </div>

            {/* Services Section */}
            <section id="layanan" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-[#111827] mb-4">Layanan Terbaik Kami</h2>
                    <p className="text-[#6B7280] max-w-2xl mx-auto">Dirancang untuk mendampingi Anda di setiap langkah pertumbuhan psikologis dan spiritual.</p>
                </div>

                <BentoGrid className="max-w-6xl mx-auto">
                    <BentoGridItem
                        title="Konsultasi Privat"
                        description="Ceritakan keresahan Anda dengan aman dan rahasia kepada konsultan profesional yang memahami nilai Islam."
                        icon={<MessageCircle size={28} />}
                        className="md:col-span-2"
                    />
                    <BentoGridItem
                        title="Analisis Mimpi"
                        description="Pahami makna di balik mimpi yang mengganggu melalui klasifikasi psiko-spiritual yang bijak."
                        icon={<Moon size={28} />}
                        className="md:col-span-1"
                    />
                    <BentoGridItem
                        title="Edukasi Spiritual"
                        description="Akses modul pembelajaran dan artikel mendalam tentang kesehatan mental dari sudut pandang Al-Qur'an & Sunnah."
                        icon={<BookOpen size={28} />}
                        className="md:col-span-1"
                    />
                    <BentoGridItem
                        title="Akses Hotlines"
                        description="Bantuan darurat untuk situasi krisis yang membutuhkan penanganan segera."
                        icon={<ShieldCheck size={28} />}
                        className="md:col-span-2"
                    />
                </BentoGrid>
            </section>

            {/* Philosophy Section */}
            <section id="tentang" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="h-48 bg-primary/5 rounded-2xl flex items-center justify-center">
                                <Heart size={48} className="text-primary/40" />
                            </div>
                            <div className="h-64 bg-primary rounded-2xl p-6 flex items-end">
                                <span className="text-white font-bold text-2xl">Tenang.</span>
                            </div>
                        </div>
                        <div className="space-y-4 pt-8">
                            <div className="h-64 bg-[#E5E7EB] rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={48} className="text-[#9CA3AF]" />
                            </div>
                            <div className="h-48 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary text-xl">
                                Bersih.
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-4xl font-bold text-[#111827] mb-8">Mengapa Memilih IRTIQA?</h2>
                        <p className="text-lg text-[#4B5563] mb-8 leading-relaxed">
                            Kami percaya bahwa kesehatan mental dan kedamaian spiritual tidak dapat dipisahkan. IRTIQA hadir with three main pillars:
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="p-1 rounded-full bg-primary/10 text-primary mt-1">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-lg text-[#111827]">Pendekatan Bertahap</h4>
                                    <p className="text-[#6B7280]">Kami tidak terburu-buru. Kami mendampingi Anda melalui proses yang matang dan berkelanjutan.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-1 rounded-full bg-primary/10 text-primary mt-1">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-lg text-[#111827]">Etika Rahasia</h4>
                                    <p className="text-[#6B7280]">Keamanan data dan kerahasiaan identitas Anda adalah prioritas utama sesuai prinsip amanah.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-1 rounded-full bg-primary/10 text-primary mt-1">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-lg text-[#111827]">Konsultan Ahli</h4>
                                    <p className="text-[#6B7280]">Tim kami terdiri dari psikolog dan pembimbing spiritual yang telah terverifikasi secara ketat.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto p-12 bg-primary rounded-[40px] text-center text-white relative overflow-hidden">
                    {/* Decorative solid shape */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full" />

                    <h2 className="text-4xl font-bold mb-6 relative">Siap Memulai Perjalanan Anda?</h2>
                    <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto relative">
                        Daftarkan diri Anda hari ini dan mulai konsultasi pertama secara gratis selama masa promo. Temukan kedamaian yang Anda cari.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center px-10 py-5 rounded-2xl bg-white text-primary text-xl font-bold hover:bg-slate-50 transition-all shadow-xl active:scale-[0.98] relative"
                    >
                        Daftar Akun Sekarang
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-bold text-primary mb-6 block">IRTIQA</span>
                        <p className="text-[#6B7280] text-sm leading-relaxed">
                            Platform pendampingan psiko-spiritual Islami pertama yang mengedepankan ketenangan, kedewasaan, dan kebersihan hati.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-[#111827] mb-6">Layanan</h5>
                        <ul className="space-y-4 text-sm text-[#6B7280]">
                            <li><a href="#" className="hover:text-primary transition-colors">Konsultasi Chat</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Analisis Mimpi</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Edukasi Mandiri</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Akses Hotlines</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-[#111827] mb-6">Perusahaan</h5>
                        <ul className="space-y-4 text-sm text-[#6B7280]">
                            <li><a href="#" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Karir</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-[#111827] mb-6">Kontak</h5>
                        <ul className="space-y-4 text-sm text-[#6B7280]">
                            <li className="flex items-center"><ShieldCheck size={16} className="mr-2" /> support@irtiqa.id</li>
                            <li>Indonesia</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-8 border-t border-[#F3F4F6] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#9CA3AF] text-xs">© 2026 IRTIQA. All rights reserved.</p>
                    <div className="flex gap-6 text-[#9CA3AF]">
                        <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">Facebook</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
