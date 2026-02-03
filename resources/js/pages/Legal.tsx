import { Head } from '@inertiajs/react';
import HomeLayout from '@/layouts/HomeLayout';
import PageHeader from '@/components/app/PageHeader';
import { Shield, FileText, AlertCircle } from 'lucide-react';

interface LegalPageData {
    slug: string;
    title: string;
    content: string;
}

interface Props {
    page: LegalPageData | null;
    logo: string | null;
    pageType: 'privacy' | 'terms';
}

export default function Legal({ page, logo, pageType }: Props) {
    // Default content jika belum ada di database
    const defaultPrivacy = {
        title: 'Kebijakan Privasi',
        content: `## Kebijakan Privasi IRTIQA

**Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}**

### 1. Pendahuluan

IRTIQA ("kami", "platform") berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda.

### 2. Informasi yang Kami Kumpulkan

#### 2.1 Informasi Pribadi
- Nama atau nama samaran (pseudonim)
- Alamat email
- Nomor telepon (opsional)
- Wilayah/lokasi umum (provinsi/kota)
- Usia atau rentang usia

#### 2.2 Informasi Konsultasi
- Keluhan atau masalah yang disampaikan
- Riwayat komunikasi dengan konsultan
- Catatan sesi konsultasi
- Informasi mimpi (jika Anda menggunakan fitur ini)

#### 2.3 Informasi Teknis
- Alamat IP
- Jenis perangkat dan browser
- Data penggunaan aplikasi
- Cookie dan teknologi pelacakan serupa

### 3. Penggunaan Informasi

Kami menggunakan informasi Anda untuk:

- Menyediakan layanan pendampingan psiko-spiritual
- Mencocokkan Anda dengan konsultan yang sesuai
- Memproses transaksi pembayaran
- Meningkatkan kualitas layanan kami
- Mengirim notifikasi terkait layanan
- Menjaga keamanan dan mencegah penyalahgunaan
- Mematuhi kewajiban hukum

### 4. Perlindungan Data

#### 4.1 Keamanan
- Enkripsi data end-to-end untuk komunikasi sensitif
- Penyimpanan data di server aman dengan sertifikasi ISO
- Akses terbatas hanya untuk personel berwenang
- Audit keamanan berkala

#### 4.2 Kerahasiaan
- Semua komunikasi dengan konsultan bersifat rahasia
- Konsultan terikat kode etik profesional
- Data tidak dibagikan tanpa persetujuan eksplisit Anda

### 5. Berbagi Informasi

Kami **TIDAK** akan membagikan informasi pribadi Anda kecuali:

- Anda memberikan persetujuan eksplisit
- Diharuskan oleh hukum yang berlaku
- Untuk melindungi keselamatan Anda atau orang lain (situasi darurat)
- Kepada penyedia layanan pihak ketiga yang terpercaya (payment gateway, hosting) dengan perjanjian kerahasiaan

### 6. Hak Anda

Anda memiliki hak untuk:

- Mengakses data pribadi Anda
- Meminta koreksi data yang tidak akurat
- Meminta penghapusan data (right to be forgotten)
- Menarik persetujuan penggunaan data
- Mengunduh salinan data Anda (portabilitas data)
- Mengajukan keberatan terhadap pemrosesan data tertentu

### 7. Penyimpanan Data

- Data aktif disimpan selama Anda menggunakan layanan
- Setelah penghapusan akun, data akan dianonimkan dalam 30 hari
- Catatan konsultasi dapat disimpan hingga 7 tahun untuk keperluan audit dan hukum

### 8. Cookie dan Pelacakan

Kami menggunakan cookie untuk:

- Menjaga sesi login Anda
- Mengingat preferensi Anda
- Menganalisis penggunaan aplikasi
- Meningkatkan pengalaman pengguna

Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.

### 9. Perubahan Kebijakan

Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi aplikasi.

### 10. Kontak

Untuk pertanyaan terkait privasi, hubungi kami:

- Email: privacy@irtiqa.com
- WhatsApp: +62 812-3456-7890
- Alamat: [Alamat kantor IRTIQA]

---

**Catatan Penting:**
IRTIQA berkomitmen penuh terhadap prinsip amanah dan kerahasiaan. Kami memperlakukan data Anda dengan kehati-hatian dan rasa tanggung jawab yang tinggi.`,
    };

    const defaultTerms = {
        title: 'Syarat dan Ketentuan',
        content: `## Syarat dan Ketentuan Penggunaan IRTIQA

**Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}**

### 1. Penerimaan Syarat

Dengan mengakses dan menggunakan platform IRTIQA, Anda menyetujui untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.

### 2. Definisi Layanan

#### 2.1 Sifat Layanan
IRTIQA adalah platform **pendampingan dan edukasi** psiko-spiritual Islami yang:

- **BUKAN** layanan kesehatan mental berlisensi
- **BUKAN** penentu perkara ghaib
- **BUKAN** pengganti diagnosis medis atau fatwa ulama
- **TIDAK** menjanjikan hasil atau kesembuhan tertentu

#### 2.2 Tujuan Layanan
- Memberikan pendampingan bertahap (tadarruj)
- Menjernihkan pemahaman tentang kondisi batin
- Mengedukasi tentang kesehatan psiko-spiritual
- Merujuk ke profesional jika diperlukan

### 3. Persyaratan Pengguna

#### 3.1 Usia Minimum
- Pengguna harus berusia minimal **17 tahun**
- Untuk usia di bawah 17 tahun memerlukan persetujuan orang tua/wali

#### 3.2 Kapasitas Hukum
- Anda menyatakan memiliki kapasitas hukum untuk membuat perjanjian
- Anda bertanggung jawab penuh atas penggunaan akun Anda

### 4. Kewajiban Pengguna

#### 4.1 Informasi Akurat
- Memberikan informasi yang benar dan akurat
- Memperbarui informasi jika terjadi perubahan
- Tidak menggunakan identitas palsu

#### 4.2 Penggunaan Wajar
Dilarang menggunakan platform untuk:

- Menyebarkan konten ilegal, cabul, atau fitnah
- Mengganggu pengguna lain atau konsultan
- Menyalahgunakan sistem (spam, hacking, dll)
- Tujuan komersial tanpa izin tertulis
- Mengklaim atau menyebarkan informasi yang menyesatkan

#### 4.3 Kerahasiaan Akun
- Menjaga kerahasiaan password dan kredensial login
- Tidak membagikan akun dengan orang lain
- Segera melaporkan jika terjadi akses tidak sah

### 5. Layanan Konsultasi

#### 5.1 Konsultasi Awal (Gratis)
- Bersifat screening dan penjernihan awal
- Tidak menjamin akan dilanjutkan ke pembimbingan berbayar
- Konsultan berhak menolak atau merujuk ke pihak lain

#### 5.2 Pembimbingan Berbayar
- Hanya dimulai setelah pembayaran dikonfirmasi
- Paket yang dibeli tidak dapat dikembalikan (non-refundable) kecuali:
  - Konsultan membatalkan secara sepihak tanpa alasan jelas
  - Terjadi pelanggaran SOP oleh konsultan
  - Layanan tidak dapat diberikan karena force majeure

#### 5.3 Batasan Tanggung Jawab
- Konsultan memberikan pendapat berdasarkan informasi yang Anda berikan
- IRTIQA dan konsultan **TIDAK** bertanggung jawab atas keputusan yang Anda ambil
- Untuk kondisi medis serius, Anda **WAJIB** berkonsultasi dengan tenaga kesehatan berlisensi

### 6. Pembayaran dan Transaksi

#### 6.1 Harga
- Harga paket dapat berubah sewaktu-waktu
- Harga yang berlaku adalah saat pembelian

#### 6.2 Metode Pembayaran
- Payment Gateway (Duitku)
- Transfer Manual (verifikasi 1x24 jam)

#### 6.3 Kebijakan Refund
- Refund hanya diberikan dalam kasus tertentu (lihat 5.2)
- Proses refund memakan waktu 7-14 hari kerja
- Biaya admin tidak dapat dikembalikan

### 7. Hak Kekayaan Intelektual

- Semua konten (artikel, logo, desain) adalah milik IRTIQA
- Anda tidak diperbolehkan menyalin, mendistribusikan, atau memodifikasi tanpa izin
- Materi edukasi hanya untuk penggunaan pribadi

### 8. Penghentian Layanan

Kami berhak menghentikan atau menangguhkan akses Anda jika:

- Melanggar Syarat dan Ketentuan ini
- Menggunakan layanan secara tidak wajar
- Melakukan tindakan yang merugikan IRTIQA atau pengguna lain
- Tidak melakukan pembayaran yang jatuh tempo

### 9. Disclaimer Khusus

#### 9.1 Mimpi
- Klasifikasi mimpi bersifat **edukatif dan umum**
- Bukan tafsir pasti atau klaim ghaib
- Untuk mimpi yang mengganggu, sebaiknya diabaikan dan ditutup dengan doa

#### 9.2 Kondisi Krisis
Jika Anda atau orang terdekat mengalami:
- Pikiran untuk bunuh diri
- Delusi atau halusinasi parah
- Trauma akut

**SEGERA** hubungi layanan darurat (119) atau rumah sakit jiwa terdekat.

### 10. Batasan Tanggung Jawab

IRTIQA dan konsultan **TIDAK BERTANGGUNG JAWAB** atas:

- Kerugian tidak langsung, insidental, atau konsekuensial
- Kehilangan data akibat force majeure
- Tindakan yang Anda ambil berdasarkan saran konsultan
- Gangguan layanan di luar kendali kami

### 11. Force Majeure

Kami tidak bertanggung jawab atas keterlambatan atau kegagalan layanan akibat:

- Bencana alam
- Perang atau kerusuhan
- Gangguan internet atau listrik
- Kebijakan pemerintah
- Wabah penyakit

### 12. Hukum yang Berlaku

Syarat dan Ketentuan ini tunduk pada hukum Republik Indonesia. Setiap perselisihan akan diselesaikan melalui:

1. Musyawarah
2. Mediasi
3. Arbitrase atau pengadilan di Jakarta

### 13. Perubahan Syarat

Kami dapat mengubah Syarat dan Ketentuan ini kapan saja. Perubahan signifikan akan diberitahukan 30 hari sebelumnya.

### 14. Kontak

Untuk pertanyaan atau keluhan:

- Email: support@irtiqa.com
- WhatsApp: +62 812-3456-7890
- Jam Operasional: Senin-Jumat, 09:00-17:00 WIB

---

**Dengan menggunakan IRTIQA, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.**`,
    };

    const defaultContent = pageType === 'privacy' ? defaultPrivacy : defaultTerms;
    const content = page || defaultContent;

    const breadcrumbs = [
        { label: 'Profil', href: '#' },
        { label: content.title }
    ];

    const subtitle = pageType === 'privacy'
        ? 'Komitmen kami untuk melindungi privasi dan keamanan data Anda'
        : 'Ketentuan penggunaan platform IRTIQA yang harus Anda pahami';

    // Parse markdown-style content to JSX
    const renderContent = (text: string) => {
        const sections = text.split('\n###');
        return sections.map((section, index) => {
            if (index === 0) {
                // First section (title)
                return null;
            }

            const lines = section.trim().split('\n');
            const heading = lines[0].replace('###', '').trim();
            const body = lines.slice(1).join('\n');

            return (
                <div key={index} className="mb-8">
                    <h3 className="text-xl font-bold text-[#111827] mb-4">{heading}</h3>
                    <div className="text-[#4B5563] leading-relaxed space-y-3">
                        {body.split('\n\n').map((paragraph, pIndex) => {
                            if (paragraph.trim().startsWith('####')) {
                                return (
                                    <h4
                                        key={pIndex}
                                        className="text-lg font-semibold text-[#111827] mt-6 mb-2"
                                    >
                                        {paragraph.replace('####', '').trim()}
                                    </h4>
                                );
                            }
                            if (paragraph.trim().startsWith('- ')) {
                                const items = paragraph
                                    .split('\n')
                                    .filter((line) => line.trim().startsWith('- '));
                                return (
                                    <ul key={pIndex} className="list-disc list-inside space-y-2 ml-4">
                                        {items.map((item, iIndex) => (
                                            <li key={iIndex}>{item.replace('- ', '').trim()}</li>
                                        ))}
                                    </ul>
                                );
                            }
                            if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                                return (
                                    <p key={pIndex} className="font-semibold">
                                        {paragraph.replace(/\*\*/g, '')}
                                    </p>
                                );
                            }
                            return <p key={pIndex}>{paragraph}</p>;
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <HomeLayout logo={logo} title={content.title}>
            <Head title={`${content.title} - IRTIQA`} />

            <PageHeader
                title={content.title}
                subtitle={subtitle}
                breadcrumbs={breadcrumbs}
            />

            {/* Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-12 rounded-r-lg">
                        <div className="flex items-start">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                    Harap Dibaca dengan Seksama
                                </h3>
                                <p className="text-yellow-800">
                                    {pageType === 'privacy'
                                        ? 'Dokumen ini menjelaskan bagaimana kami mengelola dan melindungi data pribadi Anda. Dengan menggunakan layanan IRTIQA, Anda menyetujui kebijakan ini.'
                                        : 'Dengan mengakses atau menggunakan platform IRTIQA, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum di bawah ini.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        {renderContent(content.content)}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#F9FAFB]">
                <div className="max-w-6xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-[#111827] mb-4">
                        Masih Ada Pertanyaan?
                    </h3>
                    <p className="text-[#6B7280] mb-6">
                        Hubungi tim kami untuk penjelasan lebih lanjut
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:support@irtiqa.com"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Email Support
                        </a>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border-2 border-[#E5E7EB] text-[#4B5563] font-semibold hover:bg-slate-50 transition-colors"
                        >
                            WhatsApp Kami
                        </a>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
