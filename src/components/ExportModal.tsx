import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  ExportConfig, 
  ExportFormat, 
  ExportScope, 
  generateWordDocument, 
  generateExcelWorkbook, 
  downloadBlob, 
  getLocationLabel, 
  getScopeLabel,
  filterDataset 
} from '../services/exportService';
import { LocationFilter } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation: LocationFilter;
  onPrintPreview: () => void;
  availableLocations?: string[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  defaultLocation,
  onPrintPreview,
  availableLocations = []
}) => {
  const [format, setFormat] = useState<ExportFormat>('docx');
  const [scope, setScope] = useState<ExportScope>('all');
  const [location, setLocation] = useState<LocationFilter>(defaultLocation);
  const [includeRawData, setIncludeRawData] = useState(true);
  const [includeStandards, setIncludeStandards] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const { kii, fgd, obs } = filterDataset(location);

  const handleExport = async (targetFormat?: ExportFormat) => {
    const selFormat = targetFormat || format;
    setIsExporting(true);
    setSuccessMsg(null);

    const config: ExportConfig = {
      format: selFormat,
      scope,
      location,
      includeRawData,
      includeStandards,
      includeRecommendations,
      includeSignatures
    };

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const locSlug = location === 'all' ? 'All_Sites' : location.replace(/[^a-zA-Z0-9_\u0621-\u064A]/g, '_');
      const scopeSlug = scope === 'all' ? 'Full_Report' : scope.toUpperCase();

      if (selFormat === 'docx') {
        const blob = await generateWordDocument(config);
        const filename = `Protection_Report_${scopeSlug}_${locSlug}_${timestamp}.docx`;
        downloadBlob(blob, filename);
        setSuccessMsg(`تم تحميل ملف Word بنجاح: ${filename}`);
      } else if (selFormat === 'xlsx') {
        const blob = generateExcelWorkbook(config);
        const filename = `Protection_Data_${scopeSlug}_${locSlug}_${timestamp}.xlsx`;
        downloadBlob(blob, filename);
        setSuccessMsg(`تم تحميل مصنف Excel بنجاح: ${filename}`);
      } else if (selFormat === 'pdf') {
        onPrintPreview();
        onClose();
      }
    } catch (err) {
      console.error('Export failed:', err);
      setSuccessMsg('حدث خطأ أثناء إعداد التصدير. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">تصدير تقرير رصد الحماية والبيانات</h3>
              <p className="text-xs text-slate-300">خيارات التصدير إلى Word (.docx) أو Excel (.xlsx) أو PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Format */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">1. صيغة الملف المطلوب تصديره:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('docx')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === 'docx'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileText className={`w-5 h-5 ${format === 'docx' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === 'xlsx'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${format === 'xlsx' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === 'pdf'
                    ? 'border-rose-600 bg-rose-50/70 text-rose-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Printer className={`w-5 h-5 ${format === 'pdf' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">تقرير PDF</span>
              </button>
            </div>
          </div>

          {/* 2. Scope / File */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">2. نطاق التقرير والملفات:</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ExportScope)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">تقرير شامل لكامل الملفات والأدوات (Complete Report)</option>
              <option value="kii">ملف استمارات مقابلات مزودي المعلومات (KII Only)</option>
              <option value="fgd">ملف مجموعات النقاش البؤري (FGD Only)</option>
              <option value="observation">ملف الملاحظة الميدانية بالمواقع (Observation Only)</option>
              <option value="pcva">مصفوفة رصد مخاطر الحماية والقطاعات (PCVA Matrix Only)</option>
              <option value="recommendations">خطة التوصيات والتدخلات المنقذة للحياة فقط</option>
            </select>
          </div>

          {/* 3. Location */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">3. تصفية الموقع الجغرافي:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocation('all')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                  location === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                كافة المواقع الميدانية
              </button>
              {availableLocations && availableLocations.length > 0 ? (
                availableLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                      location === loc
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {loc}
                  </button>
                ))
              ) : null}
            </div>
          </div>

          {/* 4. Inclusion toggles */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">خيارات التضمين الإضافية:</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span className="text-slate-700">الاستمارات الخام التفصيلية</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStandards}
                  onChange={(e) => setIncludeStandards(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span className="text-slate-700">المعايير الدولية والفجوات</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span className="text-slate-700">مصفوفة التوصيات والجهات</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span className="text-slate-700">خانات التوقيع والاعتماد</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            إلغاء
          </button>
          
          <button
            type="button"
            onClick={() => handleExport()}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جارٍ إنشاء الملف...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  {format === 'docx' 
                    ? 'تصدير Word (.docx)' 
                    : format === 'xlsx' 
                    ? 'تصدير Excel (.xlsx)' 
                    : 'معاينة وطباعة PDF'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
