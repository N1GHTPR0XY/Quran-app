import React, { useState } from 'react';
import { TajweedMistake, AudioSettings, Direction, ScreenId } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import {
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  Filter,
  Check,
  Play,
  ArrowRight,
  ArrowLeft,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface MistakeReviewScreenProps {
  mistakes: TajweedMistake[];
  audioSettings: AudioSettings;
  direction: Direction;
  onNavigate: (screen: ScreenId) => void;
  onMarkMastered: (id: string) => void;
}

export const MistakeReviewScreen: React.FC<MistakeReviewScreenProps> = ({
  mistakes,
  audioSettings,
  direction,
  onNavigate,
  onMarkMastered
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unmastered' | 'tajweed' | 'harakat'>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);

  const isRtl = direction === 'rtl';

  const filteredMistakes = mistakes.filter(m => {
    if (selectedFilter === 'unmastered') return !m.mastered;
    if (selectedFilter === 'tajweed') return m.mistakeType === 'tajweed_slip';
    if (selectedFilter === 'harakat') return m.mistakeType === 'wrong_harakah';
    return true;
  });

  const currentMistake = filteredMistakes[activeCardIndex] || filteredMistakes[0];

  const handlePlayReference = (m: TajweedMistake) => {
    setIsPlayingReference(true);
    // Play Qari audio sample
    const sampleUrl = m.surahNumber === 1
      ? `https://everyayah.com/data/Alafasy_128kbps/00100${m.ayahNumber}.mp3`
      : `https://everyayah.com/data/Alafasy_128kbps/06700${m.ayahNumber}.mp3`;

    audioEngine.playReciterAudio(sampleUrl, () => {
      setIsPlayingReference(false);
    });
  };

  const handlePlayUserSample = (m: TajweedMistake) => {
    setIsPlayingUser(true);
    audioEngine.speakGuidance(
      `Your recorded attempt: ${m.userRecitation}`,
      audioSettings,
      () => setIsPlayingUser(false)
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn pb-28">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'مراجعة وتثبيت الأخطاء السابقة' : 'Mistake Review & Tajweed Drills'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
            {isRtl
              ? 'تثبيت المقاطع التي حدث فيها لبس حركي أو تجويدي عبر المقارنة السمعية والتدريب المركز.'
              : 'Targeted reinforcement of tricky harakat, madd durations, and articulation points.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: isRtl ? 'الكل' : 'All' },
            { id: 'unmastered', label: isRtl ? 'قيد التثبيت' : 'Active' },
            { id: 'tajweed', label: isRtl ? 'أحكام التجويد' : 'Tajweed' },
            { id: 'harakat', label: isRtl ? 'الحركات' : 'Harakat' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFilter(f.id as typeof selectedFilter);
                setActiveCardIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-[#1A4D4E] text-white dark:bg-[#C5A059] dark:text-[#0E1A1A] shadow-sm'
                  : 'bg-[#FDFBF7] dark:bg-[#122021] text-[#5F6E6C] dark:text-[#A6B2AF] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {currentMistake ? (
        <div className="space-y-6">
          {/* ACTIVE DRILL FLASHCARD */}
          <div className="bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Card Header & Rule Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D96E54]" />
                <span className="text-xs uppercase tracking-wider font-bold text-[#1A4D4E] dark:text-[#C5A059]">
                  {currentMistake.surahName} • Ayah {currentMistake.ayahNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5E6CC] dark:bg-[#2F2718] text-[#8B6E30] dark:text-[#E5C37A] font-semibold border border-[#C5A059]/30">
                  {currentMistake.tajweedRule || 'Harakah'}
                </span>
                {currentMistake.mastered && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold flex items-center gap-1 border border-[#C2DBCB]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mastered</span>
                  </span>
                )}
              </div>
            </div>

            {/* Arabic Word Display */}
            <div className="text-center py-5 bg-[#F5F2ED] dark:bg-[#172526] rounded-2xl border border-[#E8E2D6] dark:border-[#232E2F]">
              <div className="font-arabic text-4xl sm:text-5xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] py-2">
                {currentMistake.wordArabic}
              </div>
              <p className="text-xs text-[#C5A059] font-medium mt-1">
                Expected: <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">{currentMistake.expectedRecitation}</span>
              </p>
            </div>

            {/* A/B AUDIO WAVEFORM COMPARISON */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#C5A059]" />
                  <span>{isRtl ? 'مقارنة الموجات الصوتية (المسجلة مقابل المرجعية)' : 'Acoustic Waveform Analysis (User vs. Master Qari)'}</span>
                </div>
                <span className="text-[10px] text-[#8E9B98]">Visual Phonetic Match: 84%</span>
              </div>

              {/* Master Qari Waveform Track */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Master Reference (Mishary Alafasy)</span>
                  </span>
                  <button
                    onClick={() => handlePlayReference(currentMistake)}
                    className="text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isPlayingReference ? 'Playing...' : 'Play Reference'}</span>
                  </button>
                </div>
                {/* Simulated Visual Waveform */}
                <div className="h-8 bg-[#EAF2ED] dark:bg-[#142A20] rounded-xl flex items-center justify-around px-3 gap-1 overflow-hidden border border-[#C2DBCB]/40">
                  {[24, 40, 15, 60, 85, 95, 70, 80, 50, 65, 90, 45, 30, 75, 40, 60, 25].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-[#1A4D4E] dark:bg-[#72D6A5] rounded-full transition-all duration-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* User Recitation Waveform Track */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#D96E54] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Your Vocal Attempt ({currentMistake.timestamp})</span>
                  </span>
                  <button
                    onClick={() => handlePlayUserSample(currentMistake)}
                    className="text-xs font-bold text-[#D96E54] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isPlayingUser ? 'Playing...' : 'Play Attempt'}</span>
                  </button>
                </div>
                {/* Simulated Visual Waveform with Mistake Highlight */}
                <div className="h-8 bg-[#F6DDD6]/60 dark:bg-[#341C17]/60 rounded-xl flex items-center justify-around px-3 gap-1 overflow-hidden border border-[#D96E54]/20">
                  {[20, 35, 12, 55, 40, 42, 65, 75, 45, 55, 30, 40, 25, 65, 35, 50, 20].map((h, i) => {
                    const isDiscrepant = i >= 4 && i <= 6;
                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          isDiscrepant ? 'bg-[#D96E54] animate-pulse' : 'bg-[#C5A059]'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Diagnostic Coach Note */}
            <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#5F6E6C] dark:text-[#A6B2AF] space-y-1">
              <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">Teacher Note:</span>
              <p className="leading-relaxed">{currentMistake.explanation}</p>
            </div>

            {/* Drill Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('recitation')}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRtl ? 'تسميع هذا المقطع الآن بالصوت' : 'Practice & Recite in Context'}</span>
              </button>

              <button
                onClick={() => onMarkMastered(currentMistake.id)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] hover:bg-[#DCEEE3] border border-[#C2DBCB] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isRtl ? 'تعليم كـ متقن' : 'Mark Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Card Carousel Navigation */}
          <div className="flex items-center justify-between text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
            <button
              onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
              disabled={activeCardIndex === 0}
              className="p-2 px-3 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] disabled:opacity-40 hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center gap-1 cursor-pointer bg-[#FDFBF7] dark:bg-[#122021]"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isRtl ? 'السابق' : 'Previous Slip'}</span>
            </button>

            <span>
              {activeCardIndex + 1} of {filteredMistakes.length}
            </span>

            <button
              onClick={() => setActiveCardIndex(prev => Math.min(filteredMistakes.length - 1, prev + 1))}
              disabled={activeCardIndex === filteredMistakes.length - 1}
              className="p-2 px-3 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] disabled:opacity-40 hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center gap-1 cursor-pointer bg-[#FDFBF7] dark:bg-[#122021]"
            >
              <span>{isRtl ? 'التالي' : 'Next Slip'}</span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#1A4D4E] dark:text-[#72D6A5] mx-auto" />
          <h3 className="font-bold text-lg text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'ممتاز! لا توجد أخطاء حالياً' : 'All Slips Mastered!'}
          </h3>
          <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] max-w-sm mx-auto">
            {isRtl
              ? 'لقد راجعت جميع المقاطع السابقة بنجاح. يمكنك مواصلة التسميع اليومي لإضافة آيات جديدة.'
              : 'Your review queue is clear. Continue your daily recitation to build new memorized ayahs.'}
          </p>
          <button
            onClick={() => onNavigate('recitation')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#1A4D4E] text-white text-xs font-semibold hover:bg-[#153e3f] transition-colors cursor-pointer"
          >
            {isRtl ? 'العودة للتسميع' : 'Return to Recitation'}
          </button>
        </div>
      )}
    </div>
  );
};
