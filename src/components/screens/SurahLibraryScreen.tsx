import React, { useState, useEffect, useMemo } from 'react';
import { Direction, ScreenId, SurahData } from '../../types';
import { quranService } from '../../services/quranService';
import {
  Search,
  Download,
  CheckCircle2,
  HardDrive,
  Filter,
  Play,
  Mic,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  Layers,
  MapPin,
  Check
} from 'lucide-react';

interface SurahLibraryScreenProps {
  direction: Direction;
  onSelectSurah: (surah: SurahData) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SurahLibraryScreen: React.FC<SurahLibraryScreenProps> = ({
  direction,
  onSelectSurah,
  onNavigate
}) => {
  const [surahs, setSurahs] = useState<SurahData[]>(() => quranService.getAllSurahsList());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'meccan' | 'medinan' | 'memorized' | 'in_progress' | 'downloaded'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'number' | 'ayahs' | 'progress' | 'name'>('number');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [loadingSurahId, setLoadingSurahId] = useState<number | null>(null);

  const isRtl = direction === 'rtl';

  // Toggle offline download package
  const toggleDownload = (surahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = surahs.find(s => s.number === surahNumber);
    if (!target) return;

    if (target.isDownloaded) {
      // Remove download
      setSurahs(prev => prev.map(s => s.number === surahNumber ? { ...s, isDownloaded: false } : s));
      quranService.saveSurahProgress(surahNumber, target.memorizationProgress, false);
    } else {
      // Simulate high-speed download
      setDownloadingId(surahNumber);
      setTimeout(() => {
        setSurahs(prev => prev.map(s => s.number === surahNumber ? { ...s, isDownloaded: true } : s));
        quranService.saveSurahProgress(surahNumber, target.memorizationProgress, true);
        setDownloadingId(null);
      }, 900);
    }
  };

  // Handle selecting and opening a surah for recitation
  const handleOpenSurah = async (surahItem: SurahData) => {
    setLoadingSurahId(surahItem.number);
    try {
      const fullSurah = await quranService.getSurah(surahItem.number);
      onSelectSurah(fullSurah);
      onNavigate('recitation');
    } catch (err) {
      console.error('Error opening surah:', err);
      onSelectSurah(surahItem);
      onNavigate('recitation');
    } finally {
      setLoadingSurahId(null);
    }
  };

  const filteredSurahs = useMemo(() => {
    return surahs
      .filter(s => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          s.nameEnglish.toLowerCase().includes(query) ||
          s.nameArabic.includes(query) ||
          s.nameTranslation.toLowerCase().includes(query) ||
          s.number.toString() === query;

        if (!matchesSearch) return false;

        // Juz Filter
        if (selectedJuz !== 'all' && s.juzNumber !== selectedJuz) {
          return false;
        }

        // Status / Revelation Filter
        if (activeFilter === 'meccan') return s.revelationType === 'Meccan';
        if (activeFilter === 'medinan') return s.revelationType === 'Medinan';
        if (activeFilter === 'memorized') return s.memorizationProgress === 100;
        if (activeFilter === 'in_progress') return s.memorizationProgress > 0 && s.memorizationProgress < 100;
        if (activeFilter === 'downloaded') return s.isDownloaded;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'number') return a.number - b.number;
        if (sortBy === 'ayahs') return b.numberOfAyahs - a.numberOfAyahs;
        if (sortBy === 'progress') return b.memorizationProgress - a.memorizationProgress;
        if (sortBy === 'name') return a.nameEnglish.localeCompare(b.nameEnglish);
        return 0;
      });
  }, [surahs, searchQuery, activeFilter, selectedJuz, sortBy]);

  const totalDownloadedMb = surahs
    .filter(s => s.isDownloaded)
    .reduce((acc, curr) => acc + curr.downloadSizeMb, 0);

  const totalMemorized = surahs.filter(s => s.memorizationProgress === 100).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fadeIn pb-24">
      {/* Header & Offline Storage Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'فهرس القرآن الكريم (114 سورة)' : 'Complete Quran Index (114 Surahs)'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 text-[#8B6E30] dark:text-[#E5C37A] font-bold border border-[#C5A059]/30">
              114 Surahs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
            {isRtl
              ? 'تصفح واستمع وتدرّب على جميع سور القرآن الـ 114 مع كشف أحكام التجويد واللحن الجلي وتنزيل الحزم دون إنترنت.'
              : 'Recite and master all 114 Surahs of the Holy Quran with real-time harakah tracking, phonetic verification, and offline packs.'}
          </p>
        </div>

        {/* Offline Storage Status Card */}
        <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs">
          <HardDrive className="w-4 h-4 text-[#C5A059]" />
          <div>
            <div className="flex items-center gap-1.5 font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              <span>{totalDownloadedMb.toFixed(1)} MB</span>
              <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold bg-[#EAF2ED] dark:bg-[#142A20] px-1.5 py-0.2 rounded border border-[#C2DBCB]/40">
                Offline Ready
              </span>
            </div>
            <p className="text-[10px] text-[#8E9B98]">
              {surahs.filter(s => s.isDownloaded).length} / 114 {isRtl ? 'سور محفوظة على الجهاز' : 'Surahs cached locally'}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK STATS CHIPS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-center">
          <p className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">114</p>
          <p className="text-[11px] text-[#8E9B98]">{isRtl ? 'إجمالي السور' : 'Total Chapters'}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-center">
          <p className="text-lg font-bold text-[#2E7D5A] dark:text-[#72D6A5]">86 / 28</p>
          <p className="text-[11px] text-[#8E9B98]">{isRtl ? 'مكية / مدنية' : 'Meccan / Medinan'}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-center">
          <p className="text-lg font-bold text-[#C5A059]">{totalMemorized}</p>
          <p className="text-[11px] text-[#8E9B98]">{isRtl ? 'سور متقنة 100%' : 'Surahs Mastered'}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-center">
          <p className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">30</p>
          <p className="text-[11px] text-[#8E9B98]">{isRtl ? 'أجزاء القرآن الكريم' : 'Juz Divisions'}</p>
        </div>
      </div>

      {/* SEARCH, JUZ, & FILTER BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث عن أي سورة: رقم (مثال: 114)، الاسم بالعربية (الملك)، أو الإنجليزية (Kahf)...' : 'Search any of the 114 Surahs by name, number (e.g., 67, 114), or Arabic...'}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] focus:outline-none focus:border-[#1A4D4E] dark:focus:border-[#C5A059] text-sm shadow-sm"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E9B98]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-xs text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Juz Selector Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedJuz}
                onChange={e => setSelectedJuz(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full sm:w-40 px-3 py-3 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-semibold text-[#1A4D4E] dark:text-[#E8ECE9] focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع الأجزاء (1-30)' : 'All Juz (1-30)'}</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                  <option key={j} value={j}>
                    {isRtl ? `الجزء ${j}` : `Juz ${j}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-3 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-semibold text-[#1A4D4E] dark:text-[#E8ECE9] focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                <option value="number">{isRtl ? 'ترتيب المصحف (1-114)' : 'Mushaf Order (1-114)'}</option>
                <option value="ayahs">{isRtl ? 'عدد الآيات (الأطول)' : 'Ayah Count (Longest)'}</option>
                <option value="progress">{isRtl ? 'نسبة الحفظ' : 'Memorization Progress'}</option>
                <option value="name">{isRtl ? 'أبجدياً' : 'Alphabetical'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 no-scrollbar">
          {[
            { id: 'all', label: isRtl ? 'الكل (114)' : 'All (114)' },
            { id: 'meccan', label: isRtl ? 'مكية (86)' : 'Meccan (86)' },
            { id: 'medinan', label: isRtl ? 'مدنية (28)' : 'Medinan (28)' },
            { id: 'memorized', label: isRtl ? 'المتقنة (100%)' : 'Mastered' },
            { id: 'in_progress', label: isRtl ? 'قيد الحفظ' : 'In Progress' },
            { id: 'downloaded', label: isRtl ? 'المحملة أوفلاين' : 'Offline Cached' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === filter.id
                  ? 'bg-[#1A4D4E] text-white dark:bg-[#C5A059] dark:text-[#0E1A1A] shadow-sm'
                  : 'bg-[#FDFBF7] dark:bg-[#122021] text-[#5F6E6C] dark:text-[#A6B2AF] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH RESULTS COUNT */}
      <div className="flex items-center justify-between text-xs text-[#8E9B98]">
        <span>
          {isRtl ? `عرض ${filteredSurahs.length} من أصل 114 سورة` : `Showing ${filteredSurahs.length} of 114 Surahs`}
        </span>
        {selectedJuz !== 'all' && (
          <span className="text-[#C5A059] font-medium">
            Filtered by Juz {selectedJuz}
          </span>
        )}
      </div>

      {/* SURAH LIST CARDS (ALL 114 SURAHS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredSurahs.map(surah => {
          const isDownloading = downloadingId === surah.number;
          const isLoadingSurah = loadingSurahId === surah.number;

          return (
            <div
              key={surah.number}
              onClick={() => handleOpenSurah(surah)}
              className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between gap-4 group"
            >
              {/* Left: Number & Titles */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-center font-bold text-xs text-[#1A4D4E] dark:text-[#C5A059] flex-shrink-0 group-hover:bg-[#C5A059]/15 transition-colors">
                  {isLoadingSurah ? (
                    <span className="w-4 h-4 border-2 border-[#1A4D4E] dark:border-[#C5A059] border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    surah.number
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] truncate">
                      {surah.nameEnglish}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2ED] dark:bg-[#172526] text-[#6F7D7B] dark:text-[#9AA5A3] border border-[#E8E2D6]/60 dark:border-[#232E2F] whitespace-nowrap">
                      Juz {surah.juzNumber} • Page {surah.pageNumber}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E9B98] truncate">
                    {surah.nameTranslation} • {surah.numberOfAyahs} {isRtl ? 'آية' : 'Ayahs'} • {isRtl ? (surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية') : surah.revelationType}
                  </p>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <div className="w-24 h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A4D4E] dark:bg-[#72D6A5] rounded-full transition-all duration-300"
                        style={{ width: `${surah.memorizationProgress}%` }}
                      />
                    </div>
                    <span className="font-semibold text-[#1A4D4E] dark:text-[#72D6A5]">
                      {surah.memorizationProgress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Arabic Script & Action Buttons */}
              <div className="flex items-center gap-3.5 flex-shrink-0">
                <span className="font-arabic text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] group-hover:text-[#C5A059] transition-colors text-end" dir="rtl">
                  {surah.nameArabic}
                </span>

                {/* Offline Download Action */}
                <button
                  onClick={e => toggleDownload(surah.number, e)}
                  disabled={isDownloading}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    surah.isDownloaded
                      ? 'bg-[#EAF2ED] dark:bg-[#142A20] border-[#C2DBCB] text-[#1A4D4E] dark:text-[#72D6A5]'
                      : isDownloading
                      ? 'bg-[#F5F2ED] dark:bg-[#172526] border-transparent text-[#C5A059]'
                      : 'bg-[#FDFBF7] dark:bg-[#172526] border-[#E8E2D6] dark:border-[#232E2F] text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]'
                  }`}
                  title={surah.isDownloaded ? 'Downloaded (Tap to remove)' : `Download offline pack (${surah.downloadSizeMb} MB)`}
                  aria-label="Toggle offline download"
                >
                  {isDownloading ? (
                    <span className="w-4 h-4 border-2 border-[#1A4D4E] border-t-transparent rounded-full animate-spin block" />
                  ) : surah.isDownloaded ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
          <BookOpen className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
          <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'لم يتم العثور على سور مطابقة' : 'No Surahs Found'}
          </h3>
          <p className="text-xs text-[#8E9B98] max-w-sm mx-auto">
            {isRtl
              ? 'تأكد من كتابة الاسم بشكل صحيح أو ابحث برقم السورة (من 1 إلى 114).'
              : 'Try searching by chapter number (1–114) or clearing your active filters.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setSelectedJuz('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] text-xs font-semibold"
          >
            {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
          </button>
        </div>
      )}
    </div>
  );
};

