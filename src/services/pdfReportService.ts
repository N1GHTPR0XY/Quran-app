import { jsPDF } from 'jspdf';
import { VoiceCompareReport } from '../types';

export class PdfReportService {
  /**
   * Generates a beautifully styled, print-ready PDF document
   * analyzing the user's recitation and comparing it to the master scholar.
   */
  public generatePdf(report: VoiceCompareReport): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    let y = margin;

    // --- 1. HEADER BANNER ---
    doc.setFillColor(26, 77, 78); // #1A4D4E deep teal
    doc.rect(0, 0, pageWidth, 38, 'F');

    // App Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('TADREEB QURAN MEMORIZATION', margin, 16);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(197, 160, 89); // #C5A059 gold
    doc.text('Acoustic Voice Benchmark & Tajweed Diagnostic Audit Report', margin, 23);

    // Report Meta (Right aligned)
    doc.setFontSize(8);
    doc.setTextColor(220, 235, 230);
    const dateStr = report.generatedAt || new Date().toLocaleString();
    doc.text(`Generated: ${dateStr}`, pageWidth - margin, 15, { align: 'right' });
    doc.text(`Report ID: ${report.id.substring(0, 16)}`, pageWidth - margin, 20, { align: 'right' });

    y = 48;

    // --- 2. SUMMARY CARD ---
    doc.setFillColor(253, 251, 247); // #FDFBF7 warm neutral
    doc.setDrawColor(232, 226, 214);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 42, 4, 4, 'FD');

    // Analyzed Verse & Word
    doc.setTextColor(26, 77, 78);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Ayah Reference: ${report.ayahReference}`, margin + 6, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(95, 110, 108);
    doc.text(`Benchmarked Against: ${report.scholarName}`, margin + 6, y + 18);
    doc.text(`Analyzed Word: [ ${report.wordArabic} ]`, margin + 6, y + 26);
    doc.text(`Evaluation Type: Formant & Tajweed Acoustic Waveform Alignment`, margin + 6, y + 34);

    // Overall Score Badge on the right
    const badgeX = pageWidth - margin - 44;
    const badgeY = y + 7;
    const score = report.overallMatchPercentage;
    const scoreColor = score >= 85 ? [46, 125, 90] : score >= 70 ? [197, 160, 89] : [217, 110, 84];
    
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(badgeX, badgeY, 38, 28, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`${score}%`, badgeX + 19, badgeY + 14, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('MATCH SCORE', badgeX + 19, badgeY + 22, { align: 'center' });

    y += 50;

    // --- 3. SECTION: ACOUSTIC & TAJWEED KPI METRICS ---
    doc.setTextColor(26, 77, 78);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Acoustic & Tajweed Metric Breakdown', margin, y);

    // Subtle divider
    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2, margin + 80, y + 2);

    y += 8;

    // Metric Table Header
    const col1 = margin + 4;
    const col2 = margin + 65;
    const col3 = margin + 105;
    const col4 = margin + 140;

    doc.setFillColor(245, 242, 237);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(95, 110, 108);
    doc.text('METRIC / TAJWEED RULE', col1, y + 5);
    doc.text('YOUR VALUE', col2, y + 5);
    doc.text('SCHOLAR TARGET', col3, y + 5);
    doc.text('ALIGNMENT', col4, y + 5);

    y += 9;

    // Metric Rows
    report.metrics.forEach((metric, idx) => {
      const rowY = y + idx * 11;
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        doc.setFillColor(253, 251, 247);
        doc.rect(margin, rowY - 2, pageWidth - 2 * margin, 10, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 77, 78);
      doc.text(metric.name, col1, rowY + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(111, 125, 123);
      doc.text(metric.userValueText, col2, rowY + 3);
      doc.text(metric.targetValueText, col3, rowY + 3);

      const mScore = metric.userScore;
      const mScoreColor = mScore >= 85 ? [46, 125, 90] : mScore >= 70 ? [197, 160, 89] : [217, 110, 84];
      doc.setTextColor(mScoreColor[0], mScoreColor[1], mScoreColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`${mScore}% (${metric.status.replace('_', ' ')})`, col4, rowY + 3);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(130, 145, 143);
      doc.text(metric.feedback, col1, rowY + 7);
    });

    y += report.metrics.length * 11 + 6;

    // --- 4. SECTION: FORMANT PHONETIC ANALYSIS ---
    doc.setTextColor(26, 77, 78);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. Formant Frequency & Vowel Aperture Analysis', margin, y);

    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2, margin + 95, y + 2);

    y += 8;

    if (report.formants && report.formants.length > 0) {
      report.formants.forEach((f, idx) => {
        const boxWidth = (pageWidth - 2 * margin - 8) / report.formants.length;
        const boxX = margin + idx * (boxWidth + 4);

        doc.setFillColor(253, 251, 247);
        doc.setDrawColor(232, 226, 214);
        doc.roundedRect(boxX, y, boxWidth, 26, 2, 2, 'FD');

        doc.setTextColor(26, 77, 78);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(f.label, boxX + 4, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(95, 110, 108);
        doc.text(`User: ${f.userHz} Hz`, boxX + 4, y + 12);
        doc.text(`Target: ${f.targetHz} Hz`, boxX + 4, y + 17);

        const diffColor = Math.abs(f.differenceHz) <= 50 ? [46, 125, 90] : [217, 110, 84];
        doc.setTextColor(diffColor[0], diffColor[1], diffColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`Diff: ${f.differenceHz > 0 ? '+' : ''}${f.differenceHz} Hz`, boxX + 4, y + 22);
      });
      y += 32;
    }

    // --- 5. SECTION: PEDAGOGICAL RECOMMENDATIONS ---
    doc.setTextColor(26, 77, 78);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Teacher & Master Reciter Coaching Recommendations', margin, y);

    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2, margin + 115, y + 2);

    y += 8;

    if (report.keyRecommendations && report.keyRecommendations.length > 0) {
      report.keyRecommendations.forEach((rec, idx) => {
        if (y > pageHeight - 35) {
          doc.addPage();
          y = margin + 10;
        }

        doc.setFillColor(245, 242, 237);
        doc.setDrawColor(232, 226, 214);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 3, 3, 'FD');

        doc.setTextColor(197, 160, 89);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`• ${rec.title}`, margin + 5, y + 6);

        doc.setTextColor(95, 110, 108);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const splitDesc = doc.splitTextToSize(rec.description, pageWidth - 2 * margin - 10);
        doc.text(splitDesc, margin + 5, y + 11);

        y += 22;
      });
    }

    // --- 6. FOOTER ---
    const footerY = pageHeight - 12;
    doc.setDrawColor(232, 226, 214);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(142, 155, 152);
    doc.text('Tadreeb Quran Memorization • Certified Real-Time Acoustic & Tajweed Diagnostic System', margin, footerY);
    doc.text(`Page 1 of 1 • Official User Recitation Archive`, pageWidth - margin, footerY, { align: 'right' });

    return doc;
  }

  /**
   * Generates and triggers automatic download of the PDF
   */
  public downloadReport(report: VoiceCompareReport, customFileName?: string) {
    const doc = this.generatePdf(report);
    const fileName = customFileName || `Tadreeb_Report_${report.ayahReference.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Shares the PDF using the native Web Share API if supported,
   * otherwise falls back to automatic download.
   */
  public async shareReport(report: VoiceCompareReport): Promise<{ success: boolean; method: 'share' | 'download' }> {
    const doc = this.generatePdf(report);
    const fileName = `Tadreeb_Report_${report.ayahReference.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    try {
      const pdfBlob = doc.output('blob');
      if (typeof File !== 'undefined' && typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Tadreeb Recitation Report - ${report.ayahReference}`,
            text: `Here is my Tadreeb Quran recitation comparison report for ${report.wordArabic} with ${report.scholarName} (${report.overallMatchPercentage}% match score).`,
            files: [file],
          });
          return { success: true, method: 'share' };
        }
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        return { success: false, method: 'share' };
      }
    }

    // Fallback to direct download
    this.downloadReport(report, fileName);
    return { success: true, method: 'download' };
  }
}

export const pdfReportService = new PdfReportService();
