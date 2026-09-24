import React from 'react';
import { 
  GitMerge, 
  ArrowRight, 
  MapPin, 
  Scale, 
  ShieldAlert, 
  Baby, 
  Users, 
  FileWarning, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Compass
} from 'lucide-react';

import { DemographicCase } from '../data/demographicCases';
import { UploadCloud } from 'lucide-react';

interface ConsolidatedAnalysisViewProps {
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
}

export const ConsolidatedAnalysisView: React.FC<ConsolidatedAnalysisViewProps> = ({
  cases = [],
  onNavigateToUpload
}) => {
  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
            <GitMerge className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              التحليل المركّب والمشترك بانتظار رفع الملفات
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يرجى رفع ملفات Excel أو CSV للبدء في استعراض سلاسل السببية والتحليل المتقاطع وتفكيك القضايا المشتركة والاختلافات بين المواقع.
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

  const distinctLocations = Array.from(new Set(cases.map(c => c.location?.trim()))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <GitMerge className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            التحليل المجتمّع والمركّب (Consolidated & Cross-Cutting Analysis)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          تحليل متقاطع للبيانات يربط مخرجات أدوات KII و FGD والملاحظة المباشرة، لاستكشاف سلاسل السببية للمخاطر، وتفكيك القضايا المشتركة والاختلافات الجغرافية بين مواقع الرصد الميداني المستهدفة.
        </p>
      </div>

      {/* Causality Chain / مسار ترابط المخاطر */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="max-w-3xl mb-6">
          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
            سلسلة السببية للحماية (Protection Risk Causality Chain)
          </span>
          <h3 className="text-lg sm:text-xl font-bold mt-2">
            مسار التدهور التراكمي: كيف تؤدي فجوة واحدة إلى تفاقم كافة قطاعات الحماية؟
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            يوضح الرسم البياني أدناه كيف يرتبط فقدان الوثائق الثبوتية بانهيار سبل العيش وتفشي عمالة الأطفال والتسول ومخاطر العنف القائم على النوع:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative text-xs">
          {/* Step 1 */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold inline-flex items-center justify-center text-xs mb-2">1</span>
              <h4 className="font-bold text-rose-300 text-sm mb-1">النزوح القسري تحت القصف</h4>
              <p className="text-slate-300 leading-relaxed">
                فرار فوري بملابس النوم، فقدان وتلف البطاقات العائلية والهويات (45-50%)، واستدانة مبالغ باهظة للباصات.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-2xs text-rose-400 font-semibold">
              صدمة نفسية + ديون متراكمة
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold inline-flex items-center justify-center text-xs mb-2">2</span>
              <h4 className="font-bold text-amber-300 text-sm mb-1">تقييد الحركة والعزلة</h4>
              <p className="text-slate-300 leading-relaxed">
                عجز أرباب الأسر عن عبور النقاط الأمنية للبحث عن عمل في الحوطة أو عدن خوفاً من الاحتجاز.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-2xs text-amber-400 font-semibold">
              انعدام الدخل بنسبة 100%
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold inline-flex items-center justify-center text-xs mb-2">3</span>
              <h4 className="font-bold text-indigo-300 text-sm mb-1">أزمة المأوى والتعليم</h4>
              <p className="text-slate-300 leading-relaxed">
                انعدام الخيام فيلجأ النازحون لاحتلال المدارس وفنائها، مما يوقف التعليم لـ 600 تلميذ ويحرم الأطفال من مقاعدهم.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-2xs text-indigo-400 font-semibold">
              تسرب دراسي تام 100%
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold inline-flex items-center justify-center text-xs mb-2">4</span>
              <h4 className="font-bold text-pink-300 text-sm mb-1">استراتيجيات التكيف السلبية</h4>
              <p className="text-slate-300 leading-relaxed">
                دفع الأطفال والنساء للتسول، عمالة الأطفال الخطرة، بيع المقتنيات، وتقليل وجبات الغذاء.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-2xs text-pink-400 font-semibold">
              استغلال اقتصادي وإهانة الكرامة
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold inline-flex items-center justify-center text-xs mb-2">5</span>
              <h4 className="font-bold text-red-300 text-sm mb-1">مخاطر العنف والحماية المركبة</h4>
              <p className="text-slate-300 leading-relaxed">
                تصاعد العنف الأسري نتيجة الإحباط، غياب الإنارة والحمامات يهدد النساء بالتحرش، وانعدام الدواء للمسنين.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-2xs text-red-400 font-semibold">
              انتهاك شامل لمعايير الحماية
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Matrix: Location 1 vs Location 2 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              المصفوفة المقارنة: {distinctLocations.length > 1 ? `${distinctLocations[0]} مقابل ${distinctLocations[1]}` : (distinctLocations[0] || 'مواقع الرصد الميداني')}
            </h3>
            <p className="text-xs text-slate-500">القضايا المتطابقة المشتركة مقابل الاختلافات الجغرافية والخدمية بين المواقع</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold">
            {cases[0]?.governorate || cases[0]?.district || 'المواقع الميدانية'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {distinctLocations.slice(0, 2).map((loc, idx) => {
            const locCases = cases.filter(c => c.location === loc || (c.location && c.location.includes(loc)));
            const locIdps = locCases.filter(c => c.populationGroup.includes('نازح')).length;
            const locHosts = locCases.filter(c => c.populationGroup.includes('مضيف')).length;
            const locMissingId = locCases.filter(c => !c.hasNationalId).length;
            const locPwds = locCases.filter(c => c.vulnerabilities.some(v => v.includes('إعاقة'))).length;
            const isFirst = idx === 0;

            return (
              <div 
                key={loc} 
                className={`p-5 rounded-2xl border space-y-3 ${
                  isFirst ? 'bg-blue-50/50 border-blue-200' : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className={`flex items-center justify-between border-b pb-2 ${
                  isFirst ? 'border-blue-200' : 'border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isFirst ? 'text-blue-600' : 'text-amber-600'}`} />
                    <h4 className={`font-bold text-sm ${isFirst ? 'text-blue-900' : 'text-amber-900'}`}>{loc}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-semibold text-2xs ${
                    isFirst ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {locCases.length} حالة مسجلة
                  </span>
                </div>

                <div className="space-y-2 text-slate-700 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 min-w-[90px]">توزيع السكان:</span>
                    <span>{locIdps} نازح ({locCases.length > 0 ? Math.round((locIdps/locCases.length)*100) : 0}%) مقابل {locHosts} مجتمع مضيف.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 min-w-[90px]">المأوى والحماية:</span>
                    <span>أسر تبيت في العراء وفصول المدارس؛ حاجة عاجلة لمآوٍ طارئة عازلة ومساحات صديقة.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 min-w-[90px]">المياه والصرف:</span>
                    <span>شح الإمداد المائي وصعوبة وصول النساء، مع انعدام الحمامات المنارة والخاصة.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 min-w-[90px]">الوثائق والهوية:</span>
                    <span>{locMissingId} حالة فاقدة للوثائق الثبوتية الرسمية ({locCases.length > 0 ? Math.round((locMissingId/locCases.length)*100) : 0}%).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 min-w-[90px]">ذوو الاحتياجات (PSN):</span>
                    <span>{locPwds} حالات مسجلة من ذوي الإعاقة وكبار السن والأمراض المزمنة.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commonalities Summary Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="font-bold text-slate-900 text-xs mb-2">القضايا والسمات المشتركة بنسبة 100% بين الموقعين:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>فقدان الوثائق الثبوتية لـ 45-50% من الأسر.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>تعطيل التعليم 100% لاستخدام المدارس كمأوى.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>ظهور أعراض الصدمة الحادة والاكتئاب على السكان 100%.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>تفشي التسول وعمالة الأطفال كآليات تكيف إجبارية.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>انعدام تام للإنارة الليلية حول مرافق الصرف الصحي.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>غياب أي أجهزة مساعدة أو حمامات مهيأة لذوي الإعاقة.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intersectionality Table: Gender x Age x Disability */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          تحليل تقاطع أوجه الهشاشة (Intersectionality of Protection Vulnerabilities)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          كيف تتداخل محاور الجنس والعمر والإعاقة والحالة الأسرية لتوليد أعباء حماية مضاعفة:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-3">الفئة المتقاطعة</th>
                <th className="p-3">أوجه التداخل والهشاشة المركبة</th>
                <th className="p-3">المخاطر المباشرة المترتبة</th>
                <th className="p-3">آلية التكيف السلبية الملحوظة</th>
                <th className="p-3">التدخل الإنساني الموصى به</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">الفتيات القاصرات غير الملتحقات بالتعليم</td>
                <td className="p-3 text-slate-700">أنثى + طفلة + نازحة + مدرسة معطلة + فقر مدقع للأسرة</td>
                <td className="p-3 text-rose-700 font-semibold">مخاطر التحرش أثناء جلب المياه ليلاً، والزواج المبكر القسري لتخفيف الأعباء.</td>
                <td className="p-3 text-slate-700">تحمل أعباء جلب المياه والمكوث القسري بالخيمة.</td>
                <td className="p-3 text-indigo-700 font-semibold">مساحات صديقة للفتيات، إعادة فتح التعليم، وحقائب كرامة.</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">المسنون مقدمو الرعاية لأحفاد أيتام/منفصلين</td>
                <td className="p-3 text-slate-700">مسن طاعن + مرض مزمن + عجز مالي + مسؤولية رعاية أطفال</td>
                <td className="p-3 text-rose-700 font-semibold">تدهور صحي، عجز عن إطعام الأحفاد، خطر ضياع الأطفال وتشاهدهم.</td>
                <td className="p-3 text-slate-700">دفع الأطفال للتسول في الأسواق لسد الرمق.</td>
                <td className="p-3 text-indigo-700 font-semibold">كفالة نقدية عاجلة (UASC Cash Grant) ورعاية صحية وتغذوية.</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">النساء والفتيات ذوات الإعاقة</td>
                <td className="p-3 text-slate-700">أنثى + إعاقة حركية أو بصرية + أرضية وعرة + انعدام حمام ميسر</td>
                <td className="p-3 text-rose-700 font-semibold">عزلة تامة، عجز عن استخدام المراحيض العادية، وتدهور الكرامة والنظافة.</td>
                <td className="p-3 text-slate-700">الاعتماد المهين على الغير، والحبس الدائم بالخيمة.</td>
                <td className="p-3 text-indigo-700 font-semibold">بناء مرحاض ميسر بمقابض استناد، وكرسي متحرك، ومساعدات عينية.</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">أرباب الأسر الذكور فاقدو الهويات</td>
                <td className="p-3 text-slate-700">رجل + عائل وحيد + فاقد بطاقة + نازح حديث + ديون باصات</td>
                <td className="p-3 text-rose-700 font-semibold">خوف من الاعتقال بالنقاط، عجز عن العمل، انهيار نفسي وتولد العنف الأسري.</td>
                <td className="p-3 text-slate-700">الاستسلام، أو العمل في مهن خطرة جداً، أو الاستدانة والبيع.</td>
                <td className="p-3 text-indigo-700 font-semibold">حملة استخراج وثائق ثبوتية مجانية عاجلة، ومساعدات نقدية متعددة الأغراض.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
