import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Users, 
  Eye, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  Baby, 
  HeartHandshake, 
  Building, 
  Droplet,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { RAW_KII_DATA, RAW_FGD_DATA, RAW_OBSERVATION_DATA } from '../data/protectionData';

import { DemographicCase } from '../data/demographicCases';
import { UploadCloud } from 'lucide-react';

interface ToolAnalysisViewProps {
  cases?: DemographicCase[];
  onNavigateToUpload?: () => void;
}

export const ToolAnalysisView: React.FC<ToolAnalysisViewProps> = ({
  cases = [],
  onNavigateToUpload
}) => {
  const [selectedTool, setSelectedTool] = useState<'kii' | 'fgd' | 'observation'>('kii');

  const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

  if (!cases || cases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              تقارير الأدوات المستقلة بانتظار رفع الملفات
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يرجى رفع ملفات Excel أو CSV من شاشة استيراد البيانات ليتم استخراج وتحليل نتائج كل أداة رصد بشكل منفصل.
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

  return (
    <div className="space-y-6">
      {/* Sub-navigation for tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-rose-600" />
          <span className="font-bold text-slate-900 text-sm">اختر أداة الرصد لاستعراض تقريرها المستقل:</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm">
          <button
            onClick={() => setSelectedTool('kii')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTool === 'kii'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مزودو المعلومات الرئيسيون (KII - N=4)</span>
          </button>
          <button
            onClick={() => setSelectedTool('fgd')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTool === 'fgd'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مجموعات النقاش البؤرية (FGD - N=7 / 84 مشارك)</span>
          </button>
          <button
            onClick={() => setSelectedTool('observation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTool === 'observation'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>الملاحظة المباشرة بالمواقع (DO - N=4)</span>
          </button>
        </div>
      </div>

      {/* ===================== TOOL 1: KII REPORT ===================== */}
      {selectedTool === 'kii' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  الأداة رقم 1: Key Informant Interviews
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  تقرير رصد الحماية: مقابلات مزودي البيانات الرئيسيين (KII)
                </h2>
                <p className="text-xs text-slate-500">
                  تم إجراء 4 مقابلات معمقة مع قيادات المخيمات ولجان إدارة المخيمات والجهات الإشرافية بمواقع الرصد
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">إجمالي المقابلات</span>
                  <span className="font-bold text-slate-900 text-sm">4 استمارات</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">التوزيع النوعي</span>
                  <span className="font-bold text-slate-900 text-sm">2 ذكور (50%) | 2 إناث (50%)</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">متوسط الأعمار</span>
                  <span className="font-bold text-slate-900 text-sm">38.5 سنة</span>
                </div>
              </div>
            </div>

            {/* Demographics & Roles Table */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">بيانات المستجيبين وأدوارهم القيادية بالموقع:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">اسم مزود البيانات</th>
                      <th className="p-3">الصفة / الدور / التمثيل</th>
                      <th className="p-3">الجنس</th>
                      <th className="p-3">العمر</th>
                      <th className="p-3">الموقع</th>
                      <th className="p-3">المنظمة القائمة بالملاحظة</th>
                      <th className="p-3">الموافقة المستنيرة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {RAW_KII_DATA.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{item.keyInformantName}</td>
                        <td className="p-3 text-slate-700">{item.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${item.gender === 'ذكر' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                            {item.gender}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{item.age} سنة</td>
                        <td className="p-3 text-slate-700">{item.location}</td>
                        <td className="p-3 text-slate-700">{item.organization}</td>
                        <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> نعم (100%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quantitative Indicators Grid (Response Percentages) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-rose-600" />
              <span>النسب المئوية لإجابات مزودي البيانات الرئيسيين على المحاور الحرجة:</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">تواجد ذوي الإعاقة بالموقع</span>
                <span className="text-2xl font-black text-rose-600">100%</span>
                <span className="text-xs text-slate-500 mt-1 block">4 من 4 استمارات أكدوا حضورهم</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">المسنون المعدمون وأصحاب الأمراض</span>
                <span className="text-2xl font-black text-rose-600">100%</span>
                <span className="text-xs text-slate-500 mt-1 block">4 من 4 أكدوا انعدام الأدوية</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">الأطفال غير الملتحقين بالمدرسة</span>
                <span className="text-2xl font-black text-rose-600">100%</span>
                <span className="text-xs text-slate-500 mt-1 block">تحول المدارس لإيواء طارئ</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">أرباب الأسر الأطفال</span>
                <span className="text-2xl font-black text-amber-600">75%</span>
                <span className="text-xs text-slate-500 mt-1 block">3 من 4 استمارات رصدت الظاهرة</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">فقدان وثائق الهوية الرسمية</span>
                <span className="text-2xl font-black text-amber-600">45%</span>
                <span className="text-xs text-slate-500 mt-1 block">متوسط الفقدان بين الأسر (40-50%)</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">أطفال بلا رعاية أو منفصلون</span>
                <span className="text-2xl font-black text-rose-600">50%</span>
                <span className="text-xs text-slate-500 mt-1 block">رصد أطفال يعيشون مع الجدات</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">تقييد حرية الحركة في النقاط</span>
                <span className="text-2xl font-black text-amber-600">50%</span>
                <span className="text-xs text-slate-500 mt-1 block">بسبب عدم حيازة وثائق ثبوتية</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">الحاجة للدعم النفسي والحماية القانونية</span>
                <span className="text-2xl font-black text-rose-600">100%</span>
                <span className="text-xs text-slate-500 mt-1 block">إجماع كامل على انعدام الخدمات</span>
              </div>
            </div>
          </div>

          {/* Qualitative Synthesis of KII */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>مخاطر النساء والفتيات وفق شهادات قادة المخيم:</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed list-disc list-inside">
                <li><strong className="text-slate-900">غياب الخصوصية والستر:</strong> الخيام عبارة عن أقمشة بالية وبلاستيك لا يوفر حرمة، والأسر الوافدة حديثاً تفترش فناء المدرسة الخشبية.</li>
                <li><strong className="text-slate-900">انعدام مرافق الصرف الصحي الساترة:</strong> عدم توفر حمامات ساترة يدفع النساء لانتظار ساعات الليل لقضاء الحاجة في الخلاء مما يعرضهن للتحرش ولدغات الزواحف.</li>
                <li><strong className="text-slate-900">المخاطر الصحية التوليدية:</strong> توثيق حالة امرأة نازحة تعرضت لنزيف حاد نتيجة إجبارها على النزوح فور ولادتها مباشرة في شاحنات وعرة دون أي رعاية طبية.</li>
                <li><strong className="text-slate-900">الحرمان من المساعدات:</strong> حرمان النساء المعيلات والأرامل من التسجيل المستقل للمساعدات لفقدانهن بطاقات الهوية أثناء القصف.</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-600" />
                <span>مخاطر الرجال والأولاد وذوي الاحتياجات الخاصة:</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed list-disc list-inside">
                <li><strong className="text-slate-900">الاستغلال الاقتصادي والأعمال الخطرة:</strong> اضطرار أرباب الأسر والفتيان للعمل في أعمال شاقة (أحمال ثقيلة) بأجور متدنية تضر بصحتهم.</li>
                <li><strong className="text-slate-900">الاحتجاز في النقاط الأمنية:</strong> تعطل حركة أرباب الأسر وعجزهم عن مغادرة المخيم للبحث عن عمل في عدن أو لحج خوفاً من التوقيف لغياب البطاقات.</li>
                <li><strong className="text-slate-900">عزلة ذوي الإعاقة:</strong> طبيعة الأرض الصخرية الترابية غير المستوية تشل حركة أصحاب الإعاقات الحركية، مع غياب كلي للكراسي المتحركة أو الحمامات المهيأة.</li>
                <li><strong className="text-slate-900">المسنون غير المصحوبين:</strong> عجز المسنين غير المصحوبين عن الوصول لمواقع توزيع المساعدات أو الوقوف في الطوابير مما يحرمهم من المعونة.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TOOL 2: FGD REPORT ===================== */}
      {selectedTool === 'fgd' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  الأداة رقم 2: Focus Group Discussions
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  تقرير رصد الحماية: جلسات مجموعات النقاش البؤرية (FGD)
                </h2>
                <p className="text-xs text-slate-500">
                  تم تنفيذ 7 جلسات نقاش بؤري شملت 84 نازحاً ونازحة في مواقع الرصد الميداني المستهدفة
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">إجمالي الجلسات</span>
                  <span className="font-bold text-slate-900 text-sm">7 مجموعات</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">المشاركون</span>
                  <span className="font-bold text-slate-900 text-sm">84 فرداً (43 ذكور 51% | 41 إناث 49%)</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">الفئة العمرية</span>
                  <span className="font-bold text-slate-900 text-sm">19 - 49 سنة (100%)</span>
                </div>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">سجل جلسات النقاش البؤري المنفذة:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">رقم المجموعة</th>
                      <th className="p-3">الموقع / المخيم</th>
                      <th className="p-3">الجنس المستهدف</th>
                      <th className="p-3">عدد المشاركين</th>
                      <th className="p-3">الميسر / مدون الملاحظات</th>
                      <th className="p-3">منطقة النزوح الأصلية</th>
                      <th className="p-3">تاريخ النزوح وطريقته</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {RAW_FGD_DATA.map((session, idx) => (
                      <tr key={session.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">FGD #{session.groupNumber} ({idx + 1})</td>
                        <td className="p-3 text-slate-700">{session.location}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${session.gender === 'ذكر' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                            {session.gender === 'ذكر' ? 'ذكور (رجال/أولاد)' : 'إناث (نساء/فتيات)'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{session.totalParticipants} مشاركاً</td>
                        <td className="p-3 text-slate-700">{session.facilitator} / {session.notetaker}</td>
                        <td className="p-3 text-slate-700">{session.displacementOriginAndRoute.split(';')[0].slice(0, 30)}...</td>
                        <td className="p-3 text-slate-700">{session.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Key Findings in FGDs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertOctagon className="w-4 h-4" />
                <span>أهوال رحلة النزوح وإصابات الحرب</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                أفادت 100% من الجلسات بتعرض النازحين لمخاطر قاتلة في الطريق: النقل بواسطة <em>"قاطرات نقل الثلج"</em> من الخوخة إلى المخا، المشي على الأقدام لمسافات شاقة من الهاملي بموزع، وتعرض الطريق لقصف صاروخي وقذائف هاون أدت لإصابة طفلين وشاب برصاص وشظايا مباشرة، مما خلف صدمات ورعباً شديداً.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Baby className="w-4 h-4" />
                <span>أزمة حماية الطفل في المخيمين</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                رصدت الجلسات <strong>7 أطفال منفصلين عن ذويهم</strong> يقيمون مع أجداد مسنين دون أي دعم. وأكدت الجلسات أن أكثر من <strong>80 طفلاً في كل موقع</strong> يفتقرون لشهادات ميلاد رسمية، وأن <strong>100% من الأطفال متسربون من التعليم</strong> بسبب تحويل المدارس لمساكن للأسر، مع شيوع ظاهرة دفع الأطفال للتسول.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <HeartHandshake className="w-4 h-4" />
                <span>العلاقات مع المجتمع المضيف</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                أجمعت كافة الجلسات (100%) على أن العلاقات مع المجتمع المضيف في تبن/لحج <strong>جيدة جداً ومتعاطفة</strong> ولا توجد عداوات. إلا أن نقاط التوتر الكامنة تنشأ حصرياً من التنافس الشديد على الموارد المحدودة وخاصة مصادر المياه الشحيحة وعدم كفاية السلال الغذائية الموزعة.
              </p>
            </div>
          </div>

          {/* Direct Quotations & Field Voices */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md">
            <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>أصوات من الميدان (شهادات واقتباسات موثقة من جلسات FGD):</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="italic text-slate-200 mb-2">
                  "خرجنا من مناطق النزوح مشياً على الأقدام لمسافات بعيدة تحت الخوف، ولما وصلنا استأجرنا باصاً بالدَّيْن لأننا لا نملك ريالاً واحداً.. وعندما استلمنا المساعدة النقدية من المنظمة، أخذها صاحب الباص بالكامل لسداد أجرته وبقينا جائعين بلا طعام أو فراش."
                </p>
                <span className="text-amber-400 text-2xs font-semibold block">— نساء نازحات (جلسة FGD #02)</span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="italic text-slate-200 mb-2">
                  "المأوى عبارة عن طرابيل بلاستيكية تحولت في النهار إلى أفران حارقة لا يستطيع الأطفال والمسنون المكوث داخلها، وننام بالليل على التراب دون أغطية.. لا يوجد حمام واحد ساتر للنساء، ونعيش في رعب من قصف الطريق والظلام."
                </p>
                <span className="text-amber-400 text-2xs font-semibold block">— مشاركات نازحات (جلسة FGD #02)</span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="italic text-slate-200 mb-2">
                  "نحن رجال وأرباب أسر فقدنا بطاقاتنا أثناء الهروب، وإذا خرجنا للعمل نُوقف في النقاط الأمنية بالساعات ونتعرض للمساءلة.. لا نستطيع التحرك ولا نستطيع إطعام أولادنا، وهذا يدفع الأطفال للتسول."
                </p>
                <span className="text-amber-400 text-2xs font-semibold block">— رجال نازحون (جلسة FGD #01)</span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="italic text-slate-200 mb-2">
                  "المدرسة في الموقع مغلقة لأن النازحين الجدد سكنوا في فصولها وفنائها.. أولادنا محرومون من التعليم، والماء الذي نشربه مالح جداً وغير صالح للشرب، والعربة الصحية تأتي بصورة متقطعة ولا نجد أدوية لأمهاتنا المريضات."
                </p>
                <span className="text-amber-400 text-2xs font-semibold block">— نساء نازحات (جلسة FGD #01)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TOOL 3: OBSERVATION REPORT ===================== */}
      {selectedTool === 'observation' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  الأداة رقم 3: Direct Field Observation
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  تقرير رصد الحماية: استمارات الملاحظة الميدانية المباشرة
                </h2>
                <p className="text-xs text-slate-500">
                  رصد وتقييم عيني مباشر للبنية التحتية والظروف المعيشية في قطاعات مواقع الرصد الميداني
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">إجمالي استمارات الملاحظة</span>
                  <span className="font-bold text-slate-900 text-sm">4 استمارات</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">النازحون الملاحظون</span>
                  <span className="font-bold text-slate-900 text-sm">2,691 فرداً</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">المنظمة الراصدة</span>
                  <span className="font-bold text-slate-900 text-sm">DRC</span>
                </div>
              </div>
            </div>

            {/* Observation Records Table */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">سجل الملاحظات المباشرة ومؤشرات المواقع:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">الموقع / القطاع</th>
                      <th className="p-3">عدد السكان المقدر</th>
                      <th className="p-3">النساء والأطفال</th>
                      <th className="p-3">حمامات منفصلة</th>
                      <th className="p-3">إنارة المراحيض</th>
                      <th className="p-3">مسافة مصدر المياه</th>
                      <th className="p-3">مياه صالحة للشرب</th>
                      <th className="p-3">أعراض الصدمة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {RAW_OBSERVATION_DATA.map((obs) => (
                      <tr key={obs.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{obs.location}</td>
                        <td className="p-3 font-bold text-slate-900">{obs.approxIdpCount} فرداً</td>
                        <td className="p-3 text-rose-700 font-bold">{obs.approxWomenChildrenCount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${obs.separateLatrinesForSexes ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {obs.separateLatrinesForSexes ? 'نعم (موقع قديم)' : 'غير متوفرة (75%)'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${obs.latrinesLighting ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {obs.latrinesLighting ? 'نعم' : 'معدومة تماماً (75%)'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{obs.nearestWaterDistance}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${obs.nearestWaterDistance.includes('1') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {obs.nearestWaterDistance.includes('1') ? 'غير صالح للشرب (مالح)' : 'صالح مع صعوبة'}
                          </span>
                        </td>
                        <td className="p-3 text-rose-700 font-bold flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3 text-rose-600" /> ملحوظة (100%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* WASH & Protection Cross-Analysis from Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span>واقع المياه والصرف الصحي وتداعياته على الحماية:</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed list-disc list-inside">
                <li><strong className="text-slate-900">مسافات الجلب الشاقة:</strong> رصد قطع مسافة تصل إلى 1 كيلومتر مشياً على الأقدام لجلب المياه في مواقع الرصد.</li>
                <li><strong className="text-slate-900">عبء الجلب على النساء والأطفال:</strong> 100% من الاستمارات وثقت أن النساء والفتيات والأولاد هم القائمون حصرياً بجلب المياه بأوانٍ ثقيلة، مما يعرضهم للإجهاد ومخاطر الطريق.</li>
                <li><strong className="text-slate-900">تلوث وملوحة المياه:</strong> تم توثيق أن مصادر المياه في بعض المواقع غير صالحة للشرب ومالحة جداً، مما يهدد بجفاف الأطفال وانتشار أمراض الكلى والمغص المعوي.</li>
                <li><strong className="text-slate-900">طوابير الانتظار الممتدة:</strong> 100% من الاستمارات أكدت انتظار السكان لساعات طويلة في طوابير مياه شحيحة.</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>حالة المأوى والبنية التحتية والمساحات الآمنة:</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed list-disc list-inside">
                <li><strong className="text-slate-900">سكن العراء وتحت الشجر:</strong> توثيق أسر بالكامل تبيت في العراء وتحت الأشجار وفناء المدرسة الخشبية لعدم توفر خيام جديدة.</li>
                <li><strong className="text-slate-900">انعدام المساحات الصديقة:</strong> 0% من المواقع تحتوي على مساحات آمنة أو صديقة للأطفال أو النساء (0 من 4 استمارات).</li>
                <li><strong className="text-slate-900">انعدام المؤسسات الحكومية:</strong> لا توجد أي خدمات حكومية نشطة في المواقع النائية، وتقتصر التغطية في المواقع المركزية على متابعة وإشراف محدود.</li>
                <li><strong className="text-slate-900">حرارة الخيام الخانقة:</strong> خيام الطرابيل البلاستيكية رديئة التهوية تحبس الحرارة المرتفعة مسببة ضربات شمس والتهابات رئوية للأطفال.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
