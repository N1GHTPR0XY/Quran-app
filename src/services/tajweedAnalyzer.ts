/**
 * Comprehensive Tajweed Rules Analyzer
 *
 * Accurately analyzes Arabic words and ayah phrases for Quranic Tajweed rules:
 * - Shedda (التشديد): Shaddah on letters; Ghunnah Akmal Ma Takoon on Noon & Meem Mushaddadah.
 * - Al-Izhar (الإظهار): Izhar Halqi (throat letters: ء، هـ، ع، ح، غ، خ) & Izhar Shafawi (Meem Sakinah).
 * - Al-Ikhfa (الإخفاء): Ikhfa Haqiqi (15 letters: ص، ذ، ث، ك، ج، ش، ق، س، د، ط، ز، ف، ت، ض، ظ) & Ikhfa Shafawi (Meem before Baa).
 * - Al-Idgham (الإدغام): Idgham with Ghunnah (ي، ن، م، و) & without Ghunnah (ل، ر).
 * - Al-Iqlab (الإقلاب): Nun Sakinah or Tanween followed by Baa (turned into Meem).
 * - Qalqalah (القلقلة): Echoing rebound on letters (ق، ط، ب، ج، د) when silent/sukoon.
 * - Al-Madd (المدود): Elongation on Madd letters (Muttasil, Munfasil, Lazim).
 * - Harakat (الحركات): Fatha, Kasra, Damma, Sukoon precision.
 */

export interface TajweedRuleOccurrence {
  ruleType: 'shedda' | 'izhar' | 'ikhfa' | 'idgham' | 'iqlab' | 'qalqalah' | 'madd' | 'harakah';
  ruleNameArabic: string;
  ruleNameEnglish: string;
  subCategory?: string;
  affectedLetter: string;
  affectedLetterNameArabic: string;
  affectedLetterNameEnglish: string;
  explanation: string;
  explanationArabic: string;
  coachingTip: string;
  coachingTipArabic: string;
  colorCode: string;
  badgeBg: string;
  badgeText: string;
}

// Letter metadata
export const TAJWEED_LETTER_MAP: Record<string, { arabic: string; english: string }> = {
  'ء': { arabic: 'الهمزة', english: 'Hamzah' },
  'ا': { arabic: 'الألف', english: 'Alif' },
  'ٱ': { arabic: 'همزة الوصل', english: 'Hamzat al-Wasl' },
  'ب': { arabic: 'الباء', english: 'Baa' },
  'ت': { arabic: 'التاء', english: 'Taa' },
  'ث': { arabic: 'الثاء', english: 'Thaa' },
  'ج': { arabic: 'الجيم', english: 'Jeem' },
  'ح': { arabic: 'الحاء', english: 'Haa' },
  'خ': { arabic: 'الخاء', english: 'Khaa' },
  'د': { arabic: 'الدال', english: 'Daal' },
  'ذ': { arabic: 'الذال', english: 'Dhaal' },
  'ر': { arabic: 'الراء', english: 'Raa' },
  'ز': { arabic: 'الزاي', english: 'Zaay' },
  'س': { arabic: 'السين', english: 'Seen' },
  'ش': { arabic: 'الشين', english: 'Sheen' },
  'ص': { arabic: 'الصاد', english: 'Saad' },
  'ض': { arabic: 'الضاد', english: 'Daad' },
  'ط': { arabic: 'الطاء', english: 'Taa (Emphatic)' },
  'ظ': { arabic: 'الظاء', english: 'Dhaa (Emphatic)' },
  'ع': { arabic: 'العين', english: 'Ayn' },
  'غ': { arabic: 'الغين', english: 'Ghayn' },
  'ف': { arabic: 'الفاء', english: 'Faa' },
  'ق': { arabic: 'القاف', english: 'Qaaf' },
  'ك': { arabic: 'الكاف', english: 'Kaaf' },
  'ل': { arabic: 'اللام', english: 'Laam' },
  'م': { arabic: 'الميم', english: 'Meem' },
  'ن': { arabic: 'النون', english: 'Noon' },
  'ه': { arabic: 'الهاء', english: 'Haa' },
  'و': { arabic: 'الواو', english: 'Waaw' },
  'ي': { arabic: 'الياء', english: 'Yaa' },
  'ى': { arabic: 'الألف المقصورة', english: 'Alif Maqsurah' },
};

