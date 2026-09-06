import React from 'react';
import { Direction, ScreenId, UserProfile } from '../../types';
import { POPULAR_SURAHS, INITIAL_MISTAKES_REVIEW } from '../../data/quranData';
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
  ShieldAlert
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
  const featuredSurah = POPULAR_SURAHS[1]; // Surah Al-Mulk
  const unreviewedMistakesCount = INITIAL_MISTAKES_REVIEW.filter(m => !m.mastered).length;

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
        <div className="flex items-center gap-3 self-start sm:self-auto">
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
        </div>
      </div>

      {/* HERO SECTION: TODAY'S WIRD & RESUME RECITE CTA */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1A4D4E] via-[#143E3F] to-[#0E3B3C] text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-[#C5A059]/40">
        {/* Background Islamic Arabesque watermark */}
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none transform translate-x-16 -translate-y-16">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-[#C5A059]">
            <polygon points="100,10 120,70 190,70 135,110 155,180 100,140 45,180 65,110 10,70 80,70" />
            <circle cx="100" cy="100" r="85" />
            <circle cx="100" cy="100" r="60" />
          </svg>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-[#C5A059]/40 text-xs text-[#C5A059] font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'ورد التسميع اليومي' : "Today's Core Recitation Task"}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="font-arabic text-3xl sm:text-4xl font-bold text-[#FDFBF7]">
              سُورَةُ المُلْك
            </h2>
            <span className="text-sm font-medium text-[#C5A059] tracking-wide">
              Ayahs 1 – 10 (Revision & Retention)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 max-w-md">
            {isRtl
              ? 'سمّع الآيات غيباً بصوتك. يستمع التطبيق كلمة بكلمة ويتوقف بلطف عند أدنى خطأ حركي أو تجويدي لتصحيحه دون أي إحراج.'
              : 'Recite aloud from memory. Tadreeb follows along word by word. If a harakah or tajweed rule slips, it pauses with gentle harmonic audio, plays the correct qari pronunciation, and lets you retry.'}
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => onNavigate('recitation')}
              className="px-6 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4c] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Mic className="w-5 h-5 text-white" />
              <span>{isRtl ? 'بدء التسميع الصوتي الآن' : 'Start Vocal Recitation'}</span>
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

        {/* Progress Bar inside Card */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-300">{isRtl ? 'نسبة إتقان سورة الملك:' : 'Surah Al-Mulk Mastery:'}</span>
            <span className="font-bold text-[#C5A059]">72% (22/30 Ayahs)</span>
          </div>
          <div className="w-full sm:w-48 bg-white/15 h-2 rounded-full overflow-hidden">
            <div className="bg-[#C5A059] h-full w-[72%] rounded-full" />
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
          {POPULAR_SURAHS.slice(0, 4).map(surah => (
            <div
              key={surah.number}
              onClick={() => onNavigate('recitation')}
              className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] transition-all shadow-sm hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#27827E]/20 text-[#1A4D4E] dark:text-[#72D6A5] text-xs font-bold flex items-center justify-center">
                  {surah.number}
                </div>
                <span className="font-arabic text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9] group-hover:text-[#C5A059] transition-colors">
                  {surah.nameArabic}
                </span>
              </div>

              <div className="text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
                <p className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">{surah.nameEnglish}</p>
                <p className="text-[11px] text-[#8E9B98]">{surah.nameTranslation} • {surah.numberOfAyahs} Ayahs</p>
              </div>

              {/* Progress */}
              <div className="mt-3 pt-3 border-t border-[#E8E2D6]/70 dark:border-[#232E2F] flex items-center justify-between text-[11px]">
                <span className="text-[#8E9B98]">{isRtl ? 'الإتقان' : 'Mastery'}</span>
                <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">{surah.memorizationProgress}%</span>
              </div>
              <div className="w-full h-1 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${surah.memorizationProgress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
