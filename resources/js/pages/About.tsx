import { Head } from '@inertiajs/react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { CheckCircle2, Shield, Heart, Users, Target, Lightbulb } from 'lucide-react';

interface AboutData {
    title: string;
    desc: string;
    image?: string;
}

interface Props {
    about: AboutData | null;
    logo: string | null;
}

export default function About({ about, logo }: Props) {
    // Default content jika belum ada di database
    const defaultContent = {
        title: 'Tentang IRTIQA',
        desc: `IRTIQA adalah platform pendampingan psiko-spiritual Islami yang dirancang untuk membantu individu memahami kondisi batin, kegelisahan jiwa, serta pengalaman psikologis dan ruhani secara bertahap, beradab, dan bertanggung jawab.

IRTIQA hadir sebagai pendamping, bukan pemberi vonis.

Kami meyakini bahwa tidak semua kegelisahan bersumber dari satu sebab, dan tidak semua pengalaman batin perlu disimpulkan sebagai perkara ghaib. Oleh karena itu, IRTIQA mengedepankan penjernihan pemahaman, edukasi, dan kehati-hatian dalam setiap proses pendampingan.

Pendekatan IRTIQA memadukan nilai-nilai syariat Islam, kearifan tasawwuf yang beradab, dan pemahaman psikologis yang rasional, agar setiap individu dapat bertumbuh dengan sadar, tenang, dan tidak tergantung secara berlebihan.

IRTIQA tidak menetapkan kepastian perkara ghaib, tidak menggantikan peran tenaga medis maupun fatwa ulama, dan tidak mendorong ketergantungan. Setiap layanan diarahkan untuk menguatkan kesadaran, menumbuhkan ketenangan, serta mengembalikan kemandirian batin.`,
        image: undefined as string | undefined,
    };

    const content = about || defaultContent;

    const breadcrumbs = [
        { label: 'Profil', href: '#' },
        { label: 'Tentang Kami' }
    ];

    const principles = [
        {
            icon: Heart,
            title: 'Pendekatan Bertahap',
            subtitle: 'Tadarruj',
            description:
                'Kami tidak terburu-buru. Mendampingi Anda melalui proses yang matang dan berkelanjutan.',
        },
        {
            icon: Shield,
            title: 'Etika & Rahasia',
            subtitle: 'Amanah',
            description:
                'Keamanan data dan kerahasiaan identitas Anda adalah prioritas utama sesuai prinsip amanah.',
        },
        {
            icon: Users,
            title: 'Konsultan Ahli',
            subtitle: 'Terverifikasi',
            description:
                'Tim psikolog dan pembimbing spiritual yang telah tersertifikasi dan terverifikasi ketat.',
        },
    ];

    return (
        <HomeLayout logo={logo} title="Tentang Kami">
            <Head title="Tentang Kami - IRTIQA" />

            <PageHeader
                title={content.title}
                subtitle="Pendampingan Psiko-Spiritual Islami"
                breadcrumbs={breadcrumbs}
            />

            {/* Main Content - Clean & Readable */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    {/* Image - Top */}
                    {content.image && (
                        <div className="mb-10 rounded-xl overflow-hidden shadow-md">
                            <img
                                src={
                                    content.image.startsWith('http')
                                        ? content.image
                                        : `/storage/${content.image}`
                                }
                                alt={content.title}
                                className="w-full h-auto"
                            />
                        </div>
                    )}

                    {/* Content with HTML rendering */}
                    <div
                        className="prose prose-lg max-w-none
                            prose-headings:font-bold prose-headings:text-[#111827]
                            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
                            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                            prose-p:text-[#4B5563] prose-p:leading-relaxed prose-p:mb-4
                            prose-strong:text-[#111827] prose-strong:font-semibold
                            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:text-[#4B5563] prose-li:mb-2"
                        dangerouslySetInnerHTML={{ __html: content.desc }}
                    />
                </div>
            </section>

            {/* Principles - Modern Cards */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F9FAFB]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-[#111827] mb-2">
                            Prinsip Kami
                        </h2>
                        <p className="text-[#6B7280]">Landasan dalam setiap pendampingan</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {principles.map((principle, index) => {
                            const Icon = principle.icon;
                            return (
                                <div
                                    key={index}
                                    className="group bg-white rounded-xl p-6 border border-[#E5E7EB] hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="text-primary" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#111827] mb-1">
                                        {principle.title}
                                    </h3>
                                    <p className="text-sm text-primary font-medium mb-3">
                                        {principle.subtitle}
                                    </p>
                                    <p className="text-sm text-[#6B7280] leading-relaxed">
                                        {principle.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

        </HomeLayout>
    );
}

