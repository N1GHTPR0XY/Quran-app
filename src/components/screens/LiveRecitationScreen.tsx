import React, { useState, useEffect, useRef } from 'react';
import { SurahData, AudioSettings, TajweedMistake, Direction, ScreenId } from '../../types';
import { POPULAR_SURAHS, INITIAL_MISTAKES_REVIEW } from '../../data/quranData';
import { audioEngine } from '../../services/audioEngine';
import { CorrectionOverlay } from './CorrectionOverlay';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sliders,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface LiveRecitationScreenProps {
  surah?: SurahData;
  audioSettings: AudioSettings;
  direction: Direction;
  onNavigate: (screen: ScreenId) => void;
  onRecordMistake: (mistake: TajweedMistake) => void;
}

export const LiveRecitationScreen: React.FC<LiveRecitationScreenProps> = ({
  surah = POPULAR_SURAHS[0], // Al-Fatihah
  audioSettings,
  direction,
  onNavigate,
  onRecordMistake
}) => {
  const isRtl = direction === 'rtl';

  // Recitation State
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [activeMistake, setActiveMistake] = useState<TajweedMistake | null>(null);
  const [completedAyahs, setCompletedAyahs] = useState<number[]>([]);
  const [audioLevel, setAudioLevel] = useState(0.3); // for visualizer

  // Canvas visualizer ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentAyah = surah.ayahs[currentAyahIndex] || surah.ayahs[0];
  const words = currentAyah?.words || [];

  // Canvas concentric resonance ripples effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const baseRadius = 40;
      const waveCount = 4;
      const intensity = isListening ? audioLevel : 0.08;

      for (let i = 1; i <= waveCount; i++) {
        const radius = baseRadius + i * 22 + Math.sin(time * 0.04 + i) * (intensity * 25);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        // Gradient color: antique gold fading to deep teal
        const alpha = Math.max(0, 0.35 - (i * 0.07) + (intensity * 0.2));
        ctx.strokeStyle = `rgba(197, 168, 105, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      time += 1;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, audioLevel]);

  // Voice level pulse simulation during listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && !activeMistake) {
      interval = setInterval(() => {
        setAudioLevel(0.2 + Math.random() * 0.6);
      }, 150);
    } else {
      setAudioLevel(0.1);
    }
    return () => clearInterval(interval);
  }, [isListening, activeMistake]);

  // Toggle Live Microphone Listening
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      audioEngine.stopAll();
    } else {
      setIsListening(true);
      // Encourage voice coach
      if (currentWordIndex === 0 && currentAyahIndex === 0) {
        audioEngine.speakGuidance(
          "I am listening. Whenever you're ready, begin reciting from memory.",
          audioSettings
        );
      }
    }
  };

  // Move forward one word in recitation
  const handleWordRecited = () => {
    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Completed Ayah!
      audioEngine.playSuccessChime();
      if (!completedAyahs.includes(currentAyahIndex)) {
        setCompletedAyahs(prev => [...prev, currentAyahIndex]);
      }

      if (currentAyahIndex + 1 < surah.ayahs.length) {
        setCurrentAyahIndex(prev => prev + 1);
        setCurrentWordIndex(0);
      } else {
        // Completed entire Surah!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A869', '#154D4B', '#2E7D5A', '#FBF9F5']
        });
        audioEngine.speakGuidance(
          `Masha'Allah! You have completed the recitation of ${surah.nameEnglish}.`,
          audioSettings
        );
        setIsListening(false);
      }
    }
  };

  // Trigger gentle mistake (Harakah, Tajweed, etc.)
  const triggerMistake = (type: 'wrong_harakah' | 'tajweed_slip' | 'skipped_word') => {
    setIsListening(false);
    audioEngine.playGentlePauseChime();

    const currentWord = words[currentWordIndex] || words[0];

    const mistakeObj: TajweedMistake = {
      id: 'mistake_' + Date.now(),
      surahNumber: surah.number,
      surahName: surah.nameEnglish,
      ayahNumber: currentAyah.numberInSurah,
      wordIndex: currentWordIndex,
      wordArabic: currentWord.arabic,
      expectedRecitation: currentWord.transliteration,
      userRecitation: type === 'wrong_harakah' ? `${currentWord.transliteration} (with Fathah instead of Kasrah)` : `${currentWord.transliteration} (insufficient Madd length)`,
      mistakeType: type,
      tajweedRule: type === 'tajweed_slip' ? (currentWord.tajweedRuleName?.includes('Madd') ? 'Madd' : 'Qalqalah') : undefined,
      explanation:
        type === 'wrong_harakah'
          ? "Notice the Kasrah (ِ) beneath the letter. Gently articulate the 'i' vowel without flattening it into a Fathah."
          : type === 'tajweed_slip'
          ? "This rule requires elongation. Honor the full vowel counts for Madd Lazim."
          : "You skipped one word ahead. Pause, breathe, and recite the phrase once more.",
      timestamp: 'Just now',
      mastered: false,
      reviewedCount: 1
    };

    setActiveMistake(mistakeObj);
    onRecordMistake(mistakeObj);
  };

  const handleRetryPhrase = () => {
    setActiveMistake(null);
    setIsListening(true);
    // Rewind by 1 word to give natural phrase running start
    setCurrentWordIndex(prev => Math.max(0, prev - 1));
  };

  const handleContinueAfterCorrection = () => {
    setActiveMistake(null);
    handleWordRecited();
    setIsListening(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn pb-36">
      {/* Top Header: Surah Details & Focus Mode Toggle */}
      <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[#232E2F] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('library')}
            className="p-2 rounded-xl text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors cursor-pointer"
            title="Back to library"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-arabic text-xl sm:text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {surah.nameArabic}
              </span>
              <span className="text-sm font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {surah.nameEnglish}
              </span>
              <span className="text-xs text-[#8E9B98]">
                • Ayah {currentAyah.numberInSurah} of {surah.numberOfAyahs}
              </span>
            </div>
            <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
              {isRtl ? 'وضع التسميع عن ظهر قلب • استماع كلمة بكلمة' : 'Reciting from memory • Real-time acoustic tracking'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Coach Status */}
          <button
            onClick={() => onNavigate('audio-settings')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-medium text-[#5F6E6C] dark:text-[#A6B2AF] hover:border-[#C5A059] transition-colors cursor-pointer bg-[#FDFBF7] dark:bg-[#172526]"
            title="Configure Qari & Voice Coach"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Mishary Alafasy</span>
          </button>

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setIsFocusMode(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              isFocusMode
                ? 'bg-[#1A4D4E] text-white dark:bg-[#C5A059] dark:text-[#0E1A1A] border-transparent'
                : 'border-[#E8E2D6] dark:border-[#232E2F] text-[#6F7D7B] dark:text-[#9AA5A3] bg-[#FDFBF7] dark:bg-[#172526]'
            }`}
            title="Toggle Focus / Distraction-Free Mode"
          >
            {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RECITATION CANVAS / STAGE */}
      <div className="relative min-h-[380px] sm:min-h-[440px] rounded-3xl bg-[#FDFBF7] dark:bg-[#101E1F] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm p-6 sm:p-12 flex flex-col items-center justify-between text-center overflow-hidden transition-all">
        
        {/* Subtle Background Geometric Pattern */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-60 pointer-events-none" />

        {/* Central Concentric Resonance Ripple Canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <canvas ref={canvasRef} width={340} height={340} className="w-[340px] h-[340px]" />
        </div>

        {/* Ayah Marker / Surah Title */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-[#C5A059] font-bold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>{isRtl ? `الآية ${currentAyah.numberInSurah}` : `Verse ${currentAyah.numberInSurah}`}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
        </div>

        {/* CORE TEXT: WORD-BY-WORD UTHMANI SCRIPT */}
        <div className="relative z-10 my-auto py-6 max-w-2xl">
          <div
            className="font-arabic text-3xl sm:text-4xl md:text-5xl font-bold leading-[2.2] sm:leading-[2.4] flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 select-none"
            dir="rtl"
          >
            {words.map((word, idx) => {
              const isPast = idx < currentWordIndex;
              const isCurrent = idx === currentWordIndex;
              const isUpcoming = idx > currentWordIndex;

              return (
                <span
                  key={word.id}
                  className={`relative transition-all duration-300 px-2 py-0.5 rounded-xl cursor-default ${
                    isPast
                      ? 'text-[#1A4D4E] dark:text-[#72D6A5] opacity-90'
                      : isCurrent
                      ? 'bg-[#F5E6CC] dark:bg-[#2F2718] text-[#8B6E30] dark:text-[#E5C37A] border-b-2 border-[#C5A059] scale-105 shadow-sm'
                      : isFocusMode
                      ? 'opacity-20 blur-[2px] text-[#8E9B98]'
                      : 'opacity-40 text-[#6F7D7B] dark:text-[#8E9B98]'
                  }`}
                >
                  {word.arabic}
                  {/* Active word tracking dot indicator */}
                  {isCurrent && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
                  )}
                </span>
              );
            })}
          </div>

          {/* Transliteration & Meaning Peek (Helpful when user is hesitant) */}
          {(showPeek || !isFocusMode) && (
            <div className="mt-8 pt-4 border-t border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#6F7D7B] dark:text-[#9AA5A3] space-y-1 max-w-lg mx-auto">
              <p className="italic">{currentAyah.translation}</p>
              {words[currentWordIndex] && (
                <p className="text-[11px] text-[#C5A059] font-medium">
                  Current word:{' '}
                  <span className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {words[currentWordIndex].transliteration} ({words[currentWordIndex].meaning})
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Listening Status Bar */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isListening ? 'bg-[#1A4D4E] dark:bg-[#72D6A5] animate-pulse' : 'bg-[#8E9B98]'
            }`}
          />
          <span className="font-medium text-[#5F6E6C] dark:text-[#A6B2AF]">
            {isListening
              ? (isRtl ? 'المستمع الصوتي نشط • تكلّم بهدوء وتأنٍ' : 'Listening attentively • Recite naturally')
              : (isRtl ? 'التسميع متوقف مؤقتاً • اضغط على الميكروفون للبدء' : 'Recitation paused • Tap mic to begin')}
          </span>
        </div>
      </div>

      {/* SIMULATOR & TESTING TOOLBAR (Allows reviewing natural flow & trigger mistakes) */}
      <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-[#1A4D4E] dark:text-[#C5A059]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Interactive Recitation Simulation Controls:</span>
          </div>
          <span className="text-[11px] text-[#8E9B98]">Test word tracking & gentle correction</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleWordRecited}
            className="px-3 py-1.5 rounded-lg bg-[#1A4D4E] text-white hover:bg-[#153e3f] dark:bg-[#27827E] font-medium transition-colors cursor-pointer"
          >
            ✓ Recite Next Word
          </button>

          <button
            onClick={() => triggerMistake('wrong_harakah')}
            className="px-3 py-1.5 rounded-lg bg-[#D96E54]/15 border border-[#D96E54]/40 text-[#D96E54] hover:bg-[#D96E54]/25 font-medium transition-colors cursor-pointer"
          >
            Simulate Harakah Slip
          </button>

          <button
            onClick={() => triggerMistake('tajweed_slip')}
            className="px-3 py-1.5 rounded-lg bg-[#F5E6CC] dark:bg-[#2F2718] border border-[#C5A059]/40 text-[#8B6E30] dark:text-[#E5C37A] hover:bg-[#ecdabb] font-medium transition-colors cursor-pointer"
          >
            Simulate Tajweed Slip
          </button>

          <button
            onClick={() => triggerMistake('skipped_word')}
            className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-[#5F6E6C] hover:bg-[#EAE5DC] font-medium transition-colors cursor-pointer"
          >
            Simulate Skipped Word
          </button>
        </div>
      </div>

      {/* ONE-HANDED REACH CONTROLS: FIXED BOTTOM THUMB DOCK */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-[#FDFBF7]/90 dark:bg-[#122021]/90 backdrop-blur-md p-3 rounded-full border border-[#E8E2D6] dark:border-[#232E2F] shadow-lg flex items-center justify-between gap-4">
          
          {/* Left Thumb: Peek / Hint Button */}
          <button
            onClick={() => setShowPeek(prev => !prev)}
            className="w-12 h-12 rounded-full bg-[#FDFBF7] dark:bg-[#172526] border-2 border-[#E8E2D6] dark:border-[#232E2F] text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#C5A059] hover:border-[#C5A059] transition-all flex items-center justify-center shadow-sm cursor-pointer"
            title={showPeek ? 'Hide Translation & Hints' : 'Peek at Meaning & Transliteration'}
          >
            {showPeek ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Center Thumb: Large Primary Microphone Button */}
          <button
            onClick={toggleListening}
            className={`flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isListening
                ? 'bg-[#D96E54] text-white hover:opacity-95 shadow-[#D96E54]/25 ring-4 ring-[#D96E54]/20'
                : 'bg-[#1A4D4E] hover:bg-[#153e3f] text-white shadow-[#1A4D4E]/25'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>{isRtl ? 'إيقاف الاستماع' : 'Pause Listening'}</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-[#C5A059]" />
                <span>{isRtl ? 'بدء التسميع الصوتي' : 'Tap to Recite'}</span>
              </>
            )}
          </button>

          {/* Right Thumb: Reset / Re-recite Current Ayah */}
          <button
            onClick={() => {
              setCurrentWordIndex(0);
              setIsListening(true);
            }}
            className="w-12 h-12 rounded-full bg-[#FDFBF7] dark:bg-[#172526] border-2 border-[#E8E2D6] dark:border-[#232E2F] text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#C5A059] hover:border-[#C5A059] transition-all flex items-center justify-center shadow-sm cursor-pointer"
            title="Restart current Ayah"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CORRECTION OVERLAY MODAL (When a mistake is detected) */}
      {activeMistake && (
        <CorrectionOverlay
          mistake={activeMistake}
          audioSettings={audioSettings}
          direction={direction}
          onRetry={handleRetryPhrase}
          onContinue={handleContinueAfterCorrection}
          referenceAudioUrl={currentAyah.audioUrl}
        />
      )}
    </div>
  );
};
