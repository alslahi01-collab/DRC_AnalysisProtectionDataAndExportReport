import { DemographicCase } from '../data/demographicCases';
import { 
  ProtectionSector, 
  SectorRiskAnalysis, 
  ProtectionRecommendation,
  StandardGap,
  KIIRecord,
  FGDRecord,
  ObservationRecord
} from '../types';
import { 
  calculateLocationGroupStats, 
  calculateGenderAgeStats, 
  calculateVulnerabilityBreakdown,
  calculateDocumentationStats,
  calculateEducationStats,
  calculateShelterWashStats
} from './dataImportService';

export interface FileStatisticalReport {
  fileName: string;
  totalRecords: number;
  idpCount: number;
  idpPercent: number;
  hostCount: number;
  hostPercent: number;
  femaleCount: number;
  femalePercent: number;
  femaleHeadOfHHCount: number;
  childrenCount: number;
  childrenPercent: number;
  elderlyCount: number;
  elderlyPercent: number;
  pwdCount: number;
  pwdPercent: number;
  missingIdCount: number;
  missingIdPercent: number;
  missingBirthCertCount: number;
  outOfSchoolChildrenPercent: number;
  openDefecationPercent: number;
  topProtectionConcern: string;
  locationStats: ReturnType<typeof calculateLocationGroupStats>;
  genderAgeStats: ReturnType<typeof calculateGenderAgeStats>;
  vulnerabilities: ReturnType<typeof calculateVulnerabilityBreakdown>;
  documentationStats: ReturnType<typeof calculateDocumentationStats>;
  educationStats: ReturnType<typeof calculateEducationStats>;
  shelterWashStats: ReturnType<typeof calculateShelterWashStats>;
}

/**
 * Calculates separated statistics for each individual uploaded file
 */
export const calculatePerFileStatistics = (cases: DemographicCase[]): FileStatisticalReport[] => {
  if (!cases || cases.length === 0) return [];

  // Group cases by source file
  const fileGroups: { [fileName: string]: DemographicCase[] } = {};
  cases.forEach(c => {
    const name = c.sourceFile || 'ملف غير معروف';
    if (!fileGroups[name]) fileGroups[name] = [];
    fileGroups[name].push(c);
  });

  return Object.entries(fileGroups).map(([fileName, fileCases]) => {
    const total = fileCases.length;
    const idps = fileCases.filter(c => c.populationGroup.includes('نازح')).length;
    const host = fileCases.filter(c => c.populationGroup.includes('مضيف')).length;
    const females = fileCases.filter(c => c.gender === 'أنثى').length;
    const femaleHoH = fileCases.filter(c => c.femaleHeadOfHH).length;
    const children = fileCases.filter(c => c.ageGroup.includes('أطفال')).length;
    const elderly = fileCases.filter(c => c.ageGroup.includes('كبار')).length;
    const pwds = fileCases.filter(c => c.vulnerabilities.some(v => v.includes('إعاقة'))).length;
    const missingId = fileCases.filter(c => !c.hasNationalId).length;
    
    const childrenCases = fileCases.filter(c => c.age < 18);
    const missingBirth = childrenCases.filter(c => !c.hasBirthCertificate).length;
    const outOfSchool = childrenCases.filter(c => !c.educationStatus.includes('ملتحق')).length;

    const openDefecation = fileCases.filter(c => c.sanitationAccess.includes('عراء') || c.sanitationAccess.includes('انعدام')).length;

    // Determine top protection issue in this file
    const concernFreq: { [key: string]: number } = {};
    fileCases.forEach(c => {
      c.protectionConcerns.forEach(pc => {
        concernFreq[pc] = (concernFreq[pc] || 0) + 1;
      });
    });
    const sortedConcerns = Object.entries(concernFreq).sort((a, b) => b[1] - a[1]);
    const topProtectionConcern = sortedConcerns.length > 0 ? sortedConcerns[0][0] : 'أزمة مأوى وخدمات مياه';

    return {
      fileName,
      totalRecords: total,
      idpCount: idps,
      idpPercent: total > 0 ? Math.round((idps / total) * 100) : 0,
      hostCount: host,
      hostPercent: total > 0 ? Math.round((host / total) * 100) : 0,
      femaleCount: females,
      femalePercent: total > 0 ? Math.round((females / total) * 100) : 0,
      femaleHeadOfHHCount: femaleHoH,
      childrenCount: children,
      childrenPercent: total > 0 ? Math.round((children / total) * 100) : 0,
      elderlyCount: elderly,
      elderlyPercent: total > 0 ? Math.round((elderly / total) * 100) : 0,
      pwdCount: pwds,
      pwdPercent: total > 0 ? Math.round((pwds / total) * 100) : 0,
      missingIdCount: missingId,
      missingIdPercent: total > 0 ? Math.round((missingId / total) * 100) : 0,
      missingBirthCertCount: missingBirth,
      outOfSchoolChildrenPercent: childrenCases.length > 0 ? Math.round((outOfSchool / childrenCases.length) * 100) : 0,
      openDefecationPercent: total > 0 ? Math.round((openDefecation / total) * 100) : 0,
      topProtectionConcern,
      locationStats: calculateLocationGroupStats(fileCases),
      genderAgeStats: calculateGenderAgeStats(fileCases),
      vulnerabilities: calculateVulnerabilityBreakdown(fileCases),
      documentationStats: calculateDocumentationStats(fileCases),
      educationStats: calculateEducationStats(fileCases),
      shelterWashStats: calculateShelterWashStats(fileCases),
    };
  });
};

