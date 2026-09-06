import React from 'react';
import { TajweedMistake, AudioSettings, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { Volume2, RotateCcw, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';

interface CorrectionOverlayProps {
  mistake: TajweedMistake;
  audioSettings: AudioSettings;
  direction: Direction;
  onRetry: () => void;
  onContinue: () => void;
  referenceAudioUrl?: string;
}

export const CorrectionOverlay: React.FC<CorrectionOverlayProps> = ({
  mistake,
  audioSettings,
  direction,
  onRetry,
  onContinue,
  referenceAudioUrl
}) => {
  const isRtl = direction === 'rtl';

  const handlePlayReference = () => {
    if (referenceAudioUrl) {
      audioEngine.playReciterAudio(referenceAudioUrl);
    } else {
      // Speak coach instruction
      audioEngine.speakGuidance(
        `Listen carefully to the pronunciation: ${mistake.expectedRecitation}. ${mistake.explanation}`,
        audioSettings
      );
    }
  };

  const handlePlayCoachVoice = () => {
    audioEngine.speakGuidance(
      `Notice the rule here: ${mistake.explanation}. Try reciting this phrase once more.`,
      audioSettings
    );
  };

  const getRuleBadge = () => {
    switch (mistake.mistakeType) {
      case 'wrong_harakah':
        return { label: isRtl ? 'حركة خاطئة' : 'Harakah Vowel Adjustment', color: 'bg-[#D96E54]/15 text-[#D96E54] border-[#D96E54]/30' };
      case 'tajweed_slip':
        return { label: mistake.tajweedRule ? `${mistake.tajweedRule} Rule` : (isRtl ? 'حكم تجويد' : 'Tajweed Rule'), color: 'bg-[#C5A869]/20 text-[#9D7E3B] dark:text-[#D4BC84] border-[#C5A869]/40' };
      case 'skipped_word':
        return { label: isRtl ? 'كلمة محذوفة' : 'Skipped Word', color: 'bg-[#D96E54]/15 text-[#D96E54] border-[#D96E54]/30' };
      case 'repeated_word':
        return { label: isRtl ? 'تكرار كلمة' : 'Repeated Word', color: 'bg-[#C5A869]/20 text-[#9D7E3B] dark:text-[#D4BC84] border-[#C5A869]/40' };
      default:
        return { label: isRtl ? 'مخرج الحرف' : 'Articulation Slip', color: 'bg-[#D96E54]/15 text-[#D96E54] border-[#D96E54]/30' };
    }
  };

  const badge = getRuleBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-[#FDFBF7] dark:bg-[#122021] border-t sm:border border-[#E8E2D6] dark:border-[#232E2F] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-[#1A4D4E] dark:text-[#E8ECE9] animate-slideUp">
        
        {/* Top Affirmation Bar (Gentle, Non-punitive) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#C5A059]">
              {isRtl ? 'توجيه هادئ • تثبيت الحفظ' : 'Gentle Pause & Reinforce'}
            </span>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* The Exact Highlighted Word with Breathing Room */}
        <div className="p-5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-center space-y-2">
          <p className="text-[11px] text-[#6F7D7B] dark:text-[#A6B2AF]">
            {mistake.surahName} • Ayah {mistake.ayahNumber}
          </p>
          <div className="font-arabic text-4xl sm:text-5xl font-bold text-[#D96E54] py-2 tracking-wide leading-relaxed">
            {mistake.wordArabic}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-xs shadow-sm">
            <span className="text-[#6F7D7B] dark:text-[#8E9B98]">{isRtl ? 'المطلوب:' : 'Correct:'}</span>
            <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">{mistake.expectedRecitation}</span>
          </div>
        </div>

        {/* Diagnostic Explanation */}
        <div className="space-y-1.5 text-xs sm:text-sm text-[#5F6E6C] dark:text-[#A6B2AF] leading-relaxed">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'توضيح ميسر: ' : 'Coaching Insight: '}
              </strong>
              {mistake.explanation}
            </p>
          </div>
        </div>

        {/* Audio Layer Actions (Listen to Qari / Coach) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handlePlayReference}
            className="py-2.5 px-3 rounded-xl bg-[#FDFBF7] dark:bg-[#172526] border border-[#C5A059]/40 hover:bg-[#F5F2ED] dark:hover:bg-[#1E3032] text-xs font-semibold text-[#1A4D4E] dark:text-[#C5A059] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#C5A059]" />
            <span>{isRtl ? 'استمع للقارئ المرجعي' : 'Listen to Qari'}</span>
          </button>

          <button
            onClick={handlePlayCoachVoice}
            className="py-2.5 px-3 rounded-xl bg-[#FDFBF7] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#F5F2ED] dark:hover:bg-[#1E3032] text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#1A4D4E] dark:text-[#72D6A5]" />
            <span>{isRtl ? 'شرح صوتي للمرشد' : 'Coach Pronunciation'}</span>
          </button>
        </div>

        {/* Primary Bottom Actions: Retry Phrase (Highlighted) vs Continue */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onRetry}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] dark:hover:bg-[#21706D] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isRtl ? 'إعادة تسميع هذا المقطع والتحقق' : 'Retry This Phrase (Vocal)'}</span>
          </button>

          <button
            onClick={onContinue}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-[#6F7D7B] dark:text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{isRtl ? 'تخطي ومتابعة السورة (ستُحفظ في المراجعة)' : 'Continue anyway (saves to review queue)'}</span>
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
