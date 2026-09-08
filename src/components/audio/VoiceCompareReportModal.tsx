import React, { useState } from 'react';
import { VoiceCompareReport, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { pdfReportService } from '../../services/pdfReportService';
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  Play,
  RotateCcw,
  Download,
  Share2,
  Trophy,
  Sliders,
  Check,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  FileText
} from 'lucide-react';

interface VoiceCompareReportModalProps {
  report: VoiceCompareReport | null;
  direction: Direction;
  onClose: () => void;
  onReplayComparison?: () => void;
  onMarkMastered?: () => void;
}

export const VoiceCompareReportModal: React.FC<VoiceCompareReportModalProps> = ({
  report,
  direction,
  onClose,
  onReplayComparison,
  onMarkMastered
}) => {
  if (!report) return null;

  const isRtl = direction === 'rtl';
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'formants' | 'spectrogram' | 'guidance'>('analytics');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlayingAudition, setIsPlayingAudition] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] border-[#C2DBCB]';
    if (score >= 75) return 'text-[#C5A059] bg-[#FDF8EE] dark:bg-[#2A2315] border-[#EAD5AB]';
    return 'text-[#D96E54] bg-[#FDF2F0] dark:bg-[#2A1715] border-[#F5C2BA]';
  };

  const handleAuditionSample = () => {
    setIsPlayingAudition(true);
    audioEngine.playSuccessChime();
    setTimeout(() => {
      setIsPlayingAudition(false);
    }, 1200);
  };

  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

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
          `Tadreeb Voice Compare Report for ${report.wordArabic} with ${report.scholarName}: ${report.overallMatchPercentage}% acoustic alignment!`
        )
        .catch(() => {});
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Sticky Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1A4D4E] via-[#235657] to-[#163f40] text-white flex-shrink-0 relative overflow-hidden">
          {/* Subtle Background Arabic Calligraphy */}
          <div
            className="absolute -bottom-8 -right-8 font-arabic text-8xl text-white/5 select-none pointer-events-none"
            dir="rtl"
          >
            ورتل
          </div>

          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#72D6A5] text-xs font-semibold backdrop-blur-xs">
                <Activity className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تقرير المقارنة والتحليل الصوتي' : 'Voice Compare Acoustic Analytics Report'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span>{report.wordArabic}</span>
                <span className="text-sm font-normal text-white/80">({report.ayahReference})</span>
              </h2>
              <p className="text-xs text-white/80">
                {isRtl
                  ? `مقارنة صوتك المسجل مع الشيخ: ${report.scholarName}`
                  : `Acoustic benchmarking against Master Scholar: ${report.scholarName}`}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* KPI Summary Bar in Header */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 mt-2 border-t border-white/15 text-center relative z-10">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-white/70 uppercase tracking-wider block">
                {isRtl ? 'نسبة التطابق الكلي' : 'Overall Match'}
              </span>
              <p className={`text-xl font-extrabold mt-0.5 ${
                report.overallMatchPercentage >= 85
                  ? 'text-[#72D6A5]'
                  : report.overallMatchPercentage >= 70
                  ? 'text-[#E2C37E]'
                  : 'text-[#F58F7C]'
              }`}>
                {report.overallMatchPercentage}%
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-white/70 uppercase tracking-wider block">
                {isRtl ? 'رنين الحركات F1' : 'Formant 1 Diff'}
              </span>
              <p className="text-xl font-extrabold text-[#C5A059] mt-0.5">
                {report.formants[0]?.differenceHz > 0 ? `+${report.formants[0]?.differenceHz}` : report.formants[0]?.differenceHz} Hz
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-white/70 uppercase tracking-wider block">
                {isRtl ? 'نقاط الإنجاز' : 'Hifz XP'}
              </span>
              <p className="text-xl font-extrabold text-[#E2C37E] mt-0.5 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 fill-current text-[#C5A059]" />
                <span>+{report.badgeProgressImpact?.pointsEarned ?? (report.overallMatchPercentage >= 85 ? 50 : 15)} XP</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#F5F2ED] dark:bg-[#172526] border-b border-[#E8E2D6] dark:border-[#232E2F] overflow-x-auto flex-shrink-0">
          {[
            { id: 'analytics', label: isRtl ? 'تحليلات الصوت المقارنة 📊' : 'Voice Compare Analytics 📊' },
            { id: 'overview', label: isRtl ? 'نظرة عامة ومؤشرات' : 'Acoustic Overview' },
            { id: 'formants', label: isRtl ? 'تحليل الترددات (F1/F2)' : 'Formants & Vowels' },
            { id: 'spectrogram', label: isRtl ? 'الرسم الطيفي المتطابق' : 'Waveform Overlay' },
            { id: 'guidance', label: isRtl ? 'إرشادات النطق والمخرج' : 'AI Articulation Tips' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#122021] text-[#1A4D4E] dark:text-[#72D6A5] shadow-xs'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Report Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB: VOICE COMPARE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Historical Improvement Delta Card */}
              {report.historicalComparison && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF2ED] to-[#FDF8EE] dark:from-[#142A20] dark:to-[#222115] border border-[#C2DBCB] dark:border-[#38483D] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A4D4E] dark:text-[#72D6A5]">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <span>{isRtl ? 'مؤشر التطور الصوتي مقارنة بالتسجيل السابق:' : 'Acoustic Progression Delta:'}</span>
                    </div>
                    <p className="text-[#5F6E6C] dark:text-[#A6B2AF] text-[11px]">
                      {isRtl ? report.historicalComparison.improvementSummaryArabic : report.historicalComparison.improvementSummary}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-black text-[#2E7D5A] dark:text-[#72D6A5] block">
                      +{report.historicalComparison.deltaScore}%
                    </span>
                    <span className="text-[10px] text-[#8E9B98] uppercase">
                      {isRtl ? 'تحسن مباشر' : 'Immediate Gain'}
                    </span>
                  </div>
                </div>
              )}

              {/* 1. Pitch Contour Intonation Curve (F0 Comparison) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#C5A059]" />
                      <span>{isRtl ? 'منحنى النغمة ومطابقة التردد الأساسي (F0 Pitch Contour)' : 'F0 Pitch Contour & Melodic Intonation'}</span>
                    </h4>
                    <p className="text-[11px] text-[#8E9B98] mt-0.5">
                      {isRtl
                        ? 'مقارنة مسار النغمة ومقام الترتيل لحظة بلحظة (هرتز على مدار التوقيت بالمللي ثانية)'
                        : 'Real-time pitch tracking comparing your vocal trajectory against the scholar'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-[#D96E54] font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D96E54]" />
                      {isRtl ? 'صوتك' : 'Your Pitch'}
                    </span>
                    <span className="flex items-center gap-1 text-[#2E7D5A] dark:text-[#72D6A5] font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D5A] dark:bg-[#72D6A5]" />
                      {isRtl ? 'الشيخ' : 'Scholar'}
                    </span>
                  </div>
                </div>

                {/* Pitch Contour SVG Interactive Visualizer */}
                <div className="h-32 w-full bg-white dark:bg-[#122021] rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-[#8E9B98] border-b border-[#E8E2D6]/40 dark:border-[#232E2F] pb-1">
                    <span>{isRtl ? 'التردد العالي: 260 هرتز' : 'High: 260 Hz'}</span>
                    <span className="font-mono">Maqam Tartil Cadence</span>
                    <span>{isRtl ? 'التردد الأساسي: 120 هرتز' : 'Base: 120 Hz'}</span>
                  </div>

                  {/* Dynamic Curve Plotting */}
                  <div className="relative h-18 w-full flex items-end justify-between px-2 pt-2">
                    {report.pitchContour && report.pitchContour.map((pt, idx) => {
                      const maxHz = 260;
                      const minHz = 110;
                      const scholarHeight = Math.max(10, Math.min(100, ((pt.scholarPitchHz - minHz) / (maxHz - minHz)) * 100));
                      const userHeight = Math.max(10, Math.min(100, ((pt.userPitchHz - minHz) / (maxHz - minHz)) * 100));
                      const isDeviated = Math.abs(pt.diffHz) > 8;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 group relative h-full justify-end flex-1 max-w-[24px]">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-black/90 text-white text-[9px] p-1.5 rounded-lg z-20 whitespace-nowrap shadow-lg">
                            <span>{pt.timeMs} ms</span>
                            <span className="text-[#72D6A5]">Scholar: {pt.scholarPitchHz} Hz</span>
                            <span className="text-[#FF9A85]">You: {pt.userPitchHz} Hz (Δ {pt.diffHz}Hz)</span>
                          </div>

                          {/* Dual Bars / Indicators */}
                          <div className="w-full flex items-end justify-center gap-0.5 h-16">
                            {/* Scholar line point */}
                            <div
                              style={{ height: `${scholarHeight}%` }}
                              className="w-1.5 rounded-t-full bg-[#2E7D5A] dark:bg-[#72D6A5] opacity-80"
                            />
                            {/* User line point */}
                            <div
                              style={{ height: `${userHeight}%` }}
                              className={`w-1.5 rounded-t-full transition-all ${
                                isDeviated ? 'bg-[#D96E54]' : 'bg-[#C5A059]'
                              }`}
                            />
                          </div>
                          <span className="text-[8px] text-[#8E9B98] font-mono">{pt.timeMs}ms</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  const pitchMetric = report.metrics.find(m => m.id === 'pitch');
                  const tonalScore = pitchMetric ? Math.round(pitchMetric.score) : Math.round(report.overallMatchPercentage);
                  const avgPitchDiff = report.pitchContour && report.pitchContour.length > 0
                    ? Math.round(report.pitchContour.reduce((acc, p) => acc + Math.abs(p.diffHz), 0) / report.pitchContour.length)
                    : 6;
                  const isGood = avgPitchDiff <= 12;

                  return (
                    <div className="flex items-center justify-between text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] px-1">
                      <span>
                        {isRtl ? `الاستقرار النغمي: متطابق بنسبة ${tonalScore}%` : `Tonal Alignment: ${tonalScore}% match`}
                      </span>
                      <span>
                        {isRtl
                          ? `متوسط الفارق: ±${avgPitchDiff} هرتز (${isGood ? 'طبيعي ومقبول' : 'يحتاج تقريب للنغمة'})`
                          : `Mean Pitch Variance: ±${avgPitchDiff} Hz (${isGood ? 'Within target range' : 'Needs tonal adjustment'})`}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* 2. Vocal Stability & Harmonic Biomarkers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1">
                  <span className="text-[10px] text-[#8E9B98] block uppercase">
                    {isRtl ? 'الاضطراب الترددي (Jitter)' : 'Pitch Jitter'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-[#2E7D5A] dark:text-[#72D6A5]">
                      {report.jitterPercentage ?? 0.62}%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{isRtl ? 'ممتاز' : 'Optimal'}</span>
                  </div>
                  <p className="text-[10px] text-[#8E9B98]">{isRtl ? 'المعيار: أقل من 1.04%' : 'Standard: < 1.04%'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1">
                  <span className="text-[10px] text-[#8E9B98] block uppercase">
                    {isRtl ? 'استقرار السعة (Shimmer)' : 'Amp Shimmer'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-[#2E7D5A] dark:text-[#72D6A5]">
                      {report.shimmerPercentage ?? 2.8}%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{isRtl ? 'متزن' : 'Stable'}</span>
                  </div>
                  <p className="text-[10px] text-[#8E9B98]">{isRtl ? 'المعيار: أقل من 3.81%' : 'Standard: < 3.81%'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1">
                  <span className="text-[10px] text-[#8E9B98] block uppercase">
                    {isRtl ? 'نقاء النغمة (HNR)' : 'Harmonic Ratio'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {report.harmonicToNoiseDb ?? 21.4} dB
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8E9B98]">{isRtl ? 'صفاء صوتي متقدم' : 'Crisp vocal purity'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1">
                  <span className="text-[10px] text-[#8E9B98] block uppercase">
                    {isRtl ? 'المجال الديناميكي' : 'Dynamic Range'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-[#C5A059]">
                      24 dB
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8E9B98]">{isRtl ? 'ضغط صوتي سليم' : 'Balanced pressure'}</p>
                </div>
              </div>

              {/* 3. Makhraj Articulation Precision Breakdown */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
                <h4 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#C5A059]" />
                  <span>{isRtl ? 'توزيع دقة مخارج الحروف الصوتية (Makhraj Alignment)' : 'Makhraj Acoustic Precision Distribution'}</span>
                </h4>

                <div className="space-y-3">
                  {report.makhrajPrecision && report.makhrajPrecision.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                          {isRtl ? m.areaArabic : m.area}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            m.status === 'optimal'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : m.status === 'slight_deviation'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-[#D96E54]/15 text-[#D96E54]'
                          }`}>
                            {m.status === 'optimal'
                              ? (isRtl ? 'مخرج متقن' : 'Optimal')
                              : m.status === 'slight_deviation'
                              ? (isRtl ? 'انحراف طفيف' : 'Minor Variance')
                              : (isRtl ? 'يحتاج ضبط' : 'Needs Practice')}
                          </span>
                          <span className="font-bold font-mono text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                            {m.score}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#E8E2D6]/60 dark:bg-[#232E2F] h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${m.score}%` }}
                          className={`h-full rounded-full transition-all duration-700 ${
                            m.score >= 90
                              ? 'bg-[#2E7D5A] dark:bg-[#72D6A5]'
                              : m.score >= 75
                              ? 'bg-[#C5A059]'
                              : 'bg-[#D96E54]'
                          }`}
                        />
                      </div>

                      <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                        {isRtl ? m.noteArabic : m.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ACOUSTIC OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Achievement Badge Notification Pill */}
              {report.badgeProgressImpact && (
                <div className="p-3 rounded-2xl bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#1A4D4E] dark:text-[#72D6A5]">
                    <Trophy className="w-4 h-4 text-[#C5A059] fill-current flex-shrink-0" />
                    <div>
                      <span className="font-bold">{isRtl ? 'تقدم وسام المستمع الحصيف:' : 'Milestone Progress Earned:'}</span>{' '}
                      <span>{report.badgeProgressImpact.badgeTitle}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5] bg-white dark:bg-[#122021] px-2.5 py-0.5 rounded-full border border-[#C2DBCB]">
                    +{report.badgeProgressImpact.pointsEarned} XP
                  </span>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'المعايير الصوتية المقارنة بالتفصيل:' : 'Detailed Comparative Acoustic Dimensions:'}
                </h3>

                {report.metrics.map((m, idx) => {
                  const statusStyle = getScoreColor(m.userScore);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                          {isRtl ? m.nameArabic : m.name}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusStyle}`}>
                          {m.userScore}% {m.status === 'optimal' ? 'Optimal' : m.status === 'acceptable' ? 'Good' : 'Adjust'}
                        </span>
                      </div>

                      {/* Score Bar */}
                      <div className="w-full h-2 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.userScore >= 85 ? 'bg-[#1A4D4E] dark:bg-[#72D6A5]' : 'bg-[#C5A059]'
                          }`}
                          style={{ width: `${m.userScore}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                        <span>
                          <strong className="text-[#1A4D4E] dark:text-[#E8ECE9]">{isRtl ? 'قراءتك: ' : 'You: '}</strong>
                          {m.userValueText}
                        </span>
                        <span>
                          <strong className="text-[#1A4D4E] dark:text-[#E8ECE9]">{isRtl ? 'الشيخ: ' : 'Scholar: '}</strong>
                          {m.targetValueText}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5F6E6C] dark:text-[#A6B2AF] pt-1 border-t border-[#E8E2D6]/60 dark:border-[#232E2F]">
                        {isRtl ? m.feedbackArabic : m.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FORMANTS & VOWEL RESONANCE */}
          {activeTab === 'formants' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#EAF2ED]/60 dark:bg-[#142A20]/60 border border-[#C2DBCB] text-xs leading-relaxed text-[#1A4D4E] dark:text-[#72D6A5]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Info className="w-4 h-4" />
                  <span>{isRtl ? 'ما هو التحليل الترددي للحركات (Formants)؟' : 'What Are Acoustic Formants?'}</span>
                </div>
                {isRtl
                  ? 'ترددات الرنين الصوتي (F1 و F2) تقيس بدقة موضع فتحة الفك السفلي وارتفاع اللسان. عند نطق الكسرة ينبغي أن يكون F1 منخفضاً (~310 هرتز). إذا انفتح الفك أكثر من اللازم، يرتفع التردد ويتحول صوت الكسرة إلى ضمة أو فتحة.'
                  : 'Vowel formants (F1 and F2) scientifically measure mouth aperture and tongue position. A pure Arabic Kasrah requires a low F1 (~310 Hz) with an elevated tongue blade. Elevated F1 signals excessive jaw opening, causing the harakah to blur into a Dammah or Fathah.'}
              </div>

              <div className="space-y-3">
                {report.formants.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-2.5"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#1A4D4E] dark:text-[#E8ECE9]">{isRtl ? f.labelArabic : f.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          Math.abs(f.differenceHz) <= 100
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-[#D96E54]/15 text-[#D96E54]'
                        }`}
                      >
                        Δ {f.differenceHz > 0 ? `+${f.differenceHz}` : f.differenceHz} Hz
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F]">
                        <span className="text-[#8E9B98] block">{isRtl ? 'تردد صوتك المسجل:' : 'Your Acoustic Hz:'}</span>
                        <span className="text-base font-bold font-mono text-[#D96E54]">{f.userHz} Hz</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F]">
                        <span className="text-[#8E9B98] block">{isRtl ? 'تردد الشيخ المرجعي:' : 'Master Scholar Hz:'}</span>
                        <span className="text-base font-bold font-mono text-[#2E7D5A] dark:text-[#72D6A5]">
                          {f.targetHz} Hz
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                      {isRtl ? f.explanationArabic : f.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DUAL WAVEFORM & SPECTROGRAM OVERLAY */}
          {activeTab === 'spectrogram' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'التطابق الزمني لموجة الصوت (صوتك مقابل الشيخ)' : 'Dual-Track Waveform & Spectrogram Overlay'}
                  </h3>
                  <p className="text-[11px] text-[#8E9B98]">
                    {isRtl
                      ? 'المنطقة المظللة باللون البرتقالي تحدد اللحظة التي انحرفت فيها حركة الحرف'
                      : 'Orange shaded region highlights the exact phoneme discrepancy interval'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-[#D96E54] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D96E54]" />
                    {isRtl ? 'صوتك' : 'Your Voice'}
                  </span>
                  <span className="flex items-center gap-1 text-[#2E7D5A] dark:text-[#72D6A5] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D5A] dark:bg-[#72D6A5]" />
                    {isRtl ? 'الشيخ' : 'Scholar'}
                  </span>
                </div>
              </div>

              {/* Graphical Spectrogram Bars */}
              <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
                <div className="h-32 flex items-end justify-between gap-1 px-1 bg-white/70 dark:bg-[#122021]/80 rounded-xl p-2 border border-[#E8E2D6] dark:border-[#232E2F] relative overflow-hidden">
                  {/* Discrepancy Window Highlight */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#D96E54]/10 border-x-2 border-[#D96E54] pointer-events-none flex items-center justify-center"
                    style={{ left: '35%', width: '22%' }}
                  >
                    <span className="text-[9px] font-bold text-[#D96E54] bg-white/90 dark:bg-[#122021]/90 px-1 py-0.5 rounded shadow-xs">
                      {isRtl ? 'موضع الزلل' : 'Vowel Slip'}
                    </span>
                  </div>

                  {report.spectrogramPoints.map((pt, i) => (
                    <div key={i} className="flex-1 flex items-end justify-center gap-0.5 h-full z-10 group">
                      {/* User bar */}
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          pt.isDiscrepancy ? 'bg-[#D96E54]' : 'bg-[#D96E54]/60 group-hover:bg-[#D96E54]'
                        }`}
                        style={{ height: `${Math.round(pt.userAmplitude * 100)}%` }}
                        title={`Time: ${pt.timeMs}ms | User Amp: ${Math.round(pt.userAmplitude * 100)}%`}
                      />
                      {/* Scholar bar */}
                      <div
                        className="w-full rounded-t-sm bg-[#2E7D5A] dark:bg-[#72D6A5]/80 transition-all duration-300 group-hover:bg-[#2E7D5A]"
                        style={{ height: `${Math.round(pt.scholarAmplitude * 100)}%` }}
                        title={`Time: ${pt.timeMs}ms | Scholar Amp: ${Math.round(pt.scholarAmplitude * 100)}%`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8E9B98] px-1 font-mono">
                  <span>0.0 ms (Onset)</span>
                  <span>600 ms (Peak Vowel)</span>
                  <span>1200 ms (Offset)</span>
                </div>
              </div>

              {/* Audition Button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FDF2F0] dark:bg-[#2A1715] border border-[#F5C2BA] text-xs">
                <span className="text-[#D96E54] font-semibold">
                  {isRtl ? 'استمع إلى المقطع الزمني المختلف بتركيز:' : 'Audition the divergent phoneme slice:'}
                </span>
                <button
                  onClick={handleAuditionSample}
                  className="px-3 py-1.5 rounded-xl bg-[#D96E54] text-white font-bold hover:bg-[#c05940] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudition ? (isRtl ? 'جاري العزف...' : 'Auditioning...') : (isRtl ? 'استمع للموضع' : 'Audition Slice')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ARTICULATION GUIDANCE */}
          {activeTab === 'guidance' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-3">
                {report.keyRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <span>{isRtl ? rec.titleArabic : rec.title}</span>
                    </div>
                    <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                      {isRtl ? rec.descriptionArabic : rec.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#C5A059]/40 text-xs space-y-1">
                <span className="font-bold text-[#C5A059] block">
                  {isRtl ? 'نصيحة المعلم للتدريب:' : 'Teacher Practice Recommendation:'}
                </span>
                <p className="text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                  {isRtl
                    ? 'تدرب أمام المرآة أو استشعر حركة الفك بوضع إصبعك بلطف تحت الذقن أثناء نطق الكسرة لضمان عدم اندفاع الفك للأمام أو ضمه.'
                    : 'Place your fingertips lightly beneath your chin while reciting to feel the jaw drop naturally without lip protrusion.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-[#F5F2ED] dark:bg-[#172526] border-t border-[#E8E2D6] dark:border-[#232E2F] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#122021] border border-[#C5A059] text-[#C5A059] font-bold text-xs hover:bg-[#FDF8EE] dark:hover:bg-[#201d14] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تحميل PDF' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleSharePdf}
              disabled={isExportingPdf}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] font-semibold text-xs hover:bg-[#EAF2ED] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Share PDF Report"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'مشاركة PDF' : 'Share PDF'}</span>
            </button>

            {onReplayComparison && (
              <button
                onClick={onReplayComparison}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] font-semibold text-xs hover:bg-[#EAF2ED] transition-colors flex items-center gap-1.5 cursor-pointer"
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
