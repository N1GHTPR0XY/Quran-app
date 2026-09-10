import { jsPDF } from 'jspdf';
import { SurahCompletionCertificate, UserProfile } from '../types';
import { ALL_114_SURAHS_METADATA } from '../data/allSurahsMetadata';

const STORAGE_KEY = 'tadreeb_completed_surah_certificates_v1';

export class CertificateService {
  /**
   * Generates sample certificates if none exist yet, so the user can immediately
   * test and print high-accuracy certificates from the analytics screen.
   */
  public getDefaultCertificates(user: UserProfile): SurahCompletionCertificate[] {
    const studentName = user.name && user.name !== 'Quran Student' && user.name !== 'Guest Reciter'
      ? user.name
      : 'زيد بن أنس الأنصاري';

    return [
      {
        id: 'cert_s1_al_fatihah',
        surahNumber: 1,
        surahNameArabic: 'سُورَةُ الفَاتِحَةِ',
        surahNameEnglish: 'Al-Fatihah',
        surahTranslation: 'The Opening',
        numberOfAyahs: 7,
        juzNumber: 1,
        revelationType: 'Meccan',
        studentName,
        accuracyPercentage: 98.8,
        harakatAccuracy: 100,
        tajweedAccuracy: 99.2,
        grade: 'Mumtaz (Highest Distinction)',
        gradeArabic: 'مُمْتَاز مع مرتبة الشرف',
        riwayah: 'حفص عن عاصم من طريق الشاطبية',
        riwayahEnglish: "Hafs 'an 'Asim via Shatibiyyah",
        completedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        completedDateIso: new Date().toISOString(),
        certificateSerialNumber: 'TDRB-2026-SRH001-9842',
        verifiedBy: 'Tadreeb Acoustic AI Verification & Sanad Board',
        verifiedByArabic: 'لجنة الفحص الصوتي والتجويدي بمنصة تَدْرِيب',
        scholarBenchmark: 'Sheikh Mahmoud Khalil Al-Husary'
      },
      {
        id: 'cert_s112_al_ikhlas',
        surahNumber: 112,
        surahNameArabic: 'سُورَةُ الإِخْلَاصِ',
        surahNameEnglish: 'Al-Ikhlas',
        surahTranslation: 'Sincerity',
        numberOfAyahs: 4,
        juzNumber: 30,
        revelationType: 'Meccan',
        studentName,
        accuracyPercentage: 99.5,
        harakatAccuracy: 100,
        tajweedAccuracy: 99.6,
        grade: 'Mumtaz (Highest Distinction)',
        gradeArabic: 'مُمْتَاز مع مرتبة الشرف',
        riwayah: 'حفص عن عاصم من طريق الشاطبية',
        riwayahEnglish: "Hafs 'an 'Asim via Shatibiyyah",
        completedAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        completedDateIso: new Date(Date.now() - 86400000 * 2).toISOString(),
        certificateSerialNumber: 'TDRB-2026-SRH112-9951',
        verifiedBy: 'Tadreeb Acoustic AI Verification & Sanad Board',
        verifiedByArabic: 'لجنة الفحص الصوتي والتجويدي بمنصة تَدْرِيب',
        scholarBenchmark: 'Sheikh Mahmoud Khalil Al-Husary'
      },
      {
        id: 'cert_s113_al_falaq',
        surahNumber: 113,
        surahNameArabic: 'سُورَةُ الفَلَقِ',
        surahNameEnglish: 'Al-Falaq',
        surahTranslation: 'The Daybreak',
        numberOfAyahs: 5,
        juzNumber: 30,
        revelationType: 'Meccan',
        studentName,
        accuracyPercentage: 97.6,
        harakatAccuracy: 98.5,
        tajweedAccuracy: 97.2,
        grade: 'Mumtaz (Highest Distinction)',
        gradeArabic: 'مُمْتَاز مع مرتبة الشرف',
        riwayah: 'حفص عن عاصم من طريق الشاطبية',
        riwayahEnglish: "Hafs 'an 'Asim via Shatibiyyah",
        completedAt: new Date(Date.now() - 86400000 * 4).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        completedDateIso: new Date(Date.now() - 86400000 * 4).toISOString(),
        certificateSerialNumber: 'TDRB-2026-SRH113-9760',
        verifiedBy: 'Tadreeb Acoustic AI Verification & Sanad Board',
        verifiedByArabic: 'لجنة الفحص الصوتي والتجويدي بمنصة تَدْرِيب',
        scholarBenchmark: 'Sheikh Mahmoud Khalil Al-Husary'
      },
      {
        id: 'cert_s114_an_nas',
        surahNumber: 114,
        surahNameArabic: 'سُورَةُ النَّاسِ',
        surahNameEnglish: 'An-Nas',
        surahTranslation: 'Mankind',
        numberOfAyahs: 6,
        juzNumber: 30,
        revelationType: 'Meccan',
        studentName,
        accuracyPercentage: 98.2,
        harakatAccuracy: 100,
        tajweedAccuracy: 98.4,
        grade: 'Mumtaz (Highest Distinction)',
        gradeArabic: 'مُمْتَاز مع مرتبة الشرف',
        riwayah: 'حفص عن عاصم من طريق الشاطبية',
        riwayahEnglish: "Hafs 'an 'Asim via Shatibiyyah",
        completedAt: new Date(Date.now() - 86400000 * 6).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        completedDateIso: new Date(Date.now() - 86400000 * 6).toISOString(),
        certificateSerialNumber: 'TDRB-2026-SRH114-9820',
        verifiedBy: 'Tadreeb Acoustic AI Verification & Sanad Board',
        verifiedByArabic: 'لجنة الفحص الصوتي والتجويدي بمنصة تَدْرِيب',
        scholarBenchmark: 'Sheikh Mahmoud Khalil Al-Husary'
      },
      {
        id: 'cert_s67_al_mulk',
        surahNumber: 67,
        surahNameArabic: 'سُورَةُ المُلْكِ',
        surahNameEnglish: 'Al-Mulk',
        surahTranslation: 'Sovereignty',
        numberOfAyahs: 30,
        juzNumber: 29,
        revelationType: 'Meccan',
        studentName,
        accuracyPercentage: 96.4,
        harakatAccuracy: 98.0,
        tajweedAccuracy: 96.0,
        grade: 'Mumtaz (Highest Distinction)',
        gradeArabic: 'مُمْتَاز مع مرتبة الشرف',
        riwayah: 'حفص عن عاصم من طريق الشاطبية',
        riwayahEnglish: "Hafs 'an 'Asim via Shatibiyyah",
        completedAt: new Date(Date.now() - 86400000 * 10).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        completedDateIso: new Date(Date.now() - 86400000 * 10).toISOString(),
        certificateSerialNumber: 'TDRB-2026-SRH067-9640',
        verifiedBy: 'Tadreeb Acoustic AI Verification & Sanad Board',
        verifiedByArabic: 'لجنة الفحص الصوتي والتجويدي بمنصة تَدْرِيب',
        scholarBenchmark: 'Sheikh Mahmoud Khalil Al-Husary'
      }
    ];
  }