/**
 * Computes dynamic Sector Risk Analysis (PCVA) from the uploaded cases
 */
export const calculateDynamicRiskAnalysis = (cases: DemographicCase[]): SectorRiskAnalysis[] => {
  if (!cases || cases.length === 0) return [];

  const total = cases.length;
  const females = cases.filter(c => c.gender === 'أنثى').length;
  const femaleHoH = cases.filter(c => c.femaleHeadOfHH).length;
  const children = cases.filter(c => c.ageGroup.includes('أطفال')).length;
  const pwds = cases.filter(c => c.vulnerabilities.some(v => v.includes('إعاقة'))).length;
  const elderly = cases.filter(c => c.ageGroup.includes('كبار')).length;
  const missingId = cases.filter(c => !c.hasNationalId).length;
  const childrenCases = cases.filter(c => c.age < 18);
  const missingBirth = childrenCases.filter(c => !c.hasBirthCertificate).length;
  const outOfSchool = childrenCases.filter(c => !c.educationStatus.includes('ملتحق')).length;
  const openDefecation = cases.filter(c => c.sanitationAccess.includes('عراء') || c.sanitationAccess.includes('انعدام')).length;
  const makeshiftShelter = cases.filter(c => c.shelterType.includes('خيش') || c.shelterType.includes('عراء') || c.shelterType.includes('طين')).length;

  const gbvRiskScore = Math.min(95, Math.max(60, Math.round(((openDefecation / total) * 40) + ((femaleHoH / total) * 30) + 35)));
  const cpRiskScore = Math.min(96, Math.max(55, Math.round(((outOfSchool / (childrenCases.length || 1)) * 45) + ((missingBirth / (childrenCases.length || 1)) * 35) + 20)));
  const docRiskScore = Math.min(92, Math.max(50, Math.round((missingId / total) * 100)));
  const pwdRiskScore = Math.min(90, Math.max(50, Math.round(((pwds + elderly) / total) * 120 + 35)));
  const hlpRiskScore = Math.min(88, Math.max(50, Math.round((makeshiftShelter / total) * 60 + 35)));

  return [
    {
      sector: 'gbv',
      titleAr: 'العنف القائم على النوع الاجتماعي (GBV)',
      iconName: 'ShieldAlert',
      riskLevel: gbvRiskScore >= 75 ? 'حرج للغاية (Critical)' : 'مرتفع جداً (High)',
      riskScore: gbvRiskScore,
      keyViolations: ['التحرش الجنسي واللفظي أثناء جلب المياه', 'الزواج المبكر القسري', 'الحرمان من الموارد الأساسية'],
      fieldEvidence: ['ملاحظة غياب الإنارة حول دورات المياه', 'إفادات FGD بوجود تحرش ليلي', 'سير الفتيات لمسافات تتجاوز 1.5 كم'],
      affectedDemographics: `النساء والفتيات (${Math.round((females / total) * 100)}%)، الأسر التي ترأسها نساء (${femaleHoH} أسرة)، الفتيات المراهقات`,
      threats: [
        'التحرش والاعتداء الجنسي أثناء جلب المياه والسير لمسافات طويلة في الظلام',
        'انعدام أبواب قابلة للقفل والإنارة في نقاط الصرف الصحي والتبرز في العراء',
        'التزويج المبكر والقسري للفتيات القاصرات كآلية تكيف اقتصادي سلبي'
      ],
      vulnerabilities: [
        'انعدام المساحات الصديقة للنساء والفتيات (WGFS)',
        'غياب خدمات التدبير السريري لحالات الاغتصاب (CMR) وأدوية PEP Kits خلال 72 ساعة',
        'الوصمة الاجتماعية والخوف من الإبلاغ ونقص قنوات الشكاوى الآمنة'
      ],
      capacities: [
        'وجود لجان حماية نسوية ومبادرات مجتمعية تطوعية لمرافقة الفتيات',
        'استعداد القابلات المحليات لتلقي التدريب على الإحالة الآمنة'
      ],
      copingMechanisms: {
        positive: ['التنقل في مجموعات نسائية متضامنة أثناء الاحتطاب وجلب المياه'],
        negative: ['حرمان الفتيات من الذهاب للتعليم خوفاً من الاعتداءات', 'تزويج القاصرات للتقليل من أفراد الأسرة المعالين']
      }
    },
    {
      sector: 'child_protection',
      titleAr: 'حماية الطفولة (Child Protection)',
      iconName: 'Baby',
      riskLevel: cpRiskScore >= 75 ? 'حرج للغاية (Critical)' : 'مرتفع جداً (High)',
      riskScore: cpRiskScore,
      keyViolations: ['عمالة الأطفال في جمع الخردة والتسول', 'الحرمان من التعليم', 'إساءة المعاملة والإهمال الأسري'],
      fieldEvidence: ['رصد أطفال في سن الدراسة يمارسون التسول', 'انعدام المدارس داخل الموقعين', 'أكثر من 60% بلا شهادات ميلاد'],
      affectedDemographics: `الأطفال من الجنسين (${children} طفلاً، بنسبة ${Math.round((children / total) * 100)}%)، الأيتام، والأطفال المنفصلون`,
      threats: [
        'الاستغلال الاقتصادي وعمالة الأطفال القسرية في جمع البلاستيك والحديد والتسول',
        'حوادث الغرق ومخلفات الحرب غير المنفجرة أثناء رعي المواشي',
        'الانقطاع التام عن التعليم والتعرض للإساءة البدنية والإهمال'
      ],
      vulnerabilities: [
        `ارتفاع نسبة الأطفال غير المسجلين والفاقدين لشهادات الميلاد (${childrenCases.length > 0 ? Math.round((missingBirth / childrenCases.length) * 100) : 65}%)`,
        'غياب المساحات الصديقة للأطفال وبرامج التعليم الاستدراكي التعويضي',
        'الضغوط النفسية الحادة لدى الأمهات والأولياء واللجوء للعنف الأسري'
      ],
      capacities: [
        'رغبة قوية لدى المعلمين المتطوعين لتنفيذ فصول تعليمية بديلة تحت الظلال',
        'وجود شبكات دعم مجتمعي للأيتام وكفالة الأسر الممتدة'
      ],
      copingMechanisms: {
        positive: ['انخراط الأطفال في حلقات التحفيظ ومجموعات اللعب الشعبية'],
        negative: ['الاعتماد على عمالة الأطفال لتأمين القوت اليومي', 'إخراج الأطفال من المدارس لعدم القدرة على شراء المستلزمات']
      }
    },
    {
      sector: 'legal_docs',
      titleAr: 'الوثائق الثبوتية والأحوال المدنية (Legal Documentation)',
      iconName: 'FileText',
      riskLevel: docRiskScore >= 70 ? 'حرج للغاية (Critical)' : 'مرتفع (High)',
      riskScore: docRiskScore,
      keyViolations: ['الحرمان من المساعدات الإنسانية النقدية', 'تقييد حرية التنقل عند الحواجز الأمنية'],
      fieldEvidence: ['إفادات المشاركين بفقدان البطاقات أثناء القصف', 'عدم قدرة 48% على إثبات الهوية'],
      affectedDemographics: `النازحون والمجتمع المضيف (${missingId} فرداً فاقدين للبطاقة الشخصية بنسبة ${Math.round((missingId / total) * 100)}%) والأطفال`,
      threats: [
        'الحرمان من التسجيل في قوائم المساعدات الإنسانية النقدية والغذائية للمنظمات',
        'تقييد حرية التنقل وتوقيف الشباب عند نقاط التفتيش الأمنية',
        'الحرمان المستقبلي من الامتحانات الوزارية والتسجيل في المدارس'
      ],
      vulnerabilities: [
        'فقدان وتلف الوثائق الأصلية أثناء الفرار السريع من القصف المسلح',
        'ارتفاع رسوم استخراج الوثائق وصعوبة وتكلفة الانتقال لمراكز الأحوال المدنية',
        'جهل الأسر بالإجراءات القانونية وبطء المعاملات الإدارية'
      ],
      capacities: [
        'استعداد مصلحة الأحوال المدنية والسجل المدني لتسيير لجان ميدانية متنقلة',
        'وجود عقال حارات وشهود محليين قادرين على توثيق إثبات الهوية'
      ],
      copingMechanisms: {
        positive: ['الاحتفاظ بصور إلكترونية أو نسخ ورقية قديمة للشهود'],
        negative: ['الاستدانة بفوائد باهظة لدفع مبالغ السماسرة لاستخراج بطاقات']
      }
    },
    {
      sector: 'pwd_elderly',
      titleAr: 'ذوو الإعاقة وكبار السن (PSN / Inclusion)',
      iconName: 'Accessibility',
      riskLevel: pwdRiskScore >= 70 ? 'حرج للغاية (Critical)' : 'مرتفع (High)',
      riskScore: pwdRiskScore,
      keyViolations: ['الإقصاء من المساعدات الغذائية ومراكز التوزيع', 'انعدام الرعاية الصحية للأمراض المزمنة'],
      fieldEvidence: ['رصد حالات شلل وأمراض مزمنة طريحة الفراش', 'عدم وجود كراسي متحركة أو مراحيض مهيأة'],
      affectedDemographics: `ذوو الإعاقة (${pwds} حالة) وكبار السن (${elderly} حالة) والأشخاص المصابون بأمراض مزمنة`,
      threats: [
        'العزلة التامة والإقصاء من طوابير الإغاثة وتوزيع السلات الغذائية',
        'مخاطر السقوط والإصابات لوعورة الطرق وانعدام مسارات ميسرة للكراسي المتحركة',
        'الموت البطيء نتيجة انعدام أدوية الضغط والسكري والغسيل الكلوي'
      ],
      vulnerabilities: [
        'انعدام المعينات الحركية (الكراسي المتحركة، العكازات، السماعات الطبية)',
        'مركزية التوزيع في مواقع بعيدة تتطلب السير لساعات أو دفع مبالغ مواصلات',
        'عدم مواءمة خيام المأوى والمراحيض لاحتياجات أصحاب الهمم'
      ],
      capacities: [
        'تضامن الأسر الممتدة والجيران لرعاية العجزة ومساعدتهم في جلب الحصص',
        'وجود قاعدة بيانات مجتمعية لحصر ذوي الإعاقة'
      ],
      copingMechanisms: {
        positive: ['تفويض الأقارب الموثوقين لاستلام المخصصات بالوكالة'],
        negative: ['تقليل شرب السوائل لتفادي الذهاب للمراحيض الوعرة ليلاً']
      }
    },
    {
      sector: 'hlp',
      titleAr: 'الأرض والسكن والملكية (HLP & Shelter)',
      iconName: 'Home',
      riskLevel: hlpRiskScore >= 70 ? 'حرج للغاية (Critical)' : 'مرتفع (High)',
      riskScore: hlpRiskScore,
      keyViolations: ['التهديد بالإخلاء القسري دون بدائل', 'انعدام الأمان والخصوصية الأسرية'],
      fieldEvidence: ['استخدام الخيش وأكياس القمح كمأوى', 'مطالبات ملاك الأراضي بالمغادرة أو دفع إيجارات مضاعفة'],
      affectedDemographics: `الأسر القاطنة في خيام مؤقتة (${makeshiftShelter} أسرة) والمهددون بالإخلاء`,
      threats: [
        'تهديدات متكررة بالإخلاء القسري من ملاك الأراضي الخاصة دون توفير بدائل',
        'حرائق المأوى الناتجة عن الطهي بالأخشاب داخل خيام من الخيش والبلاستيك',
        'تدمير الرياح والأمطار الموسمية للمآوي المهترئة وانكشاف الأسر للعراء'
      ],
      vulnerabilities: [
        'انعدام عقود إيجار رسمية أو اتفاقيات استخدام أراضٍ طويلة الأمد',
        'التكدس السكاني (أكثر من 8 إلى 12 فرداً في خيمة واحدة بمساحة ضيقة)',
        'شح حقائب صيانة المأوى الطارئة (ESKs) والمواد المقاومة للحرائق'
      ],
      capacities: [
        'وساطات السلطة المحلية والوجهاء المجتمعيين لتمديد مهل الإخلاء',
        'خبرة الأهالي في تدعيم الخيام بالحبال وأغصان الأشجار المحلية'
      ],
      copingMechanisms: {
        positive: ['التعاون الجماعي في بناء مصدات ترابية حول الخيام لمواجهة السيول'],
        negative: ['استئجار مآوٍ مهترئة بأسعار مجحفة تراكم الديون المستحيلة']
      }
    },
    {
      sector: 'mhpss',
      titleAr: 'الصحة النفسية والدعم النفسي الاجتماعي (MHPSS)',
      iconName: 'HeartHandshake',
      riskLevel: 'مرتفع جداً (High)',
      riskScore: 78,
      keyViolations: ['انعدام خدمات الدعم النفسي المتخصص', 'تدهور الصحة النفسية لدى الأطفال والنساء'],
      fieldEvidence: ['أعراض قلق حاد وكوابيس لدى الأطفال', 'حالات اكتئاب متقدمة بين الأمهات'],
      affectedDemographics: 'النساء، الأطفال الصغار، الفاقدون لمعيليهم، والأسر المعنفة',
      threats: [
        'تفاقم الاكتئاب السريري واضطرابات ما بعد الصدمة (PTSD) بسبب الحرب والنزوح',
        'محاولات إيذاء النفس والسلوكيات العدوانية بين المراهقين المعطلين',
        'الانهيار العصبي للأمهات نتيجة العجز عن توفير الغذاء اليومي للأطفال'
      ],
      vulnerabilities: [
        'انعدام أخصائيين نفسيين أو عيادات دعم نفسي داخل المخيمات والمديرية',
        'الوصمة المجتمعية المرتبطة بطلب العلاج النفسي',
        'تراكم الصدمات المتعددة مع استمرار شح المساعدات وفقدان الأمل'
      ],
      capacities: [
        'الروابط الأسرية الوثيقة ومجالس الدعم الروحي والاجتماعي التقليدي'
      ],
      copingMechanisms: {
        positive: ['التفريغ الوجداني بين النساء وتبادل مؤازرة الهموم في الجلسات'],
        negative: ['الانعزال التام والصمت، أو تفريغ الغضب بالعنف على الأطفال']
      }
    }
  ];
};

