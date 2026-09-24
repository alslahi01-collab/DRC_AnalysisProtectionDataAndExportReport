import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  ShadingType,
  VerticalAlign
} from 'docx';
import * as XLSX from 'xlsx';
import { 
  RAW_KII_DATA, 
  RAW_FGD_DATA, 
  RAW_OBSERVATION_DATA, 
  SECTOR_RISK_ANALYSIS, 
  STANDARDS_AND_GAPS, 
  PROTECTION_RECOMMENDATIONS,
  calculateSummaryStats
} from '../data/protectionData';
import { LocationFilter, KIIRecord, FGDRecord, ObservationRecord } from '../types';
import { DemographicCase } from '../data/demographicCases';

export type ExportScope = 'all' | 'kii' | 'fgd' | 'observation' | 'pcva' | 'recommendations';
export type ExportFormat = 'docx' | 'xlsx' | 'pdf';

export interface ExportConfig {
  format: ExportFormat;
  scope: ExportScope;
  location: LocationFilter;
  includeRawData: boolean;
  includeStandards: boolean;
  includeRecommendations: boolean;
  includeSignatures: boolean;
}

// Helper to trigger browser file download
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Filter dataset by location
export const filterDataset = (location: LocationFilter) => {
  const filterByLoc = (itemLoc: string) => {
    if (!location || location === 'all') return true;
    return itemLoc.toLowerCase().includes(location.toLowerCase()) || location.toLowerCase().includes(itemLoc.toLowerCase());
  };

  const kii = RAW_KII_DATA.filter(k => filterByLoc(k.location));
  const fgd = RAW_FGD_DATA.filter(f => filterByLoc(f.location));
  const obs = RAW_OBSERVATION_DATA.filter(o => filterByLoc(o.location));

  return { kii, fgd, obs };
};

// Helper to get location name in Arabic
export const getLocationLabel = (location: LocationFilter): string => {
  if (!location || location === 'all') {
    return 'كافة المواقع الميدانية المستهدفة';
  }
  return location;
};

// Helper to get scope name in Arabic
export const getScopeLabel = (scope: ExportScope): string => {
  switch (scope) {
    case 'kii': return 'مقابلات مزودي البيانات الرئيسيين (KII)';
    case 'fgd': return 'مجموعات النقاش البؤري (FGD)';
    case 'observation': return 'استمارات الملاحظة الميدانية (Observation)';
    case 'pcva': return 'مصفوفة رصد مخاطر الحماية والقطاعات (PCVA)';
    case 'recommendations': return 'خطة التوصيات الإجرائية والتدخلات المنقذة للحياة';
    default: return 'تقرير شامل لكافة الملفات والأدوات التحليلية';
  }
};

/**
 * =========================================================================
 * 1. WORD (.DOCX) EXPORT IMPLEMENTATION
 * =========================================================================
 */
