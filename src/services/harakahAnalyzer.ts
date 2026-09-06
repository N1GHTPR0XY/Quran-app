/**
 * Harakah Analyzer & Lahn Jaliyy (Major Recitation Mistake) Detector
 * 
 * Specifically monitors Harakat (vowels) in Quranic recitation,
 * with particular focus on catching when a Kasrah (ـِ) on any harf
 * is incorrectly pronounced as a Dammah (ـُ), or vice-versa.
 */

import { HarakahDetail } from '../types';

// Arabic letter name dictionary for clear Tajweed coaching
export const ARABIC_LETTER_NAMES: Record<string, { arabic: string; english: string }> = {
  'ء': { arabic: 'الهمزة', english: 'Hamzah' },
  'ا': { arabic: 'الألف', english: 'Alif' },
  'ٱ': { arabic: 'همزة الوصل', english: 'Hamzat al-Wasl' },
  'ب': { arabic: 'الباء', english: 'Baa' },
  'ت': { arabic: 'التاء', english: 'Taa' },
  'ث': { arabic: 'الثاء', english: 'Thaa' },
  'ج': { arabic: 'الجيم', english: 'Jeem' },
  'ح': { arabic: 'الحاء', english: 'Haa (Unpointed)' },
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

export interface KasrahLetterInfo {
  baseLetter: string;
  letterNameArabic: string;
  letterNameEnglish: string;
  hasShaddah: boolean;
  harfWithKasrah: string;
  harfWithDammah: string;
  dammahSubstitutedWord: string;
  expectedPhonetic: string;
  dammahPhonetic: string;
  isWordEnding: boolean;
}

/**
 * Finds all letters in a Quranic word that carry a Kasrah (ـِ or Kasratan ـٍ)
 */
export function extractKasrahLetters(wordArabic: string, transliteration: string): KasrahLetterInfo[] {
  const results: KasrahLetterInfo[] = [];
  if (!wordArabic) return results;

  // Decompose word into grapheme clusters / characters
  const chars = Array.from(wordArabic);
  let currentBase = '';
  let currentShaddah = false;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const code = char.charCodeAt(0);

    // Check if base Arabic letter (non-tashkeel)
    if (code >= 0x0620 && code <= 0x064A || code === 0x0671) {
      currentBase = char;
      currentShaddah = false;
    } else if (char === '\u0651') {
      // Shaddah
      currentShaddah = true;
    } else if (char === '\u0650' || char === '\u064D') {
      // Kasrah or Tanween Kasr!
      if (currentBase) {
        const letterMeta = ARABIC_LETTER_NAMES[currentBase] || {
          arabic: `حرف (${currentBase})`,
          english: `Letter (${currentBase})`
        };

        const harfWithKasrah = currentShaddah ? `${currentBase}\u0651\u0650` : `${currentBase}\u0650`;
        const harfWithDammah = currentShaddah ? `${currentBase}\u0651\u064F` : `${currentBase}\u064F`;

        // Create word with this specific Kasrah substituted by Dammah
        const prefix = chars.slice(0, i).join('');
        const suffix = chars.slice(i + 1).join('');
        const dammahChar = char === '\u064D' ? '\u064C' : '\u064F';
        const dammahSubstitutedWord = prefix + dammahChar + suffix;

        const isWordEnding = i >= chars.length - 2;

        // Generate transliteration with 'u' instead of 'i'
        let dammahPhonetic = transliteration;
        if (isWordEnding && transliteration.endsWith('i')) {
          dammahPhonetic = transliteration.slice(0, -1) + 'u';
        } else if (transliteration.includes('i')) {
          dammahPhonetic = transliteration.replace(/i([^i]*)$/, 'u$1');
        } else {
          dammahPhonetic = transliteration + ' (with Dammah)';
        }

        results.push({
          baseLetter: currentBase,
          letterNameArabic: letterMeta.arabic,
          letterNameEnglish: letterMeta.english,
          hasShaddah: currentShaddah,
          harfWithKasrah,
          harfWithDammah,
          dammahSubstitutedWord,
          expectedPhonetic: transliteration,
          dammahPhonetic,
          isWordEnding
        });
      }
    }
  }

  return results;
}

/**
 * Normalizes speech text for harakah-level error detection
 */
