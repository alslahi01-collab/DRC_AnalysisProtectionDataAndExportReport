import { ProtectionSector } from '../types';

export interface DemographicCase {
  id: string;
  sourceFile: string;
  location: string; // Dynamic site name from uploaded files
  governorate: string;
  district: string;
  populationGroup: 'نازح (IDP)' | 'مجتمع مضيف (Host Community)' | 'عائد (Returnee)' | 'أخرى';
  gender: 'ذكر' | 'أنثى';
  age: number;
  ageGroup: 'أطفال (0 - 17 سنة)' | 'بالغون (18 - 59 سنة)' | 'كبار السن (60+ سنة)';
  isHeadOfHH: boolean;
  femaleHeadOfHH: boolean;
  hasNationalId: boolean; // بطاقة شخصية
  hasBirthCertificate: boolean; // شهادة ميلاد للأطفال
  shelterType: string;
  educationStatus: string;
  vulnerabilities: string[]; // e.g. ذوي إعاقة، أمراض مزمنة، أطفال منفصلون، أيتام، نساء مرضعات/حوامل...
  protectionConcerns: string[]; // e.g. GBV، عمالة أطفال، زواج مبكر، مخلفات حرب، ضغط نفسي...
  waterAccess: string;
  sanitationAccess: string;
}

export interface CrossTabFilter {
  location?: string;
  populationGroup?: string;
  gender?: string;
  ageGroup?: string;
}

export interface LocationGroupStats {
  location: string;
  idpCount: number;
  hostCount: number;
  returneeCount: number;
  total: number;
}

export interface GenderAgeStats {
  ageGroup: string;
  maleCount: number;
  femaleCount: number;
  total: number;
  malePercent: number;
  femalePercent: number;
}

export interface VulnerabilityBreakdown {
  type: string;
  count: number;
  percentage: number;
  idpCount: number;
  hostCount: number;
}

export interface DocumentationStats {
  location: string;
  totalAssessed: number;
  missingNationalIdCount: number;
  missingNationalIdPercent: number;
  childrenTotal: number;
  missingBirthCertCount: number;
  missingBirthCertPercent: number;
}

export interface EducationStats {
  category: string;
  boysEnrolled: number;
  boysDroppedOut: number;
  girlsEnrolled: number;
  girlsDroppedOut: number;
  totalChildren: number;
  overallEnrollmentRate: number;
}

