export type Role = 'hr_admin' | 'management' | 'payroll_officer' | 'supervisor' | 'member';

export type Language = 'am' | 'en';

export type PoliceRank =
  | 'ኮንስታብል' // Constable
  | 'ረዳት ሳጅን' // Assistant Sergeant
  | 'ምክትል ሳጅን' // Deputy Sergeant
  | 'ሳጅን' // Sergeant
  | 'ዋና ሳጅን' // Chief Sergeant
  | 'ረዳት ኢንስፔክተር' // Assistant Inspector
  | 'ምክትል ኢንስፔክተር' // Deputy Inspector
  | 'ዋና ኢንስፔክተር' // Chief Inspector
  | 'ኮማንደር' // Commander
  | 'ረዳት ኮሚሽነር' // Assistant Commissioner
  | 'ምክትል ኮሚሽነር' // Deputy Commissioner
  | 'ኮሚሽነር'; // Commissioner

export type DepartmentName =
  | 'ወንጀል ምርመራ መምሪያ' // Criminal Investigation
  | 'ወንጀል መከላከልና ፓትሮል መምሪያ' // Crime Prevention & Patrol
  | 'ትራፊክ ደህንነትና ቁጥጥር መምሪያ' // Traffic Safety & Control
  | 'ልዩ ፈጣን ኃይል መምሪያ' // Special Rapid Police Force
  | 'የሰው ኃይል አስተዳደርና ልማት መምሪያ' // HR Administration & Development
  | 'ሥልጠናና የፖሊስ ኮሌጅ' // Police College & Training
  | 'ሎጂስቲክስና ንብረት አስተዳደር' // Logistics & Property
  | 'ፋይናንስና በጀት መምሪያ' // Finance & Budget
  | 'የኮሚሽኑ ዋና አዛዥ ጽ/ቤት'; // Commissioner HQ Command

export type StationLocation =
  | 'አሶሳ ዋና መምሪያ (Assosa HQ)'
  | 'አሶሳ ከተማ ፖሊስ መምሪያ'
  | 'መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)'
  | 'ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)'
  | 'ባምባሲ ወረዳ ፖሊስ ጣቢያ'
  | 'ሆሞሻ ወረዳ ፖሊስ ጣቢያ'
  | 'መንዲ ወረዳ ፖሊስ ጣቢያ'
  | 'ዳንጉር ወረዳ ፖሊስ ጣቢያ'
  | 'ፓዌ ወረዳ ፖሊስ ጣቢያ'
  | 'ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)'
  | 'ኩርሙክ ድንበር ጣቢያ';

export type EmploymentStatus =
  | 'active' // በስራ ላይ
  | 'on_leave' // በእረፍት ፈቃድ ላይ
  | 'transferred_pending' // በዝውውር ሂደት
  | 'retired' // በጡረታ የተሰናበተ
  | 'resigned' // በግል ፈቃድ የለቀቀ
  | 'dismissed' // የተባረረ
  | 'terminated'; // አገልግሎት ያበቃ/የተቋረጠ

export type SeparationType =
  | 'በጡረታ የተሰናበተ (Retirement)'
  | 'በግል ፈቃድ የለቀቀ (Resignation)'
  | 'የተባረረ (Dismissal)'
  | 'የአገልግሎት ዘመን ያበቃ (Term Ended)'
  | 'በህክምና ምክንያት የተሰናበተ (Medical Discharge)'
  | 'በህግ/ደንብ መሰረት የተለየ (Statutory Separation)';

export interface PoliceIdIdentity {
  policeId: string; // e.g. BGR-POL-1600001 or BG-POL-10142
  fullName: string;
  fullNameEn?: string;
  photoUrl: string;
  gender: 'ወንድ' | 'ሴት';
  phone?: string;
  badgeNumber?: string;
  rankAm?: string;
  rankEn?: string;
  responsibilityAm?: string;
  responsibilityEn?: string;
  height?: string;
  complexion?: string;
  memberSignature?: string;
  commissionerSignature?: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  issueDate: string;
  expiryDate?: string;
  bloodGroup?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: {
    region: string;
    zone: string;
    wereda: string;
    kebele: string;
    houseNo?: string;
  };
  idSystemStatus: 'active' | 'suspended' | 'revoked';
}

