<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Bagaimana cara mengatasi rasa cemas berlebihan (anxiety)?',
                'answer' => 'Rasa cemas berlebihan dapat diatasi dengan beberapa cara: 1) Rutin berdzikir dan membaca Al-Quran, 2) Melakukan relaksasi dan pernapasan dalam, 3) Olahraga teratur, 4) Menjaga pola tidur yang baik, 5) Konsultasi dengan konselor profesional jika diperlukan. Ingatlah firman Allah SWT: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram" (QS. Ar-Ra\'d: 28)',
                'category' => 'psycho_spiritual',
                'order' => 1,
                'is_published' => true,
                'views_count' => 245,
                'helpful_count' => 189,
                'tags' => json_encode(['anxiety', 'kecemasan', 'mental-health']),
            ],
            [
                'question' => 'Apakah mimpi buruk selalu bermakna negatif?',
                'answer' => 'Tidak semua mimpi buruk bermakna negatif. Dalam Islam, mimpi terbagi menjadi tiga: 1) Mimpi dari Allah (ru\'ya shalihah), 2) Mimpi dari setan, 3) Mimpi dari pikiran sendiri. Jika bermimpi buruk, disunnahkan untuk: meludah ke kiri tiga kali, memohon perlindungan kepada Allah, tidak menceritakan kepada orang lain, mengubah posisi tidur, dan shalat dua rakaat.',
                'category' => 'dream_sleep',
                'order' => 2,
                'is_published' => true,
                'views_count' => 423,
                'helpful_count' => 312,
                'tags' => json_encode(['mimpi', 'mimpi-buruk', 'tafsir-mimpi']),
            ],
            [
                'question' => 'Bagaimana cara mengatasi waswas saat shalat?',
                'answer' => 'Waswas saat shalat dapat diatasi dengan: 1) Memohon perlindungan kepada Allah dari godaan setan sebelum shalat, 2) Fokus pada bacaan dan gerakan shalat, 3) Tidak mengulang-ulang gerakan atau bacaan karena ragu, 4) Berkonsultasi dengan ustadz/ustadzah tentang tata cara shalat yang benar, 5) Istiqomah dalam beribadah dan bersabar menghadapi ujian ini.',
                'category' => 'waswas_worship',
                'order' => 3,
                'is_published' => true,
                'views_count' => 567,
                'helpful_count' => 445,
                'tags' => json_encode(['waswas', 'shalat', 'ibadah']),
            ],
            [
                'question' => 'Bagaimana mendidik anak yang keras kepala?',
                'answer' => 'Mendidik anak yang keras kepala memerlukan pendekatan khusus: 1) Berikan pilihan yang terbatas, bukan perintah langsung, 2) Dengarkan pendapat dan perasaan anak, 3) Konsisten dalam aturan dan konsekuensi, 4) Berikan pujian ketika anak berperilaku baik, 5) Jadilah teladan yang baik, 6) Berdoa untuk kemudahan dalam mendidik anak. Ingat, keras kepala bisa menjadi kelebihan jika diarahkan dengan baik.',
                'category' => 'family_children',
                'order' => 4,
                'is_published' => true,
                'views_count' => 389,
                'helpful_count' => 267,
                'tags' => json_encode(['parenting', 'anak', 'pendidikan']),
            ],
            [
                'question' => 'Bagaimana cara sabar menghadapi ujian hidup yang berat?',
                'answer' => 'Kesabaran dalam menghadapi ujian hidup adalah kunci ketenangan hati: 1) Yakinlah bahwa setiap ujian adalah bentuk kasih sayang Allah, 2) Perbanyak dzikir dan doa, 3) Cari hikmah di balik setiap peristiwa, 4) Berbagi dengan sesama yang juga mengalami kesulitan, 5) Minta dukungan dari keluarga dan teman, 6) Ingat firman Allah: "Sesungguhnya bersama kesulitan ada kemudahan" (QS. Al-Insyirah: 6)',
                'category' => 'facing_trials',
                'order' => 5,
                'is_published' => true,
                'views_count' => 678,
                'helpful_count' => 589,
                'tags' => json_encode(['sabar', 'ujian', 'motivasi']),
            ],
            [
                'question' => 'Apakah gangguan tidur termasuk masalah spiritual?',
                'answer' => 'Gangguan tidur (insomnia) bisa disebabkan oleh faktor fisik, psikologis, maupun spiritual. Dari sisi spiritual, beberapa penyebabnya: jarang berdzikir sebelum tidur, banyak dosa yang belum ditaubati, atau gangguan jin. Solusinya: 1) Baca ayat Kursi dan 3 Qul sebelum tidur, 2) Berwudhu sebelum tidur, 3) Tidur dalam keadaan suci, 4) Hindari maksiat di siang hari, 5) Konsultasi dengan dokter jika masalah berlanjut.',
                'category' => 'dream_sleep',
                'order' => 6,
                'is_published' => true,
                'views_count' => 234,
                'helpful_count' => 178,
                'tags' => json_encode(['insomnia', 'tidur', 'spiritual']),
            ],
            [
                'question' => 'Bagaimana mengatasi rasa bersalah yang berlebihan?',
                'answer' => 'Rasa bersalah yang berlebihan (guilt) perlu disikapi dengan bijak: 1) Bedakan antara rasa bersalah yang wajar dengan waswas, 2) Segera bertaubat dan beristighfar, 3) Perbaiki kesalahan jika masih bisa, 4) Yakinlah bahwa Allah Maha Pengampun, 5) Jangan terus-menerus menyalahkan diri sendiri setelah bertaubat, 6) Fokus pada perbaikan di masa depan. Allah berfirman: "Katakanlah: Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri, janganlah kamu berputus asa dari rahmat Allah." (QS. Az-Zumar: 53)',
                'category' => 'psycho_spiritual',
                'order' => 7,
                'is_published' => true,
                'views_count' => 456,
                'helpful_count' => 389,
                'tags' => json_encode(['guilt', 'tobat', 'self-forgiveness']),
            ],
            [
                'question' => 'Apakah wajar merasa malas beribadah kadang-kadang?',
                'answer' => 'Ya, perasaan malas beribadah adalah ujian yang wajar dialami setiap muslim. Rasulullah SAW bersabda: "Iman itu kadang bertambah dan kadang berkurang." Yang penting adalah: 1) Tetap menjalankan kewajiban meski malas, 2) Perbanyak doa memohon semangat beribadah, 3) Cari teman yang shalih untuk saling mengingatkan, 4) Ikuti kajian atau ceramah untuk menyegarkan iman, 5) Ingat tujuan beribadah adalah ridha Allah dan surga-Nya.',
                'category' => 'waswas_worship',
                'order' => 8,
                'is_published' => true,
                'views_count' => 789,
                'helpful_count' => 623,
                'tags' => json_encode(['malas', 'ibadah', 'motivasi-spiritual']),
            ],
            [
                'question' => 'Bagaimana cara memperbaiki hubungan dengan orangtua yang sudah renggang?',
                'answer' => 'Memperbaiki hubungan dengan orangtua memerlukan kesabaran dan usaha: 1) Mulai dengan doa dan niat yang ikhlas, 2) Minta maaf atas kesalahan yang pernah dilakukan, 3) Berkomunikasi dengan baik dan hormati pendapat mereka, 4) Tunjukkan perhatian melalui tindakan nyata, 5) Sabar menghadapi respons mereka, 6) Sering-sering silaturahmi dan membantu kebutuhan mereka. Ingat, berbakti kepada orangtua adalah pintu surga yang paling dekat.',
                'category' => 'family_children',
                'order' => 9,
                'is_published' => true,
                'views_count' => 512,
                'helpful_count' => 421,
                'tags' => json_encode(['orangtua', 'birrul-walidain', 'keluarga']),
            ],
            [
                'question' => 'Bagaimana menghadapi cobaan yang datang bertubi-tubi?',
                'answer' => 'Ketika cobaan datang bertubi-tubi, ingatlah: 1) Allah tidak akan membebani seseorang melainkan sesuai kesanggupannya (QS. Al-Baqarah: 286), 2) Cobaan adalah tanda Allah mengangkat derajat hamba-Nya, 3) Perbanyak shalat tahajud dan bermunajat kepada Allah, 4) Bersabar dan jangan putus asa, 5) Cari dukungan dari keluarga, teman, atau konselor, 6) Fokus pada solusi, bukan pada masalah. Rasulullah bersabda: "Sungguh menakjubkan urusan orang mukmin, semua urusannya adalah kebaikan baginya."',
                'category' => 'facing_trials',
                'order' => 10,
                'is_published' => true,
                'views_count' => 891,
                'helpful_count' => 756,
                'tags' => json_encode(['cobaan', 'ujian-bertubi-tubi', 'sabar']),
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
