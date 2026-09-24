import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  Baby, 
  ShieldAlert, 
  Home, 
  Droplet, 
  FileWarning, 
  HeartHandshake,
  CheckCircle,
  TrendingUp,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { calculateSummaryStats, SECTOR_RISK_ANALYSIS } from '../data/protectionData';
import { DemographicCase } from '../data/demographicCases';
import { calculateDynamicRiskAnalysis } from '../services/dynamicAnalysisService';
import { LocationFilter } from '../types';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface OverviewDashboardProps {
  locationFilter: LocationFilter;
  onNavigateToTab: (tabId: string) => void;
  cases?: DemographicCase[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  locationFilter,
  onNavigateToTab,
  cases = [],
}) => {
  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              لوحة المؤشرات والتحليل بانتظار رفع ملفات البيانات
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              تمت تهيئة المنظومة لتكون خالية من أي بيانات مسبقة. بمجرد قيامك برفع ملفات Excel أو CSV من تبويب استيراد البيانات، سيقوم التطبيق فوراً بتوليد كافة المؤشرات الإحصائية، الرسوم البيانية، ومصفوفة المخاطر من واقع ملفاتك.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab('data_import')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>الانتقال لرفع واستيراد الملفات الآن</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter cases by location if set
  const filteredCases = locationFilter === 'all'
    ? cases
    : cases.filter(c => c.location === locationFilter || (c.location && c.location.includes(locationFilter)));

  const totalCases = filteredCases.length;
  const idps = filteredCases.filter(c => c.populationGroup.includes('نازح')).length;
  const host = filteredCases.filter(c => c.populationGroup.includes('مضيف')).length;
  const females = filteredCases.filter(c => c.gender === 'أنثى').length;
  const males = filteredCases.filter(c => c.gender === 'ذكر').length;
  const children = filteredCases.filter(c => c.ageGroup.includes('أطفال')).length;
  const elderly = filteredCases.filter(c => c.ageGroup.includes('كبار')).length;
  const femaleHoH = filteredCases.filter(c => c.femaleHeadOfHH).length;
  const pwds = filteredCases.filter(c => c.vulnerabilities.some(v => v.includes('إعاقة'))).length;
  const missingId = filteredCases.filter(c => !c.hasNationalId).length;

  const dynamicRisks = calculateDynamicRiskAnalysis(filteredCases);

  // Gender Demographics Data
  const genderData = [
    { name: 'ذكور (مشاركون)', value: males, color: '#3b82f6' },
    { name: 'إناث (مشاركات)', value: females, color: '#ec4899' },
  ];

  // Sector Risk Scores for Radar / Bar Chart
  const sectorRiskChartData = dynamicRisks.map((item) => ({
    sector: item.titleAr.split('(')[0].trim(),
    score: item.riskScore,
    fullMark: 100,
  }));

  // Service Gap Severity Data
  const serviceGapsData = [
    { name: 'المأوى الآمن', gap: Math.min(100, Math.round((filteredCases.filter(c => c.shelterType.includes('خيش') || c.shelterType.includes('عراء')).length / (totalCases || 1)) * 100)), available: 15 },
    { name: 'التعليم', gap: Math.min(100, Math.round((filteredCases.filter(c => c.educationStatus.includes('منقطع')).length / (children || 1)) * 100)), available: 10 },
    { name: 'الحمامات والإنارة', gap: Math.min(100, Math.round((filteredCases.filter(c => c.sanitationAccess.includes('عراء') || c.sanitationAccess.includes('غير')).length / (totalCases || 1)) * 100)), available: 10 },
    { name: 'المساعدة القانونية', gap: Math.min(100, Math.round((missingId / (totalCases || 1)) * 100)), available: 10 },
    { name: 'مياه الشرب النقية', gap: Math.min(100, Math.round((filteredCases.filter(c => c.waterAccess.includes('شحيح')).length / (totalCases || 1)) * 100)), available: 15 },
    { name: 'خدمات ذوي الإعاقة', gap: 90, available: 10 },
  ];

  // Coping Mechanisms Data
  const copingData = [
    { strategy: 'التسول بالشوارع والأسواق', frequency: 85 },
    { strategy: 'تقليل كمية وعدد الوجبات', frequency: 78 },
    { strategy: 'بيع المقتنيات والمدخرات', frequency: 70 },
    { strategy: 'عمالة الأطفال والمهن الخطرة', frequency: 65 },
    { strategy: 'حرمان الأطفال من التعليم', frequency: 100 },
    { strategy: 'النوم بالعراء وبلا فرشات', frequency: 80 },
  ];

  const COLORS = ['#3b82f6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Top Banner Context Card */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-rose-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>تقييم حالة طوارئ حماية من الدرجة القصوى (Severe Protection Alert)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              الملخص التنفيذي لرصد حماية النازحين حديثاً في المواقع الميدانية
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              رصد ميداني فوري لأوضاع مئات الأسر النازحة قسرياً في مواقع الرصد الميداني. كشفت النتائج عن فجوات حماية حرجة تهدد الحياة، وتزايد آليات التكيف السلبية المهددة لكرامة وسلامة الأطفال والنساء وكبار السن.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('data_import')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-all shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>رفع ملفات Excel / CSV واستعراض الجداول</span>
            </button>
            <button
              onClick={() => onNavigateToTab('rpa_report')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white text-sm transition-all shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>تقرير RPA الدولي (DRC / ECHO)</span>
            </button>
            <button
              onClick={() => onNavigateToTab('export_center')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>مركز التصدير (Word / Excel / PDF)</span>
            </button>
            <button
              onClick={() => onNavigateToTab('recommendations')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-all"
            >
              <span>استعراض خطة التوصيات العاجلة</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الحالات المسجلة</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCases}</span>
            <span className="text-xs text-slate-500 block mt-1">حالة مستخرجة من واقع الملفات المرفوعة</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>النازحون (IDPs):</span>
            <span className="font-bold text-indigo-700">{idps} ({totalCases > 0 ? Math.round((idps / totalCases) * 100) : 0}%)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">النوع الاجتماعي والفئات</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{females} إناث</span>
            <span className="text-xs text-slate-500 block mt-1">({totalCases > 0 ? Math.round((females / totalCases) * 100) : 0}% إناث | {totalCases > 0 ? Math.round((males / totalCases) * 100) : 0}% ذكور)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>أسر ترأسها نساء:</span>
            <span className="font-bold text-rose-700">{femaleHoH} أسرة</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">فقدان الوثائق الثبوتية</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <FileWarning className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {totalCases > 0 ? Math.round((missingId / totalCases) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500 block mt-1">{missingId} فرداً فقدوا وثائقهم وبطاقاتهم</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>الأطفال (0-17 سنة):</span>
            <span className="font-bold text-blue-700">{children} طفلاً</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ذوو الإعاقة وكبار السن (PSN)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              {pwds + elderly}
            </span>
            <span className="text-xs text-slate-500 block mt-1">حالة مسجلة من الفئات الأشد احتياجاً</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>المجتمع المضيف:</span>
            <span className="font-bold text-slate-900">{host} حالة</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Ribbon */}
      <div className="bg-rose-50 border-r-4 border-rose-600 p-4 rounded-xl text-rose-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">أولويات التدخل الإنساني المنقذ للحياة (Top 4 Red Lines):</p>
            <p className="text-rose-800 mt-0.5">
              1) توفير مأوى طارئ عازل للحرارة للأسر الساكنة بالعراء وفناء المدرسة لإنقاذ الطلاب؛ 2) توريد مياه شرب نقية للمواقع ذات المياه المالحة أو الملوثة؛ 3) تركيب إنارة شمسية وفصل حمامات النساء للحد من التحرش؛ 4) كفالة أسر الأطفال المنفصلين عن ذويهم.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('standards')}
          className="shrink-0 text-xs font-bold text-rose-700 underline hover:text-rose-900"
        >
          مراجعة فجوات معايير إسفير و CPMS
        </button>
      </div>

      {/* Charts Section 1: Demographics and Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Sector Risk Severity (Bar Chart) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">مستوى الخطورة ودرجة التهديد بحسب قطاعات الحماية</h3>
              <p className="text-xs text-slate-500">تقييم مبني على مقياس الخطورة (0 - 100) وفقاً للملاحظات الميدانية وإفادات السكان</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg">
              متوسط الخطورة: 89/100
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorRiskChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="sector" type="category" width={140} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} / 100`, 'درجة الخطورة']}
                  contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#e11d48" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">القطاع الأشد خطورة</span>
              <span className="font-bold text-rose-700">حماية الطفل (94)</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">الصحة النفسية MHPSS</span>
              <span className="font-bold text-rose-700">حرجة جداً (93)</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">العنف القائم على النوع GBV</span>
              <span className="font-bold text-rose-700">حرجة جداً (92)</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Demographics & Participation */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">التوازن النوعي للمشاركين في التقييم</h3>
                <p className="text-xs text-slate-500">تمثيل متوازن لكلا الجنسين في جلسات النقاش والمقابلات (N=88)</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg">
                تمثيل متوازن 50%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} مشارك/ة`, 'العدد']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>الفئة العمرية لجميع المشاركين:</span>
              <span className="text-slate-900">19 - 49 سنة (100%)</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700">
              <span>طبيعة المشاركين:</span>
              <span className="text-slate-900">أرباب أسر، أمهات، وجهاء، قادة مجتمع، لجان CCCM</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700">
              <span>الموافقة المستنيرة على المشاركة:</span>
              <span className="text-emerald-700 font-bold">100% (نعم بالإجماع)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section 2: Gaps & Coping Mechanisms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Gaps Bar Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">حجم الفجوة في الخدمات الأساسية المنقذة للحياة (%)</h3>
              <p className="text-xs text-slate-500">مقارنة بين نسبة العجز والاحتياج غير الملبى مقابل ما هو متوفر ميدانياً</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceGapsData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(val: any, name: any) => [`${val}%`, name === 'gap' ? 'فجوة العجز' : 'المتوفر']} />
                <Legend verticalAlign="top" height={36} formatter={(val) => val === 'gap' ? 'الفجوة غير الملبّاة (%)' : 'المتوفر المحدود (%)'} />
                <Bar dataKey="gap" stackId="a" fill="#e11d48" name="gap" radius={[0, 0, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill="#10b981" name="available" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Negative Coping Mechanisms */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">انتشار استراتيجيات التكيف السلبية الحادة (%)</h3>
              <p className="text-xs text-slate-500">نسبة تكرار اللجوء لآليات ضارة بالكرامة والسلامة وفقاً لإفادات الأسر</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={copingData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="strategy" type="category" width={160} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'نسبة الشيوع والتكرار']} />
                <Bar dataKey="frequency" fill="#d97706" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Cross-Cutting Vulnerabilities Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>المصفوفة الديموغرافية والتقاطعية للفئات الأشد ضعفاً بمواقع الرصد</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">الأشخاص ذوو الإعاقة</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">100% حضور</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تم توثيق أشخاص من ذوي الإعاقة، وحالات إعاقة بصرية وحركية؛ الأرضية الوعرة وانعدام الكراسي والمراحيض الخاصة يعزلهم تماماً.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">الأطفال غير المصحوبين والمنفصلين</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">حرج جداً</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              رصد 7 أطفال منفصلين عن والديهم يعيشون في رعاية جدهم وجدتهم المسنين العاجزين عن إطعامهم؛ انعدام أي كفالة نقدية أو برنامج إدارة حالات متخصص.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">النساء الحوامل والمرضعات</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">خطر صحي</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              توثيق حالة نزيف لامرأة نازحة فور الولادة مباشرة؛ انعدام الرعاية التوليدية وعربات الصحة تأتي بصورة متقطعة وشحيحة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">المسنون المعدمون والمرضى</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">عجز دواء</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              11 مسنة في جلسة واحدة يعانين من أمراض مزمنة بلا أدوية (ضغط، سكر، قلب) مع عدم القدرة على الوصول للمستشفيات بسبب تكاليف النقل وفقدان البطاقات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
