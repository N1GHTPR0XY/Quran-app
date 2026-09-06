import React, { useState } from 'react';
import { TajweedMistake, AudioSettings, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { audioRecordingService } from '../../services/audioRecordingService';
import { Volume2, RotateCcw, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, Mic } from 'lucide-react';

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
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingRef, setIsPlayingRef] = useState(false);

  const handlePlayUserRecording = () => {
    setIsPlayingUser(true);
    const userAudio = mistake.userAudioBlobUrl || audioRecordingService.getClipForMistake(mistake.id)?.url;
    if (userAudio) {
      audioRecordingService.playUserAudio(userAudio, undefined, () => setIsPlayingUser(false));
    } else {
      audioEngine.speakGuidance(
        `Your recorded attempt was: ${mistake.userRecitation}`,
        audioSettings,
        () => setIsPlayingUser(false)
      );
    }
  };

  const handlePlayReference = () => {
    setIsPlayingRef(true);
    const audioUrl = referenceAudioUrl || mistake.referenceAudioUrl;
    if (audioUrl) {
      audioRecordingService.playReferenceAudio(audioUrl, undefined, () => setIsPlayingRef(false));
    } else {
      // Speak coach instruction
      audioEngine.speakGuidance(
        `Listen carefully to the pronunciation: ${mistake.expectedRecitation}. ${mistake.explanation}`,
        audioSettings,
        () => setIsPlayingRef(false)
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
  const harakah = mistake.harakahDetail;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#FDFBF7] dark:bg-[#122021] border-t sm:border border-[#E8E2D6] dark:border-[#232E2F] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-[#1A4D4E] dark:text-[#E8ECE9] animate-slideUp">
        
        {/* Top Affirmation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D96E54] animate-ping" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#D96E54]">
              {harakah
                ? (isRtl ? 'تنبيه لحن جلي • تبديل حركة الحرف' : 'Recitation Stopped • Harakah Correction')
                : (isRtl ? 'توجيه هادئ • تثبيت الحفظ' : 'Gentle Pause & Reinforce')}
            </span>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.color}`}>
            {harakah ? (isRtl ? 'كسرة ⟵ ضمة' : 'Kasrah ⟵ Dammah') : badge.label}
          </span>
        </div>

        {/* HARAKAH COMPARISON CARD (If Harakah Mistake) */}
        {harakah ? (
          <div className="space-y-3">
            {/* Letter & Word Comparison Stage */}
            <div className="grid grid-cols-2 gap-3">
              {/* Expected (Kasrah) */}
              <div className="p-4 rounded-2xl bg-[#EAF2ED] dark:bg-[#142A20] border-2 border-[#2E7D5A]/40 text-center space-y-1.5 shadow-sm">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D5A] dark:text-[#72D6A5] uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'الصحيح: كَسْرَة (ـِ)' : 'Correct: Kasrah (ـِ)'}</span>
                </div>
                <div className="font-arabic text-4xl sm:text-5xl font-extrabold text-[#1A4D4E] dark:text-[#E8ECE9] py-1" dir="rtl">
                  {harakah.expectedWord}
                </div>
                <div className="text-xs font-semibold text-[#2E7D5A] dark:text-[#72D6A5]">
                  حرف {harakah.harfNameArabic}: <span className="font-arabic text-xl font-bold">{harakah.expectedArabicLetter}</span>
                </div>
                <p className="text-[11px] text-[#5F6E6C] dark:text-[#A6B2AF] font-mono">
                  {harakah.phoneticExpected} (sound: &quot;i&quot;)
                </p>
              </div>

              {/* Detected (Dammah) */}
              <div className="p-4 rounded-2xl bg-[#FDF2F0] dark:bg-[#2A1715] border-2 border-[#D96E54]/40 text-center space-y-1.5 shadow-sm">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D96E54] uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'المنطوق: ضَمَّة (ـُ)' : 'Detected: Dammah (ـُ)'}</span>
                </div>
                <div className="font-arabic text-4xl sm:text-5xl font-extrabold text-[#D96E54] py-1 line-through decoration-[#D96E54]/70" dir="rtl">
                  {harakah.actualWord}
                </div>
                <div className="text-xs font-semibold text-[#D96E54]">
                  قُرئت: <span className="font-arabic text-xl font-bold">{harakah.actualArabicLetter}</span>
                </div>
                <p className="text-[11px] text-[#8E9B98] font-mono">
                  {harakah.phoneticActual} (sound: &quot;u&quot;)
                </p>
              </div>
            </div>

            {/* Vocal Articulation / Mouth Shape Guidance */}
            <div className="p-3.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#5F6E6C] dark:text-[#A6B2AF] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1A4D4E] dark:text-[#C5A059]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{isRtl ? 'توجيه المخرج الصوتي لحركة الكسرة:' : 'Articulation & Mouth Shape Guide:'}</span>
              </div>
              <p className="leading-relaxed">
                {isRtl
                  ? harakah.mouthShapeTip
                  : `For the letter ${harakah.harfNameEnglish} with Kasrah (${harakah.expectedArabicLetter}): Lower your lower jaw gently to produce the clean, bright 'i' vowel. Avoid rounding your lips, which turns the vowel into a Dammah (${harakah.actualArabicLetter}).`}
              </p>
            </div>
          </div>
        ) : (
          /* The Standard Highlighted Word */
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
        )}

        {/* Diagnostic Explanation */}
        <div className="space-y-1.5 text-xs sm:text-sm text-[#5F6E6C] dark:text-[#A6B2AF] leading-relaxed">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'حكم التجويد: ' : 'Tajweed Insight: '}
              </strong>
              {mistake.explanation}
            </p>
          </div>
        </div>

        {/* Audio Layer Actions (Listen to Your Voice / Listen to Master / Coach) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handlePlayUserRecording}
            className="py-2.5 px-3 rounded-xl bg-[#FDF2F0] dark:bg-[#2A1715] border border-[#D96E54]/40 hover:bg-[#FBE8E4] text-xs font-semibold text-[#D96E54] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#D96E54]" />
            <span>
              {isPlayingUser
                ? (isRtl ? 'تشغيل صوتك...' : 'Playing Your Voice...')
                : (isRtl ? 'استمع لصوتك المسجل' : 'Play Your Recitation')}
            </span>
          </button>

          <button
            onClick={handlePlayReference}
            className="py-2.5 px-3 rounded-xl bg-[#FDFBF7] dark:bg-[#172526] border border-[#C5A059]/40 hover:bg-[#F5F2ED] dark:hover:bg-[#1E3032] text-xs font-semibold text-[#1A4D4E] dark:text-[#C5A059] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#C5A059]" />
            <span>
              {isPlayingRef
                ? (isRtl ? 'تشغيل الشيخ...' : 'Playing Master...')
                : (isRtl ? 'استمع للشيخ بالكسرة' : 'Master Reference')}
            </span>
          </button>

          <button
            onClick={handlePlayCoachVoice}
            className="py-2.5 px-3 rounded-xl bg-[#FDFBF7] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#F5F2ED] dark:hover:bg-[#1E3032] text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#1A4D4E] dark:text-[#72D6A5]" />
            <span>{isRtl ? 'شرح المخرج' : 'Coach Guidance'}</span>
          </button>
        </div>

        {/* Primary Bottom Actions: Retry Phrase (Highlighted) vs Continue */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onRetry}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] dark:hover:bg-[#21706D] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {harakah
                ? (isRtl ? `إعادة النطق بحركة الكسرة (${harakah.expectedArabicLetter})` : `Retry Word with Kasrah (${harakah.expectedArabicLetter})`)
                : (isRtl ? 'إعادة تسميع هذا المقطع والتحقق' : 'Retry This Phrase (Vocal)')}
            </span>
          </button>

          <button
            onClick={onContinue}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-[#6F7D7B] dark:text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{isRtl ? 'تخطي ومتابعة السورة (ستُحفظ في المراجعة)' : 'Continue anyway (saved to review queue)'}</span>
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
