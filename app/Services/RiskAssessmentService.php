<?php

namespace App\Services;

class RiskAssessmentService
{
    // Risk levels
    const RISK_LOW = 'low';
    const RISK_MEDIUM = 'medium';
    const RISK_HIGH = 'high';
    const RISK_CRITICAL = 'critical';

    /**
     * Assess risk level based on consultation content
     *
     * @param string $content The consultation description
     * @param array $context Additional context
     * @return array ['risk_level' => string, 'risk_flags' => array, 'requires_escalation' => bool]
     */
    public function assess(string $content, array $context = []): array
    {
        $content = strtolower($content);
        $riskFlags = [];
        $scores = [];

        // Check for critical indicators
        $suicideScore = $this->checkSuicideRisk($content);
        if ($suicideScore > 0) {
            $riskFlags[] = 'suicide_ideation';
            $scores[] = $suicideScore * 10; // Weight heavily
        }

        $psychosisScore = $this->checkPsychosisIndicators($content);
        if ($psychosisScore > 0) {
            $riskFlags[] = 'psychosis_indication';
            $scores[] = $psychosisScore * 8;
        }

        $traumaScore = $this->checkTraumaIndicators($content);
        if ($traumaScore > 0) {
            $riskFlags[] = 'severe_trauma';
            $scores[] = $traumaScore * 7;
        }

        $dissociationScore = $this->checkDissociationIndicators($content);
        if ($dissociationScore > 0) {
            $riskFlags[] = 'dissociation';
            $scores[] = $dissociationScore * 6;
        }

        $delusionScore = $this->checkDelusionIndicators($content);
        if ($delusionScore > 0) {
            $riskFlags[] = 'delusion';
            $scores[] = $delusionScore * 7;
        }

        // Calculate overall risk
        $totalScore = empty($scores) ? 0 : array_sum($scores) / count($scores);

        // Determine risk level
        if ($totalScore >= 8 || $suicideScore > 0.7) {
            $riskLevel = self::RISK_CRITICAL;
            $requiresEscalation = true;
        } elseif ($totalScore >= 6) {
            $riskLevel = self::RISK_HIGH;
            $requiresEscalation = true;
        } elseif ($totalScore >= 3) {
            $riskLevel = self::RISK_MEDIUM;
            $requiresEscalation = false;
        } else {
            $riskLevel = self::RISK_LOW;
            $requiresEscalation = false;
        }

        return [
            'risk_level' => $riskLevel,
            'risk_flags' => $riskFlags,
            'requires_escalation' => $requiresEscalation,
            'risk_score' => round($totalScore, 2),
        ];
    }

    /**
     * Check for suicide risk indicators
     */
    private function checkSuicideRisk(string $content): float
    {
        $criticalKeywords = [
            'bunuh diri',
            'ingin mati',
            'mengakhiri hidup',
            'tidak ingin hidup',
            'lebih baik mati',
            'mau mati',
            'pengen mati',
            'suicide',
        ];

        $moderateKeywords = [
            'putus asa',
            'tidak ada harapan',
            'tidak berguna',
            'beban',
            'menyerah',
            'capek hidup',
            'lelah hidup',
        ];

        $criticalCount = 0;
        $moderateCount = 0;

        foreach ($criticalKeywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $criticalCount++;
            }
        }

        foreach ($moderateKeywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $moderateCount++;
            }
        }

        if ($criticalCount > 0) {
            return 1.0; // Maximum risk
        }

        return min($moderateCount * 0.3, 0.8);
    }

    /**
     * Check for psychosis indicators
     */
    private function checkPsychosisIndicators(string $content): float
    {
        $keywords = [
            'mendengar suara',
            'suara-suara',
            'bisikan',
            'ada yang berbicara',
            'melihat hal',
            'penglihatan',
            'halusinasi',
            'diawasi',
            'diikuti',
            'diintai',
            'konspirasi',
            'kekuatan khusus',
            'dipilih',
            'misi khusus',
            'tidak nyata',
            'realitas berbeda',
        ];

        $matchCount = 0;
        foreach ($keywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $matchCount++;
            }
        }

        return min($matchCount * 0.25, 1.0);
    }

    /**
     * Check for trauma indicators
     */
    private function checkTraumaIndicators(string $content): float
    {
        $keywords = [
            'diperkosa',
            'perkosaan',
            'dilecehkan',
            'pelecehan seksual',
            'kekerasan',
            'dipukul',
            'dianiaya',
            'disiksa',
            'trauma',
            'ptsd',
            'flashback',
            'mimpi buruk terus',
            'tidak bisa tidur',
            'ketakutan terus',
            'panik',
        ];

        $matchCount = 0;
        foreach ($keywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $matchCount++;
            }
        }

        return min($matchCount * 0.3, 1.0);
    }

    /**
     * Check for dissociation indicators
     */
    private function checkDissociationIndicators(string $content): float
    {
        $keywords = [
            'tidak ingat',
            'kehilangan waktu',
            'blackout',
            'seperti orang lain',
            'bukan diri sendiri',
            'kepribadian berbeda',
            'keluar dari tubuh',
            'melihat diri sendiri',
            'tidak sadar',
            'hilang kesadaran',
        ];

        $matchCount = 0;
        foreach ($keywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $matchCount++;
            }
        }

        return min($matchCount * 0.3, 1.0);
    }

    /**
     * Check for delusion indicators
     */
    private function checkDelusionIndicators(string $content): float
    {
        $keywords = [
            'yakin pasti',
            'saya tahu pasti',
            'ini pasti',
            'disihir',
            'diguna-guna',
            'disantet',
            'dikutuk',
            'jin menguasai',
            'kerasukan',
            'dirasuki',
            'semua orang',
            'mereka semua',
            'konspirasi',
        ];

        $matchCount = 0;
        foreach ($keywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $matchCount++;
            }
        }

        return min($matchCount * 0.25, 1.0);
    }

    /**
     * Get recommended actions based on risk level
     */
    public function getRecommendedActions(string $riskLevel, array $riskFlags): array
    {
        switch ($riskLevel) {
            case self::RISK_CRITICAL:
                return [
                    'priority' => 'immediate',
                    'actions' => [
                        'Eskalasi ke admin/supervisor segera',
                        'Pertimbangkan rujukan ke profesional kesehatan mental',
                        'Berikan informasi hotline krisis',
                        'Pantau secara intensif',
                    ],
                    'message' => 'Kasus ini memerlukan perhatian segera dan mungkin memerlukan rujukan profesional.',
                ];

            case self::RISK_HIGH:
                return [
                    'priority' => 'urgent',
                    'actions' => [
                        'Prioritaskan penanganan',
                        'Lakukan asesmen lebih mendalam',
                        'Pertimbangkan rujukan jika diperlukan',
                        'Pantau perkembangan',
                    ],
                    'message' => 'Kasus ini memerlukan perhatian khusus dan penanganan yang hati-hati.',
                ];

            case self::RISK_MEDIUM:
                return [
                    'priority' => 'normal',
                    'actions' => [
                        'Lakukan pendampingan dengan perhatian',
                        'Gali lebih dalam saat konsultasi',
                        'Pantau perkembangan',
                    ],
                    'message' => 'Kasus ini memerlukan pendampingan dengan perhatian khusus.',
                ];

            case self::RISK_LOW:
            default:
                return [
                    'priority' => 'routine',
                    'actions' => [
                        'Lakukan pendampingan standar',
                        'Berikan edukasi dan dukungan',
                    ],
                    'message' => 'Kasus ini dapat ditangani dengan pendampingan standar.',
                ];
        }
    }
}
