import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  MemberProfile,
  PoliceRank,
  DepartmentName,
  StationLocation,
  SeparationType,
  PersonnelDocument
} from '../../types/hrms';
import { SALARY_SCALE_MATRIX } from '../../data/mockHrmsData';
import {
  Shield,
  User,
  Award,
  CreditCard,
  PlaneTakeoff,
  GraduationCap,
  TrendingUp,
  Calendar,
  Gift,
  AlertOctagon,
  LogOut,
  FolderOpen,
  Camera,
  Upload,
  Plus,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Building,
  Printer,
  KeyRound
} from 'lucide-react';

interface MemberPersonnelFileModalProps {
  member: MemberProfile;
  onClose: () => void;
  initialTab?: string;
}

export const MemberPersonnelFileModal: React.FC<MemberPersonnelFileModalProps> = ({
  member,
  onClose,
  initialTab = 'overview'
}) => {
  const {
    currentRole,
    t,
    systemLogo,
    userAccounts,
    provisionMemberCredentials,
    addPromotion,
    executeTransfer,
    assignTraining,
    submitPerformanceEvaluation,
    addLeaveRecord,
    uploadPersonnelDocument,
    processServiceSeparation,
    updateSalaryGradeStep
  } = useHrms();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionModal, setActionModal] = useState<string | null>(null);

  const memberAccount = userAccounts.find(
    u => u.policeId && u.policeId.toUpperCase() === member.policeId.toUpperCase()
  );

  // Forms states
  // 1. Promotion
  const [promoRank, setPromoRank] = useState<PoliceRank>('ሳጅን');
  const [promoOrder, setPromoOrder] = useState(`ORD/PRO/${new Date().getFullYear()}/${Math.floor(Math.random() * 800 + 100)}`);
  const [promoRemarks, setPromoRemarks] = useState('');

  // 2. Transfer
  const [trfDept, setTrfDept] = useState<DepartmentName>('ወንጀል ምርመራ መምሪያ');
  const [trfStation, setTrfStation] = useState<StationLocation>('መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)');
  const [trfReason, setTrfReason] = useState('በተቋሙ የስራ ፍላጎትና የሰው ኃይል ሽግሽግ መሰረት');
  const [trfOrder, setTrfOrder] = useState(`ORD/TRF/${new Date().getFullYear()}/${Math.floor(Math.random() * 800 + 100)}`);

  // 3. Training
  const [trTitle, setTrTitle] = useState('ዘመናዊ የወንጀል መከላከልና የማህበረሰብ ፖሊሲንግ');
  const [trType, setTrType] = useState<any>('የወንጀል ምርመራ');
  const [trInst, setTrInst] = useState('የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሌጅ');
  const [trStart, setTrStart] = useState('2026-10-01');
  const [trEnd, setTrEnd] = useState('2026-12-01');

  // 4. Performance
  const [evalScore, setEvalScore] = useState(88);
  const [evalPeriod, setEvalPeriod] = useState('2018 ዓ.ም - 1ኛ ሩብ ዓመት');
  const [evalStrength, setEvalStrength] = useState('የስራ ዲሲፕሊንና ተልእኮዎችን በሰዓቱ ማጠናቀቅ');
  const [evalImprove, setEvalImprove] = useState('የሪፖርት አቀራረብ ክህሎትን ማሻሻል');

  // 5. Leave
  const [leaveDays, setLeaveDays] = useState(10);
  const [leaveType, setLeaveType] = useState<any>('ዓመታዊ እረፍት');
  const [leaveStart, setLeaveStart] = useState('2026-10-05');
  const [leaveReason, setLeaveReason] = useState('ዓመታዊ ፈቃድ');

  // 6. Salary adjustment
  const [adjGrade, setAdjGrade] = useState(member.salaryGrade);
  const [adjStep, setAdjStep] = useState(Math.min(9, member.salaryStep + 1));
  const [adjReason, setAdjReason] = useState('የዓመታዊ እርከን እድገት (Annual Step Increment)');

  // 7. Separation
  const [sepType, setSepType] = useState<SeparationType>('በጡረታ የተሰናበተ (Retirement)');
  const [sepReason, setSepReason] = useState('የህግ የጡረታ እድሜ በመድረሱ በክብር የተሰናበተ');
  const [sepRef, setSepRef] = useState(`DEC/SEP/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
  const [sepPension, setSepPension] = useState(true);
  const [sepPensionBook, setSepPensionBook] = useState(`PEN-BG-2026-${Math.floor(Math.random() * 9000 + 1000)}`);

  // 8. Document upload
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<any>('ደብዳቤ');
  const [docRef, setDocRef] = useState(`BG/POL/DOC/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
  const [docDate, setDocDate] = useState(new Date().toISOString().substring(0, 10));
  const [docNotes, setDocNotes] = useState('');

  // Calculate gross and net salary
  const allowancesTotal =
    member.monthlyAllowances.duty +
    member.monthlyAllowances.field +
    member.monthlyAllowances.housing +
    member.monthlyAllowances.transport +
    member.monthlyAllowances.hazard;
  const grossSalary = member.baseSalary + allowancesTotal;
  const pensionDeduction = Math.round(member.baseSalary * member.pensionDeductionRate);
  const taxDeduction = Math.round(grossSalary * member.taxDeductionRate);
  const netSalary = grossSalary - pensionDeduction - taxDeduction;

  const tabs = [
    { id: 'overview', label: t('አጠቃላይ መረጃ', 'Overview'), icon: User },
    { id: 'rank', label: t('የማዕረግ ታሪክ', 'Rank History'), icon: Award, count: member.rankHistory.length },
    { id: 'salary', label: t('ደመወዝ & Payslip', 'Salary & Payslip'), icon: CreditCard },
    { id: 'transfers', label: t('ዝውውርና ምደባ', 'Postings & Transfers'), icon: PlaneTakeoff, count: member.transferHistory.length },
    { id: 'training', label: t('ሥልጠናዎች', 'Training'), icon: GraduationCap, count: member.trainingHistory.length },
    { id: 'performance', label: t('አፈጻጸም / Efficiency', 'Performance'), icon: TrendingUp, count: member.performanceHistory.length },
    { id: 'leave', label: t('የፈቃድ ማህደር', 'Leave Dossier'), icon: Calendar, count: member.leaveBalance.annualRemaining },
    { id: 'benefits', label: t('ጥቅማጥቅም', 'Benefits'), icon: Gift },
    { id: 'disciplinary', label: t('ዲሲፕሊን & ሽልማት', 'Discipline & Awards'), icon: AlertOctagon },
    { id: 'separation', label: t('ስንብት & ጡረታ', 'Separation & Retirement'), icon: LogOut, highlight: member.separation !== undefined },
    { id: 'documents', label: t('ዲጂታል ሰነዶች', 'Documents Vault'), icon: FolderOpen, count: member.documents.length }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header with Official Police File Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={member.identity.photoUrl}
                alt={member.identity.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-amber-400 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono shadow">
                {member.badgeNumber}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                  {member.policeId}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">·</span>
                <span className="text-xs font-semibold text-slate-300">
                  {member.currentRank}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">·</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    member.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : member.status === 'on_leave'
                      ? 'bg-blue-500/15 text-blue-400'
                      : member.status === 'retired'
                      ? 'bg-amber-500/15 text-amber-300'
                      : member.status === 'dismissed'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-purple-500/15 text-purple-300'
                  }`}
                >
                  {member.status === 'active'
                    ? t('በስራ ላይ (Active Duty)', 'Active Duty')
                    : member.status === 'on_leave'
                    ? t('በእረፍት ፈቃድ ላይ', 'On Leave')
                    : member.status === 'retired'
                    ? t('በጡረታ የተሰናበተ (Retired)', 'Retired')
                    : member.status === 'dismissed'
                    ? t('የተባረረ (Dismissed)', 'Dismissed')
                    : t('በዝውውር ላይ', 'In Transfer')}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                {member.identity.fullName}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  {member.currentDepartment}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {member.currentStation}
                </span>
                <span className="font-mono text-slate-300">
                  Grade {member.salaryGrade} · Step {member.salaryStep}
                </span>
              </div>

              {/* Portal Login Credentials Status & Action */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {memberAccount ? (
                  <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">
                      {t('የSelf-Service መግቢያ:', 'Login:')}{' '}
                      <strong className="text-amber-400 font-mono">{memberAccount.username}</strong>
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-300">
                      {t('ይለፍ ቃል:', 'Pass:')}{' '}
                      <code className="text-emerald-400 font-mono font-bold bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                        {memberAccount.tempPassword || '••••••••'}
                      </code>
                    </span>
                    {memberAccount.isActive ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/20">
                        {t('ገባሪ', 'Active')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded font-semibold border border-rose-500/20">
                        {t('የታገደ', 'Suspended')}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => provisionMemberCredentials(member.policeId)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-xs font-bold border border-amber-500/30 transition-all shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{t('የአባሉን Self-Service መለያ ፍጠር (Provision Login)', 'Provision Self-Service Login')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {systemLogo && (
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-400/40 p-1 hidden sm:flex items-center justify-center shadow-md">
                <img
                  src={systemLogo}
                  alt="Commission Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 flex space-x-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & OFFICIAL ID CARD */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Official Police Digital ID Card Badge (Authoritative view from ID System) */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          የቤኒሻንጉል ጉሙዝ ፖሊስ
                        </div>
                        <div className="text-[9px] text-slate-400">POLICE IDENTIFICATION CARD</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-300">{member.policeId}</span>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <img
                      src={member.identity.photoUrl}
                      alt={member.identity.fullName}
                      className="w-20 h-24 rounded-lg object-cover border border-amber-400/50 shadow"
                    />
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t('ሙሉ ስም (Full Name)', 'Full Name')}</span>
                        <span className="font-bold text-white text-sm">{member.identity.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t('ማዕረግ (Rank)', 'Rank')}</span>
                        <span className="font-semibold text-amber-300">{member.currentRank}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t('የደም አይነት (Blood)', 'Blood Group')}</span>
                        <span className="font-mono text-slate-200">{member.identity.bloodGroup || 'O+'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('መለያ ቁጥር:', 'Badge:')}</span>
                      <span className="font-mono text-white">{member.badgeNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የተሰጠበት ቀን:', 'Issued:')}</span>
                      <span className="font-mono text-white">{member.identity.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የመታወቂያ ሁኔታ:', 'ID Status:')}</span>
                      <span className="text-emerald-400 font-semibold">{t('ህጋዊና ንቁ', 'Active / Valid')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Authoritative from ID System</span>
                  <span className="font-mono text-amber-400 font-bold">SECURITY SEAL</span>
                </div>
              </div>

              {/* Personal & Employment Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {t('የአባሉ የግልና የአድራሻ መረጃ (Authoritative from ID System)', 'Personal & Address Information')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t('ጾታ', 'Gender')}</span>
                      <span className="font-semibold text-white">{member.identity.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የልደት ቀን', 'Date of Birth')}</span>
                      <span className="font-semibold text-white font-mono">{member.identity.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('ዜግነት', 'Nationality')}</span>
                      <span className="font-semibold text-white">{member.identity.nationality}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('ክልል/ዞን', 'Region / Zone')}</span>
                      <span className="font-semibold text-white">{member.identity.address.region} · {member.identity.address.zone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('ወረዳ/ቀበሌ', 'Wereda / Kebele')}</span>
                      <span className="font-semibold text-white">{member.identity.address.wereda}, {member.identity.address.kebele}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የአደጋ ጊዜ ተጠሪ', 'Emergency Contact')}</span>
                      <span className="font-semibold text-amber-300">
                        {member.identity.emergencyContact.name} ({member.identity.emergencyContact.relationship}) - {member.identity.emergencyContact.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    {t('የቅጥርና የስራ ሁኔታ መረጃ (HR Registry Details)', 'Institutional HR Service Status')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t('የቅጥር ቀን', 'Employment Date')}</span>
                      <span className="font-semibold text-white font-mono">{member.employmentDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የቅጥር አይነት', 'Contract Type')}</span>
                      <span className="font-semibold text-white">{member.employmentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የአገልግሎት ዘመን', 'Years of Service')}</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {2026 - parseInt(member.employmentDate.substring(0, 4), 10)} {t('ዓመታት', 'years')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የስራ መደብ', 'Position')}</span>
                      <span className="font-semibold text-white">{member.position}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የደመወዝ እርከን', 'Salary Grade & Step')}</span>
                      <span className="font-semibold text-amber-300 font-mono">
                        Grade {member.salaryGrade} · Step {member.salaryStep}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የቀረ ዓመታዊ ፈቃድ', 'Remaining Annual Leave')}</span>
                      <span className="font-semibold text-blue-400 font-mono">
                        {member.leaveBalance.annualRemaining} {t('ቀናት', 'days')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RANK & PROMOTION */}
          {activeTab === 'rank' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    {t('የማዕረግ እድገት ታሪክ (Promotion Timeline)', 'Rank & Promotion History')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('አባሉ ከተቀጠረበት ጀምሮ ያገኛቸው የማዕረግ እድገቶችና ትዕዛዞች', 'Chronological promotion records and official appointment orders')}
                  </p>
                </div>

                {currentRole === 'hr_admin' && (
                  <button
                    onClick={() => setActionModal('promotion')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('አዲስ ማዕረግ መዝግብ', 'Record Promotion')}</span>
                  </button>
                )}
              </div>

              <div className="relative pl-6 border-l-2 border-slate-700 space-y-6 my-4">
                {member.rankHistory.map((item, idx) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900 shadow" />
                    <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-base font-bold text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          {item.rank}
                          {idx === 0 && (
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-mono font-semibold">
                              {t('ወቅታዊ ማዕረግ (Current)', 'Current')}
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{item.effectiveDate}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400">{t('የትዕዛዝ ቁጥር (Order Ref):', 'Order Ref:')}</span>{' '}
                          <span className="font-mono text-amber-300">{item.orderNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">{t('ያፀደቀው አካል:', 'Approved By:')}</span>{' '}
                          <span>{item.approvedBy}</span>
                        </div>
                      </div>
                      {item.remarks && (
                        <p className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-1.5">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SALARY, GRADE, STEP & PAYSLIP */}
          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    {t('የደመወዝ፣ እርከንና የወር ክፍያ ስሌት', 'Salary Structure & Monthly Payslip')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('በፖሊስ ደመወዝ እስኬል መሰረት የወር ደመወዝ፣ አበልና ተቀናሾች', 'Public security salary matrix and monthly payroll slip')}
                  </p>
                </div>

                {currentRole === 'payroll_officer' || currentRole === 'hr_admin' ? (
                  <button
                    onClick={() => setActionModal('salary_adjustment')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('እርከን/ደመወዝ ቀይር', 'Adjust Grade / Step')}</span>
                  </button>
                ) : null}
              </div>

              {/* Payslip Card for Current Month (September 2026) */}
              <div className="bg-slate-950 border border-slate-700 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Police Commission')}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {t('የመስከረም 2026 የወር ደመወዝ ፔይስሊፕ (Monthly Payslip)', 'Official Monthly Payslip · September 2026')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
                      {member.policeId}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-slate-400">{t('የአባሉ ስም:', 'Officer Name:')}</span>{' '}
                    <span className="font-bold text-white">{member.identity.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('ማዕረግ:', 'Rank:')}</span>{' '}
                    <span className="font-bold text-amber-300">{member.currentRank}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('የደመወዝ እርከን:', 'Scale:')}</span>{' '}
                    <span className="font-mono text-white">Grade {member.salaryGrade} / Step {member.salaryStep}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('መምሪያ:', 'Directorate:')}</span>{' '}
                    <span className="text-slate-200">{member.currentDepartment}</span>
                  </div>
                </div>

                {/* Earnings & Deductions breakdown */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Earnings */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-emerald-400 uppercase text-[11px] pb-1 border-b border-slate-800">
                      {t('ገቢዎች (Gross Earnings)', 'Earnings')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">{t('መሰረታዊ ደመወዝ', 'Base Salary')}</span>
                      <span className="font-mono text-white">{member.baseSalary.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የስራ ኃላፊነት አበል', 'Duty Allowance')}</span>
                      <span className="font-mono text-slate-200">{member.monthlyAllowances.duty.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የሜዳ/ተልዕኮ አበል', 'Field Allowance')}</span>
                      <span className="font-mono text-slate-200">{member.monthlyAllowances.field.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የቤት አበል', 'Housing Allowance')}</span>
                      <span className="font-mono text-slate-200">{member.monthlyAllowances.housing.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የትራንስፖርት አበል', 'Transport Allowance')}</span>
                      <span className="font-mono text-slate-200">{member.monthlyAllowances.transport.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የስጋት (Hazard) አበል', 'Hazard Allowance')}</span>
                      <span className="font-mono text-slate-200">{member.monthlyAllowances.hazard.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-emerald-400">
                      <span>{t('ጠቅላላ ገቢ (Gross Pay)', 'Total Gross')}</span>
                      <span className="font-mono">{grossSalary.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-rose-400 uppercase text-[11px] pb-1 border-b border-slate-800">
                      {t('ተቀናሾች (Deductions)', 'Deductions')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የጡረታ መዋጮ (7%)', 'Pension (7%)')}</span>
                      <span className="font-mono text-rose-300">-{pensionDeduction.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የስራ ግብር (Income Tax)', 'Income Tax')}</span>
                      <span className="font-mono text-rose-300">-{taxDeduction.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between pt-8 border-t border-slate-800 font-bold text-rose-400">
                      <span>{t('ጠቅላላ ተቀናሽ', 'Total Deductions')}</span>
                      <span className="font-mono">-{(pensionDeduction + taxDeduction).toLocaleString()} ETB</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div className="mt-6 pt-4 border-t-2 border-slate-800 flex items-center justify-between bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                  <div>
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      {t('የተጣራ ተከፋይ ደመወዝ (NET TAKE HOME PAY)', 'Net Salary Payable')}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {t('በቀጥታ ወደ ባንክ ሂሳብ የተላለፈ', 'Direct deposit to verified account')}
                    </p>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {netSalary.toLocaleString()} <span className="text-xs font-normal">ETB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POSTINGS & TRANSFERS */}
          {activeTab === 'transfers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <PlaneTakeoff className="w-4 h-4 text-purple-400" />
                    {t('የዝውውርና ምደባ ታሪክ (Postings & Transfers)', 'Station Postings & Transfer Records')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('አባሉ በክልሉ የተለያዩ ዞኖችና ጣቢያዎች ያገለገለባቸው ምደባዎች', 'Complete geographic and departmental assignments')}
                  </p>
                </div>

                {currentRole === 'hr_admin' && (
                  <button
                    onClick={() => setActionModal('transfer')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('አዲስ ዝውውር መዝግብ', 'Execute Transfer')}</span>
                  </button>
                )}
              </div>

              {/* Current Station Badge */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs text-slate-400">{t('አሁን የሚገኝበት ጣቢያና መምሪያ:', 'Active Station:')}</span>
                    <h5 className="text-sm font-bold text-white">{member.currentStation}</h5>
                    <p className="text-xs text-amber-300 font-medium">{member.currentDepartment} · {member.position}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {t('በስራ ላይ', 'Active Duty Station')}
                </span>
              </div>

              {/* Transfer History Table */}
              <div className="space-y-3 mt-4">
                {member.transferHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    {t('ምንም የተመዘገበ የዝውውር ታሪክ የለም (የመጀመሪያ ምደባ ላይ ይገኛሉ)', 'No prior transfers recorded; serving at initial assignment.')}
                  </div>
                ) : (
                  member.transferHistory.map(th => (
                    <div key={th.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white flex items-center gap-2">
                          <PlaneTakeoff className="w-3.5 h-3.5 text-purple-400" />
                          {th.fromStation} ➜ {th.toStation}
                        </span>
                        <span className="font-mono text-slate-400">{th.effectiveDate}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        <div>
                          <span className="text-slate-400">{t('የቀድሞ መምሪያ:', 'From:')}</span> {th.fromDepartment}
                        </div>
                        <div>
                          <span className="text-slate-400">{t('አዲሱ መምሪያ:', 'To:')}</span> {th.toDepartment}
                        </div>
                        <div>
                          <span className="text-slate-400">{t('የትዕዛዝ ቁጥር:', 'Order Ref:')}</span>{' '}
                          <span className="font-mono text-amber-300">{th.orderRef}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">{t('ያፀደቀው አዛዥ:', 'Authorized By:')}</span>{' '}
                          <span>{th.approvingOfficer}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 border-t border-slate-800 pt-1.5 italic">
                        {t('ምክንያት፡', 'Reason:')} {th.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TRAINING */}
          {activeTab === 'training' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    {t('የስልጠናና የክህሎት ማስረጃዎች (Training & Education)', 'Training & Qualifications')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('አባሉ የተሳተፈባቸው ስልጠናዎች፣ ኮሌጆችና የምስክር ወረቀቶች', 'Police academy courses, specialized credentials, and scores')}
                  </p>
                </div>

                {currentRole === 'hr_admin' && (
                  <button
                    onClick={() => setActionModal('training')}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('አዲስ ስልጠና መዝግብ', 'Assign Training')}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {member.trainingHistory.length === 0 ? (
                  <div className="col-span-2 p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    {t('ምንም የተመዘገበ ስልጠና የለም', 'No specialized training records logged.')}
                  </div>
                ) : (
                  member.trainingHistory.map(tr => (
                    <div key={tr.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-white text-sm">{tr.title}</h5>
                        <span className="text-[10px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-medium">
                          {tr.status}
                        </span>
                      </div>
                      <div className="text-slate-300 space-y-1">
                        <div>
                          <span className="text-slate-400">{t('ተቋም:', 'Institution:')}</span> {tr.institution}
                        </div>
                        <div>
                          <span className="text-slate-400">{t('ዘርፍ:', 'Category:')}</span> {tr.trainingType}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('ጊዜ:', 'Duration:')}</span>
                          <span className="font-mono text-slate-300">{tr.startDate} - {tr.endDate}</span>
                        </div>
                        {tr.gradeOrScore && (
                          <div className="flex justify-between border-t border-slate-800 pt-1.5">
                            <span className="text-slate-400">{t('የተገኘ ውጤት:', 'Score / Grade:')}</span>
                            <span className="font-bold text-emerald-400">{tr.gradeOrScore}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PERFORMANCE / EFFICIENCY */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    {t('የአፈጻጸም / Efficiency ምዘና ውጤቶች', 'Performance & Efficiency Evaluations')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('የሩብ ዓመትና የዓመታዊ ስራ አፈጻጸም ምዘናዎችና የቅርብ ኃላፊ አስተያየት', 'Official supervisor appraisal scores and decisions')}
                  </p>
                </div>

                {currentRole === 'supervisor' || currentRole === 'hr_admin' ? (
                  <button
                    onClick={() => setActionModal('performance')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('አዲስ ምዘና አስገባ', 'Submit Evaluation')}</span>
                  </button>
                ) : null}
              </div>

              <div className="space-y-3">
                {member.performanceHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    {t('ምንም የተመዘገበ የአፈጻጸም ውጤት የለም', 'No performance evaluations on record yet.')}
                  </div>
                ) : (
                  member.performanceHistory.map(pf => (
                    <div key={pf.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">{pf.evaluationPeriod}</span>
                          <span className="text-slate-400 text-xs ml-2">({pf.year})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-emerald-400 font-mono">{pf.score}%</span>
                          <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded">
                            {pf.rating}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[11px]">{t('የተገመገመበት ጥንካሬ:', 'Key Strengths:')}</span>
                          <span>{pf.strength}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">{t('መሻሻል ያለበት:', 'Areas for Improvement:')}</span>
                          <span>{pf.improvementArea}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>{t('ገምጋሚ ኃላፊ:', 'Evaluated By:')} {pf.supervisorName} ({pf.supervisorRank})</span>
                        <span className="text-emerald-400 font-semibold">{t('የመጨረሻ ውሳኔ:', 'Decision:')} {pf.finalDecision}</span>
                        <span className="font-mono">{pf.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: LEAVE DOSSIER */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {t('የእረፍት ፈቃድ ማህደርና ቀሪ ቀናት', 'Leave Dossier & Balances')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('ዓመታዊ፣ የህመም፣ የሀዘንና ልዩ ፈቃዶች ክትትል', 'Annual, sick, and special leave records')}
                  </p>
                </div>

                {currentRole === 'hr_admin' && (
                  <button
                    onClick={() => setActionModal('leave')}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('ፈቃድ መዝግብ', 'Grant Leave')}</span>
                  </button>
                )}
              </div>

              {/* Leave Balances Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">{t('ጠቅላላ ዓመታዊ ፈቃድ', 'Annual Entitlement')}</span>
                  <div className="text-xl font-black text-white font-mono mt-1">{member.leaveBalance.annualTotal} {t('ቀናት', 'days')}</div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">{t('የተወሰደ ዓመታዊ', 'Annual Used')}</span>
                  <div className="text-xl font-black text-amber-400 font-mono mt-1">{member.leaveBalance.annualUsed} {t('ቀናት', 'days')}</div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center bg-blue-500/5 border-blue-500/20">
                  <span className="text-[11px] text-blue-400 uppercase font-semibold">{t('የቀረ ቀሪ ፈቃድ', 'Leave Remaining')}</span>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">{member.leaveBalance.annualRemaining} {t('ቀናት', 'days')}</div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">{t('የህመም ፈቃድ', 'Sick Leave Used')}</span>
                  <div className="text-xl font-black text-slate-300 font-mono mt-1">{member.leaveBalance.sickUsed} {t('ቀናት', 'days')}</div>
                </div>
              </div>

              {/* Leave History Table */}
              <div className="space-y-2 mt-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('የፈቃድ ታሪክ', 'Leave History')}</h5>
                {member.leaveHistory.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    {t('ምንም የተወሰደ ፈቃድ የለም', 'No leaves utilized yet.')}
                  </div>
                ) : (
                  member.leaveHistory.map(lh => (
                    <div key={lh.id} className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{lh.leaveType}</span>
                        <span className="text-slate-400 ml-2">({lh.durationDays} {t('ቀናት', 'days')})</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{lh.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-300 block">{lh.startDate} - {lh.endDate}</span>
                        <span className="text-[10px] text-emerald-400">{lh.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 8: BENEFITS & ALLOWANCES */}
          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                {t('ጥቅማጥቅምና ልዩ አበሎች (Benefits & Entitlements)', 'Benefits & Allowances')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {member.benefits.length === 0 ? (
                  <div className="col-span-2 p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    {t('የተለየ ተጨማሪ ጥቅማጥቅም አልተመዘገበም', 'Standard institutional benefits apply.')}
                  </div>
                ) : (
                  member.benefits.map(b => (
                    <div key={b.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between">
                        <h5 className="font-bold text-white text-sm">{b.title}</h5>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-mono">
                          {b.status}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2">
                        <span className="text-slate-400">{t('የወር መጠን:', 'Monthly Rate:')}</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {b.monthlyAmount > 0 ? `${b.monthlyAmount.toLocaleString()} ETB` : t('ሙሉ ሽፋን (100% Covered)', 'Full Coverage')}
                        </span>
                      </div>
                      {b.remarks && <p className="text-slate-400 text-[11px] italic">{b.remarks}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 9: DISCIPLINARY & AWARDS */}
          {activeTab === 'disciplinary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Disciplinary */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" />
                  {t('የዲሲፕሊን መዝገብ (Disciplinary Dossier)', 'Disciplinary Records')}
                </h4>
                {member.disciplinaryRecords.length === 0 ? (
                  <div className="p-4 text-center text-xs text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {t('ንጹህ የዲሲፕሊን ማህደር (ምንም ቅጣት የለም)', 'Clean Disciplinary Record. No infractions.')}
                  </div>
                ) : (
                  member.disciplinaryRecords.map(dr => (
                    <div key={dr.id} className="bg-slate-950 border border-rose-500/30 p-3.5 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-white">{dr.incident}</span>
                        <span className="font-mono text-slate-400">{dr.date}</span>
                      </div>
                      <div className="text-rose-300 font-medium">
                        {t('የተወሰደ እርምጃ፡', 'Action Taken:')} {dr.measureTaken}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ref: {dr.verdictRef} · Status: {dr.status}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Awards */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {t('ሽልማቶችና የክብር ሜዳሊያዎች (Awards & Honors)', 'Honors & Citations')}
                </h4>
                {member.awardsAndHonors.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    {t('ምንም የተመዘገበ ልዩ ሽልማት የለም', 'No special medals or citations logged.')}
                  </div>
                ) : (
                  member.awardsAndHonors.map(aw => (
                    <div key={aw.id} className="bg-slate-950 border border-amber-500/30 p-3.5 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-amber-300">{aw.title}</span>
                        <span className="font-mono text-slate-400">{aw.date}</span>
                      </div>
                      <p className="text-slate-300">{aw.reason}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t('የሰጠው አካል፡', 'Awarded by:')} {aw.awardedBy} · Ref: {aw.medalOrCertRef}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 10: SERVICE SEPARATION & RETIREMENT */}
          {activeTab === 'separation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-amber-400" />
                    {t('የስንብትና ጡረታ ዶሴ (Separation & Retirement Record)', 'Separation & Retirement Dossier')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('የአገልግሎት ማብቂያ፣ የጡረታ ሰነድ፣ ክሊራንስና ይፋዊ የውሳኔ ደብዳቤ', 'Formal service termination, pension clearance, and statutory files')}
                  </p>
                </div>

                {!member.separation && currentRole === 'hr_admin' && (
                  <button
                    onClick={() => setActionModal('separation')}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('የስንብት/ጡረታ ሂደት ጀምር', 'Process Separation / Retirement')}</span>
                  </button>
                )}
              </div>

              {member.separation ? (
                <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        {t('ይፋዊ የስንብት ማረጋገጫ (Official Separation Decree)', 'Official Separation Record')}
                      </span>
                      <h4 className="text-lg font-black text-white mt-1">{member.separation.separationType}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-slate-400 block">{t('የተፈጸመበት ቀን:', 'Date:')} {member.separation.separationDate}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {member.separation.totalServiceYears} {t('ዓመታት የተሟላ አገልግሎት', 'Years of Service')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400 block">{t('የመጨረሻ ማዕረግ:', 'Last Rank Held:')}</span>
                      <span className="font-bold text-white">{member.separation.lastRank}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የመጨረሻ ደመወዝ እርከን:', 'Last Scale:')}</span>
                      <span className="font-mono text-white">Grade {member.separation.lastSalaryGrade} · Step {member.separation.lastSalaryStep}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የውሳኔ ቁጥር (Decision Ref):', 'Decision Ref:')}</span>
                      <span className="font-mono text-amber-300 font-bold">{member.separation.decisionRef}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('የጡረታ መብት:', 'Pension Entitlement:')}</span>
                      <span className="font-semibold text-emerald-400">
                        {member.separation.pensionEligible ? t('አዎ (ህጋዊ ጡረተኛ)', 'Eligible for State Pension') : t('የለም', 'Ineligible')}
                      </span>
                    </div>
                    {member.separation.pensionBookRef && (
                      <div>
                        <span className="text-slate-400 block">{t('የጡረታ ደብተር ቁጥር:', 'Pension Book Ref:')}</span>
                        <span className="font-mono text-amber-300">{member.separation.pensionBookRef}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block">{t('የክሊራንስ ሁኔታ:', 'Clearance Status:')}</span>
                      <span className="font-semibold text-emerald-400">
                        {member.separation.clearanceCompleted ? t('የተጠናቀቀ (100% Cleared)', 'Completed') : t('በሂደት ላይ', 'Pending')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-400 block text-[11px] mb-1">{t('የስንብት ምክንያትና ውሳኔ፡', 'Official Grounds / Decision Summary:')}</span>
                    <p>{member.separation.reason}</p>
                    {member.separation.auditNote && (
                      <p className="mt-2 text-slate-400 text-[11px] border-t border-slate-800 pt-1.5">
                        {member.separation.auditNote}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h5 className="text-sm font-bold text-white">{t('አባሉ በንቁ የፖሊስ አገልግሎት ላይ ይገኛሉ', 'Officer is in Active Service')}</h5>
                  <p className="mt-1 max-w-md mx-auto text-slate-400">
                    {t(
                      'ይህ አባል ምንም አይነት የስንብት ወይም የጡረታ ፋይል አልተከፈተባቸውም። እድሜያቸው ወይም አገልግሎታቸው ሲደርስ በHR Admin የስንብት ሂደት ይጀምራል።',
                      'No separation or retirement has been logged. Active duty status maintained.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: DIGITAL DOCUMENTS VAULT (Upload from Camera / Gallery simulation) */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    {t('ዲጂታል የHR ሰነዶች ማህደር (Digital Personnel Files)', 'Digital Document Dossier')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('የቅጥር፣ የማዕረግ እድገት፣ የዝውውር፣ የስልጠና፣ የስንብትና የፈቃድ ማስረጃዎች', 'Scanned decrees, appointment letters, and verified certificates')}
                  </p>
                </div>

                <button
                  onClick={() => setActionModal('document_upload')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('ሰነድ ጫን / ስካን አድርግ', 'Upload / Scan Document')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {member.documents.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    {t('በማህደሩ ውስጥ ምንም ዲጂታል ሰነድ አልተያያዘም', 'No scanned documents uploaded to this file.')}
                  </div>
                ) : (
                  member.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors group"
                    >
                      <div>
                        <div className="aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative mb-2">
                          <img
                            src={doc.fileUrl}
                            alt={doc.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-2 right-2 text-[10px] bg-slate-950/80 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                            {doc.fileSizeText || '1.2 MB'}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-semibold uppercase">{doc.documentType}</span>
                        <h5 className="font-bold text-white text-xs mt-0.5 line-clamp-1">{doc.title}</h5>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">Ref: {doc.referenceNumber}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{doc.documentDate}</span>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>{t('እይ', 'View')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            BENISHANGUL GUMUZ REGIONAL POLICE COMMISSION · DIGITAL HRMS DOSSIER
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('ማህደሩን አትም', 'Print Dossier')}</span>
          </button>
        </div>

        {/* POPUP ACTION FORMS */}
        {/* 1. Record Promotion Form */}
        {actionModal === 'promotion' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  {t('አዲስ የማዕረግ እድገት መዝግብ', 'Record Rank Promotion')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('አዲሱ ማዕረግ', 'New Rank')}</label>
                <select
                  value={promoRank}
                  onChange={e => setPromoRank(e.target.value as PoliceRank)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="ረዳት ሳጅን">ረዳት ሳጅን</option>
                  <option value="ሳጅን">ሳጅን</option>
                  <option value="ዋና ሳጅን">ዋና ሳጅን</option>
                  <option value="ረዳት ኢንስፔክተር">ረዳት ኢንስፔክተር</option>
                  <option value="ምክትል ኢንስፔክተር">ምክትል ኢንስፔክተር</option>
                  <option value="ዋና ኢንስፔክተር">ዋና ኢንስፔክተር</option>
                  <option value="ኮማንደር">ኮማንደር</option>
                  <option value="ረዳት ኮሚሽነር">ረዳት ኮሚሽነር</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የትዕዛዝ ቁጥር', 'Order Reference')}</label>
                <input
                  type="text"
                  value={promoOrder}
                  onChange={e => setPromoOrder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ተጨማሪ ማስታወሻ', 'Remarks')}</label>
                <textarea
                  value={promoRemarks}
                  onChange={e => setPromoRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  placeholder={t('ምክንያትና የውሳኔ ማስታወሻ...', 'Promotion decision rationale...')}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    addPromotion(member.policeId, promoRank, promoOrder, promoRemarks);
                    setActionModal(null);
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {t('መዝግብና አጽድቅ', 'Confirm Promotion')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Execute Transfer Form */}
        {actionModal === 'transfer' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlaneTakeoff className="w-4 h-4 text-purple-400" />
                  {t('የአባላት ዝውውር መዝግብ (Execute Transfer)', 'Execute Station Transfer')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('አዲሱ መምሪያ', 'Destination Directorate')}</label>
                <select
                  value={trfDept}
                  onChange={e => setTrfDept(e.target.value as DepartmentName)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="ወንጀል ምርመራ መምሪያ">ወንጀል ምርመራ መምሪያ</option>
                  <option value="ወንጀል መከላከልና ፓትሮል መምሪያ">ወንጀል መከላከልና ፓትሮል መምሪያ</option>
                  <option value="ትራፊክ ደህንነትና ቁጥጥር መምሪያ">ትራፊክ ደህንነትና ቁጥጥር መምሪያ</option>
                  <option value="ልዩ ፈጣን ኃይል መምሪያ">ልዩ ፈጣን ኃይል መምሪያ</option>
                  <option value="የሰው ኃይል አስተዳደርና ልማት መምሪያ">የሰው ኃይል አስተዳደርና ልማት መምሪያ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('አዲሱ ጣቢያ/ቦታ', 'Destination Station')}</label>
                <select
                  value={trfStation}
                  onChange={e => setTrfStation(e.target.value as StationLocation)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="አሶሳ ዋና መምሪያ (Assosa HQ)">አሶሳ ዋና መምሪያ (Assosa HQ)</option>
                  <option value="አሶሳ ከተማ ፖሊስ መምሪያ">አሶሳ ከተማ ፖሊስ መምሪያ</option>
                  <option value="መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)">መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)</option>
                  <option value="ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)">ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)</option>
                  <option value="ባምባሲ ወረዳ ፖሊስ ጣቢያ">ባምባሲ ወረዳ ፖሊስ ጣቢያ</option>
                  <option value="ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)">ጉባ ወረዳ ጣቢያ (ህዳሴ ግድብ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የትዕዛዝ ቁጥር', 'Order Reference')}</label>
                <input
                  type="text"
                  value={trfOrder}
                  onChange={e => setTrfOrder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የዝውውር ምክንያት', 'Reason')}</label>
                <textarea
                  value={trfReason}
                  onChange={e => setTrfReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    executeTransfer(member.policeId, trfDept, trfStation, trfReason, trfOrder);
                    setActionModal(null);
                  }}
                  className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-xs"
                >
                  {t('ዝውውር ፈጽም', 'Apply Transfer')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Adjust Salary Grade & Step */}
        {actionModal === 'salary_adjustment' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  {t('የደመወዝ እርከን/Step ማስተካከያ', 'Adjust Salary Grade & Step')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ደመወዝ Grade', 'Salary Grade')}</label>
                  <select
                    value={adjGrade}
                    onChange={e => setAdjGrade(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('እርከን Step', 'Salary Step')}</label>
                  <select
                    value={adjStep}
                    onChange={e => setAdjStep(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                      <option key={s} value={s}>Step {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="text-slate-400">{t('አዲሱ መሰረታዊ ደመወዝ ይሆናል፡', 'Resulting Base Salary:')}</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                  {(SALARY_SCALE_MATRIX[adjGrade]?.[adjStep - 1] || 0).toLocaleString()} ETB
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የማስተካከያ ምክንያት/ትዕዛዝ', 'Justification / Order Ref')}</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    updateSalaryGradeStep(member.policeId, adjGrade, adjStep, adjReason);
                    setActionModal(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {t('ደመወዝ አዘምን', 'Update Salary')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Process Service Separation / Retirement */}
        {actionModal === 'separation' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  {t('የአገልግሎት ስንብት / ጡረታ መዝግብ', 'Process Separation & Retirement Dossier')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የስንብት አይነት (Separation Type)', 'Separation Type')}</label>
                <select
                  value={sepType}
                  onChange={e => setSepType(e.target.value as SeparationType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="በጡረታ የተሰናበተ (Retirement)">በጡረታ የተሰናበተ (Retirement)</option>
                  <option value="በግል ፈቃድ የለቀቀ (Resignation)">በግል ፈቃድ የለቀቀ (Resignation)</option>
                  <option value="የተባረረ (Dismissal)">የተባረረ (Dismissal - በዲሲፕሊን)</option>
                  <option value="የአገልግሎት ዘመን ያበቃ (Term Ended)">የአገልግሎት ዘመን ያበቃ (Term Ended)</option>
                  <option value="በህክምና ምክንያት የተሰናበተ (Medical Discharge)">በህክምና ምክንያት የተሰናበተ (Medical Discharge)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የውሳኔ ቁጥር', 'Decision Ref')}</label>
                  <input
                    type="text"
                    value={sepRef}
                    onChange={e => setSepRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጡረታ መብት አለዉ?', 'Pension Eligible?')}</label>
                  <select
                    value={sepPension ? 'true' : 'false'}
                    onChange={e => setSepPension(e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="true">አዎ (ህጋዊ ጡረተኛ)</option>
                    <option value="false">የለም</option>
                  </select>
                </div>
              </div>

              {sepPension && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጡረታ ደብተር መለያ ቁጥር', 'Pension Book Reference')}</label>
                  <input
                    type="text"
                    value={sepPensionBook}
                    onChange={e => setSepPensionBook(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የስንብት ምክንያትና ዝርዝር ማብራሪያ', 'Reason & Details')}</label>
                <textarea
                  value={sepReason}
                  onChange={e => setSepReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    processServiceSeparation(member.policeId, {
                      type: sepType,
                      reason: sepReason,
                      decisionRef: sepRef,
                      pensionEligible: sepPension,
                      pensionBookRef: sepPension ? sepPensionBook : undefined
                    });
                    setActionModal(null);
                  }}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs"
                >
                  {t('ስንብት አጽድቅና ማህደር ዝጋ', 'Execute Separation')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Document Upload / Camera simulation */}
        {actionModal === 'document_upload' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  {t('አዲስ ሰነድ ጫን / ካሜራ ስካነር', 'Upload or Scan Document')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሰነድ ርዕስ', 'Document Title')}</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የልዩ ስልጠና ማረጋገጫ ምስክር ወረቀት..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሰነድ አይነት', 'Document Type')}</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="ደብዳቤ">ደብዳቤ</option>
                    <option value="የቅጥር ሰነድ">የቅጥር ሰነድ</option>
                    <option value="የPromotion ደብዳቤ">የPromotion ደብዳቤ</option>
                    <option value="የዝውውር ደብዳቤ">የዝውውር ደብዳቤ</option>
                    <option value="የስልጠና ማስረጃ">የስልጠና ማስረጃ</option>
                    <option value="የፈቃድ ሰነድ">የፈቃድ ሰነድ</option>
                    <option value="የጡረታ ሰነድ">የጡረታ ሰነድ</option>
                    <option value="የመታወቂያ ኮፒ">የመታወቂያ ኮፒ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሰነድ ቁጥር (Ref)', 'Reference No')}</label>
                  <input
                    type="text"
                    value={docRef}
                    onChange={e => setDocRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Camera Scanner Simulation Dropzone */}
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-950/60">
                <Camera className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  {t('ሰነዱን በካሜራ አንሳ ወይም ከኮምፒውተር ምረጥ', 'Scan via Camera or Pick from Gallery')}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  PNG, JPG, PDF (High resolution security scan)
                </span>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                    camera_snapshot_01.jpg (1.8 MB)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={!docTitle.trim()}
                  onClick={() => {
                    uploadPersonnelDocument(member.policeId, {
                      title: docTitle,
                      documentType: docType,
                      referenceNumber: docRef,
                      documentDate: docDate,
                      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
                      fileType: 'image',
                      fileSizeText: '1.8 MB',
                      notes: docNotes
                    });
                    setActionModal(null);
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {t('በማህደር ላይ አያይዝ', 'Save to Personnel File')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