// 15 Letters of Ikhfa Haqiqi:
// صف ذا ثنا كم جاد شخص قد سما دم طيبا زد في تقى ضع ظالما
const IKHFA_HAQIQI_LETTERS = new Set(['ص', 'ذ', 'ث', 'ك', 'ج', 'ش', 'ق', 'س', 'د', 'ط', 'ز', 'ف', 'ت', 'ض', 'ظ']);

// 6 Throat letters of Izhar Halqi:
// همز فهاء ثم عين حاء مهملتان ثم غين خاء
const IZHAR_HALQI_LETTERS = new Set(['ء', 'أ', 'إ', 'ه', 'ع', 'ح', 'غ', 'خ']);

// 4 Letters of Idgham with Ghunnah (ينمو):
const IDGHAM_GHUNNAH_LETTERS = new Set(['ي', 'ن', 'م', 'و']);

// 2 Letters of Idgham without Ghunnah (لر):
const IDGHAM_NO_GHUNNAH_LETTERS = new Set(['ل', 'ر']);

// 5 Qalqalah letters (قطب جد):
const QALQALAH_LETTERS = new Set(['ق', 'ط', 'ب', 'ج', 'د']);

export class TajweedAnalyzerService {
  /**
   * Analyzes an individual word or phrase in its context (next word if available)
   * to detect all active Tajweed rules.
   */
  public analyzeWord(wordArabic: string, nextWordArabic?: string): TajweedRuleOccurrence[] {
    const rules: TajweedRuleOccurrence[] = [];
    if (!wordArabic) return rules;

    const chars = Array.from(wordArabic);

    // 1. Check SHEDDA (التشديد)
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === '\u0651') { // Shaddah
        const baseChar = i > 0 ? chars[i - 1] : '';
        const meta = TAJWEED_LETTER_MAP[baseChar] || { arabic: baseChar, english: baseChar };
        
        if (baseChar === 'ن' || baseChar === 'م') {
          rules.push({
            ruleType: 'shedda',
            ruleNameArabic: 'غنة النون/الميم المشددة',
            ruleNameEnglish: 'Shedda with Ghunnah (2 Counts)',
            subCategory: 'Ghunnah Akmal Ma Takoon',
            affectedLetter: baseChar + '\u0651',
            affectedLetterNameArabic: meta.arabic,
            affectedLetterNameEnglish: meta.english,
            explanation: `The letter ${meta.english} has a Shaddah, requiring a full nasal Ghunnah held steadily for 2 vowel counts.`,
            explanationArabic: `حرف ${meta.arabic} مشدد؛ وحكمه الغنة بمقدار حركتين (غنة أكمل ما تكون) مع استقرار الصوت في الخيشوم.`,
            coachingTip: 'Hold the resonance in your nasal cavity for 2 beats before releasing the vowel.',
            coachingTipArabic: 'ألصق المخرج واحبس الصوت في الخيشوم مقدار حركتين دون استعجال.',
            colorCode: '#10B981',
            badgeBg: 'bg-emerald-500/15',
            badgeText: 'text-emerald-700 dark:text-emerald-400'
          });
        } else {
          rules.push({
            ruleType: 'shedda',
            ruleNameArabic: 'حكم التشديد (نبر وتوكيد)',
            ruleNameEnglish: 'Shedda (Consonant Doubling)',
            affectedLetter: baseChar + '\u0651',
            affectedLetterNameArabic: meta.arabic,
            affectedLetterNameEnglish: meta.english,
            explanation: `The letter ${meta.english} carries a Shaddah, indicating two consonants merged together into one reinforced articulation.`,
            explanationArabic: `حرف ${meta.arabic} مشدد، يُلفظ بحرفين متداخلين: أولهما ساكن والآخر متحرك بضغط خفيف على المخرج.`,
            coachingTip: 'Firmly pronounce the doubled letter without adding artificial pauses.',
            coachingTipArabic: 'شدد الحرف بنبرة واضحة دون قطع مجرى النفس.',
            colorCode: '#059669',
            badgeBg: 'bg-teal-500/15',
            badgeText: 'text-teal-700 dark:text-teal-400'
          });
        }
      }
    }

    // 2. Check AL-IZHAR (الإظهار)
    // Within word or across word boundary with Tanween / Noon Sakinah
    const hasTanween = wordArabic.includes('\u064B') || wordArabic.includes('\u064C') || wordArabic.includes('\u064D');
    const endsWithNoonSakin = wordArabic.endsWith('نْ') || (wordArabic.endsWith('ن') && !wordArabic.match(/[َُِ]$/));
    const nextFirstChar = nextWordArabic ? this.getFirstPronouncedLetter(nextWordArabic) : '';

    // Check inside word: e.g., أَنْعَمْتَ (Noon Sakinah before Ayn)
    for (let i = 0; i < chars.length - 1; i++) {
      if ((chars[i] === 'ن' && (chars[i + 1] === '\u0652' || chars[i + 1] === '\u06DF')) || (chars[i] === 'ن' && !this.isHarakah(chars[i + 1]))) {
        const nextLetter = chars[i + 1] === '\u0652' || chars[i + 1] === '\u06DF' ? chars[i + 2] : chars[i + 1];
        if (nextLetter && IZHAR_HALQI_LETTERS.has(nextLetter)) {
          const meta = TAJWEED_LETTER_MAP[nextLetter] || { arabic: nextLetter, english: nextLetter };
          rules.push({
            ruleType: 'izhar',
            ruleNameArabic: 'الإظهار الحلقي (إظهار النون)',
            ruleNameEnglish: 'Al-Izhar Halqi (Clear Throat Pronunciation)',
            affectedLetter: `نْ + ${nextLetter}`,
            affectedLetterNameArabic: meta.arabic,
            affectedLetterNameEnglish: meta.english,
            explanation: `Noon Sakinah is followed by the throat letter (${meta.english}). Must be pronounced cleanly and distinctly without hiding or dragging.`,
            explanationArabic: `نون ساكنة أتى بعدها حرف من حروف الحلق (${meta.arabic})؛ فحكمها الإظهار الحلقي ببيان النون دون غنة زائدة ولا سكت.`,
            coachingTip: 'Articulate the Noon clearly with the tip of the tongue contacting the gum, then immediately pronounce the throat letter.',
            coachingTipArabic: 'أظهر صوت النون الساكنة ناصعاً صافياً من مخرجه بطرف اللسان دون إخفاء.',
            colorCode: '#2563EB',
            badgeBg: 'bg-blue-500/15',
            badgeText: 'text-blue-700 dark:text-blue-400'
          });
        }
      }
    }

    // Izhar with next word
    if ((hasTanween || endsWithNoonSakin) && nextFirstChar && IZHAR_HALQI_LETTERS.has(nextFirstChar)) {
      const meta = TAJWEED_LETTER_MAP[nextFirstChar] || { arabic: nextFirstChar, english: nextFirstChar };
      rules.push({
        ruleType: 'izhar',
        ruleNameArabic: 'الإظهار الحلقي عند الوصل',
        ruleNameEnglish: 'Al-Izhar (Throat Letter Following Word)',
        affectedLetter: nextFirstChar,
        affectedLetterNameArabic: meta.arabic,
        affectedLetterNameEnglish: meta.english,
        explanation: `Tanween or Noon Sakinah meets the throat letter (${meta.english}) at the word junction. Read distinctly with no concealment.`,
        explanationArabic: `تنوين أو نون ساكنة لَقِيَت حرف (${meta.arabic}) وهو من حروف الحلق، فيجب إظهار التنوين ناصعاً.`,
        coachingTip: 'Keep the transition crisp and clear without elongation.',
        coachingTipArabic: 'انطق التنوين بوضوح ثم انتقل بسلاسة لمخرج حرف الحلق.',
        colorCode: '#2563EB',
        badgeBg: 'bg-blue-500/15',
        badgeText: 'text-blue-700 dark:text-blue-400'
      });
    }

    // 3. Check AL-IKHFA (الإخفاء)
    // Within word
    for (let i = 0; i < chars.length - 1; i++) {
      if (chars[i] === 'ن' && (chars[i + 1] === '\u0652' || chars[i + 1] === '\u06DF' || !this.isHarakah(chars[i + 1]))) {
        const nextLetter = chars[i + 1] === '\u0652' || chars[i + 1] === '\u06DF' ? chars[i + 2] : chars[i + 1];
        if (nextLetter && IKHFA_HAQIQI_LETTERS.has(nextLetter)) {
          const meta = TAJWEED_LETTER_MAP[nextLetter] || { arabic: nextLetter, english: nextLetter };
          rules.push({
            ruleType: 'ikhfa',
            ruleNameArabic: 'الإخفاء الحقيقي (غنة مرققة أو مفخمة)',
            ruleNameEnglish: 'Al-Ikhfa Haqiqi (Concealment with Ghunnah)',
            affectedLetter: `ن + ${nextLetter}`,
            affectedLetterNameArabic: meta.arabic,
            affectedLetterNameEnglish: meta.english,
            explanation: `Noon Sakinah followed by the Ikhfa letter (${meta.english}). Conceal the Noon sound and produce a 2-count nasal Ghunnah.`,
            explanationArabic: `نون ساكنة بعدها حرف (${meta.arabic}) من حروف الإخفاء؛ يُستر صوت النون مع بقاء صفتها (الغنة) بمقدار حركتين.`,
            coachingTip: 'Place your tongue near the articulation point of the following letter without touching firmly, while letting the voice resonate through the nose.',
            coachingTipArabic: 'قَرّب لسانك من مخرج الحرف الآتي دون إلصاق، واجعل الغنة تجري في الخيشوم رقيقة أو مفخمة حسب الحرف.',
            colorCode: '#D97706',
            badgeBg: 'bg-amber-500/15',
            badgeText: 'text-amber-700 dark:text-amber-400'
          });
        }
      }
    }

    // Across word boundary
    if ((hasTanween || endsWithNoonSakin) && nextFirstChar && IKHFA_HAQIQI_LETTERS.has(nextFirstChar)) {
      const meta = TAJWEED_LETTER_MAP[nextFirstChar] || { arabic: nextFirstChar, english: nextFirstChar };
      rules.push({
        ruleType: 'ikhfa',
        ruleNameArabic: 'الإخفاء الحقيقي عند الوصل',
        ruleNameEnglish: 'Al-Ikhfa (Concealment with Next Word)',
        affectedLetter: nextFirstChar,
        affectedLetterNameArabic: meta.arabic,
        affectedLetterNameEnglish: meta.english,
        explanation: `Tanween or Noon at the end of this word is concealed before (${meta.english}) with an accompanied Ghunnah.`,
        explanationArabic: `تنوين أو نون ساكنة أتت بعدها كلمة تبدأ بحرف الإخفاء (${meta.arabic})؛ يُخفى التنوين بغنة حركتين.`,
        coachingTip: 'Blend smoothly into the next letter through a soft nasal resonance.',
        coachingTipArabic: 'أخفِ التنوين بسلاسة مع غنة مقدارها حركتان قبل نطق الكلمة التالية.',
        colorCode: '#D97706',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-700 dark:text-amber-400'
      });
    }

    // 4. Check AL-IDGHAM (الإدغام)
    if ((hasTanween || endsWithNoonSakin) && nextFirstChar) {
      if (IDGHAM_GHUNNAH_LETTERS.has(nextFirstChar)) {
        const meta = TAJWEED_LETTER_MAP[nextFirstChar] || { arabic: nextFirstChar, english: nextFirstChar };
        rules.push({
          ruleType: 'idgham',
          ruleNameArabic: 'الإدغام بغنة (ينمو)',
          ruleNameEnglish: 'Al-Idgham with Ghunnah (Assimilation)',
          affectedLetter: nextFirstChar,
          affectedLetterNameArabic: meta.arabic,
          affectedLetterNameEnglish: meta.english,
          explanation: `The Noon/Tanween merges completely into the following letter (${meta.english}) with a rich 2-count Ghunnah.`,
          explanationArabic: `إدغام بغنة: إدخال النون الساكنة أو التنوين في حرف (${meta.arabic}) مع غنة ظاهرة مقدارها حركتان.`,
          coachingTip: 'Merge completely into the next letter while maintaining a warm nasal resonance for two beats.',
          coachingTipArabic: 'أدخل الحرفين بحيث يصيران حرفاً واحداً مشدداً مصحوباً بغنة كاملة.',
          colorCode: '#8B5CF6',
          badgeBg: 'bg-purple-500/15',
          badgeText: 'text-purple-700 dark:text-purple-400'
        });
      } else if (IDGHAM_NO_GHUNNAH_LETTERS.has(nextFirstChar)) {
        const meta = TAJWEED_LETTER_MAP[nextFirstChar] || { arabic: nextFirstChar, english: nextFirstChar };
        rules.push({
          ruleType: 'idgham',
          ruleNameArabic: 'الإدغام بغير غنة (ل، ر)',
          ruleNameEnglish: 'Al-Idgham without Ghunnah',
          affectedLetter: nextFirstChar,
          affectedLetterNameArabic: meta.arabic,
          affectedLetterNameEnglish: meta.english,
          explanation: `Complete assimilation into (${meta.english}) with no nasal Ghunnah.`,
          explanationArabic: `إدغام بغير غنة (إدغام تام): إدخال النون أو التنوين في حرف (${meta.arabic}) دون بقاء أثر للغنة.`,
          coachingTip: 'Merge fully into the letter without pausing for nasal hum.',
          coachingTipArabic: 'انتقل مباشرة لمخرج الحرف المشدد دون أي غنة.',
          colorCode: '#7C3AED',
          badgeBg: 'bg-violet-500/15',
          badgeText: 'text-violet-700 dark:text-violet-400'
        });
      }
    }

    // 5. Check AL-IQLAB (الإقلاب)
    if (wordArabic.includes('ۢ') || ((hasTanween || endsWithNoonSakin) && nextFirstChar === 'ب')) {
      rules.push({
        ruleType: 'iqlab',
        ruleNameArabic: 'الإقلاب (قلب النون ميماً مع الغنة)',
        ruleNameEnglish: 'Al-Iqlab (Conversion to Meem with Ghunnah)',
        affectedLetter: 'ب',
        affectedLetterNameArabic: 'الباء',
        affectedLetterNameEnglish: 'Baa',
        explanation: 'Noon Sakinah or Tanween followed by Baa is transformed into a pure Meem with light lip contact and Ghunnah.',
        explanationArabic: 'قلب النون الساكنة أو التنوين ميماً مخفاة مع الغنة عند ملاقاتها لحرف الباء، مع ملامسة خفيفة للشفتين دون كزّ.',
        coachingTip: 'Touch your lips together gently without pressing hard, emitting a soft nasal hum before popping the Baa.',
        coachingTipArabic: 'أطبق الشفتين بلطف شديد دون ضغط وافتح مجرى الغنة حركتين ثم انطق الباء.',
        colorCode: '#EC4899',
        badgeBg: 'bg-pink-500/15',
        badgeText: 'text-pink-700 dark:text-pink-400'
      });
    }

    // 6. Check QALQALAH (القلقلة)
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (QALQALAH_LETTERS.has(char)) {
        const nextChar = chars[i + 1];
        const isSakin = nextChar === '\u0652' || nextChar === '\u06DF' || !nextChar;
        if (isSakin) {
          const meta = TAJWEED_LETTER_MAP[char] || { arabic: char, english: char };
          rules.push({
            ruleType: 'qalqalah',
            ruleNameArabic: 'القلقلة (اضطراب المخرج)',
            ruleNameEnglish: 'Al-Qalqalah (Echoing Rebound)',
            affectedLetter: char + (nextChar || 'ْ'),
            affectedLetterNameArabic: meta.arabic,
            affectedLetterNameEnglish: meta.english,
            explanation: `Letter (${meta.english}) is pronounced with a crisp, echoing rebound when quiescent to release trapped sound.`,
            explanationArabic: `حرف (${meta.arabic}) ساكن من حروف (قُطْبُ جَدٍّ)؛ يضطرب مخرجه حتى يُسمع له نبرة قوية دون إمالة لحركة.`,
            coachingTip: 'Bounce off the point of articulation cleanly without adding an extra vowel (A, I, or U).',
            coachingTipArabic: 'اقلقل الحرف بارتداد سريع خفيف في المخرج دون إقحام فتحة أو ضمة.',
            colorCode: '#EF4444',
            badgeBg: 'bg-rose-500/15',
            badgeText: 'text-rose-700 dark:text-rose-400'
          });
        }
      }
    }

    // 7. Check AL-MADD (المدود)
    if (wordArabic.includes('ٓ') || wordArabic.includes('~') || wordArabic.includes('آ') || wordArabic.includes('ٰ')) {
      const hasHamzah = wordArabic.includes('ء') || wordArabic.includes('أ') || wordArabic.includes('إ');
      const isMaddMuttasil = hasHamzah && (wordArabic.includes('ٓ') || wordArabic.includes('~'));
      const isMaddLazim = wordArabic.includes('\u0651') && (wordArabic.includes('ٓ') || wordArabic.includes('~'));

      rules.push({
        ruleType: 'madd',
        ruleNameArabic: isMaddLazim
          ? 'المد اللازم (6 حركات)'
          : isMaddMuttasil
          ? 'المد المتصل (4 إلى 5 حركات)'
          : 'المد الفرعي / الطبيعي',
        ruleNameEnglish: isMaddLazim
          ? 'Madd Lazim (Compulsory 6 Counts)'
          : isMaddMuttasil
          ? 'Madd Muttasil (Obligatory 4-5 Counts)'
          : 'Al-Madd (Vowel Elongation)',
        affectedLetter: 'حرف المد',
        affectedLetterNameArabic: 'الألف / الواو / الياء',
        affectedLetterNameEnglish: 'Madd Vowel',
        explanation: isMaddLazim
          ? 'Compulsory Madd before a doubled consonant; hold for a full 6 vowel counts without fading prematurely.'
          : 'Obligatory elongation due to an adjoining Hamzah. Articulate with sustained acoustic breath for 4-5 counts.',
        explanationArabic: isMaddLazim
          ? 'مد لازم؛ لوقوع الساكن الأصلي (المشدد) بعد حرف المد، يُمَد 6 حركات حتماً.'
          : 'مد متصل؛ لاجتماع حرف المد والهمزة في كلمة واحدة، يُمَد 4 إلى 5 حركات وجوباً.',
        coachingTip: 'Maintain even acoustic volume throughout the entire duration count.',
        coachingTipArabic: 'مد الصوت بالتساوي دون تذبذب حتى تمام الحركات المقررة.',
        colorCode: '#0EA5E9',
        badgeBg: 'bg-sky-500/15',
        badgeText: 'text-sky-700 dark:text-sky-400'
      });
    }

    // 8. Check HARAKAT (الحركات: فتحة، كسرة، ضمة)
    const hasKasrah = wordArabic.includes('\u0650') || wordArabic.includes('\u064D');
    const hasDammah = wordArabic.includes('\u064F') || wordArabic.includes('\u064C');
    const hasFathah = wordArabic.includes('\u064E') || wordArabic.includes('\u064B');

    if (hasKasrah) {
      rules.push({
        ruleType: 'harakah',
        ruleNameArabic: 'حركة الكسرة (خفض الفك)',
        ruleNameEnglish: 'Kasrah Vowel Precision',
        affectedLetter: 'ـِ',
        affectedLetterNameArabic: 'الكسرة',
        affectedLetterNameEnglish: 'Kasrah',
        explanation: 'Requires distinct lower jaw drop without tilting toward Dammah.',
        explanationArabic: 'تحقيق الكسرة بخفض الفك السفلي خفضاً تاماً وتصويب الصوت نحو مخرج الياء.',
        coachingTip: 'Lower the bottom jaw slightly to keep the "i" crisp and bright.',
        coachingTipArabic: 'اخفض فكك السفلي تماماً لتتجنب خلط الكسرة بالضمة أو التردد في النطق.',
        colorCode: '#C5A059',
        badgeBg: 'bg-amber-500/10',
        badgeText: 'text-amber-800 dark:text-amber-300'
      });
    } else if (hasDammah) {
      rules.push({
        ruleType: 'harakah',
        ruleNameArabic: 'حركة الضمة (ضم الشفتين)',
        ruleNameEnglish: 'Dammah Vowel Precision',
        affectedLetter: 'ـُ',
        affectedLetterNameArabic: 'الضمة',
        affectedLetterNameEnglish: 'Dammah',
        explanation: 'Requires rounding and protruding the lips into an authentic "u" aperture.',
        explanationArabic: 'تحقيق الضمة بضم الشفتين إلى الأمام ضماً محكماً مع تصعيد الصوت.',
        coachingTip: 'Round the lips fully into a circle.',
        coachingTipArabic: 'ضم شفتيك كالدائرة دون إفراط.',
        colorCode: '#C5A059',
        badgeBg: 'bg-amber-500/10',
        badgeText: 'text-amber-800 dark:text-amber-300'
      });
    }

    return rules;
  }

  private isHarakah(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 0x064B && code <= 0x0652;
  }

  private getFirstPronouncedLetter(word: string): string {
    if (!word) return '';
    const clean = word.replace(/^ٱل|^ال/, ''); // skip definite article if needed
    for (const char of clean) {
      const code = char.charCodeAt(0);
      if (code >= 0x0620 && code <= 0x064A) {
        return char;
      }
    }
    return '';
  }

  /**
   * Analyzes all words in an Ayah sequentially, taking adjacent words into account for Idgham, Ikhfa, etc.
   */
  getRulesForEntireAyah(words: Array<{ arabic: string }>): Map<number, TajweedRuleOccurrence[]> {
    const map = new Map<number, TajweedRuleOccurrence[]>();
    for (let i = 0; i < words.length; i++) {
      const current = words[i]?.arabic || '';
      const next = words[i + 1]?.arabic;
      const rules = this.analyzeWord(current, next);
      map.set(i, rules);
    }
    return map;
  }
}

export const tajweedAnalyzer = new TajweedAnalyzerService();
