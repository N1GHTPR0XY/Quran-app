import React from 'react';
import { TajweedRuleOccurrence } from '../../services/tajweedAnalyzer';
import { AudioSettings, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { Sparkles, Volume2, Info, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface LiveTajweedCoachProps {
  currentWordArabic?: string;
  currentWordTransliteration?: string;
  rules: TajweedRuleOccurrence[];
  audioSettings: AudioSettings;
  speakerLanguage: 'ar' | 'en';
  direction: Direction;
  onInspectRule: (rule: TajweedRuleOccurrence) => void;
}

export const LiveTajweedCoach: React.FC<LiveTajweedCoachProps> = ({
  currentWordArabic,
  currentWordTransliteration,
  rules,
  audioSettings,
  speakerLanguage,
  direction,
  onInspectRule
}) => {
  const isRtl = direction === 'rtl';

  if (!currentWordArabic || rules.length === 0) {
    return (
      <div className="w-full py-2 px-3 rounded-2xl bg-[#F5F2ED]/60 dark:bg-[#172526]/60 border border-[#E8E2D6]/80 dark:border-[#232E2F]/80 flex items-center justify-between text-[11px] text-[#8E9B98]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>
            {isRtl
              ? 'مراقب التجويد اللحظي • يحلل الإظهار، الإخفاء، الشدة، القلقلة، والمدود تلقائياً'
              : 'Live Tajweed Engine • Actively detecting Izhar, Ikhfa, Shedda, Qalqalah, & Madd'}
          </span>
        </div>
        <span className="font-arabic font-semibold opacity-70">أحكام التجويد</span>
      </div>
    );
  }

  const primaryRule = rules[0];

  const handleSpeakRuleTip = (e: React.MouseEvent, rule: TajweedRuleOccurrence) => {
    e.stopPropagation();
    const tipToSpeak = isRtl ? rule.coachingTipArabic : rule.coachingTip;
    audioEngine.speakGuidance(tipToSpeak, audioSettings, speakerLanguage);
  };

  return (
    <div className="w-full p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#152324] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs space-y-2 animate-fadeIn">
      <div className="flex items-center justify-between gap-2 border-b border-[#E8E2D6]/70 dark:border-[#232E2F]/70 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#C5A059]/15 text-[#8A6D3B] dark:text-[#E5C37A] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-1.5">
              <span>{isRtl ? 'حكم التجويد في الكلمة الحالية:' : 'Active Word Tajweed Rule:'}</span>
              <span className="font-arabic font-bold text-[#C5A059]" dir="rtl">
                {currentWordArabic}
              </span>
            </span>
          </div>
        </div>

        {/* Rule Badges Pill */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {rules.map((rule, idx) => (
            <button
              key={idx}
              onClick={() => onInspectRule(rule)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-105 ${rule.badgeBg} ${rule.badgeText}`}
              title={isRtl ? 'اضغط لعرض تفاصيل الحكم وطريقة نطقها' : 'Click to inspect Tajweed rule guidance'}
            >
              <span>{isRtl ? rule.ruleNameArabic : rule.ruleNameEnglish}</span>
              <Info className="w-3 h-3 opacity-80" />
            </button>
          ))}
        </div>
      </div>

      {/* Primary Rule Coaching & Acoustic Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
        <div className="space-y-0.5 text-xs">
          <p className="text-[#1A4D4E] dark:text-[#D1DDD9] font-medium leading-relaxed">
            {isRtl ? primaryRule.explanationArabic : primaryRule.explanation}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
            <span className="font-semibold text-[#C5A059]">
              {isRtl ? 'توجيه النطق:' : 'Acoustic Cue:'}
            </span>
            <span>{isRtl ? primaryRule.coachingTipArabic : primaryRule.coachingTip}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => handleSpeakRuleTip(e, primaryRule)}
            className="px-2.5 py-1.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] hover:bg-[#EAF2ED] border border-[#E8E2D6] dark:border-[#232E2F] text-[11px] font-semibold text-[#1A4D4E] dark:text-[#E8ECE9] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Hear vocal guidance for this Tajweed rule"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? 'استمع للتوجيه' : 'Vocal Cue'}</span>
          </button>

          <button
            onClick={() => onInspectRule(primaryRule)}
            className="px-2.5 py-1.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>{isRtl ? 'دليل الحكم' : 'Rule Guide'}</span>
            {isRtl ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
