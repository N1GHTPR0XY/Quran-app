import React, { useState } from 'react';
import { Direction, ScreenId, UserProfile } from '../../types';
import { POPULAR_SURAHS, INITIAL_MISTAKES_REVIEW } from '../../data/quranData';
import { CircularProgress } from '../common/CircularProgress';
import {
  Mic,
  Flame,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
  BookOpen,
  RotateCcw,
  CloudCheck,
  ShieldAlert,
  Trophy,
  Award,
  Target,
  CheckCircle2,
  TrendingUp,
  Percent
} from 'lucide-react';

interface DashboardScreenProps {
  user: UserProfile;
  direction: Direction;
  onNavigate: (screen: ScreenId) => void;
  onOpenAuth: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  direction,
  onNavigate,
  onOpenAuth
}) => {
  const isRtl = direction === 'rtl';
  const [selectedTargetSurahNumber, setSelectedTargetSurahNumber] = useState<number>(67); // Default: Surah Al-Mulk (67)
  const activeTargetSurah = POPULAR_SURAHS.find(s => s.number === selectedTargetSurahNumber) || POPULAR_SURAHS[1];
  const unreviewedMistakesCount = INITIAL_MISTAKES_REVIEW.filter(m => !m.mastered).length;

  const targetMasteredAyahs = Math.round((activeTargetSurah.memorizationProgress / 100) * activeTargetSurah.numberOfAyahs);
  const remainingAyahs = Math.max(0, activeTargetSurah.numberOfAyahs - targetMasteredAyahs);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn pb-24">
      {/* GUEST ACCOUNT BANNER (If guest) */}
      {user.isGuest && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#C5A059]/15 via-[#F5F2ED] to-[#C5A059]/15 dark:from-[#172526] dark:to-[#122021] border border-[#C5A059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-ping" />
            <div>
              <p className="font-bold text-[#1A4D4E] dark:text-[#C5A059]">
                {isRtl ? 'أنت تستخدم وضع الضيف المحفوظ محلياً' : 'Local Guest Mode Active'}
              </p>
              <p className="text-[#6F7D7B] dark:text-[#9AA5A3]">
                {isRtl
                  ? 'تقدمك وسلسلة أيامك محفوظة على هذا الجهاز. اربط حسابك بـ Google أو Apple لضمان عدم ضياعها.'
                  : 'Your 14-day streak and recitation history are stored on this device. Link to backup to cloud.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            {isRtl ? 'ربط الحساب الآن' : 'Link Account'}
          </button>
        </div>
      )}

      {/* TOP GREETING & STREAK BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? `السلام عليكم، ${user.name.split(' ')[0]}` : `Assalamu Alaykum, ${user.name.split(' ')[0]}`}
            </h1>
            <span className="text-lg">🌿</span>
          </div>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
            {isRtl
              ? 'اليوم السبت، 18 ربيع الأول • ورد اليوم: سورة الملك (الآيات 1 - 10)'
              : "Today's Wird: Surah Al-Mulk (Ayahs 1–10) • Active Memorization Mode"}
          </p>
        </div>

        {/* Streak & Memory Stats Pill */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F]">
            <Flame className="w-5 h-5 text-[#D96E54] fill-[#D96E54]" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">{user.currentStreak}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">
                  {isRtl ? 'أيام متتالية' : 'Days Streak'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB]/40">
            <CheckCircle className="w-5 h-5 text-[#1A4D4E] dark:text-[#72D6A5]" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-sm text-[#1A4D4E] dark:text-[#72D6A5]">{user.totalMemorizedAyahs}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">
                  {isRtl ? 'آية متقنة' : 'Ayahs Mastered'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#C5A059]/15 hover:bg-[#C5A059]/25 dark:bg-[#C5A059]/10 border border-[#C5A059]/30 transition-all cursor-pointer group"
            title={isRtl ? 'عرض الأوسمة والإنجازات' : 'View Milestones & Badges'}
          >
            <Trophy className="w-4 h-4 text-[#C5A059] transition-transform group-hover:scale-110" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">6/10</span>
                <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">
                  {isRtl ? 'أوسمة' : 'Badges'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* HERO SECTION: USER'S TARGET SURAH WITH CIRCULAR PROGRESS INDICATOR */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1A4D4E] via-[#143E3F] to-[#0E3B3C] text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-[#C5A059]/40">
        {/* Background Islamic Arabesque watermark */}
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none transform translate-x-16 -translate-y-16">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-[#C5A059]">
            <polygon points="100,10 120,70 190,70 135,110 155,180 100,140 45,180 65,110 10,70 80,70" />
            <circle cx="100" cy="100" r="85" />
            <circle cx="100" cy="100" r="60" />
          </svg>
        </div>

        {/* Target Surah Switcher Tabs */}
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-[#C5A059] font-bold">
              {isRtl ? 'السورة المستهدفة الحالية للحفظ' : 'Active Target Surah for Hifz'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-black/20 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
            {POPULAR_SURAHS.slice(0, 4).map(surah => {
              const isSelected = surah.number === activeTargetSurah.number;
              return (
                <button
                  key={surah.number}
                  onClick={() => setSelectedTargetSurahNumber(surah.number)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#C5A059] text-white font-bold shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="font-arabic">{surah.nameArabic}</span>
                  <span className="text-[10px] opacity-75 font-mono">({surah.memorizationProgress}%)</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text & Actions */}
          <div className="max-w-xl flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-[#C5A059]/40 text-xs text-[#C5A059] font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'ورد التسميع اليومي النشط' : "Active Daily Recitation Target"}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="font-arabic text-3xl sm:text-4xl font-bold text-[#FDFBF7]">
                {activeTargetSurah.nameArabic}
              </h2>
              <span className="text-sm font-medium text-[#C5A059] tracking-wide">
                {activeTargetSurah.nameEnglish} • {activeTargetSurah.nameTranslation}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 max-w-md">
              {isRtl
                ? `سمّع آيات سورة ${activeTargetSurah.nameArabic} (${activeTargetSurah.numberOfAyahs} آية) بصوتك. يستمع الذكاء الاصطناعي بدقة تجويدية وحركية تامة لتثبيت الحفظ في الذاكرة طويلة المدى.`
                : `Recite Surah ${activeTargetSurah.nameEnglish} (${activeTargetSurah.numberOfAyahs} Ayahs) aloud. The speech engine listens word by word, correcting harakah and tajweed slips in real time.`}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate('recitation')}
                className="px-6 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4c] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Mic className="w-5 h-5 text-white" />
                <span>{isRtl ? 'بدء التسميع الصوتي' : 'Start Vocal Recitation'}</span>
              </button>

              <button
                onClick={() => onNavigate('library')}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white text-xs font-medium border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#C5A059]" />
                <span>{isRtl ? 'استعراض المصحف' : 'Browse Surah'}</span>
              </button>
            </div>
          </div>

          {/* Right Circular Progress Showcase Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-black/25 backdrop-blur-md border border-[#C5A059]/40 shadow-inner w-full lg:w-auto">
            {/* Primary Circular Progress Ring */}
            <div className="relative flex flex-col items-center">
              <CircularProgress
                value={activeTargetSurah.memorizationProgress}
                size={144}
                strokeWidth={11}
                gradient={{
                  id: `target-progress-${activeTargetSurah.number}`,
                  from: activeTargetSurah.memorizationProgress === 100 ? '#72D6A5' : '#C5A059',
                  to: activeTargetSurah.memorizationProgress === 100 ? '#4EAE7B' : '#F6E0A4'
                }}
                trackColor="rgba(255,255,255,0.12)"
                centerText={
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                      {activeTargetSurah.memorizationProgress}%
                    </span>
                    <span className="text-[11px] font-semibold text-[#C5A059] tracking-wider uppercase mt-0.5">
                      {isRtl ? 'نسبة الإتقان' : 'Completed'}
                    </span>
                  </div>
                }
              />
              <span className="mt-2 text-xs font-bold text-neutral-200">
                {targetMasteredAyahs} / {activeTargetSurah.numberOfAyahs} {isRtl ? 'آية متقنة' : 'Ayahs'}
              </span>
            </div>

            {/* Target Breakdown & Milestones */}
            <div className="space-y-3 min-w-[190px] border-t sm:border-t-0 sm:border-l sm:border-white/15 pt-3 sm:pt-0 sm:pl-5 border-white/10 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-400">{isRtl ? 'حالة الحفظ:' : 'Status:'}</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  activeTargetSurah.memorizationProgress === 100
                    ? 'bg-[#72D6A5]/20 text-[#72D6A5] border border-[#72D6A5]/30'
                    : 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30'
                }`}>
                  {activeTargetSurah.memorizationProgress === 100
                    ? (isRtl ? 'مكتملة بالكامل' : 'Fully Mastered')
                    : (isRtl ? `${remainingAyahs} آيات متبقية` : `${remainingAyahs} Ayahs Left`)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-400">{isRtl ? 'تثبيت الذاكرة:' : 'Retention:'}</span>
                <span className="font-bold text-[#FDFBF7]">
                  {activeTargetSurah.memorizationProgress >= 70 ? '88% (High)' : '65% (Building)'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-400">{isRtl ? 'دقة التجويد:' : 'Tajweed Score:'}</span>
                <span className="font-bold text-[#72D6A5]">96% (Hafs)</span>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>{isRtl ? 'هدف اليوم:' : "Today's Wird:"}</span>
                  <span className="text-[#C5A059] font-bold">10 / 10 Ayahs</span>
                </div>
                <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#C5A059] h-full w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TARGET SURAH ANALYTICS STRIP: CIRCULAR PROGRESS GAUGES */}
      <div className="p-5 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? `مؤشرات إتقان سورة ${activeTargetSurah.nameArabic}` : `Mastery Gauges for Surah ${activeTargetSurah.nameEnglish}`}
            </h3>
          </div>
          <span className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
            {isRtl ? 'تحليل لحظي لجودة الحفظ الصوتي والتجويدي' : 'Real-time vocal recall & acoustic precision'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Gauge 1: Surah Memorization Completion */}
          <div className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex flex-col items-center text-center">
            <CircularProgress
              value={activeTargetSurah.memorizationProgress}
              size={76}
              strokeWidth={7}
              color={activeTargetSurah.memorizationProgress === 100 ? '#72D6A5' : '#C5A059'}
              trackColor="currentColor"
              className="text-[#E8E2D6] dark:text-[#232E2F] mb-2"
              centerText={
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-[#1A4D4E] dark:text-[#E8ECE9] font-mono leading-none">
                    {activeTargetSurah.memorizationProgress}%
                  </span>
                </div>
              }
            />
            <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'نسبة حفظ السورة' : 'Surah Completion'}
            </span>
            <span className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] mt-0.5">
              {targetMasteredAyahs} / {activeTargetSurah.numberOfAyahs} {isRtl ? 'آيات' : 'Ayahs'}
            </span>
          </div>

          {/* Gauge 2: Tajweed Precision */}
          <div className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex flex-col items-center text-center">
            <CircularProgress
              value={94}
              size={76}
              strokeWidth={7}
              color="#27827E"
              trackColor="currentColor"
              className="text-[#E8E2D6] dark:text-[#232E2F] mb-2"
              centerText={
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-[#1A4D4E] dark:text-[#E8ECE9] font-mono leading-none">
                    94%
                  </span>
                </div>
              }
            />
            <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'دقة التجويد' : 'Tajweed Accuracy'}
            </span>
            <span className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] mt-0.5">
              {isRtl ? 'مخارج وأحكام متقنة' : 'Phonetic Accuracy'}
            </span>
          </div>

          {/* Gauge 3: Retention Strength */}
          <div className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex flex-col items-center text-center">
            <CircularProgress
              value={activeTargetSurah.memorizationProgress >= 70 ? 88 : 65}
              size={76}
              strokeWidth={7}
              color={activeTargetSurah.memorizationProgress >= 70 ? '#72D6A5' : '#D96E54'}
              trackColor="currentColor"
              className="text-[#E8E2D6] dark:text-[#232E2F] mb-2"
              centerText={
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-[#1A4D4E] dark:text-[#E8ECE9] font-mono leading-none">
                    {activeTargetSurah.memorizationProgress >= 70 ? '88%' : '65%'}
                  </span>
                </div>
              }
            />
            <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'ثبات الذاكرة' : 'Retention Anchor'}
            </span>
            <span className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] mt-0.5">
              {isRtl ? 'التكرار المتباعد' : 'Spaced Memory'}
            </span>
          </div>

          {/* Gauge 4: Daily Goal Pace */}
          <div className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex flex-col items-center text-center">
            <CircularProgress
              value={100}
              size={76}
              strokeWidth={7}
              color="#C5A059"
              trackColor="currentColor"
              className="text-[#E8E2D6] dark:text-[#232E2F] mb-2"
              centerText={
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
                </div>
              }
            />
            <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'ورد اليوم' : 'Daily Wird'}
            </span>
            <span className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] mt-0.5">
              10 / 10 {isRtl ? 'آيات منجزة' : 'Ayahs Done'}
            </span>
          </div>
        </div>
      </div>

      {/* THREE-COLUMN BENTO: MEMORY HEALTH, REVIEW QUEUE, AUDIO COACH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Memory Health Breakdown */}
        <div className="p-5 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'صحة الذاكرة والحفظ' : 'Memory Health Spectrum'}
            </h3>
            <span className="text-[11px] text-[#C5A059] font-bold uppercase tracking-wider">
              {isRtl ? 'مستقر' : 'Stable'}
            </span>
          </div>

          <div className="space-y-3">
            {/* Strong */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#5F6E6C] dark:text-[#A6B2AF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1A4D4E] dark:bg-[#72D6A5]" />
                  {isRtl ? 'راسخ (أكثر من 5 مراجعات متقنة)' : 'Firmly Anchored (>5 repeats)'}
                </span>
                <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">105 Ayahs</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                <div className="h-full bg-[#1A4D4E] dark:bg-[#72D6A5] w-[74%]" />
              </div>
            </div>

            {/* Needs Review */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#5F6E6C] dark:text-[#A6B2AF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                  {isRtl ? 'بحاجة لمراجعة قريبة' : 'Due for Refresh (Spaced)'}
                </span>
                <span className="font-bold text-[#C5A059]">29 Ayahs</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                <div className="h-full bg-[#C5A059] w-[20%]" />
              </div>
            </div>

            {/* Fragile */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#5F6E6C] dark:text-[#A6B2AF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D96E54]" />
                  {isRtl ? 'قيد التثبيت (أخطاء حديثة)' : 'Fragile / Recent Slips'}
                </span>
                <span className="font-bold text-[#D96E54]">8 Ayahs</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                <div className="h-full bg-[#D96E54] w-[6%]" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#6F7D7B] dark:text-[#8E9B98] pt-1 leading-relaxed">
            {isRtl
              ? 'تعتمد الخوارزمية على منحنى إبنجهاوس للنسيان لإعادة الآيات المعرضة للضعف قبل زوالها.'
              : 'Our spaced repetition engine detects phonetic hesitation and brings fragile verses back to your wird.'}
          </p>
        </div>

        {/* Card 2: Spaced Mistake Review Queue */}
        <div className="p-5 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'طابور مراجعة التجويد' : 'Tajweed Slips Queue'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D96E54]/15 text-[#D96E54]">
                {unreviewedMistakesCount} {isRtl ? 'مقاطع' : 'phrases'}
              </span>
            </div>

            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mb-3.5 leading-relaxed">
              {isRtl
                ? 'مقاطع سابقة توقفت عندها لتصحيح مد لازم أو إخفاء حقيقي. تدرب عليها الآن لتثبيتها.'
                : 'Subtle slips you encountered in earlier sessions (e.g. Madd length, Ikhfa nasalization).'}
            </p>

            {/* Quick Preview of top slip */}
            <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs space-y-1">
              <div className="flex justify-between items-center text-[11px] text-[#C5A059] font-semibold">
                <span>Al-Fatihah : 7</span>
                <span>Madd Lazim (6 counts)</span>
              </div>
              <p className="font-arabic text-base font-bold text-[#1A4D4E] dark:text-[#E8ECE9] text-center py-1">
                صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ ... وَلَا <span className="text-[#D96E54] underline decoration-[#D96E54]/40">ٱلضَّآلِّينَ</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('review')}
            className="w-full mt-4 py-2.5 rounded-xl border border-[#1A4D4E]/30 dark:border-[#C5A059]/40 text-[#1A4D4E] dark:text-[#C5A059] font-semibold text-xs hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'بدء تدريب المقاطع (3 دقائق)' : 'Practice Slips (3 mins)'}</span>
          </button>
        </div>

        {/* Card 3: Audio Coach & Reference Reciter */}
        <div className="p-5 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'مرشد التلاوة الصوتي' : 'Vocal Coach Settings'}
              </h3>
              <span className="text-xs text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
              <div className="flex justify-between py-1 border-b border-[#E8E2D6]/70 dark:border-[#232E2F]">
                <span>{isRtl ? 'القارئ المرجعي:' : 'Reference Qari:'}</span>
                <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">Mishary Alafasy</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D6]/70 dark:border-[#232E2F]">
                <span>{isRtl ? 'صوت التوجيه:' : 'Guidance Voice:'}</span>
                <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">Warm & Unhurried (Female)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D6]/70 dark:border-[#232E2F]">
                <span>{isRtl ? 'دقة التجويد:' : 'Tajweed Filter:'}</span>
                <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">Standard (Hafs)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('audio-settings')}
            className="w-full mt-4 py-2.5 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? 'تعديل الصوت ونبرة المرشد' : 'Adjust Audio & Reciters'}</span>
          </button>
        </div>
      </div>

      {/* QUICK JUMP TO RECENT SURAHS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'مكتبة السور المحفوظة والنشطة' : 'Active Surahs in Your Hifz Target'}
            </h3>
            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
              {isRtl ? 'انقر على أي سورة للبدء في التسميع أو المراجعة المباشرة' : 'Tap any Surah to open instant memory recitation or word breakdown'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isRtl ? 'عرض كل السور (114)' : 'View All Library (114)'}</span>
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_SURAHS.slice(0, 4).map(surah => {
            const isSelected = surah.number === activeTargetSurah.number;
            const masteredAyahs = Math.round((surah.memorizationProgress / 100) * surah.numberOfAyahs);
            const isComplete = surah.memorizationProgress === 100;

            return (
              <div
                key={surah.number}
                onClick={() => setSelectedTargetSurahNumber(surah.number)}
                className={`p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border transition-all shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 dark:ring-[#C5A059]/20'
                    : 'border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#27827E]/20 text-[#1A4D4E] dark:text-[#72D6A5] text-xs font-bold flex items-center justify-center">
                        {surah.number}
                      </div>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold text-[#C5A059] bg-[#C5A059]/15 px-1.5 py-0.5 rounded-md">
                          {isRtl ? 'المستهدفة' : 'Target'}
                        </span>
                      )}
                    </div>
                    <span className="font-arabic text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9] group-hover:text-[#C5A059] transition-colors">
                      {surah.nameArabic}
                    </span>
                  </div>

                  <div className="text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
                    <p className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">{surah.nameEnglish}</p>
                    <p className="text-[11px] text-[#8E9B98]">{surah.nameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                  </div>
                </div>

                {/* Circular Progress Indicator for this target Surah */}
                <div className="mt-4 pt-3 border-t border-[#E8E2D6]/70 dark:border-[#232E2F] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8E9B98] block">
                      {isRtl ? 'نسبة الإتقان' : 'Mastery'}
                    </span>
                    <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {masteredAyahs}/{surah.numberOfAyahs} {isRtl ? 'آية' : 'Ayahs'}
                    </span>
                  </div>

                  <div className="relative">
                    <CircularProgress
                      value={surah.memorizationProgress}
                      size={48}
                      strokeWidth={4.5}
                      color={
                        isComplete
                          ? '#72D6A5'
                          : surah.memorizationProgress >= 70
                          ? '#C5A059'
                          : surah.memorizationProgress >= 40
                          ? '#27827E'
                          : '#D96E54'
                      }
                      trackColor="currentColor"
                      className="text-[#E8E2D6] dark:text-[#232E2F]"
                      centerText={
                        isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-[#72D6A5]" />
                        ) : (
                          <span className="text-[11px] font-bold font-mono text-[#1A4D4E] dark:text-[#E8ECE9]">
                            {surah.memorizationProgress}%
                          </span>
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
