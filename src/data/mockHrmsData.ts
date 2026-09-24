import { MemberProfile, PoliceIdIdentity, OnlineApplication, AuditLogItem, NotificationItem, SystemUserAccount } from '../types/hrms';

// Master Salary Scales for Police & Public Security (in ETB)
// Grade 1 (Constable) to Grade 10 (Commissioner) with Step increments (1 - 9)
export const SALARY_SCALE_MATRIX: Record<number, number[]> = {
  1: [6850, 7150, 7470, 7800, 8150, 8520, 8900, 9300, 9720], // Constable (ኮንስታብል)
  2: [7900, 8250, 8620, 9000, 9400, 9820, 10260, 10720, 11200], // Assistant Sergeant (ረዳት ሳጅን)
  3: [9100, 9510, 9940, 10380, 10850, 11340, 11850, 12380, 12940], // Deputy Sergeant (ምክትል ሳጅን)
  4: [10500, 10970, 11460, 11980, 12520, 13080, 13670, 14280, 14920], // Sergeant (ሳጅን)
  5: [12100, 12640, 13210, 13800, 14420, 15070, 15750, 16460, 17200], // Chief Sergeant (ዋና ሳጅን)
  6: [14200, 14840, 15510, 16210, 16940, 17700, 18500, 19330, 20200], // Assistant Inspector (ረዳት ኢንስፔክተር)
  7: [16800, 17560, 18350, 19180, 20040, 20940, 21880, 22860, 23890], // Deputy Inspector (ምክትል ኢንስፔክተር)
  8: [19900, 20790, 21730, 22710, 23730, 24800, 25920, 27080, 28300], // Chief Inspector (ዋና ኢንስፔክተር)
  9: [24200, 25290, 26430, 27620, 28860, 30160, 31520, 32940, 34420], // Commander (ኮማንደር)
  10: [30500, 31870, 33300, 34800, 36370, 38010, 39720, 41510, 43380], // Assistant / Deputy Commissioner (ረዳት/ምክትል ኮሚሽነር)
};

