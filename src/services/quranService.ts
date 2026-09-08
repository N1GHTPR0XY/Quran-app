import { SurahData, AyahData, WordToken } from '../types';
import { ALL_114_SURAHS_METADATA, SurahMeta } from '../data/allSurahsMetadata';
import { PRE_EMBEDDED_SURAHS } from '../data/embeddedSurahs';
import { RECITERS_LIST } from '../data/quranData';
import { tajweedAnalyzer } from './tajweedAnalyzer';

// In-memory cache for fast switching
const surahCache = new Map<number, SurahData>();
const pageCache = new Map<number, SurahData>();

// LocalStorage cache key prefix
const STORAGE_PREFIX = 'tadreeb_surah_v1_';
const PAGE_STORAGE_PREFIX = 'tadreeb_page_v1_';

export class QuranService {
  /**
   * Get metadata for all 114 Surahs
   */
  getAllSurahsMetadata(): SurahMeta[] {
    return ALL_114_SURAHS_METADATA;
  }

  /**
   * Get basic SurahData stubs for all 114 Surahs (for library and listing)
   */
  getAllSurahsList(): SurahData[] {
    // Read saved progress from localStorage if available
    const savedProgressStr = typeof window !== 'undefined' ? localStorage.getItem('tadreeb_progress_map') : null;
    const progressMap: Record<number, { progress: number; isDownloaded: boolean; lastPracticed?: string }> =
      savedProgressStr ? JSON.parse(savedProgressStr) : {};

    return ALL_114_SURAHS_METADATA.map(meta => {
      const saved = progressMap[meta.number];
      const embedded = PRE_EMBEDDED_SURAHS.find(s => s.number === meta.number);

      return {
        number: meta.number,
        nameArabic: meta.nameArabic,
        nameEnglish: meta.nameEnglish,
        nameTranslation: meta.nameTranslation,
        revelationType: meta.revelationType,
        numberOfAyahs: meta.numberOfAyahs,
        juzNumber: meta.juzNumber,
        pageNumber: meta.pageNumber,
        memorizationProgress: saved?.progress ?? (embedded?.memorizationProgress ?? 0),
        isDownloaded: saved?.isDownloaded ?? (embedded?.isDownloaded ?? false),
        downloadSizeMb: meta.downloadSizeMb,
        lastPracticed: saved?.lastPracticed ?? embedded?.lastPracticed,
        ayahs: embedded?.ayahs || []
      };
    });
  }