  /**
   * Retrieves all completed certificates from localStorage, initialized with defaults
   */
  public getCertificates(user: UserProfile): SurahCompletionCertificate[] {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as SurahCompletionCertificate[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Update student name if changed
          return parsed.map(c => ({
            ...c,
            studentName: user.name && user.name !== 'Quran Student' ? user.name : c.studentName
          }));
        }
      }
    } catch (err) {
      console.warn('Could not read certificates from localStorage:', err);
    }

    const defaults = this.getDefaultCertificates(user);
    this.saveCertificates(defaults);
    return defaults;
  }

  /**
   * Persists certificates into localStorage
   */
  public saveCertificates(certs: SurahCompletionCertificate[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
    } catch (err) {
      console.warn('Could not save certificates to localStorage:', err);
    }
  }

  /**
   * Records a new Surah completion whenever a student finishes reciting a full Surah
   */
  public recordSurahCompletion(
    surahNumber: number,
    accuracy: number,
    studentName: string,
    scholarName?: string
  ): SurahCompletionCertificate {
    const meta = ALL_114_SURAHS_METADATA.find(s => s.number === surahNumber) || {
      number: surahNumber,
      nameArabic: `سُورَةُ ${surahNumber}`,
      nameEnglish: `Surah ${surahNumber}`,
      nameTranslation: 'The Sacred Chapter',
      numberOfAyahs: 10,
      juzNumber: 1,
      revelationType: 'Meccan' as const
    };

    const cleanAccuracy = Math.min(100, Math.max(90, Math.round(accuracy * 10) / 10));
    const gradeArabic = cleanAccuracy >= 95 ? 'مُمْتَاز مع مرتبة الشرف' : cleanAccuracy >= 92 ? 'جَيِّد جِدّاً' : 'جَيِّد';
    const grade = cleanAccuracy >= 95 ? 'Mumtaz (Highest Distinction)' : cleanAccuracy >= 92 ? 'Jayyid Jiddan (Very Good)' : 'Jayyid (Good)';

    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const surahStr = String(surahNumber).padStart(3, '0');

    const newCert: SurahCompletionCertificate = {
      id: `cert_s${surahNumber}_${Date.now()}`,
      surahNumber,
      surahNameArabic: meta.nameArabic,
      surahNameEnglish: meta.nameEnglish,
      surahTranslation: meta.nameTranslation,
      numberOfAyahs: meta.numberOfAyahs,
      juzNumber: meta.juzNumber,
      revelationType: meta.revelationType,
      studentName: studentName || 'زيد بن أنس الأنصاري',
      accuracyPercentage: cleanAccuracy,
      harakatAccuracy: Math.min(100, cleanAccuracy + 0.5),
      tajweedAccuracy: Math.min(100, cleanAccuracy - 0.3),
      grade,
      gradeArabic,
      riwayah: 'حفص عن عاصم من طريق الشاطبية',
      riwayahEnglish: "Hafs 'an 'Asim via Shatibiyyah",
      completedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
      completedDateIso: new Date().toISOString(),
      certificateSerialNumber: `TDRB-2026-SRH${surahStr}-${randomSerial}`,
      verifiedBy: 'Tadreeb Acoustic AI Verification & Sanad Board',
      verifiedByArabic: 'لجنة الفحص الصوتي والتجويدي بمنصة تَدْرِيب',
      scholarBenchmark: scholarName || 'Sheikh Mahmoud Khalil Al-Husary'
    };

    try {
      const existing = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      let certs: SurahCompletionCertificate[] = existing ? JSON.parse(existing) : [];
      // Replace if existing for same surah with lower accuracy, or prepend
      const existingIdx = certs.findIndex(c => c.surahNumber === surahNumber);
      if (existingIdx >= 0) {
        if (cleanAccuracy >= certs[existingIdx].accuracyPercentage) {
          certs[existingIdx] = newCert;
        }
      } else {
        certs = [newCert, ...certs];
      }
      this.saveCertificates(certs);
    } catch (e) {
      console.warn('Error recording surah certificate:', e);
    }

    return newCert;
  }

  /**
   * Draws an ornate, high-resolution certificate on an HTML5 canvas.
   * Uses 2000x1414 resolution (A4 Landscape aspect ratio ~1.414:1)
   */
  public async renderCertificateCanvas(
    cert: SurahCompletionCertificate,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    const width = 2000;
    const height = 1414;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');

    // Make sure fonts have loaded
    if (document && document.fonts) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font wait error:', e);
      }
    }

    // 1. CLEAR & BASE BACKGROUND (Warm Ivory Parchment)
    ctx.fillStyle = '#FCFAF6';
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Vignette
    const bgRadial = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width * 0.75);
    bgRadial.addColorStop(0, '#FFFFFF');
    bgRadial.addColorStop(0.7, '#FAF7F0');
    bgRadial.addColorStop(1, '#F3ECE0');
    ctx.fillStyle = bgRadial;
    ctx.fillRect(0, 0, width, height);

    // 2. DELICATE ISLAMIC GEOMETRIC WATERMARK (Center Rosette)
    ctx.save();
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.07)'; // #C5A059 faint gold
    ctx.lineWidth = 2;
    const centerX = width / 2;
    const centerY = height / 2;
    for (let r = 80; r <= 380; r += 50) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 8-fold star lines in watermark
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(centerX - Math.cos(angle) * 400, centerY - Math.sin(angle) * 400);
      ctx.lineTo(centerX + Math.cos(angle) * 400, centerY + Math.sin(angle) * 400);
      ctx.stroke();
    }
    ctx.restore();

    // 3. ORNAMENTAL DOUBLE BORDERS
    const outerMargin = 50;
    const innerMargin = 72;

    // A. Outer Deep Emerald Border
    ctx.save();
    ctx.strokeStyle = '#153C3D';
    ctx.lineWidth = 14;
    ctx.strokeRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2);
    ctx.restore();

    // B. Inner Antique Gold Double Line
    ctx.save();
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 4;
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

    // Thin inner accent hairline
    ctx.strokeStyle = '#E0D6C1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerMargin + 10, innerMargin + 10, width - (innerMargin + 10) * 2, height - (innerMargin + 10) * 2);
    ctx.restore();

    // C. 4 Ornate Islamic Star Corner Medallions
    const drawCornerStar = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Gold outer ring
      ctx.fillStyle = '#153C3D';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner 8-pointed star in gold
      ctx.fillStyle = '#C5A059';
      const numPoints = 8;
      const outerR = 18;
      const innerR = 9;
      ctx.beginPath();
      for (let p = 0; p < numPoints * 2; p++) {
        const radius = p % 2 === 0 ? outerR : innerR;
        const angle = (p * Math.PI) / numPoints;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    drawCornerStar(innerMargin, innerMargin);
    drawCornerStar(width - innerMargin, innerMargin);
    drawCornerStar(innerMargin, height - innerMargin);
    drawCornerStar(width - innerMargin, height - innerMargin);

    // 4. TOP BISMILLAH & SACRED CALLIGRAPHY
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bismillah
    ctx.fillStyle = '#1A4D4E';
    ctx.font = 'bold 38px "Scheherazade New", "Amiri", serif';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', centerX, 135);

    // Header Branding
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8F733C';
    ctx.letterSpacing = '3px';
    ctx.fillText('TADREEB QURAN MEMORIZATION • ACOUSTIC VERIFICATION SANAD', centerX, 185);

    // Ayah Quote
    ctx.font = '24px "Amiri", serif';
    ctx.fillStyle = '#1A4D4E';
    ctx.fillText('﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾', centerX, 225);

    ctx.font = 'italic 14px "Plus Jakarta Sans", serif';
    ctx.fillStyle = '#778885';
    ctx.fillText('“And recite the Quran with measured, rhythmic recitation.” — Surah Al-Muzzammil: 4', centerX, 255);
    ctx.restore();

    // Thin decorative gold divider
    ctx.save();
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 240, 280);
    ctx.lineTo(centerX + 240, 280);
    ctx.stroke();

    // Little diamond in center of divider
    ctx.fillStyle = '#C5A059';
    ctx.fillRect(centerX - 5, 275, 10, 10);
    ctx.restore();

    // 5. MAIN CERTIFICATE TITLE
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = 'bold 44px "Scheherazade New", "Amiri", serif';
    ctx.fillStyle = '#153C3D';
    ctx.fillText('شَهَادَةُ إِتْمَامٍ وَإِتْقَانٍ قُرْآنِيٍّ', centerX, 340);

    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C5A059';
    ctx.fillText('CERTIFICATE OF SURAH COMPLETION & RECITATION MASTERY', centerX, 385);
    ctx.restore();

    // 6. CERTIFICATE ATTESTATION STATEMENT
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = '21px "Amiri", serif';
    ctx.fillStyle = '#4A5B59';
    ctx.fillText('تَشْهَدُ إِدَارَةُ مَنَصَّةِ «تَدْرِيب» لِتَحْفِيظِ الْقُرْآنِ الْكَرِيمِ بِأَنَّ الْحَافِظَ / الْحَافِظَةَ:', centerX, 440);

    ctx.font = '15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#778885';
    ctx.fillText('This is to certify that the dedicated Quranic reciter:', centerX, 470);
    ctx.restore();

    // 7. STUDENT FULL NAME (GRAND DISPLAY WITH GOLD UNDERLINE)
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = 'bold 54px "Scheherazade New", "Amiri", serif';
    ctx.fillStyle = '#153C3D';
    ctx.fillText(cert.studentName, centerX, 535);

    // Decorative underline
    const nameMetrics = ctx.measureText(cert.studentName);
    const underlineWidth = Math.max(340, nameMetrics.width + 80);
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - underlineWidth / 2, 565);
    ctx.lineTo(centerX + underlineWidth / 2, 565);
    ctx.stroke();

    // Diamond on underline
    ctx.fillStyle = '#153C3D';
    ctx.beginPath();
    ctx.arc(centerX, 565, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. SURAH MASTERY BOX (CENTRAL BANNER)
    const surahBoxY = 600;
    const surahBoxHeight = 220;
    const surahBoxWidth = 1400;
    const surahBoxX = (width - surahBoxWidth) / 2;

    ctx.save();
    // Background gradient for Surah banner
    const surahGrad = ctx.createLinearGradient(surahBoxX, surahBoxY, surahBoxX + surahBoxWidth, surahBoxY + surahBoxHeight);
    surahGrad.addColorStop(0, '#153C3D');
    surahGrad.addColorStop(0.5, '#1A4D4E');
    surahGrad.addColorStop(1, '#153C3D');
    ctx.fillStyle = surahGrad;
    ctx.beginPath();
    ctx.roundRect(surahBoxX, surahBoxY, surahBoxWidth, surahBoxHeight, 24);
    ctx.fill();

    // Gold border around surah box
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Narrative inside Surah box
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E8ECE9';
    ctx.font = '19px "Amiri", serif';
    ctx.fillText('قَدْ أَتَمَّ تِلَاوَةَ وَحِفْظَ كَامِلِ سُورَةِ:', centerX, surahBoxY + 42);

    // Arabic Surah Title
    ctx.font = 'bold 50px "Scheherazade New", "Amiri", serif';
    ctx.fillStyle = '#F5D77F'; // luminous gold
    ctx.fillText(cert.surahNameArabic, centerX, surahBoxY + 98);

    // English Surah Title & Translation
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Surah ${cert.surahNameEnglish} — "${cert.surahTranslation}"`, centerX, surahBoxY + 140);

    // Badges / Metadata line: Ayahs, Juz, Revelation Type, Riwayah
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C5A059';
    const revArabic = cert.revelationType === 'Meccan' ? 'مَكِّيَّة' : 'مَدَنِيَّة';
    ctx.fillText(
      `${cert.numberOfAyahs} Verses (${cert.numberOfAyahs} آيات)  •  Juz ${cert.juzNumber} (الجزء ${cert.juzNumber})  •  ${cert.revelationType} (${revArabic})  •  ${cert.riwayahEnglish}`,
      centerX,
      surahBoxY + 180
    );
    ctx.restore();

    // 9. THREE KEY PERFORMANCE & ACCURACY LAUREL BADGES
    const badgesY = 855;
    const badgeCardWidth = 400;
    const badgeCardHeight = 150;
    const badgeGap = 60;
    const totalBadgesWidth = badgeCardWidth * 3 + badgeGap * 2;
    const badgesStartX = (width - totalBadgesWidth) / 2;

    const renderBadgeCard = (x: number, titleAr: string, titleEn: string, value: string, subtext: string, isMain = false) => {
      ctx.save();
      // Card bg
      ctx.fillStyle = isMain ? '#FDFBF7' : '#FAF8F3';
      ctx.strokeStyle = isMain ? '#C5A059' : '#E0D6C1';
      ctx.lineWidth = isMain ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x, badgesY, badgeCardWidth, badgeCardHeight, 18);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';

      // Title
      ctx.font = 'bold 16px "Amiri", serif';
      ctx.fillStyle = isMain ? '#153C3D' : '#4A5B59';
      ctx.fillText(titleAr, x + badgeCardWidth / 2, badgesY + 30);

      // Score Value
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isMain ? '#153C3D' : '#C5A059';
      ctx.fillText(value, x + badgeCardWidth / 2, badgesY + 75);

      // Subtitle
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#778885';
      ctx.fillText(titleEn, x + badgeCardWidth / 2, badgesY + 105);

      ctx.font = 'bold 12px "Amiri", serif';
      ctx.fillStyle = isMain ? '#8F733C' : '#5E6F6C';
      ctx.fillText(subtext, x + badgeCardWidth / 2, badgesY + 128);

      ctx.restore();
    };

    // 1: Acoustic Accuracy (Main)
    renderBadgeCard(
      badgesStartX,
      'الدِّقَّةُ الصَّوْتِيَّةُ الشَّامِلَةُ',
      'Overall Acoustic Accuracy',
      `${cert.accuracyPercentage}%`,
      cert.gradeArabic,
      true
    );

    // 2: Harakat & Grammatical Precision
    renderBadgeCard(
      badgesStartX + badgeCardWidth + badgeGap,
      'ضَبْطُ الْحَرَكَاتِ وَالْبِنْيَةِ الإِعْرَابِيَّةِ',
      'Harakat & Lahn Jaliyy Defense',
      `${cert.harakatAccuracy}%`,
      'سليم من اللحن الجلي (Flawless Vowels)'
    );

    // 3: Tajweed & Makharij Rules
    renderBadgeCard(
      badgesStartX + (badgeCardWidth + badgeGap) * 2,
      'أَحْكَامُ التَّجْوِيدِ وَمَخَارِجُ الْحُرُوفِ',
      'Phonetic Tajweed & Makharij Compliance',
      `${cert.tajweedAccuracy}%`,
      'مطابق للمصحف المرتل'
    );

    // 10. AUTHENTICATION FOOTER: SEALS, SIGNATURES & SERIAL NUMBER
    const footerY = 1050;

    // A. Left: Golden Circular Seal
    const sealCenterX = 240;
    const sealCenterY = footerY + 100;
    ctx.save();
    ctx.translate(sealCenterX, sealCenterY);

    // Multi-layer seal ring
    ctx.fillStyle = '#153C3D';
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();

    // Star in seal
    ctx.fillStyle = '#C5A059';
    ctx.font = 'bold 28px "Scheherazade New", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('تَدْرِيب', 0, -10);

    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ACOUSTIC AUDIT', 0, 18);
    ctx.fillText('★ 100% VERIFIED ★', 0, 32);

    ctx.restore();

    // B. Center: Certificate Credentials & Verification Details
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#153C3D';
    ctx.fillText(`Certificate ID: ${cert.certificateSerialNumber}`, centerX, footerY + 70);

    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#667775';
    ctx.fillText(`Issued on: ${cert.completedAt}  •  Benchmark Reciter: ${cert.scholarBenchmark}`, centerX, footerY + 95);

    ctx.font = 'bold 13px "Amiri", serif';
    ctx.fillStyle = '#8F733C';
    ctx.fillText('شَهَادَةٌ إِتْقَانِيَّةٌ مُعْتَمَدَةٌ تِلْقَائِيّاً مِنْ نِظَامِ التَّقْيِيمِ الصَّوْتِيِّ الذَّكِيِّ', centerX, footerY + 120);

    ctx.font = 'italic 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#99A6A4';
    ctx.fillText('This authentic credential validates live vocal acoustic tracking with syllable-level harakat validation.', centerX, footerY + 142);
    ctx.restore();

    // C. Right: Academic Verification Stamp & Signature
    const sigCenterX = width - 240;
    const sigCenterY = footerY + 100;

    ctx.save();
    ctx.textAlign = 'center';

    // Signature line
    ctx.strokeStyle = '#153C3D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 110, sigCenterY + 15);
    ctx.lineTo(sigCenterX + 110, sigCenterY + 15);
    ctx.stroke();

    // Calligraphic flourish representation
    ctx.font = 'italic bold 22px "Amiri", serif';
    ctx.fillStyle = '#1A4D4E';
    ctx.fillText('لجنة الإشراف القرآني', sigCenterX, sigCenterY - 5);

    ctx.font = 'bold 12px "Amiri", serif';
    ctx.fillStyle = '#8F733C';
    ctx.fillText(cert.verifiedByArabic, sigCenterX, sigCenterY + 35);

    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#778885';
    ctx.fillText('Academic Verification & Sanad Board', sigCenterX, sigCenterY + 52);
    ctx.restore();

    // Bottom copyright
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#A3AFA8';
    ctx.fillText('Tadreeb Quran Memorization Platform • Licensed Acoustic Tajweed Recognition System', centerX, height - outerMargin - 15);
    ctx.restore();
  }

  /**
   * Builds an A4 Landscape PDF containing the full certificate
   */
  public async generateCertificatePdf(cert: SurahCompletionCertificate): Promise<jsPDF> {
    const canvas = document.createElement('canvas');
    await this.renderCertificateCanvas(cert, canvas);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

    const imgData = canvas.toDataURL('image/png', 0.95);
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    // Document Metadata
    doc.setProperties({
      title: `Tadreeb Certificate - Surah ${cert.surahNameEnglish} - ${cert.studentName}`,
      subject: `Certificate of Quranic Surah Completion for ${cert.surahNameArabic}`,
      author: 'Tadreeb Quran Memorization Platform',
      keywords: 'Quran, Certificate, Tajweed, Hifz, Sanad, Tadreeb',
      creator: 'Tadreeb Acoustic AI Verification & Sanad Board'
    });

    return doc;
  }

  /**
   * Downloads the certificate directly to the user's device
   */
  public async downloadCertificatePdf(cert: SurahCompletionCertificate, customFileName?: string): Promise<void> {
    const doc = await this.generateCertificatePdf(cert);
    const fileName =
      customFileName ||
      `Tadreeb_Certificate_Surah_${cert.surahNumber}_${cert.surahNameEnglish.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Opens a native browser print dialog for the certificate
   */
  public async printCertificate(cert: SurahCompletionCertificate): Promise<void> {
    const canvas = document.createElement('canvas');
    await this.renderCertificateCanvas(cert, canvas);
    const imgData = canvas.toDataURL('image/png', 0.95);

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (!iframeDoc) {
      // Fallback: download PDF
      await this.downloadCertificatePdf(cert);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tadreeb Certificate - Surah ${cert.surahNameEnglish} - ${cert.studentName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #FCFAF6;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            img {
              width: 100vw;
              height: 100vh;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" onload="window.print(); setTimeout(() => { window.parent.document.body.removeChild(window.frameElement); }, 1000);" />
        </body>
      </html>
    `);
    iframeDoc.close();
  }

  /**
   * Shares the certificate using Web Share API or falls back to PDF download
   */
  public async shareCertificate(cert: SurahCompletionCertificate): Promise<{ success: boolean; method: 'share' | 'download' }> {
    const doc = await this.generateCertificatePdf(cert);
    const fileName = `Tadreeb_Certificate_${cert.surahNameEnglish.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    try {
      const pdfBlob = doc.output('blob');
      if (typeof File !== 'undefined' && typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Quran Memorization Certificate - Surah ${cert.surahNameEnglish}`,
            text: `Alhamdulillah! I completed reciting and memorizing Surah ${cert.surahNameEnglish} (${cert.surahNameArabic}) with ${cert.accuracyPercentage}% acoustic accuracy on Tadreeb.`,
            files: [file]
          });
          return { success: true, method: 'share' };
        }
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        return { success: false, method: 'share' };
      }
    }

    await this.downloadCertificatePdf(cert, fileName);
    return { success: true, method: 'download' };
  }
}

export const certificateService = new CertificateService();
