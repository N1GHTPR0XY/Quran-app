import React from 'react';
import { Direction, UserProfile } from '../../types';
import {
  BarChart2,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface ProgressAnalyticsScreenProps {
  user: UserProfile;
  direction: Direction;
}

export const ProgressAnalyticsScreen: React.FC<ProgressAnalyticsScreenProps> = ({ user, direction }) => {
  const isRtl = direction === 'rtl';

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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
          {isRtl ? 'تحليلات الحفظ والاستقرار الذهني' : 'Hifz Retention & Phonetic Analytics'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
          {isRtl
            ? 'متابعة منحنى ثبات الذاكرة، خريطة إتقان الأجزاء الثلاثين، ودقة الأحكام التجويدية بمرور الأيام.'
            : 'Spaced repetition stability curves, 30-Juz mastery heatmap, and phonetic accuracy breakdown.'}
        </p>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">Total Verses</span>
          <p className="text-2xl font-bold text-[#1A4D4E] dark:text-[#C5A059] mt-1">{user.totalMemorizedAyahs}</p>
          <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">+18 this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">Active Streak</span>
          <p className="text-2xl font-bold text-[#D96E54] mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-current" />
            <span>{user.currentStreak} d</span>
          </p>
          <span className="text-[10px] text-[#8E9B98]">Unbroken focus</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">Overall Accuracy</span>
          <p className="text-2xl font-bold text-[#1A4D4E] dark:text-[#72D6A5] mt-1">96.4%</p>
          <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">Top 5% Hifz precision</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm">
          <span className="text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">Weekly Recite</span>
          <p className="text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] mt-1">146 m</p>
          <span className="text-[10px] text-[#C5A059] font-semibold">Target achieved</span>
        </div>
      </div>

      {/* SECTION 1: WEEKLY RECITATION TIME CHART */}
      <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'دقائق التسميع الصوتي هذا الأسبوع' : 'Daily Vocal Practice Duration (Minutes)'}
            </h3>
            <p className="text-xs text-[#8E9B98]">Daily Goal: 15 minutes of uninterrupted vocal memory recitation</p>
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

      {/* SECTION 2: 30-JUZ MASTERY HEATMAP */}
      <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'خريطة إتقان أجزاء القرآن الكريم (30 جزءاً)' : '30-Juz Quran Mastery Heatmap'}
            </h3>
            <p className="text-xs text-[#8E9B98]">Click any Juz block to review memorization strength and retention</p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#6F7D7B]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1A4D4E]" /> Mastered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#C5A059]" /> Reviewing</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#E8E2D6] dark:bg-[#232E2F]" /> Untouched</span>
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

      {/* SECTION 3: TAJWEED & HARAKAT ACCURACY BREAKDOWN */}
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
    </div>
  );
};
