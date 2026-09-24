import React from 'react';
import { 
  ShieldAlert, 
  Printer, 
  MapPin, 
  FileSpreadsheet, 
  Users, 
  Eye, 
  Layers, 
  SlidersHorizontal,
  BookmarkCheck,
  CheckCircle2,
  FileText,
  Download,
  UploadCloud
} from 'lucide-react';
import { LocationFilter } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  locationFilter: LocationFilter;
  setLocationFilter: (loc: LocationFilter) => void;
  onPrintReport: () => void;
  onOpenExportModal: () => void;
  casesCount?: number;
  filesCount?: number;
  availableLocations?: string[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  locationFilter,
  setLocationFilter,
  onPrintReport,
  onOpenExportModal,
  casesCount = 0,
  filesCount = 0,
  availableLocations = [],
}) => {
  const tabs = [
    { id: 'overview', label: 'لوحة المؤشرات العامة', icon: SlidersHorizontal },
    { id: 'data_import', label: 'استيراد البيانات والجداول (Excel/CSV)', icon: UploadCloud },
    { id: 'rpa_report', label: 'تقرير RPA الدولي (DRC/ECHO)', icon: FileText },
    { id: 'tools', label: 'تقارير الأدوات المستقلة', icon: FileSpreadsheet },
    { id: 'consolidated', label: 'التحليل المركب والمقارن', icon: Layers },
    { id: 'risk_matrix', label: 'مصفوفة المخاطر والقطاعات', icon: ShieldAlert },
    { id: 'standards', label: 'المعايير الدولية والفجوات', icon: BookmarkCheck },
    { id: 'recommendations', label: 'التوصيات الإجرائية', icon: CheckCircle2 },
    { id: 'explorer', label: 'مستكشف البيانات الخام', icon: Users },
    { id: 'printable', label: 'التقرير الفني الشامل', icon: FileText },
    { id: 'export_center', label: 'مركز التصدير (Word/Excel/PDF)', icon: Download },
  ];

  const locationsSubtitle = availableLocations.length > 0
    ? `لمواقع الرصد الميداني (${availableLocations.join('، ')})`
    : 'لمواقع الرصد الميداني المستهدفة';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  تقرير ومنظومة رصد الحماية الإنسانية الشاملة
                </h1>
                {casesCount === 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                    بانتظار رفع ملفات البيانات (Excel/CSV)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    تم استيراد {filesCount} ملفات ({casesCount} حالة مسجلة)
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  DRC / قطاع الحماية
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                تحليل نوعي وكمي معمق {locationsSubtitle} استناداً إلى أدوات KII و FGD والملاحظة المباشرة
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Dynamic Location Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 font-medium text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                الموقع:
              </span>
              {availableLocations.length > 3 ? (
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  aria-label="تصفية حسب الموقع"
                  className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-2 py-1.5 focus:outline-hidden font-medium"
                >
                  <option value="all">كافة المواقع {casesCount > 0 ? `(${casesCount})` : ''}</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              ) : (
                <>
                  <button
                    onClick={() => setLocationFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                      locationFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    كافة المواقع {casesCount > 0 ? `(${casesCount})` : ''}
                  </button>
                  {availableLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocationFilter(loc)}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                        locationFilter === loc
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Quick Data Import Button */}
            <button
              onClick={() => setActiveTab('data_import')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'data_import'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
              title="رفع ملفات Excel و CSV متعددة دفعة واحدة واستعراض الجداول الإحصائية"
            >
              <UploadCloud className="w-4 h-4" />
              <span>رفع Excel / CSV</span>
            </button>

            {/* Export Action */}
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-700 hover:bg-blue-600 text-white shadow-xs transition-colors shrink-0"
              title="تصدير مخصص للبيانات والتقارير بصيغة Word أو Excel أو PDF"
            >
              <Download className="w-4 h-4" />
              <span>تصدير (Word / Excel / PDF)</span>
            </button>

            {/* Print Action */}
            <button
              onClick={onPrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors shrink-0"
              title="تصدير وطباعة التقرير الفني المكتمل"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto">
        <nav className="flex space-x-2 space-x-reverse min-w-max py-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
