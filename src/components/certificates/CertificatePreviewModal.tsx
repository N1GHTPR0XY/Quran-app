import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SurahCompletionCertificate, Direction } from '../../types';
import { certificateService } from '../../services/certificateService';
import confetti from 'canvas-confetti';
import {
  Printer,
  Download,
  Share2,
  X,
  Award,
  CheckCircle2,
  Sparkles,
  User,
  ShieldCheck,
  FileCheck,
  RefreshCw
} from 'lucide-react';

interface CertificatePreviewModalProps {
  certificate: SurahCompletionCertificate;
  direction: Direction;
  onClose: () => void;
  onCertificateUpdated?: (updated: SurahCompletionCertificate) => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate: initialCert,
  direction,
  onClose,
  onCertificateUpdated
}) => {
  const isRtl = direction === 'rtl';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentCert, setCurrentCert] = useState<SurahCompletionCertificate>(initialCert);
  const [recipientName, setRecipientName] = useState(initialCert.studentName);
  const [isRendering, setIsRendering] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#C5A059', '#1A4D4E', '#E8ECE9', '#FDFBF7']
    });
  }, []);

  // Re-render canvas whenever currentCert or recipientName changes
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      const updated = { ...currentCert, studentName: recipientName.trim() || currentCert.studentName };
      await certificateService.renderCertificateCanvas(updated, canvasRef.current);
    } catch (err) {
      console.error('Error rendering certificate canvas:', err);
    } finally {
      setIsRendering(false);
    }
  }, [currentCert, recipientName]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle saving student name updates
  const handleNameBlur = () => {
    const trimmed = recipientName.trim();
    if (trimmed && trimmed !== currentCert.studentName) {
      const updated = { ...currentCert, studentName: trimmed };
      setCurrentCert(updated);
      if (onCertificateUpdated) {
        onCertificateUpdated(updated);
      }
    }
  };

  // Direct Print action
  const handlePrint = async () => {
    setIsExporting(true);
    setExportMessage(isRtl ? 'جاري تحضير أمر الطباعة...' : 'Preparing high-resolution print...');
    try {
      const updated = { ...currentCert, studentName: recipientName.trim() || currentCert.studentName };
      await certificateService.printCertificate(updated);
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      setIsExporting(false);
      setExportMessage(null);
    }
  };

  // Direct PDF Download action
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportMessage(isRtl ? 'جاري إنشاء ملف PDF فائق الدقة...' : 'Generating 300-DPI PDF document...');
    try {
      const updated = { ...currentCert, studentName: recipientName.trim() || currentCert.studentName };
      await certificateService.downloadCertificatePdf(updated);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#C5A059', '#1A4D4E']
      });
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setIsExporting(false);
      setExportMessage(null);
    }
  };

  // Web Share action
  const handleShare = async () => {
    setIsExporting(true);
    setExportMessage(isRtl ? 'جاري تجهيز المشاركة...' : 'Preparing certificate to share...');
    try {
      const updated = { ...currentCert, studentName: recipientName.trim() || currentCert.studentName };
      const res = await certificateService.shareCertificate(updated);
      if (res.method === 'download') {
        setExportMessage(isRtl ? 'تم تحميل الشهادة لجهازك' : 'Certificate downloaded to device');
        setTimeout(() => setExportMessage(null), 2500);
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#FDFBF7] dark:bg-[#122021] rounded-3xl border border-[#C5A059]/40 dark:border-[#232E2F] shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-between bg-white dark:bg-[#152728]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1A4D4E]/10 dark:bg-[#C5A059]/20 flex items-center justify-center text-[#1A4D4E] dark:text-[#C5A059]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'شهادة إتمام وإتقان السورة' : 'Printable Surah Completion Certificate'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] border border-[#C2DBCB] dark:border-[#1F4532]">
                  {currentCert.accuracyPercentage}% {isRtl ? 'دقة' : 'Accuracy'}
                </span>
              </div>
              <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
                {currentCert.surahNameArabic} • {currentCert.surahNameEnglish} ({currentCert.numberOfAyahs} {isRtl ? 'آيات' : 'Ayahs'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6F7D7B] hover:text-[#1A4D4E] hover:bg-[#F5F2ED] dark:hover:bg-[#1A2E30] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Customization & Controls Toolbar */}
        <div className="px-5 py-3 bg-[#FAF7F0] dark:bg-[#0E1A1A] border-b border-[#E8E2D6] dark:border-[#232E2F] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Recipient Name Customization Input */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <User className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span className="text-[#6F7D7B] dark:text-[#9AA5A3] font-semibold whitespace-nowrap">
              {isRtl ? 'اسم صاحب الشهادة:' : 'Recipient Name:'}
            </span>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder={isRtl ? 'أدخل الاسم الثلاثي للتثبيت في الشهادة' : 'Enter full student name for certificate'}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] font-bold text-xs focus:outline-hidden focus:border-[#C5A059]"
            />
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2 text-[11px] text-[#1A4D4E] dark:text-[#72D6A5]">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span className="font-semibold">
              {isRtl ? 'تدقيق صوتي معتمد 100%' : 'Certified 100% Acoustic Audit'}
            </span>
          </div>
        </div>

        {/* Certificate Live Canvas Preview Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-[#EDE8DE] dark:bg-[#0A1314]">
          <div className="relative w-full max-w-4xl shadow-xl rounded-2xl overflow-hidden border border-[#C5A059]/30 bg-white">
            {isRendering && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-[#122021]/80 backdrop-blur-xs">
                <RefreshCw className="w-7 h-7 text-[#C5A059] animate-spin mb-2" />
                <span className="text-xs font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'جاري تصيير الشهادة بالخط العربي...' : 'Rendering high-definition calligraphy...'}
                </span>
              </div>
            )}

            {/* Hidden/Scaled Canvas that renders the actual A4 image */}
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              style={{ aspectRatio: '2000 / 1414' }}
            />
          </div>

          {exportMessage && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-[#1A4D4E] text-white text-xs font-semibold flex items-center gap-2 shadow-md animate-pulse">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>{exportMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="px-5 py-4 bg-white dark:bg-[#152728] border-t border-[#E8E2D6] dark:border-[#232E2F] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#C5A059]" />
            <span>
              {isRtl
                ? `رقم الوثيقة: ${currentCert.certificateSerialNumber} • جاهزة للطباعة مقاس A4 أفقي`
                : `Cert ID: ${currentCert.certificateSerialNumber} • Ready for A4 Landscape Print`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Share */}
            <button
              onClick={handleShare}
              disabled={isExporting}
              className="px-3.5 py-2.5 rounded-xl border border-[#E8E2D6] dark:border-[#232E2F] bg-[#FDFBF7] dark:bg-[#122021] text-[#1A4D4E] dark:text-[#E8ECE9] hover:bg-[#F5F2ED] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={isRtl ? 'مشاركة الشهادة' : 'Share Certificate'}
            >
              <Share2 className="w-4 h-4 text-[#C5A059]" />
              <span>{isRtl ? 'مشاركة' : 'Share'}</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl border border-[#C5A059] bg-[#FAF5EC] dark:bg-[#1B2925] text-[#1A4D4E] dark:text-[#C5A059] hover:bg-[#F5EEDF] text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تحميل بصيغة PDF' : 'Download PDF'}</span>
            </button>

            {/* Print Button (Primary) */}
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153C3D] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-[#C5A059]" />
              <span>{isRtl ? 'طباعة الشهادة الآن' : 'Print Certificate'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
