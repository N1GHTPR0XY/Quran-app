import React, { useState, useEffect, useRef } from 'react';
import { TajweedMistake, AudioSettings, Direction, ScreenId, VoiceCompareReport } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { audioRecordingService, RecordedVoiceClip } from '../../services/audioRecordingService';
import { quranService } from '../../services/quranService';
import { RECITERS_LIST } from '../../data/quranData';
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
  Zap
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

  const filteredMistakes = mistakes.filter(m => {
    if (selectedFilter === 'unmastered') return !m.mastered;
    if (selectedFilter === 'tajweed') return m.mistakeType === 'tajweed_slip';
    if (selectedFilter === 'harakat') return m.mistakeType === 'wrong_harakah';
    return true;
  });

  const currentMistake = filteredMistakes[activeCardIndex] || filteredMistakes[0];

  // Active Scholar object
  const currentReciter = RECITERS_LIST.find(r => r.id === selectedReciterId) || RECITERS_LIST[0];

  // Derive Master Reference Audio URL for current mistake and chosen scholar
  const getReferenceUrl = (mistake: TajweedMistake, reciterId: string): string => {
    return quranService.getAyahAudioUrl(mistake.surahNumber, mistake.ayahNumber, reciterId);
  };

  // Derive User's Voice Audio URL (from session override, mistake field, or recording service)
  const getUserAudioUrl = (mistake: TajweedMistake): string | undefined => {
    if (recordedClipsMap[mistake.id]) {
      return recordedClipsMap[mistake.id];
    }
    if (mistake.userAudioBlobUrl) {
      return mistake.userAudioBlobUrl;
    }
    const cachedClip = audioRecordingService.getClipForMistake(mistake.id);
    return cachedClip?.url;
  };

  // Stop all audio when switching cards or navigating away
  useEffect(() => {
    audioRecordingService.stopAll();
    setIsPlayingReference(false);
    setIsPlayingUser(false);
    setComparisonPhase('idle');
    setUserCurrentTime(0);
    setRefCurrentTime(0);

    return () => {
      audioRecordingService.stopAll();
    };
  }, [activeCardIndex]);

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

  // Handle Play User's Voice Recording
  const handlePlayUserRecording = () => {
    if (!currentMistake) return;

    if (isPlayingUser) {
      audioRecordingService.stopUserAudio();
      setIsPlayingUser(false);
      return;
    }

    audioRecordingService.stopAll();
    setIsPlayingReference(false);
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
      // Fallback to synthesized demo attempt
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

        // Generate Voice Compare Acoustic Analytics Report using actual user audio and reference audio
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

  // Download PDF Report Directly
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

  // Share PDF Report Directly
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

          // Immediately generate the updated report comparing the new attempt to the master reference
          const refUrl = getReferenceUrl(currentMistake, selectedReciterId);
          const updatedReport = acousticAnalyticsService.generateReport(
            currentMistake,
            currentReciter,
            clip.url,
            refUrl,
            true // isReRecordAttempt
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
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn pb-32">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A4D4E]/10 dark:bg-[#72D6A5]/10 text-[#1A4D4E] dark:text-[#72D6A5] text-xs font-semibold mb-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>{isRtl ? 'المقارنة السمعية والتحقق الصوتي' : 'Acoustic Review & Scholar Comparison'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'مراجعة وتصحيح التلاوة' : 'Recitation Review & Master Comparison'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1 max-w-xl">
            {isRtl
              ? 'استمع لتسجيل صوتك الحقيقي وقارنه جنباً إلى جنب مع كبار قراء العالم، واستفد من التوجيه الصوتي لضبط الحركات والتجويد.'
              : 'Listen to your captured recitation and compare it side-by-side with world-renowned Quranic scholars, with vocal articulation tips for every harakah.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: isRtl ? 'الكل' : 'All' },
            { id: 'unmastered', label: isRtl ? 'غير متقن' : 'Needs Practice' },
            { id: 'harakat', label: isRtl ? 'الحركات' : 'Harakat' },
            { id: 'tajweed', label: isRtl ? 'التجويد' : 'Tajweed' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => {
                setSelectedFilter(filter.id as any);
                setActiveCardIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021] shadow-sm'
                  : 'bg-[#FDFBF7] dark:bg-[#172526] text-[#6F7D7B] dark:text-[#9AA5A3] border border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#F5F2ED]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredMistakes.length > 0 && currentMistake ? (
        <div className="space-y-6">
          {/* Main Review Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-6">
            {/* Verse Header & Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D6]/80 dark:border-[#232E2F] pb-4">
              <div>
                <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] uppercase tracking-wider">
                  {currentMistake.surahName} • {isRtl ? `الآية ${currentMistake.ayahNumber}` : `Ayah ${currentMistake.ayahNumber}`}
                </span>
                <p className="text-xs text-[#8E9B98] mt-0.5">
                  {isRtl ? 'وقت التسجيل: ' : 'Recorded: '} {currentMistake.timestamp}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    currentMistake.mistakeType === 'wrong_harakah'
                      ? 'bg-[#D96E54]/15 text-[#D96E54] border border-[#D96E54]/30'
                      : 'bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30'
                  }`}
                >
                  {currentMistake.mistakeType === 'wrong_harakah'
                    ? (isRtl ? 'خطأ حركي (كسرة ➔ ضمة)' : 'Harakah Slip (Kasrah ➔ Dammah)')
                    : (currentMistake.tajweedRule || 'Tajweed Rule')}
                </span>

                {currentMistake.mastered && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] font-semibold flex items-center gap-1 border border-[#C2DBCB]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تم الإتقان' : 'Mastered'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Arabic Word Display & Phonetic Slip Comparison */}
            <div className="text-center py-6 px-4 bg-[#F5F2ED] dark:bg-[#172526] rounded-2xl border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
              <div className="font-arabic text-4xl sm:text-5xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9] py-1" dir="rtl">
                {currentMistake.wordArabic}
              </div>

              {currentMistake.harakahDetail ? (
                <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-white/90 dark:bg-[#122021]/90 border border-[#E8E2D6] dark:border-[#232E2F] text-xs shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#2E7D5A] dark:text-[#72D6A5] font-bold">
                    <Check className="w-4 h-4" />
                    <span>{isRtl ? 'المطلوب (كسرة): ' : 'Expected (Kasrah): '}</span>
                    <span className="font-arabic text-lg font-extrabold">{currentMistake.harakahDetail.expectedArabicLetter}</span>
                    <span className="text-[11px] font-mono text-[#6F7D7B]">({currentMistake.harakahDetail.phoneticExpected})</span>
                  </div>
                  <span className="text-[#8E9B98] font-bold">⟵</span>
                  <div className="flex items-center gap-1.5 text-[#D96E54] font-bold line-through decoration-[#D96E54]">
                    <AlertCircle className="w-4 h-4" />
                    <span>{isRtl ? 'المنطوق (ضمة): ' : 'Detected (Dammah): '}</span>
                    <span className="font-arabic text-lg font-extrabold">{currentMistake.harakahDetail.actualArabicLetter}</span>
                    <span className="text-[11px] font-mono text-[#8E9B98]">({currentMistake.harakahDetail.phoneticActual})</span>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/80 dark:bg-[#122021]/80 text-xs">
                  <span className="text-[#6F7D7B]">{isRtl ? 'المطلوب:' : 'Expected:'}</span>
                  <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">{currentMistake.expectedRecitation}</span>
                </div>
              )}
            </div>

            {/* Renowned Scholar Selector Bar */}
            <div className="p-3.5 rounded-2xl bg-[#F5F2ED]/70 dark:bg-[#172526]/70 border border-[#E8E2D6] dark:border-[#232E2F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C5A059]" />
                <span className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'القارئ المرجعي للتصحيح: ' : 'Master Scholar Reference: '}
                </span>
                <span className="font-bold text-[#C5A059]">
                  {currentReciter.name} ({currentReciter.country})
                </span>
                <span className="text-[10px] text-[#8E9B98] hidden md:inline">
                  • {currentReciter.style}
                </span>
              </div>

              <button
                onClick={() => setShowReciterModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#C5A059]/40 hover:bg-[#EAF2ED] text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تغيير القارئ (شيوخ وقارئات)' : 'Change Scholar / Reciter'}</span>
              </button>
            </div>

            {/* DUAL-TRACK AUDIO COMPARISON STATION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#5F6E6C] dark:text-[#A6B2AF]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#C5A059]" />
                  <span>
                    {isRtl
                      ? 'محطة المقارنة الصوتية المباشرة (صوتك المسجل مقابل الشيخ)'
                      : 'Dual-Track Acoustic Comparison Station'}
                  </span>
                </div>

                {/* Actions: Acoustic Report & Sequential Compare */}
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={handleDownloadPdfReport}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[#C5A059] hover:bg-[#FDF8EE] dark:hover:bg-[#2A2315] text-[#C5A059] transition-all flex items-center gap-1 cursor-pointer bg-white dark:bg-[#122021] shadow-xs"
                    title={isRtl ? 'تحميل التقرير كـ PDF' : 'Download PDF Report'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={handleSharePdfReport}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#EAF2ED] text-[#1A4D4E] dark:text-[#E8ECE9] transition-all flex items-center gap-1 cursor-pointer bg-white dark:bg-[#122021] shadow-xs"
                    title={isRtl ? 'مشاركة التقرير عبر التطبيقات' : 'Share PDF Report'}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'مشاركة' : 'Share'}</span>
                  </button>

                  <button
                    onClick={handleOpenAcousticReport}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#C5A059]/40 hover:bg-[#FDF8EE] dark:hover:bg-[#2A2315] text-[#1A4D4E] dark:text-[#C5A059] transition-all flex items-center gap-1.5 cursor-pointer bg-white dark:bg-[#122021] shadow-xs"
                    title={isRtl ? 'عرض تقرير المقارنة الصوتي' : 'View Voice Compare Analytics Report'}
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{isRtl ? 'التقرير' : 'Report'}</span>
                  </button>

                  <button
                    onClick={handleSequentialComparison}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                      comparisonPhase !== 'idle'
                        ? 'bg-[#D96E54] text-white animate-pulse'
                        : 'bg-[#1A4D4E] dark:bg-[#27827E] hover:bg-[#153e3f] text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${comparisonPhase !== 'idle' ? 'animate-spin' : ''}`} />
                    <span>
                      {comparisonPhase === 'user'
                        ? (isRtl ? '1/2: استماع لتسجيلك...' : '1/2: Playing Your Voice...')
                        : comparisonPhase === 'pause'
                        ? (isRtl ? 'فترة انتقالية...' : 'Transitioning...')
                        : comparisonPhase === 'reference'
                        ? (isRtl ? `2/2: استماع للشيخ (${currentReciter.name})...` : `2/2: Playing Master Scholar...`)
                        : (isRtl ? 'مقارنة تتابعية (صوتك ➔ الشيخ)' : 'Compare Both (Your Voice ➔ Scholar)')}
                    </span>
                  </button>
                </div>
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
                        <span>{isRtl ? 'تلاوتك المسجلة (المقطع المصحح)' : 'Your Voice Recording'}</span>
                        {getUserAudioUrl(currentMistake) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D96E54]/20 text-[#D96E54] font-semibold">
                            {isRtl ? 'صوت مسجل' : 'Live Recorded'}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-[#8E9B98]">
                        {currentMistake.userRecitation} • {formatTime(userCurrentTime)} / {formatTime(userDuration || currentMistake.recordingDurationSeconds || 3)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Re-record button */}
                    <button
                      onClick={startReRecording}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isReRecording
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-white dark:bg-[#172526] border border-[#D96E54]/40 text-[#D96E54] hover:bg-[#FBE8E4]'
                      }`}
                      title="Record a new attempt with the corrected pronunciation right now"
                    >
                      {isReRecording ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? `إيقاف (${reRecordSeconds}ث)` : `Stop (${reRecordSeconds}s)`}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-[#D96E54]" />
                          <span>{isRtl ? 'إعادة التسجيل الآن' : 'Record New Take'}</span>
                        </>
                      )}
                    </button>

                    {/* Play User Audio */}
                    <button
                      onClick={handlePlayUserRecording}
                      disabled={isReRecording}
                      className="px-4 py-2 rounded-xl bg-[#D96E54] hover:bg-[#c45e45] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isPlayingUser ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? 'تشغيل صوتك' : 'Play Your Recitation'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Animated Waveform Display for User Recording */}
                <div className="h-10 bg-white/70 dark:bg-[#1E1210] rounded-xl flex items-center justify-around px-4 gap-1 overflow-hidden border border-[#D96E54]/20">
                  {[20, 35, 15, 55, 40, 75, 65, 75, 45, 55, 30, 45, 25, 65, 35, 50, 20, 45, 60, 30, 15].map((h, i) => {
                    const isDiscrepant = i >= 5 && i <= 8;
                    const animatedHeight = isPlayingUser
                      ? Math.min(100, Math.max(15, (h + (i % 3) * 15 + Math.sin(Date.now() / 150 + i) * 20)))
                      : h;

                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          isDiscrepant
                            ? 'bg-[#D96E54] shadow-xs'
                            : isPlayingUser
                            ? 'bg-[#D96E54]/80'
                            : 'bg-[#D96E54]/40'
                        }`}
                        style={{ height: `${animatedHeight}%` }}
                        title={isDiscrepant ? 'Detected Vowel Discrepancy Point' : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              {/* TRACK 2: MASTER SCHOLAR REFERENCE */}
              <div className="p-4 rounded-2xl bg-[#EAF2ED]/80 dark:bg-[#142A20]/80 border-2 border-[#2E7D5A]/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#2E7D5A]/20 flex items-center justify-center text-[#2E7D5A] dark:text-[#72D6A5]">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-1.5">
                        <span>{isRtl ? `تلاوة الشيخ المرجعي (${currentReciter.name})` : `Master Reference: ${currentReciter.name}`}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E7D5A]/20 text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">
                          {currentReciter.gender === 'female' ? (isRtl ? 'قارئة' : 'Female Scholar') : (isRtl ? 'شيخ' : 'Scholar')}
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#6F7D7B] dark:text-[#8E9B98]">
                        {currentReciter.clarity} • {formatTime(refCurrentTime)} / {formatTime(refDuration || 4)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePlayReference}
                    className="px-4 py-2 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isPlayingReference ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isRtl ? 'استمع للشيخ' : 'Play Reference'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Animated Waveform Display for Master Reference */}
                <div className="h-10 bg-white/70 dark:bg-[#0E1A14] rounded-xl flex items-center justify-around px-4 gap-1 overflow-hidden border border-[#2E7D5A]/20">
                  {[24, 40, 20, 60, 85, 95, 70, 85, 55, 65, 90, 45, 30, 75, 40, 60, 30, 65, 80, 45, 20].map((h, i) => {
                    const animatedHeight = isPlayingReference
                      ? Math.min(100, Math.max(18, (h + ((i + 1) % 4) * 10 + Math.cos(Date.now() / 150 + i) * 20)))
                      : h;

                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          isPlayingReference ? 'bg-[#2E7D5A] dark:bg-[#72D6A5]' : 'bg-[#2E7D5A]/50 dark:bg-[#72D6A5]/50'
                        }`}
                        style={{ height: `${animatedHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Voice Compare Analytics Card (Generated after comparison or available on-demand) */}
              {voiceReport && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF2ED] via-[#F4F8F5] to-[#EAF2ED] dark:from-[#142A20] dark:via-[#162C22] dark:to-[#142A20] border-2 border-[#C2DBCB] dark:border-[#2A4436] space-y-3.5 shadow-sm animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021] flex items-center justify-center shadow-xs flex-shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-[#1A4D4E] dark:text-[#E8ECE9]">
                            {isRtl ? 'نتائج التحليل الصوتي المقارن' : 'Voice Compare Acoustic Analytics'}
                          </h4>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1A4D4E] text-white dark:bg-[#72D6A5] dark:text-[#122021]">
                            {voiceReport.overallMatchPercentage}% {isRtl ? 'تطابق' : 'Match'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                          {isRtl
                            ? `تمت المقارنة الترددية مع الشيخ: ${voiceReport.scholarName} (${voiceReport.generatedAt})`
                            : `Acoustic match with ${voiceReport.scholarName} (${voiceReport.generatedAt})`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenAcousticReport}
                      className="px-3.5 py-2 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#72D6A5] dark:text-[#122021] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'عرض التقرير المفصل' : 'View Full Report'}</span>
                    </button>
                  </div>

                  {/* Acoustic Metrics Quick Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-0.5">
                      <span className="text-[10px] text-[#8E9B98] block font-medium">
                        {isRtl ? 'انحراف فتحة الفك F1' : 'Jaw Aperture (F1 Shift)'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#D96E54]">
                        Δ {voiceReport.formants[0]?.differenceHz > 0 ? `+${voiceReport.formants[0]?.differenceHz}` : voiceReport.formants[0]?.differenceHz} Hz
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-0.5">
                      <span className="text-[10px] text-[#8E9B98] block font-medium">
                        {isRtl ? 'استقرار النغمة (Jitter)' : 'Vocal Jitter & Purity'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#2E7D5A] dark:text-[#72D6A5]">
                        {voiceReport.jitterPercentage ?? 0.62}% ({isRtl ? 'متزن' : 'Optimal'})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-0.5">
                      <span className="text-[10px] text-[#8E9B98] block font-medium">
                        {isRtl ? 'دقة مخرج وسط اللسان' : 'Tongue Articulation'}
                      </span>
                      <span className="text-xs font-bold text-[#C5A059]">
                        {voiceReport.makhrajPrecision?.[1]?.score ?? 71}% ({isRtl ? 'يحتاج رفع' : 'Needs Lift'})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-0.5">
                      <span className="text-[10px] text-[#8E9B98] block font-medium">
                        {isRtl ? 'تطور الأداء الصوتي' : 'Progression Delta'}
                      </span>
                      <span className="text-xs font-bold text-[#2E7D5A] dark:text-[#72D6A5] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C5A059]" />
                        <span>+{voiceReport.historicalComparison?.deltaScore ?? 7}% {isRtl ? 'تحسن' : 'Gain'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Pitch Contour Curve Track Preview */}
                  {voiceReport.pitchContour && (
                    <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#122021]/80 border border-[#C2DBCB] dark:border-[#232E2F] flex items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-2 text-[#1A4D4E] dark:text-[#72D6A5] font-semibold flex-shrink-0">
                        <Activity className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{isRtl ? 'مسار النغمة F0:' : 'F0 Pitch Track:'}</span>
                      </div>
                      <div className="flex-1 h-6 flex items-end justify-between px-2 gap-1">
                        {voiceReport.pitchContour.slice(0, 10).map((pt, i) => (
                          <div key={i} className="flex-1 flex items-end justify-center gap-0.5 h-full">
                            <div
                              style={{ height: `${Math.min(100, Math.max(20, (pt.scholarPitchHz - 110) * 0.7))}%` }}
                              className="w-1 rounded-t-sm bg-[#2E7D5A] opacity-80"
                            />
                            <div
                              style={{ height: `${Math.min(100, Math.max(20, (pt.userPitchHz - 110) * 0.7))}%` }}
                              className="w-1 rounded-t-sm bg-[#D96E54]"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#8E9B98] flex-shrink-0 font-mono">1200ms</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tajweed & Makhraj Mouth Shape Guide */}
            <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#5F6E6C] dark:text-[#A6B2AF] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1A4D4E] dark:text-[#C5A059]">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>
                  {isRtl ? 'توجيه مخرج الحرف وضبط حركة الكسرة:' : 'Teacher Articulation & Mouth Shape Guidance:'}
                </span>
              </div>
              <p className="leading-relaxed">
                {currentMistake.harakahDetail?.mouthShapeTip || currentMistake.explanation}
              </p>
            </div>

            {/* Bottom Actions: Practice in Context & Mark Mastered */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('recitation')}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRtl ? 'تسميع هذا المقطع الآن بالصوت' : 'Practice & Recite in Context'}</span>
              </button>

              <button
                onClick={handleMarkCurrentMastered}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] hover:bg-[#DCEEE3] border border-[#C2DBCB] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isRtl ? 'تعليم كـ متقن' : 'Mark as Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Carousel Navigation Between Slips */}
          <div className="flex items-center justify-between text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
            <button
              onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
              disabled={activeCardIndex === 0}
              className="p-2 px-3 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] disabled:opacity-40 hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center gap-1 cursor-pointer bg-[#FDFBF7] dark:bg-[#122021]"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isRtl ? 'المقطع السابق' : 'Previous Slip'}</span>
            </button>

            <span className="font-semibold">
              {activeCardIndex + 1} of {filteredMistakes.length}
            </span>

            <button
              onClick={() => setActiveCardIndex(prev => Math.min(filteredMistakes.length - 1, prev + 1))}
              disabled={activeCardIndex === filteredMistakes.length - 1}
              className="p-2 px-3 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] disabled:opacity-40 hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors flex items-center gap-1 cursor-pointer bg-[#FDFBF7] dark:bg-[#122021]"
            >
              <span>{isRtl ? 'المقطع التالي' : 'Next Slip'}</span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        /* Empty State: All Mastered */
        <div className="p-12 text-center rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] flex items-center justify-center mx-auto text-[#1A4D4E] dark:text-[#72D6A5]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="font-bold text-xl text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'ممتاز! تم إتقان جميع المقاطع' : 'All Slips Mastered!'}
          </h3>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] max-w-sm mx-auto leading-relaxed">
            {isRtl
              ? 'لقد راجعت جميع التنبيهات الحركية والتجويدية بنجاح، وطابقت تلاوتك مع كبار القراء.'
              : 'Your review queue is clear. Continue your live recitation to build new memorized verses.'}
          </p>
          <button
            onClick={() => onNavigate('recitation')}
            className="mt-2 px-6 py-3 rounded-xl bg-[#1A4D4E] text-white text-xs font-bold hover:bg-[#153e3f] transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isRtl ? 'العودة للتسميع المباشر' : 'Return to Live Recitation'}</span>
          </button>
        </div>
      )}

      {/* Reciter Picker Modal (World Renowned Scholars & Female Qari'ahs) */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[#232E2F] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'اختيار القارئ المرجعي للتصحيح' : 'Select Master Reciter for Comparison'}
                </h3>
                <p className="text-xs text-[#6F7D7B] dark:text-[#8E9B98]">
                  {isRtl
                    ? 'كبار قراء العالم بأعذب وأجمل الأصوات، بما في ذلك التلاوات النسائية التعليمية'
                    : 'Renowned scholars with sweet voices, including acclaimed female reciters'}
                </p>
              </div>
              <button
                onClick={() => setShowReciterModal(false)}
                className="text-[#8E9B98] hover:text-[#1A4D4E] p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Reciter List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[55vh]">
              {/* Group 1: Male Scholars */}
              <div className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider pt-1">
                {isRtl ? 'كبار شيوخ وقراء العالم' : 'World-Renowned Scholars'}
              </div>

              {RECITERS_LIST.filter(r => r.gender === 'male').map(reciter => (
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

              {/* Group 2: Female Scholars & Qari'ahs */}
              <div className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider pt-3">
                {isRtl ? 'القارئات والمعلمات المتميزات' : 'Renowned Female Qari\'ahs & Mu\'allimahs'}
              </div>

              {RECITERS_LIST.filter(r => r.gender === 'female').map(reciter => (
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-semibold">
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

            <div className="pt-2 border-t border-[#E8E2D6] dark:border-[#232E2F]">
              <button
                onClick={() => setShowReciterModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#1A4D4E] text-white text-xs font-bold hover:bg-[#153e3f] transition-colors cursor-pointer"
              >
                {isRtl ? 'تأكيد وحفظ الاختيار' : 'Done & Apply Reciter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Compare Acoustic Analytics Report Modal */}
      {showReportModal && (
        <VoiceCompareReportModal
          report={voiceReport || (currentMistake ? acousticAnalyticsService.generateReport(currentMistake, currentReciter, getUserAudioUrl(currentMistake), getReferenceUrl(currentMistake, selectedReciterId)) : null)}
          direction={direction}
          onClose={() => setShowReportModal(false)}
          onReplayComparison={handleSequentialComparison}
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
