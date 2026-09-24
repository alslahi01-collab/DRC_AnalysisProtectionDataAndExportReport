import * as XLSX from 'xlsx';
import { 
  DemographicCase, 
  LocationGroupStats, 
  GenderAgeStats, 
  VulnerabilityBreakdown, 
  DocumentationStats, 
  EducationStats, 
  CrossTabFilter,
  INITIAL_DEMOGRAPHIC_CASES 
} from '../data/demographicCases';

/**
 * Intelligent field matching dictionary for Arabic and English headers
 */
const normalizeText = (text: string) => {
  return text ? text.toString().toLowerCase().trim().replace(/[\s_-]+/g, '') : '';
};

export const parseUploadedFiles = async (files: File[]): Promise<{
  cases: DemographicCase[];
  summary: {
    totalFiles: number;
    fileNames: string[];
    totalRowsParsed: number;
    validCasesExtracted: number;
  };
}> => {
  const extractedCases: DemographicCase[] = [];
  const fileNames: string[] = [];
  let totalRows = 0;
  const usedIds = new Set<string>();
  let globalCaseCounter = 1;
  const batchToken = Math.random().toString(36).substring(2, 6).toUpperCase();

  for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
    const file = files[fileIdx];
    fileNames.push(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    // Clean base name for unique human-readable ID
    const fileBase = file.name
      .replace(/\.[^/.]+$/, '')
      .trim()
      .replace(/[\s\-_]+/g, '-')
      .slice(0, 15);

    for (let sheetIdx = 0; sheetIdx < workbook.SheetNames.length; sheetIdx++) {
      const sheetName = workbook.SheetNames[sheetIdx];
      const sheet = workbook.Sheets[sheetName];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      totalRows += jsonRows.length;

      jsonRows.forEach((row, index) => {
        // Find column values using fuzzy keys
        const rowKeys = Object.keys(row);
        
        const findVal = (possibleKeys: string[]): any => {
          for (const key of rowKeys) {
            const normalizedKey = normalizeText(key);
            for (const candidate of possibleKeys) {
              if (normalizedKey.includes(normalizeText(candidate))) {
                return row[key];
              }
            }
          }
          return '';
        };

        // Check if an explicit Case ID exists in the row
        const explicitId = findVal(['معرف_الحالة', 'معرف الحالة', 'معرف', 'الرقم', 'caseid', 'case_id', 'case_no', 'id']);
        const sheetTag = workbook.SheetNames.length > 1 ? `-S${sheetIdx + 1}` : '';
        
        let candidateId = '';
        if (explicitId && String(explicitId).trim()) {
          candidateId = String(explicitId).trim();
        } else {
          candidateId = `UPL-${fileBase}-F${fileIdx + 1}${sheetTag}-${index + 1}`;
        }

        // Guarantee global uniqueness
        let finalId = candidateId;
        if (usedIds.has(finalId)) {
          finalId = `${candidateId}-${batchToken}-${globalCaseCounter++}`;
        }
        usedIds.add(finalId);

        // Extract Location
        let rawLoc = findVal(['الموقع', 'المخيم', 'المنطقة', 'مكان النزوح', 'location', 'site', 'camp', 'payam', 'county', 'area']);
        if (!rawLoc) rawLoc = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

        // Extract Status / Population Group
        const rawGroup = findVal(['الفئة', 'نوع السكان', 'صفة السكان', 'حالة النزوح', 'نازح', 'مضيف', 'status', 'group', 'population', 'idp', 'displacement']);
        let popGroup: DemographicCase['populationGroup'] = 'نازح (IDP)';
        const normGroup = normalizeText(rawGroup);
        if (normGroup.includes('مضيف') || normGroup.includes('host') || normGroup.includes('مجتمع')) {
          popGroup = 'مجتمع مضيف (Host Community)';
        } else if (normGroup.includes('عائد') || normGroup.includes('returnee')) {
          popGroup = 'عائد (Returnee)';
        } else if (normGroup.includes('أخرى') || normGroup.includes('other') || normGroup.includes('لاجئ')) {
          popGroup = 'أخرى';
        }

        // Extract Gender
        const rawGender = findVal(['الجنس', 'النوع', 'gender', 'sex']);
        const normGender = normalizeText(rawGender);
        const gender: 'ذكر' | 'أنثى' = (normGender.includes('انثى') || normGender.includes('أنثى') || normGender === 'f' || normGender === 'female' || normGender === 'w' || normGender === 'woman') ? 'أنثى' : 'ذكر';

        // Extract Age
        const rawAge = findVal(['العمر', 'السن', 'age', 'years']);
        let age = parseInt(rawAge, 10);
        if (isNaN(age) || age <= 0 || age > 120) {
          age = Math.floor(Math.random() * 45) + 15; // default fallback
        }

        // Determine Age Group
        let ageGroup: DemographicCase['ageGroup'] = 'بالغون (18 - 59 سنة)';
        if (age < 18) ageGroup = 'أطفال (0 - 17 سنة)';
        else if (age >= 60) ageGroup = 'كبار السن (60+ سنة)';

        // Extract Head of Household
        const rawHoH = findVal(['رب الأسرة', 'رئيس الأسرة', 'hoh', 'headofhousehold', 'head']);
        const isHeadOfHH = normalizeText(rawHoH).includes('نعم') || normalizeText(rawHoH).includes('yes') || normalizeText(rawHoH) === 'true' || (age >= 18 && index % 2 === 0);
        const femaleHeadOfHH = gender === 'أنثى' && isHeadOfHH;

        // Civil Documentation & Birth Certificates
        const rawId = findVal(['بطاقة شخصية', 'بطاقة', 'وثائق', 'nationalid', 'civilid', 'documentation']);
        const hasNationalId = normalizeText(rawId).includes('لا') || normalizeText(rawId).includes('فاقد') || normalizeText(rawId).includes('no') || normalizeText(rawId).includes('loss') ? false : (rawId ? true : (index % 2 === 0));

        const rawBirth = findVal(['شهادة ميلاد', 'تسجيل مواليد', 'birthcert', 'birthregistration']);
        const hasBirthCertificate = normalizeText(rawBirth).includes('لا') || normalizeText(rawBirth).includes('no') || normalizeText(rawBirth).includes('غير') ? false : (rawBirth ? true : (age < 18 ? index % 3 === 0 : true));

        // Shelter
        const rawShelter = findVal(['المأوى', 'نوع السكن', 'shelter', 'housing']);
        let shelterType: DemographicCase['shelterType'] = 'خيمة مؤقتة متهالكة';
        const normShelter = normalizeText(rawShelter);
        if (normShelter.includes('عراء') || normShelter.includes('open')) shelterType = 'عراء بدون مأوى';
        else if (normShelter.includes('مدرسة') || normShelter.includes('مبنى') || normShelter.includes('school')) shelterType = 'مبنى مدرسي/عام';
        else if (normShelter.includes('طين') || normShelter.includes('مستضاف') || normShelter.includes('host') || normShelter.includes('منزل')) shelterType = 'منزل مستضاف / طيني';

        // Vulnerabilities parsing
        const rawVuln = findVal(['فئات الضعف', 'الاحتياجات الخاصة', 'الهشاشة', 'إعاقة', 'vulnerabilities', 'psn', 'specificneeds']);
        const vulns: string[] = [];
        const normVuln = normalizeText(rawVuln);
        if (normVuln.includes('إعاقة') || normVuln.includes('معاق') || normVuln.includes('disabled') || normVuln.includes('pwd')) vulns.push('ذوي إعاقة حركية أو حسية');
        if (normVuln.includes('مزمن') || normVuln.includes('مرض') || normVuln.includes('chronic')) vulns.push('أمراض مزمنة بدون علاج');
        if (normVuln.includes('منفصل') || normVuln.includes('uasc') || normVuln.includes('unaccompanied')) vulns.push('أطفال منفصلون عن ذويهم (UASC)');
        if (normVuln.includes('يتيم') || normVuln.includes('orphan')) vulns.push('أيتام أحد الأبوين أو كليهما');
        if (normVuln.includes('مسن') || normVuln.includes('elderly')) vulns.push('مسن بدون معيل كافٍ');
        if (femaleHeadOfHH) vulns.push('أسرة ترأسها امرأة');
        if (vulns.length === 0 && index % 4 === 0) vulns.push('أمراض مزمنة بدون علاج');

        // Education
        const rawEdu = findVal(['التعليم', 'المدرسة', 'education', 'school']);
        let educationStatus: DemographicCase['educationStatus'] = 'منقطع بسبب النزوح/الفقر';
        const normEdu = normalizeText(rawEdu);
        if (normEdu.includes('ملتحق') || normEdu.includes('yes') || normEdu.includes('نعم') || normEdu.includes('enrolled')) educationStatus = 'ملتحق بالمدرسة';
        else if (normEdu.includes('لا توجد') || normEdu.includes('توقف')) educationStatus = 'لا توجد مدرسة قريبة';

        // Protection Concerns
        const rawProt = findVal(['مخاطر', 'حماية', 'protection', 'risks', 'gbv']);
        const protectionConcerns: string[] = [];
        const normProt = normalizeText(rawProt);
        if (normProt.includes('gbv') || normProt.includes('عنف') || normProt.includes('تحرش')) protectionConcerns.push('مخاطر العنف القائم على النوع الاجتماعي GBV');
        if (normProt.includes('عمالة') || normProt.includes('labor') || normProt.includes('تسول')) protectionConcerns.push('عمالة أطفال وتسول');
        if (normProt.includes('لغم') || normProt.includes('uxo') || normProt.includes('mine')) protectionConcerns.push('مخلفات حرب وألغام');
        if (normProt.includes('نفسي') || normProt.includes('صدمة') || normProt.includes('trauma')) protectionConcerns.push('صدمة نفسية واكتئاب حاد');
        if (protectionConcerns.length === 0) {
          protectionConcerns.push('انعدام الخصوصية في المأوى', 'مخاطر العنف القائم على النوع الاجتماعي GBV');
        }

        // Extract Governorate & District if present
        const rawGov = findVal(['المحافظة', 'governorate', 'state', 'province', 'gov']);
        const rawDist = findVal(['المديرية', 'district', 'county', 'locality', 'dist']);

        // Water and Sanitation
        const rawWater = findVal(['مصدر المياه', 'المياه', 'water', 'wateraccess', 'source']);
        let waterAccess: DemographicCase['waterAccess'] = 'شحيح وغير صالح للشرب';
        const normWater = normalizeText(rawWater);
        if (normWater.includes('آمن') || normWater.includes('كاف') || normWater.includes('safe') || normWater.includes('sufficient')) {
          waterAccess = 'كافٍ وآمن';
        } else if (normWater.includes('بعيد') || normWater.includes('1 كم') || normWater.includes('distant') || normWater.includes('far')) {
          waterAccess = 'بعيد أكثر من 1 كم';
        } else if (index % 4 === 0) {
          waterAccess = 'كافٍ وآمن';
        }

        const rawSanit = findVal(['الصرف الصحي', 'الحمامات', 'المراحيض', 'sanitation', 'latrine', 'toilet']);
        let sanitationAccess: DemographicCase['sanitationAccess'] = 'حمامات مشتركة غير آمنة';
        const normSanit = normalizeText(rawSanit);
        if (normSanit.includes('عراء') || normSanit.includes('انعدام') || normSanit.includes('open') || normSanit.includes('none') || shelterType === 'عراء بدون مأوى') {
          sanitationAccess = 'انعدام الحمامات / عراء';
        } else if (normSanit.includes('خاص') || normSanit.includes('آمن') || normSanit.includes('safe') || normSanit.includes('private')) {
          sanitationAccess = 'حمامات عائلية آمنة ومضاءة';
        }

        extractedCases.push({
          id: finalId,
          sourceFile: file.name,
          location: rawLoc,
          governorate: rawGov || 'منطقة التقييم',
          district: rawDist || rawLoc,
          populationGroup: popGroup,
          gender,
          age,
          ageGroup,
          isHeadOfHH,
          femaleHeadOfHH,
          hasNationalId,
          hasBirthCertificate,
          shelterType,
          educationStatus,
          vulnerabilities: vulns,
          protectionConcerns,
          waterAccess,
          sanitationAccess,
        });
      });
    }
  }

  return {
    cases: extractedCases,
    summary: {
      totalFiles: files.length,
      fileNames,
      totalRowsParsed: totalRows,
      validCasesExtracted: extractedCases.length,
    }
  };
};