export interface RankHistoryItem {
  id: string;
  rank: PoliceRank;
  effectiveDate: string;
  orderNumber: string;
  approvedBy: string;
  remarks?: string;
}

export interface TransferHistoryItem {
  id: string;
  fromDepartment: DepartmentName;
  toDepartment: DepartmentName;
  fromStation: StationLocation;
  toStation: StationLocation;
  reason: string;
  requestDate: string;
  approvalDate: string;
  effectiveDate: string;
  approvingOfficer: string;
  orderRef: string;
}

export interface TrainingItem {
  id: string;
  title: string;
  trainingType: 'መሰረታዊ ወታደራዊ' | 'የወንጀል ምርመራ' | 'የትራፊክ ቁጥጥር' | 'የአመራር ጥበብ' | 'የህግና ሰብአዊ መብቶች' | 'ልዩ ዘመቻ';
  institution: string;
  startDate: string;
  endDate: string;
  certificateRef?: string;
  status: 'የተጠናቀቀ' | 'በሂደት ላይ' | 'የተመደበ';
  gradeOrScore?: string;
}

export interface PerformanceRecord {
  id: string;
  year: number;
  evaluationPeriod: string; // e.g. "2018 ዓ.ም - 1ኛ ሩብ ዓመት"
  score: number; // 0 - 100
  rating: 'እጅግ የላቀ (90-100)' | 'ከፍተኛ (80-89)' | 'መካከለኛ (65-79)' | 'ዝቅተኛ (<65)';
  supervisorName: string;
  supervisorRank: string;
  strength: string;
  improvementArea: string;
  finalDecision: string;
  date: string;
}

export interface LeaveRecord {
  id: string;
  leaveType: 'ዓመታዊ እረፍት' | 'የህመም ፈቃድ' | 'የወሊድ ፈቃድ' | 'የሀዘን ፈቃድ' | 'ልዩ ፈቃድ';
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'የተፈቀደ' | 'የተጠናቀቀ' | 'በሂደት ላይ';
  approvedBy: string;
  approvedDate: string;
}

export interface PersonnelDocument {
  id: string;
  title: string;
  documentType:
    | 'ደብዳቤ'
    | 'የቅጥር ሰነድ'
    | 'የPromotion ደብዳቤ'
    | 'የዝውውር ደብዳቤ'
    | 'የስልጠና ማስረጃ'
    | 'የፈቃድ ሰነድ'
    | 'የሽልማት ሰነድ'
    | 'የዲሲፕሊን ሰነድ'
    | 'የስንብት ደብዳቤ'
    | 'የጡረታ ሰነድ'
    | 'የመታወቂያ ኮፒ'
    | 'ሌሎች HR ሰነዶች';
  referenceNumber: string;
  documentDate: string;
  fileUrl: string; // base64 or photo URL
  fileType: 'image' | 'pdf';
  fileSizeText?: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  type: 'housing' | 'transport' | 'duty' | 'field' | 'medical' | 'hazard';
  monthlyAmount: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
  remarks?: string;
}

export interface SeparationRecord {
  id: string;
  separationType: SeparationType;
  separationDate: string;
  totalServiceYears: number;
  lastRank: PoliceRank;
  lastSalaryGrade: number;
  lastSalaryStep: number;
  reason: string;
  decisionRef: string;
  decisionDocumentUrl?: string;
  approvedBy: string;
  approvalDate: string;
  pensionEligible: boolean;
  pensionBookRef?: string;
  clearanceCompleted: boolean;
  auditNote?: string;
}

export interface MemberProfile {
  // Primary identifier mapped to Police ID System
  policeId: string; // Master Key (e.g. BG-000125)
  badgeNumber: string;

  // Identity authoritative from Police ID System
  identity: PoliceIdIdentity;

  // HR Details managed in HRM
  currentRank: PoliceRank;
  currentDepartment: DepartmentName;
  currentStation: StationLocation;
  position: string;
  employmentDate: string;
  employmentType: 'ቋሚ (Permanent)' | 'ኮንትራት (Contract)' | 'ልዩ ምደባ (Special Assignment)';
  status: EmploymentStatus;

