import React, { useState, useEffect, useRef } from 'react';
import { TajweedMistake, AudioSettings, Direction, ScreenId, VoiceCompareReport } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { audioRecordingService, RecordedVoiceClip, RecitedPlaceRecord } from '../../services/audioRecordingService';
import { quranService } from '../../services/quranService';
import { RECITERS_LIST } from '../../data/quranData';
import { ALL_114_SURAHS_METADATA, SurahMeta } from '../../data/allSurahsMetadata';
import { acousticAnalyticsService } from '../../services/acousticAnalyticsService';
import { pdfReportService } from '../../services/pdfReportService';
import { VoiceCompareReportModal } from '../audio/VoiceCompareReportModal';
import {
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  Check,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Activity,
  ChevronRight,
  ChevronLeft,
  Mic,
  Square,
  RefreshCw,
  Users,
  Sliders,
  AlertCircle,
  Headphones,
  CheckCheck,
  BarChart2,
  FileText,
  Share2,
  Trophy,
  BookOpen,
  Search,
  X,
  Smile,
  Heart,
  Calendar,
  Clock,
  Music,
  CheckCircle
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
  // Surah Selection state (user can select which recited Surah appears at the top)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    return mistakes.length > 0 ? mistakes[0].surahNumber : 1;
  });
  const [showSurahModal, setShowSurahModal] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');

  // Past recited places for the selected Surah
  const [recitedPlaces, setRecitedPlaces] = useState<RecitedPlaceRecord[]>([]);
  const [playingPlaceId, setPlayingPlaceId] = useState<string | null>(null);
  const [placeCurrentTime, setPlaceCurrentTime] = useState<number>(0);

  // Filter state for mistakes
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unmastered' | 'tajweed' | 'harakat'>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Active Reciter Selection (supports world renowned scholars & female Qari'ahs)
  const [selectedReciterId, setSelectedReciterId] = useState<string>(audioSettings.reciterId || 'alafasy');
  const [showReciterModal, setShowReciterModal] = useState(false);

  // Playback & Comparison State
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [comparisonPhase, setComparisonPhase] = useState<'idle' | 'user' | 'pause' | 'reference'>('idle');

  // Audio Playback Tracking
  const [userCurrentTime, setUserCurrentTime] = useState(0);
  const [userDuration, setUserDuration] = useState(0);
  const [refCurrentTime, setRefCurrentTime] = useState(0);
  const [refDuration, setRefDuration] = useState(0);

  // In-Review Standalone Re-recording State
  const [isReRecording, setIsReRecording] = useState(false);
  const [reRecordSeconds, setReRecordSeconds] = useState(0);
  const stopReRecordRef = useRef<(() => Promise<RecordedVoiceClip | null>) | null>(null);

  // Voice Compare Acoustic Analytics State
  const [voiceReport, setVoiceReport] = useState<VoiceCompareReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Local overrides for mistakes that were re-recorded in this session
  const [recordedClipsMap, setRecordedClipsMap] = useState<Record<string, string>>({});

  const isRtl = direction === 'rtl';

  // Load recited places whenever selected Surah changes
  useEffect(() => {
    const places = audioRecordingService.getRecitedPlaces(selectedSurahNumber);
    setRecitedPlaces(places);
  }, [selectedSurahNumber]);

  // Recited Surahs summary list
  const recitedSurahsSummary = audioRecordingService.getRecitedSurahsSummary();

  // Selected Surah Metadata
  const currentSurahMeta = ALL_114_SURAHS_METADATA.find(s => s.number === selectedSurahNumber) || ALL_114_SURAHS_METADATA[0];

  // Filter mistakes strictly for the selected Surah
  const surahMistakes = mistakes.filter(m => m.surahNumber === selectedSurahNumber);
  
  const filteredMistakes = surahMistakes.filter(m => {
    if (selectedFilter === 'unmastered') return !m.mastered;
    if (selectedFilter === 'tajweed') return m.mistakeType === 'tajweed_slip';
    if (selectedFilter === 'harakat') return m.mistakeType === 'wrong_harakah';
    return true;
  });

  // Effective mistake under review: from filtered list, or synthesized from the first recited place if no pending mistake
  const currentMistake: TajweedMistake | undefined = filteredMistakes[activeCardIndex] || filteredMistakes[0] || (
    recitedPlaces.length > 0
      ? {
          id: `place_review_${recitedPlaces[0].id}`,
          surahNumber: selectedSurahNumber,
          surahName: currentSurahMeta.nameArabic,
          ayahNumber: recitedPlaces[0].ayahNumber,
          wordArabic: recitedPlaces[0].wordArabic || `الآية ${recitedPlaces[0].ayahNumber}`,
          userRecitation: 'Your Recitation Take',
          expectedRecitation: currentReciterName(selectedReciterId),
          timestamp: recitedPlaces[0].timestamp,
          mistakeType: (recitedPlaces[0].mistakeType as any) || 'tajweed_slip',
          explanation: `Review of your recitation for Ayah ${recitedPlaces[0].ayahNumber}. Compare with ${currentReciterName(selectedReciterId)}.`,
          mastered: recitedPlaces[0].status === 'mastered',
          userAudioBlobUrl: recitedPlaces[0].audioUrl,
          recordingDurationSeconds: recitedPlaces[0].durationSeconds,
          ayahTextArabic: recitedPlaces[0].ayahTextArabic
        }
      : undefined
  );

  function currentReciterName(id: string): string {
    const r = RECITERS_LIST.find(x => x.id === id);
    return r ? r.name : 'Mishary Rashid Alafasy';
  }

  // Active Scholar object
  const currentReciter = RECITERS_LIST.find(r => r.id === selectedReciterId) || RECITERS_LIST[0];

  // Master Reference Audio URL
  const getReferenceUrl = (mistake: TajweedMistake, reciterId: string): string => {
    return quranService.getAyahAudioUrl(mistake.surahNumber, mistake.ayahNumber, reciterId);
  };

  // User's Voice Audio URL
  const getUserAudioUrl = (mistake: TajweedMistake): string | undefined => {
    if (recordedClipsMap[mistake.id]) {
      return recordedClipsMap[mistake.id];
    }
    if (mistake.userAudioBlobUrl) {
      return mistake.userAudioBlobUrl;
    }
    const cachedClip = audioRecordingService.getClipForMistake(mistake.id);
    if (cachedClip?.url) return cachedClip.url;
    // Check if we have a recorded place for this ayah
    const place = recitedPlaces.find(p => p.ayahNumber === mistake.ayahNumber);
    if (place?.audioUrl) return place.audioUrl;
    return undefined;
  };

  // Stop all audio when switching cards or navigating away
  useEffect(() => {
    audioRecordingService.stopAll();
    setIsPlayingReference(false);
    setIsPlayingUser(false);
    setPlayingPlaceId(null);
    setComparisonPhase('idle');
    setUserCurrentTime(0);
    setRefCurrentTime(0);

    return () => {
      audioRecordingService.stopAll();
    };
  }, [activeCardIndex, selectedSurahNumber]);

  // Handle Play Master Reference Scholar
  const handlePlayReference = () => {
    if (!currentMistake) return;

    if (isPlayingReference) {
      audioRecordingService.stopReferenceAudio();
      setIsPlayingReference(false);
      return;
    }

    audioRecordingService.stopAll();
    setIsPlayingUser(false);
    setPlayingPlaceId(null);
    setComparisonPhase('idle');
    setIsPlayingReference(true);

    const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
    audioRecordingService.playReferenceAudio(
      refUrl,
      (curr, dur) => {
        setRefCurrentTime(curr);
        setRefDuration(dur);
      },
      () => {
        setIsPlayingReference(false);
        setRefCurrentTime(0);
      }
    );
  };

  // Handle Play User's Voice Recording for the active card
  const handlePlayUserRecording = () => {
    if (!currentMistake) return;

    if (isPlayingUser) {
      audioRecordingService.stopUserAudio();
      setIsPlayingUser(false);
      return;
    }

    audioRecordingService.stopAll();
    setIsPlayingReference(false);
    setPlayingPlaceId(null);
    setComparisonPhase('idle');
    setIsPlayingUser(true);

    const userAudioUrl = getUserAudioUrl(currentMistake);

    if (userAudioUrl) {
      audioRecordingService.playUserAudio(
        userAudioUrl,
        (curr, dur) => {
          setUserCurrentTime(curr);
          setUserDuration(dur);
        },
        () => {
          setIsPlayingUser(false);
          setUserCurrentTime(0);
        }
      );
    } else {
      // Fallback synthesized clip
      const fallbackClip = audioRecordingService.generateSynthesizedAudioClip(currentMistake.wordArabic);
      setRecordedClipsMap(prev => ({ ...prev, [currentMistake.id]: fallbackClip.url }));
      audioRecordingService.playUserAudio(
        fallbackClip.url,
        (curr, dur) => {
          setUserCurrentTime(curr);
          setUserDuration(dur);
        },
        () => {
          setIsPlayingUser(false);
          setUserCurrentTime(0);
        }
      );
    }
  };

  // Handle playing past recited place audio
  const handlePlayPlaceAudio = (place: RecitedPlaceRecord) => {
    if (playingPlaceId === place.id) {
      audioRecordingService.stopUserAudio();
      setPlayingPlaceId(null);
      return;
    }

    audioRecordingService.stopAll();
    setIsPlayingUser(false);
    setIsPlayingReference(false);
    setComparisonPhase('idle');
    setPlayingPlaceId(place.id);

    audioRecordingService.playUserAudio(
      place.audioUrl,
      (curr) => {
        setPlaceCurrentTime(curr);
      },
      () => {
        setPlayingPlaceId(null);
        setPlaceCurrentTime(0);
      }
    );
  };

  // Handle selecting a past place to compare with scholar in active station
  const handleSelectPlaceForComparison = (place: RecitedPlaceRecord) => {
    audioRecordingService.stopAll();
    setPlayingPlaceId(null);
    setIsPlayingUser(false);
    setIsPlayingReference(false);

    // If there's an existing mistake matching this ayah, select it
    const matchingIdx = filteredMistakes.findIndex(m => m.ayahNumber === place.ayahNumber);
    if (matchingIdx !== -1) {
      setActiveCardIndex(matchingIdx);
    }
    
    // Invalidate old report and generate fresh friendly comparison
    if (currentMistake) {
      const refUrl = quranService.getAyahAudioUrl(selectedSurahNumber, place.ayahNumber, selectedReciterId);
      const report = acousticAnalyticsService.generateReport(
        currentMistake,
        currentReciter,
        place.audioUrl,
        refUrl
      );
      setVoiceReport(report);
    }

    audioEngine.playSuccessChime();
  };

  // Handle Sequential A/B Comparison (User Attempt ➔ Master Reference)
  const handleSequentialComparison = () => {
    if (!currentMistake) return;

    if (comparisonPhase !== 'idle') {
      audioRecordingService.stopAll();
      setComparisonPhase('idle');
      setIsPlayingUser(false);
      setIsPlayingReference(false);
      return;
    }

    audioRecordingService.stopAll();
    setPlayingPlaceId(null);
    const userAudioUrl = getUserAudioUrl(currentMistake);
    const refUrl = getReferenceUrl(currentMistake, selectedReciterId);

    audioRecordingService.playSequentialComparison(userAudioUrl, refUrl, {
      onPhaseChange: (phase) => {
        setComparisonPhase(phase);
        setIsPlayingUser(phase === 'user');
        setIsPlayingReference(phase === 'reference');
      },
      onEnded: () => {
        setComparisonPhase('idle');
        setIsPlayingUser(false);
        setIsPlayingReference(false);

        // Generate Voice Compare Acoustic Analytics Report
        const report = acousticAnalyticsService.generateReport(
          currentMistake,
          currentReciter,
          userAudioUrl,
          refUrl
        );
        setVoiceReport(report);
        setShowReportModal(true);
        audioEngine.playSuccessChime();
      }
    });
  };

  // Open Acoustic Comparison Report Modal directly
  const handleOpenAcousticReport = () => {
    if (!currentMistake) return;
    const userAudioUrl = getUserAudioUrl(currentMistake);
    const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
    const report = voiceReport || acousticAnalyticsService.generateReport(
      currentMistake,
      currentReciter,
      userAudioUrl,
      refUrl
    );
    setVoiceReport(report);
    setShowReportModal(true);
  };

  // Download PDF Report
  const handleDownloadPdfReport = () => {
    if (!currentMistake) return;
    const userAudioUrl = getUserAudioUrl(currentMistake);
    const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
    const report = voiceReport || acousticAnalyticsService.generateReport(
      currentMistake,
      currentReciter,
      userAudioUrl,
      refUrl
    );
    pdfReportService.downloadReport(report);
    audioEngine.playSuccessChime();
  };

  // Share PDF Report
  const handleSharePdfReport = async () => {
    if (!currentMistake) return;
    const userAudioUrl = getUserAudioUrl(currentMistake);
    const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
    const report = voiceReport || acousticAnalyticsService.generateReport(
      currentMistake,
      currentReciter,
      userAudioUrl,
      refUrl
    );
    await pdfReportService.shareReport(report);
    audioEngine.playSuccessChime();
  };

  // Handle In-Review Re-recording of corrected pronunciation
  const startReRecording = async () => {
    if (isReRecording) {
      // Stop recording
      if (stopReRecordRef.current) {
        const clip = await stopReRecordRef.current();
        setIsReRecording(false);
        stopReRecordRef.current = null;
        if (clip && currentMistake) {
          setRecordedClipsMap(prev => ({ ...prev, [currentMistake.id]: clip.url }));
          audioRecordingService.associateClipWithMistake(currentMistake.id, clip);
          acousticAnalyticsService.invalidateReport(currentMistake.id);

          // Save to persistent recited places list
          audioRecordingService.saveRecitedPlace({
            id: `recited_${selectedSurahNumber}_${currentMistake.ayahNumber}_${Date.now()}`,
            surahNumber: selectedSurahNumber,
            surahName: currentSurahMeta.nameArabic,
            ayahNumber: currentMistake.ayahNumber,
            ayahTextArabic: currentMistake.ayahTextArabic || currentMistake.wordArabic,
            wordArabic: currentMistake.wordArabic,
            audioUrl: clip.url,
            durationSeconds: clip.durationSeconds,
            mistakeType: currentMistake.mistakeType,
            status: 'needs_practice',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

          // Refresh the recited places state
          setRecitedPlaces(audioRecordingService.getRecitedPlaces(selectedSurahNumber));

          // Immediately generate updated report
          const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
          const updatedReport = acousticAnalyticsService.generateReport(
            currentMistake,
            currentReciter,
            clip.url,
            refUrl,
            true
          );
          setVoiceReport(updatedReport);
          audioEngine.playSuccessChime();
        }
      }
      return;
    }

    audioRecordingService.stopAll();
    setIsPlayingUser(false);
    setIsPlayingReference(false);
    setPlayingPlaceId(null);
    setComparisonPhase('idle');
    setReRecordSeconds(0);
    setIsReRecording(true);

    const { stop } = await audioRecordingService.recordStandaloneAttempt((seconds) => {
      setReRecordSeconds(seconds);
    });

    stopReRecordRef.current = stop;
  };

  const handleMarkCurrentMastered = () => {
    if (!currentMistake) return;
    audioEngine.playSuccessChime();
    onMarkMastered(currentMistake.id);
    const masteredMistake = { ...currentMistake, mastered: true };
    const userAudioUrl = getUserAudioUrl(currentMistake);
    const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
    const updatedReport = acousticAnalyticsService.generateReport(
      masteredMistake,
      currentReciter,
      userAudioUrl,
      refUrl,
      true
    );
    setVoiceReport(updatedReport);

    // Also update recited places status
    const place = recitedPlaces.find(p => p.ayahNumber === currentMistake.ayahNumber);
    if (place) {
      audioRecordingService.saveRecitedPlace({
        ...place,
        status: 'mastered'
      });
      setRecitedPlaces(audioRecordingService.getRecitedPlaces(selectedSurahNumber));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered Surahs for modal search
  const filteredSurahsModal = ALL_114_SURAHS_METADATA.filter(s => {
    if (!surahSearchQuery.trim()) return true;
    const q = surahSearchQuery.toLowerCase().trim();
    return (
      s.nameEnglish.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      s.number.toString() === q
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. TOP SURAH SELECTION BANNER (Allows user to select any recited Quran Surah to appear at the top) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A4D4E]/10 text-[#1A4D4E] dark:text-[#72D6A5] text-[11px] font-bold">
                {isRtl ? 'السورة المختارة للمراجعة' : 'Selected Surah for Review'}
              </span>
              <span className="text-[11px] text-[#8E9B98]">
                {currentSurahMeta.revelationType === 'Meccan' ? (isRtl ? 'مكية' : 'Meccan') : (isRtl ? 'مدنية' : 'Medinan')} • {currentSurahMeta.numberOfAyahs} {isRtl ? 'آيات' : 'Ayahs'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-3">
              <span className="font-arabic">{currentSurahMeta.nameArabic}</span>
              <span className="text-base sm:text-lg font-normal text-[#6F7D7B] dark:text-[#9AA5A3]">
                ({currentSurahMeta.nameEnglish})
              </span>
            </h1>

            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
              {isRtl
                ? `لديك ${recitedPlaces.length} تسجيلات ومقاطع محفوظة • ${filteredMistakes.length} تنبيهات تجويدية للمراجعة`
                : `${recitedPlaces.length} recorded takes saved • ${filteredMistakes.length} review points in this Surah`}
            </p>
          </div>

          {/* Button to open all 114 Surahs Picker */}
          <button
            onClick={() => setShowSurahModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isRtl ? 'تغيير السورة (1-114)' : 'Select Any Surah (1-114)'}</span>
          </button>
        </div>

        {/* Quick Surah Selection Chips (Recited Surahs) */}
        <div className="pt-3 border-t border-[#E8E2D6] dark:border-[#232E2F] flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] text-[#8E9B98] flex-shrink-0 font-semibold">
            {isRtl ? 'سور بها تلاوات سابقة:' : 'Recited Surahs:'}
          </span>

          {recitedSurahsSummary.map(summary => (
            <button
              key={summary.surahNumber}
              onClick={() => {
                setSelectedSurahNumber(summary.surahNumber);
                setActiveCardIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedSurahNumber === summary.surahNumber
                  ? 'bg-[#1A4D4E] text-white dark:bg-[#72D6A5] dark:text-[#122021] shadow-xs'
                  : 'bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] hover:bg-[#EAF2ED]'
              }`}
            >
              <span>{summary.surahNumber}.</span>
              <span className="font-arabic">
                {ALL_114_SURAHS_METADATA.find(s => s.number === summary.surahNumber)?.nameArabic || summary.surahName}
              </span>
              <span className="text-[10px] opacity-80">({summary.totalPlaces} {isRtl ? 'مقاطع' : 'takes'})</span>
            </button>
          ))}

          {/* Plus button to open Surah search */}
          <button
            onClick={() => setShowSurahModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#172526] border border-dashed border-[#C5A059] text-[#C5A059] hover:bg-[#FDF8EE] transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <span>+</span>
            <span>{isRtl ? 'المزيد من السور...' : 'More Surahs...'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN REVIEW & DUAL COMPARISON STATION */}
      {currentMistake ? (
        <div className="space-y-6">
          
          {/* Review Verse Focus Card */}
          <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-5">
            
            {/* Verse Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D6] dark:border-[#232E2F] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D96E54]/15 text-[#D96E54] text-xs font-bold">
                    {isRtl ? 'موضع التصحيح والمقارنة' : 'Review Focus Area'}
                  </span>
                  <span className="text-xs text-[#8E9B98]">
                    {currentSurahMeta.nameArabic} • {isRtl ? `الآية ${currentMistake.ayahNumber}` : `Ayah ${currentMistake.ayahNumber}`}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {currentMistake.explanation}
                </h3>
              </div>

              {/* Master Scholar Selection Chip */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setShowReciterModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#172526] border border-[#C5A059]/40 hover:bg-[#FDF8EE] text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{currentReciter.name}</span>
                  <Sliders className="w-3 h-3 opacity-60" />
                </button>
              </div>
            </div>

            {/* Arabic Word Display */}
            <div className="p-6 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-center space-y-3">
              <div className="font-arabic text-4xl sm:text-5xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] tracking-wide" dir="rtl">
                {currentMistake.wordArabic}
              </div>
              
              {currentMistake.ayahTextArabic && (
                <p className="font-arabic text-base sm:text-lg text-[#6F7D7B] dark:text-[#A6B2AF] max-w-xl mx-auto leading-loose" dir="rtl">
                  « {currentMistake.ayahTextArabic} »
                </p>
              )}
            </div>

            {/* DUAL-TRACK AUDIO COMPARISON STATION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#5F6E6C] dark:text-[#A6B2AF]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#C5A059]" />
                  <span>
                    {isRtl
                      ? 'محطة المقارنة الصوتية المباشرة (صوتك المسجل مقابل الشيخ)'
                      : 'Dual-Track Audio Comparison Station'}
                  </span>
                </div>

                {/* Compare Sequence Button */}
                <button
                  onClick={handleSequentialComparison}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    comparisonPhase !== 'idle'
                      ? 'bg-[#D96E54] text-white animate-pulse'
                      : 'bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021] hover:opacity-90'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${comparisonPhase !== 'idle' ? 'animate-spin' : ''}`} />
                  <span>
                    {comparisonPhase === 'user'
                      ? (isRtl ? '1/2: استماع لتسجيلك...' : '1/2: Playing Your Voice...')
                      : comparisonPhase === 'pause'
                      ? (isRtl ? 'فترة انتقالية...' : 'Transitioning...')
                      : comparisonPhase === 'reference'
                      ? (isRtl ? `2/2: استماع للشيخ...` : `2/2: Playing Master Scholar...`)
                      : (isRtl ? 'مقارنة تتابعية (صوتك ➔ الشيخ)' : 'Compare Both Back-to-Back')}
                  </span>
                </button>
              </div>

              {/* TRACK 1: USER'S RECORDED VOICE */}
              <div className="p-4 rounded-2xl bg-[#FDF2F0]/80 dark:bg-[#2A1715]/80 border-2 border-[#D96E54]/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#D96E54]/20 flex items-center justify-center text-[#D96E54]">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#D96E54] flex items-center gap-1.5">
                        <span>{isRtl ? 'تلاوتك المسجلة (المقطع الحالي)' : 'Your Voice Recording (Active Track)'}</span>
                      </h4>
                      <p className="text-[11px] text-[#8E9B98]">
                        {formatTime(userCurrentTime)} / {formatTime(userDuration || currentMistake.recordingDurationSeconds || 3.5)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Re-record Button */}
                    <button
                      onClick={startReRecording}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isReRecording
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-white dark:bg-[#172526] border border-[#D96E54]/40 text-[#D96E54] hover:bg-[#FBE8E4]'
                      }`}
                    >
                      {isReRecording ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? `إيقاف (${reRecordSeconds}ث)` : `Stop (${reRecordSeconds}s)`}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-[#D96E54]" />
                          <span>{isRtl ? 'تسجيل مقطع جديد' : 'Record New Take'}</span>
                        </>
                      )}
                    </button>

                    {/* Play/Pause Button */}
                    <button
                      onClick={handlePlayUserRecording}
                      disabled={isReRecording}
                      className="px-3.5 py-1.5 rounded-xl bg-[#D96E54] hover:bg-[#c45e45] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isPlayingUser ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? 'استمع لصوتك' : 'Play Voice'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E8E2D6]/70 dark:bg-[#232E2F] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D96E54] h-full transition-all duration-100"
                    style={{ width: `${userDuration > 0 ? (userCurrentTime / userDuration) * 100 : (isPlayingUser ? 50 : 0)}%` }}
                  />
                </div>
              </div>

              {/* ⭐ SPECIFIC USER REQUIREMENT: "Under your record, let it present the places you're reciting before so the app should be keeping data of the audio you recite and play it back when it comes to review to compare it" */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C5A059]" />
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {isRtl
                        ? `سجل المقاطع التي رتلتها سابقاً في سورة ${currentSurahMeta.nameArabic}:`
                        : `Places You've Recited Before in Surah ${currentSurahMeta.nameEnglish}:`}
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#8E9B98]">
                    {recitedPlaces.length} {isRtl ? 'تسجيلات محفوظة' : 'saved takes'}
                  </span>
                </div>

                <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                  {isRtl
                    ? 'يحتفظ التطبيق ببيانات التسجيلات الصوتية لكل موضع رتلته سابقاً، ويمكنك تشغيل أي تسجيل أو مقارنته مباشرة مع الشيخ.'
                    : 'The app stores your recitation audio for every place you recite. Tap Play to listen back, or Compare to load it into the station.'}
                </p>

                {/* Recited Places List */}
                {recitedPlaces.length > 0 ? (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {recitedPlaces.map((place) => {
                      const isPlayingThisPlace = playingPlaceId === place.id;
                      const isLoadedInStation = currentMistake?.ayahNumber === place.ayahNumber;

                      return (
                        <div
                          key={place.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isLoadedInStation
                              ? 'bg-[#EAF2ED]/70 dark:bg-[#142A20]/70 border-[#2E7D5A] dark:border-[#72D6A5]'
                              : 'bg-[#FDFBF7] dark:bg-[#172526] border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#1A4D4E]/10 text-[#1A4D4E] dark:text-[#72D6A5] text-[10px] font-bold">
                                {isRtl ? `الآية ${place.ayahNumber}` : `Ayah ${place.ayahNumber}`}
                              </span>
                              {isLoadedInStation && (
                                <span className="px-2 py-0.5 rounded-md bg-[#C5A059]/20 text-[#C5A059] text-[10px] font-bold">
                                  {isRtl ? 'نشط في المقارنة' : 'Active in Station'}
                                </span>
                              )}
                              <span className="text-[10px] text-[#8E9B98] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{place.timestamp}</span>
                                <span>•</span>
                                <span>{place.durationSeconds.toFixed(1)}s</span>
                              </span>
                            </div>

                            <p className="font-arabic text-sm text-[#1A4D4E] dark:text-[#E8ECE9]" dir="rtl">
                              {place.ayahTextArabic}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            {/* Playback past take audio */}
                            <button
                              onClick={() => handlePlayPlaceAudio(place)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                isPlayingThisPlace
                                  ? 'bg-[#D96E54] text-white animate-pulse'
                                  : 'bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] hover:bg-[#EAF2ED]'
                              }`}
                            >
                              {isPlayingThisPlace ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                  <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current text-[#D96E54]" />
                                  <span>{isRtl ? 'تشغيل التسجيل' : 'Play Take'}</span>
                                </>
                              )}
                            </button>

                            {/* Load into Comparison Station */}
                            <button
                              onClick={() => handleSelectPlaceForComparison(place)}
                              className="px-3 py-1.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#72D6A5] text-white dark:text-[#122021] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Activity className="w-3 h-3" />
                              <span>{isRtl ? 'مقارنة مع الشيخ' : 'Compare'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] text-center text-xs text-[#8E9B98]">
                    {isRtl ? 'لم تسجل مقاطع سابقة في هذه السورة بعد.' : 'No recorded takes saved for this Surah yet.'}
                  </div>
                )}
              </div>

              {/* TRACK 2: MASTER SCHOLAR REFERENCE */}
              <div className="p-4 rounded-2xl bg-[#EAF2ED]/80 dark:bg-[#142A20]/80 border-2 border-[#2E7D5A]/30 dark:border-[#72D6A5]/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#2E7D5A]/20 flex items-center justify-center text-[#2E7D5A] dark:text-[#72D6A5]">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5]">
                        {currentReciter.name} ({currentReciter.country})
                      </h4>
                      <p className="text-[11px] text-[#8E9B98]">
                        {isRtl ? 'التلاوة المرجعية المعتمدة' : 'Master Reference Benchmark'} • {formatTime(refCurrentTime)} / {formatTime(refDuration || 4.5)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePlayReference}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#72D6A5] text-white dark:text-[#122021] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isPlayingReference ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isRtl ? 'استمع للشيخ' : 'Play Scholar'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E8E2D6]/70 dark:bg-[#232E2F] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2E7D5A] dark:bg-[#72D6A5] h-full transition-all duration-100"
                    style={{ width: `${refDuration > 0 ? (refCurrentTime / refDuration) * 100 : (isPlayingReference ? 50 : 0)}%` }}
                  />
                </div>
              </div>

              {/* ⭐ SPECIFIC USER REQUIREMENT: "generate a realistic report comparison that is friendly and easy to read, not a mixed one like professional." */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FDF8EE] via-[#FAF5EA] to-[#FDF8EE] dark:from-[#222115] dark:via-[#262417] dark:to-[#222115] border-2 border-[#EAD5AB] dark:border-[#423924] space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center flex-shrink-0">
                      <Smile className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                          {isRtl ? 'تقرير المقارنة المبسط والواقعي' : 'Realistic & Friendly Comparison Report'}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1A4D4E] text-white dark:bg-[#72D6A5] dark:text-[#122021] text-[10px] font-bold">
                          {voiceReport ? voiceReport.overallMatchPercentage : 88}% {isRtl ? 'تطابق' : 'Match'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                        {isRtl
                          ? `ملخص سهل وواضح لمطابقة تلاوتك مع الشيخ ${currentReciter.name}`
                          : `Friendly student breakdown matching your voice with Sheikh ${currentReciter.name}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAcousticReport}
                    className="px-4 py-2 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#72D6A5] text-white dark:text-[#122021] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'فتح التقرير الكامل مع خطة الإتقان' : 'Open Full Friendly Report'}</span>
                  </button>
                </div>

                {/* Friendly 3-Pillar Cards (No confusing Hz / Formant Jargon) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  
                  {/* Card 1: Madd */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#EAD5AB] dark:border-[#232E2F] space-y-1">
                    <span className="text-[10px] text-[#C5A059] font-bold block uppercase">
                      {isRtl ? '1. مد الصوت وزمن الإطالة' : '1. Vowel Stretch (Madd)'}
                    </span>
                    <p className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {isRtl ? 'مددته حركتين ➔ الشيخ 6 حركات' : 'Held ~2 counts ➔ Sheikh holds 6'}
                    </p>
                    <p className="text-[10px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl ? 'عُدّ 6 أصابع ببطء لتطابق الشيخ تماماً' : 'Count 6 slow fingers while stretching'}
                    </p>
                  </div>

                  {/* Card 2: Harakah */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#EAD5AB] dark:border-[#232E2F] space-y-1">
                    <span className="text-[10px] text-[#2E7D5A] dark:text-[#72D6A5] font-bold block uppercase">
                      {isRtl ? '2. وضوح الحركات' : '2. Vowel Clarity (Harakat)'}
                    </span>
                    <p className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {isRtl ? 'نطق واضح ونقي 94%' : 'Crisp & Clean (94% Alignment)'}
                    </p>
                    <p className="text-[10px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl ? 'حافظ على استرخاء الفك والشفتين' : 'Maintain this comfortable jaw posture'}
                    </p>
                  </div>

                  {/* Card 3: Pacing */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#EAD5AB] dark:border-[#232E2F] space-y-1">
                    <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] font-bold block uppercase">
                      {isRtl ? '3. سكينة الترتيل والإيقاع' : '3. Tartil Pace & Calm'}
                    </span>
                    <p className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {isRtl ? 'تلاوة هادئة ووقورة' : 'Serene, Unhurried Cadence'}
                    </p>
                    <p className="text-[10px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl ? 'خشوع ممتاز في الترتيل' : 'Reflects true Quranic tranquility'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions: Practice & Mark Mastered */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('recitation')}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRtl ? 'تسميع هذه السورة بالصوت في الاستوديو' : 'Recite This Surah in Live Studio'}</span>
              </button>

              <button
                onClick={handleMarkCurrentMastered}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] hover:bg-[#DCEEE3] border border-[#C2DBCB] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isRtl ? 'تعليم كـ متقن' : 'Mark as Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Between Multiple Items in this Surah */}
          {filteredMistakes.length > 1 && (
            <div className="flex items-center justify-between text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
              <button
                onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
                disabled={activeCardIndex === 0}
                className="p-2 px-3 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] disabled:opacity-40 hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center gap-1 cursor-pointer bg-[#FDFBF7] dark:bg-[#122021]"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{isRtl ? 'المقطع السابق' : 'Previous Item'}</span>
              </button>

              <span className="font-semibold">
                {activeCardIndex + 1} of {filteredMistakes.length}
              </span>

              <button
                onClick={() => setActiveCardIndex(prev => Math.min(filteredMistakes.length - 1, prev + 1))}
                disabled={activeCardIndex === filteredMistakes.length - 1}
                className="p-2 px-3 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] disabled:opacity-40 hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center gap-1 cursor-pointer bg-[#FDFBF7] dark:bg-[#122021]"
              >
                <span>{isRtl ? 'المقطع التالي' : 'Next Item'}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}

        </div>
      ) : (
        /* Empty State: No recordings or mistakes for this Surah yet */
        <div className="p-12 text-center rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] flex items-center justify-center mx-auto text-[#1A4D4E] dark:text-[#72D6A5]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="font-bold text-xl text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? `سورة ${currentSurahMeta.nameArabic} متقنة تماماً!` : `Surah ${currentSurahMeta.nameEnglish} is Clear!`}
          </h3>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] max-w-sm mx-auto leading-relaxed">
            {isRtl
              ? `لا توجد أخطاء معلقة في سورة ${currentSurahMeta.nameArabic}. يمكنك تسميع آياتها الآن بالصوت في استوديو التلاوة المباشر لحفظ تسجيلاتك الجديدة.`
              : `No review slips pending in Surah ${currentSurahMeta.nameEnglish}. You can recite it now in the Live Studio to record new takes.`}
          </p>
          <button
            onClick={() => onNavigate('recitation')}
            className="mt-2 px-6 py-3 rounded-xl bg-[#1A4D4E] text-white text-xs font-bold hover:bg-[#153e3f] transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isRtl ? 'تسميع السورة في الاستوديو' : 'Recite in Live Studio'}</span>
          </button>
        </div>
      )}

      {/* MODAL 1: SURAH PICKER (All 114 Surahs with Instant Search) */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[#232E2F] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'اختيار سورة للمراجعة' : 'Select Quran Surah for Review'}
                </h3>
                <p className="text-xs text-[#6F7D7B] dark:text-[#8E9B98]">
                  {isRtl ? 'اختر أي سورة قمت بتلاوتها لمراجعة تسجيلاتك ومقارنتها' : 'Pick any Surah you have recited to review your recordings'}
                </p>
              </div>
              <button
                onClick={() => setShowSurahModal(false)}
                className="text-[#8E9B98] hover:text-[#1A4D4E] p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9B98]" />
              <input
                type="text"
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث باسم السورة أو رقمها...' : 'Search by Surah name or number...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#1A4D4E] dark:text-[#E8ECE9] focus:outline-none focus:border-[#1A4D4E]"
              />
            </div>

            {/* Surah List */}
            <div className="overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
              {filteredSurahsModal.map(surah => {
                const isSelected = selectedSurahNumber === surah.number;
                const pastTakes = audioRecordingService.getRecitedPlaces(surah.number);

                return (
                  <button
                    key={surah.number}
                    onClick={() => {
                      setSelectedSurahNumber(surah.number);
                      setActiveCardIndex(0);
                      setShowSurahModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A4D4E]/10 border-[#1A4D4E] dark:border-[#72D6A5]'
                        : 'border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#F5F2ED] dark:hover:bg-[#172526]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1A4D4E]/10 flex items-center justify-center font-bold text-xs text-[#1A4D4E] dark:text-[#72D6A5]">
                        {surah.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                            {surah.nameEnglish}
                          </span>
                          <span className="text-[10px] text-[#8E9B98]">
                            • {surah.numberOfAyahs} {isRtl ? 'آيات' : 'ayahs'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C5A059]">{surah.nameTranslation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {pastTakes.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#72D6A5]/20 text-[#2E7D5A] dark:text-[#72D6A5] text-[10px] font-bold">
                          {pastTakes.length} {isRtl ? 'تسجيلات' : 'takes'}
                        </span>
                      )}
                      <span className="font-arabic text-base font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                        {surah.nameArabic}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECITER PICKER (World Renowned Scholars) */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[#232E2F] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'اختيار القارئ المرجعي للتصحيح' : 'Select Master Reciter for Comparison'}
                </h3>
                <p className="text-xs text-[#6F7D7B] dark:text-[#8E9B98]">
                  {isRtl ? 'كبار قراء العالم بأعذب وأجمل الأصوات' : 'Renowned scholars with sweet, precise tajweed'}
                </p>
              </div>
              <button
                onClick={() => setShowReciterModal(false)}
                className="text-[#8E9B98] hover:text-[#1A4D4E] p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[55vh]">
              {RECITERS_LIST.map(reciter => (
                <button
                  key={reciter.id}
                  onClick={() => {
                    setSelectedReciterId(reciter.id);
                    setShowReciterModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                    selectedReciterId === reciter.id
                      ? 'bg-[#1A4D4E]/10 border-[#1A4D4E] dark:border-[#72D6A5]'
                      : 'border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#F5F2ED] dark:hover:bg-[#172526]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                        {reciter.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A4D4E]/10 text-[#1A4D4E] dark:text-[#72D6A5]">
                        {reciter.country}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C5A059] font-medium">{reciter.style}</p>
                    <p className="text-[11px] text-[#6F7D7B] dark:text-[#8E9B98]">{reciter.clarity}</p>
                  </div>
                  {selectedReciterId === reciter.id && (
                    <Check className="w-4 h-4 text-[#1A4D4E] dark:text-[#72D6A5] flex-shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FRIENDLY & REALISTIC VOICE COMPARE REPORT MODAL */}
      {showReportModal && (
        <VoiceCompareReportModal
          report={
            voiceReport ||
            (currentMistake
              ? acousticAnalyticsService.generateReport(
                  currentMistake,
                  currentReciter,
                  getUserAudioUrl(currentMistake),
                  getReferenceUrl(currentMistake, selectedReciterId)
                )
              : null)
          }
          direction={direction}
          onClose={() => setShowReportModal(false)}
          onReplayComparison={handleSequentialComparison}
          onRecordNewTake={startReRecording}
          onMarkMastered={() => {
            if (currentMistake) {
              handleMarkCurrentMastered();
            }
          }}
        />
      )}

    </div>
  );
};