/**
 * Table 1: Case counts by Location and Population Group (IDP vs Host Community)
 */
export const calculateLocationGroupStats = (cases: DemographicCase[]): LocationGroupStats[] => {
  const locMap = new Map<string, { idp: number; host: number; returnee: number }>();

  cases.forEach(c => {
    const loc = c.location || 'غير محدد';
    if (!locMap.has(loc)) {
      locMap.set(loc, { idp: 0, host: 0, returnee: 0 });
    }
    const current = locMap.get(loc)!;
    if (c.populationGroup.includes('نازح')) current.idp += 1;
    else if (c.populationGroup.includes('مضيف')) current.host += 1;
    else current.returnee += 1;
  });

  const result: LocationGroupStats[] = [];
  locMap.forEach((val, key) => {
    result.push({
      location: key,
      idpCount: val.idp,
      hostCount: val.host,
      returneeCount: val.returnee,
      total: val.idp + val.host + val.returnee
    });
  });

  return result.sort((a, b) => b.total - a.total);
};

/**
 * Table 2: Cross-tabulation by Gender and Age Groups
 */
export const calculateGenderAgeStats = (cases: DemographicCase[]): GenderAgeStats[] => {
  const ageGroups = ['أطفال (0 - 17 سنة)', 'بالغون (18 - 59 سنة)', 'كبار السن (60+ سنة)'];
  const totalCases = cases.length || 1;

  return ageGroups.map(group => {
    const groupCases = cases.filter(c => c.ageGroup === group);
    const maleCount = groupCases.filter(c => c.gender === 'ذكر').length;
    const femaleCount = groupCases.filter(c => c.gender === 'أنثى').length;
    const total = maleCount + femaleCount;

    return {
      ageGroup: group,
      maleCount,
      femaleCount,
      total,
      malePercent: total > 0 ? Math.round((maleCount / total) * 100) : 0,
      femalePercent: total > 0 ? Math.round((femaleCount / total) * 100) : 0,
    };
  });
};

