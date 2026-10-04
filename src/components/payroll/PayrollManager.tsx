import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  CreditCard,
  FileSpreadsheet,
  Download,
  Printer,
  Layers,
  Banknote,
  Search,
  CheckCircle,
  Eye,
  Sliders,
  Calculator,
  Save,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Users,
  ShieldCheck,
  Cloud,
  Settings,
  Bell,
  Send,
  AlertCircle,
  Calendar,
  Building,
  Check,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Shield
} from 'lucide-react';
import {
  MemberProfile,
  PoliceRank,
  RankSalaryGradeScale,
  PayrollGlobalConfig,
  MonthlyPayrollArchive,
  CalculatedOfficerPayroll,
  MemberPayrollCustomization
} from '../../types/hrms';
import { MemberPersonnelFileModal } from '../personnel/MemberPersonnelFileModal';
import { OfficerSalaryAdjustmentModal } from './OfficerSalaryAdjustmentModal';
import { HistoricalPayrollModal } from './HistoricalPayrollModal';
import { calculateOfficerPayroll, calculateMedicalContribution } from '../../utils/payrollCalculator';

export const PayrollManager: React.FC = () => {
  const {
    members,
    currentUser,
    currentRole,
    t,
    payrollConfig,
    salaryScales,
    memberPayrollCustomizations,
    updatePayrollConfig,
    updateSalaryScales,
    applyRankSalaryScaleToAllMembers,
    getCalculatedPayroll,
    commissionOnlyPayrollMembers,
    isCommissionOfficer,
    monthlyPayrollArchives,
    saveCurrentMonthlyPayrollArchive,
    quickAdjustSalaryByPoliceId,
    quickAdjustDeductionsByPoliceId,
    sendPayslipReadyNotification,
    notifyAllMembersPayrollReady,
    eligibleStepIncrementMembers,
    eligibleRankPromotionMembers,
    applyStepIncrement,
    getMemberByPoliceId
  } = useHrms();

  const [activeTab, setActiveTab] = useState<
    'payroll_sheet' | 'payroll_history' | 'quick_adjust' | 'scale_matrix' | 'deduction_rules'
  >('payroll_sheet');

  // Filter: Commission Staff Only by Default (ይህ ሲስተም የሚሰራው በፖሊስ ኮሚሽን ላሉት ነው)
  const [commissionOnly, setCommissionOnly] = useState<boolean>(true);
  const [tableStyle, setTableStyle] = useState<'yellow_official' | 'dark_modern'>('yellow_official');

  const [searchMember, setSearchMember] = useState('');
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('all');
  const [selectedMemberForPayslip, setSelectedMemberForPayslip] = useState<MemberProfile | null>(null);
  const [selectedMemberForAdjustment, setSelectedMemberForAdjustment] = useState<MemberProfile | null>(null);
  const [selectedArchiveForView, setSelectedArchiveForView] = useState<MonthlyPayrollArchive | null>(null);

  // Notification States
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [isNotifyingAll, setIsNotifyingAll] = useState(false);
  const [notifyingMemberId, setNotifyingMemberId] = useState<string | null>(null);

  // Archive creation state
  const [archiveMonthName, setArchiveMonthName] = useState('የመስከረም 2019 ዓ.ም (September 2026)');
  const [archiveNotes, setArchiveNotes] = useState('በፋየርስቶር በፋይል የተመዘገበ ይፋዊ የኮሚሽኑ ወርሃዊ ደመወዝ');
  const [isArchiving, setIsArchiving] = useState(false);

  // Quick Adjustment Tab state
  const [quickAdjId, setQuickAdjId] = useState('');
  const [quickAdjField, setQuickAdjField] = useState<
    'baseSalary' | 'ration' | 'duty' | 'hazard' | 'housing' | 'transport' | 'grade_step'
  >('baseSalary');
  const [quickAdjValue, setQuickAdjValue] = useState<number>(0);
  const [quickAdjStep, setQuickAdjStep] = useState<number>(1);
  const [quickAdjReason, setQuickAdjReason] = useState('');
  const [quickAdjStatus, setQuickAdjStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Institutional Deductions Tab state
  const [dedAdjId, setDedAdjId] = useState('');
  const [selamBiruhSavings, setSelamBiruhSavings] = useState<number>(0);
  const [selamBiruhLotteryShare, setSelamBiruhLotteryShare] = useState<number>(0);
  const [selamBiruhLoan, setSelamBiruhLoan] = useState<number>(0);
  const [generalCreditLoan, setGeneralCreditLoan] = useState<number>(0);
  const [personalLoan, setPersonalLoan] = useState<number>(0);
  const [hivFund, setHivFund] = useState<number>(0);
  const [medical, setMedical] = useState<number>(0);
  const [otherDeduction, setOtherDeduction] = useState<number>(0);
  const [dedAdjStatus, setDedAdjStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable scales local state for tab 4
  const [isEditingScale, setIsEditingScale] = useState(false);
  const [editableScales, setEditableScales] = useState<RankSalaryGradeScale[]>(salaryScales);
  const [scaleSaveStatus, setScaleSaveStatus] = useState<string | null>(null);

  // Global deduction rules local state for tab 5
  const [localRules, setLocalRules] = useState<PayrollGlobalConfig>(payrollConfig);
  const [rulesSaveStatus, setRulesSaveStatus] = useState<string | null>(null);

  // Eligible members for payroll
  const baseEligibleMembers = commissionOnly
    ? commissionOnlyPayrollMembers
    : members.filter(
        m => m.status === 'active' || m.status === 'on_leave' || m.status === 'transferred_pending'
      );

  const filteredPayrollMembers = baseEligibleMembers.filter(m => {
    const q = searchMember.toLowerCase();
    const matchesSearch =
      !q ||
      m.policeId.toLowerCase().includes(q) ||
      m.identity.fullName.toLowerCase().includes(q) ||
      m.currentRank.toLowerCase().includes(q) ||
      m.currentDepartment.toLowerCase().includes(q);

    const matchesRank = selectedRankFilter === 'all' || m.currentRank === selectedRankFilter;
    return matchesSearch && matchesRank;
  });

  // Calculate live institutional totals using automated calculator
  const computedList = baseEligibleMembers.map(m =>
    calculateOfficerPayroll(m, payrollConfig, memberPayrollCustomizations[m.policeId.toUpperCase()])
  );

  const totalBaseSalary = computedList.reduce((sum, item) => sum + item.baseSalary, 0);
  const totalRationAllowance = computedList.reduce((sum, item) => sum + (item.allowances.ration || 0), 0);
  const totalGrossPensionPool = computedList.reduce(
    (sum, item) => sum + Math.max(0, item.allowances.totalAllowances - (item.allowances.ration || 0)),
    0
  );
  const totalGross = computedList.reduce((sum, item) => sum + item.grossSalary, 0);
  const totalPensionEmployee = computedList.reduce((sum, item) => sum + item.deductions.pensionEmployee, 0);
  const totalIncomeTax = computedList.reduce((sum, item) => sum + item.deductions.incomeTax, 0);

  const totalOtherDeductions = computedList.reduce((sum, item) => {
    return (
      sum +
      (item.deductions.creditAssociation || 0) +
      (item.deductions.personalLoan || 0) +
      (item.deductions.selamBiruhSavings || 0) +
      (item.deductions.selamBiruhLotteryShare || 0) +
      (item.deductions.selamBiruhLoan || 0) +
      (item.deductions.generalCreditLoan || 0) +
      (item.deductions.hivFund || 0) +
      (item.deductions.medical || 0) +
      (item.deductions.other || 0) +
      (item.deductions.redCross || 0) +
      (item.deductions.courtPenalty || 0) +
      item.deductions.customItems.reduce((acc, c) => acc + c.amount, 0)
    );
  }, 0);

  const totalDeductions = totalIncomeTax + totalPensionEmployee + totalOtherDeductions;
  const totalNet = computedList.reduce((sum, item) => sum + item.netPay, 0);

  // Autofill quick adjustment tool when member ID changes
  const handleQuickAdjIdSearch = (id: string) => {
    setQuickAdjId(id);
    const m = getMemberByPoliceId(id);
    if (m) {
      const custom = memberPayrollCustomizations[m.policeId.toUpperCase()];
      if (quickAdjField === 'baseSalary') {
        setQuickAdjValue(custom?.customBaseSalary ?? m.baseSalary);
      } else if (quickAdjField === 'ration') {
        setQuickAdjValue(
          custom?.monthlyAllowances?.ration ?? m.monthlyAllowances?.ration ?? payrollConfig.defaultRationAllowance ?? 1500
        );
      } else if (quickAdjField === 'grade_step') {
        setQuickAdjValue(custom?.salaryGrade ?? m.salaryGrade ?? 1);
        setQuickAdjStep(custom?.salaryStep ?? m.salaryStep ?? 1);
      } else {
        setQuickAdjValue(
          (custom?.monthlyAllowances as any)?.[quickAdjField] ?? (m.monthlyAllowances as any)?.[quickAdjField] ?? 0
        );
      }
    }
  };

  // Submit quick salary adjustment
  const handleQuickAdjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdjId.trim()) return;

    const res = await quickAdjustSalaryByPoliceId(
      quickAdjId,
      quickAdjField,
      quickAdjValue,
      quickAdjField === 'grade_step' ? quickAdjStep : undefined,
      quickAdjReason
    );

    if (res.success) {
      setQuickAdjStatus({ type: 'success', text: res.message });
      setNotificationStatus(res.message);
      setTimeout(() => setQuickAdjStatus(null), 4000);
    } else {
      setQuickAdjStatus({ type: 'error', text: res.message });
    }
  };

  // Autofill deductions tool when member ID changes
  const handleDedIdSearch = (id: string) => {
    setDedAdjId(id);
    const m = getMemberByPoliceId(id);
    if (m) {
      const custom = memberPayrollCustomizations[m.policeId.toUpperCase()];
      setSelamBiruhSavings(custom?.selamBiruhSavings || 0);
      setSelamBiruhLotteryShare(custom?.selamBiruhLotteryShare || 0);
      setSelamBiruhLoan(custom?.selamBiruhLoan || 0);
      setGeneralCreditLoan(custom?.generalCreditLoan || 0);
      setPersonalLoan(custom?.personalLoanDeduction || 0);
      setHivFund(custom?.hivFundDeduction || 0);
      setMedical(
        custom?.medicalDeduction !== undefined
          ? custom.medicalDeduction
          : calculateMedicalContribution(custom?.customBaseSalary ?? m.baseSalary)
      );
      setOtherDeduction(custom?.otherDeductions || 0);
    }
  };

  // Submit quick deductions
  const handleDedAdjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dedAdjId.trim()) return;

    const res = await quickAdjustDeductionsByPoliceId(dedAdjId, {
      selamBiruhSavings,
      selamBiruhLotteryShare,
      selamBiruhLoan,
      generalCreditLoan,
      personalLoanDeduction: personalLoan,
      hivFundDeduction: hivFund,
      medicalDeduction: medical,
      otherDeductions: otherDeduction
    });

    if (res.success) {
      setDedAdjStatus({ type: 'success', text: res.message });
      setNotificationStatus(res.message);
      setTimeout(() => setDedAdjStatus(null), 4000);
    } else {
      setDedAdjStatus({ type: 'error', text: res.message });
    }
  };

  // Save current month to archive in Firestore
  const handleArchiveCurrentMonth = async () => {
    if (!archiveMonthName.trim()) return;
    setIsArchiving(true);
    const res = await saveCurrentMonthlyPayrollArchive(archiveMonthName, archiveNotes);
    setIsArchiving(false);
    setNotificationStatus(res.message);
  };

  // Export 13-columns CSV matching the user's uploaded image exactly
  const handleExportPayrollCsv = () => {
    const headers = [
      'id number',
      'ማዕረግ',
      'N AME',
      'GROSS',
      'NO.TAX',
      'Gross PENSION',
      'Total SALARY',
      'TAX',
      'PENSION',
      'other didaction',
      'Total DIDACTION',
      'Net PAY',
      'SIG.'
    ];

    const rows = computedList.map(item => {
      const gross = item.baseSalary;
      const noTax = item.allowances.ration || 0;
      const nonRation = Math.max(0, item.allowances.totalAllowances - noTax);
      const grossPension = nonRation;
      const totalSalary = gross + noTax + grossPension;
      const tax = item.deductions.incomeTax;
      const pension = item.deductions.pensionEmployee;
      const other =
        (item.deductions.creditAssociation || 0) +
        (item.deductions.personalLoan || 0) +
        (item.deductions.selamBiruhSavings || 0) +
        (item.deductions.selamBiruhLotteryShare || 0) +
        (item.deductions.selamBiruhLoan || 0) +
        (item.deductions.generalCreditLoan || 0) +
        (item.deductions.hivFund || 0) +
        (item.deductions.medical || 0) +
        (item.deductions.other || 0) +
        (item.deductions.redCross || 0) +
        (item.deductions.courtPenalty || 0) +
        item.deductions.customItems.reduce((acc, c) => acc + c.amount, 0);

      const totalDeduction = tax + pension + other;
      const netPay = totalSalary - totalDeduction;

      return [
        `"${item.policeId}"`,
        `"${item.rank}"`,
        `"${item.fullName}"`,
        gross,
        noTax,
        grossPension,
        totalSalary,
        tax,
        pension,
        other,
        totalDeduction,
        netPay,
        '""'
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `BG_Police_Commission_Official_Payroll_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNotifyAll = async () => {
    setIsNotifyingAll(true);
    setNotificationStatus(null);
    try {
      const res = await notifyAllMembersPayrollReady('የመስከረም 2019/2026');
      setNotificationStatus(res.message);
      setTimeout(() => setNotificationStatus(null), 5000);
    } catch (err: any) {
      setNotificationStatus(err.message || 'ስህተት ተከስቷል');
    } finally {
      setIsNotifyingAll(false);
    }
  };

  const handleNotifySingleMember = async (policeId: string) => {
    setNotifyingMemberId(policeId);
    try {
      const res = await sendPayslipReadyNotification(policeId, 'የመስከረም 2019/2026');
      setNotificationStatus(res.message);
      setTimeout(() => setNotificationStatus(null), 4000);
    } catch (err: any) {
      setNotificationStatus(err.message || 'ስህተት ተከስቷል');
    } finally {
      setNotifyingMemberId(null);
    }
  };

  // Handle scale step change in edit mode
  const handleScaleStepChange = (grade: number, stepIndex: number, newAmount: number) => {
    setEditableScales(prev =>
      prev.map(scale => {
        if (scale.grade === grade) {
          const newSteps = [...scale.steps];
          newSteps[stepIndex] = Math.max(0, newAmount);
          return { ...scale, steps: newSteps };
        }
        return scale;
      })
    );
  };

  const handleSaveScalesToFirestore = async () => {
    setScaleSaveStatus('saving');
    const res = await updateSalaryScales(editableScales);
    if (res.success) {
      setScaleSaveStatus('saved');
      setIsEditingScale(false);
      setTimeout(() => setScaleSaveStatus(null), 3000);
    } else {
      setScaleSaveStatus('error');
    }
  };

  const handleBatchApplyRankScale = async (scale: RankSalaryGradeScale, stepIndex: number) => {
    const salary = scale.steps[stepIndex];
    const confirmMsg = t(
      `ይህን እርምጃ ማረጋገጥ ይፈልጋሉ? \nየማዕረግ: ${scale.rank} (ደረጃ ${scale.grade}, እርከን ${stepIndex + 1}) \nአዲስ ደመወዝ: ${salary.toLocaleString()} ብር ለሁሉም ተዛማጅ አባላት ይተገበራል።`,
      `Apply salary ETB ${salary.toLocaleString()} to all active officers with rank ${scale.rank} (Grade ${scale.grade})?`
    );

    if (window.confirm(confirmMsg)) {
      const res = await applyRankSalaryScaleToAllMembers(scale.rank, scale.grade, stepIndex, salary);
      alert(res.message);
    }
  };

  const handleSaveRulesToFirestore = async () => {
    setRulesSaveStatus('saving');
    const res = await updatePayrollConfig(localRules);
    if (res.success) {
      setRulesSaveStatus('saved');
      setTimeout(() => setRulesSaveStatus(null), 3000);
    } else {
      setRulesSaveStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Firestore Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20 uppercase tracking-wider">
              {t('የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ፔሮል', 'Commission Payroll Engine')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <Cloud className="w-3 h-3" />
              <span>{t('በፋየርስቶር በቀጥታ የሚቀመጥ (Cloud Synced)', 'Firestore Cloud Synced')}</span>
            </span>
            {commissionOnly ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                <Building className="w-3 h-3" />
                <span>{t('የፖሊስ ኮሚሽን አባላት ብቻ (ኮሚሽን ፔሮል)', 'Commission Staff Only')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                <span>{t('ሁሉም የክልሉ ፖሊስ አባላት', 'All Regional Police Force')}</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወር ደመወዝና ጥቅማጥቅም ፔሮል', 'Benishangul Gumuz Police Commission Monthly Payroll')}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            {t(
              'በኮሚሽኑ ለተመደቡ አባላት ወርሃዊ ደመወዝ፣ የቀለብ ብር፣ ተቋማዊ ቅነሳዎችና ግብር በህጉ መሰረት ተሰልተው በወር በፋይል የሚቀመጡበት ስርዓት።',
              'Official commission payroll calculation, tax & statutory deductions, ration allowances, and monthly historical archiving.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Commission vs All Regional Force Switch */}
          <button
            onClick={() => setCommissionOnly(!commissionOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow ${
              commissionOnly
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={t('የኮሚሽኑን ብቻ ወይም ሁሉንም የክልሉን ፖሊሶች ለማየት', 'Filter Commission Staff vs All Force')}
          >
            <Building className="w-4 h-4" />
            <span>
              {commissionOnly
                ? t('🏢 የኮሚሽኑ ብቻ (አሁን የነቃ)', 'Commission Only')
                : t('🌐 የክልሉ በሙሉ', 'All Regional')}
            </span>
          </button>

          {/* Quick Archive Current Month Action */}
          <button
            onClick={handleArchiveCurrentMonth}
            disabled={isArchiving}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
            title={t('የዚህን ወር ደመወዝ በማህደር በፋየርስቶር መዝግብና ፋይል አድርግ', 'Archive this month to Firestore')}
          >
            <Save className={`w-4 h-4 ${isArchiving ? 'animate-spin' : ''}`} />
            <span>{isArchiving ? t('በማህደር ላይ...', 'Archiving...') : t('የዚህን ወር ደመወዝ በፋይል መዝግብ', 'Archive Month')}</span>
          </button>

          {/* Automatic Notification to All Members */}
          <button
            onClick={handleNotifyAll}
            disabled={isNotifyingAll}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all border border-amber-500/30 active:scale-95 disabled:opacity-50"
            title={t('ለአባላት በሙሉ ወርሃዊ የደመወዝ ስሊፕ ዝግጁ መሆኑን ማሳወቂያ ላክ', 'Alert all members automatically')}
          >
            <Bell className={`w-4 h-4 ${isNotifyingAll ? 'animate-bounce' : ''}`} />
            <span>
              {isNotifyingAll ? t('በመላክ ላይ...', 'Sending...') : t('ስሊፕ አሳውቅ', 'Notify Officers')}
            </span>
          </button>

          <button
            onClick={handleExportPayrollCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('Excel / CSV አውርድ', 'Export CSV')}</span>
          </button>
        </div>
      </div>

      {/* Promotion & Step Increment Due Banner Alerts */}
      {(eligibleStepIncrementMembers.length > 0 || eligibleRankPromotionMembers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eligibleStepIncrementMembers.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    {t('እርከን የሚያገኙ አባላት (Step Increment Due)', 'Step Increment Due')}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {eligibleStepIncrementMembers.length} {t('አባላት የእርከን ማግኛ ጊዜያቸው ደርሷል', 'officers are eligible for salary step increment')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg">
                  {eligibleStepIncrementMembers.length}
                </span>
              </div>
            </div>
          )}

          {eligibleRankPromotionMembers.length > 0 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-300">
                    {t('ማዕረግ የሚያገኙ አባላት (Rank Promotion Due)', 'Rank Promotion Due')}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {eligibleRankPromotionMembers.length} {t('አባላት የማዕረግ እድገት ማግኛ ጊዜያቸው ደርሷል', 'officers reached minimum tenure for next rank')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-blue-500 text-white px-2 py-0.5 rounded-lg">
                  {eligibleRankPromotionMembers.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification Feedback Banner */}
      {notificationStatus && (
        <div className="bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{notificationStatus}</span>
          </div>
          <button
            onClick={() => setNotificationStatus(null)}
            className="text-xs text-emerald-400 hover:text-white underline font-semibold ml-4"
          >
            {t('ዝጋ', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Aggregate Financial Highlights KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {commissionOnly ? t('የኮሚሽኑ ተከፋዮች', 'Commission Staff') : t('ጠቅላላ ተከፋዮች', 'Total Officers')}
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">{baseEligibleMembers.length}</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {commissionOnly ? t('በኮሚሽኑ ዋና መ/ቤት', 'At Commission HQ') : t('በክልሉ በሙሉ', 'Regional Force')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('መሰረታዊ (GROSS)', 'Total Gross Base')}
          </span>
          <div className="text-lg font-black text-white font-mono mt-1">
            {totalBaseSalary.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ETB</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 bg-amber-500/5 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-amber-300 uppercase block">
            ⭐ {t('የቀለብ ብር (NO.TAX)', 'Ration (No Tax)')}
          </span>
          <div className="text-lg font-black text-amber-400 font-mono mt-1">
            +{totalRationAllowance.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">
            {t('ከግብር ነፃ አበል', 'Tax-free allowance')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ጥቅማጥቅም (Gross PENSION)', 'Gross Pension Pool')}
          </span>
          <div className="text-lg font-black text-slate-200 font-mono mt-1">
            +{totalGrossPensionPool.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ETB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ጠቅላላ (Total SALARY)', 'Total Salary')}
          </span>
          <div className="text-lg font-black text-white font-mono mt-1">
            {totalGross.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ETB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ጠቅላላ ቅነሳ (Total DIDACTION)', 'Total Deductions')}
          </span>
          <div className="text-lg font-black text-rose-400 font-mono mt-1">
            -{totalDeductions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t('ግብር + ጡረታ + ሌሎች', 'Tax + Pension + Other')}
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-2xl col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase block">
            {t('የተጣራ (Net PAY)', 'Total Net Pay')}
          </span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {totalNet.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t('ለአባላት በቀጥታ ተከፋይ', 'Net Take-Home')}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('payroll_sheet')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'payroll_sheet'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>{t('1. የወር ደመወዝ ሉህ (ሰንጠረዥ)', '1. Payroll Sheet')}</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll_history')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'payroll_history'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {t('2. የወር ደመወዝ ማህደርና ፋይሎች', '2. Monthly Payroll Archives')}
            {monthlyPayrollArchives.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-300">
                {monthlyPayrollArchives.length}
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quick_adjust')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'quick_adjust'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{t('3. ፈጣን ደመወዝ ማስተካከያ በID', '3. Quick Adjustment by ID')}</span>
        </button>

        <button
          onClick={() => setActiveTab('scale_matrix')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'scale_matrix'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t('4. የደመወዝ ስኬል ማትሪክስ', '4. Scale Matrix')}</span>
        </button>

        <button
          onClick={() => setActiveTab('deduction_rules')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'deduction_rules'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{t('5. ተቋማዊ ቅነሳዎችና ግብር በID', '5. Deductions & Tax by ID')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAYROLL SHEET WITH THE EXACT 13 COLUMNS FROM USER'S IMAGE */}
      {/* ========================================================================= */}
      {activeTab === 'payroll_sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>
                  {commissionOnly
                    ? t('የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ወርሃዊ የደመወዝ ሰነድ (ኮሚሽን ፔሮል)', 'Police Commission Official Payroll Roster')
                    : t('የቤኒሻንጉል ጉሙዝ ፖሊስ አባላት ጠቅላላ የወር ክፍያ ሰነድ', 'Force-Wide Compensation Roster')}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t(
                  'ከዚህ በታች ያለው ሰንጠረዥ በሰጡት ኦፊሴላዊ ፎርማት መሰረት ወደ ጎን የተደረደሩ 13 ዓምዶችን ይዟል።',
                  '13 official columns rendered exactly matching the Commission payroll standard.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Table Style Switcher */}
              <button
                onClick={() => setTableStyle(tableStyle === 'yellow_official' ? 'dark_modern' : 'yellow_official')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-700 text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
                title={t('የሰንጠረዥ ቀለም ገፅታ ቀይር', 'Toggle Yellow Spreadsheet vs Dark Theme')}
              >
                <span>{tableStyle === 'yellow_official' ? '💛 ቢጫ ኦፊሴላዊ' : '🌙 ዳርክ ሞድ'}</span>
              </button>

              <select
                value={selectedRankFilter}
                onChange={e => setSelectedRankFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">{t('ሁሉም ማዕረጎች', 'All Ranks')}</option>
                {Array.from(new Set(baseEligibleMembers.map(m => m.currentRank))).map(rank => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchMember}
                  onChange={e => setSearchMember(e.target.value)}
                  placeholder={t('አባል ፈልግ (ስም፣ ID)...', 'Search officer...')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* THE EXACT 13 COLUMNS TABLE AS IN USER'S UPLOADED IMAGE */}
          <div className="overflow-x-auto border-2 border-black rounded-xl shadow-lg">
            <table className="w-full text-left text-xs border-collapse min-w-[1280px]">
              {/* Exact Headers in order: id number | ማዕረግ | N AME | GROSS | NO.TAX | Gross PENSION | Total SALARY | TAX | PENSION | other didaction | Total DIDACTION | Net PAY | SIG. */}
              <thead>
                <tr
                  className={
                    tableStyle === 'yellow_official'
                      ? 'bg-[#ffff00] text-black font-black uppercase text-center border-b-2 border-black divide-x-2 divide-black text-[11px]'
                      : 'bg-slate-950 text-slate-300 font-bold uppercase text-center border-b border-slate-800 divide-x divide-slate-800 text-[11px]'
                  }
                >
                  <th className="py-3 px-2 whitespace-nowrap">id number</th>
                  <th className="py-3 px-2 whitespace-nowrap">ማዕረግ</th>
                  <th className="py-3 px-3 text-left whitespace-nowrap">N AME</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">GROSS</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">NO.TAX</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Gross PENSION</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Total SALARY</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">TAX</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">PENSION</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">other didaction</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Total DIDACTION</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Net PAY</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">SIG.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/30 bg-slate-950/90 text-slate-200">
                {filteredPayrollMembers.map(m => {
                  const calc = calculateOfficerPayroll(
                    m,
                    payrollConfig,
                    memberPayrollCustomizations[m.policeId.toUpperCase()]
                  );

                  const gross = calc.baseSalary;
                  const noTax = calc.allowances.ration || 0;
                  const nonRation = Math.max(0, calc.allowances.totalAllowances - noTax);
                  const grossPension = nonRation;
                  const totalSalary = gross + noTax + grossPension;

                  const tax = calc.deductions.incomeTax;
                  const pension = calc.deductions.pensionEmployee;
                  const other =
                    (calc.deductions.creditAssociation || 0) +
                    (calc.deductions.personalLoan || 0) +
                    (calc.deductions.selamBiruhSavings || 0) +
                    (calc.deductions.selamBiruhLotteryShare || 0) +
                    (calc.deductions.selamBiruhLoan || 0) +
                    (calc.deductions.generalCreditLoan || 0) +
                    (calc.deductions.hivFund || 0) +
                    (calc.deductions.medical || 0) +
                    (calc.deductions.other || 0) +
                    (calc.deductions.redCross || 0) +
                    (calc.deductions.courtPenalty || 0) +
                    calc.deductions.customItems.reduce((acc, c) => acc + c.amount, 0);

                  const totalDeductionsCalc = tax + pension + other;
                  const netPay = totalSalary - totalDeductionsCalc;
                  const isCommission = isCommissionOfficer(m);

                  return (
                    <tr
                      key={m.policeId}
                      className="hover:bg-slate-800/60 transition-colors divide-x divide-black/20 border-b border-black/20"
                    >
                      {/* 1. id number */}
                      <td className="py-2 px-2 text-center font-mono font-bold text-amber-400 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedMemberForAdjustment(m)}
                          className="hover:underline flex items-center justify-center gap-1 mx-auto"
                          title={t('ለዚህ አባል ደመወዝ/ቅነሳዎችን አስተካክል', 'Adjust officer salary')}
                        >
                          <span>{m.policeId}</span>
                        </button>
                      </td>

                      {/* 2. ማዕረግ */}
                      <td className="py-2 px-2 text-center text-slate-300 whitespace-nowrap font-medium">
                        {m.currentRank}
                      </td>

                      {/* 3. N AME */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={m.identity.photoUrl}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-white block">{m.identity.fullName}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              {isCommission ? (
                                <span className="text-amber-400">🏛️ ኮሚሽን</span>
                              ) : (
                                <span className="text-slate-500">📍 ዞን/ወረዳ</span>
                              )}
                              <span>· G{calc.grade}/S{calc.step}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. GROSS */}
                      <td className="py-2 px-2 text-right font-mono font-semibold text-white whitespace-nowrap">
                        {gross.toLocaleString()}
                      </td>

                      {/* 5. NO.TAX */}
                      <td className="py-2 px-2 text-right font-mono font-bold text-amber-300 whitespace-nowrap">
                        {noTax > 0 ? `+${noTax.toLocaleString()}` : '0'}
                      </td>

                      {/* 6. Gross PENSION */}
                      <td className="py-2 px-2 text-right font-mono text-slate-300 whitespace-nowrap">
                        {grossPension > 0 ? `+${grossPension.toLocaleString()}` : '0'}
                      </td>

                      {/* 7. Total SALARY */}
                      <td className="py-2 px-2 text-right font-mono font-black text-white whitespace-nowrap bg-slate-900/50">
                        {totalSalary.toLocaleString()}
                      </td>

                      {/* 8. TAX */}
                      <td className="py-2 px-2 text-right font-mono text-rose-400 whitespace-nowrap">
                        -{tax.toLocaleString()}
                      </td>

                      {/* 9. PENSION */}
                      <td className="py-2 px-2 text-right font-mono text-rose-400 whitespace-nowrap">
                        -{pension.toLocaleString()}
                      </td>

                      {/* 10. other didaction */}
                      <td className="py-2 px-2 text-right font-mono text-sky-300 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedMemberForAdjustment(m)}
                          className="hover:underline"
                          title={t('ዝርዝር ቅነሳዎችን ለመመልከት/ለማረም ጠቅ ያድርጉ', 'Click to view/edit itemized deductions')}
                        >
                          -{other.toLocaleString()}
                        </button>
                      </td>

                      {/* 11. Total DIDACTION */}
                      <td className="py-2 px-2 text-right font-mono font-bold text-rose-400 whitespace-nowrap bg-rose-500/10">
                        -{totalDeductionsCalc.toLocaleString()}
                      </td>

                      {/* 12. Net PAY */}
                      <td className="py-2 px-2 text-right font-mono font-black text-emerald-400 whitespace-nowrap bg-emerald-500/10 text-sm">
                        {netPay.toLocaleString()}
                      </td>

                      {/* 13. SIG. */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedMemberForPayslip(m)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors"
                            title={t('የደመወዝ ስሊፕ አሳይ', 'View Payslip')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleNotifySingleMember(m.policeId)}
                            disabled={notifyingMemberId === m.policeId}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                            title={t('ለአባሉ ስሊፕ ዝግጁ መሆኑን አሳውቅ', 'Notify member payslip ready')}
                          >
                            <Bell className={`w-3.5 h-3.5 ${notifyingMemberId === m.policeId ? 'animate-spin' : ''}`} />
                          </button>
                          <div className="w-12 border-b border-dashed border-slate-600 inline-block h-3" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Total Footer */}
              <tfoot>
                <tr className="bg-amber-400/20 text-white font-black border-t-2 border-black divide-x-2 divide-black text-right">
                  <td colSpan={3} className="py-3 px-3 text-center uppercase tracking-wider text-xs">
                    {t('ጠቅላላ ድምር (GRAND TOTAL)', 'Grand Total')}
                  </td>
                  <td className="py-3 px-2 font-mono">{totalBaseSalary.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono text-amber-300">+{totalRationAllowance.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono">+{totalGrossPensionPool.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono font-black text-white">{totalGross.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono text-rose-300">-{totalIncomeTax.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono text-rose-300">-{totalPensionEmployee.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono text-sky-300">-{totalOtherDeductions.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono font-black text-rose-400">-{totalDeductions.toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono font-black text-emerald-400 text-sm">{totalNet.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center text-[10px] text-slate-400">ETB</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY PAYROLL ARCHIVE & DOWNLOADABLE FILES (PDF & EXCEL) */}
      {/* ========================================================================= */}
      {activeTab === 'payroll_history' && (
        <div className="space-y-6">
          {/* Create & Archive Current Month Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{t('የዚህን ወር ደመወዝ በፋይል መዝግብና ሴቭ አድርግ', 'Archive Current Month to Firestore File')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t(
                    'ደመወዝ ሲሰራ በወር መቀመጥ አለበት፤ የወር የተሰራው በፋይል ይቀመጣል። እያንዳንዱ ወር እንደ ቋሚ ታሪክ በፋየርስቶር ይቀመጣል።',
                    'Calculated salaries are permanently recorded per month in Cloud Firestore as distinct downloadable records.'
                  )}
                </p>
              </div>

              <button
                onClick={handleArchiveCurrentMonth}
                disabled={isArchiving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isArchiving ? 'animate-spin' : ''}`} />
                <span>{isArchiving ? t('በመመዝገብ ላይ...', 'Saving Archive...') : t('ይህን ወር በፋይል ሴቭ አድርግ', 'Save Month Archive')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {t('የወሩ ስም (Month Title):', 'Month Title:')}
                </label>
                <input
                  type="text"
                  value={archiveMonthName}
                  onChange={e => setArchiveMonthName(e.target.value)}
                  placeholder="ለምሳሌ፡ የመስከረም 2019 ዓ.ም (September 2026)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {t('የማህደር ማስታወሻ (Archive Remarks):', 'Archive Remarks:')}
                </label>
                <input
                  type="text"
                  value={archiveNotes}
                  onChange={e => setArchiveNotes(e.target.value)}
                  placeholder="የኮሚሽኑ ወርሃዊ ይፋዊ ክፍያ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* List of Past Months Stored as Files in Firestore */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{t('በፋየርስቶር የተቀመጡ የወር ክፍያ ፋይሎች (Saved Historical Archives)', 'Archived Monthly Payroll Files')}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {monthlyPayrollArchives.length} {t('የተመዘገቡ ወራት', 'months archived')}
              </span>
            </div>

            {monthlyPayrollArchives.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h5 className="font-bold text-white text-sm">
                  {t('ምንም የተቀመጠ ወርሃዊ የደመወዝ ፋይል የለም', 'No monthly payroll archives saved yet')}
                </h5>
                <p className="mt-1">
                  {t(
                    'ከላይ "ይህን ወር በፋይል ሴቭ አድርግ" የሚለውን በመጫን የወሩን ፔሮል በክላውድ ፋይልነት ማስቀመጥ ይችላሉ።',
                    'Click "Save Month Archive" above to snapshot this month into a permanent Firestore record.'
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {monthlyPayrollArchives.map(arch => (
                  <div
                    key={arch.id}
                    className="p-5 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {arch.id}
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                          ✓ {t('በፋየርስቶር የፀደቀ ፋይል', 'Stored in Firestore')}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{arch.monthName}</h4>
                      <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{t('ያዘጋጀው ባለሙያ:', 'By:')} <strong className="text-slate-200">{arch.processedBy}</strong></span>
                        <span>·</span>
                        <span>{t('የተመዘገበበት ቀን:', 'Date:')} <strong className="text-slate-200 font-mono">{arch.createdAt}</strong></span>
                        <span>·</span>
                        <span>{t('ተከፋይ አባላት:', 'Officers:')} <strong className="text-amber-300 font-mono">{arch.totalOfficers}</strong></span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">{t('ጠቅላላ ደመወዝ', 'Gross')}</span>
                        <span className="text-white font-bold">{arch.totalGrossSalary.toLocaleString()} ETB</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400 block font-sans">{t('ጠቅላላ ቅነሳ', 'Deductions')}</span>
                        <span className="text-rose-400 font-bold">-{arch.totalDeductions.toLocaleString()} ETB</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 block font-sans">{t('የተጣራ ክፍያ', 'Net Pay')}</span>
                        <span className="text-emerald-400 font-black text-sm">{arch.totalNetPay.toLocaleString()} ETB</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => setSelectedArchiveForView(arch)}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title={t('የተቀመጠውን ወር ሰንጠረዥ ተመልከት', 'Preview Sheet')}
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('ሰንጠረዥ እይ', 'View')}</span>
                      </button>

                      <button
                        onClick={() => setSelectedArchiveForView(arch)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                        title={t('ይፋዊ የክፍያ ሰነድ አትም / PDF', 'Print Voucher')}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t('አትም / PDF', 'Print')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUICK SALARY ADJUSTMENT BY MEMBER ID (WITHOUT BROWSING SHEET) */}
      {/* ========================================================================= */}
      {activeTab === 'quick_adjust' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>{t('በየወሩ የሚስተካከሉ ደመወዞች ፈጣን ማስተካከያ በID', 'Quick Monthly Salary Adjustment by Officer ID')}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              {t(
                'ኦፊሰሩ በራሱ የሚስተካከሉትን ብቻ ፔሮል ላይ ሳይገባ አይዲ ቁጥራቸውን ብቻ በመፃፍ የሚስተካከለውን አርዕስት በመጥቀስ አስተካክሎ ሴቭ ሲል ቀጥታ ፔሮል ላይ እንዲስተካከል ያድርጉ። የሚስተካከል ከሌለ ቀደም ሲል የተከፈለው እንደነበረ ይቀመጣል።',
                'Fast lookup by Police ID without navigating the wide sheet. Select the item to adjust and save; unchanged members retain previous paid amounts.'
              )}
            </p>
          </div>

          {quickAdjStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                quickAdjStatus.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{quickAdjStatus.text}</span>
            </div>
          )}

          <form onSubmit={handleQuickAdjSubmit} className="space-y-4 max-w-2xl bg-slate-950 p-6 rounded-2xl border border-slate-800">
            {/* Step 1: Member ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                1. {t('የአባሉ የፖሊስ መታወቂያ ቁጥር (Police ID):', 'Officer Police ID:')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={quickAdjId}
                  onChange={e => handleQuickAdjIdSearch(e.target.value)}
                  placeholder="ለምሳሌ፡ BG-000101 ወይም BG-000125"
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleQuickAdjIdSearch(quickAdjId)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
                >
                  {t('ፈልግ', 'Find')}
                </button>
              </div>
            </div>

            {/* Display Officer Info If Found */}
            {getMemberByPoliceId(quickAdjId) && (
              <div className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center gap-3">
                <img
                  src={getMemberByPoliceId(quickAdjId)?.identity.photoUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-amber-400"
                />
                <div className="text-xs">
                  <h4 className="font-bold text-white text-sm">{getMemberByPoliceId(quickAdjId)?.identity.fullName}</h4>
                  <p className="text-slate-400 font-mono text-[11px]">
                    {getMemberByPoliceId(quickAdjId)?.currentRank} · {getMemberByPoliceId(quickAdjId)?.currentDepartment}
                  </p>
                  <span className="text-amber-400 text-[10px]">
                    {isCommissionOfficer(getMemberByPoliceId(quickAdjId)!)
                      ? '🏛️ የፖሊስ ኮሚሽን አባል'
                      : '📍 የዞን/ወረዳ አባል'}
                  </span>
                </div>
              </div>
            )}

            {/* Step 2: Choose Adjustment Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. {t('የሚስተካከለው አርዕስት (Adjustment Field):', 'Adjustment Field:')}
                </label>
                <select
                  value={quickAdjField}
                  onChange={e => {
                    const f = e.target.value as any;
                    setQuickAdjField(f);
                    handleQuickAdjIdSearch(quickAdjId);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="baseSalary">GROSS - መሰረታዊ ደመወዝ</option>
                  <option value="ration">NO.TAX - የቀለብ አበል (Food/Ration)</option>
                  <option value="duty">Gross PENSION - የስራ/ተልዕኮ አበል (Duty Allowance)</option>
                  <option value="hazard">Gross PENSION - የአደጋ አበል (Hazard)</option>
                  <option value="housing">Gross PENSION - የቤት አበል (Housing)</option>
                  <option value="transport">Gross PENSION - የትራንስፖርት አበል (Transport)</option>
                  <option value="grade_step">ደረጃና እርከን (Salary Grade & Step)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  3. {t('አዲሱ መጠን (New Amount ETB):', 'New Amount (ETB):')}
                </label>
                <input
                  type="number"
                  required
                  value={quickAdjValue}
                  onChange={e => setQuickAdjValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            {quickAdjField === 'grade_step' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t('እርከን (Step 1-9):', 'Step (1-9):')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={quickAdjStep}
                  onChange={e => setQuickAdjStep(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('የማስተካከያው ምክንያት ወይም ማስታወሻ (Reason / Notes):', 'Reason / Notes:')}
              </label>
              <input
                type="text"
                value={quickAdjReason}
                onChange={e => setQuickAdjReason(e.target.value)}
                placeholder="ለምሳሌ፡ የወርሃዊ አበል ጭማሪ"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t('አስተካክለህ በማህደር ሴቭ አድርግ (Save Adjustment to Payroll)', 'Save Adjustment to Payroll')}</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SALARY SCALE MATRIX (GRADES 1-10 & STEPS 1-9) */}
      {/* ========================================================================= */}
      {activeTab === 'scale_matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t('የቤኒሻንጉል ጉሙዝ ፖሊስ ደመወዝ ስኬል በደረጃና በማዕረግ', 'Official Commission Salary Scale Matrix')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  'ባለሙያው ለእያንዳንዱ ማዕረግና ደረጃ የመሰረታዊ ደመወዝ መጠን አስገብቶ የሚያስተካክልበት፤ በማዕከላዊ ማህደር ተቀምጦ ለሁሉም አባላት የሚተገበር።',
                  'HR Specialist can adjust grade/step base salaries and batch apply to all active officers.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditingScale ? (
                <>
                  <button
                    onClick={() => {
                      setEditableScales(salaryScales);
                      setIsEditingScale(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    {t('ሰርዝ', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveScalesToFirestore}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('ማትሪክስ አስቀምጥ', 'Save Matrix')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingScale(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('ስኬል አርትዕ / ቀይር', 'Edit Scale Matrix')}</span>
                </button>
              )}
            </div>
          </div>

          {scaleSaveStatus === 'saved' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('የደመወዝ ስኬል ማትሪክስ በማህደር በተሳካ ሁኔታ ተቀምጧል!', 'Salary scales saved successfully!')}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">{t('ደረጃና ማዕረግ (Grade & Rank)', 'Grade & Rank')}</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                    <th key={s} className="py-2.5 px-3 text-right">Step {s}</th>
                  ))}
                  <th className="py-2.5 px-3 text-center">{t('ለአባላት ተግብር', 'Batch Apply')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {(isEditingScale ? editableScales : salaryScales).map(scale => {
                  return (
                    <tr key={scale.grade} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white whitespace-nowrap">
                        <span className="font-mono text-amber-400 mr-2">G{scale.grade}</span>
                        <span className="text-slate-200 text-xs font-bold">{scale.rank}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({scale.rankEn})</span>
                      </td>

                      {scale.steps.map((amount, sIdx) => (
                        <td key={sIdx} className="py-2 px-2 text-right">
                          {isEditingScale ? (
                            <input
                              type="number"
                              value={amount}
                              onChange={e =>
                                handleScaleStepChange(scale.grade, sIdx, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-right text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                            />
                          ) : (
                            <span className="text-slate-300 font-mono">{amount.toLocaleString()}</span>
                          )}
                        </td>
                      ))}

                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleBatchApplyRankScale(scale, 0)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded text-[11px] font-sans font-semibold inline-flex items-center gap-1 transition-all"
                          title={t('የዚህ ማዕረግ አባላትን ደመወዝ በሙሉ አዘምን', 'Update all officers of this rank')}
                        >
                          <Users className="w-3 h-3" />
                          <span>{t('ለሁሉም ተግብር', 'Apply')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DEDUCTION & TAX RULES + INSTITUTIONAL DEDUCTIONS BY MEMBER ID */}
      {/* ========================================================================= */}
      {activeTab === 'deduction_rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>{t('የቅነሳዎችና ግብር ህግጋት ማዋቀሪያ (Deduction & Tax Engine)', 'Deductions & Tax Engine')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  'ተቋማዊ ወርሃዊ መዋጮዎች ላይ ኦፊሰሩ በአይዲ ቁጥራቸው መሰረት ሲያስገባ ሴቭ ሲል ሲስተሙ በራሱ ፔሮል ላይ የሚያስተካክልበት መሳሪያ።',
                  'Standard institutional deductions entry by member ID, automatically recalculated on live payroll.'
                )}
              </p>
            </div>

            <button
              onClick={handleSaveRulesToFirestore}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{t('ህግጋቱን አስቀምጥ', 'Save Deduction Rules')}</span>
            </button>
          </div>

          {rulesSaveStatus === 'saved' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('የደመወዝ ህግጋት በማህደር በተሳካ ሁኔታ ተቀምጠዋል!', 'Deduction rules saved successfully!')}</span>
            </div>
          )}

          {/* Section 1: STANDARD INSTITUTIONAL DEDUCTIONS ENTRY BY POLICE ID (Requested by user) */}
          <div className="bg-slate-950 border border-amber-500/30 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>
                    ⭐ {t('ተቋማዊ ወርሃዊ መዋጮዎች በአይዲ ቁጥር ማስገቢያና በፔሮል ላይ ማስተካከያ (STANDARD INSTITUTIONAL DEDUCTIONS)', 'Standard Deductions by Officer ID')}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t(
                    'ኦፊሰሩ በአይዲ ቁጥራቸው መሰረት የተለያዩ ተቋማዊ ቅነሳዎችን ሲያስገባና ሴቭ ሲል ሲስተሙ በራሱ ፔሮል ላይ other deduction አምድን በቀጥታ ያዘምናል',
                    'Enter member ID to update specific monthly deductions. The system updates the live payroll other didaction column.'
                  )}
                </p>
              </div>
            </div>

            {dedAdjStatus && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  dedAdjStatus.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{dedAdjStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleDedAdjSubmit} className="space-y-4">
              {/* Member ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t('የአባሉ መታወቂያ ቁጥር (Officer Police ID):', 'Officer Police ID:')}
                </label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    required
                    value={dedAdjId}
                    onChange={e => handleDedIdSearch(e.target.value)}
                    placeholder="ለምሳሌ፡ BG-000101"
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => handleDedIdSearch(dedAdjId)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
                  >
                    {t('አባል ፈልግ', 'Find Officer')}
                  </button>
                </div>
              </div>

              {getMemberByPoliceId(dedAdjId) && (
                <div className="p-3 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center gap-3">
                  <img
                    src={getMemberByPoliceId(dedAdjId)?.identity.photoUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border border-amber-400"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">{getMemberByPoliceId(dedAdjId)?.identity.fullName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {getMemberByPoliceId(dedAdjId)?.currentRank} · {getMemberByPoliceId(dedAdjId)?.policeId}
                    </span>
                  </div>
                </div>
              )}

              {/* Deductions Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Selam Biruh Savings */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {t('የሰላም ብሩህ ወርሃዊ ቁጠባ', 'Selam Biruh Monthly Savings')}
                  </label>
                  <input
                    type="number"
                    value={selamBiruhSavings}
                    onChange={e => setSelamBiruhSavings(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 2. Selam Biruh Lottery Share */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {t('የሰላም ብሩህ የእጣ ክፍያ', 'Selam Biruh Share/Lottery')}
                  </label>
                  <input
                    type="number"
                    value={selamBiruhLotteryShare}
                    onChange={e => setSelamBiruhLotteryShare(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 3. Selam Biruh Loan */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {t('የሰላም ብሩህ ብድር ቅነሳ', 'Selam Biruh Loan Repayment')}
                  </label>
                  <input
                    type="number"
                    value={selamBiruhLoan}
                    onChange={e => setSelamBiruhLoan(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4. General SACCO Loan */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {t('አጠቃላይ የብድርና ቁጠባ ብድር', 'General SACCO Loan')}
                  </label>
                  <input
                    type="number"
                    value={generalCreditLoan}
                    onChange={e => setGeneralCreditLoan(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 5. Personal Loan */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-rose-300 font-bold block mb-1">
                    {t('ከግል ብድር ቅነሳ (Personal Loan)', 'Personal Advance Loan')}
                  </label>
                  <input
                    type="number"
                    value={personalLoan}
                    onChange={e => setPersonalLoan(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-rose-300 text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 6. HIV Fund */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-emerald-300 font-bold block mb-1">
                    {t('የኤችአይቪ ፈንድ መዋጮ', 'HIV/AIDS Contribution')}
                  </label>
                  <input
                    type="number"
                    value={hivFund}
                    onChange={e => setHivFund(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-emerald-300 text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 7. Medical Contribution */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-300 font-bold block">
                      {t('የህክምና መዋጮ', 'Medical Contribution')}
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">15–50 ETB</span>
                  </div>
                  <input
                    type="number"
                    value={medical}
                    onChange={e => setMedical(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-right focus:outline-none focus:border-amber-500 font-bold"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    &le;2000: 15 | 2001–5000: 25 | 5001–7500: 35 | 7501–11000: 40 | &gt;11000: 50
                  </p>
                </div>

                {/* 8. Other Deductions */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {t('ልዩ ልዩ / ሌሎች ቅነሳዎች', 'Other Custom Deductions')}
                  </label>
                  <input
                    type="number"
                    value={otherDeduction}
                    onChange={e => setOtherDeduction(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-right focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Total Other Deduction Preview */}
              <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  {t('በዚህ አባል ፔሮል ላይ የሚመዘገብ ጠቅላላ other didaction:', 'Total other didaction to apply:')}
                </span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {(
                    selamBiruhSavings +
                    selamBiruhLotteryShare +
                    selamBiruhLoan +
                    generalCreditLoan +
                    personalLoan +
                    hivFund +
                    medical +
                    otherDeduction
                  ).toLocaleString()} ETB
                </span>
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{t('በፔሮል ላይ መዝግብና ሴቭ አድርግ (Save Deductions to Live Payroll)', 'Save Deductions to Payroll')}</span>
              </button>
            </form>
          </div>

          {/* Section 2: Statutory Pension Rates */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('የመንግስት ሰራተኞችና የፖሊስ ጡረታ መዋጮ ምጣኔ (Pension Contribution Rates)', 'Pension Rates')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {t('የሰራተኛው የጡረታ መዋጮ ምጣኔ (Employee Pension %):', 'Employee Pension Rate (%):')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={localRules.pensionEmployeeRate * 100}
                    onChange={e =>
                      setLocalRules({
                        ...localRules,
                        pensionEmployeeRate: (parseFloat(e.target.value) || 0) / 100
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {t('በህግ የተደነገገው መደበኛ ምጣኔ 7% ነው', 'Standard statutory rate is 7%')}
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {t('የአሰሪው / የተቋሙ የጡረታ ድርሻ (Employer Contribution %):', 'Employer Contribution Rate (%):')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={localRules.pensionEmployerRate * 100}
                    onChange={e =>
                      setLocalRules({
                        ...localRules,
                        pensionEmployerRate: (parseFloat(e.target.value) || 0) / 100
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {t('በመንግስት/በተቋሙ የሚሸፈነው የጡረታ ድርሻ 33% ነው', 'Statutory government/employer share is 33%')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Progressive Ethiopian Tax Brackets */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>{t('የኢትዮጵያ የገቢ ግብር አዋጅ የደረጃ ሰንጠረዥ (Ethiopian Progressive Tax Brackets)', 'Income Tax Brackets')}</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">{t('የደመወዝ እርከን (ብር)', 'Monthly Income Bracket')}</th>
                    <th className="py-2 px-3 text-right">{t('የግብር ምጣኔ (%)', 'Tax Rate')}</th>
                    <th className="py-2 px-3 text-right">{t('ተቀናሽ (ብር)', 'Constant Deduction')}</th>
                    <th className="py-2 px-3 text-right">{t('ቀመር / ስሌት', 'Formula')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                  {localRules.taxBrackets.map(b => (
                    <tr key={b.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 font-semibold text-white">
                        {b.maxIncome === null
                          ? `ከ ${b.minIncome.toLocaleString()} ብር በላይ`
                          : `${b.minIncome.toLocaleString()} – ${b.maxIncome.toLocaleString()} ብር`}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400">
                        {(b.rate * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 px-3 text-right">
                        {b.deduction.toLocaleString()} ETB
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 font-sans text-[11px]">
                        {b.rate === 0
                          ? 'ነፃ (0 ETB)'
                          : `(ደመወዝ × ${(b.rate * 100).toFixed(0)}%) - ${b.deduction} ETB`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Officer Salary & Deduction Adjustment Modal */}
      {selectedMemberForAdjustment && (
        <OfficerSalaryAdjustmentModal
          member={selectedMemberForAdjustment}
          isOpen={!!selectedMemberForAdjustment}
          onClose={() => setSelectedMemberForAdjustment(null)}
        />
      )}

      {/* Member Payslip Modal */}
      {selectedMemberForPayslip && (
        <MemberPersonnelFileModal
          member={selectedMemberForPayslip}
          initialTab="salary"
          onClose={() => setSelectedMemberForPayslip(null)}
        />
      )}

      {/* Historical Payroll Archive Modal for Previewing and Printing past months */}
      {selectedArchiveForView && (
        <HistoricalPayrollModal
          archive={selectedArchiveForView}
          isOpen={!!selectedArchiveForView}
          onClose={() => setSelectedArchiveForView(null)}
        />
      )}
    </div>
  );
};
