import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  CheckCircle2, 
  Sliders, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Info, 
  Clock, 
  FileCheck,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  ExportConfig, 
  ExportFormat, 
  ExportScope, 
  generateWordDocument, 
  generateExcelWorkbook, 
  generateRpaWordDocument,
  downloadBlob, 
  getLocationLabel, 
  getScopeLabel,
  filterDataset
} from '../services/exportService';
import { LocationFilter } from '../types';
import { DemographicCase } from '../data/demographicCases';

interface ExportCenterViewProps {
  currentLocationFilter: LocationFilter;
  onOpenPrintView?: () => void;
  availableLocations?: string[];
  cases?: DemographicCase[];
}

export const ExportCenterView: React.FC<ExportCenterViewProps> = ({ 
  currentLocationFilter,
  onOpenPrintView,
  availableLocations = [],
  cases = [],
}) => {
  const [format, setFormat] = useState<ExportFormat>('docx');
  const [scope, setScope] = useState<ExportScope>('all');
  const [location, setLocation] = useState<LocationFilter>(currentLocationFilter);
  const [includeRawData, setIncludeRawData] = useState(true);
  const [includeStandards, setIncludeStandards] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingRpa, setIsExportingRpa] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const distinctLocations = (availableLocations && availableLocations.length > 0)
    ? availableLocations
    : (cases && cases.length > 0
        ? Array.from(new Set(cases.map(c => c.location?.trim()))).filter(Boolean)
        : []);

  const { kii, fgd, obs } = filterDataset(location);

  const handleExportRpaWord = async () => {
    try {
      setIsExportingRpa(true);
      setExportSuccessMessage(null);
      const blob = await generateRpaWordDocument('uploaded', 'ar', cases);
      const filename = `Rapid_Protection_Assessment_RPA_${new Date().toISOString().split('T')[0]}.docx`;
      downloadBlob(blob, filename);
      setExportSuccessMessage(`تم بنجاح إنشاء وتنزيل تقرير تقييم الحماية السريع RPA بصيغة Word (.docx): ${filename}`);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير تقرير RPA');
    } finally {
      setIsExportingRpa(false);
    }
  };

  const handleExport = async (overrideFormat?: ExportFormat) => {
    const selectedFormat = overrideFormat || format;
    setIsExporting(true);
    setExportSuccessMessage(null);

    const config: ExportConfig = {
      format: selectedFormat,
      scope,
      location,
      includeRawData,
      includeStandards,
      includeRecommendations,
      includeSignatures,
    };

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const locSlug = location === 'all' ? 'All_Sites' : location.replace(/[^a-zA-Z0-9_\u0621-\u064A]/g, '_');
      const scopeSlug = scope === 'all' ? 'Full_Report' : scope.toUpperCase();

      if (selectedFormat === 'docx') {
        const blob = await generateWordDocument(config);
        const filename = `Protection_Report_${scopeSlug}_${locSlug}_${timestamp}.docx`;
        downloadBlob(blob, filename);
        setExportSuccessMessage(`تم بنجاح إنشاء وتنزيل ملف Word (.docx): ${filename}`);
      } else if (selectedFormat === 'xlsx') {
        const blob = generateExcelWorkbook(config);
        const filename = `Protection_Data_${scopeSlug}_${locSlug}_${timestamp}.xlsx`;
        downloadBlob(blob, filename);
        setExportSuccessMessage(`تم بنجاح تصدير وتنزيل مصنف Excel (.xlsx): ${filename}`);
      } else if (selectedFormat === 'pdf') {
        if (onOpenPrintView) {
          onOpenPrintView();
        } else {
          window.print();
        }
        setExportSuccessMessage('تم فتح واجهة التقرير الفني للطباعة والحفظ بصيغة PDF.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('حدث خطأ أثناء إعداد التصدير. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              منظومة تصدير التقارير الإنسانية الذكية
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مركز تصدير التقارير والبيانات (Word DOCX / Excel XLSX / PDF)
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              قم بتخصيص وتصدير تقرير رصد الحماية الشامل بالمواصفات المعتمدة للمنظمات الإنسانية والكتل الميدانية (Sphere, CPMS, IASC)، سواء لكامل الملفات أو بحسب كل ملف وأداة رصد مستقلة، أو حسب موقع محدد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleExport('docx')}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>تحميل Word (.docx)</span>
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تحميل Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>تصدير PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notice */}
      {exportSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-800 text-sm shadow-xs animate-slideDown">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exportSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Formats & Scopes Selection (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick RPA Report Export Banner */}
          <div className="bg-gradient-to-r from-rose-900 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-800/40">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>النموذج الدولي المعتمد لتقييم الحماية السريع (RPA)</span>
              </div>
              <h4 className="text-base font-bold text-white">
                توليد تقرير تقييم الحماية السريع (DRC / DDG / ECHO)
              </h4>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                توليد التقرير بنظام العمودين المعتمد دولياً مع الأقسام السبعة (النزوح، السلامة، GBV، حماية الطفل، الألغام، الخدمات والتوصيات)
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportRpaWord}
                disabled={isExportingRpa}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50"
              >
                {isExportingRpa ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-blue-600" />}
                <span>تحميل RPA بصيغة Word</span>
              </button>
            </div>
          </div>

          {/* Section 1: Export Format */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
                <h3 className="text-base font-bold text-slate-900">اختر صيغة الملف المصدر (Export Format)</h3>
              </div>
              <span className="text-xs text-slate-500">اختر الصيغة التي تناسب طريقة استخدامك</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Word Card */}
              <button
                type="button"
                onClick={() => setFormat('docx')}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  format === 'docx'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${format === 'docx' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">.DOCX</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">مستند Word (.docx)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    تقرير رسمي متكامل منسق ومجهز للطباعة والتعديل، بجداول ملونة واتجاه قراءة عربي سليم.
                  </p>
                </div>
              </button>

              {/* Excel Card */}
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  format === 'xlsx'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${format === 'xlsx' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">.XLSX</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">مصنف Excel (.xlsx)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    جداول بيانات متعددة الأوراق تشمل المؤشرات والردود الميدانية ومصفوفات المخاطر والتحليل.
                  </p>
                </div>
              </button>

              {/* PDF Card */}
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  format === 'pdf'
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${format === 'pdf' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Printer className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">.PDF</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">تقرير PDF جاهز</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    تصدير فوري وتجهيز للطباعة الرقمية بصيغة PDF بالتنسيق البصري الدقيق للصفحة.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Content Scope / Per-File Filter */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
                <h3 className="text-base font-bold text-slate-900">اختر نطاق التقرير والملفات (Report Scope)</h3>
              </div>
              <span className="text-xs text-slate-500">كامل الملفات أو أداة رصد محددة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* All Files Option */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scope === 'all'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">تقرير شامل لكامل الملفات والأدوات (Complete Report)</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    الملخص التنفيذي، المؤشرات الكمية، KII، FGD، الملاحظة، مصفوفة PCVA، الفجوات، والتوصيات.
                  </div>
                </div>
              </label>

              {/* KII File */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scope === 'kii'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="kii"
                  checked={scope === 'kii'}
                  onChange={() => setScope('kii')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">ملف استمارات مقابلات مزودي المعلومات (KII Only)</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    تحليل وتفريغ بيانات 4 استمارات للمناديب ولجان الإدارة، مؤشرات فقدان الوثائق والمأوى.
                  </div>
                </div>
              </label>

              {/* FGD File */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scope === 'fgd'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="fgd"
                  checked={scope === 'fgd'}
                  onChange={() => setScope('fgd')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">ملف مجموعات النقاش البؤري (FGD Only)</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    تحليل جلسات الرجال والنساء (4 جلسات / 34 مشاركاً)، رحلة النزوح، شهادات الميلاد، والتعليم.
                  </div>
                </div>
              </label>

              {/* Observation File */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scope === 'observation'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="observation"
                  checked={scope === 'observation'}
                  onChange={() => setScope('observation')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">ملف الملاحظة الميدانية بالمواقع (Observation Only)</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    رصد واقع المأوى، مياه الشرب، حمامات الصرف الصحي، غياب الإنارة، والمساحات الآمنة.
                  </div>
                </div>
              </label>

              {/* PCVA Matrix */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scope === 'pcva'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="pcva"
                  checked={scope === 'pcva'}
                  onChange={() => setScope('pcva')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">مصفوفة رصد مخاطر الحماية والقطاعات (PCVA Matrix)</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    تحليل شامل للتهديدات، نقاط الضعف، القدرات، وآليات التكيف السلبية لـ 8 قطاعات إنسانية.
                  </div>
                </div>
              </label>

              {/* Recommendations Plan */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scope === 'recommendations'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="recommendations"
                  checked={scope === 'recommendations'}
                  onChange={() => setScope('recommendations')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">خطة التوصيات الإجرائية والتدخلات المنقذة للحياة</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    مصفوفة التدخلات والأنشطة، الجهات المسؤولة، الأطر الزمنية الفورية والمتوسطة، والنتائج المتوقعة.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Location Scope Filter */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
                <h3 className="text-base font-bold text-slate-900">تصفية الموقع الجغرافي (Location Filter)</h3>
              </div>
              <span className="text-xs text-slate-500">حسب كافة المواقع أو موقع محدد</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLocation('all')}
                className={`p-3.5 rounded-xl border text-right transition-all ${
                  location === 'all'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-bold">كافة المواقع الميدانية</span>
                </div>
                <div className="text-xs text-slate-500">
                  {distinctLocations.length > 0 ? distinctLocations.join(' + ') : 'بيانات جامعة لكافة المواقع'}
                </div>
              </button>

              {distinctLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`p-3.5 rounded-xl border text-right transition-all ${
                    location === loc
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span className="text-sm font-bold">{loc}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    بيانات وإحصاءات موقع {loc} فقط
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Advanced Customization */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">4</span>
                <h3 className="text-base font-bold text-slate-900">خيارات التضمين الإضافية (Advanced Options)</h3>
              </div>
              <span className="text-xs text-slate-500">تخصيص الأقسام الدقيقة للملف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">تضمين الاستمارات الفردية الخام والردود التفصيلية</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeStandards}
                  onChange={(e) => setIncludeStandards(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">تضمين مؤشرات المعايير الدولية وتحليل الفجوات (Sphere / CPMS)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">تضمين جدول التوصيات والجهات المسؤولة والمخرجات المتوقعة</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">تضمين خانات التوقيع والاعتماد الرسمي لكتلة الحماية و DRC</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary & Export Trigger Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs sticky top-24 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                ملخص التقرير المجهز للتصدير
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                بطاقة مواصفات الملف المصدر
              </h3>
            </div>

            {/* Specifications List */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">صيغة الملف:</span>
                <span className="font-bold uppercase text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                  {format === 'docx' ? 'Microsoft Word (.docx)' : format === 'xlsx' ? 'Microsoft Excel (.xlsx)' : 'ملف رقمي طباعي (PDF)'}
                </span>
              </div>

              <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
                <span className="text-slate-500 shrink-0">نطاق المحتوى:</span>
                <span className="font-semibold text-slate-800 text-left max-w-[180px]">
                  {getScopeLabel(scope)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">الموقع الجغرافي:</span>
                <span className="font-semibold text-slate-800">
                  {getLocationLabel(location)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">استمارات KII المشمولة:</span>
                <span className="font-bold text-slate-900">{kii.length} استمارة</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">جلسات FGD المشمولة:</span>
                <span className="font-bold text-slate-900">{fgd.length} جلسات</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">استمارات الملاحظة الميدانية:</span>
                <span className="font-bold text-slate-900">{obs.length} استمارات</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">المعايير الدولية (Sphere):</span>
                <span className="font-semibold text-emerald-700">{includeStandards ? 'مضمنة' : 'مستثناة'}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">خانات الاعتماد والتوقيع:</span>
                <span className="font-semibold text-indigo-700">{includeSignatures ? 'مضمنة' : 'مستثناة'}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleExport()}
                disabled={isExporting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-bold text-sm bg-slate-900 hover:bg-slate-800 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ إعداد وتوليد الملف...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {format === 'docx' 
                        ? 'تصدير وتحميل ملف Word (.docx)' 
                        : format === 'xlsx' 
                        ? 'تصدير وتحميل ملف Excel (.xlsx)' 
                        : 'معاينة وطباعة ملف PDF'}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                * يتم إنشاء الملفات محلياً بدون خوادم خارجية حفاظاً على سرية وحماية بيانات المستفيدين.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