// Default synthesized seed case records representing comprehensive field sampling (260 cases)
export const INITIAL_DEMOGRAPHIC_CASES: DemographicCase[] = [
  // --- عينة الموقع الميداني (أ): نازحون ---
  ...Array.from({ length: 95 }, (_, i) => {
    const isChild = i < 38;
    const isElderly = i >= 82;
    const age = isChild ? Math.floor(Math.random() * 17) + 1 : isElderly ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 41) + 18;
    const gender: 'ذكر' | 'أنثى' = i % 2 === 0 ? 'أنثى' : 'ذكر';
    const ageGroup = age < 18 ? 'أطفال (0 - 17 سنة)' : age >= 60 ? 'كبار السن (60+ سنة)' : 'بالغون (18 - 59 سنة)';
    
    const vulns: string[] = [];
    if (i % 7 === 0) vulns.push('ذوي إعاقة حركية أو حسية');
    if (i % 5 === 0) vulns.push('أمراض مزمنة بدون علاج');
    if (gender === 'أنثى' && age >= 18 && i % 3 === 0) vulns.push('أسرة ترأسها امرأة');
    if (isChild && i % 9 === 0) vulns.push('أطفال منفصلون عن ذويهم (UASC)');
    if (isChild && i % 4 === 0) vulns.push('أيتام أحد الأبوين أو كليهما');
    if (isElderly) vulns.push('مسن بدون معيل كافٍ');

    return {
      id: `SITE-A-${100 + i}`,
      sourceFile: 'Field_Assessment_Site_A.xlsx',
      location: 'الموقع الميداني (أ)',
      governorate: 'المنطقة الميدانية',
      district: 'مديرية الرصد الأولى',
      populationGroup: 'نازح (IDP)' as const,
      gender,
      age,
      ageGroup: ageGroup as any,
      isHeadOfHH: age >= 18 && i % 2 === 0,
      femaleHeadOfHH: gender === 'أنثى' && age >= 18 && i % 3 === 0,
      hasNationalId: i % 2 === 0, // ~50% فقدان وثائق
      hasBirthCertificate: isChild ? (i % 3 === 0) : true, // ~66% بلا شهادات ميلاد للأطفال
      shelterType: i % 3 === 0 ? 'عراء بدون مأوى' : i % 3 === 1 ? 'مبنى مدرسي/عام' : 'خيمة مؤقتة متهالكة',
      educationStatus: isChild ? (i % 4 === 0 ? 'ملتحق بالمدرسة' : 'منقطع بسبب النزوح/الفقر') : 'غير متوفر',
      vulnerabilities: vulns,
      protectionConcerns: [
        'انعدام الخصوصية في المأوى',
        'مخاطر العنف القائم على النوع الاجتماعي GBV',
        isChild ? 'عمالة أطفال وتسول' : 'صدمة نفسية واكتئاب',
        'غياب الإنارة الليلية'
      ],
      waterAccess: i % 4 === 0 ? 'كافٍ وآمن' : 'شحيح وغير صالح للشرب',
      sanitationAccess: i % 2 === 0 ? 'حمامات مشتركة غير آمنة' : 'انعدام الحمامات / عراء',
    };
  }),

  // --- الموقع الميداني (ب): نازحون ---
  ...Array.from({ length: 85 }, (_, i) => {
    const isChild = i < 35;
    const isElderly = i >= 74;
    const age = isChild ? Math.floor(Math.random() * 17) + 1 : isElderly ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 41) + 18;
    const gender: 'ذكر' | 'أنثى' = i % 2 === 1 ? 'أنثى' : 'ذكر';
    const ageGroup = age < 18 ? 'أطفال (0 - 17 سنة)' : age >= 60 ? 'كبار السن (60+ سنة)' : 'بالغون (18 - 59 سنة)';

    const vulns: string[] = [];
    if (i % 6 === 0) vulns.push('ذوي إعاقة حركية أو حسية');
    if (i % 4 === 0) vulns.push('أمراض مزمنة بدون علاج');
    if (gender === 'أنثى' && age >= 18 && i % 3 === 1) vulns.push('أسرة ترأسها امرأة');
    if (isChild && i % 8 === 0) vulns.push('أطفال منفصلون عن ذويهم (UASC)');
    if (isElderly) vulns.push('مسن بدون معيل كافٍ');

    return {
      id: `SITE-B-${200 + i}`,
      sourceFile: 'Field_Monitoring_Site_B.csv',
      location: 'الموقع الميداني (ب)',
      governorate: 'المنطقة الميدانية',
      district: 'مديرية الرصد الثانية',
      populationGroup: 'نازح (IDP)' as const,
      gender,
      age,
      ageGroup: ageGroup as any,
      isHeadOfHH: age >= 18 && i % 2 === 1,
      femaleHeadOfHH: gender === 'أنثى' && age >= 18 && i % 3 === 1,
      hasNationalId: i % 2 === 1, // ~50% فقدان وثائق
      hasBirthCertificate: isChild ? (i % 3 === 1) : true,
      shelterType: i % 2 === 0 ? 'خيمة مؤقتة متهالكة' : 'عراء بدون مأوى',
      educationStatus: isChild ? 'منقطع بسبب النزوح/الفقر' : 'غير متوفر',
      vulnerabilities: vulns,
      protectionConcerns: [
        'ملوحة شديدة في مياه الشرب',
        'مخاطر جلب المياه للنساء والأطفال (مسافة 1 كم)',
        'غياب كامل للمراحيض المفصولة',
        'صدمات نفسية جراء القصف والنزوح'
      ],
      waterAccess: 'بعيد أكثر من 1 كم',
      sanitationAccess: 'انعدام الحمامات / عراء',
    };
  }),

  // --- المجتمع المضيف المحيط: للتكامل مع معايير Needs-based rather than status-based ---
  ...Array.from({ length: 80 }, (_, i) => {
    const isChild = i < 30;
    const isElderly = i >= 68;
    const age = isChild ? Math.floor(Math.random() * 17) + 1 : isElderly ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 41) + 18;
    const gender: 'ذكر' | 'أنثى' = i % 2 === 0 ? 'أنثى' : 'ذكر';
    const ageGroup = age < 18 ? 'أطفال (0 - 17 سنة)' : age >= 60 ? 'كبار السن (60+ سنة)' : 'بالغون (18 - 59 سنة)';

    const vulns: string[] = [];
    if (i % 8 === 0) vulns.push('ذوي إعاقة حركية أو حسية');
    if (i % 5 === 0) vulns.push('أمراض مزمنة بدون علاج');
    if (gender === 'أنثى' && age >= 18 && i % 4 === 0) vulns.push('أسرة ترأسها امرأة');
    if (isElderly) vulns.push('مسن بدون معيل كافٍ');

    return {
      id: `HOST-COM-${300 + i}`,
      sourceFile: 'Host_Community_Survey.xlsx',
      location: 'المجتمع المضيف المحيط',
      governorate: 'المنطقة الميدانية',
      district: 'مديرية المجتمع المضيف',
      populationGroup: 'مجتمع مضيف (Host Community)' as const,
      gender,
      age,
      ageGroup: ageGroup as any,
      isHeadOfHH: age >= 18 && i % 2 === 0,
      femaleHeadOfHH: gender === 'أنثى' && age >= 18 && i % 4 === 0,
      hasNationalId: i % 6 !== 0, // 83% لديهم وثائق
      hasBirthCertificate: isChild ? (i % 5 !== 0) : true, // 80% لديهم شهادات
      shelterType: 'منزل مستضاف / طيني',
      educationStatus: isChild ? (i % 3 === 0 ? 'منقطع بسبب النزوح/الفقر' : 'ملتحق بالمدرسة') : 'غير متوفر',
      vulnerabilities: vulns,
      protectionConcerns: [
        'ضغط هائل على الآبار والمرافق الصحية العامة',
        'توقف مدارس الحي لتحويلها إلى مأوى للنازحين',
        'تدهور سبل العيش وتراجع الفرص الاقتصادية',
        'مخاطر التوتر المجتمعي حول الموارد الشحيحة'
      ],
      waterAccess: i % 3 === 0 ? 'كافٍ وآمن' : 'شحيح وغير صالح للشرب',
      sanitationAccess: 'حمامات مشتركة غير آمنة',
    };
  })
];
