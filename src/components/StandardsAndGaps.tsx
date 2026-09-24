import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  AlertTriangle, 
  CheckCircle, 
  FileBadge, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { STANDARDS_AND_GAPS } from '../data/protectionData';
import { DemographicCase } from '../data/demographicCases';
import { calculateDynamicStandards } from '../services/dynamicAnalysisService';
import { StandardGap } from '../types';
import { UploadCloud } from 'lucide-react';

interface StandardsAndGapsProps {
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
}

export const StandardsAndGaps: React.FC<StandardsAndGapsProps> = ({
  cases = [],
  onNavigateToUpload
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('all');

  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              تحليل الفجوات والمعايير الدولية بانتظار رفع الملفات
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يقوم النظام بحساب نسب الامتثال الفعلية لمعايير إسفير (Sphere Handbook) والمعايير الدنيا لحماية الطفل (CPMS) بصورة ديناميكية من واقع ملفاتك المرفوعة.
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

  const dynamicStandards = calculateDynamicStandards(cases);

  const sources = [
    { id: 'all', label: 'كافة المعايير الدولية' },
    { id: 'Sphere', label: 'معايير إسفير (Sphere Standards)' },
    { id: 'CPMS', label: 'معايير حماية الطفل (CPMS)' },
    { id: 'INEE', label: 'معايير التعليم في الطوارئ (INEE)' },
  ];

  const filteredGaps = selectedSource === 'all'
    ? dynamicStandards
    : dynamicStandards.filter(g => g.standardSource.includes(selectedSource));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <BookmarkCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            ربط النتائج بالمعايير الإنسانية الدولية وتحليل الفجوات (Gap Analysis)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          قياس دقيق لمدى الامتثال لمعايير ميثاق إسفير (Sphere)، المعايير الدنيا لحماية الطفل (CPMS)، إرشادات اللجنة الدائمة المشتركة بين الوكالات (IASC)، والمعيار الإنساني الأساسي للجودة والمساءلة (CHS).
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sources.map((src) => (
          <button
            key={src.id}
            onClick={() => setSelectedSource(src.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSource === src.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {src.label}
          </button>
        ))}
      </div>

      {/* Standards List Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGaps.map((item, index) => {
          const isCritical = item.gapSeverity.includes('حرجة');
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {item.sector}
                    </span>
                    <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.standardSource}
                    </span>
                    <span
                      className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.gapSeverity}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{item.standardName}</h3>
                </div>

                {/* Compliance meter */}
                <div className="flex items-center gap-3 shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <div className="text-right">
                    <span className="text-2xs text-slate-500 block">نسبة الامتثال المتحققة</span>
                    <span className={`text-base font-black ${item.complianceRate <= 20 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.complianceRate}%
                    </span>
                  </div>
                  <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.complianceRate <= 20 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${item.complianceRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Benchmark vs Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Expected Standard */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileBadge className="w-4 h-4 text-indigo-600" />
                    <span>المعيار والمؤشر الدولي المعتمد (Benchmark Target):</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.benchmarkDescription}</p>
                </div>

                {/* Observed Field Reality */}
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                  <span className="font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>الواقع الميداني المرصود في المخيمين (Observed Status):</span>
                  </span>
                  <p className="text-rose-900 leading-relaxed font-medium">{item.currentObservedStatus}</p>
                </div>
              </div>

              {/* Action Required Box */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-950">الإجراء التصحيحي الواجب لتغطية الفجوة: </strong>
                  <span className="text-indigo-900">{item.recommendedAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
