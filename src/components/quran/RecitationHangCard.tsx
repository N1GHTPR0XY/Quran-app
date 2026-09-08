import React from 'react';
import {
  AlertCircle,
  Lightbulb,
  Volume2,
  RotateCcw,
  Play,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  X,
  Mic
} from 'lucide-react';
import { RecitationHangState, Direction } from '../../types';

interface RecitationHangCardProps {
  hangState: RecitationHangState;
  direction: Direction;
  speakerLanguage: 'ar' | 'en';
  onRepeatPrompt: () => void;
  onPlayMasterSheikh: () => void;
  onContinue: () => void;
  onRetryPhrase: () => void;
  onOpenDetailedAnalysis?: () => void;
  onDismiss: () => void;
}

export const RecitationHangCard: React.FC<RecitationHangCardProps> = ({
  hangState,
  direction,
  speakerLanguage,
  onRepeatPrompt,
  onPlayMasterSheikh,
  onContinue,
  onRetryPhrase,
  onOpenDetailedAnalysis,
  onDismiss
}) => {
  const isRtl = direction === 'rtl';
  const isMistake = hangState.reason === 'mistake';

  return (
    <div
      className={`w-full max-w-2xl mx-auto my-3 rounded-2xl border-2 transition-all shadow-md animate-fadeIn overflow-hidden ${
        isMistake
          ? 'bg-[#FDF2F0] dark:bg-[#2A1412] border-[#D96E54]/40 text-[#1A4D4E] dark:text-[#F87171]'
          : 'bg-[#FDFBF7] dark:bg-[#122220] border-[#C5A059]/40 text-[#1A4D4E] dark:text-[#E8ECE9]'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Banner Bar */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b ${
          isMistake
            ? 'bg-[#FBE8E4] dark:bg-[#341614] border-[#D96E54]/25 text-[#D96E54]'
            : 'bg-[#F6EEDF] dark:bg-[#182C29] border-[#C5A059]/25 text-[#8B6E30] dark:text-[#D4B574]'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold">
          {isMistake ? (
            <AlertCircle className="w-4 h-4 text-[#D96E54] flex-shrink-0 animate-pulse" />
          ) : (
            <Lightbulb className="w-4 h-4 text-[#C5A059] flex-shrink-0 animate-bounce" />
          )}
          <span>
            {isMistake
              ? (isRtl
                  ? `⏸️ توقف وتصحيح • الآية ${hangState.ayahNumber}`
                  : `⏸️ Pause & Correct • Verse ${hangState.ayahNumber}`)
              : (isRtl
                  ? `💡 تلقين الآية ${hangState.ayahNumber} • نسيان أو تردد`
                  : `💡 Verse Prompt • Ayah ${hangState.ayahNumber}`)}
          </span>
          <span className="hidden sm:inline opacity-75 font-normal">
            • {isRtl ? 'تكرار النطق ثم المتابعة' : 'Repeated for you to continue'}
          </span>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          title={isRtl ? 'إغلاق الإشعار' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Word Display with Spotlight Focus */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-semibold">
            <span>{isMistake ? (isRtl ? 'الحرف الموقوف عنده:' : 'Target Letter:') : (isRtl ? 'الكلمة الملقنة:' : 'Prompt Word:')}</span>
            {hangState.letterHint && (
              <span className="font-arabic font-bold text-[#D96E54] dark:text-[#FCA5A5]">
                {hangState.letterHint}
              </span>
            )}
          </div>

          <div
            className="font-arabic text-4xl sm:text-5xl font-extrabold text-[#1A4D4E] dark:text-[#E8ECE9] py-1 tracking-wide leading-relaxed drop-shadow-xs"
            dir="rtl"
          >
            {hangState.wordArabic}
          </div>

          <div className="text-xs text-[#5F6E6C] dark:text-[#A6B2AF] font-mono">
            {hangState.wordTransliteration}
          </div>
        </div>

        {/* Pedagogical Explanation */}
        <div className="p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-black/5 dark:border-white/5 text-xs text-[#5F6E6C] dark:text-[#A6B2AF] leading-relaxed text-center">
          <p>{hangState.explanation}</p>
        </div>

        {/* Audio Repetition Live Indicator */}
        <div className="flex items-center justify-center">
          {hangState.isRepeatingAudio ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/20 text-[#8B6E30] dark:text-[#E5C37A] text-xs font-bold animate-pulse">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>
                {isRtl
                  ? '🔊 المعلم يكرر نطق الحرف والكلمة الآن...'
                  : '🔊 Repeating letter and word pronunciation now...'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#72D6A5] text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isRtl
                  ? 'استمعت للتكرار • ردد بصوتك بالميكروفون أو اضغط متابعة'
                  : 'Listen, repeat aloud into mic, or tap Continue'}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls: Repeat -> Continue Flow */}
        <div className="space-y-2 pt-1">
          {/* Audio Replay & Sheikh Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={onRepeatPrompt}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] text-xs font-semibold text-[#1A4D4E] dark:text-[#C5A059] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-[#C5A059]" />
              <span>
                {isRtl
                  ? `أعد نطق الكلمة والحرف (${hangState.repeatCount})`
                  : `Repeat Word & Letter (${hangState.repeatCount})`}
              </span>
            </button>

            <button
              onClick={onPlayMasterSheikh}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#2E7D5A] text-xs font-semibold text-[#2E7D5A] dark:text-[#72D6A5] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isRtl ? 'استمع للآية من الشيخ' : 'Listen to Master Reciter'}</span>
            </button>
          </div>

          {/* Primary Continue Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={onRetryPhrase}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إعادة تسميع المقطع' : 'Retry Phrase'}</span>
            </button>

            <button
              onClick={onContinue}
              className="sm:col-span-2 py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] dark:hover:bg-[#21706D] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{isRtl ? '▶️ متابعة التلاوة والاستمرار' : '▶️ Continue Recitation'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Optional: Deep inspection for mistakes */}
          {isMistake && onOpenDetailedAnalysis && (
            <div className="text-center pt-1">
              <button
                onClick={onOpenDetailedAnalysis}
                className="text-[11px] font-semibold text-[#D96E54] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {isRtl
                    ? 'عرض التحليل الصوتي الكامل ومقارنة تسجيل صوتك مع الشيخ'
                    : 'View full acoustic analysis & voice spectrogram review'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
