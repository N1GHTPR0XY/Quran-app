import React, { useState, useEffect, useRef } from 'react';
import { VoiceCompareReport, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { audioRecordingService } from '../../services/audioRecordingService';
import { pdfReportService } from '../../services/pdfReportService';
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Trophy,
  Check,
  Info,
  Mic,
  Smile,
  Heart,
  BookOpen,
  ArrowRight,
  FileText
} from 'lucide-react';

interface VoiceCompareReportModalProps {
  report: VoiceCompareReport | null;
  direction: Direction;
  onClose: () => void;
  onReplayComparison?: () => void;
  onMarkMastered?: () => void;
  onRecordNewTake?: () => void;
}

export const VoiceCompareReportModal: React.FC<VoiceCompareReportModalProps> = ({
  report,
  direction,
  onClose,
  onReplayComparison,
  onMarkMastered,
  onRecordNewTake
}) => {
  if (!report) return null;

  const isRtl = direction === 'rtl';
  // Default tab is 'friendly' for realistic, friendly, easy-to-read report
  const [activeTab, setActiveTab] = useState<'friendly' | 'detailed'>('friendly');
  
  // Audio playback state inside modal
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
  const [isPlayingScholar, setIsPlayingScholar] = useState<boolean>(false);
  const [isComparingSequence, setIsComparingSequence] = useState<boolean>(false);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [scholarProgress, setScholarProgress] = useState<number>(0);

  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Stop audios on unmount
  useEffect(() => {
    return () => {
      audioRecordingService.stopAll();
    };
  }, []);

  const handlePlayUserAudio = () => {
    if (isPlayingUser) {
      audioRecordingService.stopUserAudio();
      setIsPlayingUser(false);
      return;
    }
    audioRecordingService.stopAll();
    setIsPlayingScholar(false);
    setIsComparingSequence(false);
    setIsPlayingUser(true);

    const audioUrl = report.userAudioUrl || '';
    audioRecordingService.playUserAudio(
      audioUrl,
      (curr, dur) => {
        setUserProgress(dur > 0 ? (curr / dur) * 100 : 0);
      },
      () => {
        setIsPlayingUser(false);
        setUserProgress(0);
      }
    );
  };

  const handlePlayScholarAudio = () => {
    if (isPlayingScholar) {
      audioRecordingService.stopReferenceAudio();
      setIsPlayingScholar(false);
      return;
    }
    audioRecordingService.stopAll();
    setIsPlayingUser(false);
    setIsComparingSequence(false);
    setIsPlayingScholar(true);

    const refUrl = report.referenceAudioUrl || 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3';
    audioRecordingService.playReferenceAudio(
      refUrl,
      (curr, dur) => {
        setScholarProgress(dur > 0 ? (curr / dur) * 100 : 0);
      },
      () => {
        setIsPlayingScholar(false);
        setScholarProgress(0);
      }
    );
  };

  const handleSequentialCompare = () => {
    if (isComparingSequence) {
      audioRecordingService.stopAll();
      setIsComparingSequence(false);
      setIsPlayingUser(false);
      setIsPlayingScholar(false);
      return;
    }

    audioRecordingService.stopAll();
    setIsComparingSequence(true);
    setIsPlayingUser(true);
    setIsPlayingScholar(false);

    const userUrl = report.userAudioUrl || '';
    const refUrl = report.referenceAudioUrl || 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3';

    // Step 1: play user audio
    audioRecordingService.playUserAudio(
      userUrl,
      (curr, dur) => {
        setUserProgress(dur > 0 ? (curr / dur) * 100 : 0);
      },
      () => {
        setIsPlayingUser(false);
        setUserProgress(0);
        // Step 2: brief transition pause
        setTimeout(() => {
          if (!isComparingSequence) return;
          setIsPlayingScholar(true);
          audioRecordingService.playReferenceAudio(
            refUrl,
            (curr, dur) => {
              setScholarProgress(dur > 0 ? (curr / dur) * 100 : 0);
            },
            () => {
              setIsPlayingScholar(false);
              setScholarProgress(0);
              setIsComparingSequence(false);
              audioEngine.playSuccessChime();
            }
          );
        }, 700);
      }
    );
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      pdfReportService.downloadReport(report);
      audioEngine.playSuccessChime();
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSharePdf = async () => {
    setIsExportingPdf(true);
    try {
      await pdfReportService.shareReport(report);
      audioEngine.playSuccessChime();
    } catch (e) {
      console.error('Failed to share PDF:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShareSummary = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(
          `Tadreeb Recitation Report: ${report.wordArabic} (${report.ayahReference}) with ${report.scholarName}: ${report.overallMatchPercentage}% match!`
        )
        .catch(() => {});
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Friendly verdict and badge determination
  const score = report.overallMatchPercentage;
  const isMastered = score >= 90;
  const isAlmostThere = score >= 75 && score < 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1A4D4E] via-[#235657] to-[#163f40] text-white flex-shrink-0 relative overflow-hidden">
          {/* Subtle Background Calligraphy */}
          <div
            className="absolute -bottom-8 -right-8 font-arabic text-8xl text-white/5 select-none pointer-events-none"
            dir="rtl"
          >
            ورتل
          </div>

          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#72D6A5] text-xs font-semibold backdrop-blur-xs">
                <Smile className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تقرير المقارنة المبسط والواضح' : 'Friendly Recitation Comparison Report'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span className="font-arabic">{report.wordArabic}</span>
                <span className="text-sm font-normal text-white/80">({report.ayahReference})</span>
              </h2>
              <p className="text-xs text-white/80">
                {isRtl
                  ? `مقارنة مباشرة وسهلة مع تلاوة الشيخ: ${report.scholarName}`
                  : `Side-by-side friendly comparison with Sheikh: ${report.scholarName}`}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Friendly Score Banner in Header */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-black text-2xl text-[#72D6A5] border border-white/20">
                {score}%
              </div>
              <div>
                <span className="text-xs text-white/70 block">
                  {isRtl ? 'نسبة التطابق مع الشيخ' : 'Overall Match with Master'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-extrabold text-white">
                    {isMastered
                      ? (isRtl ? '🌟 تلاوة متقنة ورائعة!' : '🌟 Mastered & Spot-on!')
                      : isAlmostThere
                      ? (isRtl ? '✨ ممتازة - تعديل بسيط جداً!' : '✨ Excellent - 1 Easy Adjustment!')
                      : (isRtl ? '🌱 محاولة طيبة وخطوات سهلة للإتقان' : '🌱 Great Effort - 3 Simple Steps')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs text-white/90 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#C5A059]" />
                <span className="font-bold">+{score >= 80 ? 50 : 25} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher: Friendly Student View (Default) vs Detailed Sound Data */}
        <div className="flex items-center justify-between p-2.5 bg-[#F5F2ED] dark:bg-[#172526] border-b border-[#E8E2D6] dark:border-[#232E2F] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('friendly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'friendly'
                  ? 'bg-white dark:bg-[#122021] text-[#1A4D4E] dark:text-[#72D6A5] shadow-xs'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              <Smile className="w-4 h-4 text-[#C5A059]" />
              <span>{isRtl ? 'التقرير المبسط (سهل ومباشر)' : 'Friendly Student Report (Easy to Read)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'detailed'
                  ? 'bg-white dark:bg-[#122021] text-[#1A4D4E] dark:text-[#72D6A5] shadow-xs'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#8E9B98]" />
              <span>{isRtl ? 'البيانات الصوتية الفنية' : 'Detailed Sound Data'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="p-2 rounded-xl text-[#1A4D4E] dark:text-[#C5A059] hover:bg-white/60 dark:hover:bg-[#122021] transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
              title={isRtl ? 'تحميل PDF' : 'Download PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={handleShareSummary}
              className="p-2 rounded-xl text-[#1A4D4E] dark:text-[#E8ECE9] hover:bg-white/60 dark:hover:bg-[#122021] transition-colors cursor-pointer"
              title={isRtl ? 'نسخ الملخص' : 'Copy Summary'}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* TAB 1: FRIENDLY STUDENT REPORT (DEFAULT) */}
          {activeTab === 'friendly' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 1. Warm Spiritual Encouragement Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EAF2ED] to-[#F5FAF7] dark:from-[#142A20] dark:to-[#172526] border border-[#C2DBCB] dark:border-[#28503E] space-y-2">
                <div className="flex items-center gap-2 text-[#1A4D4E] dark:text-[#72D6A5] font-bold text-sm">
                  <Heart className="w-4 h-4 text-[#D96E54] fill-current" />
                  <span>{isRtl ? 'ما شاء الله! تلاوة طيبة مباركة' : "Masha'Allah! Wonderful Recitation"}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#485654] dark:text-[#B6C2BF] leading-relaxed">
                  {isRtl
                    ? `تلاوتك واضحة وعذبة وبها سكينة طيبة. قمت بجهد مبارك في نطق الكلمات والحروف، ويتبقى فقط لمسة خفيفة لتصل إلى الإتقان الكامل المشابه لقراءة الشيخ ${report.scholarName}.`
                    : `Your recitation is clear, melodious, and spoken with wonderful calmness. You gave a beautiful effort on "${report.wordArabic}", with just one gentle touch needed to match Sheikh ${report.scholarName}'s benchmark!`}
                </p>
              </div>

              {/* 2. Interactive Audio Playback Station */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#C5A059]" />
                    <span>{isRtl ? 'استمع وقارن صوتك مباشرة' : 'Listen & Compare Your Audio'}</span>
                  </h4>

                  {/* Sequential Comparison Button */}
                  <button
                    onClick={handleSequentialCompare}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isComparingSequence
                        ? 'bg-[#D96E54] text-white animate-pulse'
                        : 'bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021] hover:opacity-90'
                    }`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isComparingSequence ? 'animate-spin' : ''}`} />
                    <span>
                      {isComparingSequence
                        ? (isRtl ? 'جارِ المقارنة التتابعية...' : 'Comparing Back-to-Back...')
                        : (isRtl ? 'استماع متتابع (صوتك ➔ الشيخ)' : 'Compare Both Back-to-Back')}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* User Voice Audio Card */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${
                    isPlayingUser
                      ? 'bg-[#FDF2F0] dark:bg-[#2A1715] border-[#D96E54] shadow-sm'
                      : 'bg-white dark:bg-[#122021] border-[#E8E2D6] dark:border-[#232E2F]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#D96E54]/15 flex items-center justify-center text-[#D96E54]">
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-[#D96E54]">
                          {isRtl ? 'صوتك المسجل' : 'Your Recorded Voice'}
                        </span>
                      </div>

                      <button
                        onClick={handlePlayUserAudio}
                        className="px-3 py-1 rounded-xl bg-[#D96E54] hover:bg-[#c45e45] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isPlayingUser ? (
                          <>
                            <Pause className="w-3 h-3 fill-current" />
                            <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isRtl ? 'تشغيل' : 'Play'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="w-full bg-[#E8E2D6]/60 dark:bg-[#232E2F] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D96E54] h-full transition-all duration-100"
                        style={{ width: `${userProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#8E9B98] mt-1.5 block">
                      {isRtl ? 'تسجيلك للآية في هذه الجلسة' : 'Your recitation take for this verse'}
                    </span>
                  </div>

                  {/* Master Scholar Audio Card */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${
                    isPlayingScholar
                      ? 'bg-[#EAF2ED] dark:bg-[#142A20] border-[#2E7D5A] dark:border-[#72D6A5] shadow-sm'
                      : 'bg-white dark:bg-[#122021] border-[#E8E2D6] dark:border-[#232E2F]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#2E7D5A]/15 flex items-center justify-center text-[#2E7D5A] dark:text-[#72D6A5]">
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#72D6A5]">
                          {report.scholarName}
                        </span>
                      </div>

                      <button
                        onClick={handlePlayScholarAudio}
                        className="px-3 py-1 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#72D6A5] text-white dark:text-[#122021] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isPlayingScholar ? (
                          <>
                            <Pause className="w-3 h-3 fill-current" />
                            <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isRtl ? 'استمع للشيخ' : 'Play Scholar'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="w-full bg-[#E8E2D6]/60 dark:bg-[#232E2F] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2E7D5A] dark:bg-[#72D6A5] h-full transition-all duration-100"
                        style={{ width: `${scholarProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#8E9B98] mt-1.5 block">
                      {isRtl ? 'التلاوة المرجعية المعتمدة للتصحيح' : 'Verified master recitation benchmark'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Realistic, Plain-Language Side-by-Side Comparison Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'المقارنة الواقعية خطوة بخطوة (بلغة سهلة ومباشرة)' : 'Realistic Side-by-Side Comparison (Plain & Simple)'}
                  </h4>
                  <span className="text-[10px] text-[#8E9B98]">
                    {isRtl ? 'بدون مصطلحات فيزيائية معقدة' : 'Friendly, no technical jargon'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  
                  {/* Item 1: Madd & Stretch */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#C5A059] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                        <span>{isRtl ? '1. مد الصوت وزمن الإطالة (المد)' : '1. Vowel Stretch & Duration (Madd)'}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold">
                        {isRtl ? 'يحتاج تمديد أكثر' : 'Extend Longer'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#FDF2F0]/80 dark:bg-[#2A1715]/80 border border-[#D96E54]/20 space-y-1">
                        <span className="text-[10px] text-[#D96E54] font-semibold block">
                          {isRtl ? 'صوتك المسجل:' : 'Your Voice:'}
                        </span>
                        <p className="text-xs text-[#485654] dark:text-[#E8ECE9]">
                          {isRtl ? 'مددت الصوت لمدة حركتين فقط (~2.5 ثانية).' : 'Extended for about 2 vowel counts (~2.5 seconds).'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#EAF2ED]/80 dark:bg-[#142A20]/80 border border-[#2E7D5A]/20 space-y-1">
                        <span className="text-[10px] text-[#2E7D5A] dark:text-[#72D6A5] font-semibold block">
                          {isRtl ? `الشيخ ${report.scholarName}:` : `Sheikh ${report.scholarName}:`}
                        </span>
                        <p className="text-xs text-[#485654] dark:text-[#E8ECE9]">
                          {isRtl ? 'مد الصوت 6 حركات كاملة وواضحة (~5.5 ثانية).' : 'Held for a full 6 vowel counts (~5.5 seconds).'}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FDF8EE] dark:bg-[#222115] border border-[#EAD5AB] text-[11px] text-[#7A6432] dark:text-[#D5B776] flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                      <span>
                        {isRtl
                          ? 'نصيحة الشيخ: صوّتك جميل جداً! فقط عند نطق «الضَّآلِّينَ» عُدّ بأصابعك ببطء من 1 إلى 6 أثناء المد لتطابق الشيخ تماماً.'
                          : 'Friendly Teacher Tip: You have a lovely voice! For "aḍ-ḍāllīn", simply count 1, 2, 3, 4, 5, 6 slowly on your fingers while holding the stretch.'}
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Harakah & Vowel Accuracy */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2E7D5A]" />
                        <span>{isRtl ? '2. وضوح الحركات (الفتحة، الكسرة، الضمة)' : '2. Vowel Accuracy & Harakat'}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] text-[#2E7D5A] dark:text-[#72D6A5] font-bold">
                        {isRtl ? 'ممتاز ومتطابق' : 'Great Match'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] space-y-1">
                        <span className="text-[10px] text-[#6F7D7B] font-semibold block">
                          {isRtl ? 'صوتك:' : 'Your Pronunciation:'}
                        </span>
                        <p className="text-xs text-[#485654] dark:text-[#E8ECE9]">
                          {isRtl ? 'نطقت الكسرة والفتحة بوضوح وبفتحة فم مريحة.' : 'Crisp vowels with comfortable mouth opening.'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] space-y-1">
                        <span className="text-[10px] text-[#6F7D7B] font-semibold block">
                          {isRtl ? 'الشيخ:' : 'Master Benchmark:'}
                        </span>
                        <p className="text-xs text-[#485654] dark:text-[#E8ECE9]">
                          {isRtl ? 'تطابق بنسبة 94% في رنين الحركات.' : '94% alignment in vowel resonance.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#EAF2ED]/70 dark:bg-[#142A20]/70 border border-[#C2DBCB] text-[11px] text-[#2E7D5A] dark:text-[#72D6A5] flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        {isRtl
                          ? 'نصيحة الشيخ: ممتاز! حافظ على هذه الوضعية المريحة للفك والشفتين في باقي الآيات.'
                          : 'Teacher Tip: Excellent! Keep this natural mouth and jaw posture across your other verses.'}
                      </span>
                    </div>
                  </div>

                  {/* Item 3: Letter Articulation (Makhraj) & Heaviness */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#C5A059] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                        <span>{isRtl ? '3. مخرج الحروف وتفخيم الحرف الثقيل (الضاد)' : '3. Letter Articulation & Heaviness (Dhad)'}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold">
                        {isRtl ? 'ملحوظة خفيفة' : 'Gentle Note'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] text-xs text-[#485654] dark:text-[#E8ECE9] leading-relaxed">
                      {isRtl
                        ? 'حرف الضاد (ض) حرف مفخم يخرج من حافة اللسان مع الأضراس العليا. نطقت الحرف بقوة جيدة، فقط تجنب الضغط الزائد من الحلق حتى يخرج رخامياً عذباً كما قرأه الشيخ.'
                        : 'The letter Dhad (ض) is articulated by placing the side of your tongue against your upper molars. You gave it good fullness; just keep your throat relaxed so it stays soft and melodic like the Sheikh.'}
                    </div>
                  </div>

                  {/* Item 4: Calm Pacing & Reverence (Tartil) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2E7D5A]" />
                        <span>{isRtl ? '4. هدوء التلاوة وخشوع الترتيل' : '4. Reverent Calm & Tartil Pace'}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] text-[#2E7D5A] dark:text-[#72D6A5] font-bold">
                        {isRtl ? 'سكينة واضحة' : 'Serene Pace'}
                      </span>
                    </div>
                    <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl
                        ? 'سرعة تلاوتك غير مستعجلة، ونَفَسك هادئ، مما يعطي التلاوة وقاراً وخشوعاً مباركاً.'
                        : 'Your recitation is unhurried and steady, giving your reading true spiritual tranquility and poise.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Realistic 3-Step Action Plan for Next Take */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF2ED]/60 dark:bg-[#142A20]/60 border border-[#C2DBCB] dark:border-[#28503E] space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5A]" />
                  <span>{isRtl ? 'خطتك البسيطة في 3 خطوات للتسجيل القادم:' : 'Your Simple 3-Step Plan for Your Next Take:'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-1">
                    <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5] block">
                      1. {isRtl ? 'استمع للمد' : 'Listen Once'}
                    </span>
                    <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl ? 'شغّل صوت الشيخ أعلاه وركّز على طول المد في آخر الكلمة.' : "Play the Sheikh's clip and notice the 6-count stretch."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-1">
                    <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5] block">
                      2. {isRtl ? 'عُدّ بأصابعك' : 'Count 6 Fingers'}
                    </span>
                    <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl ? 'حرّك 6 أصابع ببطء وأنت تقول «الضَّآلِّينَ» بهدوء.' : 'Slowly tap 6 fingers while stretching the vowel.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#C2DBCB] dark:border-[#232E2F] space-y-1">
                    <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5] block">
                      3. {isRtl ? 'سجّل مرة أخرى' : 'Record New Take'}
                    </span>
                    <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                      {isRtl ? 'اضغط «تسجيل مقطع جديد» وستشاهد نتيجتك ترتفع فوراً!' : 'Press "Record New Take" and see your score hit 95%+!'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED SOUND DATA (OPTIONAL ADVANCED VIEW) */}
          {activeTab === 'detailed' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#C5A059]" />
                    <span>{isRtl ? 'منحنى النغمة وتردد الصوت (F0 Contour)' : 'F0 Pitch Trajectory & Melodic Intonation'}</span>
                  </h4>
                  <p className="text-[11px] text-[#8E9B98] mt-0.5">
                    {isRtl ? 'تتبع التردد الأساسي بالهرتز عبر توقيت الآية' : 'Acoustic pitch tracking in Hertz (Hz) over time'}
                  </p>
                </div>

                <div className="h-28 w-full bg-white dark:bg-[#122021] rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] p-3 flex items-end justify-between gap-1">
                  {report.pitchContour?.map((pt, idx) => {
                    const maxHz = 260;
                    const minHz = 110;
                    const scholarH = Math.max(10, Math.min(100, ((pt.scholarPitchHz - minHz) / (maxHz - minHz)) * 100));
                    const userH = Math.max(10, Math.min(100, ((pt.userPitchHz - minHz) / (maxHz - minHz)) * 100));
                    return (
                      <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 h-20">
                        <div style={{ height: `${scholarH}%` }} className="w-1.5 rounded-t bg-[#2E7D5A] dark:bg-[#72D6A5]" />
                        <div style={{ height: `${userH}%` }} className="w-1.5 rounded-t bg-[#D96E54]" />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D96E54]" />
                    {isRtl ? 'صوتك' : 'Your Pitch'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5A] dark:bg-[#72D6A5]" />
                    {isRtl ? 'الشيخ' : 'Scholar'}
                  </span>
                </div>
              </div>

              {/* Formants summary */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F]">
                  <span className="text-[10px] text-[#8E9B98] block uppercase">
                    {isRtl ? 'رنين الحركات F1' : 'Formant 1 Diff'}
                  </span>
                  <span className="text-lg font-bold font-mono text-[#D96E54]">
                    {report.formants[0]?.differenceHz > 0 ? `+${report.formants[0]?.differenceHz}` : report.formants[0]?.differenceHz} Hz
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F]">
                  <span className="text-[10px] text-[#8E9B98] block uppercase">
                    {isRtl ? 'نقاء النغمة (Jitter)' : 'Vocal Jitter'}
                  </span>
                  <span className="text-lg font-bold font-mono text-[#2E7D5A] dark:text-[#72D6A5]">
                    {report.jitterPercentage ?? 0.62}%
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#122021] border-t border-[#E8E2D6] dark:border-[#232E2F] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onRecordNewTake && (
              <button
                onClick={() => {
                  onClose();
                  onRecordNewTake();
                }}
                className="px-4 py-2 rounded-xl bg-[#D96E54] hover:bg-[#c45e45] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto shadow-xs"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تسجيل مقطع جديد الآن' : 'Record New Take Now'}</span>
              </button>
            )}

            {onReplayComparison && (
              <button
                onClick={onReplayComparison}
                className="px-3 py-2 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] font-semibold text-xs hover:bg-[#EAF2ED] transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إعادة المقارنة' : 'Replay A/B'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onMarkMastered && (
              <button
                onClick={() => {
                  onMarkMastered();
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] font-bold text-xs hover:bg-[#DCEEE3] border border-[#C2DBCB] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isRtl ? 'تعليم كـ متقن' : 'Mark as Mastered'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm text-center"
            >
              {isRtl ? 'تم وقراءة التقرير' : 'Done & Continue Practice'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
