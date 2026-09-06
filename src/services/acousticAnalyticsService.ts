import { VoiceCompareReport, TajweedMistake, ReciterInfo } from '../types';
import { achievementService } from './achievementService';

class AcousticAnalyticsService {
  private reportsCache: Map<string, VoiceCompareReport> = new Map();

  /**
   * Generates a comprehensive acoustic and phonetic comparison report
   * comparing the student's vocal recording with the master scholar.
   */
  public generateReport(mistake: TajweedMistake, reciter: ReciterInfo): VoiceCompareReport {
    const reportKey = `${mistake.id}_${reciter.id}`;
    if (this.reportsCache.has(reportKey)) {
      return this.reportsCache.get(reportKey)!;
    }

    const isHarakahSlip = mistake.mistakeType === 'wrong_harakah';
    const harakahDetail = mistake.harakahDetail;

    // Calculate simulated match scores based on mistake context
    const pitchScore = Math.floor(82 + Math.random() * 12); // 82 - 94%
    const durationScore = isHarakahSlip ? 74 : 88;
    const formantScore = isHarakahSlip ? 68 : 91;
    const ghunnahScore = mistake.tajweedRule === 'Ghunnah' ? 76 : 94;
    const pacingScore = Math.floor(86 + Math.random() * 8);

    const overallMatch = Math.round(
      pitchScore * 0.2 +
      durationScore * 0.25 +
      formantScore * 0.3 +
      ghunnahScore * 0.15 +
      pacingScore * 0.1
    );

    // Formant measurements (F1 jaw opening, F2 tongue anteriority)
    const formants = [
      {
        label: 'F1: Jaw Aperture (Acoustic Height)',
        labelArabic: 'التردد الأول F1: فتحة الفك وخفض الفك السفلي',
        userHz: isHarakahSlip ? 540 : 340,
        targetHz: 310,
        differenceHz: isHarakahSlip ? +230 : +30,
        explanation: isHarakahSlip
          ? 'Your jaw remained slightly too open on the Kasrah, causing the vowel acoustic envelope to shift towards a Dammah/Fathah resonance.'
          : 'Pristine vertical jaw position maintaining precise vowel depth.',
        explanationArabic: isHarakahSlip
          ? 'ظل الفك منفتحاً أكثر من اللازم عند نطق الكسرة، مما جعل الرنين الصوتي ينحرف نحو الضمة أو الفتحة.'
          : 'استقرار ممتاز في فتحة الفك السفلي محققاً صفاء الكسرة.'
      },
      {
        label: 'F2: Tongue Anteriority (Frontal Articulation)',
        labelArabic: 'التردد الثاني F2: ارتفاع وسط اللسان نحو الحنك',
        userHz: isHarakahSlip ? 1720 : 2180,
        targetHz: 2250,
        differenceHz: isHarakahSlip ? -530 : -70,
        explanation: isHarakahSlip
          ? 'Insufficient elevation of the center of the tongue toward the hard palate, reducing Kasrah brightness.'
          : 'High center tongue posture matches the classical scholarly articulation.',
        explanationArabic: isHarakahSlip
          ? 'عدم ارتفاع وسط اللسان بالقدر الكافي نحو الحنك الأعلى، مما قلل من جلاء ونقاء صوت الكسرة.'
          : 'ارتفاع دقيق لوسط اللسان مطابق للنطق الفصيح عند كبار القراء.'
      },
      {
        label: 'F3: Pharyngeal Constriction & Timbre',
        labelArabic: 'التردد الثالث F3: رنين الحلق والنغمة الرخيمة',
        userHz: 2850,
        targetHz: 2980,
        differenceHz: -130,
        explanation: `Balanced pharyngeal warmth aligned with ${reciter.name}'s vocal cadence.`,
        explanationArabic: `رنين حلقي متوازن ونغمة ترتيل قريبة من رنين الشيخ (${reciter.name}).`
      }
    ];

    // Detailed Acoustic Metrics Breakdown
    const metrics = [
      {
        name: 'Vowel Duration & Harakah Timing',
        nameArabic: 'زمن الحركة ومقدار المد الصوتي',
        userScore: durationScore,
        targetScore: 95,
        userValueText: '0.18s (Slightly rushed)',
        targetValueText: '0.25s (Tartil standard)',
        category: 'duration' as const,
        status: durationScore >= 85 ? 'optimal' : ('needs_adjustment' as const),
        feedback: 'Extend the vowel duration slightly to give the Kasrah full auditory presence.',
        feedbackArabic: 'ينبغي إعطاء الكسرة زمنها الكامل دون خطف أو تعجل لتحقيق الإشباع الصحيح للحركة.'
      },
      {
        name: 'Formant Vowel Purity (F1/F2 Shift)',
        nameArabic: 'نقاء الحركة الصوتية وتمايز الحركات',
        userScore: formantScore,
        targetScore: 92,
        userValueText: isHarakahSlip ? '68% (Vowel blending)' : '92% (Clear)',
        targetValueText: '95%+ (Pristine distinction)',
        category: 'formants' as const,
        status: formantScore >= 85 ? 'optimal' : ('needs_adjustment' as const),
        feedback: isHarakahSlip
          ? 'Acoustic overlap detected between Kasrah and Dammah. Lower mandibular tension.'
          : 'Crisp phonetic boundaries observed.',
        feedbackArabic: isHarakahSlip
          ? 'تم رصد تداخل صوتي بين الكسرة والضمة. اخفض الفك السفلي بارتخاء واضغط مخرج الكسرة.'
          : 'وضوح وتمييز ممتاز بين الحركات.'
      },
      {
        name: 'Pitch Contour & Maqam Inflection',
        nameArabic: 'استقرار النبرة والنغمة الترتيلية (المقام)',
        userScore: pitchScore,
        targetScore: 90,
        userValueText: '±14 cents deviation',
        targetValueText: '±10 cents reference',
        category: 'pitch' as const,
        status: 'acceptable' as const,
        feedback: `Harmonious pitch curvature gracefully mimicking ${reciter.name}'s recitation flow.`,
        feedbackArabic: `منحنى نغمي خاشع ومنضبط يتناغم مع أسلوب تلاوة ${reciter.name}.`
      },
      {
        name: 'Ghunnah & Nasal Resonance Ratio',
        nameArabic: 'توازن الخيشوم والغنة ومجرى الهواء الفموي',
        userScore: ghunnahScore,
        targetScore: 95,
        userValueText: '2.1 dB Nasal Ratio',
        targetValueText: '2.0 dB Optimal',
        category: 'ghunnah' as const,
        status: 'optimal' as const,
        feedback: 'Pristine oral airflow without unintended nasal leakage during plain vowels.',
        feedbackArabic: 'صفاء هوائي فموي ممتاز دون تسرب غير مرغوب فيه للخيشوم أثناء نطق الحركات.'
      },
      {
        name: 'Cadence & Syllabic Pacing',
        nameArabic: 'الوتيرة الإيقاعية وسرعة الترتيل',
        userScore: pacingScore,
        targetScore: 90,
        userValueText: '3.1 syl/sec',
        targetValueText: `${reciter.speed} (~2.8 syl/sec)`,
        category: 'pacing' as const,
        status: 'optimal' as const,
        feedback: 'Calm, measured pace suited for reflective memorization retention.',
        feedbackArabic: 'سرعة ترتيل متأنية وهادئة تناسب التثبيت والتدبر القرآني.'
      }
    ];

    // Simulated dual spectrogram time-slice points
    const spectrogramPoints = Array.from({ length: 32 }, (_, i) => {
      const timeMs = Math.round((i / 31) * 1200); // 1.2s clip
      const isDiscrepancy = isHarakahSlip && i >= 11 && i <= 17;
      const baseAmp = Math.sin((i / 31) * Math.PI) * 0.85;

      return {
        timeMs,
        userAmplitude: Math.max(0.1, isDiscrepancy ? baseAmp * 0.55 : baseAmp * (0.85 + Math.random() * 0.15)),
        scholarAmplitude: Math.max(0.15, baseAmp * 0.95),
        isDiscrepancy
      };
    });

    // Actionable AI Coach Recommendations
    const keyRecommendations = [
      {
        title: 'Mandibular Jaw Tension & Elevation',
        titleArabic: 'خفض الفك السفلي بارتخاء',
        description:
          'Drop your lower jaw naturally by approximately 3 millimeters on the Kasrah of this word. Avoid compressing your lips.',
        descriptionArabic:
          'اخفض الفك السفلي بمقدار طبيعي ومريح عند نطق الكسرة مع الحذر من ضم الشفتين.',
        actionType: 'jaw_aperture' as const
      },
      {
        title: 'Lingual Center Height',
        titleArabic: 'رفع وسط اللسان نحو الحنك الأعلى',
        description:
          'Elevate the middle blade of the tongue toward the hard palate to sharpen the acoustic brightness of the Kasrah.',
        descriptionArabic:
          'ارفع وسط اللسان قليلاً باتجاه الحنك الصلب لإنتاج رنين الكسرة الصافي والفصيح.',
        actionType: 'tongue_elevation' as const
      },
      {
        title: 'Tartil Rhythm Stability',
        titleArabic: 'تثبيت زمن الترتيل ومطابقة الشيخ',
        description:
          `Align with ${reciter.name}'s breath cadence: pause for a micro-beat before releasing the consonant.`,
        descriptionArabic:
          `حاكِ نفس الشيخ (${reciter.name}) وتأنَّ قبل الانتقال للحرف التالي لتحقيق السكينة في الترتيل.`,
        actionType: 'tempo' as const
      }
    ];

    // Award / Trigger badge progress for comparing with scholars
    achievementService.unlockBadge('acoustic_scholar');

    const report: VoiceCompareReport = {
      id: `report_${Date.now()}`,
      mistakeId: mistake.id,
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      overallMatchPercentage: overallMatch,
      scholarName: reciter.name,
      scholarGender: reciter.gender,
      wordArabic: mistake.wordArabic,
      ayahReference: `${mistake.surahName} : Ayah ${mistake.ayahNumber}`,
      metrics,
      formants,
      spectrogramPoints,
      keyRecommendations,
      badgeProgressImpact: {
        badgeId: 'acoustic_scholar',
        badgeTitle: 'Acoustic Scholar (المستمع الحصيف)',
        pointsEarned: 50
      }
    };

    this.reportsCache.set(reportKey, report);
    return report;
  }

  /**
   * Clears report cache if a user re-records an attempt
   */
  public invalidateReport(mistakeId: string): void {
    for (const key of this.reportsCache.keys()) {
      if (key.startsWith(mistakeId)) {
        this.reportsCache.delete(key);
      }
    }
  }
}

export const acousticAnalyticsService = new AcousticAnalyticsService();
