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
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Bookmark,
  FileText,
  Search,
  Play,
  Layers,
  Check,
  CheckCircle2,
  Sliders,
  X,
  Info,
  Lightbulb
} from 'lucide-react';
import { quranService } from '../../services/quranService';
import { audioRecordingService } from '../../services/audioRecordingService';
import { achievementService } from '../../services/achievementService';
import { tajweedAnalyzer, TajweedRuleOccurrence } from '../../services/tajweedAnalyzer';
import { QuranNavigationModal } from '../quran/QuranNavigationModal';
import { LiveTajweedCoach } from '../quran/LiveTajweedCoach';
import { TajweedRuleInspectorModal } from '../quran/TajweedRuleInspectorModal';
import { RecitationHangCard } from '../quran/RecitationHangCard';
import { RecitationHangState } from '../../types';

interface LiveRecitationScreenProps {
  surah?: SurahData;
  audioSettings: AudioSettings;
  onUpdateAudioSettings?: (settings: AudioSettings) => void;
  direction: Direction;
  onToggleDirection?: () => void;
  onNavigate: (screen: ScreenId) => void;
  onRecordMistake: (mistake: TajweedMistake) => void;
  onSelectSurah?: (surah: SurahData) => void;
}

export const LiveRecitationScreen: React.FC<LiveRecitationScreenProps> = ({
  surah = POPULAR_SURAHS[0], // Al-Fatihah
  audioSettings,
  onUpdateAudioSettings,
  direction,
  onToggleDirection,
  onNavigate,
  onRecordMistake,
  onSelectSurah
}) => {
  const isRtl = direction === 'rtl';

  // Speaker Language (Allows user to select between Arabic speaker "ابدأ التلاوة" and English speaker "Begin recitation")
  const [speakerLanguage, setSpeakerLanguage] = useState<'ar' | 'en'>(() => {
    return audioSettings.speakerLanguage || (direction === 'rtl' ? 'ar' : 'en');
  });

  const [speakerToast, setSpeakerToast] = useState<{ active: boolean; text: string; lang: 'ar' | 'en' }>({
    active: false,
    text: '',
    lang: 'ar'
  });

  // Keep speakerLanguage synchronized if audioSettings or direction change
  useEffect(() => {
    if (audioSettings.speakerLanguage) {
      setSpeakerLanguage(audioSettings.speakerLanguage);
    }
  }, [audioSettings.speakerLanguage]);

  // Recitation State
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [activeMistake, setActiveMistake] = useState<TajweedMistake | null>(null);
  const [hangState, setHangState] = useState<RecitationHangState | null>(null);
  const [showDetailedMistakeModal, setShowDetailedMistakeModal] = useState(false);
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

  // Quick Surah / Ayah / Page Navigator Modal
  const [showNavPicker, setShowNavPicker] = useState(false);
  const [selectedTajweedInspection, setSelectedTajweedInspection] = useState<TajweedRuleOccurrence | null>(null);

  // All 114 Surahs cache
  const allSurahsList = useMemo(() => quranService.getAllSurahsList(), []);

  const handleSelectSurahNumber = async (num: number) => {
    try {
      if (onSelectSurah) {
        const full = await quranService.getSurah(num);
        onSelectSurah(full);
      }
      setCurrentAyahIndex(0);
      setCurrentWordIndex(0);
    } catch (err) {
      console.error('Failed to load surah:', err);
    }
  };

  const handleSelectAyahIndex = (index: number) => {
    setCurrentAyahIndex(index);
    setCurrentWordIndex(0);
  };

  const handleSelectPageNumber = async (page: number) => {
    try {
      if (onSelectSurah) {
        const pageData = await quranService.getPage(page);
        onSelectSurah(pageData);
      }
      setCurrentAyahIndex(0);
      setCurrentWordIndex(0);
    } catch (err) {
      console.error('Failed to load page:', err);
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

  // Tajweed rules map for the current Ayah words
  const ayahTajweedMap = useMemo(() => {
    if (!words || words.length === 0) return new Map<number, TajweedRuleOccurrence[]>();
    return tajweedAnalyzer.getRulesForEntireAyah(words);
  }, [words]);

  // Tajweed rules active on the current recited word
  const activeWordTajweedRules = useMemo(() => {
    return ayahTajweedMap.get(currentWordIndex) || [];
  }, [ayahTajweedMap, currentWordIndex]);

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

  // Handle when someone forgets an ayah or hesitates
  const handleForgottenAyahPrompt = useCallback((wordIdx?: number) => {
    const targetIdx = typeof wordIdx === 'number' ? wordIdx : currentWordIndexRef.current;
    const targetWord = wordsRef.current[targetIdx] || wordsRef.current[0];
    if (!targetWord) return;

    // Immediately stop mic listening to deliver the repetition prompt cleanly
    setIsListening(false);
    setIsRecordingAudio(false);
    recitationTracker.stop();

    const hangObj: RecitationHangState = {
      active: true,
      reason: 'forgotten_ayah',
      ayahNumber: currentAyah.numberInSurah,
      wordIndex: targetIdx,
      wordArabic: targetWord.arabic,
      wordTransliteration: targetWord.transliteration,
      letterHint: isRtl ? `بداية الكلمة: «${targetWord.arabic.charAt(0)}»` : `Begins with: "${targetWord.arabic.charAt(0)}"`,
      highlightLetter: targetWord.arabic.charAt(0),
      explanation: isRtl
        ? `تلقين الآية ${currentAyah.numberInSurah}: استمع لنطق «${targetWord.arabic}» ثم كررها وتابع التلاوة.`
        : `Prompting Ayah ${currentAyah.numberInSurah}: Listen to "${targetWord.transliteration}", repeat it, and continue.`,
      isRepeatingAudio: true,
      repeatCount: 1,
      mistakeRecord: null
    };
    setHangState(hangObj);

    // Repeat the forgotten word and letter prompt!
    audioEngine.repeatWordAndLetterPrompt({
      wordArabic: targetWord.arabic,
      letterHint: isRtl ? 'استمع وكرر' : 'Listen and repeat',
      isMistake: false,
      language: speakerLanguage,
      settings: audioSettings,
      playChimeFirst: true,
      onComplete: () => {
        setHangState(prev => (prev ? { ...prev, isRepeatingAudio: false } : null));
      }
    });
  }, [currentAyah, isRtl, speakerLanguage, audioSettings]);

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

    // 5. Enter Hang State: Hang on the particular verse and letter!
    const hangObj: RecitationHangState = {
      active: true,
      reason: 'mistake',
      ayahNumber: currentAyah.numberInSurah,
      wordIndex: currentWordIndexRef.current,
      wordArabic: harakahDetail.expectedWord,
      wordTransliteration: wordsRef.current[currentWordIndexRef.current]?.transliteration || '',
      letterHint: isRtl
        ? `حرف ${harakahDetail.harfNameArabic} بالكسرة: ${harakahDetail.expectedArabicLetter}`
        : `Letter ${harakahDetail.harfNameEnglish} with Kasrah: ${harakahDetail.expectedArabicLetter}`,
      letterName: harakahDetail.harfNameArabic,
      highlightLetter: harakahDetail.expectedArabicLetter,
      explanation: isRtl
        ? `توقف للتصحيح: نطق الحرف بالضمة (${harakahDetail.actualArabicLetter}) بدل الكسرة (${harakahDetail.expectedArabicLetter}). الصحيح: «${harakahDetail.expectedWord}» بالكسرة.`
        : `Correction: Pronounced with Dammah (${harakahDetail.actualArabicLetter}) instead of Kasrah (${harakahDetail.expectedArabicLetter}). Correct: "${harakahDetail.expectedWord}".`,
      isRepeatingAudio: true,
      repeatCount: 1,
      mistakeRecord: mistakeObj
    };
    setHangState(hangObj);

    // 6. Voice coach immediately repeats the word and letter prompt!
    audioEngine.repeatWordAndLetterPrompt({
      wordArabic: harakahDetail.expectedWord,
      letterHint: isRtl
        ? `حرف ${harakahDetail.harfNameArabic} بالكسرة: ${harakahDetail.expectedArabicLetter}`
        : `Letter ${harakahDetail.harfNameEnglish} with Kasrah: ${harakahDetail.expectedArabicLetter}`,
      isMistake: true,
      language: speakerLanguage,
      settings: audioSettings,
      playChimeFirst: false,
      onComplete: () => {
        setHangState(prev => (prev ? { ...prev, isRepeatingAudio: false } : null));
      }
    });
  }, [surah, currentAyah, isRtl, audioSettings, speakerLanguage, onRecordMistake]);

  // Hang Actions: Repeat prompt again, play Master Reciter, continue, retry phrase
  const handleRepeatHangPrompt = useCallback(() => {
    if (!hangState) return;
    setHangState(prev => (prev ? { ...prev, isRepeatingAudio: true, repeatCount: prev.repeatCount + 1 } : null));
    audioEngine.repeatWordAndLetterPrompt({
      wordArabic: hangState.wordArabic,
      letterHint: hangState.letterHint,
      isMistake: hangState.reason === 'mistake',
      language: speakerLanguage,
      settings: audioSettings,
      playChimeFirst: false,
      onComplete: () => {
        setHangState(prev => (prev ? { ...prev, isRepeatingAudio: false } : null));
      }
    });
  }, [hangState, speakerLanguage, audioSettings]);

  const handlePlaySheikhForCurrentAyah = useCallback(() => {
    const url = quranService.getAyahAudioUrl(surah.number, currentAyah.numberInSurah, audioSettings.reciterId);
    audioEngine.playReciterAudio(url);
  }, [surah.number, currentAyah.numberInSurah, audioSettings.reciterId]);

  const handleContinueFromHang = useCallback(() => {
    audioEngine.stopAll();
    setHangState(null);
    setActiveMistake(null);
    setShowDetailedMistakeModal(false);
    handleWordRecited();
    setIsListening(true);
    recitationTracker.resetActivityTimer();
  }, [handleWordRecited]);

  const handleRetryPhraseFromHang = useCallback(() => {
    audioEngine.stopAll();
    setHangState(null);
    setActiveMistake(null);
    setShowDetailedMistakeModal(false);
    setIsListening(true);
    recitationTracker.resetActivityTimer();
  }, []);

  // Synchronized callback refs to guarantee fresh closures without restarting media streams
  const hangStateRef = useRef(hangState);
  useEffect(() => {
    hangStateRef.current = hangState;
  }, [hangState]);

  const handleWordRecitedRef = useRef(handleWordRecited);
  useEffect(() => {
    handleWordRecitedRef.current = handleWordRecited;
  }, [handleWordRecited]);

  const handleForgottenAyahPromptRef = useRef(handleForgottenAyahPrompt);
  useEffect(() => {
    handleForgottenAyahPromptRef.current = handleForgottenAyahPrompt;
  }, [handleForgottenAyahPrompt]);

  const handleHarakahMistakeRef = useRef(handleHarakahMistake);
  useEffect(() => {
    handleHarakahMistakeRef.current = handleHarakahMistake;
  }, [handleHarakahMistake]);

  // Start / Stop Speech & Acoustic Tracker and User Voice Recorder based on listening state
  useEffect(() => {
    if (isListening) {
      setMicPermissionError(null);
      setRecordingDuration(0);
      recitationTracker.start({
        onWordMatched: (_wordIdx, recognizedText) => {
          setDetectedTranscript(recognizedText);
          if (hangStateRef.current?.active) {
            // Student spoke the word after hearing repeat; play pleasant success chime!
            audioEngine.playSuccessChime();
            setHangState(null);
            setActiveMistake(null);
            setShowDetailedMistakeModal(false);
          }
          handleWordRecitedRef.current();
        },
        onHesitationDetected: (wordIdx) => {
          if (!hangStateRef.current?.active) {
            handleForgottenAyahPromptRef.current(wordIdx);
          }
        },
        onHarakahMistakeDetected: (harakahDetail) => {
          handleHarakahMistakeRef.current(harakahDetail);
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
  }, [isListening]);

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

  // Handle setting speaker language (Arabic or English)
  const handleSetSpeakerLang = (lang: 'ar' | 'en') => {
    setSpeakerLanguage(lang);
    if (onUpdateAudioSettings) {
      onUpdateAudioSettings({
        ...audioSettings,
        speakerLanguage: lang,
        guidanceVoiceLanguage: lang
      });
    }
  };

  // Audition / Test the selected speaker immediately
  const handleTestSpeaker = (lang: 'ar' | 'en' = speakerLanguage) => {
    audioEngine.speakBeginRecitationPrompt(lang, {
      ...audioSettings,
      speakerLanguage: lang,
      guidanceVoiceLanguage: lang
    });
    setSpeakerToast({
      active: true,
      text: lang === 'ar' ? 'ابدأ التلاوة' : 'Begin recitation',
      lang
    });
    setTimeout(() => {
      setSpeakerToast(prev => ({ ...prev, active: false }));
    }, 2800);
  };

  // Toggle Live Microphone Listening
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      audioEngine.stopAll();
    } else {
      setMicPermissionError(null);
      setIsListening(true);

      // Spoken Begin Recitation Announcement based on selected speaker language:
      // Arabic speaker: "ابدأ التلاوة" | English speaker: "Begin recitation"
      if (audioSettings.beginRecitationPromptEnabled !== false) {
        audioEngine.speakBeginRecitationPrompt(speakerLanguage, audioSettings);
        setSpeakerToast({
          active: true,
          text: speakerLanguage === 'ar' ? 'ابدأ التلاوة' : 'Begin recitation',
          lang: speakerLanguage
        });
        setTimeout(() => {
          setSpeakerToast(prev => ({ ...prev, active: false }));
        }, 2800);
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

    const hangObj: RecitationHangState = {
      active: true,
      reason: 'mistake',
      ayahNumber: currentAyah.numberInSurah,
      wordIndex: currentWordIndex,
      wordArabic: activeWord.arabic,
      wordTransliteration: activeWord.transliteration,
      letterHint: activeWord.tajweedRuleName || (isRtl ? 'تنبيه تجويدي' : 'Tajweed Rule'),
      highlightLetter: activeWord.arabic.charAt(0),
      explanation: mistakeObj.explanation,
      isRepeatingAudio: true,
      repeatCount: 1,
      mistakeRecord: mistakeObj
    };
    setHangState(hangObj);
    setActiveMistake(mistakeObj);
    onRecordMistake(mistakeObj);

    audioEngine.repeatWordAndLetterPrompt({
      wordArabic: activeWord.arabic,
      letterHint: activeWord.tajweedRuleName,
      isMistake: true,
      language: speakerLanguage,
      settings: audioSettings,
      playChimeFirst: false,
      onComplete: () => {
        setHangState(prev => (prev ? { ...prev, isRepeatingAudio: false } : null));
      }
    });
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
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowNavPicker(true)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group text-start"
                title="Change Surah, Ayah, or Mushaf Page"
              >
                <span className="font-arabic text-xl sm:text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {surah.nameArabic}
                </span>
                <span className="text-sm font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {surah.nameEnglish}
                </span>
                <ChevronDown className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Ayah selector pill with quick stepper */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs">
                <button
                  onClick={() => {
                    if (currentAyahIndex > 0) {
                      setCurrentAyahIndex(prev => prev - 1);
                      setCurrentWordIndex(0);
                    }
                  }}
                  disabled={currentAyahIndex <= 0}
                  className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Ayah"
                >
                  {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setShowNavPicker(true)}
                  className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9] hover:text-[#C5A059] transition-colors cursor-pointer"
                  title="Select specific Ayah"
                >
                  {isRtl ? `الآية ${currentAyah.numberInSurah} من ${surah.numberOfAyahs}` : `Ayah ${currentAyah.numberInSurah} of ${surah.numberOfAyahs}`}
                </button>

                <button
                  onClick={() => {
                    if (currentAyahIndex < surah.ayahs.length - 1) {
                      setCurrentAyahIndex(prev => prev + 1);
                      setCurrentWordIndex(0);
                    }
                  }}
                  disabled={currentAyahIndex >= surah.ayahs.length - 1}
                  className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Next Ayah"
                >
                  {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Page Number Pill */}
              <button
                onClick={() => setShowNavPicker(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] dark:border-[#28503E] text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5] hover:opacity-85 transition-opacity cursor-pointer"
                title="Jump to Mushaf Page (1 - 604)"
              >
                <FileText className="w-3 h-3" />
                <span>{isRtl ? `ص ${surah.pageNumber || 1}` : `Page ${surah.pageNumber || 1}`}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
              {isRtl ? 'وضع التسميع عن ظهر قلب • استماع كلمة بكلمة مع مراقبة التجويد' : 'Reciting from memory • Word-by-word tracking with Tajweed coaching'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Surah / Ayah / Page Quick Action */}
          <button
            onClick={() => setShowNavPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C5A059] text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors cursor-pointer bg-[#FDFBF7] dark:bg-[#172526] shadow-xs"
            title="Choose Surah, Ayah, or Page"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? 'تغيير السورة / الآية / الصفحة' : 'Surah / Ayah / Page'}</span>
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

      {/* SPEAKER & LANGUAGE SELECTION BAR (Arabic vs English Speaker) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EAF2ED] dark:bg-[#1A2E28] text-[#1A4D4E] dark:text-[#72D6A5] flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'المتحدث الصوتي لبدء التلاوة' : 'Recitation Speaker Voice'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C5A059]/15 text-[#8A6D3B] dark:text-[#D4B574]">
                {speakerLanguage === 'ar' ? '🇸🇦 عربي' : '🇬🇧 English'}
              </span>
            </div>
            <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
              {speakerLanguage === 'ar'
                ? (isRtl ? 'ينطق المتحدث: "ابدأ التلاوة"' : 'Speaker prompt: "ابدأ التلاوة" (Arabic)')
                : (isRtl ? 'ينطق المتحدث: "Begin recitation"' : 'Speaker prompt: "Begin recitation" (English)')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dual Speaker Selector Pill */}
          <div className="flex items-center bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] rounded-xl p-0.5 text-xs">
            <button
              onClick={() => handleSetSpeakerLang('ar')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                speakerLanguage === 'ar'
                  ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                  : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]'
              }`}
              title="اختر المتحدث باللغة العربية (ابدأ التلاوة)"
            >
              <span>🇸🇦</span>
              <span>{isRtl ? 'متحدث عربي' : 'Arabic Speaker'}</span>
            </button>
            <button
              onClick={() => handleSetSpeakerLang('en')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                speakerLanguage === 'en'
                  ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                  : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]'
              }`}
              title="Select English Speaker (Begin recitation)"
            >
              <span>🇬🇧</span>
              <span>{isRtl ? 'متحدث إنجليزي' : 'English Speaker'}</span>
            </button>
          </div>

          {/* Test / Audition Speaker Button */}
          <button
            onClick={() => handleTestSpeaker(speakerLanguage)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#172526] border border-[#C2DBCB] dark:border-[#232E2F] text-xs font-semibold text-[#1A4D4E] dark:text-[#72D6A5] hover:bg-[#EAF2ED] dark:hover:bg-[#1A2E28] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Hear how the speaker pronounces the begin recitation prompt"
          >
            <Play className="w-3 h-3 fill-current text-[#C5A059]" />
            <span>{isRtl ? 'استمع للنداء' : 'Test "Begin" Prompt'}</span>
          </button>

          {/* UI Language Switcher */}
          {onToggleDirection && (
            <button
              onClick={onToggleDirection}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9] transition-colors cursor-pointer"
              title={isRtl ? 'Switch entire interface to English' : 'التبديل إلى الواجهة العربية بالكامل'}
            >
              {isRtl ? '🌐 English UI' : '🌐 الواجهة العربية'}
            </button>
          )}
        </div>
      </div>

      {/* Spoken Announcement Notification Toast */}
      {speakerToast.active && (
        <div className="flex items-center justify-center -mb-2 animate-bounce">
          <div className="py-1.5 px-4 rounded-full bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] text-xs font-bold flex items-center gap-2 shadow-lg">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {speakerToast.lang === 'ar'
                ? '🎙️ المرشد الصوتي: "ابدأ التلاوة"'
                : '🎙️ Voice Speaker: "Begin recitation"'}
            </span>
          </div>
        </div>
      )}

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

            {/* Quick Prompt Button when student forgets or hesitates */}
            <button
              onClick={() => handleForgottenAyahPrompt()}
              className="ms-2 px-2.5 py-1 rounded-xl bg-[#F5E6CC] dark:bg-[#2F2718] border border-[#C5A059]/40 text-[#8B6E30] dark:text-[#E5C37A] hover:bg-[#ecdabb] text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              title="نسيت الآية أو الكلمة؟ اضغط لتلقين وتكرار النطق ثم المتابعة"
            >
              <Lightbulb className="w-3 h-3 text-[#C5A059]" />
              <span>{isRtl ? 'نسيت الآية؟ تلقين' : 'Forgot Ayah? Prompt'}</span>
            </button>
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

        {/* LIVE TAJWEED RULES COACHING BAR */}
        <div className="relative z-10 w-full max-w-2xl mx-auto my-1">
          <LiveTajweedCoach
            currentWordArabic={words[currentWordIndex]?.arabic}
            currentWordTransliteration={words[currentWordIndex]?.transliteration}
            rules={activeWordTajweedRules}
            audioSettings={audioSettings}
            speakerLanguage={speakerLanguage}
            direction={direction}
            onInspectRule={rule => setSelectedTajweedInspection(rule)}
          />
        </div>

        {/* LIVE RECITATION HANG CARD: HANG ON VERSE & LETTER, REPEAT AND CONTINUE */}
        {hangState?.active && (
          <div className="relative z-20 w-full max-w-2xl mx-auto my-2 animate-fadeIn">
            <RecitationHangCard
              hangState={hangState}
              direction={direction}
              speakerLanguage={speakerLanguage}
              onRepeatPrompt={handleRepeatHangPrompt}
              onPlayMasterSheikh={handlePlaySheikhForCurrentAyah}
              onContinue={handleContinueFromHang}
              onRetryPhrase={handleRetryPhraseFromHang}
              onOpenDetailedAnalysis={() => setShowDetailedMistakeModal(true)}
              onDismiss={() => setHangState(null)}
            />
          </div>
        )}

        {/* CORE TEXT: WORD-BY-WORD UTHMANI SCRIPT */}
        <div className="relative z-10 my-auto py-4 max-w-2xl">
          <div
            className="font-arabic text-3xl sm:text-4xl md:text-5xl font-bold leading-[2.2] sm:leading-[2.4] flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-3 select-none"
            dir="rtl"
          >
            {words.map((word, idx) => {
              const isPast = idx < currentWordIndex;
              const isCurrent = idx === currentWordIndex;
              const isUpcoming = idx > currentWordIndex;
              const wordTajweedRules = ayahTajweedMap.get(idx) || [];
              const isHangingWord = hangState?.active && hangState.wordIndex === idx;

              return (
                <div
                  key={word.id}
                  onClick={() => setCurrentWordIndex(idx)}
                  className={`relative flex flex-col items-center transition-all duration-300 px-2.5 py-1.5 rounded-2xl cursor-pointer ${
                    isHangingWord
                      ? hangState.reason === 'mistake'
                        ? 'bg-[#FDF2F0] dark:bg-[#381614] text-[#D96E54] dark:text-[#F87171] border-2 border-[#D96E54] scale-110 shadow-lg ring-4 ring-[#D96E54]/30 animate-pulse z-10'
                        : 'bg-[#FDF6E9] dark:bg-[#2C2314] text-[#8B6E30] dark:text-[#E5C37A] border-2 border-[#C5A059] scale-110 shadow-lg ring-4 ring-[#C5A059]/30 animate-pulse z-10'
                      : isPast
                      ? 'text-[#1A4D4E] dark:text-[#72D6A5] opacity-90'
                      : isCurrent
                      ? 'bg-[#F5E6CC] dark:bg-[#2F2718] text-[#8B6E30] dark:text-[#E5C37A] border-b-2 border-[#C5A059] scale-105 shadow-sm ring-2 ring-[#C5A059]/20'
                      : isFocusMode
                      ? 'opacity-20 blur-[2px] text-[#8E9B98]'
                      : 'opacity-40 text-[#6F7D7B] dark:text-[#8E9B98] hover:opacity-75'
                  }`}
                  title={`Click to jump to: ${word.transliteration}`}
                >
                  {/* Floating badge for hanging word */}
                  {isHangingWord && (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap shadow-sm z-20 ${
                        hangState.reason === 'mistake' ? 'bg-[#D96E54]' : 'bg-[#C5A059]'
                      }`}
                    >
                      {hangState.reason === 'mistake'
                        ? (isRtl ? 'وقف للتصحيح' : 'Correct Letter')
                        : (isRtl ? 'وقف للتلقين' : 'Verse Prompt')}
                    </span>
                  )}

                  <span>{word.arabic}</span>

                  {/* Word-level Tajweed Rule Indicators */}
                  {wordTajweedRules.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5" dir="ltr">
                      {wordTajweedRules.slice(0, 2).map((r, rIdx) => (
                        <span
                          key={rIdx}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTajweedInspection(r);
                          }}
                          className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-sans font-bold leading-tight cursor-pointer hover:scale-115 transition-transform ${r.badgeBg} ${r.badgeText}`}
                          title={`${isRtl ? r.ruleNameArabic : r.ruleNameEnglish}: ${isRtl ? r.coachingTipArabic : r.coachingTip}`}
                        >
                          {isRtl ? r.ruleNameArabic.split(' ')[0] : r.ruleType.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Active word tracking dot indicator */}
                  {isCurrent && !isHangingWord && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
                  )}
                </div>
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

          <button
            onClick={() => handleForgottenAyahPrompt()}
            className="px-3 py-1.5 rounded-lg bg-[#F5E6CC] dark:bg-[#2F2718] border border-[#C5A059]/40 text-[#8B6E30] dark:text-[#E5C37A] hover:bg-[#ecdabb] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Simulates student hesitating or forgetting the ayah; hangs, prompts and repeats word"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isRtl ? '💡 محاكاة نسيان الآية / التردد (تلقين وتكرار)' : '💡 Simulate Forgot Ayah / Hesitation'}</span>
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

          {/* Center Thumb: Primary Button (Continue Recitation when hanging, or Microphone Toggle) */}
          {hangState?.active ? (
            <button
              onClick={handleContinueFromHang}
              className="flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] dark:hover:bg-[#21706D] text-white shadow-[#1A4D4E]/25 animate-pulse"
              title="Continue recitation"
            >
              <span>{isRtl ? '▶️ متابعة التلاوة والاستمرار' : '▶️ Continue Recitation'}</span>
            </button>
          ) : (
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
                  <span>
                    {speakerLanguage === 'ar' ? 'ابدأ التلاوة' : 'Begin Recitation'}
                  </span>
                </>
              )}
            </button>
          )}

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

      {/* CORRECTION OVERLAY MODAL (When detailed acoustic review is requested) */}
      {showDetailedMistakeModal && activeMistake && (
        <CorrectionOverlay
          mistake={activeMistake}
          audioSettings={audioSettings}
          direction={direction}
          onRetry={() => {
            setShowDetailedMistakeModal(false);
            handleRetryPhraseFromHang();
          }}
          onContinue={() => {
            setShowDetailedMistakeModal(false);
            handleContinueFromHang();
          }}
          referenceAudioUrl={currentAyah.audioUrl}
        />
      )}

      {/* COMPREHENSIVE SURAH / AYAH / PAGE NAVIGATION MODAL */}
      <QuranNavigationModal
        isOpen={showNavPicker}
        direction={direction}
        currentSurah={surah}
        currentAyahIndex={currentAyahIndex}
        allSurahsList={allSurahsList}
        onClose={() => setShowNavPicker(false)}
        onSelectSurah={handleSelectSurahNumber}
        onSelectAyah={handleSelectAyahIndex}
        onSelectPage={handleSelectPageNumber}
      />

      {/* TAJWEED RULE INSPECTOR MODAL */}
      <TajweedRuleInspectorModal
        rule={selectedTajweedInspection}
        wordArabic={words[currentWordIndex]?.arabic}
        direction={direction}
        audioSettings={audioSettings}
        speakerLanguage={speakerLanguage}
        onClose={() => setSelectedTajweedInspection(null)}
      />
    </div>
  );
};
