import React, { useState } from 'react';
import { 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  RefreshCw,
  MapPin 
} from 'lucide-react';
import { 
  RAW_KII_DATA, 
  RAW_FGD_DATA, 
  RAW_OBSERVATION_DATA, 
  SECTOR_RISK_ANALYSIS, 
  STANDARDS_AND_GAPS, 
  PROTECTION_RECOMMENDATIONS,
  calculateSummaryStats
} from '../data/protectionData';
import { 
  generateWordDocument, 
  generateExcelWorkbook, 
  downloadBlob, 
  filterDataset,
  getLocationLabel 
} from '../services/exportService';
import { LocationFilter } from '../types';

import { DemographicCase } from '../data/demographicCases';
import { UploadCloud } from 'lucide-react';

interface PrintableReportProps {
  initialLocationFilter?: LocationFilter;
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
  availableLocations?: string[];
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ 
  initialLocationFilter = 'all',
  cases = [],
  onNavigateToUpload,
  availableLocations = [],
}) => {
  const [location, setLocation] = useState<LocationFilter>(initialLocationFilter);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const distinctLocations = (availableLocations && availableLocations.length > 0)
    ? availableLocations
    : (cases && cases.length > 0 
        ? Array.from(new Set(cases.map(c => c.location?.trim()))).filter(Boolean)
        : []);

  const locationsHeader = distinctLocations.length > 0 
    ? distinctLocations.join(' و ')
    : 'مواقع الرصد الميداني المستهدفة';

  const stats = calculateSummaryStats();
  const { kii, fgd, obs } = filterDataset(location);

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    try {
      setIsExportingWord(true);
      setStatusMsg(null);
      const blob = await generateWordDocument({
        format: 'docx',
        scope: 'all',
        location,
        includeRawData: true,
        includeStandards: true,
        includeRecommendations: true,
        includeSignatures: true,
      });
      const locSlug = location === 'all' ? 'All_Sites' : location.replace(/[^a-zA-Z0-9_\u0621-\u064A]/g, '_');
      const filename = `Protection_Report_Full_${locSlug}_${new Date().toISOString().split('T')[0]}.docx`;
      downloadBlob(blob, filename);
      setStatusMsg(`تم تنزيل ملف Word بنجاح (${filename})`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تصدير ملف Word');
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      setStatusMsg(null);
      const blob = generateExcelWorkbook({
        format: 'xlsx',
        scope: 'all',
        location,
        includeRawData: true,
        includeStandards: true,
        includeRecommendations: true,
        includeSignatures: true,
      });
      const locSlug = location === 'all' ? 'All_Sites' : location.replace(/[^a-zA-Z0-9_\u0621-\u064A]/g, '_');
      const filename = `Protection_Data_${locSlug}_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(blob, filename);
      setStatusMsg(`تم تنزيل مصنف Excel بنجاح (${filename})`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تصدير ملف Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action banner (hidden in print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
            <FileText className="w-5 h-5 text-rose-600" />
            <span>التقرير الفني الشامل لرصد الحماية والمخاطر الميدانية</span>
          </div>
          <p className="text-xs text-slate-500">
            النطاق الجغرافي المعروض: <span className="font-semibold text-slate-700">{getLocationLabel(location)}</span>
          </p>
          {statusMsg && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusMsg}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dynamic location toggle inside report */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setLocation('all')}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                location === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة المواقع
            </button>
            {distinctLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  location === loc ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors disabled:opacity-50"
            title="تصدير التقرير كاملاً إلى مستند Word (.docx)"
          >
            {isExportingWord ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>تصدير Word (.docx)</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors disabled:opacity-50"
            title="تصدير كافة البيانات إلى مصنف Excel (.xlsx)"
          >
            {isExportingExcel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            <span>تصدير Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            title="طباعة أو حفظ التقرير كملف PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* Official Formal Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs text-slate-900 max-w-5xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Header Section */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-between text-2xs text-slate-500 mb-2">
            <span>الجمهورية اليمنية</span>
            <span>قطاع الحماية الإنسانية (Protection Sector)</span>
            <span>تاريخ التقرير: سبتمبر 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            تقرير رصد الحماية الشامل وتقييم المخاطر والفجوات
          </h1>
          <h2 className="text-base sm:text-lg font-bold text-rose-800">
            {locationsHeader}
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl mx-auto">
            مستند إلى تحليل نوعي وكمي لبيانات المقابلات مع مزودي البيانات الرئيسيين (KII)، مجموعات النقاش البؤرية (FGD)، واستمارات الملاحظة الميدانية المباشرة
          </p>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 text-slate-900">
            1. الملخص التنفيذي والأوضاع العامة (Executive Summary)
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            نفذ فريق رصد الحماية تقييماً شاملاً لأوضاع الأسر المتأثرة والنازحة حديثاً في مواقع الرصد الميداني ({locationsHeader}). أظهرت النتائج أن الأسر تعرضت لانتهاكات وأخطار بالغة أثناء رحلة النزوح وظروف معيشية قاسية تفتقر لمقومات الأمان والكرامة الأساسية. يعيش النازحون في ظروف مأوى بالغة التردي (سكن بالعراء، وفي الفصول وباحات المرافق العامة والمآوي المؤقتة المهترئة)، وسط انقطاع واسع للأطفال عن التعليم، وفقدان 45% - 50% من الأسر لوثائقها الثبوتية، وعجز حاد في مياه الشرب النظيفة، وغياب تام للإنارة الليلية والمراحيض المفصولة مما يضاعف مخاطر العنف القائم على النوع الاجتماعي.
          </p>
        </section>

        {/* Section 2: Methodology & Scope */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 text-slate-900">
            2. منهجية التقييم والأدوات وعينة المشاركين (Methodology & Sample)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold block text-slate-900 mb-1">أداة KII (مزودو المعلومات):</span>
              <p className="text-slate-600">4 مقابلات (2 ذكور، 2 إناث) شملت مندوبي المواقع، لجان CCCM، ومسؤولي التنسيق الميداني.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold block text-slate-900 mb-1">أداة FGD (مجموعات النقاش):</span>
              <p className="text-slate-600">7 جلسات شملت 84 مشاركاً (43 ذكور 51%، 41 إناث 49%) جميعهم في الفئة العمرية 19 - 49 سنة.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold block text-slate-900 mb-1">الملاحظة المباشرة بالمواقع:</span>
              <p className="text-slate-600">استمارات رصد ميداني وملاحظة مباشرة غطت آلاف المستفيدين والأسر المتأثرة في كافة المواقع المستهدفة.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Key Quantitative & Descriptive Indicators */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 text-slate-900">
            3. المؤشرات الإحصائية ونسب الاستجابة التفصيلية (Quantitative Metrics)
          </h3>
          <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-800 font-bold">
              <tr>
                <th className="p-2.5">المؤشر الرئيسي</th>
                <th className="p-2.5">مواقع النزوح الرئيسية</th>
                <th className="p-2.5">المجتمع المضيف والمحيط</th>
                <th className="p-2.5">النسبة الإجمالية</th>
                <th className="p-2.5">مستوى الخطورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 font-semibold">معدل فقدان الأوراق الثبوتية</td>
                <td className="p-2.5">45% - 50%</td>
                <td className="p-2.5">40% - 50%</td>
                <td className="p-2.5 font-bold text-amber-700">46% كمتوسط</td>
                <td className="p-2.5 text-amber-700 font-bold">مرتفع جداً</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold">أطفال بدون شهادات ميلاد رسمية</td>
                <td className="p-2.5">+80 طفلاً</td>
                <td className="p-2.5">+80 طفلاً</td>
                <td className="p-2.5 font-bold text-rose-700">+160 طفلاً</td>
                <td className="p-2.5 text-rose-700 font-bold">حرج للغاية</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold">الأطفال المنفصلون وغير المصحوبين (UASC)</td>
                <td className="p-2.5">7 أطفال موثقين</td>
                <td className="p-2.5">حالات مع الأقارب</td>
                <td className="p-2.5 font-bold text-rose-700">7+ أطفال</td>
                <td className="p-2.5 text-rose-700 font-bold">حرج للغاية</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold">توقف التعليم وتحويل المدارس لمأوى</td>
                <td className="p-2.5">100% (المدرسة مسكونة)</td>
                <td className="p-2.5">100% (المدرسة مسكونة)</td>
                <td className="p-2.5 font-bold text-rose-700">100% حرمان</td>
                <td className="p-2.5 text-rose-700 font-bold">حرج للغاية</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold">انعدام إنارة المراحيض (مخاطر GBV)</td>
                <td className="p-2.5">75% انعدام إنارة</td>
                <td className="p-2.5">100% انعدام إنارة</td>
                <td className="p-2.5 font-bold text-rose-700">87.5% عجز</td>
                <td className="p-2.5 text-rose-700 font-bold">حرج للغاية</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold">أعراض الصدمة والكآبة النفسية</td>
                <td className="p-2.5">100% ظهور أعراض</td>
                <td className="p-2.5">100% ظهور أعراض</td>
                <td className="p-2.5 font-bold text-rose-700">100% انتشار</td>
                <td className="p-2.5 text-rose-700 font-bold">حرج للغاية</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 4: Sector Analysis (PCVA) */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 text-slate-900">
            4. مصفوفة رصد مخاطر الحماية وآليات التكيف والقدرات بحسب القطاعات (PCVA Matrix)
          </h3>
          <div className="space-y-3 text-xs">
            {SECTOR_RISK_ANALYSIS.map((sec) => (
              <div key={sec.sector} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{sec.titleAr}</span>
                  <span className="text-rose-700">{sec.riskLevel} (درجة الخطورة: {sec.riskScore}/100)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <strong className="text-slate-900">التهديدات المباشرة: </strong>
                    {sec.threats[0]}
                  </div>
                  <div>
                    <strong className="text-slate-900">آليات التكيف السلبية: </strong>
                    {sec.copingMechanisms.negative.join('، ')}
                  </div>
                  <div>
                    <strong className="text-slate-900">عوامل الهشاشة: </strong>
                    {sec.vulnerabilities[0]}
                  </div>
                  <div>
                    <strong className="text-slate-900">القدرات المحلية: </strong>
                    {sec.capacities[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Standards Benchmarking & Gap Analysis */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 text-slate-900">
            5. مصفوفة الامتثال للمعايير الدولية وتحليل الفجوات (Sphere, CPMS, IASC, CHS)
          </h3>
          <div className="space-y-2 text-xs">
            {STANDARDS_AND_GAPS.slice(0, 5).map((gap, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{gap.standardName}</span>
                    <span className="text-2xs bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-600">{gap.standardSource}</span>
                  </div>
                  <p className="text-rose-800 text-2xs font-medium">الواقع: {gap.currentObservedStatus}</p>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-2xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                    الامتثال: {gap.complianceRate}% ({gap.gapSeverity})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Actionable Recommendations */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold bg-slate-100 p-2 rounded-lg border-r-4 border-slate-900 text-slate-900">
            6. مصفوفة التوصيات الإجرائية وخطة العمل التشغيلية (Action Plan)
          </h3>
          <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-800 font-bold">
              <tr>
                <th className="p-2.5">المعرف</th>
                <th className="p-2.5">عنوان التدخل الإنساني</th>
                <th className="p-2.5">الإطار الزمني</th>
                <th className="p-2.5">الجهات المسؤولة</th>
                <th className="p-2.5">المخرج المتوقع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {PROTECTION_RECOMMENDATIONS.map((rec) => (
                <tr key={rec.id}>
                  <td className="p-2.5 font-bold text-slate-900">{rec.id}</td>
                  <td className="p-2.5 font-medium text-slate-800">{rec.title}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${rec.timeframe.includes('فوري') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {rec.timeframe}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600">{rec.leadActors.join('، ')}</td>
                  <td className="p-2.5 text-slate-700">{rec.expectedOutcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Formal Signatures & Endorsements */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-xs text-center">
          <div>
            <span className="font-bold text-slate-900 block mb-8">مختص / ضابط رصد الحماية</span>
            <span className="block border-t border-slate-300 pt-1 text-slate-600">التوقيع والاعتماد الفني</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 block mb-8">منسق كتلة الحماية (Protection Cluster)</span>
            <span className="block border-t border-slate-300 pt-1 text-slate-600">التوقيع والختم الرسمي</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 block mb-8">إدارة وتنسيق المخيمات (CCCM / ExU)</span>
            <span className="block border-t border-slate-300 pt-1 text-slate-600">التوقيع وتاريخ الاعتماد</span>
          </div>
        </div>

      </div>
    </div>
  );
};