export const generateWordDocument = async (config: ExportConfig): Promise<Blob> => {
  const { kii, fgd, obs } = filterDataset(config.location);
  const stats = calculateSummaryStats();
  const locationLabel = getLocationLabel(config.location);
  const scopeLabel = getScopeLabel(config.scope);

  const primaryColor = '0F172A'; // slate-900
  const accentRed = 'BE123C';    // rose-700
  const headerBg = '1E293B';     // slate-800
  const lightBg = 'F8FAFC';      // slate-50
  const borderGray = 'CBD5E1';   // slate-300

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
    left: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
    right: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
  };

  const createCell = (text: string, isHeader = false, widthPercent = 50, customBg?: string, isRed = false) => {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: {
        fill: customBg || (isHeader ? headerBg : 'FFFFFF'),
        type: ShadingType.CLEAR,
      },
      borders: tableBorder,
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text,
              bold: isHeader,
              color: isHeader ? 'FFFFFF' : (isRed ? accentRed : '1E293B'),
              size: isHeader ? 20 : 18,
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });
  };

  const sectionsChildren: any[] = [];

  // Document Title Header
  sectionsChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `الجمهورية اليمنية - مواقع الرصد الميداني (${locationLabel})`,
          size: 18,
          color: '64748B',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'قطاع الحماية الإنسانية (Protection Sector) / منظمة DRC',
          size: 20,
          bold: true,
          color: '047857',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: 'تقرير رصد الحماية الشامل وتقييم المخاطر والفجوات',
          size: 32,
          bold: true,
          color: primaryColor,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `النطاق: ${scopeLabel} | الموقع: ${locationLabel}`,
          size: 20,
          bold: true,
          color: accentRed,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'تاريخ الرصد والتقييم الميداني: 21 - 22 سبتمبر 2026 | أداة التقييم: كتل الحماية و DRC',
          size: 18,
          color: '64748B',
          font: 'Calibri',
        }),
      ],
    })
  );

  // Executive Summary (if all or general)
  if (config.scope === 'all' || config.scope === 'pcva') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: '1. الملخص التنفيذي والأوضاع العامة (Executive Summary)',
            bold: true,
            size: 24,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `نفذ فريق رصد الحماية تقييماً ميدانياً شاملاً استهدف الأسر المتأثرة والنازحة حديثاً في ${locationLabel}. كشفت النتائج عن ظروف حماية إنسانية بالغة الخطورة؛ حيث يعيش مئات النازحين في العراء وباحات المدارس دون خيام أو مقومات مأوى ملائمة، مع فقدان 45% - 50% من الأسر لوثائقها الثبوتية جراء الفرار تحت وطأة النزاع. كما سُجل توقف كامل للتعليم لمئات التلاميذ نتيجة استخدام المدارس كمأوى، وتفشي عمالة الأطفال والتسول، مع أزمة مياه حادة وتدني خدمات الصرف الصحي، وغياب تام للإنارة والمراحيض المفصولة مما يضاعف مخاطر العنف القائم على النوع الاجتماعي.`,
            size: 20,
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Key Quantitative Indicators Table
  if (config.scope === 'all' || config.scope === 'kii' || config.scope === 'fgd') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: '2. جدول أبرز المؤشرات الميدانية والنسب المئوية المحسوبة',
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createCell('المؤشر الميداني الرئيسي', true, 40),
              createCell('مواقع النزوح الرئيسية', true, 20),
              createCell('المجتمع المضيف والمحيط', true, 20),
              createCell('المعدل والتقييم العام', true, 20),
            ],
          }),
          new TableRow({
            children: [
              createCell('معدل فقدان الأوراق الثبوتية والبطاقات', false, 40),
              createCell('45% - 50%', false, 20),
              createCell('40% - 50%', false, 20),
              createCell('46% (مرتفع جداً)', false, 20, 'FFF1F2', true),
            ],
          }),
          new TableRow({
            children: [
              createCell('أطفال محرومون من شهادات الميلاد الرسمية', false, 40),
              createCell('+80 طفلاً', false, 20),
              createCell('+80 طفلاً', false, 20),
              createCell('+160 طفلاً (حرج)', false, 20, 'FFF1F2', true),
            ],
          }),
          new TableRow({
            children: [
              createCell('أطفال منفصلون عن ذويهم (UASC)', false, 40),
              createCell('7 أطفال مع أجدادهم', false, 20),
              createCell('حالات رعاية أقارب', false, 20),
              createCell('7+ أطفال (أولوية قصوى)', false, 20, 'FFF1F2', true),
            ],
          }),
          new TableRow({
            children: [
              createCell('توقف التعليم وتحويل المدارس لمأوى', false, 40),
              createCell('100% توقف للتعليم', false, 20),
              createCell('100% توقف للتعليم', false, 20),
              createCell('100% حرمان لـ 600 طالب', false, 20, 'FFF1F2', true),
            ],
          }),
          new TableRow({
            children: [
              createCell('انعدام الإنارة الليلية حول مرافق الصرف الصحي', false, 40),
              createCell('75% انعدام إنارة', false, 20),
              createCell('100% انعدام إنارة وحمامات', false, 20),
              createCell('87.5% عجز (خطر GBV)', false, 20, 'FFF1F2', true),
            ],
          }),
          new TableRow({
            children: [
              createCell('أعراض الصدمة النفسية والاكتئاب والهلع', false, 40),
              createCell('100% رصد أعراض', false, 20),
              createCell('100% رصد أعراض', false, 20),
              createCell('100% انتشار (احتياج MHPSS)', false, 20, 'FFF1F2', true),
            ],
          }),
        ],
      })
    );
  }

  // KII Section
  if (config.scope === 'all' || config.scope === 'kii') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: `3. نتائج مقابلات مزودي المعلومات الرئيسيين KII (${kii.length} مقابلات)`,
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      })
    );

    kii.forEach((k, idx) => {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 100, after: 60 },
          children: [
            new TextRun({
              text: `استمارة KII #${idx + 1} - ${k.keyInformantName} (${k.role}) | ${k.location} | العمر: ${k.age} سنة | الجنس: ${k.gender}`,
              bold: true,
              size: 20,
              color: '1E3A8A',
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• أوضاع المأوى والبنية التحتية: ', bold: true, size: 18 }),
            new TextRun({ text: `${k.shelterType}. ${k.otherInfraCondition}.`, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• مخاطر حماية النساء والفتيات: ', bold: true, size: 18 }),
            new TextRun({ text: k.risksWomenGirls, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• مخاطر حماية الرجال والفتيان: ', bold: true, size: 18 }),
            new TextRun({ text: k.risksMenBoys, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• مخاطر ذوي الإعاقة والمسنين: ', bold: true, size: 18 }),
            new TextRun({ text: k.risksPwdElderly, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: '• آليات التكيف السلبية المرصودة: ', bold: true, size: 18 }),
            new TextRun({ text: `${k.negativeCopingMechanisms} (نسبة فقدان الوثائق: ${k.idLossPercentage}%).`, size: 18, color: accentRed }),
          ],
        })
      );
    });
  }

  // FGD Section
  if (config.scope === 'all' || config.scope === 'fgd') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: `4. نتائج مجموعات النقاش البؤري FGD (${fgd.length} جلسات)`,
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      })
    );

    fgd.forEach((f, idx) => {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 100, after: 60 },
          children: [
            new TextRun({
              text: `جلسة FGD #${idx + 1} - ${f.location} | الفئة: ${f.gender === 'ذكر' ? 'رجال' : 'نساء'} (${f.totalParticipants} مشارك/ة) | المستهدفون: ${f.targetPopulation}`,
              bold: true,
              size: 20,
              color: '831843',
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• خط سير النزوح والمنشأ: ', bold: true, size: 18 }),
            new TextRun({ text: `${f.displacementOriginAndRoute}. النوايا المستقبلية: ${f.futureIntentions}`, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• حالات الضعف والوثائق وشهادات الميلاد: ', bold: true, size: 18 }),
            new TextRun({ text: `المسنون والمعاقون: ${f.knowElderlyDisabledInjured}. الأطفال المنفصلون: ${f.knowSeparatedUnaccompaniedChildren}. شهادات الميلاد: ${f.birthRegistrationStatus}.`, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: '• التعليم والمخاطر والتكيف: ', bold: true, size: 18 }),
            new TextRun({ text: `التعليم: ${f.canChildrenAttendSchool ? 'متاح' : 'متوقف تماماً'}. مخاطر الأطفال: ${f.childProtectionRisks}. التغلب والتكيف: ${f.howFamiliesOvercome}. التوصيات: ${f.recommendations}`, size: 18 }),
          ],
        })
      );
    });
  }

  // Direct Observation Section
  if (config.scope === 'all' || config.scope === 'observation') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: `5. نتائج استمارات الملاحظة الميدانية المباشرة (${obs.length} استمارات)`,
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      })
    );

    obs.forEach((o, idx) => {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 100, after: 60 },
          children: [
            new TextRun({
              text: `استمارة ملاحظة #${idx + 1} - ${o.location} | الراصد: ${o.observerName} | عدد السكان المقدر: ${o.approxIdpCount} فرداً (${o.approxWomenChildrenCount} نساء وأطفال)`,
              bold: true,
              size: 20,
              color: '065F46',
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• واقع المأوى والراحة: ', bold: true, size: 18 }),
            new TextRun({ text: `${o.shelterType} | بنية تحتية: ${o.otherInfraStatus}.`, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '• المياه والصرف الصحي (WASH): ', bold: true, size: 18 }),
            new TextRun({ text: `مسافة المياه: ${o.nearestWaterDistance}، المسؤول: ${o.waterFetchers}. حمامات منفصلة: ${o.separateLatrinesForSexes ? 'نعم' : 'لا'} | إنارة: ${o.latrinesLighting ? 'نعم' : 'لا'}. مخاطر المياه على النساء: ${o.waterSourceRisksWomenGirls ? 'مرصودة' : 'غير مرصودة'}.`, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: '• المؤشرات النفسية والمساحات الآمنة: ', bold: true, size: 18 }),
            new TextRun({ text: `أعراض الصدمة: ${o.traumaDepressionSymptomsVisible ? 'نعم ملحوظة جداً' : 'لا'} | مساحات آمنة للتجمع: ${o.commonSafeMeetingSpace ? 'متوفرة' : 'منعدمة تماماً'}. المسنون وذوو الإعاقة: ${o.elderlyAndPwdObservations}`, size: 18 }),
          ],
        })
      );
    });
  }

  // PCVA Matrix
  if (config.scope === 'all' || config.scope === 'pcva') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: '6. مصفوفة رصد مخاطر الحماية والقدرات والهشاشة (PCVA) بحسب القطاعات',
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      })
    );

    SECTOR_RISK_ANALYSIS.forEach((sec) => {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: `• ${sec.titleAr} - درجة الخطورة: ${sec.riskScore}/100 (${sec.riskLevel})`,
              bold: true,
              size: 20,
              color: accentRed,
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 30 },
          children: [
            new TextRun({ text: '  - التهديدات المباشرة: ', bold: true, size: 18 }),
            new TextRun({ text: sec.threats.join('، '), size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 30 },
          children: [
            new TextRun({ text: '  - عوامل الضعف والهشاشة: ', bold: true, size: 18 }),
            new TextRun({ text: sec.vulnerabilities.join('، '), size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 30 },
          children: [
            new TextRun({ text: '  - القدرات الذاتية المتاحة: ', bold: true, size: 18 }),
            new TextRun({ text: sec.capacities.join('، '), size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: '  - آليات التكيف السلبية: ', bold: true, size: 18, color: accentRed }),
            new TextRun({ text: sec.copingMechanisms.negative.join('، '), size: 18 }),
          ],
        })
      );
    });
  }

  // Standards and Gaps
  if ((config.scope === 'all' || config.includeStandards) && config.scope !== 'kii' && config.scope !== 'fgd' && config.scope !== 'observation') {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: '7. مؤشرات الامتثال للمعايير الإنسانية الدولية وتحليل الفجوات (Gap Analysis)',
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      })
    );

    STANDARDS_AND_GAPS.forEach((gap) => {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: `[${gap.standardSource}] ${gap.standardName} (نسبة الامتثال: ${gap.complianceRate}% - ${gap.gapSeverity})`,
              bold: true,
              size: 19,
              color: '1E3A8A',
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 30 },
          children: [
            new TextRun({ text: 'المعيار المستهدف: ', bold: true, size: 18 }),
            new TextRun({ text: gap.benchmarkDescription, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 30 },
          children: [
            new TextRun({ text: 'الواقع الميداني: ', bold: true, size: 18, color: accentRed }),
            new TextRun({ text: gap.currentObservedStatus, size: 18 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'الإجراء التصحيحي الواجب: ', bold: true, size: 18, color: '047857' }),
            new TextRun({ text: gap.recommendedAction, size: 18 }),
          ],
        })
      );
    });
  }

  // Recommendations and Action Plan
  if (config.scope === 'all' || config.scope === 'recommendations' || config.includeRecommendations) {
    sectionsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: '8. خطة العمل والتوصيات الإجرائية المنقذة للحياة (Actionable Plan)',
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createCell('المعرف', true, 12),
              createCell('التدخل الإنساني الموصى به', true, 30),
              createCell('الإطار الزمني', true, 18),
              createCell('الجهات المسؤولة', true, 20),
              createCell('النتيجة والمخرج المتوقع', true, 20),
            ],
          }),
          ...PROTECTION_RECOMMENDATIONS.map((rec) => {
            const isImmediate = rec.timeframe.includes('فوري');
            return new TableRow({
              children: [
                createCell(rec.id, false, 12, undefined, isImmediate),
                createCell(rec.title, false, 30),
                createCell(rec.timeframe, false, 18, isImmediate ? 'FFF1F2' : undefined, isImmediate),
                createCell(rec.leadActors.join('، '), false, 20),
                createCell(rec.expectedOutcome, false, 20),
              ],
            });
          }),
        ],
      })
    );
  }

  // Endorsements & Signatures Section
  if (config.includeSignatures) {
    sectionsChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({
            text: 'الاعتمادات والتوقيعات الرسمية:',
            bold: true,
            size: 22,
            color: primaryColor,
            font: 'Calibri',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createCell('مختص / ضابط رصد الحماية (Protection Officer)', true, 33),
              createCell('منسق كتلة الحماية (Protection Cluster Coordinator)', true, 33),
              createCell('إدارة وتنسيق المخيمات (CCCM / ExU)', true, 34),
            ],
          }),
          new TableRow({
            children: [
              createCell('\n\nالتوقيع: .......................................\nالتاريخ: 22 سبتمبر 2026', false, 33),
              createCell('\n\nالتوقيع والختم: ............................\nالتاريخ: 22 سبتمبر 2026', false, 33),
              createCell('\n\nالتوقيع والختم: ............................\nالتاريخ: 22 سبتمبر 2026', false, 34),
            ],
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sectionsChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

/**
 * =========================================================================
 * 2. EXCEL (.XLSX) EXPORT IMPLEMENTATION
 * =========================================================================
 */
export const generateExcelWorkbook = (config: ExportConfig): Blob => {
  const { kii, fgd, obs } = filterDataset(config.location);
  const locationLabel = getLocationLabel(config.location);

  const wb = XLSX.utils.book_new();

  // Sheet 1: General Overview & Summary Indicators
  if (config.scope === 'all' || config.scope === 'pcva') {
    const summaryData = [
      ['تقرير رصد الحماية الشامل - المؤشرات الإحصائية العامة'],
      ['نطاق الموقع المختار:', locationLabel],
      ['تاريخ التصدير:', '22 سبتمبر 2026'],
      [],
      ['المؤشر', 'مواقع النزوح الرئيسية', 'المجتمع المضيف والمحيط', 'المتوسط الإجمالي', 'مستوى الخطورة'],
      ['معدل فقدان الأوراق الثبوتية', '45% - 50%', '40% - 50%', '46%', 'مرتفع جداً'],
      ['أطفال بدون شهادات ميلاد رسمية', '+80 طفلاً', '+80 طفلاً', '+160 طفلاً', 'حرج للغاية'],
      ['أطفال منفصلون عن ذويهم (UASC)', '7 أطفال', 'حالات رعاية أقارب', '7+ أطفال', 'حرج للغاية'],
      ['توقف التعليم واستخدام المدارس كمأوى', '100%', '100%', '100% (600 طالب)', 'حرج للغاية'],
      ['انعدام الإنارة الليلية للمراحيض', '75%', '100%', '87.5%', 'حرج للغاية'],
      ['أعراض الصدمة النفسية الحادة', '100%', '100%', '100%', 'حرج للغاية'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'المؤشرات_العامة');
  }

  // Sheet 2: KII Submissions
  if (config.scope === 'all' || config.scope === 'kii') {
    const kiiHeaders = [
      'معرف الاستمارة', 'التاريخ', 'اسم الراصد', 'الموقع', 'اسم مزود البيانات',
      'الصفة / الدور', 'الجنس', 'العمر', 'الموافقة المستنيرة', 'طبيعة المأوى',
      'مخاطر النساء والفتيات', 'مخاطر الرجال والفتيان', 'مخاطر ذوي الإعاقة والمسنين',
      'نسبة فقدان الوثائق %', 'أطفال غير مصحوبين', 'آليات التكيف السلبية'
    ];
    const kiiRows = kii.map(k => [
      k.id, k.date, k.interviewer, k.location, k.keyInformantName,
      k.role, k.gender, k.age, k.consent ? 'نعم' : 'لا', k.shelterType,
      k.risksWomenGirls, k.risksMenBoys, k.risksPwdElderly,
      k.idLossPercentage, k.unaccompaniedChildren ? 'نعم' : 'لا', k.negativeCopingMechanisms
    ]);
    const wsKii = XLSX.utils.aoa_to_sheet([kiiHeaders, ...kiiRows]);
    XLSX.utils.book_append_sheet(wb, wsKii, 'مقابلات_KII');
  }

  // Sheet 3: FGD Submissions
  if (config.scope === 'all' || config.scope === 'fgd') {
    const fgdHeaders = [
      'المعرف', 'رقم المجموعة', 'التاريخ', 'الموقع', 'الفئة',
      'عدد المشاركين', 'المستهدفون', 'مسار ومنشأ النزوح', 'النوايا المستقبلية',
      'كبار السن والمعاقين', 'الأطفال المنفصلون', 'تسجيل المواليد',
      'إمكانية الذهاب للمدرسة', 'مخاطر حماية الأطفال', 'كيف تتغلب الأسر', 'التوصيات'
    ];
    const fgdRows = fgd.map(f => [
      f.id, f.groupNumber, f.date, f.location, f.gender,
      f.totalParticipants, f.targetPopulation, f.displacementOriginAndRoute, f.futureIntentions,
      f.knowElderlyDisabledInjured, f.knowSeparatedUnaccompaniedChildren, f.birthRegistrationStatus,
      f.canChildrenAttendSchool ? 'نعم' : 'لا (توقف)', f.childProtectionRisks, f.howFamiliesOvercome, f.recommendations
    ]);
    const wsFgd = XLSX.utils.aoa_to_sheet([fgdHeaders, ...fgdRows]);
    XLSX.utils.book_append_sheet(wb, wsFgd, 'مجموعات_FGD');
  }

  // Sheet 4: Direct Observation
  if (config.scope === 'all' || config.scope === 'observation') {
    const obsHeaders = [
      'المعرف', 'التاريخ', 'اسم الراصد', 'الموقع', 'السكان المقدرين',
      'النساء والأطفال المقدرين', 'طبيعة المأوى', 'أضرار البنية التحتية', 'مسافة المياه',
      'المسؤول عن جلب المياه', 'حمامات منفصلة', 'إنارة ليلية',
      'أعراض الصدمة والاكتئاب', 'مساحات آمنة للتجمع', 'ملاحظات المسنين والمعاقين'
    ];
    const obsRows = obs.map(o => [
      o.id, o.date, o.observerName, o.location, o.approxIdpCount,
      o.approxWomenChildrenCount, o.shelterType, o.otherInfraStatus, o.nearestWaterDistance,
      o.waterFetchers, o.separateLatrinesForSexes ? 'نعم' : 'لا', o.latrinesLighting ? 'نعم' : 'لا',
      o.traumaDepressionSymptomsVisible ? 'نعم ملحوظة' : 'لا', o.commonSafeMeetingSpace ? 'نعم' : 'لا', o.elderlyAndPwdObservations
    ]);
    const wsObs = XLSX.utils.aoa_to_sheet([obsHeaders, ...obsRows]);
    XLSX.utils.book_append_sheet(wb, wsObs, 'الملاحظة_الميدانية');
  }

  // Sheet 5: Sector Risks PCVA
  if (config.scope === 'all' || config.scope === 'pcva') {
    const pcvaHeaders = [
      'القطاع', 'العنوان باللغة العربية', 'مستوى الخطورة', 'درجة الخطورة (1-100)',
      'الفئات الأكثر تأثراً', 'التهديدات المباشرة', 'نقاط الضعف والهشاشة',
      'القدرات المحلية المتاحة', 'آليات التكيف الإيجابية', 'آليات التكيف السلبية الضارة'
    ];
    const pcvaRows = SECTOR_RISK_ANALYSIS.map(s => [
      s.sector, s.titleAr, s.riskLevel, s.riskScore,
      s.affectedDemographics, s.threats.join(' | '), s.vulnerabilities.join(' | '),
      s.capacities.join(' | '), s.copingMechanisms.positive.join(' | '), s.copingMechanisms.negative.join(' | ')
    ]);
    const wsPcva = XLSX.utils.aoa_to_sheet([pcvaHeaders, ...pcvaRows]);
    XLSX.utils.book_append_sheet(wb, wsPcva, 'مصفوفة_PCVA');
  }

  // Sheet 6: Standards and Gaps
  if ((config.scope === 'all' || config.includeStandards) && config.scope !== 'kii' && config.scope !== 'fgd' && config.scope !== 'observation') {
    const gapHeaders = [
      'القطاع', 'المعيار الدولي', 'المرجع الدولي', 'الهدف والمؤشر المعتمد',
      'الواقع الميداني المرصود', 'نسبة الامتثال %', 'مستوى شدة الفجوة', 'الإجراء التصحيحي'
    ];
    const gapRows = STANDARDS_AND_GAPS.map(g => [
      g.sector, g.standardName, g.standardSource, g.benchmarkDescription,
      g.currentObservedStatus, g.complianceRate, g.gapSeverity, g.recommendedAction
    ]);
    const wsGaps = XLSX.utils.aoa_to_sheet([gapHeaders, ...gapRows]);
    XLSX.utils.book_append_sheet(wb, wsGaps, 'المعايير_والفجوات');
  }

  // Sheet 7: Action Plan
  if (config.scope === 'all' || config.scope === 'recommendations' || config.includeRecommendations) {
    const recHeaders = [
      'المعرف', 'القطاع', 'عنوان التدخل', 'الإطار الزمني',
      'الجهات المسؤولة والمنفذة', 'تفاصيل الإجراء التشغيلي', 'المخرج والنتيجة المتوقعة', 'رابط المعيار الدولي'
    ];
    const recRows = PROTECTION_RECOMMENDATIONS.map(r => [
      r.id, r.sector, r.title, r.timeframe,
      r.leadActors.join('، '), r.description, r.expectedOutcome, r.sphereLink
    ]);
    const wsRec = XLSX.utils.aoa_to_sheet([recHeaders, ...recRows]);
    XLSX.utils.book_append_sheet(wb, wsRec, 'خطة_التوصيات');
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Generate Word document for Rapid Protection Assessment (RPA) matching the attached PDF format
 */
export const generateRpaWordDocument = async (
  context: 'uploaded' | 'benchmark',
  lang: 'ar' | 'en',
  cases?: DemographicCase[]
): Promise<Blob> => {
  const isAr = lang === 'ar';

  const distinctLocations = cases && cases.length > 0
    ? Array.from(new Set(cases.map(c => c.location?.trim()))).filter(Boolean)
    : [];
  const distinctGovs = cases && cases.length > 0
    ? Array.from(new Set(cases.map(c => c.governorate?.trim()))).filter(Boolean)
    : [];
  const distinctDists = cases && cases.length > 0
    ? Array.from(new Set(cases.map(c => c.district?.trim()))).filter(Boolean)
    : [];

  const locLabel = distinctLocations.length > 0
    ? distinctLocations.join(' و ')
    : (isAr ? 'مواقع الرصد الميداني المستهدفة' : 'Targeted Field Monitoring Sites');

  const adminSubHeader = (distinctDists.length > 0 || distinctGovs.length > 0)
    ? [...new Set([...distinctDists, ...distinctGovs])].filter(Boolean).join('، ')
    : (isAr ? 'المنطقة الميدانية المستهدفة' : 'Target Operational Area');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        children: [
          // Header contact & partners
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr ? "جهة الاتصال والتنسيق: " : "CONTACT: ",
                bold: true,
                color: "C92A2A",
                size: 20,
              }),
              new TextRun({
                text: "protection.lead@humanitarian-cluster.org | maija.butler@drc.ngo",
                size: 19,
                color: "495057",
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr
                  ? "المجلس الدنماركي للاجئين (DRC) | مجموعة إزالة الألغام (DDG) | بدعم من المساعدات الإنسانية للاتحاد الأوروبي (ECHO)"
                  : "Danish Refugee Council (DRC) | Danish Demining Group (DDG) | Funded by European Union Humanitarian Aid",
                bold: true,
                size: 18,
                color: "212529",
              }),
            ],
            spacing: { after: 300 },
          }),

          // Main Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: isAr ? "تقرير تقييم الحماية السريع" : "RAPID PROTECTION ASSESSMENT REPORT",
                bold: true,
                size: 40,
                color: "C92A2A",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: context === 'uploaded'
                  ? (isAr ? `${adminSubHeader} // مواقع الرصد: ${locLabel} // سبتمبر 2026` : `${adminSubHeader} // SITES: ${locLabel} // SEPTEMBER 2026`)
                  : "MALEK & ADIOR COUNTIES, LAKES STATE // SOUTH SUDAN // JANUARY 2020",
                bold: true,
                size: 24,
                color: "343A40",
              }),
            ],
            spacing: { after: 400 },
          }),

          // Section 1: BACKGROUND
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "1. السياق العام ودوافع التقييم الميداني" : "1. BACKGROUND AND TRIGGER FOR ASSESSMENT",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: context === 'uploaded'
                  ? (isAr
                      ? `تقع مواقع الرصد الميداني المستهدفة (${locLabel}) ضمن نطاق ${adminSubHeader}. أدت الظروف الإنسانية والنزاع القائم إلى موجات نزوح متكررة وضغوط بالغة على الخدمات والموارد. نفذ الفريق الميداني المشترك تقييماً سريعاً لبيئة الحماية (RPA) مستخدماً مقابلات مزودي المعلومات (KIIs)، ومجموعات النقاش البؤري (FGDs)، والملاحظة المباشرة (DO) مع التدقيق في مخاطر الحماية المتعددة واحتياجات الفئات الأشد ضعفاً.`
                      : `The monitored field sites (${locLabel}) are located within ${adminSubHeader}. Rapid Protection Assessment (RPA) was conducted using KIIs, FGDs, and direct observation to analyze immediate protection risks and vulnerable groups' needs.`)
                  : "Malek and Adior Counties are located in Yirol East of former Lakes State, bordering the Nile River and Jonglei to the East. In December 2019, a dispute over administration of the main island of Cuet Akuet and surrounding islands referred to collectively as Toich resulted in conflict in the area and displacement of the affected households into Malek and Adior Counties.",
                size: 21,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 2: DISPLACEMENT CONTEXT
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "2. سياق النزوح ومسارات الحركة" : "2. DISPLACEMENT CONTEXT",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: context === 'uploaded'
                  ? (isAr
                      ? `أفادت الأسر في مواقع الرصد (${locLabel}) بأن حركة النزوح جرت في ظروف بالغة الصعوبة وتحت وطأة المخاطر الأمنية؛ حيث فرت الأسر عبر طرق وعرة استغرقت رحلتها عدة أيام. فقدت نسبة كبيرة من الأسر أمتعتها وأوراقها الثبوتية أثناء الفرار السريع. عانى ذوو الإعاقة والأطفال وكبار السن من مشاق استثنائية ونقص في الغذاء ومياه الشرب على طول مسارات العبور.`
                      : `Displaced families in monitored sites (${locLabel}) reported severe transit hardships, loss of civil identification, and extreme exhaustion among children and elderly persons during flight.`)
                  : "According to respondents, the conflict on the islands began in March 2019, and culminated following an attack by armed actors on December 5th. As a result, 5,682 individuals displaced into Malek County and 4,646 into Adior County. IDPs reported fleeing on improvised boats made of plastic sheets and reeds, transiting across 9 main routes.",
                size: 21,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 3: CURRENT POPULATION & LEADERSHIP
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "3. السكان الحاليون المتأثرون والقيادات المجتمعية" : "3. CURRENT POPULATION INCLUDING COMMUNITY LEADERSHIP",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: context === 'uploaded'
                  ? (isAr
                      ? `يشكل النازحون في مواقع التقييم (${locLabel}) النسبة الأكبر من الفئات المعرضة للهشاشة، مع تزايد الأعباء والضغوط الاقتصادية على المجتمع المضيف المحيط في ${adminSubHeader}. تبذل اللجان المجتمعية والقيادات المحلية جهوداً لتسهيل وصول المساعدات واحتواء الخلافات حول نقاط المياه ومصادر المعيشة.`
                      : `Displaced populations in ${locLabel} experience acute vulnerability, alongside growing socioeconomic pressure on host communities in ${adminSubHeader}. Community leadership coordinates dispute resolution and aid prioritization.`)
                  : "According to HNO data, approx. 114,954 individuals live in the host community area of Yirol East. An estimated displaced total of 10,328 HHs indicates a significant population increase. Community leaders work with host leaders to engage in traditional dispute resolution.",
                size: 21,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 4: SAFETY & SECURITY
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "4. السلامة والأمن والانتهاكات المباشرة" : "4. SAFETY & SECURITY",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: context === 'uploaded'
                  ? (isAr
                      ? `تتسم البيئة الأمنية في مواقع الرصد (${locLabel}) بضعف الحماية المادية، انعدام الإنارة الليلية، وتواجد خيام ومآوٍ مؤقتة مكشوفة تفتقر إلى الخصوصية وقفل الأبواب. تشعر غالبية الأسر بعدم الأمان ليلاً، مع رصد مخاطر التهديد بالإخلاء القسري وارتفاع معدلات التوتر حول الموارد المشتركة.`
                      : `Physical safety in ${locLabel} is hindered by lack of secure perimeter fencing, darkness at night, makeshift non-lockable shelters, and heightened eviction vulnerabilities.`)
                  : "Safety and security deteriorated during the attack and displacement. 7 persons were killed, 11 injured, shelters destroyed, and assets looted. Community members faced physical attacks, restrictions on movement, and cattle raiding.",
                size: 21,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 5: DETAILED PROTECTION CONCERNS
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "5. شواغل الحماية التفصيلية" : "5. DETAILED PROTECTION CONCERNS",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr ? "أ. العنف القائم على النوع الاجتماعي (GBV): " : "A. GENDER-BASED VIOLENCE (GBV): ",
                bold: true,
                size: 22,
                color: "862E9C",
              }),
              new TextRun({
                text: isAr
                  ? "مخاطر بالغة نتيجة انعدام المراحيض المغلقة والإنارة الليلية واضطرار النساء للسير مسافات طويلة لجلب المياه. غياب بروتوكولات الرعاية السريرية للمعتدى عليهن (CMR) وأدوية الوقاية بعد التعرض (PEP) وغياب المساحات الصديقة للنساء."
                  : "Acute risks driven by lack of locking latrines, absence of lighting, and long water walks. Critical lack of clinical management of rape (CMR) services, PEP kits within 72 hours, and Women and Girl Friendly Spaces (WGFS).",
                size: 21,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr ? "ب. حماية الطفولة (Child Protection): " : "B. CHILD PROTECTION: ",
                bold: true,
                size: 22,
                color: "862E9C",
              }),
              new TextRun({
                text: isAr
                  ? "تفشي عمالة الأطفال القسرية (جمع البلاستيك والتسول)، التزويج المبكر للفتيات، وتواجد أطفال منفصلين وغير مصحوبين (UASC). أكثر من 65% من الأطفال يفتقرون لشهادات الميلاد الرسمية."
                  : "Widespread child labor, early forced marriage of adolescent girls, and presence of unaccompanied/separated children (UASC). Over 65% of children lack civil birth certificates.",
                size: 21,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr ? "ج. الفئات الأشد ضعفاً وذوو الإعاقة (PSN): " : "C. VULNERABLE GROUPS / PSN: ",
                bold: true,
                size: 22,
                color: "862E9C",
              }),
              new TextRun({
                text: isAr
                  ? "إقصاء ذوي الإعاقة الحركية والحسية وكبار السن والأسر التي ترأسها نساء من طوابير الإغاثة المركزية، مع انعدام المعينات الحركية والرعاية للأمراض المزمنة."
                  : "Exclusion of persons with disabilities, elderly, and female-headed households from centralized relief distribution lines, with acute shortages of assistive devices.",
                size: 21,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr ? "د. مخاطر الألغام ومخلفات الحرب (Mine Action / UXO): " : "D. MINE RISK (UXO & ERW): ",
                bold: true,
                size: 22,
                color: "862E9C",
              }),
              new TextRun({
                text: isAr
                  ? "تقارير عن تلوث مناطق الرعي ومحيط المخيمات بذخائر غير منفجرة (UXO/ERW) وحاجة الأطفال والنازحين لجلسات توعية طارئة (MRE) ومسح هندسي للسلامة."
                  : "Reported explosive ordnance contamination in surrounding pastures and collection tracks, necessitating urgent Mine Risk Education (MRE) and EOD technical clearance.",
                size: 21,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 6: ACCESS TO SERVICES
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "6. الوصول إلى الخدمات وآليات التكيف السلبية" : "6. ACCESS TO SERVICES AND COPING MECHANISMS",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr
                  ? "• الأمن الغذائي: تدهور مستويات الأمن الغذائي مع تقليص عدد الوجبات اليومية والاعتماد على الديون.\n• المياه والإصحاح: شح حاد في مياه الشرب النظيفة، بعد مسافات الجلب، وانعدام المراحيض الآمنة مما يرفع نسب التبرز في العراء.\n• المأوى: تكدس أسري في مآوٍ مهترئة أو السكن في العراء وباحات المرافق العامة.\n• الصحة: صعوبة الوصول للمرافق الصحية ونقص الأدوية الأساسية وتكاليف التنقل الباهظة.\n• التعليم: انقطاع واسع للتلاميذ نتيجة استخدام المدارس كمأوى ونقص المستلزمات والرسوم."
                  : "• Food Security: Severe food gaps and reliance on negative coping mechanisms.\n• WASH: Acute drinking water scarcity, distant water points, and lack of dignified sanitation.\n• Shelter: Severe crowding in fragile shelters or open public spaces.\n• Health: Constrained access to health clinics and costly transit barriers.\n• Education: Widespread school disruption due to facility sheltering and economic hardship.",
                size: 21,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 7: KEY RECOMMENDATIONS
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: isAr ? "7. التوصيات الإجرائية والتدخلات المنقذة للحياة" : "7. KEY RECOMMENDATIONS",
                bold: true,
                color: "C92A2A",
                size: 26,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isAr
                  ? "1. أولوية الفئات الضعيفة: التحول نحو الفرق المتنقلة لإيصال المساعدات لكبار السن وذوي الإعاقة.\n2. عدم إلحاق الضرر (Do No Harm): توخي الحذر في توقيت توزيع أصول المعيشة لضمان أمان وكرامة المستفيدين.\n3. الاستجابة القائمة على الحاجة: شمول الأسر الأكثر ضعفاً في المجتمع المضيف لتجنب النزاعات المجتمعية.\n4. استجابة GBV: تأمين الإنارة الشمسية والمراحيض وتوفير حقائب PEP kits وفتح مساحات WGFS.\n5. حماية الطفولة: تسيير حملات لاستخراج شهادات الميلاد، ودعم تتبع الأسر المنفصلة (FTR).\n6. المياه والمأوى: تأمين إمدادات منتظمة من المياه النقية، وتوزيع حقائب المأوى الطارئة (ESKs) ومساعدات نقدية تكميلية."
                  : "1. Prioritization of PSN in hard to reach locations: Deploy mobile teams to reach isolated persons with disabilities.\n2. Adherence to Do No Harm: Ensure timing and type of assistance does not prompt secondary risks.\n3. Needs-based rather than status-based response: Include vulnerable host community households to mitigate communal friction.\n4. GBV Response: Install solar lighting, locking latrines, procure PEP kits, and establish WGFS.\n5. Child Protection: Mobilize civil birth registration campaigns and expand FTR family tracing.\n6. WASH & Shelter: Deploy safe water distributions and distribute emergency shelter kits with cash assistance for PSN.",
                size: 21,
              }),
            ],
            spacing: { after: 300 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};

