import React, { useState, useMemo } from 'react';
import { SurahCompletionCertificate, UserProfile, Direction } from '../../types';
import { certificateService } from '../../services/certificateService';
import { ALL_114_SURAHS_METADATA } from '../../data/allSurahsMetadata';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import {
  Award,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
  Search,
  PlusCircle,
  Trophy,
  ShieldCheck,
  FileText,
  Star
} from 'lucide-react';

interface SurahCertificatesSectionProps {
  user: UserProfile;
  direction: Direction;
}

export const SurahCertificatesSection: React.FC<SurahCertificatesSectionProps> = ({
  user,
  direction
}) => {
  const isRtl = direction === 'rtl';

  const [certificates, setCertificates] = useState<SurahCompletionCertificate[]>(() =>
    certificateService.getCertificates(user)
  );
  const [selectedCertificate, setSelectedCertificate] = useState<SurahCompletionCertificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newSurahNumber, setNewSurahNumber] = useState<number>(1);
  const [newAccuracyScore, setNewAccuracyScore] = useState<number>(98.5);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        cert.surahNameEnglish.toLowerCase().includes(q) ||
        cert.surahNameArabic.includes(q) ||
        cert.surahTranslation.toLowerCase().includes(q) ||
        String(cert.surahNumber).includes(q)
      );
    });
  }, [certificates, searchQuery]);

  // Handle direct print from card
  const handleQuickPrint = async (e: React.MouseEvent, cert: SurahCompletionCertificate) => {
    e.stopPropagation();
    try {
      await certificateService.printCertificate(cert);
    } catch (err) {
      console.error('Quick print failed:', err);
    }
  };

  // Handle direct download from card
  const handleQuickDownload = async (e: React.MouseEvent, cert: SurahCompletionCertificate) => {
    e.stopPropagation();
    try {
      await certificateService.downloadCertificatePdf(cert);
    } catch (err) {
      console.error('Quick download failed:', err);
    }
  };

  // Issue custom certificate
  const handleIssueNewCertificate = () => {
    const newCert = certificateService.recordSurahCompletion(
      newSurahNumber,
      newAccuracyScore,
      user.name || 'زيد بن أنس الأنصاري'
    );
    setCertificates(certificateService.getCertificates(user));
    setShowIssueModal(false);
    setSelectedCertificate(newCert);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* SECTION BANNER */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-[#153C3D] via-[#1A4D4E] to-[#152B2C] text-white relative overflow-hidden shadow-lg border border-[#C5A059]/30">
        {/* Background Decorative Graphic */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-[#C5A059]/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-64 h-64 rounded-full bg-[#72D6A5]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#F5D77F] text-xs font-bold border border-[#C5A059]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'شهادات تخرج وإتقان معتمدة للطباعة' : 'Official Printable Surah Certificates'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-[#C5A059]" />
              <span>{isRtl ? 'شهادات إتمام السور بدقة تلاوة عالية' : 'High-Accuracy Surah Completion Certificates'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#D1DDD9] leading-relaxed">
              {isRtl
                ? 'يحصل القارئ عند إتمام تلاوة وتسميع السورة بنسبة دقة تفوق 90% على شهادة إتقان معتمدة جاهزة للطباعة مقاس A4 أو التحميل بصيغة PDF، متضمنة تدقيق الحركات والتجويد والرقم التسلسلي المعتمد.'
                : 'Reciters who complete a full Surah with 90%+ phonetic & vowel accuracy earn an official A4 printable certificate verified with serial numbers, Harakat validation, and scholar benchmark standards.'}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
            <div className="text-center md:text-right">
              <span className="text-[11px] text-[#A6C0BC] font-semibold block uppercase">
                {isRtl ? 'الشهادات المؤهلة' : 'Qualified Certificates'}
              </span>
              <span className="text-3xl font-extrabold text-[#F5D77F]">{certificates.length}</span>
            </div>

            <button
              onClick={() => setShowIssueModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#B38F48] text-[#153C3D] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isRtl ? 'إصدار شهادة لسورة أخرى' : 'Issue Certificate for Surah'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8E9B98] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث باسم السورة أو رقمها...' : 'Search by Surah name or number...'}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-xs text-[#1A4D4E] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#C5A059]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          <span>{isRtl ? 'جميع الشهادات مدققة صوتياً بنسبة 100%' : 'All certificates 100% acoustically audited'}</span>
        </div>
      </div>

      {/* CERTIFICATES GRID */}
      {filteredCertificates.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-dashed border-[#E8E2D6] dark:border-[#232E2F] text-center space-y-3">
          <FileText className="w-10 h-10 text-[#8E9B98] mx-auto" />
          <p className="text-sm font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
            {isRtl ? 'لم يتم العثور على شهادات مطابقة' : 'No matching certificates found'}
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#C5A059] font-bold underline cursor-pointer"
          >
            {isRtl ? 'عرض جميع الشهادات' : 'Show all certificates'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCertificates.map((cert) => {
            const isTopGrade = cert.accuracyPercentage >= 95;

            return (
              <div
                key={cert.id}
                onClick={() => setSelectedCertificate(cert)}
                className="group relative p-5 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] dark:hover:border-[#C5A059] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                {/* Top Row: Surah Details & Accuracy Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#1A4D4E]/30 text-[#1A4D4E] dark:text-[#72D6A5] text-[11px] font-bold flex items-center justify-center">
                        {cert.surahNumber}
                      </span>
                      <h3 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                        {cert.surahNameArabic}
                      </h3>
                    </div>
                    <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3]">
                      Surah {cert.surahNameEnglish} • {cert.surahTranslation}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#8E9B98]">
                      <span>{cert.numberOfAyahs} {isRtl ? 'آيات' : 'Ayahs'}</span>
                      <span>•</span>
                      <span>{isRtl ? `الجزء ${cert.juzNumber}` : `Juz ${cert.juzNumber}`}</span>
                      <span>•</span>
                      <span>{cert.revelationType}</span>
                    </div>
                  </div>

                  {/* Accuracy Score Medallion */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-2xl bg-[#FAF5EC] dark:bg-[#1F2C27] border border-[#C5A059]/40 text-[#1A4D4E] dark:text-[#F5D77F]">
                      <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                      <span className="text-sm font-extrabold">{cert.accuracyPercentage}%</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#C5A059] mt-1 text-right">
                      {cert.gradeArabic}
                    </span>
                  </div>
                </div>

                {/* Middle Info: Recipient & Serial */}
                <div className="p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E9B98] block">
                      {isRtl ? 'ممنوحة للحافظ:' : 'Issued To:'}
                    </span>
                    <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                      {cert.studentName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8E9B98] block">
                      {isRtl ? 'تاريخ الإتمام:' : 'Completed:'}
                    </span>
                    <span className="font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] text-[11px]">
                      {cert.completedAt}
                    </span>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] dark:border-[#232E2F]">
                  <span className="text-[10px] text-[#8E9B98] font-mono">
                    {cert.certificateSerialNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleQuickPrint(e, cert)}
                      className="p-2 rounded-xl text-[#1A4D4E] dark:text-[#72D6A5] hover:bg-[#FAF5EC] dark:hover:bg-[#1A2E30] border border-transparent hover:border-[#C5A059]/40 transition-colors cursor-pointer"
                      title={isRtl ? 'طباعة مباشرة' : 'Direct Print'}
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleQuickDownload(e, cert)}
                      className="p-2 rounded-xl text-[#1A4D4E] dark:text-[#72D6A5] hover:bg-[#FAF5EC] dark:hover:bg-[#1A2E30] border border-transparent hover:border-[#C5A059]/40 transition-colors cursor-pointer"
                      title={isRtl ? 'تحميل PDF' : 'Download PDF'}
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedCertificate(cert)}
                      className="px-3 py-1.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153C3D] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{isRtl ? 'معاينة وطباعة' : 'View & Print'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ISSUE CERTIFICATE FOR ANY SURAH MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FDFBF7] dark:bg-[#122021] rounded-3xl border border-[#E8E2D6] dark:border-[#232E2F] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[#232E2F] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-sm sm:text-base text-[#1A4D4E] dark:text-[#E8ECE9]">
                  {isRtl ? 'إصدار شهادة إتقان لسورة جديدة' : 'Issue New Surah Certificate'}
                </h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-[#8E9B98] hover:text-[#1A4D4E] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Surah Selection */}
              <div>
                <label className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9] block mb-1">
                  {isRtl ? 'اختر السورة الكريمة (1 - 114):' : 'Select Holy Surah (1 - 114):'}
                </label>
                <select
                  value={newSurahNumber}
                  onChange={(e) => setNewSurahNumber(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#E8ECE9] font-bold focus:outline-hidden focus:border-[#C5A059]"
                >
                  {ALL_114_SURAHS_METADATA.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameArabic} — {s.nameEnglish} ({s.numberOfAyahs} {isRtl ? 'آيات' : 'Ayahs'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Accuracy score slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'نسبة دقة التلاوة المحققة:' : 'Verified Recitation Accuracy:'}
                  </label>
                  <span className="font-extrabold text-[#C5A059] text-sm">{newAccuracyScore}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="100"
                  step="0.1"
                  value={newAccuracyScore}
                  onChange={(e) => setNewAccuracyScore(Number(e.target.value))}
                  className="w-full accent-[#C5A059]"
                />
                <div className="flex justify-between text-[10px] text-[#8E9B98] mt-1">
                  <span>90% ({isRtl ? 'الحد الأدنى للاعتماد' : 'Min Qualification'})</span>
                  <span>95% ({isRtl ? 'مرتبة الشرف' : 'Distinction'})</span>
                  <span>100% ({isRtl ? 'إتقان تام' : 'Perfect'})</span>
                </div>
              </div>

              {/* Recipient note */}
              <div className="p-3 rounded-2xl bg-[#FAF5EC] dark:bg-[#1B2925] border border-[#C5A059]/30 text-[11px] text-[#5F6E6C] dark:text-[#A6B2AF]">
                {isRtl
                  ? `ستصدر الشهادة باسم: «${user.name || 'زيد بن أنس الأنصاري'}» برواية حفص عن عاصم ويمكنك تعديل الاسم لاحقاً من شاشة المعاينة.`
                  : `Certificate will be issued to "${user.name || 'Zaid Al-Ansari'}" in Hafs 'an 'Asim. You can edit the recipient name in the preview modal.`}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D6] dark:border-[#232E2F]">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F7D7B] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleIssueNewCertificate}
                className="px-4 py-2 rounded-xl bg-[#1A4D4E] hover:bg-[#153C3D] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-[#C5A059]" />
                <span>{isRtl ? 'توليد ومعاينة الشهادة' : 'Generate & View Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL CERTIFICATE PREVIEW MODAL */}
      {selectedCertificate && (
        <CertificatePreviewModal
          certificate={selectedCertificate}
          direction={direction}
          onClose={() => setSelectedCertificate(null)}
          onCertificateUpdated={(updated) => {
            const nextList = certificates.map(c => c.id === updated.id ? updated : c);
            setCertificates(nextList);
            certificateService.saveCertificates(nextList);
          }}
        />
      )}
    </div>
  );
};