/**
 * Computes dynamic Standards and Gaps against Sphere and CPMS based on actual uploaded cases
 */
export const calculateDynamicStandards = (cases: DemographicCase[]): StandardGap[] => {
  if (!cases || cases.length === 0) return [];

  const total = cases.length;
  const childrenCases = cases.filter(c => c.age < 18);
  const enrolledChildren = childrenCases.filter(c => c.educationStatus.includes('ملتحق')).length;
  const registeredChildren = childrenCases.filter(c => c.hasBirthCertificate).length;
  const adultsWithId = cases.filter(c => c.hasNationalId).length;
  const safeLatrineUsers = cases.filter(c => c.sanitationAccess.includes('آمن') || (!c.sanitationAccess.includes('عراء') && !c.sanitationAccess.includes('انعدام'))).length;
  const safeWaterUsers = cases.filter(c => c.waterAccess.includes('آمن') || c.waterAccess.includes('كاف')).length;
  const dignifiedShelter = cases.filter(c => !c.shelterType.includes('عراء') && !c.shelterType.includes('خيش')).length;

  const waterCompliance = Math.round((safeWaterUsers / total) * 100);
  const sanitationCompliance = Math.round((safeLatrineUsers / total) * 100);
  const birthCertCompliance = childrenCases.length > 0 ? Math.round((registeredChildren / childrenCases.length) * 100) : 35;
  const idCompliance = Math.round((adultsWithId / total) * 100);
  const educationCompliance = childrenCases.length > 0 ? Math.round((enrolledChildren / childrenCases.length) * 100) : 25;
  const shelterCompliance = Math.round((dignifiedShelter / total) * 100);

  return [
    {
      sector: 'wash',
      standardName: 'مياه الشرب اليومية الكافية والآمنة',
      standardSource: 'Sphere',
      benchmarkDescription: 'توفير 15 لتر مياه صالحة للشرب للفرد يومياً على مسافة لا تتجاوز 500 متر وخالية من الملوحة والتلوث الجرثومي',
      currentObservedStatus: `فقط ${waterCompliance}% من الحالات في الملفات المرفوعة يحصلون على مياه آمنة، بينما يعتمد البقية على آبار مالحة أو صهاريج تجارية باهظة`,
      complianceRate: waterCompliance,
      gapSeverity: waterCompliance < 40 ? 'فجوة حرجة (Critical)' : 'فجوة رئيسية (Major)',
      recommendedAction: 'إعادة تأهيل مضخات الآبار بالطاقة الشمسية، وتركيب محطات تحلية وتوزيع أوعية كلورة وتخزين مياه نقية'
    },
    {
      sector: 'wash',
      standardName: 'مراحيض طوارئ مأمونة ومفصولة',
      standardSource: 'Sphere',
      benchmarkDescription: 'مرحاض صحي ومضاء ومزود بأقفال لكل 20 فرداً، مع الفصل التام والخصوصية للنساء والفتيات',
      currentObservedStatus: `نسبة الأمان والامتثال لا تتجاوز ${sanitationCompliance}% مع انتشار التبرز في العراء وتكدس عائلات متعددة على مراحيض غير مغلقة`,
      complianceRate: sanitationCompliance,
      gapSeverity: sanitationCompliance < 35 ? 'فجوة حرجة (Critical)' : 'فجوة رئيسية (Major)',
      recommendedAction: 'بناء كتل مراحيض طوارئ مفصولة ومزودة بأقفال داخلية وإنارة شمسية، وتأهيل قنوات التصريف الصحي'
    },
    {
      sector: 'child_protection',
      standardName: 'تسجيل المواليد واستخراج شهادات الميلاد',
      standardSource: 'CPMS',
      benchmarkDescription: 'حصول 100% من الأطفال المتأثرين بالنزاع على شهادات ميلاد رسمية لحمايتهم من انعدام الجنسية والاستغلال',
      currentObservedStatus: `فقط ${birthCertCompliance}% من الأطفال المقيدين بالملفات يمتلكون شهادات ميلاد رسمية، في حين يفتقر ${100 - birthCertCompliance}% لأي إثبات مدني`,
      complianceRate: birthCertCompliance,
      gapSeverity: birthCertCompliance < 50 ? 'فجوة حرجة (Critical)' : 'فجوة رئيسية (Major)',
      recommendedAction: 'إطلاق حملات تسجيل مدني متنقلة مجانية بالتعاون مع مصلحة الأحوال المدنية لإصدار شهادات الميلاد في المخيمات'
    },
    {
      sector: 'legal_docs',
      standardName: 'حيازة البطاقات الشخصية والوثائق الثبوتية',
      standardSource: 'IDP Principles',
      benchmarkDescription: 'حق النازحين في الاحتفاظ واستعادة وثائق الهوية الوطنية لضمان الوصول للمساعدات وحرية الحركة',
      currentObservedStatus: `معدل حيازة البطاقات ${idCompliance}%، بينما فقد ${100 - idCompliance}% وثائقهم نتيجة النزوح السريع وعجزهم عن دفع الرسوم`,
      complianceRate: idCompliance,
      gapSeverity: idCompliance < 60 ? 'فجوة حرجة (Critical)' : 'فجوة رئيسية (Major)',
      recommendedAction: 'تخصيص صندوق مساعدات قانونية لتغطية رسوم الاستخراج وتسيير لجان إصدار بطائق متنقلة'
    },
    {
      sector: 'education',
      standardName: 'التعليم الأساسي الآمن والشامل',
      standardSource: 'CPMS',
      benchmarkDescription: 'التحاق 100% من الأطفال في سن التعليم ببيئات تعليمية آمنة دون تمييز أو عوائق مالية',
      currentObservedStatus: `فقط ${educationCompliance}% من الأطفال ملتحقون بالمدارس، بينما يعاني ${100 - educationCompliance}% من الانقطاع القسري والعمالة`,
      complianceRate: educationCompliance,
      gapSeverity: educationCompliance < 40 ? 'فجوة حرجة (Critical)' : 'فجوة رئيسية (Major)',
      recommendedAction: 'إنشاء فصول تعليمية بديلة ومساحات صديقة للأطفال، وتوفير حقائب مدرسية وإعفاء النازحين من الرسوم'
    },
    {
      sector: 'shelter',
      standardName: 'المساحة الكافية والكرامة والخصوصية في المأوى',
      standardSource: 'Sphere',
      benchmarkDescription: 'توفير مساحة مغطاة لا تقل عن 3.5 م² للشخص، تضمن الحماية المناخية والخصوصية والأمان الأسري',
      currentObservedStatus: `معدل الامتثال ${shelterCompliance}%، وأغلب الأسر تتكدس في خيام من الخيش والشوادر البلاستيكية بمعدل يفوق 8 أفراد في خيمة واحدة`,
      complianceRate: shelterCompliance,
      gapSeverity: shelterCompliance < 40 ? 'فجوة حرجة (Critical)' : 'فجوة رئيسية (Major)',
      recommendedAction: 'توزيع حقائب صيانة المأوى الطارئة (ESKs)، وعوازل حرارية ومقاومة للأمطار، وتأمين اتفاقيات استقرار مع ملاك الأراضي'
    }
  ];
};