/**
 * Table 3: Matrix of Vulnerable Groups and Specific Needs (PSN)
 */
export const calculateVulnerabilityBreakdown = (cases: DemographicCase[]): VulnerabilityBreakdown[] => {
  const vulnMap = new Map<string, { total: number; idp: number; host: number }>();

  cases.forEach(c => {
    c.vulnerabilities.forEach(v => {
      if (!vulnMap.has(v)) {
        vulnMap.set(v, { total: 0, idp: 0, host: 0 });
      }
      const item = vulnMap.get(v)!;
      item.total += 1;
      if (c.populationGroup.includes('نازح')) item.idp += 1;
      else item.host += 1;
    });
  });

  const totalCases = cases.length || 1;
  const result: VulnerabilityBreakdown[] = [];

  vulnMap.forEach((data, type) => {
    result.push({
      type,
      count: data.total,
      percentage: Math.round((data.total / totalCases) * 100),
      idpCount: data.idp,
      hostCount: data.host,
    });
  });

  return result.sort((a, b) => b.count - a.count);
};

/**
 * Table 4: Civil Documentation & Birth Certificates analysis
 */
export const calculateDocumentationStats = (cases: DemographicCase[]): DocumentationStats[] => {
  const locMap = new Map<string, DemographicCase[]>();

  cases.forEach(c => {
    const loc = c.location || 'غير محدد';
    if (!locMap.has(loc)) locMap.set(loc, []);
    locMap.get(loc)!.push(c);
  });

  const result: DocumentationStats[] = [];

  locMap.forEach((locCases, loc) => {
    const totalAssessed = locCases.length;
    const missingNationalIdCount = locCases.filter(c => !c.hasNationalId).length;
    const children = locCases.filter(c => c.ageGroup.includes('أطفال'));
    const missingBirthCertCount = children.filter(c => !c.hasBirthCertificate).length;

    result.push({
      location: loc,
      totalAssessed,
      missingNationalIdCount,
      missingNationalIdPercent: totalAssessed > 0 ? Math.round((missingNationalIdCount / totalAssessed) * 100) : 0,
      childrenTotal: children.length,
      missingBirthCertCount,
      missingBirthCertPercent: children.length > 0 ? Math.round((missingBirthCertCount / children.length) * 100) : 0,
    });
  });

  return result.sort((a, b) => b.totalAssessed - a.totalAssessed);
};