  // Compensation & Grade
  salaryGrade: number; // 1 to 10
  salaryStep: number; // 1 to 9
  baseSalary: number;
  monthlyAllowances: {
    duty: number;
    field: number;
    housing: number;
    transport: number;
    hazard: number;
  };
  pensionDeductionRate: number; // e.g. 0.07 (7%)
  taxDeductionRate: number; // e.g. 0.15 (15%)

  // Leave balances
  leaveBalance: {
    annualTotal: number;
    annualUsed: number;
    annualRemaining: number;
    sickUsed: number;
    specialUsed: number;
  };

  // Full History Dossiers
  rankHistory: RankHistoryItem[];
  transferHistory: TransferHistoryItem[];
  trainingHistory: TrainingItem[];
  performanceHistory: PerformanceRecord[];
  leaveHistory: LeaveRecord[];
  documents: PersonnelDocument[];
  benefits: BenefitItem[];
  disciplinaryRecords: Array<{
    id: string;
    date: string;
    incident: string;
    measureTaken: string;
    verdictRef: string;
    status: 'የተዘጋ' | 'በክትትል ላይ';
  }>;
  awardsAndHonors: Array<{
    id: string;
    date: string;
    title: string;
    awardedBy: string;
    reason: string;
    medalOrCertRef: string;
  }>;

  // Service Separation (if departed)
  separation?: SeparationRecord;

  // Portal Account
  userAccount: {
    username: string;
    password?: string;
    isActive: boolean;
    lastLogin?: string;
    createdDate: string;
    createdBy?: string;
  };
}

export interface SystemUserAccount {
  id: string;
  username: string; // unique login username (e.g. 'admin', 'BG-000101', 'supervisor.assosa')
  password: string; // login password
  tempPassword?: string; // visible temporary password for initial handover
  role: Role; // 'hr_admin' | 'management' | 'payroll_officer' | 'supervisor' | 'member'
  policeId?: string; // set when linked to a police officer
  fullName: string;
  fullNameEn?: string;
  department?: DepartmentName;
  station?: StationLocation;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdDate: string;
  createdBy: string;
  lastLogin?: string;
}

export type ApplicationType =
  | 'ዝውውር (Transfer)'
  | 'የእረፍት ፈቃድ (Leave)'
  | 'የማዕረግ እድገት (Promotion)'
  | 'ሥልጠና (Training)'
  | 'ጥቅማ ጥቅም (Benefits)'
  | 'የመረጃ ማስተካከያ (Info Correction)'
  | 'የአገልግሎት ማስረጃ (Certificate Request)'
  | 'የመረጃ ማስተካከያ ቅሬታ (Profile Info Discrepancy)'
  | 'የማህደር መረጃ ቅሬታ (Profile Info Discrepancy)'
  | 'የደመወዝ ወይም አበል ቅሬታ (Salary & Allowance Complaint)'
  | 'የደመወዝና አበል ቅሬታ (Salary & Allowance Complaint)'
  | 'የማዕረግ እድገት አቤቱታ (Promotion Appeal)'
  | 'የማዕረግ እድገት ይግባኝ (Promotion Appeal)'
  | 'የዲሲፕሊን ውሳኔ ይግባኝ (Disciplinary Appeal)'
  | 'አጠቃላይ ቅሬታና አቤቱታ (General Grievance)'
  | 'ሌላ የHR ጥያቄ (Other HR Request)';

export type ApplicationStatus =
  | 'submitted' // ገቢ ሆኗል
  | 'supervisor_review' // በኃላፊ ምርመራ ላይ
  | 'hr_review' // በHR ባለሙያ ምርመራ ላይ
  | 'approved' // ጸድቋል
  | 'rejected'; // ውድቅ ተደርጓል