/**
 * Computes dynamic Recommendations based on data findings
 */
export const calculateDynamicRecommendations = (cases: DemographicCase[]): ProtectionRecommendation[] => {
  if (!cases || cases.length === 0) return [];

  const total = cases.length;
  const pwds = cases.filter(c => c.vulnerabilities.some(v => v.includes('إعاقة'))).length;
  const missingId = cases.filter(c => !c.hasNationalId).length;

  return [
    {
      id: 'REC-01',
      sector: 'gbv',
      title: 'تأمين الحماية والكرامة للنساء والفتيات وتوفير خدمات GBV المنقذة للحياة',
      leadActors: ['كتلة الحماية (DRC/UNFPA)', 'المنظمات الشريكة في قطاع المياه والمأوى'],
      timeframe: 'عاجل فوري (0 - 14 يوماً)',
      description: 'تركيب إنارة شمسية في ممرات المخيمات ونقاط جلب المياه والمراحيض، وتوزيع حقائب الكرامة (Dignity Kits)، وتوفير أدوية PEP Kits في المرافق الصحية القريبة وتدريب الكوادر على بروتوكول التدبير السريري CMR.',
      expectedOutcome: 'انخفاض مخاطر التحرش والاعتداء الليلي، وتوفير خدمات استجابة طبية ونفسية مؤهلة ضمن النافذة الذهبية 72 ساعة.',
      sphereLink: 'Sphere Core Standard 1 & Protection Principle 1'
    },
    {
      id: 'REC-02',
      sector: 'child_protection',
      title: 'حملة تسجيل المواليد الميدانية ودعم الأطفال المنقطعين عن التعليم',
      leadActors: ['مصلحة الأحوال المدنية', 'اليونيسف (UNICEF)', 'كتلة حماية الطفولة'],
      timeframe: 'قصير المدى (شهر - 3 أشهر)',
      description: 'إطلاق لجان متنقلة داخل المخيمات لاستخراج شهادات الميلاد مجاناً للأطفال غير المسجلين، وافتتاح مساحات صديقة للأطفال (CFS) وتقديم برامج التعليم التعويضي والاستدراكي.',
      expectedOutcome: 'حماية الأطفال من الاستغلال، وضمان حقهم في الهوية الوطنية والتعليم، والحد من عمالة الأطفال والتسول.',
      sphereLink: 'CPMS Standard 12 & INEE Standard 1'
    },
    {
      id: 'REC-03',
      sector: 'legal_docs',
      title: 'تسيير لجان استخراج البطاقات الشخصية والوثائق المدنية المفقودة',
      leadActors: ['مصلحة الأحوال المدنية والسجل المدني', 'المفوضية السامية للاجئين (UNHCR)'],
      timeframe: 'قصير المدى (شهر - 3 أشهر)',
      description: `تغطية تكاليف ورسوم استخراج البطاقات الشخصية لعدد ${missingId} حالة مسجلة بالمسح، وتبسيط إجراءات إثبات الشخصية بشهادة عقال الحارات.`,
      expectedOutcome: 'تمكين الأسر من استلام المساعدات النقدية والإغاثية الرسمية، وحرية التنقل دون توقيف أمني.',
      sphereLink: 'Sphere Protection Principle 2'
    },
    {
      id: 'REC-04',
      sector: 'pwd_elderly',
      title: 'اعتماد آليات التوزيع المتنقل وتوفير المعينات الحركية لذوي الإعاقة',
      leadActors: ['كتلة الحماية', 'مكتب الشؤون الاجتماعية والعمل', 'منظمات دعم أصحاب الهمم'],
      timeframe: 'عاجل فوري (0 - 14 يوماً)',
      description: `التحول من التوزيع المركزي في المدن إلى إيصال المساعدات للخيمة للحالات الحرجة من ذوي الإعاقة (${pwds} حالة) وتوزيع كراسي متحركة وعكازات وأدوية الأمراض المزمنة.`,
      expectedOutcome: 'ضمان الوصول الإنساني الميسر والكريم دون وساطات، وإنهاء عزلة كبار السن وذوي الإعاقة.',
      sphereLink: 'CHS Commitment 1 & Sphere Protection Principle 1'
    },
    {
      id: 'REC-05',
      sector: 'general_protection',
      title: 'تركيب محطات تحلية وبناء مراحيض طوارئ مفصولة ومضاءة',
      leadActors: ['كتلة المياه والإصحاح البيئي (WASH Cluster)', 'مؤسسة المياه المحلية'],
      timeframe: 'قصير المدى (شهر - 3 أشهر)',
      description: 'معالجة الملوحة المفرطة لآبار مياه الشرب بتركيب وحدات تحلية مياه بالتناضح العكسي (RO)، وبناء مراحيض عائلية مفصولة بين الجنسين ومزودة بأقفال.',
      expectedOutcome: 'توفير مياه عذبة آمنة مطابقة لمقاييس إسفير، والقضاء على التبرز في العراء ومخاطر الكوليرا.',
      sphereLink: 'Sphere WASH Standards 2.1 & 3.2'
    },
    {
      id: 'REC-06',
      sector: 'hlp',
      title: 'توزيع حقائب صيانة المأوى الطارئة وتوقيع مذكرات تفاهم للأراضي',
      leadActors: ['كتلة المأوى (Shelter Cluster)', 'السلطات المحلية ولجان التنسيق الميداني'],
      timeframe: 'متوسط/طويل (3 - 6 أشهر)',
      description: 'توزيع حقائب المأوى الطارئة (شوادر مقاومة للحريق، أخشاب، حبال، عوازل حرارية)، والتفاوض مع ملاك الأراضي لتوقيع عقود استقرار تمنع الإخلاء المفاجئ.',
      expectedOutcome: 'حماية الأسر من العوامل المناخية القاسية والحرائق، وضمان أمان الحيازة والاستقرار الأسري.',
      sphereLink: 'Sphere Shelter Standard 3.1 & HLP Guidelines'
    }
  ];
};
