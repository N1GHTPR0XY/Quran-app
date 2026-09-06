import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SurahData, AudioSettings, TajweedMistake, Direction, ScreenId, HarakahDetail } from '../../types';
import { POPULAR_SURAHS } from '../../data/quranData';
import { audioEngine } from '../../services/audioEngine';
import { recitationTracker, TrackingMode } from '../../services/recitationSpeechTracker';
import { extractKasrahLetters, createKasrahToDammahSimulation } from '../../services/harakahAnalyzer';
import { CorrectionOverlay } from './CorrectionOverlay';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Activity,
  Radio,
  Clock,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  BookOpen,
  Search
} from 'lucide-react';
import { quranService } from '../../services/quranService';
import { audioRecordingService } from '../../services/audioRecordingService';
import { achievementService } from '../../services/achievementService';

interface LiveRecitationScreenProps {
  surah?: SurahData;
  audioSettings: AudioSettings;
  direction: Direction;
  onNavigate: (screen: ScreenId) => void;
  onRecordMistake: (mistake: TajweedMistake) => void;
  onSelectSurah?: (surah: SurahData) => void;
}

export const LiveRecitationScreen: React.FC<LiveRecitationScreenProps> = ({
  surah = POPULAR_SURAHS[0], // Al-Fatihah
  audioSettings,
  direction,
  onNavigate,
  onRecordMistake,
  onSelectSurah
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
  const [audioLevel, setAudioLevel] = useState(0.1); // real RMS from mic
  const [liveDecibels, setLiveDecibels] = useState(-60);
  const [detectedTranscript, setDetectedTranscript] = useState<string>('');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('speech-recognition');
  const [trackerStatus, setTrackerStatus] = useState<string>('idle');
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [assistedPaceIntervalMs, setAssistedPaceIntervalMs] = useState(2000);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Quick Surah Switcher Modal
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [surahPickerSearch, setSurahPickerSearch] = useState('');
  const [isSwitchingSurah, setIsSwitchingSurah] = useState(false);

  // All 114 Surahs cache
  const allSurahsList = useMemo(() => quranService.getAllSurahsList(), []);

  const filteredPickerSurahs = useMemo(() => {
    const q = surahPickerSearch.trim().toLowerCase();
    if (!q) return allSurahsList;
    return allSurahsList.filter(s =>
      s.nameEnglish.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      s.nameTranslation.toLowerCase().includes(q) ||
      s.number.toString() === q
    );
  }, [allSurahsList, surahPickerSearch]);

  const handleSelectFromPicker = async (item: SurahData) => {
    setIsSwitchingSurah(true);
    try {
      if (onSelectSurah) {
        const full = await quranService.getSurah(item.number);
        onSelectSurah(full);
      }
      setShowSurahPicker(false);
    } catch (err) {
      console.error('Failed to load surah:', err);
      if (onSelectSurah) onSelectSurah(item);
      setShowSurahPicker(false);
    } finally {
      setIsSwitchingSurah(false);
    }
  };

  // Reset indices whenever surah changes
  useEffect(() => {
    setCurrentAyahIndex(0);
    setCurrentWordIndex(0);
    setCompletedAyahs([]);
    setIsListening(false);
    recitationTracker.stop();
  }, [surah.number]);

  // Stale closure guards for voice callbacks
  const currentWordIndexRef = useRef(currentWordIndex);
  const currentAyahIndexRef = useRef(currentAyahIndex);
  const wordsRef = useRef(surah.ayahs[0]?.words || []);

  const currentAyah = surah.ayahs[currentAyahIndex] || surah.ayahs[0];
  const words = currentAyah?.words || [];

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    currentAyahIndexRef.current = currentAyahIndex;
    wordsRef.current = currentAyah?.words || [];
  }, [currentAyahIndex, currentAyah]);

  // Canvas visualizer ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Move forward one word in recitation
  const handleWordRecited = useCallback(() => {
    const activeWords = wordsRef.current;
    const currWordIdx = currentWordIndexRef.current;
    const currAyahIdx = currentAyahIndexRef.current;

    if (currWordIdx + 1 < activeWords.length) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Completed Ayah!
      audioEngine.playSuccessChime();
      setCompletedAyahs(prev => (prev.includes(currAyahIdx) ? prev : [...prev, currAyahIdx]));

      if (currAyahIdx + 1 < surah.ayahs.length) {
        setCurrentAyahIndex(prev => prev + 1);
        setCurrentWordIndex(0);
      } else {
        // Completed entire Surah!
        achievementService.unlockBadge('surah_mastered');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A869', '#154D4B', '#2E7D5A', '#FBF9F5']
        });
        audioEngine.speakGuidance(
          `Masha'Allah! You have completed the recitation of ${surah.nameEnglish}. You have earned the Surah Mastered badge!`,
          audioSettings
        );
        setIsListening(false);
        recitationTracker.stop();
      }
    }
  }, [surah, audioSettings]);

  // Sync Ayah Word Targets with Speech Tracker
  useEffect(() => {
    const wordCandidates = words.map((w, idx) => ({
      index: idx,
      arabic: w.arabic,
      transliteration: w.transliteration
    }));
    recitationTracker.setWords(wordCandidates, currentWordIndex);
  }, [currentAyahIndex, currentWordIndex, words]);

  // Change tracking mode in tracker
  useEffect(() => {
    recitationTracker.setTrackingMode(trackingMode);
  }, [trackingMode]);

  // Active word's Kasrah letters (for live Tajweed Harakat guidance)
  const currentWord = words[currentWordIndex] || words[0];
  const currentKasrahLetters = useMemo(() => {
    return currentWord ? extractKasrahLetters(currentWord.arabic, currentWord.transliteration) : [];
  }, [currentWord]);

  // Handle Harakah Mistake (Kasrah -> Dammah Lahn Jaliyy)
  const handleHarakahMistake = useCallback((harakahDetail: HarakahDetail) => {
    // 1. Immediately STOP recitation & listening
    setIsListening(false);
    setIsRecordingAudio(false);
    recitationTracker.stop();

    // 2. Play gentle pause chime
    audioEngine.playGentlePauseChime();

    // 3. Capture user's actual voice recording snapshot for side-by-side review
    const voiceClip = audioRecordingService.captureSnapshot({
      surahNumber: surah.number,
      ayahNumber: currentAyah.numberInSurah,
      wordArabic: harakahDetail.expectedWord
    }) || audioRecordingService.generateSynthesizedAudioClip(harakahDetail.expectedWord);

    // Get master scholar reference recitation URL
    const refAudioUrl = quranService.getAyahAudioUrl(
      surah.number,
      currentAyah.numberInSurah,
      audioSettings.reciterId
    );

    // 4. Create rich diagnostic mistake record
    const mistakeObj: TajweedMistake = {
      id: 'mistake_harakah_' + Date.now(),
      surahNumber: surah.number,
      surahName: surah.nameEnglish,
      ayahNumber: currentAyah.numberInSurah,
      wordIndex: currentWordIndexRef.current,
      wordArabic: harakahDetail.expectedWord,
      expectedRecitation: `${harakahDetail.phoneticExpected} (حرف ${harakahDetail.harfNameArabic} بالكسرة: ${harakahDetail.expectedArabicLetter})`,
      userRecitation: `${harakahDetail.phoneticActual} (بالضمة: ${harakahDetail.actualArabicLetter})`,
      mistakeType: 'wrong_harakah',
      explanation: isRtl
        ? `لحن جلي (تبديل حركة): قَرَأْتَ حرف ${harakahDetail.harfNameArabic} بالضمة (${harakahDetail.actualArabicLetter}) بدلاً من الكسرة (${harakahDetail.expectedArabicLetter}). الصحيح: «${harakahDetail.expectedWord}» بخفض الفك السفلي لتحقيق الكسرة.`
        : `Lahn Jaliyy (Major Harakah Error): You pronounced the letter ${harakahDetail.harfNameEnglish} with Dammah (${harakahDetail.actualArabicLetter} / 'u') instead of Kasrah (${harakahDetail.expectedArabicLetter} / 'i'). Expected: "${harakahDetail.expectedWord}". Articulate with a clean, light Kasrah.`,
      timestamp: 'Just now',
      mastered: false,
      reviewedCount: 1,
      harakahDetail,
      userAudioBlobUrl: voiceClip?.url,
      referenceAudioUrl: refAudioUrl,
      reciterId: audioSettings.reciterId,
      reciterName: audioSettings.reciterName,
      recordingDurationSeconds: voiceClip?.duration || 3.0
    };

    if (voiceClip) {
      audioRecordingService.associateClipWithMistake(mistakeObj.id, voiceClip);
    }

    setActiveMistake(mistakeObj);
    onRecordMistake(mistakeObj);

    // 5. Voice coach verbal guidance
    audioEngine.speakGuidance(
      isRtl
        ? `توقف للتصحيح: نطق الحرف بالضمة بدل الكسرة. المطلوب: ${harakahDetail.expectedWord} بالكسرة.`
        : `Stop and correct: You pronounced the letter ${harakahDetail.harfNameEnglish} with Dammah instead of Kasrah. Correct: ${harakahDetail.phoneticExpected} with a Kasrah.`,
      audioSettings
    );
  }, [surah, currentAyah, isRtl, audioSettings, onRecordMistake]);

  // Start / Stop Speech & Acoustic Tracker and User Voice Recorder based on listening state
  useEffect(() => {
    if (isListening) {
      setMicPermissionError(null);
      setRecordingDuration(0);
      recitationTracker.start({
        onWordMatched: (_wordIdx, recognizedText) => {
          setDetectedTranscript(recognizedText);
          handleWordRecited();
        },
        onHarakahMistakeDetected: (harakahDetail) => {
          handleHarakahMistake(harakahDetail);
        },
        onAudioLevel: (normalizedLevel, decibels) => {
          setAudioLevel(normalizedLevel);
          setLiveDecibels(decibels);
        },
        onTranscriptUpdate: (transcript) => {
          setDetectedTranscript(transcript);
        },
        onStatusChange: (status) => {
          setTrackerStatus(status);
          // Hook up recorder with media stream when tracker starts listening
          const stream = recitationTracker.getMediaStream();
          if (stream && !audioRecordingService.isCurrentlyRecording()) {
            audioRecordingService.startRecording(stream);
            setIsRecordingAudio(true);
          }
        },
        onError: (type, detail) => {
          if (type === 'permission-denied') {
            setMicPermissionError('Microphone access is required so the app can hear your recitation.');
            setIsListening(false);
            setIsRecordingAudio(false);
            audioRecordingService.stopRecording();
          } else {
            // fallback gracefully to acoustic cadence mode
            setTrackingMode('acoustic-voice');
          }
        }
      });

      // Also attempt stream connection immediately if already available
      const stream = recitationTracker.getMediaStream();
      if (stream && !audioRecordingService.isCurrentlyRecording()) {
        audioRecordingService.startRecording(stream);
        setIsRecordingAudio(true);
      }
    } else {
      recitationTracker.stop();
      audioRecordingService.stopRecording();
      setIsRecordingAudio(false);
      setAudioLevel(0.05);
      setLiveDecibels(-60);
    }

    return () => {
      recitationTracker.stop();
      audioRecordingService.stopRecording();
      setIsRecordingAudio(false);
    };
  }, [isListening, handleWordRecited, handleHarakahMistake]);

  // Track recording duration while audio recorder is active
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingAudio]);

  // Assisted Pace Timer (when in assisted-pace mode and listening)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isListening && trackingMode === 'assisted-pace' && !activeMistake) {
      timer = setInterval(() => {
        handleWordRecited();
      }, assistedPaceIntervalMs);
    }
    return () => clearInterval(timer);
  }, [isListening, trackingMode, assistedPaceIntervalMs, activeMistake, handleWordRecited]);

  // Keyboard shortcut listener (Space = Advance word, M = Toggle mic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleWordRecited();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsListening(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleWordRecited]);

  // Canvas concentric resonance ripples effect powered by real mic audio level
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
      const intensity = isListening ? Math.max(0.12, audioLevel * 1.2) : 0.08;

      for (let i = 1; i <= waveCount; i++) {
        const radius = baseRadius + i * 22 + Math.sin(time * 0.05 + i) * (intensity * 30);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        // Gradient color: antique gold fading to deep teal
        const alpha = Math.max(0, 0.4 - (i * 0.08) + (intensity * 0.35));
        ctx.strokeStyle = `rgba(197, 168, 105, ${alpha})`;
        ctx.lineWidth = intensity > 0.25 ? 2.2 : 1.5;
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

  // Toggle Live Microphone Listening
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      audioEngine.stopAll();
    } else {
      setMicPermissionError(null);
      setIsListening(true);
      // Encourage voice coach on first start
      if (currentWordIndex === 0 && currentAyahIndex === 0) {
        audioEngine.speakGuidance(
          "I am listening. Whenever you're ready, begin reciting from memory.",
          audioSettings
        );
      }
    }
  };

  // Simulate Kasrah -> Dammah mistake specifically
  const handleSimulateKasrahMistake = () => {
    const activeWord = words[currentWordIndex] || words[0];
    const simulation = createKasrahToDammahSimulation(activeWord.arabic, activeWord.transliteration);
    handleHarakahMistake(simulation);
  };

  // Trigger gentle mistake (Harakah, Tajweed, etc.)
  const triggerMistake = (type: 'wrong_harakah' | 'tajweed_slip' | 'skipped_word') => {
    if (type === 'wrong_harakah') {
      handleSimulateKasrahMistake();
      return;
    }

    setIsListening(false);
    setIsRecordingAudio(false);
    audioEngine.playGentlePauseChime();

    const activeWord = words[currentWordIndex] || words[0];

    const voiceClip = audioRecordingService.captureSnapshot({
      surahNumber: surah.number,
      ayahNumber: currentAyah.numberInSurah,
      wordArabic: activeWord.arabic
    }) || audioRecordingService.generateSynthesizedAudioClip(activeWord.arabic);

    const refAudioUrl = quranService.getAyahAudioUrl(
      surah.number,
      currentAyah.numberInSurah,
      audioSettings.reciterId
    );

    const mistakeObj: TajweedMistake = {
      id: 'mistake_' + Date.now(),
      surahNumber: surah.number,
      surahName: surah.nameEnglish,
      ayahNumber: currentAyah.numberInSurah,
      wordIndex: currentWordIndex,
      wordArabic: activeWord.arabic,
      expectedRecitation: activeWord.transliteration,
      userRecitation: `${activeWord.transliteration} (insufficient Madd length)`,
      mistakeType: type,
      tajweedRule:
        type === 'tajweed_slip'
          ? activeWord.tajweedRuleName?.includes('Madd')
            ? 'Madd'
            : 'Qalqalah'
          : undefined,
      explanation:
        type === 'tajweed_slip'
          ? 'This rule requires elongation. Honor the full vowel counts for Madd Lazim.'
          : 'You skipped one word ahead. Pause, breathe, and recite the phrase once more.',
      timestamp: 'Just now',
      mastered: false,
      reviewedCount: 1,
      userAudioBlobUrl: voiceClip?.url,
      referenceAudioUrl: refAudioUrl,
      reciterId: audioSettings.reciterId,
      reciterName: audioSettings.reciterName,
      recordingDurationSeconds: voiceClip?.duration || 3.5
    };

    if (voiceClip) {
      audioRecordingService.associateClipWithMistake(mistakeObj.id, voiceClip);
    }

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
              <button
                onClick={() => setShowSurahPicker(true)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group text-start"
                title="Switch Surah (1 - 114)"
              >
                <span className="font-arabic text-xl sm:text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {surah.nameArabic}
                </span>
                <span className="text-sm font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {surah.nameEnglish}
                </span>
                <ChevronDown className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
              </button>
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
          {/* Change Surah Quick Action */}
          <button
            onClick={() => setShowSurahPicker(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C5A059]/40 text-xs font-semibold text-[#1A4D4E] dark:text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors cursor-pointer bg-[#FDFBF7] dark:bg-[#172526]"
            title="Browse all 114 Surahs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? 'اختر سورة' : '114 Surahs'}</span>
          </button>

          {/* Audio Coach Status */}
          <button
            onClick={() => onNavigate('audio-settings')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-medium text-[#5F6E6C] dark:text-[#A6B2AF] hover:border-[#C5A059] transition-colors cursor-pointer bg-[#FDFBF7] dark:bg-[#172526]"
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

        {/* Top Stage Bar: Ayah Marker & Tracking Engine Mode Selector */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#C5A059] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>{isRtl ? `الآية ${currentAyah.numberInSurah}` : `Verse ${currentAyah.numberInSurah}`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          </div>

          {/* Tracking Engine Selector */}
          <div className="flex items-center bg-[#F5F2ED] dark:bg-[#172526] p-1 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] text-[11px] font-medium text-[#5F6E6C] dark:text-[#A6B2AF]">
            <button
              onClick={() => setTrackingMode('speech-recognition')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                trackingMode === 'speech-recognition'
                  ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm font-semibold'
                  : 'hover:text-[#1A4D4E] dark:hover:text-[#C5A059]'
              }`}
              title="Recognizes exact Arabic Quranic words via microphone"
            >
              <Radio className="w-3 h-3 text-[#C5A059]" />
              <span>{isRtl ? 'التعرف الصوتي' : 'Arabic Speech'}</span>
            </button>

            <button
              onClick={() => setTrackingMode('acoustic-voice')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                trackingMode === 'acoustic-voice'
                  ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm font-semibold'
                  : 'hover:text-[#1A4D4E] dark:hover:text-[#C5A059]'
              }`}
              title="Advances fluidly with your voice cadence and syllables"
            >
              <Activity className="w-3 h-3 text-[#2E7D5A]" />
              <span>{isRtl ? 'الإيقاع الصوتي' : 'Voice Cadence'}</span>
            </button>

            <button
              onClick={() => setTrackingMode('assisted-pace')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                trackingMode === 'assisted-pace'
                  ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm font-semibold'
                  : 'hover:text-[#1A4D4E] dark:hover:text-[#C5A059]'
              }`}
              title="Guides with steady pace"
            >
              <Clock className="w-3 h-3 text-[#D96E54]" />
              <span>{isRtl ? 'تلقائي' : 'Auto Pace'}</span>
            </button>
          </div>
        </div>

        {/* Microphone Permission Warning (if blocked) */}
        {micPermissionError && (
          <div className="relative z-10 my-2 px-4 py-2.5 rounded-2xl bg-[#D96E54]/10 border border-[#D96E54]/30 text-[#D96E54] flex items-center justify-between gap-3 text-xs max-w-lg mx-auto animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{micPermissionError}</span>
            </div>
            <button
              onClick={toggleListening}
              className="px-2.5 py-1 rounded-lg bg-[#D96E54] text-white font-medium hover:bg-[#c25e45] transition-colors cursor-pointer text-[11px]"
            >
              Allow Mic
            </button>
          </div>
        )}

        {/* Live User Voice Recording Status Badge */}
        {isListening && (
          <div className="relative z-10 my-2 px-3.5 py-1.5 rounded-full bg-[#D96E54]/10 dark:bg-[#D96E54]/20 border border-[#D96E54]/30 text-[#D96E54] flex items-center justify-center gap-2 text-xs w-fit mx-auto shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96E54] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D96E54]"></span>
            </span>
            <span className="font-bold tracking-wide">
              {isRtl ? 'تسجيل التلاوة نشط' : 'REC VOICE ACTIVE'}
            </span>
            <span className="font-mono font-bold text-[11px] bg-[#D96E54]/20 px-1.5 py-0.5 rounded">
              {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:{String(recordingDuration % 60).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-[#6F7D7B] dark:text-[#A6B2AF] hidden sm:inline">
              {isRtl ? '• يُسجّل صوتك للمقارنة في شاشة المراجعة' : '• Capturing your voice for review & comparison'}
            </span>
          </div>
        )}

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
                  onClick={() => setCurrentWordIndex(idx)}
                  className={`relative transition-all duration-300 px-2 py-0.5 rounded-xl cursor-pointer ${
                    isPast
                      ? 'text-[#1A4D4E] dark:text-[#72D6A5] opacity-90'
                      : isCurrent
                      ? 'bg-[#F5E6CC] dark:bg-[#2F2718] text-[#8B6E30] dark:text-[#E5C37A] border-b-2 border-[#C5A059] scale-105 shadow-sm ring-2 ring-[#C5A059]/20'
                      : isFocusMode
                      ? 'opacity-20 blur-[2px] text-[#8E9B98]'
                      : 'opacity-40 text-[#6F7D7B] dark:text-[#8E9B98] hover:opacity-75'
                  }`}
                  title={`Click to jump to: ${word.transliteration}`}
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
            <div className="mt-8 pt-4 border-t border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#6F7D7B] dark:text-[#9AA5A3] space-y-2 max-w-lg mx-auto">
              <p className="italic">{currentAyah.translation}</p>
              {words[currentWordIndex] && (
                <p className="text-[11px] text-[#C5A059] font-medium">
                  Current word:{' '}
                  <span className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {words[currentWordIndex].transliteration} ({words[currentWordIndex].meaning})
                  </span>
                </p>
              )}

              {/* Active word Kasrah harf badge & quick test trigger */}
              {currentKasrahLetters.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#C5A059]/10 dark:bg-[#C5A059]/15 border border-[#C5A059]/30 text-xs shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-[#8B6E30] dark:text-[#E5C37A] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                    <span>{isRtl ? 'الحرف المكسور (ـِ): ' : 'Letter with Kasrah (ـِ): '}</span>
                    <span className="font-arabic text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {currentKasrahLetters.map(k => `${k.letterNameArabic} (${k.harfWithKasrah})`).join('، ')}
                    </span>
                  </div>
                  <button
                    onClick={handleSimulateKasrahMistake}
                    className="px-2.5 py-1 rounded-lg bg-[#D96E54] hover:bg-[#c25e45] text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Simulate saying Dammah (ـُ) instead of Kasrah (ـِ) to test automated stop & correction"
                  >
                    <span>{isRtl ? 'اختبار نطق الضمة (ـُ) والتوقف' : 'Test Kasrah ➔ Dammah Stop & Correct'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Audio / Microphone VU Meter & Speech Transcript Pill */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-xs w-full max-w-md">
          {/* Real-time decibel / frequency activity bars */}
          {isListening && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[11px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5A] animate-pulse" />
                <span className="text-[#2E7D5A] font-semibold">Live Mic</span>
              </div>

              {/* Dynamic VU meter bars reacting to real voice RMS */}
              <div className="flex items-center gap-0.5 h-3.5 px-1">
                {[0.1, 0.25, 0.45, 0.65, 0.85].map((threshold, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      audioLevel >= threshold
                        ? 'bg-[#2E7D5A] h-3.5'
                        : audioLevel >= threshold * 0.6
                        ? 'bg-[#C5A059] h-2'
                        : 'bg-[#C7D0CE] dark:bg-[#2F3E40] h-1'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[#8E9B98] font-mono">
                {liveDecibels > -55 ? `${liveDecibels} dB` : 'Quiet'}
              </span>
            </div>
          )}

          {/* Heard text feedback banner */}
          {isListening && detectedTranscript && (
            <div className="px-3 py-1 rounded-xl bg-white/80 dark:bg-[#122021]/80 backdrop-blur-sm border border-[#E8E2D6] dark:border-[#232E2F] text-[11px] text-[#1A4D4E] dark:text-[#C5A059] flex items-center gap-1.5 animate-fadeIn">
              <span className="text-[#8E9B98]">Heard:</span>
              <span className="font-arabic font-bold text-sm" dir="rtl">
                {detectedTranscript}
              </span>
            </div>
          )}

          {/* Listening Status Bar */}
          <div className="flex items-center justify-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening ? 'bg-[#1A4D4E] dark:bg-[#72D6A5] animate-pulse' : 'bg-[#8E9B98]'
              }`}
            />
            <span className="font-medium text-[#5F6E6C] dark:text-[#A6B2AF]">
              {isListening
                ? trackerStatus === 'speaking-detected'
                  ? (isRtl ? 'صوت التلاوة مسموع • متابعة مستمرة...' : 'Voice detected • Tracking word by word...')
                  : (isRtl ? 'المستمع الصوتي نشط • تكلّم بهدوء وتأنٍ' : 'Listening attentively • Recite aloud into mic')
                : (isRtl ? 'التسميع متوقف مؤقتاً • اضغط على الميكروفون للبدء' : 'Recitation paused • Tap mic to begin')}
            </span>
          </div>

          <p className="text-[10px] text-[#8E9B98]">
            Tip: Recite aloud from memory, or press <kbd className="px-1 py-0.5 rounded bg-[#E8E2D6] dark:bg-[#232E2F] text-[9px] font-mono">Space</kbd> to step word by word.
          </p>
        </div>
      </div>

      {/* SIMULATOR & TESTING TOOLBAR (Allows reviewing natural flow & trigger mistakes) */}
      {/* TESTING / SIMULATION TOOLBAR (For manual testing & accessibility) */}
      <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-[#1A4D4E] dark:text-[#C5A059]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? 'أدوات اختبار التجويد واللحن الجلي:' : 'Recitation & Tajweed Correction Test Suite:'}</span>
          </div>
          <span className="text-[11px] text-[#8E9B98]">
            {isRtl ? 'تحقق من توقف التسميع عند خطأ الحركات' : 'Verifies automated stop on Harakah mistakes'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleWordRecited}
            className="px-3 py-1.5 rounded-lg bg-[#1A4D4E] text-white hover:bg-[#153e3f] dark:bg-[#27827E] font-medium transition-colors cursor-pointer"
          >
            ✓ Recite Next Word
          </button>

          <button
            onClick={handleSimulateKasrahMistake}
            className="px-3 py-1.5 rounded-lg bg-[#D96E54] text-white hover:bg-[#c25e45] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Triggers Harakah mismatch: Kasrah pronounced as Dammah"
          >
            <span>{isRtl ? '⚠️ نطق الضمة بدل الكسرة (ـِ ➔ ـُ)' : '⚠️ Kasrah (ـِ) ➔ Dammah (ـُ) Stop'}</span>
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

      {/* 114 SURAHS QUICK PICKER MODAL */}
      {showSurahPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D6] dark:border-[#232E2F]">
              <div>
                <h3 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'اختر سورة للتسميع (1 - 114)' : 'Choose Surah for Recitation (1 - 114)'}
                </h3>
                <p className="text-xs text-[#8E9B98]">
                  {isRtl ? 'جميع سور القرآن الكريم مع تتبع الأحكام والحركات' : 'All 114 Surahs with real-time acoustic tracking & tajweed'}
                </p>
              </div>
              <button
                onClick={() => setShowSurahPicker(false)}
                className="p-2 rounded-xl text-[#8E9B98] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={surahPickerSearch}
                onChange={e => setSurahPickerSearch(e.target.value)}
                placeholder={isRtl ? 'ابحث باسم السورة أو رقمها (مثال: 67، الملك، Mulk)...' : 'Search by number or name (e.g. 67, Mulk, الملك)...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs focus:outline-none focus:border-[#C5A059]"
                autoFocus
              />
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
            </div>

            {/* Surah List */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1 max-h-[50vh]">
              {filteredPickerSurahs.map(item => {
                const isSelected = item.number === surah.number;
                return (
                  <div
                    key={item.number}
                    onClick={() => handleSelectFromPicker(item)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF2ED] dark:bg-[#142A20] border-[#1A4D4E] dark:border-[#72D6A5]'
                        : 'bg-[#FDFBF7] dark:bg-[#152324] border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F2ED] dark:bg-[#1B2B2C] flex items-center justify-center text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] flex-shrink-0">
                        {item.number}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9] truncate">
                            {item.nameEnglish}
                          </span>
                          <span className="text-[10px] text-[#8E9B98]">
                            • Juz {item.juzNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8E9B98] truncate">
                          {item.nameTranslation} • {item.numberOfAyahs} Ayahs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-arabic text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]" dir="rtl">
                        {item.nameArabic}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-[#1A4D4E] dark:text-[#72D6A5] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom status */}
            {isSwitchingSurah && (
              <div className="text-center py-2 text-xs text-[#C5A059] flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                <span>Loading Ayahs...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