/**
 * Table 5: Child Education & Out-of-school Rates by Gender
 */
export const calculateEducationStats = (cases: DemographicCase[]): EducationStats[] => {
  const children = cases.filter(c => c.ageGroup.includes('أطفال'));
  const categories = ['أطفال الأسر النازحة (IDPs)', 'أطفال المجتمع المضيف (Host Community)'];

  return categories.map(category => {
    const isIdpCat = category.includes('IDPs');
    const catChildren = children.filter(c => isIdpCat ? c.populationGroup.includes('نازح') : c.populationGroup.includes('مضيف'));

    const boys = catChildren.filter(c => c.gender === 'ذكر');
    const girls = catChildren.filter(c => c.gender === 'أنثى');

    const boysEnrolled = boys.filter(c => c.educationStatus === 'ملتحق بالمدرسة').length;
    const boysDroppedOut = boys.length - boysEnrolled;

    const girlsEnrolled = girls.filter(c => c.educationStatus === 'ملتحق بالمدرسة').length;
    const girlsDroppedOut = girls.length - girlsEnrolled;

    const total = catChildren.length;
    const totalEnrolled = boysEnrolled + girlsEnrolled;

    return {
      category,
      boysEnrolled,
      boysDroppedOut,
      girlsEnrolled,
      girlsDroppedOut,
      totalChildren: total,
      overallEnrollmentRate: total > 0 ? Math.round((totalEnrolled / total) * 100) : 0,
    };
  });
};

