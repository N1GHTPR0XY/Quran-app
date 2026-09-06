import React, { useState } from 'react';
import { Direction, ScreenId, SurahData } from '../../types';
import { POPULAR_SURAHS } from '../../data/quranData';
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
  Sparkles
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
  const [surahs, setSurahs] = useState<SurahData[]>(POPULAR_SURAHS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'memorized' | 'in_progress' | 'downloaded'>('all');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const isRtl = direction === 'rtl';

  const toggleDownload = (surahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = surahs.find(s => s.number === surahNumber);
    if (!target) return;

    if (target.isDownloaded) {
      // Remove download
      setSurahs(prev => prev.map(s => s.number === surahNumber ? { ...s, isDownloaded: false } : s));
    } else {
      // Simulate download
      setDownloadingId(surahNumber);
      setTimeout(() => {
        setSurahs(prev => prev.map(s => s.number === surahNumber ? { ...s, isDownloaded: true } : s));
        setDownloadingId(null);
      }, 1200);
    }
  };

  const filteredSurahs = surahs.filter(s => {
    const matchesSearch =
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameArabic.includes(searchQuery) ||
      s.number.toString() === searchQuery;

    if (!matchesSearch) return false;

    if (activeFilter === 'memorized') return s.memorizationProgress === 100;
    if (activeFilter === 'in_progress') return s.memorizationProgress > 0 && s.memorizationProgress < 100;
    if (activeFilter === 'downloaded') return s.isDownloaded;

    return true;
  });

  const totalDownloadedMb = surahs
    .filter(s => s.isDownloaded)
    .reduce((acc, curr) => acc + curr.downloadSizeMb, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fadeIn pb-24">
      {/* Header & Offline Storage Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'فهرس القرآن الكريم' : 'Surah Library & Offline Packs'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
            {isRtl
              ? 'تنزيل التلاوات المرجعية للتدريب دون اتصال بالإنترنت في السفر والمساجد.'
              : 'Download pristine reference audio packs for complete offline memorization in mosques or on flights.'}
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
              {surahs.filter(s => s.isDownloaded).length} {isRtl ? 'سور محفوظة على الجهاز' : 'Surahs cached locally'}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث باسم السورة بالعربية أو الإنجليزية أو رقمها...' : 'Search by Surah name, English, Arabic, or number...'}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] focus:outline-none focus:border-[#1A4D4E] dark:focus:border-[#C5A059] text-sm shadow-sm"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E9B98]" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: isRtl ? 'الكل (114)' : 'All (114)' },
            { id: 'memorized', label: isRtl ? 'المتقنة (100%)' : 'Mastered (100%)' },
            { id: 'in_progress', label: isRtl ? 'قيد الحفظ' : 'In Progress' },
            { id: 'downloaded', label: isRtl ? 'المحملة أوفلاين' : 'Offline Cached' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* SURAH LIST CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredSurahs.map(surah => {
          const isDownloading = downloadingId === surah.number;
          return (
            <div
              key={surah.number}
              onClick={() => {
                onSelectSurah(surah);
                onNavigate('recitation');
              }}
              className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between gap-4 group"
            >
              {/* Left: Number & Titles */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-center font-bold text-xs text-[#1A4D4E] dark:text-[#C5A059] flex-shrink-0">
                  {surah.number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {surah.nameEnglish}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2ED] dark:bg-[#172526] text-[#6F7D7B] dark:text-[#9AA5A3] border border-[#E8E2D6]/60 dark:border-[#232E2F]">
                      Juz {surah.juzNumber}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E9B98]">
                    {surah.nameTranslation} • {surah.numberOfAyahs} Ayahs • {surah.revelationType}
                  </p>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <div className="w-24 h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A4D4E] dark:bg-[#72D6A5] rounded-full"
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
              <div className="flex items-center gap-4">
                <span className="font-arabic text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] group-hover:text-[#C5A059] transition-colors text-end">
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
    </div>
  );
};
