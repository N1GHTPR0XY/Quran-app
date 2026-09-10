import React, { useState } from 'react';
import { Direction, UserProfile, TajweedMistake } from '../../types';
import { AchievementsSection } from '../achievements/AchievementsSection';
import { SurahCertificatesSection } from '../certificates/SurahCertificatesSection';
import {
  BarChart2,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Activity,
  Trophy,
  Medal,
  Printer
} from 'lucide-react';

interface ProgressAnalyticsScreenProps {
  user: UserProfile;
  direction: Direction;
  mistakes?: TajweedMistake[];
}

export const ProgressAnalyticsScreen: React.FC<ProgressAnalyticsScreenProps> = ({
  user,
  direction,
  mistakes
}) => {
  const isRtl = direction === 'rtl';
  const [activeTab, setActiveTab] = useState<'all' | 'certificates' | 'badges' | 'practice' | 'phonetics'>('all');

  // Weekly recitation minutes data
  const weeklyData = [
    { day: 'Mon', minutes: 18, target: 15 },
    { day: 'Tue', minutes: 22, target: 15 },
    { day: 'Wed', minutes: 15, target: 15 },
    { day: 'Thu', minutes: 30, target: 15 },
    { day: 'Fri', minutes: 25, target: 15 },
    { day: 'Sat', minutes: 20, target: 15 },
    { day: 'Sun', minutes: 16, target: 15 }
  ];

  // 30 Juz heatmap levels (0: untouched, 1: learning, 2: reviewing, 3: mastered)
  const juzMastery = [
    { juz: 1, progress: 85, level: 3 },
    { juz: 2, progress: 40, level: 2 },
    { juz: 3, progress: 15, level: 1 },
    { juz: 4, progress: 0, level: 0 },
    { juz: 5, progress: 0, level: 0 },
    { juz: 6, progress: 0, level: 0 },
    { juz: 7, progress: 0, level: 0 },
    { juz: 8, progress: 0, level: 0 },
    { juz: 9, progress: 0, level: 0 },
    { juz: 10, progress: 0, level: 0 },
    { juz: 11, progress: 0, level: 0 },
    { juz: 12, progress: 0, level: 0 },
    { juz: 13, progress: 0, level: 0 },
    { juz: 14, progress: 0, level: 0 },
    { juz: 15, progress: 35, level: 2 }, // Al-Kahf
    { juz: 16, progress: 0, level: 0 },
    { juz: 17, progress: 0, level: 0 },
    { juz: 18, progress: 0, level: 0 },
    { juz: 19, progress: 0, level: 0 },
    { juz: 20, progress: 0, level: 0 },
    { juz: 21, progress: 0, level: 0 },
    { juz: 22, progress: 45, level: 2 }, // Ya-Sin
    { juz: 23, progress: 0, level: 0 },
    { juz: 24, progress: 0, level: 0 },
    { juz: 25, progress: 0, level: 0 },
    { juz: 26, progress: 0, level: 0 },
    { juz: 27, progress: 60, level: 2 }, // Ar-Rahman
    { juz: 28, progress: 30, level: 1 },
    { juz: 29, progress: 75, level: 3 }, // Tabarak / Al-Mulk
    { juz: 30, progress: 95, level: 3 }  // Juz Amma
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn pb-28">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A4D4E]/10 dark:bg-[#72D6A5]/10 text-[#1A4D4E] dark:text-[#72D6A5] text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? 'الأوسمة والإحصائيات التراكمية' : 'Milestones, Badges & Retention Analytics'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'تحليلات الحفظ والأوسمة المحققة' : 'Hifz Progress & Milestone Badges'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1 max-w-2xl">
            {isRtl
              ? 'تابع الأوسمة المكتسبة كسلسلة المواظبة (7 أيام) وإتقان السور، إلى جانب خريطة الأجزاء الثلاثين ودقة التجويد الصوتية.'
              : 'Track earned milestone badges like Consistent Reciter (7-day streak) and Surah Mastered, alongside 30-Juz retention heatmap and phonetic accuracy.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5F2ED] dark:bg-[#172526] p-1 rounded-2xl border border-[#E8E2D6] dark:border-[#232E2F] overflow-x-auto w-fit">
          {[
            { id: 'all', label: isRtl ? 'الكل' : 'All Views' },
            { id: 'certificates', label: isRtl ? 'شهادات الإتقان' : 'Certificates', icon: Award },
            { id: 'badges', label: isRtl ? 'الأوسمة' : 'Badges & Milestones', icon: Medal },
            { id: 'practice', label: isRtl ? 'الورد والخريطة' : 'Practice & Juz Map', icon: BarChart2 },
            { id: 'phonetics', label: isRtl ? 'دقة التجويد' : 'Phonetics', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#122021] text-[#1A4D4E] dark:text-[#72D6A5] shadow-xs'
                    : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP STATS CARDS WITH MILESTONE BADGE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">
            {isRtl ? 'الآيات المحفوظة' : 'Total Verses'}
          </span>
          <p className="text-2xl font-bold text-[#1A4D4E] dark:text-[#C5A059] mt-1">{user.totalMemorizedAyahs}</p>
          <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">
            {isRtl ? 'وسام الخطوة الأولى محقق' : 'First Steps badge earned'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">
            {isRtl ? 'سلسلة المواظبة' : 'Active Streak'}
          </span>
          <p className="text-2xl font-bold text-[#D96E54] mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-current" />
            <span>{user.currentStreak} d</span>
          </p>
          <span className="text-[10px] text-[#D96E54] font-semibold">
            {isRtl ? 'وسام المداوم (7 أيام) محقق ✓' : 'Consistent Reciter (7d) ✓'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">
            {isRtl ? 'الأوسمة المُنجزة' : 'Badges Earned'}
          </span>
          <p className="text-2xl font-bold text-[#1A4D4E] dark:text-[#72D6A5] mt-1 flex items-center gap-1">
            <Award className="w-5 h-5 text-[#C5A059]" />
            <span>6 / 10</span>
          </p>
          <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">
            {isRtl ? 'رتبة متقن (المستوى الثاني)' : 'Mutqin Tier II unlocked'}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('certificates')}
          className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] transition-colors cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">
              {isRtl ? 'دقة التلاوة الكلية' : 'Overall Accuracy'}
            </span>
            <Printer className="w-3.5 h-3.5 text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] mt-1">96.4%</p>
          <span className="text-[10px] text-[#C5A059] font-semibold flex items-center gap-1">
            {isRtl ? 'شهادات إتقان جاهزة للطباعة 🖨️' : 'Printable Certificates Ready 🖨️'}
          </span>
        </div>
      </div>

      {/* SECTION 1: SURAH COMPLETION & PRINTABLE CERTIFICATES */}
      {(activeTab === 'all' || activeTab === 'certificates') && (
        <SurahCertificatesSection
          user={user}
          direction={direction}
        />
      )}

      {/* SECTION 2: ACHIEVEMENT SYSTEM & BADGES */}
      {(activeTab === 'all' || activeTab === 'badges') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'أوسمة الإنجاز والتميز القرآني' : 'Achievement Badges & Milestones'}
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#8E9B98]">
              {isRtl ? 'انقر على أي وسام للتفاصيل' : 'Click any badge to view details & reflection'}
            </span>
          </div>

          <AchievementsSection
            user={user}
            mistakes={mistakes}
            direction={direction}
          />
        </div>
      )}

      {/* SECTION 2: WEEKLY RECITATION TIME CHART */}
      {(activeTab === 'all' || activeTab === 'practice') && (
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'دقائق التسميع الصوتي هذا الأسبوع' : 'Daily Vocal Practice Duration (Minutes)'}
              </h3>
              <p className="text-xs text-[#8E9B98]">
                {isRtl ? 'الهدف اليومي: 15 دقيقة من التسميع الصوتي المتصل' : 'Daily Goal: 15 minutes of uninterrupted vocal memory recitation'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] px-2.5 py-1 rounded-full">
              100% Target Met
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {weeklyData.map(item => {
                const heightPct = Math.min(100, (item.minutes / 35) * 100);
                const exceeded = item.minutes >= item.target;
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-bold text-[#5F6E6C] dark:text-[#A6B2AF] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.minutes}m
                    </span>
                    <div className="w-full bg-[#E8E2D6] dark:bg-[#232E2F] h-36 rounded-xl overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${
                          exceeded ? 'bg-[#1A4D4E] dark:bg-[#27827E]' : 'bg-[#C5A059]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#6F7D7B] dark:text-[#8E9B98]">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 30-JUZ MASTERY HEATMAP */}
      {(activeTab === 'all' || activeTab === 'practice') && (
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'خريطة إتقان أجزاء القرآن الكريم (30 جزءاً)' : '30-Juz Quran Mastery Heatmap'}
              </h3>
              <p className="text-xs text-[#8E9B98]">
                {isRtl ? 'انقر على أي جزء لمراجعة ثبات الحفظ والاستقرار' : 'Click any Juz block to review memorization strength and retention'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#6F7D7B]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1A4D4E]" /> {isRtl ? 'متقن' : 'Mastered'}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#C5A059]" /> {isRtl ? 'مراجعة' : 'Reviewing'}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#E8E2D6] dark:bg-[#232E2F]" /> {isRtl ? 'غير مبدوء' : 'Untouched'}</span>
            </div>
          </div>

          {/* Heatmap 30 Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-2">
            {juzMastery.map(item => {
              const bgClass =
                item.level === 3
                  ? 'bg-[#1A4D4E] text-white shadow-sm'
                  : item.level === 2
                  ? 'bg-[#C5A059] text-[#0E1A1A] font-bold'
                  : item.level === 1
                  ? 'bg-[#E8E2D6] dark:bg-[#232E2F] text-[#1A4D4E] dark:text-[#C5A059]'
                  : 'bg-[#F5F2ED] dark:bg-[#172526] text-[#8E9B98] border border-[#E8E2D6] dark:border-[#232E2F]';

              return (
                <div
                  key={item.juz}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition-transform hover:scale-105 ${bgClass}`}
                  title={`Juz ${item.juz}: ${item.progress}% memorized`}
                >
                  <span className="text-[10px] uppercase tracking-tighter opacity-80">Juz</span>
                  <span className="text-xs font-bold">{item.juz}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: TAJWEED & HARAKAT ACCURACY BREAKDOWN */}
      {(activeTab === 'all' || activeTab === 'phonetics') && (
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'دقة قواعد التجويد ومخارج الحروف' : 'Phonetic Accuracy by Tajweed Category'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { rule: 'Harakat (Fathah, Dammah, Kasrah)', accuracy: 98.4, desc: 'Pristine grammatical vowel cases' },
              { rule: 'Qalqalah Sughra & Kubra', accuracy: 95.2, desc: 'Baa, Jeem, Dal, Taa, Qaf echo bounce' },
              { rule: 'Ghunnah & Noon / Meem Mushaddadah', accuracy: 96.0, desc: '2-count nasal resonance depth' },
              { rule: 'Madd Rules (Lazim, Munfasil, Muttasil)', accuracy: 91.8, desc: 'Vowel elongation rhythm & breath timing' }
            ].map(item => (
              <div key={item.rule} className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#1A4D4E] dark:text-[#E8ECE9]">{item.rule}</span>
                  <span className="text-[#1A4D4E] dark:text-[#72D6A5]">{item.accuracy}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A4D4E] dark:bg-[#72D6A5] rounded-full" style={{ width: `${item.accuracy}%` }} />
                </div>
                <p className="text-[10px] text-[#8E9B98]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