// Simulating the Independent Existing Police ID System Database
// The HRMS queries this system via API and links or syncs member identity
export const EXTERNAL_POLICE_ID_SYSTEM_DATABASE: PoliceIdIdentity[] = [
  {
    policeId: 'BG-000101',
    fullName: 'አሸናፊ ታደሰ ባሳዝነዉ',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1979-04-12',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2019-01-15',
    bloodGroup: 'O+',
    emergencyContact: { name: 'ወ/ሮ ጥሩነሽ አለሙ', phone: '0911342511', relationship: 'ባለቤት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'አሶሳ ከተማ', kebele: 'ቀበሌ 03' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000102',
    fullName: 'ስንታየሁ ደረጀ አበበ',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1984-08-23',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2018-09-10',
    bloodGroup: 'A+',
    emergencyContact: { name: 'አቶ ደረጀ አበበ', phone: '0912445566', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'መተከል', wereda: 'ማንዱራ', kebele: 'ቀበሌ 01' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000103',
    fullName: 'ትርሲት መኮንን ገብሬ',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    gender: 'ሴት',
    dateOfBirth: '1989-11-05',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2020-03-12',
    bloodGroup: 'B+',
    emergencyContact: { name: 'ወ/ሮ አበበች ካሳ', phone: '0923556677', relationship: 'እናት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'ባምባሲ', kebele: 'ቀበሌ 02' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000104',
    fullName: 'አብዱራህማን ዑመር ኑሪ',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1975-02-18',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2015-06-20',
    bloodGroup: 'AB+',
    emergencyContact: { name: 'ፋጢማ ዑመር', phone: '0915667788', relationship: 'እህት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'ካማሺ', wereda: 'ካማሺ ከተማ', kebele: 'ቀበሌ 01' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000105',
    fullName: 'ሃና ኃይሉ ገሰሰ',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    gender: 'ሴት',
    dateOfBirth: '1993-06-30',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2021-08-14',
    bloodGroup: 'O+',
    emergencyContact: { name: 'ኃይሉ ገሰሰ', phone: '0918776655', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'መተከል', wereda: 'ፓዌ', kebele: 'ቀበሌ 04' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000106',
    fullName: 'ተስፋዬ ገመቹ ኦልጂራ',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1987-12-14',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2017-04-18',
    bloodGroup: 'A-',
    emergencyContact: { name: 'ጫልቱ ገመቹ', phone: '0911889900', relationship: 'እህት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'ሆሞሻ', kebele: 'ቀበሌ 01' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000107',
    fullName: 'ብርሃኑ ንጉሴ አሰፋ',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1966-03-09',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2012-01-20',
    bloodGroup: 'O+',
    emergencyContact: { name: 'አልማዝ አሰፋ', phone: '0912112233', relationship: 'ባለቤት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'አሶሳ ከተማ', kebele: 'ቀበሌ 02' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000108',
    fullName: 'ሙሉቀን ሰለሞን ተሾመ',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1981-05-19',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2016-11-25',
    bloodGroup: 'B+',
    emergencyContact: { name: 'ሰለሞን ተሾመ', phone: '0913998877', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'መተከል', wereda: 'ጉባ', kebele: 'ቀበሌ 01' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000109',
    fullName: 'ራሔል ብርሃኑ ወልደማርያም',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
    gender: 'ሴት',
    dateOfBirth: '1995-09-17',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2023-01-10',
    bloodGroup: 'A+',
    emergencyContact: { name: 'ብርሃኑ ወልደማርያም', phone: '0929112244', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'አሶሳ ከተማ', kebele: 'ቀበሌ 01' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000110',
    fullName: 'ጌታቸው ወርቁ አየለ',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1963-07-22',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2010-05-15',
    bloodGroup: 'O+',
    emergencyContact: { name: 'ታደለች ወርቁ', phone: '0911003322', relationship: 'እህት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'አሶሳ ከተማ', kebele: 'ቀበሌ 04' },
    idSystemStatus: 'active',
  },
  // UNLINKED IDs: Available in the ID System to test the integration workflow!
  {
    policeId: 'BG-000125',
    fullName: 'ዳዊት ኃይለሚካኤል ዘውዱ',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1996-03-14',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2026-02-10',
    bloodGroup: 'O+',
    emergencyContact: { name: 'ዘውዱ ኃይለሚካኤል', phone: '0944112233', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'መተከል', wereda: 'ዳንጉር', kebele: 'ቀበሌ 02' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000126',
    fullName: 'ሰላማዊት ከበደ ተፈራ',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    gender: 'ሴት',
    dateOfBirth: '1998-10-11',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2026-03-01',
    bloodGroup: 'B+',
    emergencyContact: { name: 'ከበደ ተፈራ', phone: '0933221100', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'አሶሳ', wereda: 'ኩርሙክ', kebele: 'ቀበሌ 01' },
    idSystemStatus: 'active',
  },
  {
    policeId: 'BG-000127',
    fullName: 'ኤልያስ ተክሌ መኮንን',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    gender: 'ወንድ',
    dateOfBirth: '1994-01-25',
    nationality: 'ኢትዮጵያዊ',
    issueDate: '2026-01-20',
    bloodGroup: 'A+',
    emergencyContact: { name: 'መኮንን ተክሌ', phone: '0977889900', relationship: 'አባት' },
    address: { region: 'ቤኒሻንጉል ጉሙዝ', zone: 'ካማሺ', wereda: 'ካማሺ ከተማ', kebele: 'ቀበሌ 03' },
    idSystemStatus: 'active',
  }
];

export const INITIAL_MEMBERS: MemberProfile[] = [
  {
    policeId: 'BG-000101',
    badgeNumber: 'POL-0101',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[0],
    currentRank: 'ኮማንደር',
    currentDepartment: 'ወንጀል ምርመራ መምሪያ',
    currentStation: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    position: 'የወንጀል ምርመራ ዋና መምሪያ ኃላፊ',
    employmentDate: '2005-09-12',
    employmentType: 'ቋሚ (Permanent)',
    status: 'active',
    salaryGrade: 9,
    salaryStep: 4,
    baseSalary: SALARY_SCALE_MATRIX[9][3],
    monthlyAllowances: { duty: 3500, field: 2000, housing: 4000, transport: 1500, hazard: 1800 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.18,
    leaveBalance: { annualTotal: 30, annualUsed: 10, annualRemaining: 20, sickUsed: 2, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-1', rank: 'ኮንስታብል', effectiveDate: '2005-09-12', orderNumber: 'ORD/2005/012', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-2', rank: 'ሳጅን', effectiveDate: '2009-02-15', orderNumber: 'ORD/2009/045', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-3', rank: 'ዋና ኢንስፔክተር', effectiveDate: '2016-07-20', orderNumber: 'ORD/2016/112', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-4', rank: 'ኮማንደር', effectiveDate: '2022-01-10', orderNumber: 'ORD/2022/008', approvedBy: 'የክልሉ ፕሬዝዳንት ጽ/ቤት' }
    ],
    transferHistory: [
      {
        id: 'th-1',
        fromDepartment: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
        toDepartment: 'ወንጀል ምርመራ መምሪያ',
        fromStation: 'መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)',
        toStation: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
        reason: 'በስራ ብቃትና በአመራርነት ምደባ መሰረት',
        requestDate: '2021-11-05',
        approvalDate: '2021-12-15',
        effectiveDate: '2022-01-01',
        approvingOfficer: 'ምክትል ኮሚሽነር መንግስቱ',
        orderRef: 'TRF/2021/887'
      }
    ],
    trainingHistory: [
      { id: 'tr-1', title: 'ከፍተኛ የወንጀል ምርመራና ፎረንሲክ ሳይንስ', trainingType: 'የወንጀል ምርመራ', institution: 'የኢትዮጵያ ፖሊስ ዩኒቨርሲቲ', startDate: '2018-02-01', endDate: '2018-08-30', status: 'የተጠናቀቀ', gradeOrScore: 'እጅግ የላቀ (A)' },
      { id: 'tr-2', title: 'የፖሊስ ከፍተኛ አመራርና ስትራቴጂክ አመራር', trainingType: 'የአመራር ጥበብ', institution: 'የመከላከያ አመራር አካዳሚ', startDate: '2021-03-01', endDate: '2021-06-30', status: 'የተጠናቀቀ', gradeOrScore: 'ከፍተኛ (B+)' }
    ],
    performanceHistory: [
      { id: 'pf-1', year: 2025, evaluationPeriod: '2017 ዓ.ም ዓመታዊ ምዘና', score: 94, rating: 'እጅግ የላቀ (90-100)', supervisorName: 'ረዳት ኮሚሽነር ጀማል', supervisorRank: 'ረዳት ኮሚሽነር', strength: 'የተወሳሰቡ የወንጀል መዝገቦችን በብቃት መምራትና ቡድንን ማስተባበር', improvementArea: 'የዲጂታል ቴክኖሎጂ አጠቃቀምን ማጠናከር', finalDecision: 'ለማበረታቻ ተመርጧል', date: '2025-07-15' }
    ],
    leaveHistory: [
      { id: 'lh-1', leaveType: 'ዓመታዊ እረፍት', startDate: '2025-08-01', endDate: '2025-08-10', durationDays: 10, reason: 'ዓመታዊ ፈቃድ', status: 'የተጠናቀቀ', approvedBy: 'ኮሚሽነር ጽ/ቤት', approvedDate: '2025-07-28' }
    ],
    documents: [
      { id: 'doc-1', title: 'የኮማንደርነት ማዕረግ ሹመት ደብዳቤ', documentType: 'የPromotion ደብዳቤ', referenceNumber: 'BG/POL/PRO/2022/08', documentDate: '2022-01-10', fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', fileType: 'image', fileSizeText: '1.4 MB', uploadedBy: 'HR-Admin-001', uploadedAt: '2022-01-12' },
      { id: 'doc-2', title: 'የፖሊስ ዩኒቨርሲቲ ዲፕሎማ ሰነድ', documentType: 'የስልጠና ማስረጃ', referenceNumber: 'EPU/CERT/2018/441', documentDate: '2018-09-01', fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', fileType: 'image', fileSizeText: '2.1 MB', uploadedBy: 'HR-Officer-02', uploadedAt: '2018-09-15' }
    ],
    benefits: [
      { id: 'b-1', title: 'የቤት አበል', type: 'housing', monthlyAmount: 4000, startDate: '2022-01-01', status: 'active', remarks: 'ለከፍተኛ አመራር የተፈቀደ' },
      { id: 'b-2', title: 'የስራ ኃላፊነት አበል', type: 'duty', monthlyAmount: 3500, startDate: '2022-01-01', status: 'active' },
      { id: 'b-3', title: 'የህክምና ሙሉ ሽፋን', type: 'medical', monthlyAmount: 0, startDate: '2005-09-12', status: 'active' }
    ],
    disciplinaryRecords: [],
    awardsAndHonors: [
      { id: 'aw-1', title: 'የሰላምና ደህንነት የላቀ አገልግሎት ሜዳሊያ', date: '2023-04-20', awardedBy: 'የቤኒሻንጉል ጉሙዝ ክልል መንግስት', reason: 'በመተከል ዞን የህግ የበላይነት በማረጋገጥ ረገድ ላበረከተው አስተዋጽኦ', medalOrCertRef: 'MED/2023/12' }
    ],
    userAccount: { username: 'ashenafi.t', isActive: true, createdDate: '2022-01-15', lastLogin: '2026-09-22 14:30' }
  },
  {
    policeId: 'BG-000102',
    badgeNumber: 'POL-0102',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[1],
    currentRank: 'ዋና ኢንስፔክተር',
    currentDepartment: 'ልዩ ፈጣን ኃይል መምሪያ',
    currentStation: 'መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)',
    position: 'የልዩ ፈጣን ኃይል ሻለቃ አዛዥ',
    employmentDate: '2010-04-01',
    employmentType: 'ቋሚ (Permanent)',
    status: 'active',
    salaryGrade: 8,
    salaryStep: 3,
    baseSalary: SALARY_SCALE_MATRIX[8][2],
    monthlyAllowances: { duty: 2800, field: 3500, housing: 2500, transport: 1000, hazard: 3000 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.15,
    leaveBalance: { annualTotal: 30, annualUsed: 8, annualRemaining: 22, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-102-1', rank: 'ኮንስታብል', effectiveDate: '2010-04-01', orderNumber: 'ORD/2010/119', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-102-2', rank: 'ሳጅን', effectiveDate: '2014-06-11', orderNumber: 'ORD/2014/231', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-102-3', rank: 'ዋና ኢንስፔክተር', effectiveDate: '2021-08-15', orderNumber: 'ORD/2021/094', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [
      { id: 'tr-102-1', title: 'ልዩ የኮማንዶና ፈጣን ጥቃት መከላከል ስልጠና', trainingType: 'ልዩ ዘመቻ', institution: 'የፌዴራል ፖሊስ ማሰልጠኛ ኮሌጅ', startDate: '2015-01-10', endDate: '2015-07-20', status: 'የተጠናቀቀ', gradeOrScore: 'እጅግ የላቀ (A)' }
    ],
    performanceHistory: [
      { id: 'pf-102-1', year: 2025, evaluationPeriod: '2017 ዓ.ም ዓመታዊ ምዘና', score: 91, rating: 'እጅግ የላቀ (90-100)', supervisorName: 'ኮማንደር አሸናፊ', supervisorRank: 'ኮማንደር', strength: 'የስራ ተነሳሽነትና በድንገተኛ ግዳጆች ላይ ፈጣን ውሳኔ ሰጪነት', improvementArea: 'የሰነድ አያያዝን ማሻሻል', finalDecision: 'ማበረታቻ ተሰጥቷል', date: '2025-07-20' }
    ],
    leaveHistory: [],
    documents: [],
    benefits: [
      { id: 'b-102-1', title: 'የስጋት/Hazard አበል', type: 'hazard', monthlyAmount: 3000, startDate: '2021-08-15', status: 'active' }
    ],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'sintayehu.d', isActive: true, createdDate: '2021-09-01' }
  },
  {
    policeId: 'BG-000103',
    badgeNumber: 'POL-0103',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[2],
    currentRank: 'ዋና ሳጅን',
    currentDepartment: 'ትራፊክ ደህንነትና ቁጥጥር መምሪያ',
    currentStation: 'አሶሳ ከተማ ፖሊስ መምሪያ',
    position: 'የትራፊክ አደጋ ምርመራና ቁጥጥር ኃላፊ',
    employmentDate: '2014-02-10',
    employmentType: 'ቋሚ (Permanent)',
    status: 'active',
    salaryGrade: 5,
    salaryStep: 4,
    baseSalary: SALARY_SCALE_MATRIX[5][3],
    monthlyAllowances: { duty: 1500, field: 1000, housing: 1800, transport: 800, hazard: 1200 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.12,
    leaveBalance: { annualTotal: 30, annualUsed: 14, annualRemaining: 16, sickUsed: 4, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-103-1', rank: 'ኮንስታብል', effectiveDate: '2014-02-10', orderNumber: 'ORD/2014/099', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-103-2', rank: 'ዋና ሳጅን', effectiveDate: '2022-04-12', orderNumber: 'ORD/2022/104', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [
      { id: 'tr-103-1', title: 'የመንገድ ደህንነትና የትራፊክ አደጋ ቴክኒካል ምርመራ', trainingType: 'የትራፊክ ቁጥጥር', institution: 'አሶሳ ፖሊስ ማሰልጠኛ', startDate: '2019-01-05', endDate: '2019-04-10', status: 'የተጠናቀቀ', gradeOrScore: 'A' }
    ],
    performanceHistory: [
      { id: 'pf-103-1', year: 2025, evaluationPeriod: '2017 ዓ.ም ዓመታዊ ምዘና', score: 88, rating: 'ከፍተኛ (80-89)', supervisorName: 'ኢንስፔክተር በቀለ', supervisorRank: 'ኢንስፔክተር', strength: 'ታታሪና ህዝብን በቅንነት የምታገለግል', improvementArea: 'የኮምፒውተር መረጃ አያያዝ', finalDecision: 'ጸድቋል', date: '2025-07-18' }
    ],
    leaveHistory: [],
    documents: [],
    benefits: [],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'tirsit.m', isActive: true, createdDate: '2022-05-01' }
  },
  {
    policeId: 'BG-000104',
    badgeNumber: 'POL-0104',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[3],
    currentRank: 'ምክትል ኢንስፔክተር',
    currentDepartment: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
    currentStation: 'ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)',
    position: 'የዞን ወንጀል መከላከል አስተባባሪ',
    employmentDate: '2008-01-15',
    employmentType: 'ቋሚ (Permanent)',
    status: 'on_leave',
    salaryGrade: 7,
    salaryStep: 5,
    baseSalary: SALARY_SCALE_MATRIX[7][4],
    monthlyAllowances: { duty: 2200, field: 2000, housing: 2200, transport: 1000, hazard: 2000 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.15,
    leaveBalance: { annualTotal: 30, annualUsed: 25, annualRemaining: 5, sickUsed: 1, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-104-1', rank: 'ኮንስታብል', effectiveDate: '2008-01-15', orderNumber: 'ORD/2008/044', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-104-2', rank: 'ምክትል ኢንስፔክተር', effectiveDate: '2020-09-18', orderNumber: 'ORD/2020/190', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [],
    performanceHistory: [],
    leaveHistory: [
      { id: 'lh-104-1', leaveType: 'ዓመታዊ እረፍት', startDate: '2026-09-15', endDate: '2026-10-05', durationDays: 20, reason: 'የቤተሰብ ጉዳይ', status: 'በሂደት ላይ', approvedBy: 'ኮማንደር ከበደ', approvedDate: '2026-09-10' }
    ],
    documents: [],
    benefits: [],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'abdurahman.o', isActive: true, createdDate: '2020-10-01' }
  },
  {
    policeId: 'BG-000105',
    badgeNumber: 'POL-0105',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[4],
    currentRank: 'ረዳት ሳጅን',
    currentDepartment: 'የሰው ኃይል አስተዳደርና ልማት መምሪያ',
    currentStation: 'ፓዌ ወረዳ ፖሊስ ጣቢያ',
    position: 'የሰው ኃይል ኦፊሰር',
    employmentDate: '2019-11-01',
    employmentType: 'ቋሚ (Permanent)',
    status: 'active',
    salaryGrade: 2,
    salaryStep: 3,
    baseSalary: SALARY_SCALE_MATRIX[2][2],
    monthlyAllowances: { duty: 800, field: 500, housing: 1200, transport: 600, hazard: 0 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.08,
    leaveBalance: { annualTotal: 30, annualUsed: 6, annualRemaining: 24, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-105-1', rank: 'ኮንስታብል', effectiveDate: '2019-11-01', orderNumber: 'ORD/2019/332', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-105-2', rank: 'ረዳት ሳጅን', effectiveDate: '2023-06-20', orderNumber: 'ORD/2023/112', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [
      { id: 'tr-105-1', title: 'ዲጂታል የHR መረጃ አያያዝና ሰነድ አስተዳደር', trainingType: 'የአመራር ጥበብ', institution: 'የክልሉ ሲቪል ሰርቪስ ቢሮ', startDate: '2024-02-10', endDate: '2024-03-10', status: 'የተጠናቀቀ', gradeOrScore: 'A' }
    ],
    performanceHistory: [
      { id: 'pf-105-1', year: 2025, evaluationPeriod: '2017 ዓ.ም ዓመታዊ ምዘና', score: 87, rating: 'ከፍተኛ (80-89)', supervisorName: 'ሻምበል ታደሰ', supervisorRank: 'ዋና ኢንስፔክተር', strength: 'ጥሩ የስነ-ምግባርና የሰነድ አያያዝ ክህሎት', improvementArea: 'የአመራር ኃላፊነት መውሰድ', finalDecision: 'ጸድቋል', date: '2025-07-22' }
    ],
    leaveHistory: [],
    documents: [],
    benefits: [],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'hana.h', isActive: true, createdDate: '2023-07-01' }
  },
  {
    policeId: 'BG-000106',
    badgeNumber: 'POL-0106',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[5],
    currentRank: 'ሳጅን',
    currentDepartment: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
    currentStation: 'ሆሞሻ ወረዳ ፖሊስ ጣቢያ',
    position: 'የጥበቃና ፓትሮል ቡድን መሪ',
    employmentDate: '2015-08-20',
    employmentType: 'ቋሚ (Permanent)',
    status: 'transferred_pending',
    salaryGrade: 4,
    salaryStep: 4,
    baseSalary: SALARY_SCALE_MATRIX[4][3],
    monthlyAllowances: { duty: 1200, field: 1500, housing: 1500, transport: 700, hazard: 1500 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.10,
    leaveBalance: { annualTotal: 30, annualUsed: 12, annualRemaining: 18, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-106-1', rank: 'ኮንስታብል', effectiveDate: '2015-08-20', orderNumber: 'ORD/2015/054', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-106-2', rank: 'ሳጅን', effectiveDate: '2021-03-15', orderNumber: 'ORD/2021/087', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [],
    performanceHistory: [],
    leaveHistory: [],
    documents: [],
    benefits: [],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'tesfaye.g', isActive: true, createdDate: '2021-04-01' }
  },
  {
    // RETIRED OFFICER EXAMPLE (Demonstrating Separation Dossier)
    policeId: 'BG-000107',
    badgeNumber: 'POL-0107',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[6],
    currentRank: 'ኮማንደር',
    currentDepartment: 'የኮሚሽኑ ዋና አዛዥ ጽ/ቤት',
    currentStation: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    position: 'ቀድሞ የሎጂስቲክስና ንብረት መምሪያ ኃላፊ',
    employmentDate: '1989-02-01',
    employmentType: 'ቋሚ (Permanent)',
    status: 'retired',
    salaryGrade: 9,
    salaryStep: 9,
    baseSalary: SALARY_SCALE_MATRIX[9][8],
    monthlyAllowances: { duty: 0, field: 0, housing: 0, transport: 0, hazard: 0 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0,
    leaveBalance: { annualTotal: 30, annualUsed: 30, annualRemaining: 0, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-107-1', rank: 'ኮንስታብል', effectiveDate: '1989-02-01', orderNumber: 'ORD/1989/001', approvedBy: 'የፖሊስ አዛዥ' },
      { id: 'rh-107-2', rank: 'ኮማንደር', effectiveDate: '2018-05-20', orderNumber: 'ORD/2018/142', approvedBy: 'የክልሉ መንግስት' }
    ],
    transferHistory: [],
    trainingHistory: [],
    performanceHistory: [],
    leaveHistory: [],
    documents: [
      { id: 'doc-107-1', title: 'የጡረታ መሸኛና ማረጋገጫ ደብዳቤ', documentType: 'የጡረታ ሰነድ', referenceNumber: 'BG/POL/RET/2026/01', documentDate: '2026-03-01', fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80', fileType: 'image', fileSizeText: '1.8 MB', uploadedBy: 'HR-Admin-001', uploadedAt: '2026-03-02' }
    ],
    benefits: [],
    disciplinaryRecords: [],
    awardsAndHonors: [
      { id: 'aw-107-1', title: 'የ35 ዓመት ታማኝ አገልጋይነት የክብር ሜዳሊያ', date: '2024-09-11', awardedBy: 'የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', reason: 'ለረጅም ዓመታት በታማኝነትና በቅንነት ላበረከተው የፖሊስ አገልግሎት', medalOrCertRef: 'HON/2024/09' }
    ],
    separation: {
      id: 'sep-107',
      separationType: 'በጡረታ የተሰናበተ (Retirement)',
      separationDate: '2026-03-01',
      totalServiceYears: 37,
      lastRank: 'ኮማንደር',
      lastSalaryGrade: 9,
      lastSalaryStep: 9,
      reason: 'የጡረታ እድሜ በመድረሱ (60 ዓመት) በክብር የተሰናበተ',
      decisionRef: 'DEC/RET/2026/014',
      decisionDocumentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      approvedBy: 'ኮሚሽነር አብዱልከሪም',
      approvalDate: '2026-02-25',
      pensionEligible: true,
      pensionBookRef: 'PEN-BG-2026-8891',
      clearanceCompleted: true,
      auditNote: 'የንብረትና የፋይናንስ ክሊራንስ ተጠናቆ የጡረታ ሰነዱ ለመንግስት ሰራተኞች ማህበራዊ ዋስትና ኤጀንሲ ተልኳል'
    },
    userAccount: { username: 'birhanu.n', isActive: false, createdDate: '2020-01-01' }
  },
  {
    policeId: 'BG-000108',
    badgeNumber: 'POL-0108',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[7],
    currentRank: 'ዋና ሳጅን',
    currentDepartment: 'ልዩ ፈጣን ኃይል መምሪያ',
    currentStation: 'ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)',
    position: 'የታላቁ የህዳሴ ግድብ አካባቢ ጥበቃ ምድብ አዛዥ',
    employmentDate: '2012-03-15',
    employmentType: 'ቋሚ (Permanent)',
    status: 'active',
    salaryGrade: 5,
    salaryStep: 6,
    baseSalary: SALARY_SCALE_MATRIX[5][5],
    monthlyAllowances: { duty: 2500, field: 4000, housing: 2000, transport: 1000, hazard: 3500 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.12,
    leaveBalance: { annualTotal: 30, annualUsed: 5, annualRemaining: 25, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-108-1', rank: 'ኮንስታብል', effectiveDate: '2012-03-15', orderNumber: 'ORD/2012/032', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-108-2', rank: 'ዋና ሳጅን', effectiveDate: '2023-01-20', orderNumber: 'ORD/2023/044', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [],
    performanceHistory: [],
    leaveHistory: [],
    documents: [],
    benefits: [
      { id: 'b-108-1', title: 'የግድብ አካባቢ ልዩ የሜዳ አበል', type: 'field', monthlyAmount: 4000, startDate: '2023-02-01', status: 'active' }
    ],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'muluken.s', isActive: true, createdDate: '2023-02-01' }
  },
  {
    policeId: 'BG-000109',
    badgeNumber: 'POL-0109',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[8],
    currentRank: 'ኮንስታብል',
    currentDepartment: 'ትራፊክ ደህንነትና ቁጥጥር መምሪያ',
    currentStation: 'አሶሳ ከተማ ፖሊስ መምሪያ',
    position: 'የትራፊክ ፍሰት ቁጥጥር ኦፊሰር',
    employmentDate: '2023-01-10',
    employmentType: 'ቋሚ (Permanent)',
    status: 'active',
    salaryGrade: 1,
    salaryStep: 2,
    baseSalary: SALARY_SCALE_MATRIX[1][1],
    monthlyAllowances: { duty: 600, field: 400, housing: 1000, transport: 500, hazard: 800 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0.05,
    leaveBalance: { annualTotal: 30, annualUsed: 2, annualRemaining: 28, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-109-1', rank: 'ኮንስታብል', effectiveDate: '2023-01-10', orderNumber: 'ORD/2023/009', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [],
    performanceHistory: [],
    leaveHistory: [],
    documents: [],
    benefits: [],
    disciplinaryRecords: [],
    awardsAndHonors: [],
    userAccount: { username: 'rahel.b', isActive: true, createdDate: '2023-02-15' }
  },
  {
    // DISMISSED OFFICER EXAMPLE (Demonstrating Disciplinary & Dismissal Separation)
    policeId: 'BG-000110',
    badgeNumber: 'POL-0110',
    identity: EXTERNAL_POLICE_ID_SYSTEM_DATABASE[9],
    currentRank: 'ሳጅን',
    currentDepartment: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
    currentStation: 'አሶሳ ከተማ ፖሊስ መምሪያ',
    position: 'ቀድሞ የፓትሮል አባል',
    employmentDate: '2011-06-01',
    employmentType: 'ቋሚ (Permanent)',
    status: 'dismissed',
    salaryGrade: 4,
    salaryStep: 5,
    baseSalary: SALARY_SCALE_MATRIX[4][4],
    monthlyAllowances: { duty: 0, field: 0, housing: 0, transport: 0, hazard: 0 },
    pensionDeductionRate: 0.07,
    taxDeductionRate: 0,
    leaveBalance: { annualTotal: 30, annualUsed: 30, annualRemaining: 0, sickUsed: 0, specialUsed: 0 },
    rankHistory: [
      { id: 'rh-110-1', rank: 'ኮንስታብል', effectiveDate: '2011-06-01', orderNumber: 'ORD/2011/088', approvedBy: 'የኮሚሽኑ ኮሚሽነር' },
      { id: 'rh-110-2', rank: 'ሳጅን', effectiveDate: '2017-08-12', orderNumber: 'ORD/2017/140', approvedBy: 'የኮሚሽኑ ኮሚሽነር' }
    ],
    transferHistory: [],
    trainingHistory: [],
    performanceHistory: [],
    leaveHistory: [],
    documents: [
      { id: 'doc-110-1', title: 'የዲሲፕሊን ኮሚቴ ውሳኔና የስንብት ደብዳቤ', documentType: 'የስንብት ደብዳቤ', referenceNumber: 'BG/POL/DISM/2026/03', documentDate: '2026-01-14', fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', fileType: 'image', fileSizeText: '1.2 MB', uploadedBy: 'HR-Admin-001', uploadedAt: '2026-01-15' }
    ],
    benefits: [],
    disciplinaryRecords: [
      { id: 'disc-1', date: '2025-11-20', incident: 'በስራ ሰዓት ያለፈቃድ በተደጋጋሚ መቅረትና የፖሊስ ስነ-ምግባር መጣስ', measureTaken: 'የመጨረሻ ማስጠንቀቂያና ደመወዝ ቅጣት', verdictRef: 'VER/2025/44', status: 'የተዘጋ' },
      { id: 'disc-2', date: '2026-01-05', incident: 'በስራ ቦታ ላይ ከባድ የስነ-ስርዓት ጉድለትና በህገ-ወጥ ድርጊት መሳተፍ', measureTaken: 'ከፖሊስ ሰራዊት በስንብት እንዲሰናበት ውሳኔ ተላልፏል', verdictRef: 'VER/2026/02', status: 'የተዘጋ' }
    ],
    awardsAndHonors: [],
    separation: {
      id: 'sep-110',
      separationType: 'የተባረረ (Dismissal)',
      separationDate: '2026-01-14',
      totalServiceYears: 14,
      lastRank: 'ሳጅን',
      lastSalaryGrade: 4,
      lastSalaryStep: 5,
      reason: 'በከባድ የዲሲፕሊን ጥሰትና የስራ ውል መጣስ ምክንያት በዲሲፕሊን ኮሚቴ ውሳኔ መሰረት የተባረረ',
      decisionRef: 'DEC/DISM/2026/003',
      approvedBy: 'ኮሚሽነር ጽ/ቤት',
      approvalDate: '2026-01-14',
      pensionEligible: false,
      clearanceCompleted: true,
      auditNote: 'የፖሊስ ትጥቅና መታወቂያ ተመላሽ ተደርጎ ፋይሉ ተዘግቷል'
    },
    userAccount: { username: 'getachew.w', isActive: false, createdDate: '2020-01-01' }
  }
];

export const INITIAL_APPLICATIONS: OnlineApplication[] = [
  {
    id: 'app-1',
    applicationNo: 'APP-2026-00125',
    policeId: 'BG-000101',
    memberName: 'አሸናፊ ታደሰ ባሳዝነዉ',
    memberRank: 'ኮማንደር',
    memberDepartment: 'ወንጀል ምርመራ መምሪያ',
    type: 'የእረፍት ፈቃድ (Leave)',
    title: 'የ10 ቀናት ዓመታዊ እረፍት ጥያቄ',
    description: 'የቀረኝን የዓመታዊ እረፍት ፈቃድ በመጠቀም ለቤተሰብ እረፍትና የግል ጉዳይ ከጥቅምት 1 እስከ 10/2026 ፈቃድ እንዲሰጠኝ በአክብሮት እጠይቃለሁ።',
    submittedDate: '2026-09-20',
    status: 'supervisor_review',
    targetDetails: {
      leaveStartDate: '2026-10-01',
      leaveEndDate: '2026-10-10',
      leaveDays: 10
    },
    attachments: [
      { name: 'leave_request_form.pdf', url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&auto=format&fit=crop&q=80', type: 'application/pdf' }
    ],
    workflowHistory: [
      { step: 'ማመልከቻ ገቢ ተደርጓል', actor: 'ኮማንደር አሸናፊ ታደሰ', date: '2026-09-20 09:15', status: 'submitted', note: 'ማመልከቻው በፖርታል በኩል ተልኳል' }
    ]
  },
  {
    id: 'app-2',
    applicationNo: 'APP-2026-00124',
    policeId: 'BG-000103',
    memberName: 'ትርሲት መኮንን ገብሬ',
    memberRank: 'ዋና ሳጅን',
    memberDepartment: 'ትራፊክ ደህንነትና ቁጥጥር መምሪያ',
    type: 'ዝውውር (Transfer)',
    title: 'ከአሶሳ ወደ ባምባሲ ወረዳ ጣቢያ የዝውውር ጥያቄ',
    description: 'ባለቤቴ በባምባሲ ወረዳ በመንግስት ስራ የተመደበች በመሆኗ እና የቤተሰብ መበታተን እንዳይደርስ የዝውውር ማመልከቻዬን አቀርባለሁ።',
    submittedDate: '2026-09-18',
    status: 'hr_review',
    targetDetails: {
      requestedDepartment: 'ትራፊክ ደህንነትና ቁጥጥር መምሪያ',
      requestedStation: 'ባምባሲ ወረዳ ፖሊስ ጣቢያ'
    },
    attachments: [
      { name: 'marriage_cert.jpg', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80', type: 'image/jpeg' },
      { name: 'spouses_employment_letter.pdf', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80', type: 'application/pdf' }
    ],
    supervisorReview: {
      reviewedBy: 'ኢንስፔክተር በቀለ (የመምሪያ ኃላፊ)',
      date: '2026-09-19 11:20',
      decision: 'passed_to_hr',
      comment: 'የቀረበው ምክንያት ተገቢና ህጋዊ ሰነድ ያለው በመሆኑ ወደ HR አስተዳደር እንዲተላለፍ ተስማምቻለሁ።'
    },
    workflowHistory: [
      { step: 'ማመልከቻ ገቢ ተደርጓል', actor: 'ዋና ሳጅን ትርሲት መኮንን', date: '2026-09-18 14:00', status: 'submitted' },
      { step: 'የኃላፊ አስተያየትና ማረጋገጫ', actor: 'ኢንስፔክተር በቀለ', date: '2026-09-19 11:20', status: 'supervisor_review', note: 'ወደ HR የተላለፈ' }
    ]
  },
  {
    id: 'app-3',
    applicationNo: 'APP-2026-00120',
    policeId: 'BG-000105',
    memberName: 'ሃና ኃይሉ ገሰሰ',
    memberRank: 'ረዳት ሳጅን',
    memberDepartment: 'የሰው ኃይል አስተዳደርና ልማት መምሪያ',
    type: 'የማዕረግ እድገት (Promotion)',
    title: 'ወደ ሳጅን ማዕረግ እድገት ማመልከቻ',
    description: 'በረዳት ሳጅንነት ማዕረግ የተሰጠኝን አገልግሎት ዘመን አጠናቅቄ ተጨማሪ የትምህርት ማስረጃና ከፍተኛ የአፈጻጸም ውጤት ስላስመዘገብኩ የማዕረግ እድገት ፈተና እንድፈተን እጠይቃለሁ።',
    submittedDate: '2026-09-10',
    status: 'approved',
    attachments: [
      { name: 'performance_evaluation.pdf', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=80', type: 'application/pdf' }
    ],
    supervisorReview: {
      reviewedBy: 'ሻምበል ታደሰ',
      date: '2026-09-12 10:00',
      decision: 'passed_to_hr',
      comment: 'መስፈርቱን ታሟላለች።'
    },
    hrReview: {
      reviewedBy: 'ኮማንደር የማነ (HR ዳይሬክተር)',
      date: '2026-09-15 16:30',
      decision: 'approved',
      comment: 'የማዕረግ እድገት መስፈርቶችን ስላሟላች ለቀጣዩ የሳጅንነት እርከን ዝግጅት እንድታልፍ ጸድቋል።',
      effectiveDate: '2026-10-01'
    },
    workflowHistory: [
      { step: 'ማመልከቻ ገቢ ተደርጓል', actor: 'ረዳት ሳጅን ሃና ኃይሉ', date: '2026-09-10 08:30', status: 'submitted' },
      { step: 'የኃላፊ ግምገማ', actor: 'ሻምበል ታደሰ', date: '2026-09-12 10:00', status: 'supervisor_review' },
      { step: 'የHR ቦርድ ውሳኔ', actor: 'ኮማንደር የማነ', date: '2026-09-15 16:30', status: 'approved', note: 'በሙሉ ድምፅ ጸድቋል' }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-23 08:15:22',
    user: 'HR-Admin-001',
    role: 'hr_admin',
    action: 'የአባላት ዝውውር መዝገብ ተፈትሾ ጸደቀ',
    targetPoliceId: 'BG-000103',
    targetMemberName: 'ትርሲት መኮንን ገብሬ',
    category: 'transfer',
    previousValue: 'አሶሳ ከተማ ፖሊስ መምሪያ',
    newValue: 'ባምባሲ ወረዳ ፖሊስ ጣቢያ (በግምገማ ላይ)',
    approvalReference: 'TRF/APP/2026/124',
    ipAddress: '192.168.10.15'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-22 14:10:05',
    user: 'Payroll-Officer-01',
    role: 'payroll_officer',
    action: 'የመስከረም 2026 የደመወዝ ክፍያ ማስተካከያ ተመዘገበ',
    targetPoliceId: 'BG-000101',
    targetMemberName: 'አሸናፊ ታደሰ ባሳዝነዉ',
    category: 'salary',
    previousValue: 'Step 3 (26,430 ETB)',
    newValue: 'Step 4 (27,620 ETB)',
    approvalReference: 'SAL/ADJ/2026/09',
    ipAddress: '192.168.10.42'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-20 11:45:18',
    user: 'Police-ID-API-Gateway',
    role: 'hr_admin',
    action: 'ከመታወቂያ ሲስተም ጋር የባዮሜትሪክ ዳታ ስምረት ተከናወነ',
    targetPoliceId: 'BG-000101',
    targetMemberName: 'አሸናፊ ታደሰ ባሳዝነዉ',
    category: 'id_integration',
    previousValue: 'Synced on 2025-10-10',
    newValue: 'Synced on 2026-09-20 (Verified Active)',
    ipAddress: '10.0.4.1'
  },
  {
    id: 'aud-4',
    timestamp: '2026-03-01 16:00:00',
    user: 'HR-Admin-001',
    role: 'hr_admin',
    action: 'የጡረታ ስንብት ዶሴ ጸድቆ ማህደር ተዘጋ',
    targetPoliceId: 'BG-000107',
    targetMemberName: 'ብርሃኑ ንጉሴ አሰፋ',
    category: 'separation',
    previousValue: 'Status: Active Duty',
    newValue: 'Status: Retired (የ37 ዓመት አገልግሎት)',
    approvalReference: 'DEC/RET/2026/014',
    ipAddress: '192.168.10.15'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'የጡረታ ጊዜ ማሳሰቢያ (Upcoming Retirement Alert)',
    message: 'አባል ኮማንደር ብርሃኑ ንጉሴ ህጋዊ የጡረታ እድሜ (60 ዓመት) በመድረሳቸው የስንብትና የጡረታ ሂደቱ ተጠናቋል።',
    date: '2026-09-23 07:30',
    isRead: false,
    type: 'alert',
    linkTab: 'separation'
  },
  {
    id: 'notif-2',
    title: 'አዲስ የዝውውር ማመልከቻ ቀርቧል',
    message: 'ዋና ሳጅን ትርሲት መኮንን (BG-000103) ከአሶሳ ወደ ባምባሲ ወረዳ የዝውውር ጥያቄ አቅርበዋል።',
    date: '2026-09-18 14:05',
    isRead: false,
    type: 'application',
    linkTab: 'applications'
  },
  {
    id: 'notif-3',
    title: 'የመስከረም ወር ደመወዝ ስሌት ተጠናቋል',
    message: 'የመስከረም 2026 (September 2026) የወር ደመወዝ ሰነድ ተዘጋጅቶ ለአባላት በSelf-Service ፖርታል ይፋ ሆኗል።',
    date: '2026-09-20 09:00',
    isRead: true,
    type: 'salary',
    linkTab: 'payroll'
  },
  {
    id: 'notif-4',
    title: 'የማዕረግ እድገት ውሳኔ ማሳወቂያ',
    message: 'ረዳት ሳጅን ሃና ኃይሉ ያቀረበችው የማዕረግ እድገት ጥያቄ በHR ቦርድ ጸድቋል።',
    date: '2026-09-16 11:00',
    isRead: true,
    type: 'rank',
    targetPoliceId: 'BG-000105',
    linkTab: 'applications'
  }
];

export const INITIAL_SYSTEM_USERS: SystemUserAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    password: 'Admin@123',
    role: 'hr_admin',
    fullName: 'ኮሚሽነር አበራ ታደሰ (ዋና የHR አስተዳዳሪ)',
    fullNameEn: 'Commissioner Abera Tadesse (Chief HR Admin)',
    department: 'የሰው ኃይል አስተዳደርና ልማት መምሪያ',
    station: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    isActive: true,
    createdDate: '2020-01-01',
    createdBy: 'System Root'
  },
  {
    id: 'usr-mgmt-1',
    username: 'command.begu',
    password: 'Command@123',
    role: 'management',
    fullName: 'ምክትል ኮሚሽነር ግርማ ደስታ (የኮሚሽኑ ምክትል አዛዥ)',
    fullNameEn: 'Deputy Commissioner Girma Desta',
    department: 'የኮሚሽኑ ዋና አዛዥ ጽ/ቤት',
    station: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    isActive: true,
    createdDate: '2020-01-01',
    createdBy: 'Admin'
  },
  {
    id: 'usr-sup-1',
    username: 'supervisor.assosa',
    password: 'Supervisor@123',
    role: 'supervisor',
    fullName: 'ኮማንደር ከበደ አየለ (የአሶሳ ፖሊስ አዛዥ)',
    fullNameEn: 'Commander Kebede Ayele (Assosa Station Commander)',
    department: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
    station: 'አሶሳ ከተማ ፖሊስ መምሪያ',
    isActive: true,
    createdDate: '2021-03-10',
    createdBy: 'Admin'
  },
  {
    id: 'usr-pay-1',
    username: 'payroll.officer',
    password: 'Payroll@123',
    role: 'payroll_officer',
    fullName: 'አቶ ጥላሁን ማሞ (የደመወዝ ዋና ባለሙያ)',
    fullNameEn: 'Tilahun Mamo (Senior Payroll Officer)',
    department: 'ፋይናንስና በጀት መምሪያ',
    station: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    isActive: true,
    createdDate: '2021-05-15',
    createdBy: 'Admin'
  },
  // Police Member User Accounts (provisioned by Admin via Police ID)
  {
    id: 'usr-mem-101',
    username: 'BG-000101',
    password: 'Police@2026',
    role: 'member',
    policeId: 'BG-000101',
    fullName: 'አሸናፊ ታደሰ ባሳዝነዉ',
    fullNameEn: 'Ashenafi Tadesse Basazinew',
    department: 'ወንጀል ምርመራ መምሪያ',
    station: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    isActive: true,
    createdDate: '2022-01-15',
    createdBy: 'Admin'
  },
  {
    id: 'usr-mem-102',
    username: 'BG-000102',
    password: 'Police@2026',
    role: 'member',
    policeId: 'BG-000102',
    fullName: 'ስንታየሁ ደረጀ አበበ',
    fullNameEn: 'Sintayehu Dereje Abebe',
    department: 'ልዩ ፈጣን ኃይል መምሪያ',
    station: 'መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)',
    isActive: true,
    createdDate: '2022-03-01',
    createdBy: 'Admin'
  },
  {
    id: 'usr-mem-103',
    username: 'BG-000103',
    password: 'Police@2026',
    role: 'member',
    policeId: 'BG-000103',
    fullName: 'ትርሲት መኮንን ገብሬ',
    fullNameEn: 'Tirsit Mekonnen Gebre',
    department: 'ትራፊክ ደህንነትና ቁጥጥር መምሪያ',
    station: 'አሶሳ ከተማ ፖሊስ መምሪያ',
    isActive: true,
    createdDate: '2022-05-01',
    createdBy: 'Admin'
  },
  {
    id: 'usr-mem-104',
    username: 'BG-000104',
    password: 'Police@2026',
    role: 'member',
    policeId: 'BG-000104',
    fullName: 'ሙሉቀን ወርቁ ኃይሌ',
    fullNameEn: 'Muluqen Worku Haile',
    department: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
    station: 'ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)',
    isActive: true,
    createdDate: '2022-06-10',
    createdBy: 'Admin'
  },
  {
    id: 'usr-mem-105',
    username: 'BG-000105',
    password: 'Police@2026',
    role: 'member',
    policeId: 'BG-000105',
    fullName: 'አብዱላሂ ኡመር ሀሰን',
    fullNameEn: 'Abdullahi Umer Hassen',
    department: 'ልዩ ፈጣን ኃይል መምሪያ',
    station: 'ኩርሙክ ድንበር ጣቢያ',
    isActive: true,
    createdDate: '2023-01-20',
    createdBy: 'Admin'
  },
  {
    id: 'usr-mem-106',
    username: 'BG-000106',
    password: 'Police@2026',
    role: 'member',
    policeId: 'BG-000106',
    fullName: 'ራሄል ተስፋዬ በቀለ',
    fullNameEn: 'Rahel Tesfaye Bekele',
    department: 'የሰው ኃይል አስተዳደርና ልማት መምሪያ',
    station: 'አሶሳ ዋና መምሪያ (Assosa HQ)',
    isActive: true,
    createdDate: '2023-02-15',
    createdBy: 'Admin'
  }
];

