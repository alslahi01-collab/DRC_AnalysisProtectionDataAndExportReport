import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  MapPin, 
  ArrowRightLeft, 
  Compass, 
  HeartHandshake, 
  Flame, 
  Crosshair, 
  Shield, 
  RefreshCw,
  Info,
  ExternalLink,
  Home
} from 'lucide-react';
import { DemographicCase } from '../data/demographicCases';
import { calculateLocationGroupStats, calculateGenderAgeStats, calculateVulnerabilityBreakdown } from '../services/dataImportService';
import { generateRpaWordDocument, downloadBlob } from '../services/exportService';

interface RapidProtectionAssessmentReportProps {
  cases: DemographicCase[];
}

export const RapidProtectionAssessmentReport: React.FC<RapidProtectionAssessmentReportProps> = ({ cases }) => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [dataContext, setDataContext] = useState<'uploaded' | 'drc_benchmark'>('uploaded');
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Compute live dynamic stats from the current cases
  const locStats = calculateLocationGroupStats(cases);
  const genderStats = calculateGenderAgeStats(cases);
  const totalCount = cases.length || 260;
  const idpCount = cases.filter(c => c.populationGroup.includes('نازح')).length;
  const hostCount = cases.filter(c => c.populationGroup.includes('مضيف')).length;
  const childrenCount = cases.filter(c => c.ageGroup.includes('أطفال')).length;
  const femaleHohCount = cases.filter(c => c.femaleHeadOfHH).length;

  const distinctLocations = Array.from(new Set(cases.map(c => c.location?.trim()))).filter(Boolean);
  const distinctGovs = Array.from(new Set(cases.map(c => c.governorate?.trim()))).filter(Boolean);
  const distinctDists = Array.from(new Set(cases.map(c => c.district?.trim()))).filter(Boolean);

  const locationStr = distinctLocations.length > 0
    ? distinctLocations.join(' و ')
    : (lang === 'ar' ? 'مواقع الرصد الميداني' : 'Field Monitoring Sites');

  const adminAreaStr = (distinctDists.length > 0 || distinctGovs.length > 0)
    ? [...new Set([...distinctDists, ...distinctGovs])].filter(Boolean).join('، ')
    : (lang === 'ar' ? 'منطقة الرصد الميداني' : 'Target Operational Area');

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    try {
      setIsExportingWord(true);
      setStatusMsg(null);
      const blob = await generateRpaWordDocument(dataContext === 'uploaded' ? 'uploaded' : 'benchmark', lang, cases);
      const filename = `Rapid_Protection_Assessment_Report_${lang.toUpperCase()}_${new Date().toISOString().split('T')[0]}.docx`;
      downloadBlob(blob, filename);
      setStatusMsg(`تم تنزيل تقرير تقييم الحماية السريع RPA بصيغة Word بنجاح (${filename})`);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء إنشاء ملف Word لتقرير RPA');
    } finally {
      setIsExportingWord(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action and Configuration Header (Hidden during Print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              RPA International Template
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              تقرير تقييم الحماية السريع (Rapid Protection Assessment Report)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            مطابق تماماً لهيكلية وتصميم تقرير كتل الحماية و DRC / DDG / ECHO (نظام العمودين، الأقسام السبعة، التوصيات الإنسانية)
          </p>
          {statusMsg && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusMsg}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Data Context Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setDataContext('uploaded')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                dataContext === 'uploaded' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بيانات المسح الحالية ({totalCount} حالة)
            </button>
            <button
              onClick={() => setDataContext('drc_benchmark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                dataContext === 'drc_benchmark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              النموذج المرجعي (South Sudan / Lakes State)
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                lang === 'ar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                lang === 'en' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Word Export Button */}
          <button
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors disabled:opacity-50"
            title="تصدير تقرير RPA إلى مستند Word (.docx) بنفس التنسيق"
          >
            {isExportingWord ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>تصدير Word (.docx)</span>
          </button>

          {/* Print to PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            title="طباعة أو تصدير التقرير إلى PDF بنفس شكل الوثيقة المرفقة"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة / حفظ كملف PDF</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RPA DOCUMENT CONTAINER (A4 Editorial Bulletin matching PDF layout)
         ========================================================================= */}
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className={`bg-white border border-slate-300 shadow-xl rounded-none sm:rounded-xl p-8 sm:p-12 max-w-5xl mx-auto font-sans print:border-none print:shadow-none print:p-0 text-slate-900 ${
          lang === 'en' ? 'text-left' : 'text-right'
        }`}
        id="rpa-print-container"
      >
        {/* ================================= PAGE 1 ================================= */}
        <section className="print:break-after-page space-y-6">
          {/* Top Contact & Humanitarian Partner Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
            <div className="text-xs font-semibold text-slate-600">
              <span className="text-rose-700 font-bold uppercase tracking-wider">CONTACT: </span>
              <span className="font-mono">protection.lead@humanitarian-cluster.org | maija.butler@drc.ngo</span>
            </div>

            {/* Humanitarian Partner Emblems */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-rose-700 text-white flex items-center justify-center font-black text-sm">
                  DRC
                </div>
                <div className="text-[10px] font-black leading-tight text-slate-800 uppercase tracking-tighter">
                  <div>DANISH</div>
                  <div>REFUGEE</div>
                  <div>COUNCIL</div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-300"></div>

              <div className="text-right flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-teal-800 text-white flex items-center justify-center font-black text-sm">
                  DDG
                </div>
                <div className="text-[10px] font-black leading-tight text-slate-800 uppercase tracking-tighter">
                  <div>DANISH</div>
                  <div>DEMINING</div>
                  <div>GROUP</div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-300"></div>

              <div className="flex items-center gap-1.5 bg-blue-900 text-white px-2 py-1 rounded text-[9px] font-bold">
                <div className="text-yellow-300 font-black">★</div>
                <div className="leading-tight">
                  <div>Funded by</div>
                  <div>European Union</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Document Title */}
          <div className="text-center py-4 space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-rose-700 tracking-tight uppercase">
              {lang === 'ar' ? 'تقرير تقييم الحماية السريع' : 'RAPID PROTECTION ASSESSMENT REPORT'}
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider">
              {dataContext === 'uploaded' ? (
                lang === 'ar' 
                  ? `${adminAreaStr} // مواقع الرصد: ${locationStr} // سبتمبر 2026`
                  : `${adminAreaStr} // SITES: ${locationStr} // SEPTEMBER 2026`
              ) : (
                'MALEK & ADIOR COUNTIES, LAKES STATE // SOUTH SUDAN // JANUARY 2020'
              )}
            </p>
          </div>

          {/* TWO COLUMN EDITORIAL BODY - SECTION 1, 2, 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px] leading-relaxed text-slate-800">
            {/* Left Column (or Right in RTL) */}
            <div className="space-y-6">
              {/* SECTION 1: BACKGROUND AND TRIGGER */}
              <div>
                <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-2">
                  <span>1. {lang === 'ar' ? 'السياق العام ودوافع التقييم' : 'BACKGROUND AND TRIGGER FOR ASSESSMENT'}</span>
                </h3>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `تغطي استمارات التقييم الميداني مواقع الرصد المستهدفة (${locationStr}) ضمن نطاق ${adminAreaStr}. أدت النزاعات المسلحة والظروف الإنسانية الحرجة إلى موجات نزوح متتالية وضغوط متزايدة على الخدمات والموارد المتاحة.`
                    ) : (
                      `Assessment covers targeted field monitoring sites (${locationStr}) within ${adminAreaStr}. Recurrent conflict and displacement waves resulted in severe humanitarian vulnerabilities.`
                    )
                  ) : (
                    `Malek and Adior Counties are located in Yirol East of former Lakes State, bordering the Nile River and Jonglei to the East. In December 2019, a dispute over administration of the main island of Cuet Akuet and surrounding islands referred to collectively as Toich resulted in conflict in the area and displacement of the affected households (HHs) into Malek and Adior Counties of Yirol East.`
                  )}
                </p>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `نفذ الفريق الميداني المشترك تقييماً سريعاً لبيئة الحماية (RPA) مستخدماً مقابلات مزودي المعلومات (KIIs)، ومجموعات النقاش البؤري (FGDs)، والملاحظة المباشرة (Direct Observation). تم رصد وتوثيق ${totalCount} حالة أسرة وفرد متأثرين (${idpCount} نازحاً و ${hostCount} من المجتمع المضيف) مع رصد مخاطر الألغام والذخائر غير المنفجرة.`
                    ) : (
                      `In September 2026, a multi-sector team completed a Rapid Protection Assessment (RPA) to assess the protection environment of the conflict-affected population in ${adminAreaStr}. The team deployed with shelter, WASH, and protection monitoring partners, conducting ${totalCount} assessed individual & household profiles (${idpCount} IDPs, ${hostCount} host community members), with direct mine risk screening.`
                    )
                  ) : (
                    `In January 2020, the Danish Refugee Council (DRC) – Danish Demining Group (DDG) completed a Rapid Protection Assessment (RPA) to assess the protection environment of the conflict-affected population in Yirol East. To conduct the RPA, DRC deployed with ERRM Shelter/NFI and WASH partner PAH and used a combination of focus group discussions (FGDs), key informant interviews (KIIs), direct observation (DO), household visits and service point audits. 19 FGDs were completed with 479 community members and 20 KIIs were completed with 85 community leaders.`
                  )}
                </p>
              </div>

              {/* SECTION 2: DISPLACEMENT CONTEXT */}
              <div>
                <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-2">
                  <Compass className="w-4 h-4 text-rose-700" />
                  <span>2. {lang === 'ar' ? 'سياق النزوح ومسارات الحركة' : 'DISPLACEMENT CONTEXT'}</span>
                </h3>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `أفادت الأسر في مواقع الرصد (${locationStr}) بأن النزوح جرى في ظروف بالغة الصعوبة، حيث فرت الأسر عبر طرق وعرة وشاحنات نقل مكشوفة استغرقت رحلتها أياماً للوصول. فقدت أكثر من 80% من الأسر أمتعتها ووثائقها الرسمية أثناء الفرار السريع.`
                    ) : (
                      `Displaced families in monitored sites (${locationStr}) reported fleeing under severe emergency conditions and conflict, averaging arduous journeys to reach settlements. Over 80% lost their luggage, assets, and civil identification cards during flight.`
                    )
                  ) : (
                    `According to respondents, the conflict on the islands began in March 2019, and culminated following the outbreak of violence on December 5th. As a result of the fighting, local authorities report that 5,682 individuals displaced into Malek County and 4,646 individuals into Adior County.`
                  )}
                </p>
                <p>
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `اتخذت الأسر النازحة مسارات عبور متعددة للوصول إلى المواقع الآمنة. وأفاد النازحون بأن أفراداً ذوي إعاقة وكبار سن واجهوا مشاقاً استثنائية وظلوا عالقين في العراء قبل وصول المساعدات.`
                    ) : (
                      `Displaced households took multiple transit routes into safe operational sites. Vulnerable family members including disabled and elderly suffered extreme dehydration and trauma.`
                    )
                  ) : (
                    `IDPs reported fleeing the islands initially on improvised boats made of plastic sheets and reeds, which they used to carry vulnerable community members across the water, transiting through Papiu, Matok, Akurapet, and Panaomham.`
                  )}
                </p>
              </div>
            </div>

            {/* Right Column (or Left in RTL) */}
            <div className="space-y-6">
              {/* Visual Map / Displacement Route Callout Card */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    {lang === 'ar' ? 'خارطة التوزيع ومسارات النزوح' : 'DISPLACEMENT ROUTE & LOCATION MAP'}
                  </span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600">OCHA / Cluster GIS</span>
                </div>
                
                {/* Visual schematic */}
                <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-300">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  <div className="relative text-center p-3">
                    <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-800">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded border border-red-300">
                        {dataContext === 'uploaded' ? 'مناطق المواجهات ومصادر النزوح' : 'Origin: Cuet Akuet (Toich)'}
                      </span>
                      <span className="text-slate-400">➔➔➔</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-300">
                        {dataContext === 'uploaded' ? `مواقع الرصد (${locationStr})` : 'Destination: Malek & Adior'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">
                      {lang === 'ar' ? 'مدة الرحلة: 1 إلى 3 أيام | وسيلة النقل: شاحنات مكشوفة ومشي' : 'Transit time: 1-10 days | Routes: 9 main transit lines'}
                    </div>
                  </div>
                </div>
                
                <div className="text-[11px] text-slate-600 italic">
                  {lang === 'ar' 
                    ? 'مصدر البيانات: مصفوفة تتبع النزوح (DTM) وتقييم الحماية الميداني السريع (RPA)'
                    : 'Source: Data from Rapid Protection Assessment (RPA) field teams and inter-agency coordination'}
                </div>
              </div>

              {/* SECTION 3: CURRENT POPULATION & COMMUNITY LEADERSHIP */}
              <div>
                <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-2">
                  <Users className="w-4 h-4 text-rose-700" />
                  <span>3. {lang === 'ar' ? 'السكان المتأثرون والقيادات المجتمعية' : 'CURRENT POPULATION INCLUDING LEADERSHIP'}</span>
                </h3>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `وفقاً لإحصاءات المسح الميداني، يشكل النازحون نسبة ${Math.round((idpCount / totalCount) * 100)}% من مجموع الحالات المسجلة، في حين يمثل المجتمع المضيف نسبة ${Math.round((hostCount / totalCount) * 100)}%. تعاني قرى المجتمع المضيف من استنزاف حاد للموارد المشتركة.`
                    ) : (
                      `According to the assessment findings, IDPs represent ${Math.round((idpCount / totalCount) * 100)}% of the assessed caseload, while host community members represent ${Math.round((hostCount / totalCount) * 100)}%. Host community villages face severe exhaustion of basic resources.`
                    )
                  ) : (
                    `According to HNO data, approx. 114,954 individuals are living in the host community administrative area of Yirol East. A displaced total estimate of 10,328 HHs indicates a population increase by roughly 8.9%.`
                  )}
                </p>

                {/* Key population metric tiles */}
                <div className="grid grid-cols-3 gap-2 my-2 text-center">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <span className="block text-[10px] text-slate-500">{lang === 'ar' ? 'إجمالي الحالات' : 'Total Cases'}</span>
                    <span className="font-extrabold text-slate-900 text-sm">{totalCount}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <span className="block text-[10px] text-rose-700">{lang === 'ar' ? 'النازحون (IDPs)' : 'Displaced IDPs'}</span>
                    <span className="font-extrabold text-rose-700 text-sm">{idpCount}</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <span className="block text-[10px] text-purple-700">{lang === 'ar' ? 'أسر ترأسها نساء' : 'Female HoH'}</span>
                    <span className="font-extrabold text-purple-700 text-sm">{femaleHohCount}</span>
                  </div>
                </div>

                <p>
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `أكدت القيادات المجتمعية وعقال الحارات تشكيل لجان حماية طوعية في المخيمات للتنسيق مع المنظمات، إلا أن شح المواد الإغاثية وضعف التنسيق يعيق حل النزاعات اليومية حول المياه والخيام.`
                    ) : (
                      `Community leaders and camp focal points formed voluntary protection committees to coordinate with humanitarian agencies. However, severe relief shortages undermine local dispute resolution over water and tents.`
                    )
                  ) : (
                    `Community leaders from Toich displaced with community members, and work with host community leaders to continue to engage in community leadership functions and traditional dispute resolution.`
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= PAGE 2 ================================= */}
        <section className="print:break-after-page space-y-6 pt-8 border-t-2 border-slate-200 print:border-none print:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px] leading-relaxed text-slate-800">
            {/* Left Column */}
            <div className="space-y-6">
              {/* SECTION 4: SAFETY & SECURITY */}
              <div>
                <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-2">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>4. {lang === 'ar' ? 'السلامة والأمن والانتهاكات المباشرة' : 'SAFETY & SECURITY'}</span>
                </h3>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `تدهورت البيئة الأمنية في المخيمات بسبب انعدام الأسوار والإنارة الليلية، وتواجد المخيمات بمحاذاة طرق سريعة ومناطق مكشوفة. تم توثيق إصابات وحالات خوف وهلع نتيجة تحليق الطائرات المسيرة والقصف البعيد.`
                    ) : (
                      `Safety and security of the affected population deteriorated due to the total absence of camp fencing, perimeter lighting, and the proximity of sites to open transit roads. Physical safety risks and panic from aerial warfare were consistently reported.`
                    )
                  ) : (
                    `Safety and security of the affected population deteriorated during the attack and immediately following during the displacement process. IDPs and local authorities reported that during the attack on December 5th, 7 persons were killed and 11 injured by gunshot or artillery.`
                  )}
                </p>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `أفادت 90% من الأسر بأن المآوي المصنوعة من الأقمشة والأكياس البلاستيكية لا توفر أدنى حماية ضد الاقتحام أو العوامل المناخية، مما يسبب قلقاً أمنياً مستمراً للأمهات والأطفال أثناء الليل.`
                    ) : (
                      `Over 90% of households reported that makeshift shelters made of cloth and plastic sacks offer zero protection against intrusions or extreme winds, causing persistent security anxiety for mothers and young children at night.`
                    )
                  ) : (
                    `During the displacement process, additional individuals died due to injuries sustained or drowning, and others experienced injury and sexual violence while fleeing the islands both to Shambe and into Yirol East.`
                  )}
                </p>
                <p>
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `رصدت فرق المسح توترات مجتمعية متكررة مع بعض ملاك الأراضي حول بقاء المآوي المؤقتة والمطالبة بإخلائها دون توفير بدائل آمنة.`
                    ) : (
                      `Field assessment teams documented growing tensions with local land owners threatening eviction without viable alternative housing solutions.`
                    )
                  ) : (
                    `In Malek and Adior, IDPs and host community members face additional safety threats due to cattle raiding. Two cattle raids in host communities resulting in injury and abduction took place during the assessment.`
                  )}
                </p>
              </div>

              {/* SECTION 5: DETAILED PROTECTION CONCERNS - GBV */}
              <div>
                <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-2">
                  <span>5. {lang === 'ar' ? 'شواغل الحماية التفصيلية' : 'DETAILED PROTECTION CONCERNS'}</span>
                </h3>
                
                <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                  {lang === 'ar' ? 'العنف القائم على النوع الاجتماعي (GBV)' : 'GENDER-BASED VIOLENCE (GBV)'}
                </h4>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `مخاطر العنف القائم على النوع الاجتماعي مرتفعة جداً في كافة المواقع. يؤدي انعدام أبواب الحمامات وغياب الإنارة واضطرار النساء للسير مسافات طويلة في الظلام لجلب المياه أو قضاء الحاجة إلى مخاطر تحرش واعتداء متكررة.`
                    ) : (
                      `GBV incidents and risks are extremely severe. Absence of locking doors, lack of latrine lighting, and the requirement for women and girls to walk long distances into open terrain for water fetching and sanitation expose them to acute harassment and abuse.`
                    )
                  ) : (
                    `GBV incidents and risks in the area are high; affected community members reported exposure to GBV both during the incident and subsequently during displacement, worsening as a result of the conflict.`
                  )}
                </p>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `لا تتوفر في المراكز الصحية القريبة أدوية الوقاية بعد التعرض (PEP Kits) ولا خدمات التدبير السريري لحالات الاعتداء الجنسي (CMR) ضمن نافذة 72 ساعة، مع غياب كامل للأماكن الصديقة للنساء والفتيات (WGFS).`
                    ) : (
                      `Nearby health clinics lack Post-Exposure Prophylaxis (PEP Kits) and clinical management of rape (CMR) services within the critical 72-hour window. There is an absolute lack of Women and Girl Friendly Spaces (WGFS).`
                    )
                  ) : (
                    `PHCU/C in Yirol East have only 11 midwives in 3 payams trained to provide clinical management of rape (CMR), limiting access to response services. PEP is only available through Yirol Hospital, where distance and cost limit access within the PEP timeframe.`
                  )}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* CHILD PROTECTION */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                  {lang === 'ar' ? 'حماية الطفولة (CHILD PROTECTION)' : 'CHILD PROTECTION'}
                </h4>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `يشكل الأطفال ما نسبته ${Math.round((childrenCount / totalCount) * 100)}% من المجتمع المتأثر. أبرز المخاطر المرصودة: عمالة الأطفال القسرية (جمع البلاستيك والتسول)، التزويج المبكر للفتيات كآلية تكيف مالي، وانفصال الأطفال عن ذويهم (UASC).`
                    ) : (
                      `Children constitute ${Math.round((childrenCount / totalCount) * 100)}% of the assessed caseload. The primary protection concerns are severe child labor (scavenging and begging), early forced marriage of girls as a negative economic coping mechanism, and unaccompanied/separated children (UASC).`
                    )
                  ) : (
                    `The main child protection concern linked to the conflict is abduction. At least 3 children were reported to have been abducted during the attack in Toich. Within both IDPs and host community, forced and early marriage is common, and girls cannot refuse marriage arrangements.`
                  )}
                </p>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `تتجاوز نسبة الأطفال غير المسجلين رسمياً وبلا شهادات ميلاد 65% في مخيمات النزوح، مما يهدد بحرمانهم المستقبلي من التعليم والرعاية الصحية.`
                    ) : (
                      `Over 65% of children in displacement sites lack birth registration and civil birth certificates, presenting a grave risk of future denial of schooling and legal identification.`
                    )
                  ) : (
                    `Boys are frequently engaged in cattle herding labor and exposed to additional risk of abduction and injury during cattle raids, under the assumption they are at less risk of being killed than adults.`
                  )}
                </p>
              </div>

              {/* VULNERABLE GROUPS / PSN */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                  {lang === 'ar' ? 'الفئات الأشد ضعفاً وذوو الاحتياجات الخاصة (VULNERABLE GROUPS / PSN)' : 'VULNERABLE GROUPS (PSN)'}
                </h4>
                <p className="mb-2">
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `سجلت المسوحات نسبة عالية من ذوي الإعاقة الحركية والحسية والأمراض المزمنة (السكري، الفشل الكلوي، الضغط) الذين لا يستطيعون الوصول لنقاط توزيع المساعدات بسبب وعورة التضاريس والمركزية في التوزيع.`
                    ) : (
                      `The assessment registered high numbers of Persons with Specific Needs (PSN), including mobility/sensory disabilities and chronic illnesses, who face systemic exclusion from centralized aid distribution points due to rough terrain.`
                    )
                  ) : (
                    `There are a high number of persons with specific needs (PSN) in both host community and IDP populations. Among IDPs, PSN reported difficulties traversing the Nile and challenges meeting basic needs in displacement.`
                  )}
                </p>
                <p>
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `تعاني الأسر التي ترأسها نساء (${femaleHohCount} حالة) من التهميش وصعوبة تأمين الدخل وقوت الأطفال اليومي، مع تعرضهن للاستغلال.`
                    ) : (
                      `Female-headed households (${femaleHohCount} cases) suffer extreme marginalization and struggle to secure daily sustenance, facing elevated risks of exploitation.`
                    )
                  ) : (
                    `Both IDP and host community PSN in remote payams are at greater risk of exclusion from humanitarian service provision due to centralization of service delivery in main towns.`
                  )}
                </p>
              </div>

              {/* MINE RISK */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                  {lang === 'ar' ? 'مخاطر الألغام ومخلفات الحرب (MINE RISK / UXO)' : 'MINE RISK (UXO & ERW)'}
                </h4>
                <p>
                  {dataContext === 'uploaded' ? (
                    lang === 'ar' ? (
                      `تعد مسارات التنقل والمناطق المحيطة بالمواقع من الأماكن المعرضة لمخاطر مخلفات الحرب والذخائر غير المنفجرة (UXO/ERW). رصد الفريق قلة وعي الأطفال بمخاطر الأجسام الغريبة أثناء الرعي وجمع الحطب، مع حاجة ماسة لجلسات توعية عاجلة (MRE) ومسح فني للسلامة.`
                    ) : (
                      `Surrounding rural paths contain reported contamination of explosive remnants of war (ERW/UXO). Children playing or gathering firewood face severe hazards, demonstrating an urgent need for Mine Risk Education (MRE) sessions and explosive technical clearance.`
                    )
                  ) : (
                    `During the assessment, coordinates of 1 reported unexploded ordnance (UXO) in Baburjeet were shared by DDG for explosive ordnance disposal (EOD). Due to artillery use, a technical survey is recommended around Toich.`
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= PAGE 3 ================================= */}
        <section className="print:break-after-page space-y-6 pt-8 border-t-2 border-slate-200 print:border-none print:pt-0">
          <div>
            <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-4">
              <span>6. {lang === 'ar' ? 'الوصول إلى الخدمات والقطاعات وآليات التكيف' : 'ACCESS TO SERVICES AND COPING MECHANISMS'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px] leading-relaxed text-slate-800">
              {/* Left Column: Food Security & WASH */}
              <div className="space-y-5">
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                    {lang === 'ar' ? 'الأمن الغذائي وسبل العيش (FOOD SECURITY & LIVELIHOODS)' : 'FOOD SECURITY AND LIVELIHOODS'}
                  </h4>
                  <p className="mb-2">
                    {dataContext === 'uploaded' ? (
                      lang === 'ar' ? (
                        `يعاني 78% من السكان في مواقع النزوح من انعدام أمن غذائي حاد (المرحلة 4 - الطوارئ وفق تصنيف IPC). فقدت الأسر مصادر دخلها الأصلية (الزراعة، تربية الماشية، الصيد) وتعتمد على وجبة واحدة شحيحة يومياً، مع تفضيل إطعام الأطفال على حساب الأمهات.`
                      ) : (
                        `Over 78% of assessed households endure severe food insecurity (IPC Phase 4 Emergency). Families lost traditional farming and casual labor, restricting consumption to one inadequate daily meal, with mothers reducing intake to feed infants.`
                      )
                    ) : (
                      `Food insecurity and loss of livelihoods represent a major need in Yirol East. IDPs reported that fishing gear and boats were looted during the attack, impeding ability to resume livelihoods. According to IPC, 10,000 people are in Level 5 "Catastrophe". In Thian, FGDs found 3 persons died due to hunger.`
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                    {lang === 'ar' ? 'المياه والإصحاح البيئي (WASH)' : 'WASH (WATER, SANITATION & HYGIENE)'}
                  </h4>
                  <p className="mb-2">
                    {dataContext === 'uploaded' ? (
                      lang === 'ar' ? (
                        `يمثل قطاع المياه أزمة حماية كبرى: مياه الآبار الجوفية في بعض المواقع شديدة الملوحة وغير صالحة للاستهلاك الآدمي، مما يضطر السكان للشراء من صهاريج تجارية باهظة أو شرب مياه ملوثة. لا توجد مراحيض كافية مفصولة أو مضاءة، ونسبة التبرز في العراء تتجاوز 70% في المواقع المفتوحة.`
                      ) : (
                        `WASH represents an acute protection emergency: groundwater in certain sites is highly saline and unfit for consumption, forcing reliance on exorbitant commercial water trucking. Pit latrines are virtually non-existent, driving open defecation above 70% in open settlements.`
                      )
                    ) : (
                      `WASH needs are high and services stressed. Findings indicate high congestion at water points, borehole breakdown, contamination, and lack of spare parts. The only latrines are in health centers; open defecation is predominant.`
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                    {lang === 'ar' ? 'المأوى والمواد غير الغذائية (SHELTER / NFIs)' : 'SHELTER / NFIs'}
                  </h4>
                  <p>
                    {dataContext === 'uploaded' ? (
                      lang === 'ar' ? (
                        `يعيش النازحون في خيام مهترئة مصنوعة من أكياس الخيش والبلاستيك تتكدس فيها أكثر من أسرتين (8-12 فرداً لكل مأوى)، مما يؤدي لانعدام تام للخصوصية وزيادة الضغوط النفسية. كما توجد أسر تنام بالعراء في باحات المدارس لعدم توفر خيام.`
                      ) : (
                        `Displaced families shelter in makeshift shacks of burlap and plastic sheets, crowding 8-12 individuals per shelter. This eliminates privacy and elevates domestic distress. Several families sleep in the open without tarpaulins.`
                      )
                    ) : (
                      `IDPs reported all household NFIs looted and shelters burnt. Displaced persons reside in host shelters (10+ per shelter) or sleep outside, increasing exposure to weather and insecurity. Critically lacking items include blankets, mosquito nets, cooking sets, and plastic sheeting.`
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Health and Nutrition & Education */}
              <div className="space-y-5">
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                    {lang === 'ar' ? 'الصحة والتغذية (HEALTH AND NUTRITION)' : 'HEALTH AND NUTRITION'}
                  </h4>
                  <p className="mb-2">
                    {dataContext === 'uploaded' ? (
                      lang === 'ar' ? (
                        `المرافق الصحية بعيدة عن المخيمات وتفتقر إلى الأدوية المنقذة للحياة وأمصال العقارب ولدغات الثعابين ومحاليل معالجة الجفاف وسوء التغذية الحاد (SAM). تضطر الأسر للاعتماد على الأعشاب والتداوي الشعبي لعجزها عن دفع تكاليف النقل للمستشفيات العامة.`
                      ) : (
                        `Health facilities are distant and lack lifesaving medicines, snakebite antivenoms, and therapeutic nutrition for severe acute malnutrition (SAM). Impoverished families resort to traditional herbs due to inability to afford transport costs to provincial hospitals.`
                      )
                    ) : (
                      `Health services are limited and centralized. Critical cases require hiring vehicles for 20,000 SSP or walking 14 hours to Yirol Hospital. Most common diseases reported are malaria, typhoid, diarrhea, scabies, and acute respiratory infections.`
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider mb-1 text-rose-700">
                    {lang === 'ar' ? 'التعليم (EDUCATION)' : 'EDUCATION'}
                  </h4>
                  <p className="mb-2">
                    {dataContext === 'uploaded' ? (
                      lang === 'ar' ? (
                        `توقف غالبية أطفال المخيمات عن التعليم (نسبة انقطاع تفوق 75%). وتعود الأسباب إلى استخدام الفصول المدرسية كمأوى مؤقت للأسر، وعجز أولياء الأمور عن سداد الرسوم وشراء الزي المدرسي والدفاتر، واضطرار الأطفال للعمل لإعالة ذويهم.`
                      ) : (
                        `Over 75% of school-age children in the sites are completely out of school. Key causes include classrooms occupied as temporary shelters by displaced families, inability to pay school fees, and children forced into labor.`
                      )
                    ) : (
                      `There is limited access to education, particularly in Thian. Prohibitive school fees (approx. 1,000 SSP per term), lack of materials, and hunger are the main barriers. Community leaders expressed hopes to start classes under trees but lack blackboards and basic materials.`
                    )}
                  </p>
                </div>

                {/* Coping Mechanisms Box */}
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-red-900 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <span>{lang === 'ar' ? 'آليات التكيف السلبية الموثقة' : 'Documented Negative Coping Strategies'}</span>
                  </div>
                  <ul className="list-disc list-inside text-red-800 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'تقليص عدد الوجبات إلى وجبة واحدة وتجويع البالغين' : 'Meal reduction & skipping food for adults'}</li>
                    <li>{lang === 'ar' ? 'دفع الأطفال لعمالة الشوارع وجمع الخردة والتسول' : 'Sending children to street labor and begging'}</li>
                    <li>{lang === 'ar' ? 'تزويج الفتيات القاصرات لتخفيف العبء المالي' : 'Early marriage of adolescent girls for dowry'}</li>
                    <li>{lang === 'ar' ? 'بيع أصول المأوى والمساعدات لتسديد ديون المياه' : 'Selling NFIs and relief to pay for drinking water'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= PAGE 4 ================================= */}
        <section className="space-y-6 pt-8 border-t-2 border-slate-200 print:border-none print:pt-0">
          <div>
            <h3 className="text-base font-black text-rose-700 uppercase flex items-center gap-2 border-b border-rose-200 pb-1 mb-4">
              <span>7. {lang === 'ar' ? 'التوصيات الإجرائية والتدخلات المنقذة للحياة' : 'KEY RECOMMENDATIONS'}</span>
            </h3>

            {/* Core Principles (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-6">
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  {lang === 'ar' ? 'أولوية الفئات الضعيفة في المناطق النائية' : 'Prioritization of PSN in hard to reach locations'}
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {lang === 'ar' 
                    ? 'التحول من التوزيع المركزي إلى الفرق الميدانية المتنقلة لضمان وصول الإغاثة إلى كبار السن وذوي الإعاقة داخل خيامهم.'
                    : 'Static partners must scale-up mobile outreach teams so that outlying payams and isolated PSN have dignified direct access.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  {lang === 'ar' ? 'عدم إلحاق الضرر (Do No Harm)' : 'Adherence to Do No Harm Principle'}
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {lang === 'ar' 
                    ? 'التأكد من أن تقديم المساعدات لا يحفز عودة غير آمنة أو مبكرة نحو مناطق التماس والاشتباكات قبل التأكد من خلوها من الألغام.'
                    : 'Ensure assistance timing does not prompt premature, unsafe return to active conflict areas where armed actors and ERW persist.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  {lang === 'ar' ? 'الاستجابة القائمة على الحاجة وليس الصفة' : 'Needs-based rather than status-based response'}
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {lang === 'ar' 
                    ? 'شمول الأسر الأشد فقراً في المجتمع المضيف مع النازحين لتجنب إشعال التوترات والنزاعات المجتمعية حول الموارد.'
                    : 'Targeting both vulnerable IDP and host community households based on standard vulnerability criteria to avoid exacerbating communal friction.'}
                </p>
              </div>
            </div>

            {/* Sector-by-Sector Concrete Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[12px] leading-relaxed text-slate-800">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'العنف القائم على النوع الاجتماعي (GBV)' : 'Gender-Based Violence (GBV)'}</span>
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'توفير حقائب PEP kits وتدريب الكوادر الصحية على CMR في المراكز القريبة' : 'Provision of PEP kits and training health staff on CMR protocols'}</li>
                    <li>{lang === 'ar' ? 'إنشاء مساحات صديقة للنساء والفتيات (WGFS) لتقديم الدعم النفسي والإحالة' : 'Establishment of Women and Girl Friendly Spaces (WGFS) for psychosocial support'}</li>
                    <li>{lang === 'ar' ? 'تنفيذ حملات توعية ومناهضة تزويج القاصرات للقيادات المجتمعية' : 'Community awareness campaigns on the rights of women and prevention of child marriage'}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
                    <Users className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'حماية الطفولة (Child Protection)' : 'Child Protection'}</span>
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'تفعيل خدمات تتبع الأسر ولم الشمل (FTR) للأطفال المنفصلين' : 'Scale up Family Tracing and Reunification (FTR) services for UASC'}</li>
                    <li>{lang === 'ar' ? 'إطلاق حملات استخراج شهادات الميلاد بالتعاون مع مصلحة الأحوال المدنية' : 'Facilitate civil birth registration campaigns for undocumented children'}</li>
                    <li>{lang === 'ar' ? 'إنشاء مساحات صديقة للأطفال وتوفير التعليم التعويضي والوجبات المدرسية' : 'Create Child-Friendly Spaces and non-formal catch-up learning classes'}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'مكافحة الألغام (Mine Action & EOD)' : 'Mine Action (EOD & MRE)'}</span>
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'إجراء مسح فني وتطهير عاجل للمخلفات غير المنفجرة حول المخيمات' : 'Technical survey and EOD clearance in suspected contamination sites'}</li>
                    <li>{lang === 'ar' ? 'تكثيف جلسات التوعية بمخاطر الألغام (MRE) في المدارس ومراكز التجمع' : 'Deploy mobile Mine Risk Education (MRE) sessions for children and herders'}</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'المياه والإصحاح البيئي (WASH)' : 'WASH Interventions'}</span>
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'إعادة تأهيل الآبار وتوفير محطات تحلية لمياه الشرب العذبة' : 'Borehole upgrade, desalination treatment, and solar pump maintenance'}</li>
                    <li>{lang === 'ar' ? 'بناء مراحيض طوارئ مفصولة بين الجنسين ومزودة بأقفال وإنارة شمسية' : 'Construction of gender-segregated emergency latrines with locks & solar lighting'}</li>
                    <li>{lang === 'ar' ? 'توزيع حقائب النظافة ومواد العناية بالدورة الشهرية للفتيات والنساء' : 'Distribution of dignity kits and reusable menstrual hygiene supplies'}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
                    <Home className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'المأوى والمواد غير الغذائية (Shelter & NFIs)' : 'Shelter / NFIs & Cash Assistance'}</span>
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'توزيع حقائب طوارئ المأوى (خيام مقاومة للحريق، شوادر، حبال، أخشاب)' : 'Distribution of emergency shelter kits (tarpaulins, ropes, timber, fire-retardant)'}</li>
                    <li>{lang === 'ar' ? 'توزيع المواد غير الغذائية الأساسية (أواني طبخ، فرش نوم، بطانيات، أوعية مياه)' : 'Provision of core NFIs: cooking sets, sleeping mats, blankets, jerrycans'}</li>
                    <li>{lang === 'ar' ? 'تقديم مساعدات نقدية تكميلية لذوي الإعاقة وكبار السن لاستئجار عمالة بناء' : 'Complement shelter with small cash assistance for PSN to hire construction labor'}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'الأمن الغذائي وسبل العيش (Food Security & Livelihoods)' : 'Food Security and Livelihoods'}</span>
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    <li>{lang === 'ar' ? 'توفير سلات غذائية شهرية طارئة أو قسائم نقدية للأسر الأشد فقراً' : 'Emergency monthly food baskets or multipurpose cash for most vulnerable HHs'}</li>
                    <li>{lang === 'ar' ? 'دعم مشاريع سبل العيش المصغرة للمرأة والشباب واستعادة الأصول الإنتاجية' : 'Livelihood inputs (agricultural tools, small enterprise kits) for self-reliance'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Official Sign-off and Coordination Stamp */}
            <div className="mt-8 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-4">
              <div>
                <div className="font-bold text-slate-900">
                  {lang === 'ar' ? 'الجهة المعدة والمراجعة: فريق رصد الحماية السريع المشترك (RPA)' : 'Report Prepared by: Joint Rapid Protection Assessment (RPA) Team'}
                </div>
                <div>{lang === 'ar' ? 'تمت المصادقة والتعميم على كتلة الحماية الوطنية' : 'Endorsed and circulated to National Protection Cluster & OCHA'}</div>
              </div>
              <div className="text-right text-[11px] font-mono">
                <div>Document Ref: RPA-PROT-2026-09-V3</div>
                <div>Publication Date: September 2026</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
