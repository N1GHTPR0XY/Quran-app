import React, { useState, useMemo } from 'react';
import { SurahData, Direction } from '../../types';
import {
  BookOpen,
  Search,
  Layers,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Sliders
} from 'lucide-react';

interface QuranNavigationModalProps {
  isOpen: boolean;
  direction: Direction;
  currentSurah: SurahData;
  currentAyahIndex: number;
  allSurahsList: SurahData[];
  onClose: () => void;
  onSelectSurah: (surahNumber: number) => Promise<void>;
  onSelectAyah: (ayahIndex: number) => void;
  onSelectPage: (pageNumber: number) => Promise<void>;
}

export const QuranNavigationModal: React.FC<QuranNavigationModalProps> = ({
  isOpen,
  direction,
  currentSurah,
  currentAyahIndex,
  allSurahsList,
  onClose,
  onSelectSurah,
  onSelectAyah,
  onSelectPage
}) => {
  if (!isOpen) return null;

  const isRtl = direction === 'rtl';
  const [activeTab, setActiveTab] = useState<'surah' | 'ayah' | 'page'>('surah');

  // Surah Tab state
  const [surahSearch, setSurahSearch] = useState('');

  // Ayah Tab state
  const [selectedSurahForAyah, setSelectedSurahForAyah] = useState<number>(currentSurah.number);
  const [ayahInput, setAyahInput] = useState<string>(String(currentAyahIndex + 1));

  // Page Tab state
  const [pageNumberInput, setPageNumberInput] = useState<number>(currentSurah.pageNumber || 1);
  const [isLoading, setIsLoading] = useState(false);

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    const q = surahSearch.trim().toLowerCase();
    if (!q) return allSurahsList;
    return allSurahsList.filter(
      s =>
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.nameTranslation.toLowerCase().includes(q) ||
        s.number.toString() === q
    );
  }, [allSurahsList, surahSearch]);

  // Surah for Ayah tab
  const activeAyahSurahMeta = useMemo(() => {
    return allSurahsList.find(s => s.number === selectedSurahForAyah) || allSurahsList[0];
  }, [allSurahsList, selectedSurahForAyah]);

  // Handle Surah Select
  const handlePickSurah = async (num: number) => {
    setIsLoading(true);
    try {
      await onSelectSurah(num);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Ayah Jump
  const handleJumpToAyah = async (ayahNumber1Indexed: number) => {
    const targetAyah = Math.max(1, Math.min(activeAyahSurahMeta.numberOfAyahs, ayahNumber1Indexed));
    if (selectedSurahForAyah !== currentSurah.number) {
      setIsLoading(true);
      try {
        await onSelectSurah(selectedSurahForAyah);
        onSelectAyah(targetAyah - 1);
        onClose();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else {
      onSelectAyah(targetAyah - 1);
      onClose();
    }
  };

  // Handle Page Select
  const handlePickPage = async (page: number) => {
    const safePage = Math.max(1, Math.min(604, page));
    setIsLoading(true);
    try {
      await onSelectPage(safePage);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Famous Quran Pages
  const POPULAR_PAGES = [
    { page: 1, labelAr: 'الفاتحة', labelEn: 'Al-Fatihah', surah: 1 },
    { page: 2, labelAr: 'بداية البقرة', labelEn: 'Al-Baqarah (Start)', surah: 2 },
    { page: 42, labelAr: 'آية الكرسي', labelEn: 'Ayat Al-Kursi', surah: 2 },
    { page: 77, labelAr: 'آل عمران', labelEn: 'Aal-Imran', surah: 3 },
    { page: 293, labelAr: 'الكهف', labelEn: 'Al-Kahf', surah: 18 },
    { page: 440, labelAr: 'يس', labelEn: 'Ya-Seen', surah: 36 },
    { page: 562, labelAr: 'الملك', labelEn: 'Al-Mulk', surah: 67 },
    { page: 604, labelAr: 'المعوذات', labelEn: 'Al-Ikhlas & Muawwidhat', surah: 112 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh] space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D6] dark:border-[#232E2F]">
          <div>
            <h3 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C5A059]" />
              <span>{isRtl ? 'اختيار موضع التلاوة' : 'Choose Recitation Passage'}</span>
            </h3>
            <p className="text-xs text-[#8E9B98] mt-0.5">
              {isRtl
                ? 'اختر بالسورة أو الآية أو برقم صفحة المصحف (1 - 604)'
                : 'Navigate by Surah (1 - 114), specific Ayah, or Mushaf Page (1 - 604)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E9B98] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F2ED] dark:bg-[#172526] rounded-2xl border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('surah')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'surah'
                ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm font-bold'
                : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#C5A059]" />
            <span>{isRtl ? '1. بالسورة (1 - 114)' : '1. By Surah (1 - 114)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ayah')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ayah'
                ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm font-bold'
                : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#2E7D5A]" />
            <span>{isRtl ? '2. بالآية المحددة' : '2. By Specific Ayah'}</span>
          </button>

          <button
            onClick={() => setActiveTab('page')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'page'
                ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm font-bold'
                : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#D96E54]" />
            <span>{isRtl ? '3. بالصفحة (1 - 604)' : '3. By Page (1 - 604)'}</span>
          </button>
        </div>

        {/* TAB 1: BY SURAH */}
        {activeTab === 'surah' && (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <input
                type="text"
                value={surahSearch}
                onChange={e => setSurahSearch(e.target.value)}
                placeholder={
                  isRtl
                    ? 'ابحث باسم السورة أو رقمها (مثال: 67، الملك، Mulk)...'
                    : 'Search surah by name or number (e.g. 67, Mulk, الملك)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs focus:outline-none focus:border-[#C5A059]"
                autoFocus
              />
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1 max-h-[50vh]">
              {filteredSurahs.map(item => {
                const isSelected = item.number === currentSurah.number;
                return (
                  <div
                    key={item.number}
                    onClick={() => handlePickSurah(item.number)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF2ED] dark:bg-[#142A20] border-[#1A4D4E] dark:border-[#72D6A5]'
                        : 'bg-[#FDFBF7] dark:bg-[#152324] border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F2ED] dark:bg-[#1B2B2C] flex items-center justify-center text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] flex-shrink-0">
                        {item.number}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9] truncate">
                            {item.nameEnglish}
                          </span>
                          <span className="text-[10px] text-[#8E9B98]">
                            • Juz {item.juzNumber} • Page {item.pageNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8E9B98] truncate">
                          {item.nameTranslation} • {item.numberOfAyahs} Ayahs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-arabic text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]" dir="rtl">
                        {item.nameArabic}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-[#1A4D4E] dark:text-[#72D6A5] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BY AYAH */}
        {activeTab === 'ayah' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Choose Surah selector */}
            <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-2">
              <label className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9] block">
                {isRtl ? 'السورة المختارة:' : 'Selected Surah:'}
              </label>
              <select
                value={selectedSurahForAyah}
                onChange={e => {
                  const val = Number(e.target.value);
                  setSelectedSurahForAyah(val);
                  setAyahInput('1');
                }}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-medium focus:outline-none focus:border-[#C5A059]"
              >
                {allSurahsList.map(s => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameEnglish} ({s.nameArabic}) - {s.numberOfAyahs} Ayahs
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Number Input */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#152324] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? `الانتقال المباشر لآية (1 إلى ${activeAyahSurahMeta.numberOfAyahs}):` : `Jump to Ayah (1 to ${activeAyahSurahMeta.numberOfAyahs}):`}
                </span>
                <span className="text-[11px] text-[#8E9B98]">
                  {isRtl ? `المجموع: ${activeAyahSurahMeta.numberOfAyahs} آية` : `Total ${activeAyahSurahMeta.numberOfAyahs} Ayahs`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={activeAyahSurahMeta.numberOfAyahs}
                  value={ayahInput}
                  onChange={e => setAyahInput(e.target.value)}
                  className="w-28 py-2 px-3 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-sm font-bold text-center focus:outline-none focus:border-[#C5A059]"
                  placeholder="Ayah #"
                />
                <button
                  onClick={() => handleJumpToAyah(Number(ayahInput) || 1)}
                  className="flex-1 py-2 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isRtl ? `ابدأ من الآية ${ayahInput || 1}` : `Recite from Ayah ${ayahInput || 1}`}</span>
                </button>
              </div>
            </div>

            {/* Grid of Ayah numbers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#6F7D7B] dark:text-[#9AA5A3] block">
                {isRtl ? 'أو اختر رقم الآية مباشرة:' : 'Or pick from Ayah numbers directly:'}
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1">
                {Array.from({ length: activeAyahSurahMeta.numberOfAyahs }, (_, i) => {
                  const ayahNum = i + 1;
                  const isCurrent =
                    selectedSurahForAyah === currentSurah.number && currentAyahIndex + 1 === ayahNum;

                  return (
                    <button
                      key={ayahNum}
                      onClick={() => handleJumpToAyah(ayahNum)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#C5A059] text-white shadow-sm ring-2 ring-[#C5A059]/30'
                          : 'bg-[#F5F2ED] dark:bg-[#172526] text-[#1A4D4E] dark:text-[#E8ECE9] hover:bg-[#EAF2ED] dark:hover:bg-[#1e3335]'
                      }`}
                    >
                      {ayahNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BY PAGE (1 - 604) */}
        {activeTab === 'page' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Direct Page Input & Slider */}
            <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9] block">
                    {isRtl ? 'صفحات المصحف الشريف (مصحف المدينة 1 - 604):' : 'Madani Mushaf Page (1 - 604):'}
                  </span>
                  <p className="text-[11px] text-[#8E9B98]">
                    {isRtl
                      ? 'يتم عرض جميع آيات الصفحة على الشاشة للتسميع والمراجعة'
                      : 'Loads all ayahs of this page on screen with real-time tracking'}
                  </p>
                </div>
                <span className="text-xl font-black font-mono text-[#C5A059]">
                  {pageNumberInput}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={1}
                max={604}
                value={pageNumberInput}
                onChange={e => setPageNumberInput(Number(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer"
              />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={pageNumberInput}
                  onChange={e => setPageNumberInput(Number(e.target.value))}
                  className="w-28 py-2 px-3 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-sm font-bold text-center focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  onClick={() => handlePickPage(pageNumberInput)}
                  className="flex-1 py-2 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isRtl ? `تلاوة صفحة ${pageNumberInput}` : `Recite Page ${pageNumberInput}`}</span>
                </button>
              </div>
            </div>

            {/* Popular / Famous Pages Shortcuts */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#6F7D7B] dark:text-[#9AA5A3] block">
                {isRtl ? 'محطات وصفحات مشهورة سريعة:' : 'Quick Jump to Notable Quran Pages:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POPULAR_PAGES.map(item => (
                  <button
                    key={item.page}
                    onClick={() => handlePickPage(item.page)}
                    className="p-2.5 rounded-xl bg-[#FDFBF7] dark:bg-[#152324] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] text-start transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9] group-hover:text-[#C5A059]">
                        {isRtl ? item.labelAr : item.labelEn}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#C5A059]">
                        P. {item.page}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8E9B98] block mt-0.5">
                      {isRtl ? `صفحة ${item.page}` : `Madani Page ${item.page}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading status */}
        {isLoading && (
          <div className="text-center py-2 text-xs text-[#C5A059] flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <span>{isRtl ? 'جارٍ تحميل الآيات من المصحف...' : 'Loading verses from Quran database...'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
