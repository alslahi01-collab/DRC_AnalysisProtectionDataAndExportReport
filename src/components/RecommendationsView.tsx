import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  ExternalLink, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronRight,
  Send,
  Building,
  Calendar
} from 'lucide-react';
import { PROTECTION_RECOMMENDATIONS } from '../data/protectionData';
import { DemographicCase } from '../data/demographicCases';
import { calculateDynamicRecommendations } from '../services/dynamicAnalysisService';
import { ProtectionRecommendation } from '../types';
import { UploadCloud } from 'lucide-react';

interface RecommendationsViewProps {
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  cases = [],
  onNavigateToUpload
}) => {
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all');

  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              خطة التوصيات الإجرائية بانتظار رفع الملفات
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يقوم التطبيق بترتيب التوصيات وتحديد الأولويات والجهات المسؤولة تلقائياً بحسب أشد قطاعات الحماية تضرراً في الملفات المرفوعة.
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

  const dynamicRecs = calculateDynamicRecommendations(cases);

  const filteredRecs = timeframeFilter === 'all'
    ? dynamicRecs
    : dynamicRecs.filter(r => r.timeframe.includes(timeframeFilter));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">
            خطة التوصيات الإجرائية والتدخلات المنقذة للحياة (Actionable Recommendations)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          توصيات عملية، تشغيلية وقابلة للقياس تم تصنيفها بحسب الأولويات الزمنية الطارئة والجهات الفاعلة المسؤولة لمعالجة فجوات الحماية الحرجة في كافة مواقع الرصد الميداني.
        </p>
      </div>

      {/* Timeframe Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTimeframeFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            timeframeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          كافة الأولويات الزمنية (8 توصيات)
        </button>
        <button
          onClick={() => setTimeframeFilter('فوري')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            timeframeFilter === 'فوري'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>عاجل فوري (0 - 14 يوماً)</span>
        </button>
        <button
          onClick={() => setTimeframeFilter('قصير')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            timeframeFilter === 'قصير'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>قصير المدى (شهر - 3 أشهر)</span>
        </button>
        <button
          onClick={() => setTimeframeFilter('متوسط')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            timeframeFilter === 'متوسط'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>متوسط/طويل المدى (3 - 6 أشهر)</span>
        </button>
      </div>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecs.map((rec) => {
          const isImmediate = rec.timeframe.includes('فوري');
          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs hover:border-slate-300 transition-all space-y-4 ${
                isImmediate ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {rec.id}
                    </span>
                    <span
                      className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                        isImmediate
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rec.timeframe}
                    </span>
                    <span className="text-2xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      مرجع المعيار: {rec.sphereLink}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{rec.title}</h3>
                </div>

                {/* Lead Actors Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-2xs font-semibold text-slate-500 block w-full sm:w-auto">الجهات المسؤولة:</span>
                  {rec.leadActors.map((actor, idx) => (
                    <span
                      key={idx}
                      className="text-2xs font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description & Expected Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">تفاصيل الإجراء التشغيلي المقترح:</span>
                  <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                    {rec.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-emerald-900 block">المخرج والنتيجة المتوقعة (Expected Outcome):</span>
                  <p className="text-emerald-900 font-medium leading-relaxed bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                    {rec.expectedOutcome}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stakeholders Coordination Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span>مصفوفة توزيع الأدوار والتنسيق الإنساني بين الشركاء (Stakeholder Matrix)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">منظمة DRC والشركاء الميدانيين</span>
            <ul className="text-slate-700 space-y-1.5 list-disc list-inside">
              <li>توزيع مواد المأوى الطارئ وحقائب NFI.</li>
              <li>توزيع حقائب الكرامة النسائية (Dignity Kits).</li>
              <li>إدارة حالات حماية الطفل للأطفال المنفصلين الـ 7.</li>
              <li>تسيير العيادة القانونية لاستخراج الوثائق.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">الوحدة التنفيذية والسلطات المحلية</span>
            <ul className="text-slate-700 space-y-1.5 list-disc list-inside">
              <li>تجديد وتأمين عقود إيجار أراضي المخيمات (HLP).</li>
              <li>تسهيل حملات السجل المدني لإصدار الهويات.</li>
              <li>إصدار إفادات عبور تيسر حركة أرباب الأسر.</li>
              <li>إخلاء المدارس وإعادتها لوظيفتها التعليمية.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">كتل قطاعات العمل الإنساني (Clusters)</span>
            <ul className="text-slate-700 space-y-1.5 list-disc list-inside">
              <li>كتلة WASH: تأمين شاحنات مياه شرب وبناء حمامات.</li>
              <li>كتلة الصحة: تسيير عربات وعيادات متنقلة أسبوعياً للمواقع النائية.</li>
              <li>كتلة التعليم: تجهيز فصول دراسية مؤقتة (TLS).</li>
              <li>كتلة الحماية: تنسيق التدخل المتعدد القطاعات.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">مركز الملك سلمان والمانحون الدوليون</span>
            <ul className="text-slate-700 space-y-1.5 list-disc list-inside">
              <li>توسيع الحصص الغذائية لتشمل كافة الأسر المستثناة.</li>
              <li>تمويل مشاريع الإمداد المائي المستدام ومحطات التحلية.</li>
              <li>دعم برامج المساعدات النقدية متعددة الأغراض (MPCA).</li>
              <li>تمويل الأجهزة التعويضية لذوي الإعاقة.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
