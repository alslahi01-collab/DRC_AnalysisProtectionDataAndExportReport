import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  MapPin, 
  Calendar, 
  User, 
  Eye, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { DemographicCase } from '../data/demographicCases';
import { UploadCloud } from 'lucide-react';

interface RawDataExplorerProps {
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
}

export const RawDataExplorer: React.FC<RawDataExplorerProps> = ({
  cases = [],
  onNavigateToUpload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              مستكشف البيانات الخام بانتظار رفع الملفات
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              بمجرد رفع ملفات Excel أو CSV، ستتمكن من استعراض كافة السجلات والحالات الفردية والبحث والتصفية بحسب كل ملف وموقع.
            </p>
          </div>
          {onNavigateToUpload && (
            <div className="pt-2">
              <button
                onClick={onNavigateToUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>الانتقال لرفع ملفات البيانات</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const distinctFiles = Array.from(new Set(cases.map(c => c.sourceFile)));

  // Combine and format records from uploaded cases
  const allRecords = cases.map(item => ({
    ...item,
    recordType: `ملف: ${item.sourceFile}`,
    typeKey: item.sourceFile,
    summaryTitle: `${item.id} - ${item.populationGroup}`,
    summarySubtitle: `الموقع: ${item.location} | الجنس: ${item.gender} (${item.age} سنة) | المأوى: ${item.shelterType}`,
  }));

  const filteredRecords = allRecords.filter(rec => {
    if (selectedFileFilter !== 'all' && rec.sourceFile !== selectedFileFilter) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const stringified = JSON.stringify(rec).toLowerCase();
    return stringified.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            مستكشف البيانات الميدانية الخام (Raw Field Survey Explorer)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          أداة بحث وفحص تفاعلية لكافة الحالات والسجلات المستخرجة من ملفاتك المرفوعة ({allRecords.length} حالة مسجلة). يمكنك تصفية السجلات بحسب كل ملف والبحث بأي كلمة مفتاحية.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="ابحث بالاسم، الموقع، الكلمات المفتاحية (نازح، بطاقة، مأوى...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* File Filter Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedFileFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedFileFilter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            كافة الملفات ({allRecords.length})
          </button>
          {distinctFiles.map(fn => {
            const count = allRecords.filter(r => r.sourceFile === fn).length;
            return (
              <button
                key={fn}
                onClick={() => setSelectedFileFilter(fn)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedFileFilter === fn
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fn} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Records Count & Results */}
      <div className="text-xs font-semibold text-slate-500 px-1">
        عرض {filteredRecords.length} من أصل {allRecords.length} استمارة ميدانية
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredRecords.map((record, recIdx) => {
          const isSelected = selectedRecord?.id === record.id;
          return (
            <div
              key={`${record.id}-${record.sourceFile || ''}-${recIdx}`}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isSelected ? 'border-rose-400 ring-1 ring-rose-400 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => setSelectedRecord(isSelected ? null : record)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                      record.typeKey === 'kii' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : record.typeKey === 'fgd'
                        ? 'bg-pink-50 text-pink-700 border border-pink-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {record.recordType}
                    </span>
                    <span className="text-2xs font-mono text-slate-400">ID: #{record.id}</span>
                    <span className="text-2xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {(record as any).date || '2026-09'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{record.summaryTitle}</h3>
                  <p className="text-xs text-slate-500">{record.summarySubtitle}</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 shrink-0">
                  <span>{isSelected ? 'طي التفاصيل' : 'استعراض الإجابات الكاملة'}</span>
                  {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Details Section */}
              {isSelected && (
                <div className="p-5 bg-slate-50 border-t border-slate-200 text-xs space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                    النص الكامل والبيانات التفصيلية للاستمارة:
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(record).map(([key, value], entryIdx) => {
                      if (['recordType', 'typeKey', 'summaryTitle', 'summarySubtitle'].includes(key)) return null;
                      if (typeof value === 'object' && value !== null) {
                        return (
                          <div key={`${key}-${entryIdx}`} className="bg-white p-3.5 rounded-xl border border-slate-200 col-span-1 md:col-span-2">
                            <span className="font-bold text-slate-900 block mb-1 text-2xs">{key}:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {Object.entries(value).map(([k, v], vIdx) => (
                                <span
                                  key={`${k}-${vIdx}`}
                                  className={`px-2 py-0.5 rounded-md text-2xs font-medium ${
                                    Boolean(v) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={`${key}-${entryIdx}`} className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-600 block text-2xs">{key}:</span>
                          <span className="text-slate-900 font-medium block mt-0.5 leading-relaxed">
                            {String(value) || '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
