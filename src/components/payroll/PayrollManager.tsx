import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  CreditCard,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronDown,
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
  Settings
} from 'lucide-react';
import {
  MemberProfile,
  PoliceRank,
  RankSalaryGradeScale,
  PayrollGlobalConfig
} from '../../types/hrms';
import { MemberPersonnelFileModal } from '../personnel/MemberPersonnelFileModal';
import { OfficerSalaryAdjustmentModal } from './OfficerSalaryAdjustmentModal';
import { calculateOfficerPayroll } from '../../utils/payrollCalculator';

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
    allCalculatedPayrolls
  } = useHrms();

  const [activeTab, setActiveTab] = useState<
    'payroll_sheet' | 'officer_calculator' | 'scale_matrix' | 'deduction_rules'
  >('payroll_sheet');

  const [searchMember, setSearchMember] = useState('');
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('all');
  const [selectedMemberForPayslip, setSelectedMemberForPayslip] = useState<MemberProfile | null>(null);
  const [selectedMemberForAdjustment, setSelectedMemberForAdjustment] = useState<MemberProfile | null>(null);

  // Editable scales local state for tab 3
  const [isEditingScale, setIsEditingScale] = useState(false);
  const [editableScales, setEditableScales] = useState<RankSalaryGradeScale[]>(salaryScales);
  const [scaleSaveStatus, setScaleSaveStatus] = useState<string | null>(null);

  // Global deduction rules local state for tab 4
  const [localRules, setLocalRules] = useState<PayrollGlobalConfig>(payrollConfig);
  const [rulesSaveStatus, setRulesSaveStatus] = useState<string | null>(null);

  // Eligible members for payroll (active duty and on leave)
  const payrollMembers = members.filter(
    m => m.status === 'active' || m.status === 'on_leave' || m.status === 'transferred_pending'
  );

  const filteredPayrollMembers = payrollMembers.filter(m => {
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
  const computedList = payrollMembers.map(m =>
    calculateOfficerPayroll(m, payrollConfig, memberPayrollCustomizations[m.policeId.toUpperCase()])
  );

  const totalBaseSalary = computedList.reduce((sum, item) => sum + item.baseSalary, 0);
  const totalAllowances = computedList.reduce((sum, item) => sum + item.allowances.totalAllowances, 0);
  const totalGross = computedList.reduce((sum, item) => sum + item.grossSalary, 0);
  const totalPensionEmployee = computedList.reduce((sum, item) => sum + item.deductions.pensionEmployee, 0);
  const totalPensionEmployer = computedList.reduce((sum, item) => sum + item.deductions.pensionEmployer, 0);
  const totalIncomeTax = computedList.reduce((sum, item) => sum + item.deductions.incomeTax, 0);
  const totalOtherDeductions = computedList.reduce((sum, item) => {
    return (
      sum +
      item.deductions.creditAssociation +
      item.deductions.healthInsurance +
      item.deductions.redCross +
      item.deductions.courtPenalty +
      item.deductions.customItems.reduce((acc, c) => acc + c.amount, 0)
    );
  }, 0);
  const totalDeductions = computedList.reduce((sum, item) => sum + item.deductions.totalDeductions, 0);
  const totalNet = computedList.reduce((sum, item) => sum + item.netPay, 0);

  const handleExportPayrollCsv = () => {
    const headers = [
      'Police ID',
      'Officer Name',
      'Rank',
      'Department',
      'Grade',
      'Step',
      'Base Salary ETB',
      'Total Allowances ETB',
      'Gross Pay ETB',
      'Pension Deduction (7%)',
      'Income Tax ETB',
      'Other Deductions ETB',
      'Total Deductions ETB',
      'Net Pay ETB'
    ];

    const rows = computedList.map(item => {
      const other =
        item.deductions.creditAssociation +
        item.deductions.healthInsurance +
        item.deductions.redCross +
        item.deductions.courtPenalty;

      return [
        `"${item.policeId}"`,
        `"${item.fullName}"`,
        `"${item.rank}"`,
        `"${item.department}"`,
        item.grade,
        item.step,
        item.baseSalary,
        item.allowances.totalAllowances,
        item.grossSalary,
        item.deductions.pensionEmployee,
        item.deductions.incomeTax,
        other,
        item.deductions.totalDeductions,
        item.netPay
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
      `Begu_Police_Official_Payroll_Sheet_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
              {t('የደመወዝና ጥቅማጥቅም አስተዳደር ማዕከል', 'Automated Payroll & Compensation Engine')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <Cloud className="w-3 h-3" />
              <span>{t('በፋየርስቶር የተገናኘ (Cloud Synced)', 'Firestore Cloud Connected')}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            {t('የቤኒሻንጉል ጉሙዝ ፖሊስ አባላት የደመወዝ ማስተካከያና ስሌት', 'Police Force Salary Adjustment & Live Payroll')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            {t(
              'የደመወዝ መጠን፣ አበሎች፣ የጡረታና ግብር ቅነሳዎች አንዴ በባለሙያ ተዋቅረው በሲስተሙ በራስ-ሰር የሚሰሉበት እና በማዕረግ ደረጃ የሚቀመጥበት የክላውድ ስርዓት።',
              'HR specialist salary scale input, dynamic deductions engine, automated live net pay calculation, and real-time Firestore persistence.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPayrollCsv}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('የወር ፔይሮል Excel አውርድ', 'Export Payroll Sheet')}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial Highlights KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ተከፋይ አባላት', 'Paid Officers')}
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">{payrollMembers.length}</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {t('በስራና ፈቃድ ላይ ያሉ', 'Active force members')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('መሰረታዊ ደመወዝ', 'Total Base Salary')}
          </span>
          <div className="text-lg font-black text-white font-mono mt-1">
            {totalBaseSalary.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ETB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ጠቅላላ አበሎች', 'Total Allowances')}
          </span>
          <div className="text-lg font-black text-amber-400 font-mono mt-1">
            +{totalAllowances.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t('ስምሪት፣ ሜዳና ቤት', 'Duty, field & hazard')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ጠቅላላ ወጪ (Gross)', 'Total Gross Pay')}
          </span>
          <div className="text-lg font-black text-white font-mono mt-1">
            {totalGross.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ETB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {t('ጠቅላላ ቅነሳዎች', 'Total Deductions')}
          </span>
          <div className="text-lg font-black text-rose-400 font-mono mt-1">
            -{totalDeductions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t('ጡረታ (7%) + ግብር + ሌሎች', 'Pension, tax & funds')}
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase block">
            {t('የተጣራ ክፍያ (Net Pay)', 'Total Net Payout')}
          </span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {totalNet.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t('በቀጥታ ለአባላት ተከፋይ', 'Net take-home pay')}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex flex-wrap gap-1 max-w-4xl">
        <button
          onClick={() => setActiveTab('payroll_sheet')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'payroll_sheet'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>{t('1. የወር ደመወዝ ሉህና አጠቃላይ ስሌት', '1. Live Monthly Payroll')}</span>
        </button>

        <button
          onClick={() => setActiveTab('officer_calculator')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'officer_calculator'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{t('2. የአባላት ደመወዝ ማስተካከያና ስሌት', '2. Officer Salary Calculator')}</span>
        </button>

        <button
          onClick={() => setActiveTab('scale_matrix')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'scale_matrix'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t('3. የደመወዝ ስኬል በደረጃና በማዕረግ', '3. Rank & Grade Scales')}</span>
        </button>

        <button
          onClick={() => setActiveTab('deduction_rules')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'deduction_rules'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{t('4. የቅነሳዎችና ግብር ህግጋት ማዋቀሪያ', '4. Deductions & Tax Rules')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAYROLL SHEET */}
      {/* ========================================================================= */}
      {activeTab === 'payroll_sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>{t('የቤጉ ፖሊስ አባላት የወር ክፍያ ዝርዝር ሰነድ', 'Force Member Compensation Roster')}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('ደመወዝ፣ አበሎች፣ ግብርና ጡረታ በሲስተሙ በራስ-ሰር ተሰልተው የተቀመጡ', 'Automated net salary calculations and tax withholding')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRankFilter}
                onChange={e => setSelectedRankFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">{t('ሁሉም ማዕረጎች', 'All Ranks')}</option>
                {Array.from(new Set(payrollMembers.map(m => m.currentRank))).map(rank => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchMember}
                  onChange={e => setSearchMember(e.target.value)}
                  placeholder={t('አባል ፈልግ (ስም፣ ቁጥር፣ ክፍል)...', 'Search officer...')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Police ID</th>
                  <th className="py-3 px-3">{t('የአባሉ ስም', 'Name')}</th>
                  <th className="py-3 px-3">{t('ማዕረግ', 'Rank')}</th>
                  <th className="py-3 px-3">{t('ደረጃ/እርከን', 'Scale')}</th>
                  <th className="py-3 px-3 text-right">{t('መሰረታዊ ደመወዝ', 'Base')}</th>
                  <th className="py-3 px-3 text-right">{t('አበሎች', 'Allowances')}</th>
                  <th className="py-3 px-3 text-right">{t('ጠቅላላ (Gross)', 'Gross')}</th>
                  <th className="py-3 px-3 text-right">{t('ጡረታ (7%)', 'Pension')}</th>
                  <th className="py-3 px-3 text-right">{t('ግብር', 'Tax')}</th>
                  <th className="py-3 px-3 text-right">{t('ሌሎች ቅነሳዎች', 'Other')}</th>
                  <th className="py-3 px-3 text-right">{t('የተጣራ (Net Pay)', 'Net Pay')}</th>
                  <th className="py-3 px-3 text-center">{t('ድርጊቶች', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPayrollMembers.map(m => {
                  const calc = calculateOfficerPayroll(
                    m,
                    payrollConfig,
                    memberPayrollCustomizations[m.policeId.toUpperCase()]
                  );
                  const otherDeductionsTotal =
                    calc.deductions.creditAssociation +
                    calc.deductions.healthInsurance +
                    calc.deductions.redCross +
                    calc.deductions.courtPenalty +
                    calc.deductions.customItems.reduce((sum, item) => sum + item.amount, 0);

                  return (
                    <tr key={m.policeId} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{m.policeId}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={m.identity.photoUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-white block">{m.identity.fullName}</span>
                            <span className="text-[10px] text-slate-400">{m.currentDepartment}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{m.currentRank}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        G{calc.grade} · S{calc.step}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-white">
                        {calc.baseSalary.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                        {calc.allowances.totalAllowances.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        {calc.grossSalary.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        -{calc.deductions.pensionEmployee.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        -{calc.deductions.incomeTax.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                        -{otherDeductionsTotal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-400">
                        {calc.netPay.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedMemberForAdjustment(m)}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                            title={t('ደመወዝና ቅነሳዎችን አስተካክል', 'Adjust Salary & Deductions')}
                          >
                            <Sliders className="w-3 h-3 text-amber-400" />
                            <span>{t('አስተካክል', 'Adjust')}</span>
                          </button>

                          <button
                            onClick={() => setSelectedMemberForPayslip(m)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                            title={t('ፔይስሊፕ አሳይ', 'View Payslip')}
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>{t('ፔይስሊፕ', 'Payslip')}</span>
                          </button>
                        </div>
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
      {/* TAB 2: OFFICER SALARY CALCULATOR & ADJUSTMENT HUB */}
      {/* ========================================================================= */}
      {activeTab === 'officer_calculator' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{t('የአባላት ደመወዝ ማስተካከያና ስሌት ማዕከል', 'Officer Salary Adjustment & Live Calculator')}</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mb-4">
              {t(
                'ማንኛውንም አባል ይምረጡ፤ መሰረታዊ ደመወዝ ወይም አበል ያስገቡ ወይም ተጨማሪ የሚቀናነስ ነገር ያስገቡ። ሲስተሙ በራስ-ሰር ጠቅላላ ተከፋይ፣ ጡረታ፣ ግብርና የተጣራ ደመወዙን ያሰላል። ከዛም በፋየርስቶር ማስቀመጥ ይችላሉ።',
                'Select any officer to adjust base salary, allowances, and custom deductions. The system recalculates everything in real-time.'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {payrollMembers.map(m => {
                const calc = calculateOfficerPayroll(
                  m,
                  payrollConfig,
                  memberPayrollCustomizations[m.policeId.toUpperCase()]
                );

                return (
                  <div
                    key={m.policeId}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl transition-all shadow flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.identity.photoUrl}
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover border border-amber-400/40"
                        />
                        <div>
                          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                            {m.policeId}
                          </span>
                          <h4 className="font-bold text-white text-xs mt-0.5">{m.identity.fullName}</h4>
                          <span className="text-[11px] text-slate-400">{m.currentRank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t('መሰረታዊ ደመወዝ', 'Base')}</span>
                        <span className="font-mono font-bold text-white">{calc.baseSalary.toLocaleString()} ETB</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t('የተጣራ ተከፋይ', 'Net Pay')}</span>
                        <span className="font-mono font-black text-emerald-400">{calc.netPay.toLocaleString()} ETB</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMemberForAdjustment(m)}
                      className="mt-3 w-full py-2 bg-slate-900 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-amber-500 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{t('ደመወዝና ቅነሳዎችን አስተካክል', 'Adjust Salary & Deductions')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SALARY SCALE MATRIX (GRADES 1-12 & STEPS 1-9) */}
      {/* ========================================================================= */}
      {activeTab === 'scale_matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t('የቤኒሻንጉል ጉሙዝ ፖሊስ ደመወዝ ስኬል በደረጃና በማዕረግ', 'Official Commission Salary Scale Matrix')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  'ባለሙያው ለእያንዳንዱ ማዕረግና ደረጃ የመሰረታዊ ደመወዝ መጠን አስገብቶ የሚያስተካክልበት፤ በፋየርስቶር ተቀምጦ ለሁሉም አባላት የሚተገበር።',
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
                    <span>{t('በፋየርስቶር አስቀምጥ', 'Save Matrix')}</span>
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
              <span>{t('የደመወዝ ስኬል ማትሪክስ በፋየርስቶር በተሳካ ሁኔታ ተቀምጧል!', 'Salary scales saved to Firestore successfully!')}</span>
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
      {/* TAB 4: DEDUCTION & TAX CONFIGURATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'deduction_rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>{t('የቅነሳዎችና ግብር ህግጋት ማዋቀሪያ (Deduction & Tax Engine)', 'Deduction & Tax Engine')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  'የጡረታ መዋጮ፣ የገቢ ግብር እርከኖችና ቋሚ ተቋማዊ ቅነሳዎችን አንዴ በማዋቀር በሲስተሙ ለሁሉም አባላት በራስ-ሰር እንዲሰላ ያድርጉ።',
                  'Configure global deduction rates and Ethiopian income tax brackets stored in Firestore.'
                )}
              </p>
            </div>

            <button
              onClick={handleSaveRulesToFirestore}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{t('ህግጋቱን በፋየርስቶር አስቀምጥ', 'Save Rules to Firestore')}</span>
            </button>
          </div>

          {rulesSaveStatus === 'saved' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('የደመወዝ ህግጋት በፋየርስቶር በተሳካ ሁኔታ ተቀምጠዋል!', 'Deduction rules saved to Firestore successfully!')}</span>
            </div>
          )}

          {/* Section 1: Statutory Pension Rates */}
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
                  {t('የተቋሙ ድርሻ 11% ነው', 'Institutional employer share is 11%')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Progressive Ethiopian Tax Brackets */}
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

          {/* Section 3: Standard Institutional Deductions */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>{t('ተቋማዊ ወርሃዊ መዋጮዎች (Standard Institutional Deductions)', 'Standard Institutional Deductions')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {localRules.standardDeductions.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={e => {
                        const updated = localRules.standardDeductions.map(d =>
                          d.id === item.id ? { ...d, isActive: e.target.checked } : d
                        );
                        setLocalRules({ ...localRules, standardDeductions: updated });
                      }}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{item.description}</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{t('መጠን (ብር):', 'Amount (ETB):')}</span>
                    <input
                      type="number"
                      value={item.value}
                      onChange={e => {
                        const updated = localRules.standardDeductions.map(d =>
                          d.id === item.id ? { ...d, value: parseFloat(e.target.value) || 0 } : d
                        );
                        setLocalRules({ ...localRules, standardDeductions: updated });
                      }}
                      className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
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
    </div>
  );
};
