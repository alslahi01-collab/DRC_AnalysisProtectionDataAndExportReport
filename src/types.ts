export type AssessmentTool = 'all' | 'kii' | 'fgd' | 'observation';
export type LocationFilter = string;
export type ProtectionSector = 
  | 'general_protection' 
  | 'child_protection' 
  | 'gbv' 
  | 'pwd_elderly' 
  | 'legal_docs' 
  | 'hlp' 
  | 'mhpss';

export interface KIIRecord {
  id: string;
  date: string;
  interviewer: string;
  location: string;
  organization: string;
  keyInformantName: string;
  role: string;
  gender: 'ذكر' | 'أنثى';
  age: number;
  consent: boolean;
  affectedCivilInfra: string;
  shelterType: string;
  otherInfraCondition: string;
  vulnerableGroupsPresent: {
    pwd: boolean;
    chronicIllnessMental: boolean;
    destituteElderly: boolean;
    elderlyCaregivers: boolean;
    singleHeadsOfHH: boolean;
    childHeadsOfHH: boolean;
    idps: boolean;
    traumaExposed: boolean;
    outOfSchoolChildren: boolean;
    other: boolean;
  };
  neededServices: {
    health: boolean;
    nutrition: boolean;
    education: boolean;
    food: boolean;
    childSupport: boolean;
    womenServices: boolean;
    pwdServices: boolean;
    legalAid: boolean;
    mhpss: boolean;
    other: string;
  };
  serviceBarriers: string;
  mostAffectedByBarriers: string;
  copingStrategies: string;
  negativeCopingMechanisms: string;
  risksWomenGirls: string;
  risksMenBoys: string;
  risksPwdElderly: string;
  idLossPercentage: number;
  unaccompaniedChildren: boolean;
  unaccompaniedLivingWith: string;
  careArrangements: boolean;
  careDetails: string;
  youthActivities: string;
  mostAffectedGroups: string;
  hlpIssues: boolean;
  hlpDetails: string;
  deathInjuryCauses: string;
  freedomOfMovement: boolean;
  freedomDetails: string;
  minesUxosFound: boolean;
  intergroupTensions: boolean;
  intergroupTensionsDetails: string;
  otherIssues: string;
}

export interface FGDRecord {
  id: string;
  date: string;
  facilitator: string;
  notetaker: string;
  groupNumber: string;
  identificationMethod: string;
  location: string;
  district: string;
  governorate: string;
  gender: 'ذكر' | 'أنثى';
  ageGroup: string;
  targetPopulation: string;
  totalParticipants: number;
  consent: boolean;
  displacementOriginAndRoute: string;
  expectMoreArrivals: boolean;
  futureIntentions: string;
  knowElderlyDisabledInjured: string;
  knowSeparatedUnaccompaniedChildren: string;
  mainServiceProblems: string;
  mostAffectedByBarriers: string;
  serviceSources: string;
  howFamiliesOvercome: string;
  supportProvidersForVulnerable: string;
  risksWomenGirlsMenBoys: string;
  civilDocumentationAccess: string;
  birthRegistrationStatus: string;
  childProtectionRisks: string;
  canChildrenAttendSchool: boolean;
  otherGroupRisks: string;
  unsafeSituations: string;
  warAffectedPersons: string;
  knownViolenceCases: string;
  movementRestrictions: string;
  childViolations: string;
  childrenAffectedMinesUxos: string;
  hostCommunityRelations: string;
  communityTensionPoints: string;
  recommendations: string;
}

export interface ObservationRecord {
  id: string;
  date: string;
  observerName: string;
  location: string;
  organization: string;
  siteType: string;
  civilInfraDamaged: string;
  shelterType: string;
  otherInfraStatus: string;
  approxIdpCount: number;
  approxWomenChildrenCount: number;
  elderlyOrInjuredPresent: boolean;
  traumaDepressionSymptomsVisible: boolean;
  hiddenGroups: boolean;
  hiddenGroupsDetails: string;
  aidDistributionSigns: boolean;
  aidDistributors: string;
  functioningHealthFacilities: boolean;
  schoolObservable: boolean;
  waterFetchingSigns: boolean;
  nearestWaterDistance: string;
  waterFetchers: string;
  separateLatrinesForSexes: boolean;
  latrinesLighting: boolean;
  waterSourceInSite: boolean;
  longWaitingForWater: boolean;
  commonSafeMeetingSpace: boolean;
  dailyActivities: string;
  elderlyAndPwdObservations: string;
  neglectIsolationSigns: boolean;
  disabilityCareArrangements: boolean;
  separatedChildrenCareArrangements: boolean;
  schoolLocationRisks: boolean;
  schoolBuildingRisks: boolean;
  latrineLocationRisksWomenGirls: boolean;
  waterSourceRisksWomenGirls: boolean;
  dangerSignsForResidents: boolean;
  deathsSigns: boolean;
  movementRestrictions: boolean;
  functioningGovInstitutions: string;
  naturalDisasterRisks: boolean;
  directSafetyThreats: boolean;
  intergroupTensions: boolean;
  otherIssuesObserved: string;
}

export interface SectorRiskAnalysis {
  sector: ProtectionSector;
  titleAr: string;
  iconName: string;
  riskLevel: 'حرج للغاية (Critical)' | 'مرتفع جداً (High)' | 'مرتفع (High)' | 'متوسط (Medium)';
  riskScore: number; // 1-100
  threats: string[];
  vulnerabilities: string[];
  capacities: string[];
  copingMechanisms: {
    positive: string[];
    negative: string[];
  };
  keyViolations: string[];
  affectedDemographics: string;
  fieldEvidence: string[];
}

export interface StandardGap {
  sector: string;
  standardName: string;
  standardSource: 'Sphere' | 'CPMS' | 'IASC GBV' | 'IASC PWD' | 'CHS' | 'IDP Principles';
  benchmarkDescription: string;
  currentObservedStatus: string;
  gapSeverity: 'فجوة حرجة (Critical)' | 'فجوة رئيسية (Major)' | 'فجوة معتدلة (Moderate)';
  complianceRate: number; // 0-100%
  recommendedAction: string;
}

export interface ProtectionRecommendation {
  id: string;
  sector: ProtectionSector | 'coordination';
  title: string;
  timeframe: 'عاجل فوري (0 - 14 يوماً)' | 'قصير المدى (شهر - 3 أشهر)' | 'متوسط/طويل (3 - 6 أشهر)';
  leadActors: string[];
  description: string;
  expectedOutcome: string;
  sphereLink: string;
}
