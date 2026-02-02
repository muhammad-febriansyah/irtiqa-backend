<?php

namespace App\Services;

class DreamClassificationService
{
    // Classification types
    const CLASSIFICATION_KHAYALI_NAFSANI = 'khayali_nafsani'; // Mundane/everyday dreams
    const CLASSIFICATION_EMOTIONAL = 'emotional'; // Emotionally-driven dreams
    const CLASSIFICATION_SENSITIVE = 'sensitive_indication'; // May need consultation
    const CLASSIFICATION_NEEDS_CONSULTATION = 'needs_consultation'; // Requires consultation

    /**
     * Classify a dream based on its content
     *
     * @param string $content The dream content
     * @param array $context Additional context (physical_condition, emotional_condition, etc.)
     * @return array ['classification' => string, 'confidence' => float, 'reasoning' => string]
     */
    public function classify(string $content, array $context = []): array
    {
        $content = strtolower($content);

        // Check for sensitive/concerning indicators first
        $sensitiveScore = $this->checkSensitiveIndicators($content);
        if ($sensitiveScore > 0.7) {
            return [
                'classification' => self::CLASSIFICATION_NEEDS_CONSULTATION,
                'confidence' => $sensitiveScore,
                'reasoning' => 'Mimpi mengandung indikasi yang perlu didampingi lebih lanjut',
            ];
        }

        // Check for emotional indicators
        $emotionalScore = $this->checkEmotionalIndicators($content, $context);
        if ($emotionalScore > 0.6) {
            return [
                'classification' => self::CLASSIFICATION_EMOTIONAL,
                'confidence' => $emotionalScore,
                'reasoning' => 'Mimpi kemungkinan terkait kondisi emosional',
            ];
        }

        // Check for moderate sensitivity
        if ($sensitiveScore > 0.4) {
            return [
                'classification' => self::CLASSIFICATION_SENSITIVE,
                'confidence' => $sensitiveScore,
                'reasoning' => 'Mimpi mungkin perlu perhatian lebih lanjut',
            ];
        }

        // Default to khayali/nafsani (mundane)
        return [
            'classification' => self::CLASSIFICATION_KHAYALI_NAFSANI,
            'confidence' => 0.8,
            'reasoning' => 'Mimpi kemungkinan bersifat khayali/nafsani biasa',
        ];
    }

    /**
     * Check for sensitive/concerning indicators
     */
    private function checkSensitiveIndicators(string $content): float
    {
        $sensitiveKeywords = [
            // Spiritual/religious concerns
            'jin',
            'sihir',
            'santet',
            'guna-guna',
            'kesurupan',
            'diganggu',
            'makhluk halus',
            'hantu',
            'setan',
            'iblis',

            // Psychological concerns
            'bunuh diri',
            'mati',
            'kematian',
            'mayat',
            'kubur',
            'darah',
            'luka',
            'terluka',
            'menyakiti',
            'disakiti',
            'takut',
            'ketakutan',
            'teror',
            'menakutkan',

            // Trauma indicators
            'diperkosa',
            'dilecehkan',
            'kekerasan',
            'dipukul',
            'dianiaya',
            'trauma',
            'mengerikan',
            'menakutkan',
        ];

        $matchCount = 0;
        $totalKeywords = count($sensitiveKeywords);

        foreach ($sensitiveKeywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $matchCount++;
            }
        }

        return min($matchCount / 3, 1.0); // Max score of 1.0 if 3+ keywords match
    }

    /**
     * Check for emotional indicators
     */
    private function checkEmotionalIndicators(string $content, array $context): float
    {
        $emotionalKeywords = [
            'sedih',
            'menangis',
            'kecewa',
            'marah',
            'kesal',
            'cemas',
            'khawatir',
            'gelisah',
            'bingung',
            'senang',
            'gembira',
            'bahagia',
            'tertawa',
            'rindu',
            'kangen',
            'kehilangan',
        ];

        $matchCount = 0;
        foreach ($emotionalKeywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $matchCount++;
            }
        }

        $baseScore = min($matchCount / 4, 0.7);

        // Boost score if emotional_condition indicates stress
        if (isset($context['emotional_condition'])) {
            $stressfulConditions = ['sad', 'anxious', 'angry'];
            if (in_array($context['emotional_condition'], $stressfulConditions)) {
                $baseScore += 0.2;
            }
        }

        return min($baseScore, 1.0);
    }

    /**
     * Get suggested actions based on classification
     */
    public function getSuggestedActions(string $classification): array
    {
        switch ($classification) {
            case self::CLASSIFICATION_NEEDS_CONSULTATION:
                return [
                    'action' => 'consult',
                    'title' => 'Sebaiknya Didampingi',
                    'message' => 'Mimpi ini sebaiknya didiskusikan dengan pendamping untuk klarifikasi lebih lanjut.',
                    'suggestions' => [
                        'Ajukan pendampingan untuk diskusi lebih lanjut',
                        'Jaga ibadah rutin dan doa perlindungan',
                        'Hindari memikirkan mimpi secara berlebihan',
                    ],
                ];

            case self::CLASSIFICATION_SENSITIVE:
                return [
                    'action' => 'monitor',
                    'title' => 'Perhatikan dengan Tenang',
                    'message' => 'Mimpi ini mungkin terkait kondisi tertentu. Jika berulang atau mengganggu, pertimbangkan untuk berkonsultasi.',
                    'suggestions' => [
                        'Catat jika mimpi serupa berulang',
                        'Jaga kesehatan fisik dan mental',
                        'Perbanyak dzikir dan doa',
                        'Pertimbangkan konsultasi jika terus mengganggu',
                    ],
                ];

            case self::CLASSIFICATION_EMOTIONAL:
                return [
                    'action' => 'self_care',
                    'title' => 'Jaga Kesehatan Emosional',
                    'message' => 'Mimpi ini kemungkinan terkait kondisi emosional. Fokus pada perawatan diri dan ketenangan.',
                    'suggestions' => [
                        'Istirahat yang cukup',
                        'Kelola stres dengan baik',
                        'Lakukan aktivitas yang menenangkan',
                        'Berbagi dengan orang terpercaya jika perlu',
                    ],
                ];

            case self::CLASSIFICATION_KHAYALI_NAFSANI:
            default:
                return [
                    'action' => 'ignore',
                    'title' => 'Tidak Perlu Dipikirkan',
                    'message' => 'Mimpi ini kemungkinan bersifat biasa (khayali/nafsani). Tidak perlu diinterpretasikan secara khusus.',
                    'suggestions' => [
                        'Fokus pada ibadah dan aktivitas positif',
                        'Tidak perlu mencari makna khusus',
                        'Jaga pola tidur yang sehat',
                    ],
                ];
        }
    }
}
