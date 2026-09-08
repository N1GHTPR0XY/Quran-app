import React from 'react';
import { TajweedRuleOccurrence } from '../../services/tajweedAnalyzer';
import { AudioSettings, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { X, Sparkles, Volume2, CheckCircle2, Info, BookOpen, Music } from 'lucide-react';

interface TajweedRuleInspectorModalProps {
  rule: TajweedRuleOccurrence | null;
  wordArabic?: string;
  direction: Direction;
  audioSettings: AudioSettings;
  speakerLanguage: 'ar' | 'en';
  onClose: () => void;
}

export const TajweedRuleInspectorModal: React.FC<TajweedRuleInspectorModalProps> = ({
  rule,
  wordArabic,
  direction,
  audioSettings,
  speakerLanguage,
  onClose
}) => {
  if (!rule) return null;

  const isRtl = direction === 'rtl';

  const handleSpeakGuidance = () => {
    const speech = isRtl
      ? `حكم ${rule.ruleNameArabic}. ${rule.coachingTipArabic}. ${rule.explanationArabic}`
      : `Tajweed rule: ${rule.ruleNameEnglish}. ${rule.coachingTip}. ${rule.explanation}`;
    audioEngine.speakGuidance(speech, audioSettings, speakerLanguage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[#232E2F] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? rule.ruleNameArabic : rule.ruleNameEnglish}
              </h3>
              <p className="text-[11px] text-[#8E9B98]">
                {isRtl ? 'تفصيل الحكم الصوتي ومخارج الحروف' : 'Acoustic Tajweed Rule & Articulation Guide'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E9B98] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word and Letter Showcase */}
        <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#8E9B98] uppercase font-bold tracking-wider block">
              {isRtl ? 'الكلمة القرآنية' : 'Quranic Word'}
            </span>
            <span className="font-arabic text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] mt-0.5 block" dir="rtl">
              {wordArabic || 'الكلمة'}
            </span>
          </div>

          <div className="text-end">
            <span className="text-[11px] text-[#8E9B98] uppercase font-bold tracking-wider block">
              {isRtl ? 'الحرف المطبق عليه' : 'Affected Letter'}
            </span>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <span className="text-xs font-semibold text-[#6F7D7B] dark:text-[#9AA5A3]">
                {isRtl ? rule.affectedLetterNameArabic : rule.affectedLetterNameEnglish}
              </span>
              <span className="font-arabic text-xl font-bold text-[#C5A059] px-2 py-0.5 rounded-lg bg-white dark:bg-[#122021] border border-[#C5A059]/30">
                {rule.affectedLetter}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#152324] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isRtl ? 'التعريف والضابط التجويدي:' : 'Scholarly Tajweed Definition:'}</span>
            </div>
            <p className="text-xs text-[#5F6E6C] dark:text-[#A6B2AF] leading-relaxed">
              {isRtl ? rule.explanationArabic : rule.explanation}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#EAF2ED]/70 dark:bg-[#142A20]/70 border border-[#2E7D5A]/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D5A] dark:text-[#72D6A5]">
              <Music className="w-3.5 h-3.5" />
              <span>{isRtl ? 'التوجيه الصوتي العملي (Acoustic Cue):' : 'Practical Vocal Articulation Cue:'}</span>
            </div>
            <p className="text-xs text-[#2E7D5A] dark:text-[#A8E6C8] font-medium leading-relaxed">
              {isRtl ? rule.coachingTipArabic : rule.coachingTip}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleSpeakGuidance}
            className="px-4 py-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] hover:bg-[#EAF2ED] border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-[#C5A059]" />
            <span>{isRtl ? 'استمع للتوجيه الصوتي' : 'Hear Vocal Guidance'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            {isRtl ? 'فهمت، متابعة التلاوة' : 'Understood, Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
