import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Baby, 
  Accessibility, 
  FileText, 
  Shield, 
  Home, 
  HeartHandshake, 
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers
} from 'lucide-react';
import { SECTOR_RISK_ANALYSIS } from '../data/protectionData';
import { DemographicCase } from '../data/demographicCases';
import { calculateDynamicRiskAnalysis } from '../services/dynamicAnalysisService';
import { ProtectionSector, SectorRiskAnalysis } from '../types';
import { UploadCloud } from 'lucide-react';

interface ProtectionRiskMatrixProps {
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
}

export const ProtectionRiskMatrix: React.FC<ProtectionRiskMatrixProps> = ({
  cases = [],
  onNavigateToUpload
}) => {
  const [selectedSector, setSelectedSector] = useState<ProtectionSector>('child_protection');

  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              مصفوفة المخاطر القطاعية (PCVA) بانتظار رفع الملفات
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يتم استخراج درجات المخاطر، التهديدات، والهشاشة وآليات التكيف لكل قطاع بناءً على نسب الأسر والنساء والأطفال ومؤشرات المأوى والمياه في الملفات التي ترفعها.
            </p>
          </div>
          {onNavigateToUpload && (
            <div className="pt-2">
              <button
                onClick={onNavigateToUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>الانتقال لرفع ملفات Excel أو CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const dynamicRisks = calculateDynamicRiskAnalysis(cases);
  const currentAnalysis = dynamicRisks.find(s => s.sector === selectedSector) || dynamicRisks[0] || SECTOR_RISK_ANALYSIS[0];

  const getIcon = (sectorName: string) => {
    switch (sectorName) {
      case 'child_protection': return <Baby className="w-5 h-5" />;
      case 'gbv': return <ShieldAlert className="w-5 h-5" />;
      case 'pwd_elderly': return <Accessibility className="w-5 h-5" />;
      case 'legal_docs': return <FileText className="w-5 h-5" />;
      case 'general_protection': return <Shield className="w-5 h-5" />;
      case 'hlp': return <Home className="w-5 h-5" />;
      case 'mhpss': return <HeartHandshake className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h2 className="text-xl font-bold text-slate-900">
            مصفوفة رصد مخاطر الحماية والقدرات والهشاشة (PCVA) وآليات التكيف القطاعية
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          تحليل قطاعي معمق يفكك التهديدات، أوجه الضعف، القدرات الذاتية، وآليات التكيف الإيجابية والسلبية عبر 7 قطاعات حماية متخصصة وفقاً للمنهجية الدولية للكتلة الإنسانية للحماية (Global Protection Cluster).
        </p>
      </div>

      {/* Sector Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {dynamicRisks.map((item) => {
          const isSelected = selectedSector === item.sector;
          return (
            <button
              key={item.sector}
              onClick={() => setSelectedSector(item.sector)}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-xs ring-1 ring-rose-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-rose-200/60 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                  {getIcon(item.sector)}
                </div>
                <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {item.riskScore}/100
                </span>
              </div>
              <span className="text-xs font-bold leading-tight block">
                {item.titleAr.split('(')[0].trim()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Sector Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Ribbon of the Sector */}
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs">
              {getIcon(currentAnalysis.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{currentAnalysis.titleAr}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  درجة الخطورة: {currentAnalysis.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                الفئات الأكثر تأثراً بالقطاع: <strong className="text-white">{currentAnalysis.affectedDemographics}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs shrink-0">
            <div>
              <span className="text-slate-400 block">مؤشر الخطورة المركب</span>
              <span className="text-2xl font-black text-rose-400">{currentAnalysis.riskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
            </div>
          </div>
        </div>

        {/* PCVA Breakdown Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Threats */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>التهديدات ومخاطر الحماية المباشرة (Threats & Direct Risks):</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                {currentAnalysis.threats.map((threat, idx) => (
                  <li key={idx}><span className="text-slate-900 font-medium">{threat}</span></li>
                ))}
              </ul>
            </div>

            {/* Box 2: Vulnerabilities */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>عوامل الهشاشة والضعف الهيكلي (Vulnerabilities):</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                {currentAnalysis.vulnerabilities.map((vuln, idx) => (
                  <li key={idx}><span className="text-slate-900 font-medium">{vuln}</span></li>
                ))}
              </ul>
            </div>

            {/* Box 3: Existing Capacities */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>القدرات ونقاط القوة المجتمعية المتاحة (Local Capacities):</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                {currentAnalysis.capacities.map((cap, idx) => (
                  <li key={idx}><span className="text-slate-900 font-medium">{cap}</span></li>
                ))}
              </ul>
            </div>

            {/* Box 4: Coping Mechanisms */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>آليات التكيف المرصودة (Coping Mechanisms):</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-800 block mb-1">الآليات الإيجابية / المقبولة:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {currentAnalysis.copingMechanisms.positive.map((pos, idx) => (
                      <li key={idx}>{pos}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <span className="font-bold text-rose-800 block mb-1">الآليات السلبية / الضارة:</span>
                  <ul className="list-disc list-inside space-y-1 text-rose-900 font-medium">
                    {currentAnalysis.copingMechanisms.negative.map((neg, idx) => (
                      <li key={idx}>{neg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Violations & Field Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-900 block">
                الانتهاكات للحقوق والمعايير الإنسانية والدولية:
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {currentAnalysis.keyViolations.map((v, idx) => (
                  <li key={idx}>{v}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-900 block">
                الأدلة والقرائن المستخلصة من بيانات الاستمارات الميدانية:
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {currentAnalysis.fieldEvidence.map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
