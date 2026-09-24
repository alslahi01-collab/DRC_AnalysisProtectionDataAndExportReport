import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Plus, 
  RefreshCw, 
  Users, 
  Home, 
  ShieldAlert, 
  BarChart3, 
  FileCheck, 
  Sparkles,
  Database,
  ArrowRight,
  Filter,
  Eye,
  Layers,
  ChevronDown,
  Info,
  Printer
} from 'lucide-react';
import { 
  DemographicCase, 
  INITIAL_DEMOGRAPHIC_CASES 
} from '../data/demographicCases';
import { 
  parseUploadedFiles, 
  generateSampleTemplates 
} from '../services/dataImportService';
import { 
  calculatePerFileStatistics, 
  FileStatisticalReport 
} from '../services/dynamicAnalysisService';
import { downloadBlob } from '../services/exportService';

interface DataImportAndStatsViewProps {
  cases: DemographicCase[];
  setCases: React.Dispatch<React.SetStateAction<DemographicCase[]>>;
  onNavigateToRpa?: () => void;
  onNavigateToMatrix?: () => void;
}

export const DataImportAndStatsView: React.FC<DataImportAndStatsViewProps> = ({
  cases,
  setCases,
  onNavigateToRpa,
  onNavigateToMatrix
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'per_file' | 'combined'>('per_file');
  const [activeFileFilter, setActiveFileFilter] = useState<string>('all');

  // Compute separated statistics per file dynamically
  const perFileReports = calculatePerFileStatistics(cases);
  const distinctFiles = Array.from(new Set(cases.map(c => c.sourceFile || 'ملف غير محدد')));

  // Filter files to display if a filter is chosen
  const filteredReports = activeFileFilter === 'all' 
    ? perFileReports 
    : perFileReports.filter(r => r.fileName === activeFileFilter);

  // Handle multi-file upload
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setUploadMessage(null);

    try {
      const fileArray = Array.from(files);
      const result = await parseUploadedFiles(fileArray);

      if (result.cases.length === 0) {
        setUploadMessage({
          type: 'error',
          text: 'لم يتم العثور على سجلات صالحة في الملفات المرفوعة. يرجى التأكد من احتواء الملفات على أعمدة صالحة (الموقع، الجنس، الفئة، إلخ).'
        });
      } else {
        // Replace cases from files of the same name or append new files
        setCases(prev => {
          const uploadedNames = new Set(result.summary.fileNames);
          const filteredPrev = prev.filter(c => !uploadedNames.has(c.sourceFile));
          return [...filteredPrev, ...result.cases];
        });
        setUploadMessage({
          type: 'success',
          text: `تم بنجاح رفع ومعالجة ${result.summary.totalFiles} ملف واستخراج ${result.cases.length} حالة مسح. تم توليد الجداول الإحصائية ومصفوفة المخاطر تلقائياً.`
        });
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setUploadMessage({
        type: 'error',
        text: 'حدث خطأ أثناء معالجة الملفات. يرجى التأكد من سلامة ملفات Excel أو CSV.'
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove a specific file from the dataset
  const handleRemoveFile = (fileName: string) => {
    setCases(prev => prev.filter(c => c.sourceFile !== fileName));
    setUploadMessage({
      type: 'success',
      text: `تم حذف بيانات الملف (${fileName}) بنجاح.`
    });
    if (activeFileFilter === fileName) {
      setActiveFileFilter('all');
    }
  };

  // Clear all data
  const handleClearAll = () => {
    setCases([]);
    setUploadMessage({
      type: 'success',
      text: 'تم مسح كافة البيانات بنجاح. يمكنك الآن رفع ملفات جديدة أو تحميل حزمة المعاينة.'
    });
  };

  // Load sample demo package (3 separate files)
  const handleLoadDemoPackage = () => {
    setCases(INITIAL_DEMOGRAPHIC_CASES);
    setUploadMessage({
      type: 'success',
      text: 'تم تحميل حزمة الملفات النموذجية المنفصلة للمعاينة بنجاح.'
    });
  };

  // Download template
  const handleDownloadTemplate = () => {
    const templates = generateSampleTemplates();
    downloadBlob(templates.excelBlob, 'Protection_Assessment_Template.xlsx');
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          HERO & WELCOME UPLOAD SECTION
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>معالج رصد الحماية واستيراد البيانات المتعددة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              استيراد وتحليل ملفات الرصد الإنساني (Excel / CSV)
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              ارفع ملف إكسل واحد أو عدة ملفات دفعة واحدة. يقوم التطبيق تلقائياً بقراءة البيانات، وتوليد جداول إحصائية منفصلة لكل ملف مع اسمه وعنوانه، واستخراج مصفوفة المخاطر القطاعية وتقارير التقييم الإنساني الشامل.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-colors"
              title="تنزيل نموذج إكسل قياسي لتعبئة البيانات"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>تنزيل قالب إكسل القياسي</span>
            </button>

            {cases.length === 0 ? (
              <button
                onClick={handleLoadDemoPackage}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                title="تحميل حزمة 3 ملفات افتراضية منفصلة للمعاينة الفورية"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>تحميل ملفات تجريبية للمعاينة</span>
              </button>
            ) : (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold transition-colors"
                title="مسح كافة البيانات للبدء بملفات جديدة"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح البيانات ورفع ملفات جديدة</span>
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            DRAG & DROP ZONE
           ========================================================================= */}
        <div className="mt-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            multiple
            accept=".xlsx, .xls, .csv"
            className="hidden"
            id="multi-file-upload-input"
          />

          <label
            htmlFor="multi-file-upload-input"
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 block ${
              isProcessing 
                ? 'border-indigo-400 bg-indigo-50/50' 
                : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 bg-slate-50/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <p className="text-base font-bold text-slate-900">
                {isProcessing ? 'جاري قراءة ومعالجة الملفات المرفوعة...' : 'اسحب وأفلت ملفات Excel أو CSV هنا، أو انقر للاختيار من جهازك'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                يدعم رفع ملف واحد أو عدة ملفات معاً بصيغة <span className="font-semibold text-slate-700">.xlsx, .xls, .csv</span> بمطابقة ذكية لأسماء الأعمدة بالعربية والإنجليزية
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                ملفات إكسل و CSV
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                جداول منفصلة لكل ملف
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                تحليل كمي ونوعي فوري
              </span>
            </div>
          </label>
        </div>

        {/* Upload Message Notice */}
        {uploadMessage && (
          <div className={`mt-4 p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold border ${
            uploadMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
            <button 
              onClick={() => setUploadMessage(null)}
              className="text-xs opacity-75 hover:opacity-100 underline px-2"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          IF NO DATA UPLOADED: Show Friendly Clean Empty State
         ========================================================================= */}
      {cases.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-slate-800">
              لا توجد ملفات أو بيانات مرفوعة حالياً
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تطبيق رصد الحماية مهيأ بالكامل لاستقبال ملفاتك. قم بسحب وإفلات ملفات المسح الخاصة بك في المربع أعلاه لتبدأ المنظومة فوراً في توليد الجداول الإحصائية المستقلة لكل ملف وتقرير RPA.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleLoadDemoPackage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>أو انقر هنا لتحميل 3 ملفات رصد نموذجية للمعاينة</span>
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            IF DATA IS PRESENT: Show Statistical Tables & File Breakdowns
           ========================================================================= */
        <div className="space-y-8">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-700">الملفات المرفوعة ({distinctFiles.length}):</span>
              
              {/* File Filter Selector */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setActiveFileFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeFileFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  كافة الملفات ({cases.length} حالة)
                </button>
                {distinctFiles.map(fn => {
                  const count = cases.filter(c => c.sourceFile === fn).length;
                  return (
                    <button
                      key={fn}
                      onClick={() => setActiveFileFilter(fn)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                        activeFileFilter === fn
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[150px]">{fn}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Switcher & RPA Navigation Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setViewMode('per_file')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === 'per_file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الجداول المنفصلة لكل ملف
                </button>
                <button
                  onClick={() => setViewMode('combined')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === 'combined' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  جدول المقارنة والتجميع الشامل
                </button>
              </div>

              {/* Print to PDF Button */}
              <button
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.error('Print failed:', e);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors shrink-0"
                title="طباعة الجداول الإحصائية الحالية بصيغة PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة PDF</span>
              </button>

              {onNavigateToRpa && (
                <button
                  onClick={onNavigateToRpa}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>عرض تقرير RPA</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              VIEW MODE 1: SEPARATED TABLES PER FILE (طلب المستخدم الدقيق)
             ========================================================================= */}
          {viewMode === 'per_file' && (
            <div className="space-y-8">
              {filteredReports.map((report) => (
                <div 
                  key={report.fileName}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Distinct File Card Title Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900">
                            جدول إحصائيات ملف: {report.fileName}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {report.totalRecords} حالة مسجلة
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          إحصائيات تفصيلية مستقلة مستخرجة بالكامل من واقع بيانات هذا الملف فقط
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(report.fileName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                      title="حذف هذا الملف فقط من التحليل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف هذا الملف</span>
                    </button>
                  </div>

                  {/* Summary Metric Badges for this specific file */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="block text-[11px] font-semibold text-slate-500">النازحون (IDPs)</span>
                      <span className="text-lg font-black text-slate-900">{report.idpCount} ({report.idpPercent}%)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="block text-[11px] font-semibold text-slate-500">المجتمع المضيف</span>
                      <span className="text-lg font-black text-slate-900">{report.hostCount} ({report.hostPercent}%)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="block text-[11px] font-semibold text-slate-500">الإناث</span>
                      <span className="text-lg font-black text-purple-700">{report.femaleCount} ({report.femalePercent}%)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="block text-[11px] font-semibold text-slate-500">أسر ترأسها نساء</span>
                      <span className="text-lg font-black text-rose-700">{report.femaleHeadOfHHCount}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="block text-[11px] font-semibold text-slate-500">الأطفال (0-17)</span>
                      <span className="text-lg font-black text-blue-700">{report.childrenCount} ({report.childrenPercent}%)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="block text-[11px] font-semibold text-slate-500">ذوو الإعاقة</span>
                      <span className="text-lg font-black text-amber-700">{report.pwdCount} ({report.pwdPercent}%)</span>
                    </div>
                  </div>

                  {/* -------------------------------------------------------------
                      TABLE 1 FOR THIS FILE: LOCATION & POPULATION GROUP
                     ------------------------------------------------------------- */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        <span>أولاً: جدول أعداد الحالات حسب الموقع والفئة (نازح / مجتمع مضيف) في ملف ({report.fileName})</span>
                      </h4>
                      <span className="text-xs text-slate-500">الإجمالي: {report.totalRecords} حالة</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-right divide-y divide-slate-200">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="px-4 py-3">الموقع / المخيم</th>
                            <th className="px-4 py-3">النازحون (IDPs)</th>
                            <th className="px-4 py-3">نسبة النزوح %</th>
                            <th className="px-4 py-3">المجتمع المضيف</th>
                            <th className="px-4 py-3">العائدون</th>
                            <th className="px-4 py-3 bg-slate-200 text-slate-900">إجمالي الحالات في الموقع</th>
                            <th className="px-4 py-3">نسبة الموقع من الملف %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {report.locationStats.map((row, rowIdx) => (
                            <tr key={`${row.location}-${rowIdx}`} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-bold text-slate-900">{row.location}</td>
                              <td className="px-4 py-2.5 font-semibold text-indigo-600">{row.idpCount}</td>
                              <td className="px-4 py-2.5 text-slate-600">{row.total > 0 ? Math.round((row.idpCount / row.total) * 100) : 0}%</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-700">{row.hostCount}</td>
                              <td className="px-4 py-2.5 text-slate-600">{row.returneeCount}</td>
                              <td className="px-4 py-2.5 font-black bg-slate-50 text-slate-900">{row.total}</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-600">
                                {report.totalRecords > 0 ? Math.round((row.total / report.totalRecords) * 100) : 0}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100 font-black text-slate-900">
                          <tr>
                            <td className="px-4 py-2.5">الإجمالي الكلي للملف</td>
                            <td className="px-4 py-2.5 text-indigo-700">{report.idpCount}</td>
                            <td className="px-4 py-2.5">{report.idpPercent}%</td>
                            <td className="px-4 py-2.5">{report.hostCount}</td>
                            <td className="px-4 py-2.5">0</td>
                            <td className="px-4 py-2.5 bg-slate-200">{report.totalRecords}</td>
                            <td className="px-4 py-2.5">100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* -------------------------------------------------------------
                      TABLE 2 FOR THIS FILE: GENDER & AGE GROUPS
                     ------------------------------------------------------------- */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        <span>ثانياً: جدول التوزيع الديموغرافي حسب الجنس والفئات العمرية في ملف ({report.fileName})</span>
                      </h4>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-right divide-y divide-slate-200">
                        <thead className="bg-purple-50 text-purple-900 font-bold">
                          <tr>
                            <th className="px-4 py-3">الفئة العمرية</th>
                            <th className="px-4 py-3">الذكور (عدد)</th>
                            <th className="px-4 py-3">نسبة الذكور %</th>
                            <th className="px-4 py-3">الإناث (عدد)</th>
                            <th className="px-4 py-3">نسبة الإناث %</th>
                            <th className="px-4 py-3 bg-purple-100 text-purple-950">إجمالي الفئة العمرية</th>
                            <th className="px-4 py-3">نسبة الفئة من الملف %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {report.genderAgeStats.map((row, rowIdx) => (
                            <tr key={`${row.ageGroup}-${rowIdx}`} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-bold text-slate-900">{row.ageGroup}</td>
                              <td className="px-4 py-2.5 font-semibold text-blue-700">{row.maleCount}</td>
                              <td className="px-4 py-2.5 text-slate-600">{row.malePercent}%</td>
                              <td className="px-4 py-2.5 font-semibold text-rose-700">{row.femaleCount}</td>
                              <td className="px-4 py-2.5 text-slate-600">{row.femalePercent}%</td>
                              <td className="px-4 py-2.5 font-black bg-purple-50 text-purple-950">{row.total}</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-600">
                                {report.totalRecords > 0 ? Math.round((row.total / report.totalRecords) * 100) : 0}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-purple-100 font-black text-purple-950">
                          <tr>
                            <td className="px-4 py-2.5">المجموع الكلي</td>
                            <td className="px-4 py-2.5 text-blue-900">{report.totalRecords - report.femaleCount}</td>
                            <td className="px-4 py-2.5">{100 - report.femalePercent}%</td>
                            <td className="px-4 py-2.5 text-rose-900">{report.femaleCount}</td>
                            <td className="px-4 py-2.5">{report.femalePercent}%</td>
                            <td className="px-4 py-2.5 bg-purple-200">{report.totalRecords}</td>
                            <td className="px-4 py-2.5">100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* -------------------------------------------------------------
                      TABLE 3 & 4 FOR THIS FILE: VULNERABILITIES & PROTECTION CONCERNS
                     ------------------------------------------------------------- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vulnerabilities Table */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <span>ثالثاً: الفئات الأشد ضعفاً وذوو الاحتياجات الخاصة (PSN)</span>
                      </h4>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-right divide-y divide-slate-200">
                          <thead className="bg-amber-50 text-amber-900 font-bold">
                            <tr>
                              <th className="px-3 py-2.5">فئة الضعف / الاحتياج</th>
                              <th className="px-3 py-2.5">العدد</th>
                              <th className="px-3 py-2.5">النسبة من الملف %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {report.vulnerabilities.map((v, vIdx) => (
                              <tr key={`${v.type}-${vIdx}`} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-800">{v.type}</td>
                                <td className="px-3 py-2 font-bold text-amber-700">{v.count}</td>
                                <td className="px-3 py-2 text-slate-600">{v.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Living & Protection Indicators */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                        <span>رابعاً: مؤشرات الحماية الأساسية والخدمات بالملف</span>
                      </h4>
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-600">فاقدو البطاقة الشخصية الرسمية:</span>
                          <span className="font-bold text-rose-700">{report.missingIdCount} حالة ({report.missingIdPercent}%)</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-600">أطفال غير مسجلين (بلا شهادات ميلاد):</span>
                          <span className="font-bold text-rose-700">{report.missingBirthCertCount} طفلاً</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-600">نسبة الأطفال خارج المدارس:</span>
                          <span className="font-bold text-amber-700">{report.outOfSchoolChildrenPercent}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-600">نسبة التبرز بالعراء / انعدام المراحيض:</span>
                          <span className="font-bold text-rose-700">{report.openDefecationPercent}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">أبرز شاغل حماية مسجل بالملف:</span>
                          <span className="font-bold text-slate-900">{report.topProtectionConcern}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================================================================
              VIEW MODE 2: COMBINED & COMPARATIVE MASTER MATRIX
             ========================================================================= */}
          {viewMode === 'combined' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>جدول المقارنة والتجميع الشامل لكافة الملفات المرفوعة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  مقارنة أفقية متقاطعة بين كافة ملفات الرصد المرفوعة لمعرفة الفروقات الإحصائية ونقاط التركيز في كل ملف
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-right divide-y divide-slate-200">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="px-4 py-3">اسم الملف</th>
                      <th className="px-4 py-3">إجمالي الحالات</th>
                      <th className="px-4 py-3">النازحون (IDP %)</th>
                      <th className="px-4 py-3">المجتمع المضيف %</th>
                      <th className="px-4 py-3">نسبة الإناث %</th>
                      <th className="px-4 py-3">أسر ترأسها نساء</th>
                      <th className="px-4 py-3">نسبة الأطفال %</th>
                      <th className="px-4 py-3">ذوو الإعاقة (PSN %)</th>
                      <th className="px-4 py-3">فاقدو الهوية %</th>
                      <th className="px-4 py-3">أبرز شاغل حماية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {perFileReports.map((row, rIdx) => (
                      <tr key={`${row.fileName}-${rIdx}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-indigo-700 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>{row.fileName}</span>
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900">{row.totalRecords}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.idpCount} ({row.idpPercent}%)</td>
                        <td className="px-4 py-3 text-slate-600">{row.hostCount} ({row.hostPercent}%)</td>
                        <td className="px-4 py-3 text-purple-700 font-semibold">{row.femalePercent}%</td>
                        <td className="px-4 py-3 text-rose-700 font-bold">{row.femaleHeadOfHHCount}</td>
                        <td className="px-4 py-3 text-blue-700 font-semibold">{row.childrenPercent}%</td>
                        <td className="px-4 py-3 text-amber-700 font-semibold">{row.pwdPercent}%</td>
                        <td className="px-4 py-3 text-rose-700 font-bold">{row.missingIdPercent}%</td>
                        <td className="px-4 py-3 text-slate-800 text-[11px]">{row.topProtectionConcern}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black text-slate-900">
                    <tr>
                      <td className="px-4 py-3">المجموع الكلي المجمع</td>
                      <td className="px-4 py-3 text-indigo-900">{cases.length}</td>
                      <td className="px-4 py-3">
                        {cases.length > 0 ? Math.round((cases.filter(c => c.populationGroup.includes('نازح')).length / cases.length) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3">
                        {cases.length > 0 ? Math.round((cases.filter(c => c.populationGroup.includes('مضيف')).length / cases.length) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3">
                        {cases.length > 0 ? Math.round((cases.filter(c => c.gender === 'أنثى').length / cases.length) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3 text-rose-700">
                        {cases.filter(c => c.femaleHeadOfHH).length}
                      </td>
                      <td className="px-4 py-3">
                        {cases.length > 0 ? Math.round((cases.filter(c => c.ageGroup.includes('أطفال')).length / cases.length) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3 text-amber-700">
                        {cases.length > 0 ? Math.round((cases.filter(c => c.vulnerabilities.some(v => v.includes('إعاقة'))).length / cases.length) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3 text-rose-700">
                        {cases.length > 0 ? Math.round((cases.filter(c => !c.hasNationalId).length / cases.length) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3 text-slate-600">تحليل قطاعي مركب</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