  /**
   * Load complete Ayahs and word tokens for any of the 114 Surahs
   */
  async getSurah(surahNumber: number): Promise<SurahData> {
    // 1. Check in-memory cache
    if (surahCache.has(surahNumber)) {
      return surahCache.get(surahNumber)!;
    }

    // 2. Check pre-embedded collection
    const embedded = PRE_EMBEDDED_SURAHS.find(s => s.number === surahNumber);
    if (embedded && embedded.ayahs && embedded.ayahs.length > 0) {
      surahCache.set(surahNumber, embedded);
      return embedded;
    }

    // 3. Check persistent localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`${STORAGE_PREFIX}${surahNumber}`);
        if (cached) {
          const parsed = JSON.parse(cached) as SurahData;
          if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
            surahCache.set(surahNumber, parsed);
            return parsed;
          }
        }
      } catch (e) {
        console.warn('LocalStorage read error for surah cache:', e);
      }
    }

    // 4. Fetch dynamically from public open Al-Quran Cloud API
    const meta = ALL_114_SURAHS_METADATA.find(m => m.number === surahNumber) || ALL_114_SURAHS_METADATA[0];

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch surah ${surahNumber}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
        const arabicEdition = json.data[0];
        const translationEdition = json.data[1];

        const ayahs: AyahData[] = arabicEdition.ayahs.map((ayahItem: any, index: number) => {
          const translationText = translationEdition.ayahs[index]?.text || '';
          const arabicText = ayahItem.text;
          const ayahNumberInSurah = ayahItem.numberInSurah;
          const overallAyahNumber = ayahItem.number;

          // Format reciter audio URL
          const audioUrl = this.getAyahAudioUrl(surahNumber, ayahNumberInSurah, 'alafasy');

          // Generate word tokens
          const words = this.generateWordTokens(arabicText, surahNumber, ayahNumberInSurah);

          return {
            number: overallAyahNumber,
            numberInSurah: ayahNumberInSurah,
            arabic: arabicText,
            translation: translationText,
            audioUrl,
            words
          };
        });

        const surahData: SurahData = {
          number: meta.number,
          nameArabic: meta.nameArabic,
          nameEnglish: meta.nameEnglish,
          nameTranslation: meta.nameTranslation,
          revelationType: meta.revelationType,
          numberOfAyahs: meta.numberOfAyahs,
          juzNumber: meta.juzNumber,
          pageNumber: meta.pageNumber,
          memorizationProgress: 0,
          isDownloaded: true,
          downloadSizeMb: meta.downloadSizeMb,
          ayahs
        };

        // Cache result
        surahCache.set(surahNumber, surahData);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`${STORAGE_PREFIX}${surahNumber}`, JSON.stringify(surahData));
          } catch (e) {
            // Quota might be reached, memory cache remains active
          }
        }

        return surahData;
      }
    } catch (err) {
      console.warn(`Online fetch for Surah ${surahNumber} failed, using offline structure fallback:`, err);
    }

    // 5. Offline fallback generation
    return this.createFallbackSurahData(meta);
  }

  /**
   * Generates clean word tokens from an Arabic ayah string
   */
  private generateWordTokens(arabicAyah: string, surahNum: number, ayahNum: number): WordToken[] {
    // Clean Bismillah if attached to first ayah (except Al-Fatihah)
    let cleanText = arabicAyah;
    const bismillahPrefix = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ';
    if (ayahNum === 1 && surahNum !== 1 && cleanText.startsWith(bismillahPrefix)) {
      cleanText = cleanText.substring(bismillahPrefix.length);
    }

    const rawWords = cleanText.trim().split(/\s+/).filter(Boolean);

    return rawWords.map((word, idx) => {
      // Basic transliteration approximation
      const translit = this.approximateTransliteration(word);
      const nextWord = rawWords[idx + 1];

      // Run deep Tajweed rules analyzer
      const detectedTajweedRules = tajweedAnalyzer.analyzeWord(word, nextWord);
      const primaryRule = detectedTajweedRules[0];

      return {
        id: `${surahNum}-${ayahNum}-${idx + 1}`,
        arabic: word,
        transliteration: translit,
        meaning: `Word ${idx + 1}`,
        hasTajweedRule: detectedTajweedRules.length > 0,
        tajweedRuleName: primaryRule ? primaryRule.ruleNameEnglish : undefined,
        tajweedRules: detectedTajweedRules as any
      };
    });
  }

  /**
   * Transliteration approximation for Arabic word
   */
  private approximateTransliteration(arabic: string): string {
    const map: Record<string, string> = {
      'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th',
      'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
      'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'dh', 'ع': "'",
      'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ء': "'", 'ة': 'h'
    };

    let result = '';
    for (const char of arabic) {
      if (char === 'َ') result += 'a';
      else if (char === 'ِ') result += 'i';
      else if (char === 'ُ') result += 'u';
      else if (char === 'ً') result += 'an';
      else if (char === 'ٍ') result += 'in';
      else if (char === 'ٌ') result += 'un';
      else if (map[char]) result += map[char];
    }
    return result || arabic;
  }

  /**
   * Offline fallback generator for any surah
   */
  private createFallbackSurahData(meta: SurahMeta): SurahData {
    const surahPad = String(meta.number).padStart(3, '0');
    const ayahs: AyahData[] = Array.from({ length: Math.min(meta.numberOfAyahs, 7) }, (_, i) => {
      const ayahNum = i + 1;
      const ayahPad = String(ayahNum).padStart(3, '0');
      return {
        number: ayahNum,
        numberInSurah: ayahNum,
        arabic: `بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ • آية ${ayahNum}`,
        translation: `Ayah ${ayahNum} of Surah ${meta.nameEnglish}.`,
        audioUrl: `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`,
        words: [
          { id: `${meta.number}-${ayahNum}-1`, arabic: "بِسْمِ", transliteration: "Bismi", meaning: "In name" },
          { id: `${meta.number}-${ayahNum}-2`, arabic: "ٱللَّهِ", transliteration: "Allahi", meaning: "of Allah" },
          { id: `${meta.number}-${ayahNum}-3`, arabic: "ٱلرَّحْمَٰنِ", transliteration: "ar-Rahman", meaning: "the Merciful" }
        ]
      };
    });

    return {
      number: meta.number,
      nameArabic: meta.nameArabic,
      nameEnglish: meta.nameEnglish,
      nameTranslation: meta.nameTranslation,
      revelationType: meta.revelationType,
      numberOfAyahs: meta.numberOfAyahs,
      juzNumber: meta.juzNumber,
      pageNumber: meta.pageNumber,
      memorizationProgress: 0,
      isDownloaded: false,
      downloadSizeMb: meta.downloadSizeMb,
      ayahs
    };
  }

  /**
   * Generates reference recitation audio URL for any of the 114 Surahs and any Ayah,
   * mapped to the selected world-renowned scholar or female reciter
   */
  getAyahAudioUrl(surahNumber: number, ayahNumberInSurah: number, reciterId: string = 'alafasy'): string {
    const surahPad = String(surahNumber).padStart(3, '0');
    const ayahPad = String(ayahNumberInSurah).padStart(3, '0');

    const reciter = RECITERS_LIST.find(r => r.id === reciterId) || RECITERS_LIST[0];
    const subfolder = reciter.subfolder || 'Alafasy_128kbps';

    return `https://everyayah.com/data/${subfolder}/${surahPad}${ayahPad}.mp3`;
  }

  /**
   * Loads all Ayahs on a specific Quran page (1 - 604) of the Madani Mushaf
   */
  async getPage(pageNumber: number): Promise<SurahData> {
    const safePage = Math.max(1, Math.min(604, pageNumber));

    // 1. Check in-memory cache
    if (pageCache.has(safePage)) {
      return pageCache.get(safePage)!;
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`${PAGE_STORAGE_PREFIX}${safePage}`);
        if (cached) {
          const parsed = JSON.parse(cached) as SurahData;
          if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
            pageCache.set(safePage, parsed);
            return parsed;
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // 3. Find primary Surah on this page from metadata
    let primarySurah = ALL_114_SURAHS_METADATA.find(m => m.pageNumber === safePage);
    if (!primarySurah) {
      // Find the surah that begins closest before or at this page
      const priorSurahs = ALL_114_SURAHS_METADATA.filter(m => m.pageNumber <= safePage);
      primarySurah = priorSurahs[priorSurahs.length - 1] || ALL_114_SURAHS_METADATA[0];
    }

    // 4. Fetch dynamic Page edition from Al-Quran Cloud API
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/page/${safePage}/editions/quran-uthmani,en.sahih`
      );

      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
          const arabicEdition = json.data[0];
          const translationEdition = json.data[1];

          const ayahs: AyahData[] = arabicEdition.ayahs.map((ayahItem: any, index: number) => {
            const translationText = translationEdition.ayahs[index]?.text || '';
            const arabicText = ayahItem.text;
            const surahNum = ayahItem.surah?.number || primarySurah?.number || 1;
            const ayahNumberInSurah = ayahItem.numberInSurah;
            const overallAyahNumber = ayahItem.number;

            const audioUrl = this.getAyahAudioUrl(surahNum, ayahNumberInSurah, 'alafasy');
            const words = this.generateWordTokens(arabicText, surahNum, ayahNumberInSurah);

            return {
              number: overallAyahNumber,
              numberInSurah: ayahNumberInSurah,
              arabic: arabicText,
              translation: translationText,
              audioUrl,
              words
            };
          });

          const pageData: SurahData = {
            number: primarySurah.number,
            nameArabic: `صفحة ${safePage} • ${primarySurah.nameArabic}`,
            nameEnglish: `Page ${safePage} • ${primarySurah.nameEnglish}`,
            nameTranslation: `Quran Page ${safePage} (${primarySurah.nameTranslation})`,
            revelationType: primarySurah.revelationType,
            numberOfAyahs: ayahs.length,
            juzNumber: primarySurah.juzNumber,
            pageNumber: safePage,
            memorizationProgress: 0,
            isDownloaded: true,
            downloadSizeMb: 1.2,
            ayahs
          };

          pageCache.set(safePage, pageData);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`${PAGE_STORAGE_PREFIX}${safePage}`, JSON.stringify(pageData));
            } catch (e) {
              // Storage quota
            }
          }

          return pageData;
        }
      }
    } catch (err) {
      console.warn(`Online fetch for page ${safePage} failed, synthesizing from nearest surah:`, err);
    }

    // 5. Offline Fallback: Load the primary Surah
    const fullSurah = await this.getSurah(primarySurah.number);
    const fallbackPageData: SurahData = {
      ...fullSurah,
      nameArabic: `صفحة ${safePage} • ${fullSurah.nameArabic}`,
      nameEnglish: `Page ${safePage} • ${fullSurah.nameEnglish}`,
      pageNumber: safePage
    };

    pageCache.set(safePage, fallbackPageData);
    return fallbackPageData;
  }

  /**
   * Save user progress for a surah
   */
  saveSurahProgress(surahNumber: number, progress: number, isDownloaded: boolean) {
    if (typeof window === 'undefined') return;
    try {
      const current = localStorage.getItem('tadreeb_progress_map');
      const map = current ? JSON.parse(current) : {};
      map[surahNumber] = {
        progress,
        isDownloaded,
        lastPracticed: 'Just now'
      };
      localStorage.setItem('tadreeb_progress_map', JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save surah progress:', e);
    }
  }
}

export const quranService = new QuranService();
