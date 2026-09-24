import React, { useState, useEffect } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { MemberProfile, MemberPayrollCustomization } from '../../types/hrms';
import {
  X,
  CreditCard,
  Calculator,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  Banknote,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Cloud
} from 'lucide-react';
import { calculateOfficerPayroll } from '../../utils/payrollCalculator';

interface OfficerSalaryAdjustmentModalProps {
  member: MemberProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSavedSuccess?: () => void;
}

export const OfficerSalaryAdjustmentModal: React.FC<OfficerSalaryAdjustmentModalProps> = ({
  member,
  isOpen,
  onClose,
  onSavedSuccess
}) => {
  const {
    payrollConfig,
    salaryScales,
    memberPayrollCustomizations,
    updateMemberPayrollCustomization,
    t,
    currentRole
  } = useHrms();

  if (!isOpen || !member) return null;

  const existingCustom = memberPayrollCustomizations[member.policeId.toUpperCase()];

  // Form states
  const [baseSalary, setBaseSalary] = useState<number>(
    existingCustom?.customBaseSalary ?? member.baseSalary ?? 7000
  );
  const [grade, setGrade] = useState<number>(
    existingCustom?.salaryGrade ?? member.salaryGrade ?? 1
  );
  const [step, setStep] = useState<number>(
    existingCustom?.salaryStep ?? member.salaryStep ?? 1
  );

  // Allowances
  const [dutyAllowance, setDutyAllowance] = useState<number>(
    existingCustom?.monthlyAllowances?.duty ?? member.monthlyAllowances?.duty ?? 0
  );
  const [fieldAllowance, setFieldAllowance] = useState<number>(
    existingCustom?.monthlyAllowances?.field ?? member.monthlyAllowances?.field ?? 0
  );
  const [housingAllowance, setHousingAllowance] = useState<number>(
    existingCustom?.monthlyAllowances?.housing ?? member.monthlyAllowances?.housing ?? 0
  );
  const [transportAllowance, setTransportAllowance] = useState<number>(
    existingCustom?.monthlyAllowances?.transport ?? member.monthlyAllowances?.transport ?? 0
  );
  const [hazardAllowance, setHazardAllowance] = useState<number>(
    existingCustom?.monthlyAllowances?.hazard ?? member.monthlyAllowances?.hazard ?? 0
  );

  // Deductions
  const [creditUnionDeduction, setCreditUnionDeduction] = useState<number>(
    existingCustom?.creditAssociationDeduction ?? 150
  );
  const [healthFundDeduction, setHealthFundDeduction] = useState<number>(
    existingCustom?.healthInsuranceDeduction ?? 100
  );
  const [redCrossDeduction, setRedCrossDeduction] = useState<number>(
    existingCustom?.redCrossDeduction ?? 25
  );
  const [courtPenalty, setCourtPenalty] = useState<number>(
    existingCustom?.courtOrDisciplinaryPenalty ?? 0
  );

  // Custom deductions list
  const [customDeductions, setCustomDeductions] = useState<Array<{ id: string; name: string; amount: number; reason: string }>>(
    existingCustom?.customDeductions || []
  );

  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState<number>(0);
  const [newDeductionReason, setNewDeductionReason] = useState('');
  const [notes, setNotes] = useState(existingCustom?.notes || '');

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // When grade/step changes or user clicks "Auto fill from Scale"
  const handleLoadFromScale = () => {
    const scaleObj = salaryScales.find(s => s.grade === grade);
    if (scaleObj && scaleObj.steps[step - 1]) {
      setBaseSalary(scaleObj.steps[step - 1]);
    }
  };

  const handleAddCustomDeduction = () => {
    if (!newDeductionName || newDeductionAmount <= 0) return;
    const newItem = {
      id: `ded-${Date.now()}`,
      name: newDeductionName,
      amount: newDeductionAmount,
      reason: newDeductionReason || 'ተጨማሪ ቅነሳ'
    };
    setCustomDeductions(prev => [...prev, newItem]);
    setNewDeductionName('');
    setNewDeductionAmount(0);
    setNewDeductionReason('');
  };

  const handleRemoveCustomDeduction = (id: string) => {
    setCustomDeductions(prev => prev.filter(item => item.id !== id));
  };

  // Build live temporary customization for instant preview
  const liveCustomization: MemberPayrollCustomization = {
    policeId: member.policeId,
    customBaseSalary: baseSalary,
    salaryGrade: grade,
    salaryStep: step,
    monthlyAllowances: {
      duty: dutyAllowance,
      field: fieldAllowance,
      housing: housingAllowance,
      transport: transportAllowance,
      hazard: hazardAllowance
    },
    creditAssociationDeduction: creditUnionDeduction,
    healthInsuranceDeduction: healthFundDeduction,
    redCrossDeduction: redCrossDeduction,
    courtOrDisciplinaryPenalty: courtPenalty,
    customDeductions,
    notes,
    updatedAt: new Date().toISOString(),
    updatedBy: 'ባለሙያ'
  };

  // Real-time automated calculation of everything
  const liveCalculation = calculateOfficerPayroll(member, payrollConfig, liveCustomization);

  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await updateMemberPayrollCustomization(liveCustomization);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: t('የአባሉ ደመወዝና ቅነሳዎች በፋየርስቶር በተሳካ ሁኔታ ተመዝግቧል!', 'Officer payroll and deductions saved to Firestore successfully!')
        });
        setTimeout(() => {
          if (onSavedSuccess) onSavedSuccess();
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'ስህተት ተከስቷል'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={member.identity.photoUrl}
              alt={member.identity.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-amber-400/50 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {member.policeId}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {member.currentRank}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {member.identity.fullName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-mono">
              <Cloud className="w-3 h-3" />
              <span>Firestore Sync</span>
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Section 1: Base Salary, Grade & Step */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                <span>{t('መሰረታዊ ደመወዝ፣ ደረጃና እርከን (Base Salary, Grade & Step)', 'Base Salary & Grade')}</span>
              </h4>
              <button
                type="button"
                onClick={handleLoadFromScale}
                className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded transition-all"
              >
                {t('ከደረጃው ስኬል ሙላ (Load Scale)', 'Load from Scale')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('ደረጃ (Salary Grade):', 'Salary Grade:')}
                </label>
                <select
                  value={grade}
                  onChange={e => setGrade(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                    <option key={g} value={g}>
                      {t(`ደረጃ ${g}`, `Grade ${g}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('እርከን (Step 1-9):', 'Step (1-9):')}
                </label>
                <select
                  value={step}
                  onChange={e => setStep(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(s => (
                    <option key={s} value={s}>
                      {t(`እርከን ${s} (Step ${s})`, `Step ${s}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('መሰረታዊ ደመወዝ (በብር):', 'Base Salary (ETB):')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={e => setBaseSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">ETB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Allowances (አበሎች) */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4" />
              <span>{t('ወርሃዊ አበሎችና ጥቅማጥቅሞች (Monthly Allowances)', 'Monthly Allowances')}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('የስምሪት (Duty):', 'Duty Allowance:')}</label>
                <input
                  type="number"
                  value={dutyAllowance}
                  onChange={e => setDutyAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('የሜዳ (Field):', 'Field Allowance:')}</label>
                <input
                  type="number"
                  value={fieldAllowance}
                  onChange={e => setFieldAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('የቤት (Housing):', 'Housing Allowance:')}</label>
                <input
                  type="number"
                  value={housingAllowance}
                  onChange={e => setHousingAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('የትራንስፖርት:', 'Transport:')}</label>
                <input
                  type="number"
                  value={transportAllowance}
                  onChange={e => setTransportAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('የበረሃ/አደጋ (Hazard):', 'Hazard/Climate:')}</label>
                <input
                  type="number"
                  value={hazardAllowance}
                  onChange={e => setHazardAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Statutory & Institutional Deductions (ቅነሳዎች) */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calculator className="w-4 h-4" />
              <span>{t('የሚቆረጡና የሚቀናነሱ መጠኖች (Deductions & Withholdings)', 'Deductions & Withholdings')}</span>
            </h4>

            {/* Auto Calculated Statutory Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {t('በህግ የተደነገገ የጡረታ መዋጮ (7%):', 'Statutory Pension (7%):')}
                </span>
                <span className="font-mono font-bold text-rose-400">
                  -{liveCalculation.deductions.pensionEmployee.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {t('በሲስተሙ በራስ-ሰር የተሰላ የገቢ ግብር:', 'Auto Calculated Income Tax:')}
                </span>
                <span className="font-mono font-bold text-rose-400">
                  -{liveCalculation.deductions.incomeTax.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Editable Specific Deductions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('የፖሊስ ብድርና ቁጠባ:', 'Credit Union (ETB):')}
                </label>
                <input
                  type="number"
                  value={creditUnionDeduction}
                  onChange={e => setCreditUnionDeduction(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('የጤና መድህን ፈንድ:', 'Health Insurance:')}
                </label>
                <input
                  type="number"
                  value={healthFundDeduction}
                  onChange={e => setHealthFundDeduction(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('ቀይ መስቀል ማህበር:', 'Red Cross:')}
                </label>
                <input
                  type="number"
                  value={redCrossDeduction}
                  onChange={e => setRedCrossDeduction(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('የፍርድ ቤት / ዲሲፕሊን ቅጣት:', 'Court/Disciplinary Penalty:')}
                </label>
                <input
                  type="number"
                  value={courtPenalty}
                  onChange={e => setCourtPenalty(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Custom Extra Deductions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                {t('ተጨማሪ ልዩ ቅነሳዎች (Custom Individual Deductions):', 'Additional Individual Deductions:')}
              </span>

              {customDeductions.length > 0 && (
                <div className="space-y-1.5">
                  {customDeductions.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <span className="font-semibold text-white">{item.name}</span>
                        {item.reason && <span className="text-slate-400 text-[10px] ml-2">({item.reason})</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-rose-400 font-bold">-{item.amount.toLocaleString()} ETB</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomDeduction(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add form */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder={t('የቅነሳው ስም (ምሳሌ: የወጪ መጋራት)', 'Deduction Name')}
                  value={newDeductionName}
                  onChange={e => setNewDeductionName(e.target.value)}
                  className="flex-1 min-w-[140px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder={t('መጠን (ብር)', 'Amount')}
                  value={newDeductionAmount || ''}
                  onChange={e => setNewDeductionAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder={t('ምክንያት', 'Reason')}
                  value={newDeductionReason}
                  onChange={e => setNewDeductionReason(e.target.value)}
                  className="flex-1 min-w-[120px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDeduction}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('ጨምር', 'Add')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Live Automated Calculation Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {t('በሲስተሙ በራስ-ሰር የተሰላ ወርሃዊ የደመወዝ ማጠቃለያ', 'Automated Live Payroll Calculation')}
                </h4>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {t('ቅጽበታዊ ስሌት (Instant)', 'Real-time Formula')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {t('መሰረታዊ ደመወዝ', 'Base Salary')}
                </span>
                <span className="text-lg font-black text-white font-mono mt-1 block">
                  {liveCalculation.baseSalary.toLocaleString()} ETB
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {t('ጠቅላላ አበሎች', 'Total Allowances')}
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">
                  +{liveCalculation.allowances.totalAllowances.toLocaleString()} ETB
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {t('ጠቅላላ ቅነሳዎች', 'Total Deductions')}
                </span>
                <span className="text-lg font-black text-rose-400 font-mono mt-1 block">
                  -{liveCalculation.deductions.totalDeductions.toLocaleString()} ETB
                </span>
              </div>

              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
                  {t('የተጣራ ተከፋይ ደመወዝ (Net Pay)', 'Net Take-Home Pay')}
                </span>
                <span className="text-xl font-black text-amber-300 font-mono mt-1 block">
                  {liveCalculation.netPay.toLocaleString()} ETB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>{t('ማስታወሻ: ሲያስቀምጡ በቀጥታ በFirestore ዳታቤዝ ላይ ይመዘገባል።', 'Saves directly to Firebase Firestore database.')}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              {t('ሰርዝ', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleSaveToFirestore}
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? t('በፋየርስቶር በመመዝገብ ላይ...', 'Saving to Firestore...')
                  : t('በፋየርስቶር አስቀምጥና አዘምን (Save to Firestore)', 'Save to Firestore')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
