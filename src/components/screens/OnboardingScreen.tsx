import React, { useState } from 'react';
import { Direction, GoalSettings } from '../../types';
import { Check, Target, Clock, BookOpen, Volume2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface OnboardingScreenProps {
  onComplete: (goals: GoalSettings) => void;
  direction: Direction;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, direction }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetName, setTargetName] = useState('Juz 30 (Juz Amma)');
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [dailyAyahs, setDailyAyahs] = useState(5);
  const [preferredPace, setPreferredPace] = useState<'steady' | 'accelerated' | 'intensive'>('steady');
  const [preferredTime, setPreferredTime] = useState<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'night'>('fajr');
  const [micTested, setMicTested] = useState(false);

  const isRtl = direction === 'rtl';

  const handleTestChime = () => {
    audioEngine.playGentlePauseChime();
    setMicTested(true);
  };

  const handleFinish = () => {
    onComplete({
      dailyAyahTarget: dailyAyahs,
      dailyMinutes: dailyMinutes,
      targetCompletionDate: '3 Months',
      preferredPracticeTime: preferredTime,
      reminderEnabled: true,
      primaryPace: preferredPace
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === s
                ? 'w-8 bg-[#1A4D4E] dark:bg-[#C5A059]'
                : step > s
                ? 'w-2 bg-[#1A4D4E]/60 dark:bg-[#C5A059]/60'
                : 'w-2 bg-[#E8E2D6] dark:border-[#232E2F]'
            }`}
          />
        ))}
      </div>

      <div className="bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Subtle decorative gold badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-xs text-[#C5A059] font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isRtl ? 'إعداد خطة الحفظ الشخصية' : 'Personalized Memorization Plan'}</span>
        </div>

        {/* STEP 1: Memorization Target */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'ما هو هدفك الحالي في الحفظ؟' : 'What is your primary memorization goal?'}
              </h2>
              <p className="text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1.5">
                {isRtl
                  ? 'يقوم تدريب بتنظيم وردك وتوزيع الآيات وفق منحنى تكرار متباعد ذكي يمنع النسيان.'
                  : 'Tadreeb adapts your daily wird using spaced repetition to build enduring, effortless retention.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { id: 'Juz 30 (Juz Amma)', titleAr: 'جزء عمّ (الجزء 30)', desc: '37 Surahs • The foundation for prayer and daily recitation' },
                { id: 'Surah Al-Mulk & As-Sajdah', titleAr: 'سورة الملك والسجدة', desc: 'Nightly protection & reflective memorization' },
                { id: 'Surah Al-Kahf', titleAr: 'سورة الكهف', desc: '110 Ayahs • Light from Friday to Friday' },
                { id: 'Surah Al-Baqarah', titleAr: 'سورة البقرة', desc: '286 Ayahs • The pinnacle of spiritual defense' },
                { id: 'Juz 29 (Tabarak)', titleAr: 'جزء تبارك (الجزء 29)', desc: '11 Surahs • Intermediate memorization milestone' },
                { id: 'Complete Quran (30 Ajza)', titleAr: 'القرآن الكريم كاملاً (30 جزءاً)', desc: 'Comprehensive Hafiz curriculum with rigorous revision' }
              ].map(target => {
                const isSelected = targetName === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => setTargetName(target.id)}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#E8E2D6]/40 dark:bg-[#172526] shadow-sm'
                        : 'border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]/50 bg-white dark:bg-[#122021]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                        {isRtl ? target.titleAr : target.id}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">{target.desc}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>{isRtl ? 'المتابعة لتحديد الوقت والوتيرة' : 'Continue to Time Commitment'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* STEP 2: Time Commitment & Pace */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'كم دقيقة تود تخصيصها يومياً؟' : 'How much time can you dedicate daily?'}
              </h2>
              <p className="text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1.5">
                {isRtl
                  ? 'أحب الأعمال إلى الله أدومها وإن قل. حتى 10 دقائق من التسميع الصوتي تصنع فرقاً حاسماً.'
                  : 'Consistency precedes mastery. Even 10 unhurried minutes of active vocal recitation locks memory in place.'}
              </p>
            </div>

            {/* Daily Minutes Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2.5">
                {isRtl ? 'الوقت اليومي المفضل' : 'Daily Recitation Duration'}
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[5, 10, 15, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDailyMinutes(mins)}
                    className={`py-3 px-2 rounded-xl text-center border font-semibold text-sm transition-all cursor-pointer ${
                      dailyMinutes === mins
                        ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#1A4D4E] text-white dark:bg-[#C5A059] dark:text-[#0E1A1A]'
                        : 'border-[#E8E2D6] dark:border-[#232E2F] bg-white dark:bg-[#172526] text-[#5F6E6C] dark:text-[#A6B2AF]'
                    }`}
                  >
                    {mins} {isRtl ? 'د' : 'min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Ayahs Pace */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2.5">
                {isRtl ? 'عدد الآيات الجديدة يومياً' : 'Daily New Ayah Pacing'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { count: 3, label: 'Gentle (3 Ayahs)', labelAr: 'ميسر (3 آيات)' },
                  { count: 5, label: 'Balanced (5 Ayahs)', labelAr: 'متوازن (5 آيات)' },
                  { count: 10, label: 'Intensive (10 Ayahs)', labelAr: 'مكثف (10 آيات)' }
                ].map(p => (
                  <button
                    key={p.count}
                    onClick={() => setDailyAyahs(p.count)}
                    className={`p-3 rounded-xl border text-center font-medium text-xs transition-all cursor-pointer ${
                      dailyAyahs === p.count
                        ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#E8E2D6]/60 dark:bg-[#172526] text-[#1A4D4E] dark:text-[#E8ECE9] font-bold'
                        : 'border-[#E8E2D6] dark:border-[#232E2F] bg-white dark:bg-[#122021] text-[#6F7D7B] dark:text-[#9AA5A3]'
                    }`}
                  >
                    {isRtl ? p.labelAr : p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time of Day */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2.5">
                {isRtl ? 'أفضل أوقات التسميع بالنسبة لك' : 'Optimal Practice Window'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fajr', title: 'After Fajr', titleAr: 'بعد الفجر' },
                  { id: 'asr', title: 'Late Afternoon', titleAr: 'بعد العصر' },
                  { id: 'night', title: 'Before Sleep', titleAr: 'قبل النوم' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPreferredTime(t.id as 'fajr' | 'asr' | 'night')}
                    className={`py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      preferredTime === t.id
                        ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#1A4D4E]/10 dark:bg-[#C5A059]/10 text-[#1A4D4E] dark:text-[#C5A059] font-semibold'
                        : 'border-[#E8E2D6] dark:border-[#232E2F] text-[#6F7D7B] dark:text-[#9AA5A3]'
                    }`}
                  >
                    {isRtl ? t.titleAr : t.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] text-sm text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#E8E2D6]/40 dark:hover:bg-[#232E2F] transition-colors cursor-pointer"
              >
                {isRtl ? 'السابق' : 'Back'}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isRtl ? 'المتابعة للمعايرة الصوتية' : 'Next: Acoustic Calibration'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Audio Tone & Gentle Correction Sample */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'تجربة نغمة التصحيح الهادئة' : 'Experience Gentle Tajweed Correction'}
              </h2>
              <p className="text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1.5 leading-relaxed">
                {isRtl
                  ? 'لا توجد أصوات تنبيه مزعجة أو مشاعر بالفشل. عندما يحدث خطأ في الحركة أو التجويد، يتوقف التطبيق بنعمة صوتية دافئة، ويسمعك النطق الصحيح ثم يتيح لك إعادة المقطع.'
                  : 'Zero jarring buzzers or red penalty states. When a harakah or tajweed rule slips, Tadreeb pauses with a meditative chime, highlights the exact syllable, and lets you gently retry.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A4D4E] dark:text-[#C5A059] uppercase tracking-wider">
                  {isRtl ? 'معاينة صوت التنبيه الهادئ' : 'Acoustic Pause Chime Preview'}
                </span>
                <span className="text-xs text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] px-2.5 py-0.5 rounded-full font-medium border border-[#C2DBCB]/60">
                  432 Hz Warm Harmonic
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTestChime}
                  className="px-4 py-2.5 rounded-xl bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/35 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isRtl ? 'تشغيل رنين التنبيه' : 'Play Gentle Chime'}</span>
                </button>
                <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
                  {micTested
                    ? (isRtl ? '✓ تم تشغيل الرنين الهادئ بنجاح' : '✓ Harmonic tone verified successfully')
                    : (isRtl ? 'اضغط للاستماع لنغمة التنبيه المهدئة' : 'Tap to hear the non-punitive pause chime')}
                </p>
              </div>
            </div>

            {/* Plan Summary Card */}
            <div className="p-4 rounded-2xl bg-[#E8E2D6]/30 dark:bg-[#172526] border border-[#C5A059]/30 text-xs space-y-2">
              <div className="flex justify-between text-[#5F6E6C] dark:text-[#A6B2AF]">
                <span>{isRtl ? 'الهدف المختار:' : 'Target:'}</span>
                <span className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">{targetName}</span>
              </div>
              <div className="flex justify-between text-[#5F6E6C] dark:text-[#A6B2AF]">
                <span>{isRtl ? 'الورد اليومي:' : 'Commitment:'}</span>
                <span className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">{dailyMinutes} mins ({dailyAyahs} ayahs/day)</span>
              </div>
              <div className="flex justify-between text-[#5F6E6C] dark:text-[#A6B2AF]">
                <span>{isRtl ? 'وضع التسميع:' : 'Recitation Mode:'}</span>
                <span className="font-semibold text-[#1A4D4E] dark:text-[#C5A059]">Real-Time Memory Listening</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] text-sm text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#E8E2D6]/40 dark:hover:bg-[#232E2F] transition-colors cursor-pointer"
              >
                {isRtl ? 'السابق' : 'Back'}
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C5A059] dark:text-[#0E1A1A]" />
                <span>{isRtl ? 'بدء تدريبك الآن في لوحة التحكم' : 'Start Practicing with Tadreeb'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