function cleanForHarakahComparison(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u06D6-\u06ED\u06E5\u06E6]/g, '') // remove quranic pause signs
    .replace(/[ـ\.,;:!\?\(\)\[\]"'-]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Checks if the user's spoken utterance or transcript represents an incorrect
 * substitution of Kasrah (ـِ) with Dammah (ـُ).
 * 
 * Returns detailed Harakah mismatch information if detected, or null if matched or unrelated.
 */
export function detectKasrahToDammahError(
  spokenText: string,
  expectedWordArabic: string,
  expectedTransliteration: string
): HarakahDetail | null {
  if (!spokenText || !expectedWordArabic) return null;

  const kasrahLetters = extractKasrahLetters(expectedWordArabic, expectedTransliteration);
  if (kasrahLetters.length === 0) {
    return null; // This word doesn't have any Kasrah to swap with Dammah
  }

  const cleanSpoken = cleanForHarakahComparison(spokenText);
  const spokenTokens = cleanSpoken.split(/\s+/);

  // Analyze against each letter in the word with Kasrah
  for (const info of kasrahLetters) {
    // 1. Check direct Arabic script matching of the word with Dammah
    // (e.g. "بسمُ", "ربُّ", "مالكُ", "يومُ", "الدينُ", "الرحمنُ", "الرحيمُ", "اللهُ")
    const dammahWordClean = cleanForHarakahComparison(info.dammahSubstitutedWord);
    const dammahWordBare = dammahWordClean.replace(/[\u064B-\u065F\u0670]/g, '');

    // Check if spoken contains explicit Dammah on the word
    if (cleanSpoken.includes(dammahWordClean)) {
      return buildHarakahDetail(info, expectedWordArabic, expectedTransliteration);
    }

    // Check if the user said the bare word with an explicit Dammah or added Waaw
    // e.g. "بسمو", "ربو", "مالكو", "يومو"
    const waawSubstituted = dammahWordBare + 'و';
    if (cleanSpoken.includes(waawSubstituted)) {
      return buildHarakahDetail(info, expectedWordArabic, expectedTransliteration);
    }

    // Check tokens
    for (const token of spokenTokens) {
      // If the token explicitly has Dammah on this letter
      if (token.includes(info.harfWithDammah) || token === dammahWordClean) {
        return buildHarakahDetail(info, expectedWordArabic, expectedTransliteration);
      }

      // Check phonetic / transliteration mismatch (e.g., speech recognition returned English or Latin text)
      const cleanToken = token.toLowerCase().replace(/[^a-z]/g, '');
      const cleanExpectedPhonetic = info.expectedPhonetic.toLowerCase().replace(/[^a-z]/g, '');
      const cleanDammahPhonetic = info.dammahPhonetic.toLowerCase().replace(/[^a-z]/g, '');

      if (cleanToken === cleanDammahPhonetic || (cleanToken.endsWith('u') && cleanExpectedPhonetic.endsWith('i') && cleanToken.slice(0, -1) === cleanExpectedPhonetic.slice(0, -1))) {
        return buildHarakahDetail(info, expectedWordArabic, expectedTransliteration);
      }
    }
  }

  return null;
}

/**
 * Builds a standardized HarakahDetail for the UI and Audio coach
 */
export function buildHarakahDetail(
  info: KasrahLetterInfo,
  expectedWordArabic: string,
  expectedTransliteration: string
): HarakahDetail {
  return {
    harf: info.baseLetter,
    harfNameArabic: info.letterNameArabic,
    harfNameEnglish: info.letterNameEnglish,
    expectedHarakah: 'kasrah',
    actualHarakah: 'dammah',
    expectedArabicLetter: info.harfWithKasrah,
    actualArabicLetter: info.harfWithDammah,
    expectedWord: expectedWordArabic,
    actualWord: info.dammahSubstitutedWord,
    phoneticExpected: expectedTransliteration,
    phoneticActual: info.dammahPhonetic,
    tajweedCategory: 'لحن جلي: تبديل حركة (Lahn Jaliyy: Harakah Inversion)',
    mouthShapeTip: 'للكسرة: اخفض الفك السفلي قليلاً لتحقيق صوت الياء الخفيفة النقي (i). تجنّب ضمّ الشفتين الذي يُحدث صوت الضمة (u).'
  };
}

/**
 * Constructs a simulated Kasrah->Dammah mistake for testing & user demonstration
 */
export function createKasrahToDammahSimulation(
  wordArabic: string,
  transliteration: string
): HarakahDetail {
  const letters = extractKasrahLetters(wordArabic, transliteration);
  // Pick the word-ending letter with Kasrah if available (most common I'rab mistake), else the first Kasrah letter
  const target = letters.find(l => l.isWordEnding) || letters[0] || {
    baseLetter: 'م',
    letterNameArabic: 'الميم',
    letterNameEnglish: 'Meem',
    hasShaddah: false,
    harfWithKasrah: 'مِ',
    harfWithDammah: 'مُ',
    dammahSubstitutedWord: wordArabic.replace('مِ', 'مُ'),
    expectedPhonetic: transliteration,
    dammahPhonetic: transliteration.endsWith('i') ? transliteration.slice(0, -1) + 'u' : transliteration + ' (u)',
    isWordEnding: true
  };

  return buildHarakahDetail(target, wordArabic, transliteration);
}
