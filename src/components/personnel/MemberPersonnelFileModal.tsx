import React, { useState, useEffect } from 'react';
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
  KeyRound,
  Folder,
  FolderCheck,
  Check,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Save,
  Edit3,
  Trash2,
  X
} from 'lucide-react';

interface MemberPersonnelFileModalProps {
  member: MemberProfile;
  onClose: () => void;
  initialTab?: string;
  initialActionModal?: string;
}

export const MemberPersonnelFileModal: React.FC<MemberPersonnelFileModalProps> = ({
  member: initialMember,
  onClose,
  initialTab = 'overview',
  initialActionModal = null
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
    addBenefitRecord,
    addDisciplinaryRecord,
    addAwardRecord,
    uploadPersonnelDocument,
    processServiceSeparation,
    updateSalaryGradeStep,
    getCalculatedPayroll,
    getMemberByPoliceId,
    updateMemberDutyStation,
    updateMemberStepAndPromotionDates,
    applyStepIncrement,
    updateMemberProfile,
    deleteMember
  } = useHrms();

  // Always use the freshest member state from HrmsContext so newly added items show up immediately!
  const member = getMemberByPoliceId(initialMember.policeId) || initialMember;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionModal, setActionModal] = useState<string | null>(initialActionModal);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duty Station & Commission Payroll Eligibility States
  const [dutyStationAddress, setDutyStationAddress] = useState(
    member.dutyStationAddress || (member.currentStation.includes('አሶሳ') ? 'የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ዋና መምሪያ - አሶሳ' : member.currentStation)
  );
  const [isCommissionStaff, setIsCommissionStaff] = useState<boolean>(
    member.isCommissionStaff ?? (member.dutyStationAddress?.includes('ኮሚሽን') || member.currentStation?.includes('አሶሳ') || false)
  );

  // Step Increment & Rank Promotion Dates States
  const [nextStepDate, setNextStepDate] = useState(member.nextStepIncrementDate || '2026-12-01');
  const [nextPromoDate, setNextPromoDate] = useState(member.nextPromotionEligibilityDate || '2027-04-15');
  const [lastPromoDate, setLastPromoDate] = useState(
    member.lastPromotionDate || member.rankHistory?.[0]?.effectiveDate || '2023-04-15'
  );
  const [lastStepDate, setLastStepDate] = useState(member.lastStepIncrementDate || '2024-12-01');

  // Full Profile Edit States (Admin management - Address, Responsibility, Rank, etc.)
  const [editFullNameAm, setEditFullNameAm] = useState(member.identity.fullName);
  const [editFullNameEn, setEditFullNameEn] = useState(member.identity.fullNameEn || '');
  const [editPosition, setEditPosition] = useState(member.position);
  const [editRank, setEditRank] = useState<PoliceRank>(member.currentRank);
  const [editDepartment, setEditDepartment] = useState<DepartmentName>(member.currentDepartment);
  const [editStation, setEditStation] = useState<StationLocation>(member.currentStation);
  const [editPhone, setEditPhone] = useState(member.identity.phone || '');
  const [editRegion, setEditRegion] = useState(member.identity.address.region || 'ቤኒሻንጉል ጉሙዝ');
  const [editZone, setEditZone] = useState(member.identity.address.zone || 'አሶሳ ዞን');
  const [editWereda, setEditWereda] = useState(member.identity.address.wereda || 'አሶሳ ወረዳ');
  const [editKebele, setEditKebele] = useState(member.identity.address.kebele || 'ቀበሌ 03');
  const [editDutyStation, setEditDutyStation] = useState(member.dutyStationAddress || '');
  const [editIsCommission, setEditIsCommission] = useState(member.isCommissionStaff ?? true);
  const [editEmergencyName, setEditEmergencyName] = useState(member.identity.emergencyContact.name || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(member.identity.emergencyContact.phone || '');
  const [deleteReason, setDeleteReason] = useState('');

  // Sync state when member changes
  useEffect(() => {
    setEditFullNameAm(member.identity.fullName);
    setEditFullNameEn(member.identity.fullNameEn || '');
    setEditPosition(member.position);
    setEditRank(member.currentRank);
    setEditDepartment(member.currentDepartment);
    setEditStation(member.currentStation);
    setEditPhone(member.identity.phone || '');
    setEditRegion(member.identity.address.region || 'ቤኒሻንጉል ጉሙዝ');
    setEditZone(member.identity.address.zone || 'አሶሳ ዞን');
    setEditWereda(member.identity.address.wereda || 'አሶሳ ወረዳ');
    setEditKebele(member.identity.address.kebele || 'ቀበሌ 03');
    setEditDutyStation(member.dutyStationAddress || '');
    setEditIsCommission(member.isCommissionStaff ?? true);
    setEditEmergencyName(member.identity.emergencyContact.name || '');
    setEditEmergencyPhone(member.identity.emergencyContact.phone || '');
  }, [member]);

  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateMemberProfile(member.policeId, {
        currentRank: editRank,
        currentDepartment: editDepartment,
        currentStation: editStation,
        position: editPosition.trim(),
        dutyStationAddress: editDutyStation.trim(),
        isCommissionStaff: editIsCommission,
        identity: {
          ...member.identity,
          fullName: editFullNameAm.trim(),
          fullNameEn: editFullNameEn.trim(),
          phone: editPhone.trim(),
          rankAm: editRank,
          responsibilityAm: editPosition.trim(),
          address: {
            region: editRegion.trim(),
            zone: editZone.trim(),
            wereda: editWereda.trim(),
            kebele: editKebele.trim()
          },
          emergencyContact: {
            ...member.identity.emergencyContact,
            name: editEmergencyName.trim(),
            phone: editEmergencyPhone.trim()
          }
        }
      });
      setIsSubmitting(false);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message });
        setActionModal(null);
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedbackMessage({ type: 'error', text: err?.message || 'ማስተካከል አልተቻለም' });
    }
  };

  const handleDeleteMember = async () => {
    setIsSubmitting(true);
    try {
      const res = await deleteMember(member.policeId, deleteReason);
      setIsSubmitting(false);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedbackMessage({ type: 'error', text: err?.message || 'ማጥፋት አልተቻለም' });
    }
  };

  // Auto-dismiss feedback message after 4.5 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const handleSaveDutyStation = async () => {
    setIsSubmitting(true);
    const res = await updateMemberDutyStation(member.policeId, dutyStationAddress, isCommissionStaff);
    setIsSubmitting(false);
    setFeedbackMessage({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleSaveStepAndPromoDates = async () => {
    setIsSubmitting(true);
    const res = await updateMemberStepAndPromotionDates(
      member.policeId,
      nextStepDate,
      nextPromoDate,
      lastPromoDate,
      lastStepDate
    );
    setIsSubmitting(false);
    setFeedbackMessage({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleAutoComputeFromLastPromo = (lastDate: string) => {
    setLastPromoDate(lastDate);
    if (lastDate) {
      const d = new Date(lastDate);
      if (!isNaN(d.getTime())) {
        d.setFullYear(d.getFullYear() + 3);
        setNextPromoDate(d.toISOString().substring(0, 10));
      }
    }
  };

  const handleAutoComputeDates = () => {
    const today = new Date();
    const stepD = new Date(today);
    stepD.setFullYear(today.getFullYear() + 2);
    const promoD = new Date(today);
    promoD.setFullYear(today.getFullYear() + 3);
    setNextStepDate(stepD.toISOString().substring(0, 10));
    setNextPromoDate(promoD.toISOString().substring(0, 10));
    setFeedbackMessage({
      type: 'success',
      text: t('ቀጣይ የእርከንና ማዕረግ ማግኛ ጊዜ በአውቶማቲክ ተሰልቷል! "ሴቭ አድርግ" የሚለውን ይጫኑ።', 'Dates auto-calculated! Click Save.')
    });
  };

  const handleGrantStepIncrementNow = async () => {
    if (window.confirm(t(`ለአባል ${member.identity.fullName} ቀጣይ እርከን መስጠት ይፈልጋሉ?`, `Grant next salary step increment to ${member.identity.fullName}?`))) {
      setIsSubmitting(true);
      const res = await applyStepIncrement(member.policeId);
      setIsSubmitting(false);
      setFeedbackMessage({ type: res.success ? 'success' : 'error', text: res.message });
    }
  };

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
  const [trCertRef, setTrCertRef] = useState(`CERT-POL-${Math.floor(Math.random() * 8000 + 1000)}`);
  const [trStatus, setTrStatus] = useState<'የተጠናቀቀ' | 'በሂደት ላይ' | 'የተመደበ'>('የተጠናቀቀ');
  const [trGrade, setTrGrade] = useState('እጅግ የላቀ (A)');

  // 4. Performance
  const [evalScore, setEvalScore] = useState(88);
  const [evalPeriod, setEvalPeriod] = useState('2018 ዓ.ም - 1ኛ ሩብ ዓመት');
  const [evalYear, setEvalYear] = useState(2026);
  const [evalRating, setEvalRating] = useState<'እጅግ የላቀ (90-100)' | 'ከፍተኛ (80-89)' | 'መካከለኛ (65-79)' | 'ዝቅተኛ (<65)'>('ከፍተኛ (80-89)');
  const [evalStrength, setEvalStrength] = useState('የስራ ዲሲፕሊንና ተልእኮዎችን በሰዓቱ ማጠናቀቅ');
  const [evalImprove, setEvalImprove] = useState('የሪፖርት አቀራረብ ክህሎትን ማሻሻል');
  const [evalDecision, setEvalDecision] = useState('ለማዕረግ እድገትና ተጨማሪ ኃላፊነት ብቁ ነው');
  const [evalSupName, setEvalSupName] = useState('ዋና ኢንስፔክተር ታደሰ በቀለ');
  const [evalSupRank, setEvalSupRank] = useState('ዋና ኢንስፔክተር');

  // 5. Leave
  const [leaveDays, setLeaveDays] = useState(10);
  const [leaveType, setLeaveType] = useState<any>('ዓመታዊ እረፍት');
  const [leaveStart, setLeaveStart] = useState('2026-10-05');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-15');
  const [leaveReason, setLeaveReason] = useState('ዓመታዊ ፈቃድ');

  // 6. Benefits
  const [benTitle, setBenTitle] = useState('የአደጋ ስጋት ልዩ አበል');
  const [benType, setBenType] = useState<'housing' | 'transport' | 'duty' | 'field' | 'medical' | 'hazard'>('hazard');
  const [benAmount, setBenAmount] = useState(1200);
  const [benStart, setBenStart] = useState('2026-10-01');
  const [benStatus, setBenStatus] = useState<'active' | 'inactive'>('active');
  const [benRemarks, setBenRemarks] = useState('የፀጥታ ስምሪት ሽፋን');

  // 7. Disciplinary
  const [discIncident, setDiscIncident] = useState('የስራ ሰዓት ያለፈቃድ ማሳለፍ');
  const [discMeasure, setDiscMeasure] = useState('የፅሁፍ ማስጠንቀቂያና የ100 ብር ቅጣት');
  const [discDate, setDiscDate] = useState(new Date().toISOString().substring(0, 10));
  const [discRef, setDiscRef] = useState(`DISC/BG/${new Date().getFullYear()}/${Math.floor(Math.random() * 500 + 100)}`);
  const [discStatus, setDiscStatus] = useState<'የተዘጋ' | 'በክትትል ላይ'>('የተዘጋ');

  // 8. Awards
  const [awdTitle, setAwdTitle] = useState('የላቀ የጀግንነት ሜዳሊያና የክብር ሰርተፊኬት');
  const [awdReason, setAwdReason] = useState('በህዳሴ ግድብ አካባቢ የህዝብ ሰላምና ደህንነት በማስከበር ላሳዩት የላቀ ጀግንነት');
  const [awdDate, setAwdDate] = useState(new Date().toISOString().substring(0, 10));
  const [awdBy, setAwdBy] = useState('የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽነር');
  const [awdRef, setAwdRef] = useState(`MED/HON/${new Date().getFullYear()}/${Math.floor(Math.random() * 400 + 100)}`);

  // 9. Salary adjustment
  const [adjGrade, setAdjGrade] = useState(member.salaryGrade);
  const [adjStep, setAdjStep] = useState(Math.min(9, member.salaryStep + 1));
  const [adjReason, setAdjReason] = useState('የዓመታዊ እርከን እድገት (Annual Step Increment)');

  // 10. Separation
  const [sepType, setSepType] = useState<SeparationType>('በጡረታ የተሰናበተ (Retirement)');
  const [sepReason, setSepReason] = useState('የህግ የጡረታ እድሜ በመድረሱ በክብር የተሰናበተ');
  const [sepRef, setSepRef] = useState(`DEC/SEP/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
  const [sepPension, setSepPension] = useState(true);
  const [sepPensionBook, setSepPensionBook] = useState(`PEN-BG-2026-${Math.floor(Math.random() * 9000 + 1000)}`);

  // 11. Document upload
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<any>('ደብዳቤ');
  const [docRef, setDocRef] = useState(`BG/POL/DOC/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
  const [docDate, setDocDate] = useState(new Date().toISOString().substring(0, 10));
  const [docNotes, setDocNotes] = useState('');

  // Calculate gross and net salary with live payroll engine
  const liveCalc = getCalculatedPayroll(member.policeId);
  const allowancesTotal = liveCalc
    ? liveCalc.allowances.totalAllowances
    : member.monthlyAllowances.duty +
      member.monthlyAllowances.field +
      member.monthlyAllowances.housing +
      member.monthlyAllowances.transport +
      member.monthlyAllowances.hazard +
      (member.monthlyAllowances.ration || 1500);
  const grossSalary = liveCalc ? liveCalc.grossSalary : member.baseSalary + allowancesTotal;
  const pensionDeduction = liveCalc
    ? liveCalc.deductions.pensionEmployee
    : Math.round(member.baseSalary * (member.pensionDeductionRate || 0.07));
  const taxDeduction = liveCalc
    ? liveCalc.deductions.incomeTax
    : Math.round(grossSalary * (member.taxDeductionRate || 0.15));
  const netSalary = liveCalc ? liveCalc.netPay : grossSalary - pensionDeduction - taxDeduction;

  const tabs = [
    { id: 'overview', label: t('አጠቃላይ መረጃ', 'Overview'), icon: User },
    { id: 'rank', label: t('የማዕረግ ታሪክ', 'Rank History'), icon: Award, count: member.rankHistory?.length },
    { id: 'salary', label: t('ደመወዝ & Payslip', 'Salary & Payslip'), icon: CreditCard },
    { id: 'transfers', label: t('ዝውውርና ምደባ', 'Postings & Transfers'), icon: PlaneTakeoff, count: member.transferHistory?.length },
    { id: 'training', label: t('ሥልጠናዎች', 'Training'), icon: GraduationCap, count: member.trainingHistory?.length },
    { id: 'performance', label: t('አፈጻጸም / Efficiency', 'Performance Appraisals'), icon: TrendingUp, count: member.performanceHistory?.length },
    { id: 'leave', label: t('የፈቃድ ማህደር', 'Leave Dossier'), icon: Calendar, count: member.leaveBalance?.annualRemaining },
    { id: 'benefits', label: t('ጥቅማጥቅም', 'Benefits'), icon: Gift, count: member.benefits?.length },
    { id: 'disciplinary', label: t('ዲሲፕሊን & ሽልማት', 'Discipline & Awards'), icon: AlertOctagon, count: (member.disciplinaryRecords?.length || 0) + (member.awardsAndHonors?.length || 0) },
    { id: 'separation', label: t('ስንብት & ጡረታ', 'Separation & Retirement'), icon: LogOut, highlight: member.separation !== undefined },
    { id: 'documents', label: t('ዲጂታል ሰነዶች', 'Documents Vault'), icon: FolderOpen, count: member.documents?.length }
  ];

  // Defined Dossier Folders (የአባሉ ዲጂታል ዶሴ ፎልደሮችና ፋይሎች)
  const DOSSIER_FOLDERS = [
    {
      id: 'folder_personal',
      nameAm: 'የግል ማህደርና ምደባ',
      nameEn: 'Personal & Career',
      icon: User,
      tabs: [
        { id: 'overview', label: t('አጠቃላይ መረጃ', 'Overview'), icon: User },
        { id: 'rank', label: t('የማዕረግ ታሪክ', 'Rank History'), icon: Award, count: member.rankHistory?.length },
        { id: 'transfers', label: t('ዝውውርና ምደባ', 'Postings & Transfers'), icon: PlaneTakeoff, count: member.transferHistory?.length }
      ]
    },
    {
      id: 'folder_training',
      nameAm: 'ስልጠናዎችና ትምህርት',
      nameEn: 'Trainings & Education',
      icon: GraduationCap,
      actionId: 'training',
      actionLabel: 'ስልጠና መዝግብ',
      tabs: [
        { id: 'training', label: t('ሥልጠናዎችና ኮርሶች', 'Training Dossier'), icon: GraduationCap, count: member.trainingHistory?.length }
      ]
    },
    {
      id: 'folder_performance',
      nameAm: 'የስራ አፈፃፀም / Efficiency',
      nameEn: 'Performance & Appraisals',
      icon: TrendingUp,
      actionId: 'performance',
      actionLabel: 'ምዘና አስገባ',
      tabs: [
        { id: 'performance', label: t('አፈጻጸም / Efficiency', 'Performance Appraisals'), icon: TrendingUp, count: member.performanceHistory?.length }
      ]
    },
    {
      id: 'folder_leave',
      nameAm: 'የፈቃድ ማህደር',
      nameEn: 'Leave Management',
      icon: Calendar,
      actionId: 'leave',
      actionLabel: 'ፈቃድ መዝግብ',
      tabs: [
        { id: 'leave', label: t('የፈቃድ ማህደርና ቀሪ', 'Leave Dossier'), icon: Calendar, count: member.leaveBalance?.annualRemaining }
      ]
    },
    {
      id: 'folder_payroll',
      nameAm: 'ደመወዝና ጥቅማጥቅም',
      nameEn: 'Payroll & Benefits',
      icon: CreditCard,
      actionId: 'benefit',
      actionLabel: 'ጥቅማጥቅም መዝግብ',
      tabs: [
        { id: 'salary', label: t('ደመወዝ & Payslip', 'Salary & Payslip'), icon: CreditCard },
        { id: 'benefits', label: t('ጥቅማጥቅምና አበል', 'Benefits & Allowances'), icon: Gift, count: member.benefits?.length }
      ]
    },
    {
      id: 'folder_conduct',
      nameAm: 'ዲስፕሊንና ሽልማት',
      nameEn: 'Discipline & Awards',
      icon: AlertOctagon,
      actionId: 'disciplinary',
      actionLabel: 'እርምጃ መዝግብ',
      tabs: [
        { id: 'disciplinary', label: t('ዲሲፕሊን & ሽልማት', 'Discipline & Awards'), icon: AlertOctagon, count: (member.disciplinaryRecords?.length || 0) + (member.awardsAndHonors?.length || 0) }
      ]
    },
    {
      id: 'folder_separation',
      nameAm: 'ስንብት፣ ጡረታና ሰነዶች',
      nameEn: 'Separation & Records',
      icon: LogOut,
      actionId: 'separation',
      actionLabel: 'ስንብት መዝግብ',
      tabs: [
        { id: 'separation', label: t('ስንብት & ጡረታ', 'Separation & Retirement'), icon: LogOut, highlight: member.separation !== undefined },
        { id: 'documents', label: t('ዲጂታል ሰነዶች (Vault)', 'Document Vault'), icon: FolderOpen, count: member.documents?.length }
      ]
    }
  ];

  // Active Folder State
  const initialFolder = DOSSIER_FOLDERS.find(f => f.tabs.some(t => t.id === initialTab))?.id || 'folder_personal';
  const [activeFolderId, setActiveFolderId] = useState<string>(initialFolder);
  const [showAllTabsMode, setShowAllTabsMode] = useState<boolean>(false);

  // Sync folder when activeTab changes
  useEffect(() => {
    const parentFolder = DOSSIER_FOLDERS.find(f => f.tabs.some(t => t.id === activeTab));
    if (parentFolder && parentFolder.id !== activeFolderId) {
      setActiveFolderId(parentFolder.id);
    }
  }, [activeTab]);

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

        {/* Dossier Folders & Files Navigation Header (የአባሉ ዲጂታል ዶሴ ፎልደሮች) */}
        <div className="bg-slate-950/95 border-b border-slate-800 px-4 pt-2.5 pb-2">
          {/* Top Folder Jackets */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                {t('የዶሴ ፎልደሮች፡', 'Dossier Folders:')}
              </span>
              {DOSSIER_FOLDERS.map(folder => {
                const isFolderActive = activeFolderId === folder.id;
                const totalCount = folder.tabs.reduce((sum, t) => sum + (t.count || 0), 0);
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setActiveFolderId(folder.id);
                      if (!folder.tabs.some(t => t.id === activeTab)) {
                        setActiveTab(folder.tabs[0].id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      isFolderActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Folder className={`w-3.5 h-3.5 ${isFolderActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{t(folder.nameAm, folder.nameEn)}</span>
                    {totalCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                        isFolderActive ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {totalCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle Button */}
            <button
              onClick={() => setShowAllTabsMode(!showAllTabsMode)}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex-shrink-0 transition-colors"
              title={showAllTabsMode ? t('በፎልደር መልክ እይ', 'Folder View') : t('ሁሉንም ርዕሶች ዘርዝር', 'All Tabs View')}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{showAllTabsMode ? t('በፎልደር መልክ', 'Folder View') : t('ሁሉንም ዘርዝር', 'All Tabs')}</span>
            </button>
          </div>

          {/* Sub-Files inside the Active Folder (or All Files in All Mode) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1.5 border-t border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
              <FileText className="w-3 h-3 text-slate-400" />
              {showAllTabsMode ? t('ሁሉም ፋይሎች፡', 'All Files:') : t('በዚህ ፎልደር ውስጥ ያሉ ፋይሎች፡', 'Files in this folder:')}
            </span>
            {(showAllTabsMode ? tabs : (DOSSIER_FOLDERS.find(f => f.id === activeFolderId)?.tabs || tabs)).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Admin Actions Bar for the 6 Core Categories */}
          {currentRole !== 'member' && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/60 mt-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                {t('አዲስ መረጃ መዝግብ፡', 'Quick Add:')}
              </span>
              <button
                onClick={() => setActionModal('training')}
                className="px-2.5 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white text-[11px] font-bold border border-blue-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <GraduationCap className="w-3 h-3" />
                <span>{t('+ ስልጠና መዝግብ', '+ Training')}</span>
              </button>
              <button
                onClick={() => setActionModal('performance')}
                className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <TrendingUp className="w-3 h-3" />
                <span>{t('+ አፈጻጸም ምዘና', '+ Appraisal')}</span>
              </button>
              <button
                onClick={() => setActionModal('leave')}
                className="px-2.5 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white text-[11px] font-bold border border-sky-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <Calendar className="w-3 h-3" />
                <span>{t('+ ፈቃድ መዝግብ', '+ Leave')}</span>
              </button>
              <button
                onClick={() => setActionModal('benefit')}
                className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <Gift className="w-3 h-3" />
                <span>{t('+ ጥቅማጥቅም', '+ Benefit')}</span>
              </button>
              <button
                onClick={() => setActionModal('disciplinary')}
                className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-bold border border-rose-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <AlertOctagon className="w-3 h-3" />
                <span>{t('+ ዲሲፕሊን', '+ Discipline')}</span>
              </button>
              <button
                onClick={() => setActionModal('award')}
                className="px-2.5 py-1 rounded-md bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-slate-950 text-[11px] font-bold border border-yellow-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <Award className="w-3 h-3" />
                <span>{t('+ ሽልማት', '+ Award')}</span>
              </button>
              <button
                onClick={() => setActionModal('separation')}
                className="px-2.5 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-[11px] font-bold border border-purple-500/30 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm"
              >
                <LogOut className="w-3 h-3" />
                <span>{t('+ ስንብት/ጡረታ', '+ Separation')}</span>
              </button>

              {(currentRole === 'hr_admin' || currentRole === 'management') && (
                <>
                  <button
                    onClick={() => setActionModal('edit_profile')}
                    className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 whitespace-nowrap shadow-sm transition-all ml-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{t('✏️ መረጃ አርትዕ', 'Edit Profile')}</span>
                  </button>
                  <button
                    onClick={() => setActionModal('delete_member')}
                    className="px-2.5 py-1 rounded-md bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-[11px] font-bold border border-rose-500/40 flex items-center gap-1 whitespace-nowrap transition-colors shadow-sm ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('🗑️ አባል ሰርዝ', 'Delete Member')}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {t('የአባሉ የግልና የአድራሻ መረጃ', 'Personal & Address Information')}
                    </h4>
                    {(currentRole === 'hr_admin' || currentRole === 'management') && (
                      <button
                        type="button"
                        onClick={() => setActionModal('edit_profile')}
                        className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{t('አድራሻ አርትዕ', 'Edit Address')}</span>
                      </button>
                    )}
                  </div>
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
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 block">{t('የስራ ሃላፊነት / መደብ', 'Job Responsibility / Position')}</span>
                        {(currentRole === 'hr_admin' || currentRole === 'management') && (
                          <button
                            type="button"
                            onClick={() => setActionModal('edit_profile')}
                            className="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>{t('አርትዕ', 'Edit')}</span>
                          </button>
                        )}
                      </div>
                      <span className="font-bold text-white block mt-0.5">{member.position}</span>
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

                {/* Duty Station Address & Commission Status Editor (Admin Manual Entry) */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t('የአባሉ ይፋዊ የስራ አድራሻና የኮሚሽን ፔሮል ምደባ', 'Duty Station & Commission Payroll Eligibility')}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {isCommissionStaff ? t('🏛️ የኮሚሽን ፔሮል አባል', 'Commission Staff') : t('📍 የዞን/ወረዳ ጣቢያ', 'Regional Station')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {t(
                      'አድሚኑ አባሉ የሚሰራበትን አድራሻ በማኑዋል ሞልቶ ያስገባል። በዝውውር ወደ ኮሚሽኑ ሲመጣና ሲዘዋወር አድሚኑ በማኑዋል ያስተካክላል። ፖሊስ ኮሚሽን ተብሎ የተሞላው ወደ ፔሮል ኦፊሰሩ እንዲገባ ይደረጋል።',
                      'Admin sets duty station. Members marked as Commission Staff automatically appear on the Payroll Officer roster.'
                    )}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        {t('የስራ ቦታ አድራሻ (Duty Station Address):', 'Duty Station Address:')}
                      </label>
                      <input
                        type="text"
                        value={dutyStationAddress}
                        onChange={e => setDutyStationAddress(e.target.value)}
                        placeholder="ለምሳሌ፡ የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ዋና መምሪያ - አሶሳ"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                        <input
                          type="checkbox"
                          checked={isCommissionStaff}
                          onChange={e => setIsCommissionStaff(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                        />
                        <span className="font-bold">
                          {t('ይህ አባል በፖሊስ ኮሚሽን ዋና መምሪያ የሚሰራ ነው (ወደ ፔሮል ኦፊሰሩ ይግባ)', 'Assign as Police Commission Staff (Include in Payroll Roster)')}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={handleSaveDutyStation}
                        disabled={isSubmitting}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t('አድራሻ ሴቭ አድርግ', 'Save Station')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step Increment & Rank Promotion Eligibility Dates Card */}
                <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t('የእርከንና የማዕረግ ማግኛ ጊዜያት ማስተዳደሪያ', 'Step Increment & Promotion Schedule')}</span>
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAutoComputeDates}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        title={t('ጊዜውን በራስ-ሰር አስላ', 'Auto-calculate dates based on tenure')}
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>{t('በአውቶማቲክ አስላ', 'Auto-Compute')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        {t('የእርከን ማግኛ ጊዜ (Next Step Date):', 'Next Step Increment Date:')}
                      </label>
                      <input
                        type="date"
                        value={nextStepDate}
                        onChange={e => setNextStepDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        {t('የማዕረግ ማግኛ ጊዜ (Next Promotion Date):', 'Next Rank Promotion Date:')}
                      </label>
                      <input
                        type="date"
                        value={nextPromoDate}
                        onChange={e => setNextPromoDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleGrantStepIncrementNow}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs rounded-lg border border-emerald-500/40 flex items-center gap-1 transition-all"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{t('እርከን ስጥ (Grant Step Now)', 'Grant Step')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveStepAndPromoDates}
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('ቀናትን ሴቭ አድርግ', 'Save Dates')}</span>
                    </button>
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

              {/* Dedicated Rank & Step Promotion Dates Scheduler inside Rank Tab (Requested by User) */}
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{t('የማዕረግ ማግኛ ጊዜና ያገኘበት ቀን ማስተዳደሪያ', 'Rank Acquisition & Next Promotion Eligibility Schedule')}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t(
                        'አድሚኑ አሁን ያለውን ማዕረግ ያገኘበትን ቀን ሲያስገባ ሲስተሙ ቀጣይ የሚያገኝበትን በራስ-ሰር ያዘጋጃል፤ ቀኑ ሲደርስ ለአባሉም ለአድሚኑም ኖቲፊኬሽን ይደርሳል!',
                        'Enter last promotion date to auto-project next eligibility. Automated notifications are sent to both Admin and Officer upon due date.'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoComputeFromLastPromo(lastPromoDate)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-1 transition-all"
                      title={t('ከያዘበት ቀን ጀምሮ 3 ዓመት ጨምረህ አስላ', 'Auto-project +3 years tenure')}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('ቀጣዩን በአውቶማቲክ አስላ', 'Auto-Calculate Next Date')}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* 1. አሁን ያለውን ማዕረግ ያገኘበት ቀን */}
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      1. {t('አሁን ያለውን ማዕረግ ያገኘበት ቀን:', 'Current Rank Effective Date:')}
                    </label>
                    <input
                      type="date"
                      value={lastPromoDate}
                      onChange={e => handleAutoComputeFromLastPromo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {t('ያለፈው ማዕረግ የተሰጠበት ቀን', 'Date rank was awarded')}
                    </span>
                  </div>

                  {/* 2. ቀጣይ ማዕረግ ማግኛ ጊዜ */}
                  <div>
                    <label className="text-amber-300 font-bold block mb-1">
                      2. {t('ቀጣይ ማዕረግ ማግኛ ጊዜ (Eligibility):', 'Next Rank Eligibility Date:')}
                    </label>
                    <input
                      type="date"
                      value={nextPromoDate}
                      onChange={e => setNextPromoDate(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold"
                    />
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      {t('ቀኑ ሲደርስ አውቶማቲክ ማንቂያ ይነሳል', 'Triggers dual notification alert')}
                    </span>
                  </div>

                  {/* 3. ያለፈው እርከን የተሰጠበት ቀን */}
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      3. {t('ያለፈው እርከን የተሰጠበት ቀን:', 'Last Step Increment Date:')}
                    </label>
                    <input
                      type="date"
                      value={lastStepDate}
                      onChange={e => setLastStepDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      ደረጃ {member.salaryGrade} · እርከን {member.salaryStep}
                    </span>
                  </div>

                  {/* 4. ቀጣይ እርከን ማግኛ ጊዜ */}
                  <div>
                    <label className="text-emerald-300 font-bold block mb-1">
                      4. {t('ቀጣይ እርከን ማግኛ ጊዜ:', 'Next Step Increment Date:')}
                    </label>
                    <input
                      type="date"
                      value={nextStepDate}
                      onChange={e => setNextStepDate(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold"
                    />
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      {t('የደመወዝ እርከን ጭማሪ ጊዜ', 'Salary step increment date')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{t('ሴቭ ሲባል ለአባሉም ለአድሚኑም በኖቲፊኬሽን ይላካል', 'Saves to file & delivers notification to Admin and Officer')}</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveStepAndPromoDates}
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('የማዕረግ ቀናትን ሴቭ አድርግ', 'Save Promotion Dates')}</span>
                  </button>
                </div>
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
                      <span className="font-mono text-white">{(liveCalc?.baseSalary ?? member.baseSalary).toLocaleString()} ETB</span>
                    </div>

                    {/* የቀለብ ብር (Ration Allowance) */}
                    <div className="flex justify-between bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                      <span className="text-amber-300 font-bold">⭐ {t('የቀለብ ብር (Ration)', 'Ration Allowance')}</span>
                      <span className="font-mono text-amber-300 font-bold">+{(liveCalc?.allowances.ration ?? member.monthlyAllowances.ration ?? 1500).toLocaleString()} ETB</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የስራ ኃላፊነት አበል', 'Duty Allowance')}</span>
                      <span className="font-mono text-slate-200">{(liveCalc?.allowances.duty ?? member.monthlyAllowances.duty).toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የሜዳ/ተልዕኮ አበል', 'Field Allowance')}</span>
                      <span className="font-mono text-slate-200">{(liveCalc?.allowances.field ?? member.monthlyAllowances.field).toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የቤት አበል', 'Housing Allowance')}</span>
                      <span className="font-mono text-slate-200">{(liveCalc?.allowances.housing ?? member.monthlyAllowances.housing).toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የትራንስፖርት አበል', 'Transport Allowance')}</span>
                      <span className="font-mono text-slate-200">{(liveCalc?.allowances.transport ?? member.monthlyAllowances.transport).toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('የስጋት (Hazard) አበል', 'Hazard Allowance')}</span>
                      <span className="font-mono text-slate-200">{(liveCalc?.allowances.hazard ?? member.monthlyAllowances.hazard).toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-emerald-400">
                      <span>{t('ጠቅላላ ገቢ (Gross Pay)', 'Total Gross')}</span>
                      <span className="font-mono">{grossSalary.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-1.5 text-xs">
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

                    {liveCalc && liveCalc.deductions.personalLoan > 0 && (
                      <div className="flex justify-between bg-rose-500/10 p-1 rounded">
                        <span className="text-rose-300 font-bold">{t('ከግል ብድር ቅነሳ', 'Personal Advance Loan')}</span>
                        <span className="font-mono text-rose-300 font-bold">-{liveCalc.deductions.personalLoan.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.selamBiruhSavings > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sky-300">{t('የሰላም ብሩህ ቁጠባ', 'Selam Biruh Savings')}</span>
                        <span className="font-mono text-sky-300">-{liveCalc.deductions.selamBiruhSavings.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.selamBiruhLotteryShare > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sky-300">{t('የሰላም ብሩህ ዕጣ ክፍያ', 'Selam Biruh Share')}</span>
                        <span className="font-mono text-sky-300">-{liveCalc.deductions.selamBiruhLotteryShare.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.selamBiruhLoan > 0 && (
                      <div className="flex justify-between">
                        <span className="text-rose-300">{t('የሰላም ብሩህ ብድር', 'Selam Biruh Loan')}</span>
                        <span className="font-mono text-rose-300">-{liveCalc.deductions.selamBiruhLoan.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.generalCreditLoan > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">{t('የብድርና ቁጠባ ብድር', 'SACCO Loan')}</span>
                        <span className="font-mono text-rose-300">-{liveCalc.deductions.generalCreditLoan.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.hivFund > 0 && (
                      <div className="flex justify-between">
                        <span className="text-emerald-300">{t('የኤችአይቪ ፈንድ', 'HIV Fund')}</span>
                        <span className="font-mono text-emerald-300">-{liveCalc.deductions.hivFund.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && (liveCalc.deductions.medical > 0 || liveCalc.deductions.healthInsurance > 0) && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('የህክምና መዋጮ', 'Medical Fund')}</span>
                        <span className="font-mono text-rose-300">-{(liveCalc.deductions.medical || liveCalc.deductions.healthInsurance).toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.other > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('ልዩ ልዩ/ሌሎች ቅነሳዎች', 'Other Deductions')}</span>
                        <span className="font-mono text-rose-300">-{liveCalc.deductions.other.toLocaleString()} ETB</span>
                      </div>
                    )}

                    {liveCalc && liveCalc.deductions.creditAssociation > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('የፖሊስ ክሬዲት ማህበር', 'Credit Union')}</span>
                        <span className="font-mono text-slate-300">-{liveCalc.deductions.creditAssociation.toLocaleString()} ETB</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-rose-400">
                      <span>{t('ጠቅላላ ተቀናሽ', 'Total Deductions')}</span>
                      <span className="font-mono">-{(liveCalc?.deductions.totalDeductions ?? (pensionDeduction + taxDeduction)).toLocaleString()} ETB</span>
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

                {currentRole !== 'member' && (
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

                {currentRole !== 'member' ? (
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

                {currentRole !== 'member' && (
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    {t('ጥቅማጥቅምና ልዩ አበሎች (Benefits & Entitlements)', 'Benefits & Allowances')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t('የመኖሪያ ቤት፣ የትራንስፖርት፣ የበረሃና የህክምና ጥቅማጥቅሞች ዝርዝር', 'Special monthly allowances and institutional benefit packages')}
                  </p>
                </div>

                {currentRole !== 'member' && (
                  <button
                    onClick={() => setActionModal('benefit')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('አዲስ ጥቅማጥቅም መዝግብ', 'Assign Benefit')}</span>
                  </button>
                )}
              </div>

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
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" />
                    {t('የዲሲፕሊን መዝገብ (Disciplinary Dossier)', 'Disciplinary Records')}
                  </h4>
                  {currentRole !== 'member' && (
                    <button
                      onClick={() => setActionModal('disciplinary')}
                      className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('እርምጃ መዝግብ', 'Log Action')}</span>
                    </button>
                  )}
                </div>

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
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {t('ሽልማቶችና የክብር ሜዳሊያዎች (Awards & Honors)', 'Honors & Citations')}
                  </h4>
                  {currentRole !== 'member' && (
                    <button
                      onClick={() => setActionModal('award')}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('ሽልማት መዝግብ', 'Grant Award')}</span>
                    </button>
                  )}
                </div>

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

                {!member.separation && currentRole !== 'member' && (
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
                  disabled={!sepReason.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await processServiceSeparation(member.policeId, {
                        type: sepType,
                        reason: sepReason,
                        decisionRef: sepRef,
                        pensionEligible: sepPension,
                        pensionBookRef: sepPension ? sepPensionBook : undefined
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'የአገልግሎት ስንብትና ጡረታ ሰነድ በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                      setActiveTab('separation');
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'ስንብቱን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ስንብት አጽድቅና በማህደር አስቀምጥ', 'Execute Separation & Save Dossier')}</span>
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
                    setFeedbackMessage({ type: 'success', text: t('ሰነዱ በማህደር ላይ በተሳካ ሁኔታ ተያይዟል!', 'Document successfully attached to dossier!') });
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

        {/* 6. Training Record Modal */}
        {actionModal === 'training' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  {t('አዲስ ስልጠናና የትምህርት ማስረጃ መዝግብ', 'Assign & Log Police Training')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የስልጠናው ርዕስ/ኮርስ', 'Training / Course Title')}</label>
                <input
                  type="text"
                  required
                  value={trTitle}
                  onChange={e => setTrTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ ዘመናዊ የወንጀል መከላከልና ማህበረሰብ ፖሊሲንግ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የስልጠና ዘርፍ/አይነት', 'Training Category')}</label>
                  <select
                    value={trType}
                    onChange={e => setTrType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="የወንጀል ምርመራ">የወንጀል ምርመራና ፎረንሲክ</option>
                    <option value="መሰረታዊ ወታደራዊ">መሰረታዊ ወታደራዊና ፖሊሳዊ</option>
                    <option value="የትራፊክ ቁጥጥር">የትራፊክ ደህንነትና ቁጥጥር</option>
                    <option value="ልዩ ኮማንዶ">ልዩ ፈጣን ኃይልና ኮማንዶ</option>
                    <option value="የአመራር ክህሎት">የአመራርና አስተዳደር ክህሎት</option>
                    <option value="የሰብዓዊ መብቶች">የሰብዓዊ መብትና ህግጋት</option>
                    <option value="የቴክኖሎጂ/ሳይበር">የኢንፎርሜሽን ቴክኖሎጂና ሳይበር</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ያሰለጠነው ተቋም/ኮሌጅ', 'Training Institution')}</label>
                  <input
                    type="text"
                    required
                    value={trInst}
                    onChange={e => setTrInst(e.target.value)}
                    placeholder="ለምሳሌ፡ የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሌጅ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጀመረበት ቀን', 'Start Date')}</label>
                  <input
                    type="date"
                    value={trStart}
                    onChange={e => setTrStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተጠናቀቀበት ቀን', 'End Date')}</label>
                  <input
                    type="date"
                    value={trEnd}
                    onChange={e => setTrEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ሁኔታ (Status)', 'Status')}</label>
                  <select
                    value={trStatus}
                    onChange={e => setTrStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="የተጠናቀቀ">የተጠናቀቀ</option>
                    <option value="በሂደት ላይ">በሂደት ላይ</option>
                    <option value="የተመደበ">የተመደበ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ውጤት / Grade', 'Grade / Score')}</label>
                  <input
                    type="text"
                    value={trGrade}
                    onChange={e => setTrGrade(e.target.value)}
                    placeholder="እጅግ የላቀ (A) / 95%"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሰርተፊኬት ቁጥር', 'Certificate Ref')}</label>
                  <input
                    type="text"
                    value={trCertRef}
                    onChange={e => setTrCertRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={!trTitle.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await assignTraining(member.policeId, {
                        title: trTitle,
                        trainingType: trType,
                        institution: trInst,
                        startDate: trStart,
                        endDate: trEnd,
                        status: trStatus,
                        gradeOrScore: trGrade,
                        certificateRef: trCertRef
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'ስልጠናው በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'ስልጠናውን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ስልጠና መዝግብና በማህደር አስቀምጥ', 'Save Training to Dossier')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Performance Evaluation Modal */}
        {actionModal === 'performance' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {t('የአፈጻጸም / Efficiency ምዘና ውጤት መዝግብ', 'Log Performance & Efficiency Appraisal')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የምዘና ወቅት (Period)', 'Evaluation Period')}</label>
                  <input
                    type="text"
                    required
                    value={evalPeriod}
                    onChange={e => setEvalPeriod(e.target.value)}
                    placeholder="ለምሳሌ፡ 2018 ዓ.ም - 1ኛ ሩብ ዓመት"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የምዘና ዓ.ም (Year)', 'Year')}</label>
                  <input
                    type="number"
                    value={evalYear}
                    onChange={e => setEvalYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('የተገኘ ውጤት (Score %)', 'Score (0-100%)')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={evalScore}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setEvalScore(val);
                      if (val >= 90) setEvalRating('እጅግ የላቀ (90-100)');
                      else if (val >= 80) setEvalRating('ከፍተኛ (80-89)');
                      else if (val >= 65) setEvalRating('መካከለኛ (65-79)');
                      else setEvalRating('ዝቅተኛ (<65)');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ደረጃ (Rating)', 'Appraisal Rating')}</label>
                  <select
                    value={evalRating}
                    onChange={e => setEvalRating(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="እጅግ የላቀ (90-100)">እጅግ የላቀ (90-100)</option>
                    <option value="ከፍተኛ (80-89)">ከፍተኛ (80-89)</option>
                    <option value="መካከለኛ (65-79)">መካከለኛ (65-79)</option>
                    <option value="ዝቅተኛ (<65)">ዝቅተኛ (&lt;65)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተመዘገበ ዋና ጥንካሬ', 'Key Strengths Observed')}</label>
                <textarea
                  rows={2}
                  value={evalStrength}
                  onChange={e => setEvalStrength(e.target.value)}
                  placeholder="ለምሳሌ፡ የስራ ሰዓት አክባሪነት፣ ተልዕኮዎችን በብቃት መወጣት..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('መሻሻል ያለበት ክፍተት', 'Areas for Improvement')}</label>
                <textarea
                  rows={2}
                  value={evalImprove}
                  onChange={e => setEvalImprove(e.target.value)}
                  placeholder="ለምሳሌ፡ የሪፖርት አቀራረብ ክህሎትን ማሻሻል..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ገምጋሚ ኃላፊ ስም', 'Supervisor Name')}</label>
                  <input
                    type="text"
                    value={evalSupName}
                    onChange={e => setEvalSupName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የኃላፊው ማዕረግ', 'Supervisor Rank')}</label>
                  <input
                    type="text"
                    value={evalSupRank}
                    onChange={e => setEvalSupRank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የመጨረሻ ውሳኔና አስተያየት', 'Decision / Recommendation')}</label>
                <input
                  type="text"
                  value={evalDecision}
                  onChange={e => setEvalDecision(e.target.value)}
                  placeholder="ለምሳሌ፡ ለማዕረግ እድገትና ተጨማሪ ኃላፊነት ብቁ ነው"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await submitPerformanceEvaluation(member.policeId, {
                        evaluationPeriod: evalPeriod,
                        year: evalYear,
                        score: Number(evalScore),
                        rating: evalRating,
                        strength: evalStrength,
                        improvementArea: evalImprove,
                        finalDecision: evalDecision,
                        supervisorName: evalSupName,
                        supervisorRank: evalSupRank,
                        date: new Date().toISOString().substring(0, 10)
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'የአፈጻጸም ምዘናው በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'ምዘናውን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ምዘና መዝግብና በማህደር አስቀምጥ', 'Save Evaluation to Dossier')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. Leave Dossier Modal */}
        {actionModal === 'leave' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  {t('የእረፍት ፈቃድ መዝግብና ፍቀድ', 'Grant & Log Leave Dossier')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የፈቃድ አይነት', 'Leave Type')}</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="ዓመታዊ እረፍት">ዓመታዊ እረፍት (Annual Leave)</option>
                  <option value="የህመም ፈቃድ">የህመም ፈቃድ (Sick Leave)</option>
                  <option value="የወሊድ ፈቃድ">የወሊድ ፈቃድ (Maternity Leave)</option>
                  <option value="የሀዘን ፈቃድ">የሀዘን ፈቃድ (Bereavement Leave)</option>
                  <option value="የጋብቻ ፈቃድ">የጋብቻ ፈቃድ (Marriage Leave)</option>
                  <option value="ልዩ ፈቃድ">ልዩ ተልዕኮ ፈቃድ (Special Leave)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የፈቃድ ቀናት ብዛት', 'Number of Days')}</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={leaveDays}
                  onChange={e => setLeaveDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የመነሻ ቀን', 'Start Date')}</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={e => setLeaveStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የማብቂያ ቀን', 'End Date')}</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={e => setLeaveEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የፈቃድ ምክንያትና ማብራሪያ', 'Reason & Details')}</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await addLeaveRecord(member.policeId, {
                        leaveType,
                        durationDays: Number(leaveDays),
                        startDate: leaveStart,
                        endDate: leaveEnd,
                        reason: leaveReason,
                        status: 'የተፈቀደ',
                        approvedBy: 'የሰው ኃይል አስተዳደርና ልማት',
                        approvedDate: new Date().toISOString().substring(0, 10)
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'የእረፍት ፈቃዱ በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'ፈቃዱን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ፈቃድ መዝግብና በማህደር አስቀምጥ', 'Save Leave to Dossier')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 9. Benefits Modal */}
        {actionModal === 'benefit' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  {t('አዲስ ጥቅማጥቅምና ልዩ አበል መዝግብ', 'Assign Institutional Benefit / Allowance')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጥቅማጥቅም ርዕስ', 'Benefit Title')}</label>
                <input
                  type="text"
                  required
                  value={benTitle}
                  onChange={e => setBenTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የአደጋ ስጋት ልዩ አበል"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጥቅማጥቅም አይነት', 'Benefit Type')}</label>
                  <select
                    value={benType}
                    onChange={e => setBenType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="hazard">የአደጋ ስጋት (Hazard)</option>
                    <option value="housing">የመኖሪያ ቤት ድጎማ (Housing)</option>
                    <option value="transport">የትራንስፖርት ድጎማ (Transport)</option>
                    <option value="duty">የስራ ኃላፊነት (Duty)</option>
                    <option value="field">የመስክ አበል (Field)</option>
                    <option value="medical">የህክምና ሽፋን (Medical)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የወር መጠን በብር', 'Monthly Amount (ETB)')}</label>
                  <input
                    type="number"
                    min={0}
                    value={benAmount}
                    onChange={e => setBenAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">0 ማለት ሙሉ ሽፋን (100% Covered) ነው</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሚጀምርበት ቀን', 'Effective Date')}</label>
                  <input
                    type="date"
                    value={benStart}
                    onChange={e => setBenStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ሁኔታ', 'Status')}</label>
                  <select
                    value={benStatus}
                    onChange={e => setBenStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="active">ገባሪ (Active)</option>
                    <option value="inactive">የማይንቀሳቀስ (Inactive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ተጨማሪ ማስታወሻ/ትዕዛዝ', 'Remarks / Authorization')}</label>
                <textarea
                  rows={2}
                  value={benRemarks}
                  onChange={e => setBenRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={!benTitle.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await addBenefitRecord(member.policeId, {
                        title: benTitle,
                        type: benType,
                        monthlyAmount: Number(benAmount),
                        startDate: benStart,
                        status: benStatus,
                        remarks: benRemarks
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'ጥቅማጥቅሙ በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'ጥቅማጥቅሙን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ጥቅማጥቅም መዝግብና በማህደር አስቀምጥ', 'Save Benefit to Dossier')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. Disciplinary Modal */}
        {actionModal === 'disciplinary' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  {t('የዲሲፕሊን ግድፈትና እርምጃ መዝግብ', 'Log Disciplinary Action Record')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተፈጸመው ጥፋት/ግድፈት', 'Incident / Infraction')}</label>
                <textarea
                  rows={2}
                  required
                  value={discIncident}
                  onChange={e => setDiscIncident(e.target.value)}
                  placeholder="ለምሳሌ፡ የስራ ሰዓት ያለፈቃድ ማሳለፍ፣ የትእዛዝ አለማክበር..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተወሰደ የቅጣት እርምጃ', 'Disciplinary Measure Taken')}</label>
                <input
                  type="text"
                  required
                  value={discMeasure}
                  onChange={e => setDiscMeasure(e.target.value)}
                  placeholder="ለምሳሌ፡ የፅሁፍ ማስጠንቀቂያና የ100 ብር ቅጣት"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተወሰነበት ቀን', 'Date')}</label>
                  <input
                    type="date"
                    value={discDate}
                    onChange={e => setDiscDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የውሳኔ ቁጥር (Verdict Ref)', 'Verdict Ref')}</label>
                  <input
                    type="text"
                    value={discRef}
                    onChange={e => setDiscRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የመዝገብ ሁኔታ', 'Status')}</label>
                <select
                  value={discStatus}
                  onChange={e => setDiscStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="የተዘጋ">የተዘጋ (Closed)</option>
                  <option value="በክትትል ላይ">በክትትል ላይ (Under Probation)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={!discIncident.trim() || !discMeasure.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await addDisciplinaryRecord(member.policeId, {
                        incident: discIncident,
                        measureTaken: discMeasure,
                        date: discDate,
                        verdictRef: discRef,
                        status: discStatus
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'የዲሲፕሊን እርምጃው በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'እርምጃውን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('እርምጃ መዝግብና በማህደር አስቀምጥ', 'Save Record to Dossier')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 11. Award Modal */}
        {actionModal === 'award' && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  {t('ሽልማትና የክብር ሜዳሊያ መዝግብ', 'Grant Award & Honor Citation')}
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሽልማት/ሜዳሊያ ስም', 'Award / Honor Title')}</label>
                <input
                  type="text"
                  required
                  value={awdTitle}
                  onChange={e => setAwdTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የላቀ የጀግንነት ሜዳሊያ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሽልማቱ ምክንያት / Citation', 'Reason / Citation')}</label>
                <textarea
                  rows={2}
                  required
                  value={awdReason}
                  onChange={e => setAwdReason(e.target.value)}
                  placeholder="ለምሳሌ፡ በህዳሴ ግድብ አካባቢ ላሳዩት የላቀ የጀግንነት ተጋድሎ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተሰጠበት ቀን', 'Date')}</label>
                  <input
                    type="date"
                    value={awdDate}
                    onChange={e => setAwdDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሰርተፊኬት/ሜዳሊያ ቁጥር', 'Certificate / Medal Ref')}</label>
                  <input
                    type="text"
                    value={awdRef}
                    onChange={e => setAwdRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የሰጠው የበላይ አካል', 'Awarded By')}</label>
                <input
                  type="text"
                  value={awdBy}
                  onChange={e => setAwdBy(e.target.value)}
                  placeholder="የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽነር"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-xs text-slate-400">
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  disabled={!awdTitle.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await addAwardRecord(member.policeId, {
                        title: awdTitle,
                        reason: awdReason,
                        date: awdDate,
                        awardedBy: awdBy,
                        medalOrCertRef: awdRef
                      });
                      setFeedbackMessage({ type: 'success', text: res.message || 'የክብር ሽልማቱ በማህደር በተሳካ ሁኔታ ተቀምጧል!' });
                      setActionModal(null);
                    } catch (err: any) {
                      setFeedbackMessage({ type: 'error', text: err?.message || 'ሽልማቱን ማስቀመጥ አልተቻለም' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ሽልማት መዝግብና በማህደር አስቀምጥ', 'Save Award to Dossier')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 12. Admin Full Profile Edit Modal (Custom Address, Job Responsibility, etc.) */}
        {actionModal === 'edit_profile' && (
          <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {t('የአባሉን ማህደርና የስራ መረጃ አርትዕ', 'Edit Member Profile & Responsibilities')}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {member.policeId} · {member.identity.fullName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMemberEdit} className="space-y-4">
                {/* 1. Job Responsibility / Position (Custom entry by admin) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
                  <label className="block text-slate-200 font-bold">
                    ⭐ {t('የስራ ሃላፊነት / የስራ መደብ (በአድሚኑ በነፃነት የሚሞላ) *', 'Job Responsibility / Role (Admin Custom Entry) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editPosition}
                    onChange={e => setEditPosition(e.target.value)}
                    placeholder="ለምሳሌ፡ የመረጃና ምርመራ መኮንን፣ የህዝብ ግንኙነት ኃላፊ..."
                    className="w-full bg-slate-900 border border-amber-400 rounded-lg px-3 py-2 text-white font-bold focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    {t('አድሚኑ ማንኛውንም የስራ ሃላፊነት በራሱ ፍላጎት በፅሁፍ እያስገባ ሴቭ ማድረግ ይችላል።', 'Enter any custom job role or title freely.')}
                  </p>
                </div>

                {/* 2. Official Duty Station & Commission Status */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-slate-200 font-bold">
                    ⭐ {t('ይፋዊ የስራ ቦታ አድራሻ (Duty Station Address - በነፃነት የሚሞላ):', 'Official Duty Station Address:')}
                  </label>
                  <input
                    type="text"
                    value={editDutyStation}
                    onChange={e => setEditDutyStation(e.target.value)}
                    placeholder="ለምሳሌ፡ የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ዋና መምሪያ - አሶሳ"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />

                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-300">
                    <input
                      type="checkbox"
                      checked={editIsCommission}
                      onChange={e => setEditIsCommission(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="font-semibold text-amber-300 text-[11px]">
                      {t('በፖሊስ ኮሚሽን ዋና መምሪያ ፔሮል ላይ ይመደብ (Commission Staff)', 'Commission Staff Payroll Eligibility')}
                    </span>
                  </label>
                </div>

                {/* 3. Names & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('ሙሉ ስም (አማርኛ):', 'Full Name (Amharic):')}</label>
                    <input
                      type="text"
                      required
                      value={editFullNameAm}
                      onChange={e => setEditFullNameAm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('ስልክ ቁጥር:', 'Phone Number:')}</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 4. Rank, Department & Station */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('ማዕረግ (Rank):', 'Rank:')}</label>
                    <select
                      value={editRank}
                      onChange={e => setEditRank(e.target.value as PoliceRank)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-bold"
                    >
                      <option value="ኮንስታብል">ኮንስታብል</option>
                      <option value="ረዳት ሳጅን">ረዳት ሳጅን</option>
                      <option value="ምክትል ሳጅን">ምክትል ሳጅን</option>
                      <option value="ሳጅን">ሳጅን</option>
                      <option value="ዋና ሳጅን">ዋና ሳጅን</option>
                      <option value="ረዳት ኢንስፔክተር">ረዳት ኢንስፔክተር</option>
                      <option value="ምክትል ኢንስፔክተር">ምክትል ኢንስፔክተር</option>
                      <option value="ዋና ኢንስፔክተር">ዋና ኢንስፔክተር</option>
                      <option value="ኮማንደር">ኮማንደር</option>
                      <option value="ረዳት ኮሚሽነር">ረዳት ኮሚሽነር</option>
                      <option value="ምክትል ኮሚሽነር">ምክትል ኮሚሽነር</option>
                      <option value="ኮሚሽነር">ኮሚሽነር</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('መምሪያ (Department):', 'Department:')}</label>
                    <select
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value as DepartmentName)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="የሰው ኃይል አስተዳደርና ልማት መምሪያ">የሰው ኃይል አስተዳደርና ልማት መምሪያ</option>
                      <option value="ወንጀል ምርመራ መምሪያ">ወንጀል ምርመራ መምሪያ</option>
                      <option value="ወንጀል መከላከልና ፓትሮል መምሪያ">ወንጀል መከላከልና ፓትሮል መምሪያ</option>
                      <option value="ትራፊክ ደህንነትና ቁጥጥር መምሪያ">ትራፊክ ደህንነትና ቁጥጥር መምሪያ</option>
                      <option value="ልዩ ፈጣን ኃይል መምሪያ">ልዩ ፈጣን ኃይል መምሪያ</option>
                      <option value="ሥልጠናና የፖሊስ ኮሌጅ">ሥልጠናና የፖሊስ ኮሌጅ</option>
                      <option value="ሎጂስቲክስና ንብረት አስተዳደር">ሎጂስቲክስና ንብረት አስተዳደር</option>
                      <option value="ፋይናንስና በጀት መምሪያ">ፋይናንስና በጀት መምሪያ</option>
                      <option value="የኮሚሽኑ ዋና አዛዥ ጽ/ቤት">የኮሚሽኑ ዋና አዛዥ ጽ/ቤት</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('ጣቢያ (Station):', 'Station:')}</label>
                    <select
                      value={editStation}
                      onChange={e => setEditStation(e.target.value as StationLocation)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="አሶሳ ዋና መምሪያ (Assosa HQ)">አሶሳ ዋና መምሪያ (Assosa HQ)</option>
                      <option value="አሶሳ ከተማ ፖሊስ መምሪያ">አሶሳ ከተማ ፖሊስ መምሪያ</option>
                      <option value="መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)">መተከል ዞን ፖሊስ መምሪያ</option>
                      <option value="ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)">ካማሺ ዞን ፖሊስ መምሪያ</option>
                      <option value="ባምባሲ ወረዳ ፖሊስ ጣቢያ">ባምባሲ ወረዳ ፖሊስ ጣቢያ</option>
                      <option value="ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)">ጉባ ወረዳ ፖሊስ ጣቢያ</option>
                    </select>
                  </div>
                </div>

                {/* 5. Residential Address (Custom entry by admin) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-slate-200 font-bold">
                    ⭐ {t('የመኖሪያ አድራሻ (በአድሚኑ በነፃነት የሚሞላ):', 'Residential Address:')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">{t('ክልል', 'Region')}</span>
                      <input
                        type="text"
                        value={editRegion}
                        onChange={e => setEditRegion(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">{t('ዞን', 'Zone')}</span>
                      <input
                        type="text"
                        value={editZone}
                        onChange={e => setEditZone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">{t('ወረዳ', 'Wereda')}</span>
                      <input
                        type="text"
                        value={editWereda}
                        onChange={e => setEditWereda(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">{t('ቀበሌ', 'Kebele')}</span>
                      <input
                        type="text"
                        value={editKebele}
                        onChange={e => setEditKebele(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('የአደጋ ጊዜ ተጠሪ ስም:', 'Emergency Contact:')}</label>
                    <input
                      type="text"
                      value={editEmergencyName}
                      onChange={e => setEditEmergencyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('የተጠሪ ስልክ:', 'Contact Phone:')}</label>
                    <input
                      type="text"
                      value={editEmergencyPhone}
                      onChange={e => setEditEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    {t('ሰርዝ', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? t('በማስቀመጥ ላይ...', 'Saving...') : t('ለውጦችን በማህደር አስቀምጥ', 'Save Profile Changes')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 13. Admin Delete Member Confirmation Modal */}
        {actionModal === 'delete_member' && (
          <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {t('የፖሊስ አባልን ከሲስተሙ ማጥፋት (Delete Officer)', 'Delete Police Officer')}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {member.identity.fullName} ({member.policeId})
                  </p>
                </div>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-[11px]">
                {t(
                  'ማስጠንቀቂያ፡ ይህ እርምጃ አባሉን ከማዕከላዊ የሰው ኃይል ሬጅስትሪና ከክላውድ ዳታቤዝ ሙሉ በሙሉ ይሰርዛል።',
                  'Warning: This action permanently removes this officer from the registry and cloud database.'
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('የማጥፋት ምክንያት (Reason for Deletion):', 'Reason for Deletion:')}
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder="ለምሳሌ፡ በስህተት የገባ ወይም የተሰረዘ መዝገብ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  {t('ተመለስ', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeleteMember}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isSubmitting ? t('በማጥፋት ላይ...', 'Deleting...') : t('አባል ከሲስተሙ ሰርዝ', 'Confirm Delete')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