export interface OnlineApplication {
  id: string;
  applicationNo: string; // e.g. APP-2026-00125
  policeId: string;
  memberName: string;
  memberRank: PoliceRank;
  memberDepartment: DepartmentName;
  type: ApplicationType;
  title: string;
  description: string;
  submittedDate: string;
  status: ApplicationStatus;
  targetDetails?: {
    requestedDepartment?: DepartmentName;
    requestedStation?: StationLocation;
    leaveStartDate?: string;
    leaveEndDate?: string;
    leaveDays?: number;
    correctionField?: string;
    correctionNewValue?: string;
  };
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  supervisorReview?: {
    reviewedBy: string;
    date: string;
    decision: 'passed_to_hr' | 'rejected';
    comment: string;
  };
  hrReview?: {
    reviewedBy: string;
    date: string;
    decision: 'approved' | 'rejected';
    comment: string;
    effectiveDate?: string;
  };
  workflowHistory: Array<{
    step: string;
    actor: string;
    date: string;
    status: string;
    note?: string;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'application' | 'salary' | 'transfer' | 'rank' | 'training' | 'alert' | 'system';
  targetPoliceId?: string; // If null, general institutional alert
  linkTab?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  actorName?: string;
  actorRole?: string;
  action: string;
  targetPoliceId: string;
  targetMemberName: string;
  category:
    | 'rank'
    | 'salary'
    | 'transfer'
    | 'training'
    | 'performance'
    | 'leave'
    | 'document'
    | 'separation'
    | 'application'
    | 'id_integration';
  previousValue?: string;
  oldValue?: string;
  newValue?: string;
  approvalReference?: string;
  ipAddress?: string;
}

// ----------------- Payroll & Salary Configuration Types ----------------- //

export interface TaxBracket {
  id: string;
  minIncome: number;
  maxIncome: number | null; // null represents infinity / top bracket
  rate: number; // e.g. 0.10 for 10%
  deduction: number; // progressive offset constant in ETB
  label: string; // e.g. "601 – 1,650 ብር (10%)"
}

export interface PayrollDeductionConfig {
  id: string;
  name: string; // e.g. "የጡረታ መዋጮ", "የፖሊስ ክሬዲት ማህበር", "የቀይ መስቀል ማህበር", "የጤና መድህን"
  nameEn: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage rate (e.g. 0.07) or fixed amount in ETB
  isStatutory: boolean; // legal deduction that cannot be removed
  category: 'pension' | 'tax' | 'credit_union' | 'health_fund' | 'charity' | 'custom';
  appliesTo: 'base_salary' | 'gross_salary';
  isActive: boolean;
  description?: string;
}

export interface PayrollGlobalConfig {
  id: string;
  useStatutoryTaxBrackets: boolean;
  pensionEmployeeRate: number; // e.g. 0.07 (7%)
  pensionEmployerRate: number; // e.g. 0.11 (11%)
  taxBrackets: TaxBracket[];
  standardDeductions: PayrollDeductionConfig[];
  defaultDutyAllowance: number;
  defaultHazardAllowance: number;
  updatedAt: string;
  updatedBy: string;
}

export interface RankSalaryGradeScale {
  grade: number; // 1 to 10
  rank: PoliceRank;
  rankEn: string;
  steps: number[]; // 9 salary steps in ETB
  notes?: string;
}

export interface MemberPayrollCustomization {
  policeId: string;
  customBaseSalary?: number;
  salaryGrade?: number;
  salaryStep?: number;
  monthlyAllowances?: {
    duty?: number;
    field?: number;
    housing?: number;
    transport?: number;
    hazard?: number;
  };
  additionalAllowances?: Array<{ id: string; name: string; amount: number }>;
  creditAssociationDeduction?: number; // fixed amount in ETB
  healthInsuranceDeduction?: number; // fixed amount in ETB
  redCrossDeduction?: number; // fixed amount in ETB
  courtOrDisciplinaryPenalty?: number; // fixed amount in ETB
  customDeductions?: Array<{ id: string; name: string; amount: number; reason: string }>;
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CalculatedOfficerPayroll {
  policeId: string;
  fullName: string;
  rank: PoliceRank;
  department: DepartmentName;
  grade: number;
  step: number;
  baseSalary: number;
  allowances: {
    duty: number;
    field: number;
    housing: number;
    transport: number;
    hazard: number;
    additional: Array<{ id: string; name: string; amount: number }>;
    totalAllowances: number;
  };
  grossSalary: number;
  deductions: {
    pensionEmployee: number;
    pensionEmployer: number;
    incomeTax: number;
    creditAssociation: number;
    healthInsurance: number;
    redCross: number;
    courtPenalty: number;
    customItems: Array<{ id: string; name: string; amount: number; reason: string }>;
    totalDeductions: number;
  };
  netPay: number;
}