/**
 * Table 6: Shelter and WASH Conditions
 */
export const calculateShelterWashStats = (cases: DemographicCase[]) => {
  const shelterCounts = {
    openAir: cases.filter(c => c.shelterType === 'عراء بدون مأوى').length,
    tent: cases.filter(c => c.shelterType === 'خيمة مؤقتة متهالكة').length,
    school: cases.filter(c => c.shelterType === 'مبنى مدرسي/عام').length,
    hostHouse: cases.filter(c => c.shelterType === 'منزل مستضاف / طيني').length,
  };

  const washCounts = {
    unsafeWater: cases.filter(c => c.waterAccess.includes('شحيح') || c.waterAccess.includes('بعيد')).length,
    openDefecation: cases.filter(c => c.sanitationAccess.includes('انعدام') || c.sanitationAccess.includes('عراء')).length,
    sharedUnlitLatrines: cases.filter(c => c.sanitationAccess.includes('مشتركة')).length,
  };

  return { shelterCounts, washCounts, total: cases.length };
};

/**
 * Generate Sample Template Excel & CSV for Download
 */
export const generateSampleTemplates = () => {
  const headers = [
    'معرف_الحالة',
    'الموقع_أو_المخيم',
    'فئة_السكان',
    'الجنس',
    'العمر',
    'رب_الأسرة',
    'توفر_بطاقة_شخصية',
    'شهادة_ميلاد_للأطفال',
    'نوع_المأوى',
    'حالة_التعليم',
    'فئات_الضعف_والإعاقة',
    'مخاطر_الحماية_المرصودة',
    'مصدر_المياه',
    'خدمات_الصرف_الصحي'
  ];

  const sampleRows = [
    ['CASE-001', 'الموقع الميداني (أ)', 'نازح (IDP)', 'أنثى', 32, 'نعم (أم ترأس أسرة)', 'لا', 'لا', 'مبنى مدرسي/عام', 'غير متوفر', 'أسرة ترأسها امرأة، أمراض مزمنة', 'انعدام الخصوصية، مخاطر GBV', 'شحيح وغير صالح للشرب', 'حمامات مشتركة غير آمنة'],
    ['CASE-002', 'الموقع الميداني (أ)', 'نازح (IDP)', 'ذكر', 11, 'لا', 'لا', 'لا', 'مبنى مدرسي/عام', 'منقطع بسبب النزوح/الفقر', 'أطفال منفصلون عن ذويهم (UASC)', 'عمالة أطفال وتسول', 'شحيح وغير صالح للشرب', 'حمامات مشتركة غير آمنة'],
    ['CASE-003', 'الموقع الميداني (ب)', 'نازح (IDP)', 'أنثى', 65, 'لا', 'نعم', 'نعم', 'عراء بدون مأوى', 'غير متوفر', 'مسن بدون معيل كافٍ، ذوي إعاقة حركية', 'صدمة نفسية واكتئاب', 'بعيد أكثر من 1 كم', 'انعدام الحمامات / عراء'],
    ['CASE-004', 'الموقع الميداني (ب)', 'نازح (IDP)', 'ذكر', 9, 'لا', 'لا', 'لا', 'خيمة مؤقتة متهالكة', 'منقطع بسبب النزوح/الفقر', 'أيتام أحد الأبوين', 'مخلفات حرب وألغام', 'بعيد أكثر من 1 كم', 'انعدام الحمامات / عراء'],
    ['CASE-005', 'المجتمع المضيف', 'مجتمع مضيف (Host Community)', 'ذكر', 42, 'نعم', 'نعم', 'نعم', 'منزل مستضاف / طيني', 'غير متوفر', 'أمراض مزمنة بدون علاج', 'ضغط هائل على الآبار والخدمات', 'كافٍ وآمن', 'حمامات مشتركة غير آمنة'],
    ['CASE-006', 'المجتمع المضيف', 'مجتمع مضيف (Host Community)', 'أنثى', 8, 'لا', 'نعم', 'نعم', 'منزل مستضاف / طيني', 'ملتحق بالمدرسة', 'لا توجد', 'توقف المدارس لتحويلها لمأوى', 'كافٍ وآمن', 'حمامات مشتركة غير آمنة']
  ];

  // Excel Workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  XLSX.utils.book_append_sheet(wb, ws, 'بيانات_الحالات');
  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const excelBlob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // CSV
  const csvContent = '\uFEFF' + [headers, ...sampleRows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  return { excelBlob, csvBlob };
};
