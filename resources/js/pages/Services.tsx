import { Head } from '@inertiajs/react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Check, Clock, MessageCircle, BookOpen, Sparkles, Shield, Users, Package } from 'lucide-react';

interface PackageData {
    id: number;
    name: string;
    slug: string;
    description: string;
    type: string;
    price: number;
    formatted_price: string;
    features: string[];
    is_featured: boolean;
    sessions_count?: number;
    duration_days?: number;
}

interface Props {
    packages: PackageData[];
    logo: string | null;
}

export default function Services({ packages, logo }: Props) {
    const breadcrumbs = [
        { label: 'Layanan' }
    ];

    // Map icon based on package type
    const getIcon = (type: string) => {
        const iconMap: { [key: string]: any } = {
            'consultation': MessageCircle,
            'guidance': Users,
            'incidental': BookOpen,
            'default': Package,
        };
        return iconMap[type] || iconMap['default'];
    };

    const features = [
        {
            icon: Shield,
            title: 'Privasi Terjaga',
            description: 'Kerahasiaan data dan identitas Anda adalah prioritas utama sesuai prinsip amanah.',
        },
        {
            icon: Users,
            title: 'Konsultan Ahli',
            description: 'Tim psikolog dan pembimbing spiritual yang telah tersertifikasi dan terverifikasi.',
        },
        {
            icon: Sparkles,
            title: 'Pendekatan Bertahap',
            description: 'Metodologi tadarruj yang matang dan berkelanjutan sesuai kebutuhan individual.',
        },
        {
            icon: Clock,
            title: 'Fleksibel',
            description: 'Jadwal konsultasi yang dapat disesuaikan dengan kesibukan Anda.',
        },
    ];

    return (
        <HomeLayout logo={logo} title="Layanan Kami">
            <Head title="Layanan - IRTIQA" />

            <PageHeader
                title="Layanan Kami"
                subtitle="Pendampingan psiko-spiritual Islami yang aman, beradab, dan bertanggung jawab"
                breadcrumbs={breadcrumbs}
            />

            {/* Services Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F9FAFB]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#111827] mb-3">
                            Pilih Layanan yang Sesuai
                        </h2>
                        <p className="text-[#6B7280] max-w-2xl mx-auto">
                            Kami menyediakan berbagai layanan pendampingan yang disesuaikan dengan kebutuhan dan kondisi Anda
                        </p>
                    </div>

                    {packages.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto text-neutral-300 mb-4" size={64} />
                            <p className="text-neutral-500">Belum ada paket layanan tersedia.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map((pkg, index) => {
                                const Icon = getIcon(pkg.type);
                                return (
                                    <div
                                        key={pkg.id}
                                        className={`relative bg-white rounded-2xl p-8 transition-all duration-300 ${
                                            pkg.is_featured
                                                ? 'border-2 border-primary shadow-xl scale-105'
                                                : 'border border-[#E5E7EB] hover:border-primary/30 hover:shadow-lg'
                                        }`}
                                    >
                                        {pkg.is_featured && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                                    Paling Populer
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                pkg.is_featured ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                                            }`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-[#111827]">
                                                    {pkg.name}
                                                </h3>
                                                {pkg.sessions_count && (
                                                    <p className="text-sm text-[#6B7280]">
                                                        {pkg.sessions_count} Sesi
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className={`text-2xl font-bold ${
                                                pkg.is_featured ? 'text-primary' : 'text-[#111827]'
                                            }`}>
                                                {pkg.price === 0 ? 'Gratis' : pkg.formatted_price}
                                            </p>
                                        </div>

                                        <p className="text-[#4B5563] mb-6 leading-relaxed">
                                            {pkg.description}
                                        </p>

                                        {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                                            <ul className="space-y-3 mb-6">
                                                {pkg.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <Check
                                                            size={18}
                                                            className={`flex-shrink-0 mt-0.5 ${
                                                                pkg.is_featured ? 'text-primary' : 'text-[#10B981]'
                                                            }`}
                                                        />
                                                        <span className="text-sm text-[#4B5563]">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <a
                                            href="/register"
                                            className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                                                pkg.is_featured
                                                    ? 'bg-primary text-white hover:bg-primary/90 shadow-md'
                                                    : 'bg-[#F9FAFB] text-[#111827] hover:bg-primary hover:text-white border border-[#E5E7EB]'
                                            }`}
                                        >
                                            {pkg.price === 0 ? 'Mulai Konsultasi' : 'Pilih Paket'}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#111827] mb-3">
                            Mengapa Memilih IRTIQA?
                        </h2>
                        <p className="text-[#6B7280] max-w-2xl mx-auto">
                            Kami berkomitmen memberikan layanan pendampingan yang profesional dan beretika
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center p-6 rounded-xl hover:bg-[#F9FAFB] transition-colors"
                                >
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <Icon className="text-primary" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#111827] mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-[#6B7280] leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary/80">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Siap Memulai Perjalanan Anda?
                    </h2>
                    <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                        Daftarkan diri Anda sekarang dan dapatkan konsultasi awal gratis dengan konsultan kami
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/register"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-primary font-bold hover:bg-white/90 transition-colors shadow-lg"
                        >
                            Daftar Sekarang
                        </a>
                        <a
                            href="/kontak"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-transparent text-white font-bold border-2 border-white hover:bg-white/10 transition-colors"
                        >
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
