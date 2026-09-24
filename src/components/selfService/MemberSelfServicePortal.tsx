import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { ApplicationType } from '../../types/hrms';
import {
  Shield,
  CreditCard,
  Calendar,
  PlaneTakeoff,
  Award,
  GraduationCap,
  TrendingUp,
  FileText,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  MapPin,
  Building,
  UserCheck
} from 'lucide-react';

export const MemberSelfServicePortal: React.FC = () => {
  const { activeMember, applications, submitApplication, t, systemLogo, getCalculatedPayroll } = useHrms();

  const [activeSection, setActiveSection] = useState<'profile' | 'salary' | 'applications' | 'career' | 'leave'>('profile');
  const [showNewAppModal, setShowNewAppModal] = useState(false);

  // New Application Form State
  const [appType, setAppType] = useState<ApplicationType>('የእረፍት ፈቃድ (Leave)');
  const [appTitle, setAppTitle] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [leaveDays, setLeaveDays] = useState(10);
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-01');
  const [transferStation, setTransferStation] = useState('ባምባሲ ወረዳ ፖሊስ ጣቢያ');
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  if (!activeMember) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        {t('ምንም የተመረጠ የአባል መረጃ የለም', 'No active member selected. Please choose a member profile.')}
      </div>
    );
  }

  // Filter applications belonging only to this specific member
  const memberApplications = applications.filter(
    a => a.policeId.toUpperCase() === activeMember.policeId.toUpperCase()
  );

  // Automated live calculation from Payroll Engine
  const liveCalc = getCalculatedPayroll(activeMember.policeId);

  const baseSalary = liveCalc ? liveCalc.baseSalary : activeMember.baseSalary;
  const allowancesTotal = liveCalc
    ? liveCalc.allowances.totalAllowances
    : activeMember.monthlyAllowances.duty +
      activeMember.monthlyAllowances.field +
      activeMember.monthlyAllowances.housing +
      activeMember.monthlyAllowances.transport +
      activeMember.monthlyAllowances.hazard;
  const grossSalary = liveCalc ? liveCalc.grossSalary : activeMember.baseSalary + allowancesTotal;
  const pensionDeduction = liveCalc
    ? liveCalc.deductions.pensionEmployee
    : Math.round(activeMember.baseSalary * activeMember.pensionDeductionRate);
  const taxDeduction = liveCalc
    ? liveCalc.deductions.incomeTax
    : Math.round(grossSalary * activeMember.taxDeductionRate);
  const totalDeductions = liveCalc
    ? liveCalc.deductions.totalDeductions
    : pensionDeduction + taxDeduction;
  const netSalary = liveCalc ? liveCalc.netPay : grossSalary - pensionDeduction - taxDeduction;

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTitle.trim() || !appDescription.trim()) return;

    let targetDetails: any = {};
    if (appType.includes('Leave') || appType.includes('እረፍት')) {
      targetDetails = {
        leaveDays,
        leaveStartDate,
        leaveEndDate: '2026-10-15'
      };
    } else if (appType.includes('Transfer') || appType.includes('ዝውውር')) {
      targetDetails = {
        requestedStation: transferStation
      };
    }

    const res = submitApplication({
      type: appType,
      title: appTitle,
      description: appDescription,
      targetDetails,
      attachments: [
        {
          name: 'supporting_document.pdf',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          type: 'application/pdf'
        }
      ]
    });

    if (res.success) {
      setSubmitFeedback(`ማመልከቻዎ በመለያ ቁጥር ${res.applicationNo} በተሳካ ሁኔታ ገቢ ሆኗል!`);
      setAppTitle('');
      setAppDescription('');
      setTimeout(() => {
        setShowNewAppModal(false);
        setSubmitFeedback(null);
        setActiveSection('applications');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Member Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={activeMember.identity.photoUrl}
              alt={activeMember.identity.fullName}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono shadow">
              {activeMember.badgeNumber}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {activeMember.policeId}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-semibold text-slate-300">
                {activeMember.currentRank}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                {t('በስራ ላይ (Active Duty)', 'Active Duty')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              {activeMember.identity.fullName}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                {activeMember.currentDepartment}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeMember.currentStation}
              </span>
              <span className="font-mono text-amber-300 font-semibold">
                Grade {activeMember.salaryGrade} · Step {activeMember.salaryStep}
              </span>
            </div>
          </div>
        </div>

        {/* Quick New Application Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewAppModal(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('አዲስ የHR ማመልከቻ አስገባ', 'Submit New Application')}</span>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex space-x-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'profile', label: t('የግል ማህደር & መታወቂያ', 'My Profile & ID Card'), icon: Shield },
          { id: 'salary', label: t('የወር ደመወዝ & Payslip', 'My Monthly Salary'), icon: CreditCard },
          { id: 'applications', label: t('ያቀረብኳቸው ማመልከቻዎች', 'My Applications'), icon: FileText, count: memberApplications.length },
          { id: 'career', label: t('የማዕረግና የሙያ ታሪክ', 'Rank & Career History'), icon: Award },
          { id: 'leave', label: t('የእረፍት ፈቃድ ሁኔታ', 'Leave Balances'), icon: Calendar, badge: `${activeMember.leaveBalance.annualRemaining} days` }
        ].map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{sec.label}</span>
              {sec.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                  {sec.count}
                </span>
              )}
              {sec.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-slate-950 text-emerald-400 font-bold' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {sec.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: PROFILE & OFFICIAL ID */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          {/* Read-Only Notice & Grievance Trigger */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-white block">
                  {t('የተረጋገጠ ይፋዊ ማህደር (Read-Only Personnel Dossier)', 'Certified Read-Only Personnel Dossier')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t(
                    'አባላት የራሳቸውን ማህደር ብቻ መመልከት ይችላሉ (ማረም አይቻልም)። ስህተት ወይም ቅሬታ ካለዎት ማመልከቻ መፃፍ ይችላሉ።',
                    'This profile is strictly read-only and maintained by Commission HR. If you notice any discrepancy, submit an official appeal below.'
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setAppType('የማህደር መረጃ ቅሬታ (Profile Info Discrepancy)');
                setAppTitle('የማህደር መረጃ ማስተካከያ ቅሬታ ማመልከቻ');
                setShowNewAppModal(true);
              }}
              className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('የመረጃ ቅሬታ ጻፍ', 'Submit Info Complaint')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Official High Security Digital ID Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                  <div>
                    <h4 className="text-xs uppercase font-black text-amber-400 tracking-wider">
                      የቤኒሻንጉል ጉሙዝ ፖሊስ
                    </h4>
                    <p className="text-[9px] text-slate-400 font-mono">BENISHANGUL GUMUZ POLICE COMMISSION</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-amber-300">{activeMember.policeId}</span>
              </div>

              <div className="mt-5 flex gap-4">
                <img
                  src={activeMember.identity.photoUrl}
                  alt={activeMember.identity.fullName}
                  className="w-24 h-28 rounded-xl object-cover border-2 border-amber-400 shadow-lg"
                />
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('ሙሉ ስም', 'Full Name')}</span>
                    <span className="font-bold text-white text-sm">{activeMember.identity.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('ማዕረግ', 'Rank')}</span>
                    <span className="font-semibold text-amber-300">{activeMember.currentRank}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('የደም አይነት', 'Blood Type')}</span>
                    <span className="font-mono text-slate-200">{activeMember.identity.bloodGroup || 'O+'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የመታወቂያ ቁጥር:', 'Police ID:')}</span>
                  <span className="font-mono font-bold text-amber-400">{activeMember.policeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('መለያ (Badge):', 'Badge:')}</span>
                  <span className="font-mono text-white">{activeMember.badgeNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የተሰጠበት ቀን:', 'Issue Date:')}</span>
                  <span className="font-mono text-white">{activeMember.identity.issueDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-dashed border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {t('ህጋዊና የተረጋገጠ ማንነት', 'Verified Biometric ID')}
              </span>
              <button
                onClick={() => window.print()}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <Printer className="w-3 h-3" />
                <span>{t('አትም', 'Print Card')}</span>
              </button>
            </div>
          </div>

          {/* Member HR Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                {t('የአባሉ ኦፊሴላዊ መረጃ (View Only)', 'Personnel Details (View Only)')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">{t('የቅጥር ቀን', 'Date of Enlistment')}</span>
                  <span className="font-semibold text-white font-mono">{activeMember.employmentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('የቅጥር አይነት', 'Contract')}</span>
                  <span className="font-semibold text-white">{activeMember.employmentType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('የአገልግሎት ዘመን', 'Service Tenure')}</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    {2026 - parseInt(activeMember.employmentDate.substring(0, 4), 10)} {t('ዓመታት', 'years')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('መምሪያ', 'Directorate')}</span>
                  <span className="font-semibold text-white">{activeMember.currentDepartment}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('ጣቢያ / የስራ ቦታ', 'Assigned Station')}</span>
                  <span className="font-semibold text-white">{activeMember.currentStation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('የስራ መደብ', 'Position')}</span>
                  <span className="font-semibold text-amber-300">{activeMember.position}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                {t('የአድራሻና የአደጋ ጊዜ ተጠሪ መረጃ', 'Emergency Contact & Address')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">{t('ዞንና ወረዳ', 'Zone / Wereda')}</span>
                  <span className="font-semibold text-white">
                    {activeMember.identity.address.zone}, {activeMember.identity.address.wereda}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('ቀበሌ', 'Kebele')}</span>
                  <span className="font-semibold text-white">{activeMember.identity.address.kebele}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('የአደጋ ጊዜ ተጠሪ', 'Emergency Contact')}</span>
                  <span className="font-bold text-amber-300">
                    {activeMember.identity.emergencyContact.name} ({activeMember.identity.emergencyContact.relationship})
                  </span>
                  <span className="text-slate-400 block font-mono mt-0.5">{activeMember.identity.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* SECTION 2: MY SALARY & PAYSLIP */}
      {activeSection === 'salary' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                {systemLogo ? (
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-amber-400/40 p-1 flex items-center justify-center shadow-md overflow-hidden">
                    <img
                      src={systemLogo}
                      alt="Commission Logo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <Shield className="w-7 h-7 text-amber-400" />
                )}
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Police Commission')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('የመስከረም 2026 የወር ደመወዝ ፔይስሊፕ', 'Official Monthly Payslip · September 2026')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('አትም', 'Print Payslip')}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">{t('የአባሉ ስም:', 'Officer:')}</span>
                <span className="font-bold text-white">{activeMember.identity.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('Police ID:', 'Police ID:')}</span>
                <span className="font-mono text-amber-400 font-bold">{activeMember.policeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('ማዕረግ:', 'Rank:')}</span>
                <span className="font-semibold text-slate-200">{activeMember.currentRank}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('እርከን:', 'Scale:')}</span>
                <span className="font-mono text-emerald-400 font-bold">Grade {activeMember.salaryGrade} · Step {activeMember.salaryStep}</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="space-y-2.5 text-xs">
                <div className="font-bold text-emerald-400 uppercase text-[11px] pb-1 border-b border-slate-800">
                  {t('የገቢ ዝርዝር (Earnings)', 'Earnings Breakdown')}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">{t('መሰረታዊ ደመወዝ', 'Base Salary')}</span>
                  <span className="font-mono font-bold text-white">{activeMember.baseSalary.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የስራ ኃላፊነት አበል', 'Duty Allowance')}</span>
                  <span className="font-mono text-slate-200">{activeMember.monthlyAllowances.duty.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የሜዳ/ተልዕኮ አበል', 'Field Allowance')}</span>
                  <span className="font-mono text-slate-200">{activeMember.monthlyAllowances.field.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የቤት አበል', 'Housing Allowance')}</span>
                  <span className="font-mono text-slate-200">{activeMember.monthlyAllowances.housing.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የትራንስፖርት አበል', 'Transport Allowance')}</span>
                  <span className="font-mono text-slate-200">{activeMember.monthlyAllowances.transport.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('የስጋት (Hazard) አበል', 'Hazard Allowance')}</span>
                  <span className="font-mono text-slate-200">{activeMember.monthlyAllowances.hazard.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-emerald-400">
                  <span>{t('ጠቅላላ ገቢ (Gross Pay)', 'Total Gross Pay')}</span>
                  <span className="font-mono text-sm">{grossSalary.toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2.5 text-xs">
                <div className="font-bold text-rose-400 uppercase text-[11px] pb-1 border-b border-slate-800">
                  {t('የተቀናሽ ዝርዝር (Deductions)', 'Deductions Breakdown')}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">{t('የጡረታ መዋጮ (7%)', 'Pension Contribution (7%)')}</span>
                  <span className="font-mono text-rose-300">-{pensionDeduction.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">{t('የስራ ግብር (Income Tax)', 'Income Tax Withholding')}</span>
                  <span className="font-mono text-rose-300">-{taxDeduction.toLocaleString()} ETB</span>
                </div>
                {liveCalc && liveCalc.deductions.creditAssociation > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('የፖሊስ ብድርና ቁጠባ', 'Credit Union')}</span>
                    <span className="font-mono text-rose-300">-{liveCalc.deductions.creditAssociation.toLocaleString()} ETB</span>
                  </div>
                )}
                {liveCalc && liveCalc.deductions.healthInsurance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('የጤና መድህን ፈንድ', 'Health Fund')}</span>
                    <span className="font-mono text-rose-300">-{liveCalc.deductions.healthInsurance.toLocaleString()} ETB</span>
                  </div>
                )}
                {liveCalc && liveCalc.deductions.redCross > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('ቀይ መስቀል ማህበር', 'Red Cross')}</span>
                    <span className="font-mono text-rose-300">-{liveCalc.deductions.redCross.toLocaleString()} ETB</span>
                  </div>
                )}
                {liveCalc && liveCalc.deductions.courtPenalty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-rose-300 font-semibold">{t('የፍርድ ቤት / ዲሲፕሊን ቅጣት', 'Court/Disciplinary Penalty')}</span>
                    <span className="font-mono text-rose-400 font-bold">-{liveCalc.deductions.courtPenalty.toLocaleString()} ETB</span>
                  </div>
                )}
                {liveCalc && liveCalc.deductions.customItems.map(c => (
                  <div key={c.id} className="flex justify-between">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="font-mono text-rose-300">-{c.amount.toLocaleString()} ETB</span>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t border-slate-800 font-bold text-rose-400">
                  <span>{t('ጠቅላላ ተቀናሽ', 'Total Deductions')}</span>
                  <span className="font-mono text-sm">-{totalDeductions.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Net Salary Payable */}
            <div className="mt-6 pt-4 border-t-2 border-slate-800 flex items-center justify-between bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/30">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  {t('የተጣራ ተከፋይ ደመወዝ (NET SALARY PAYABLE)', 'Net Salary Payable')}
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('በንግድ ባንክ ሂሳብ የተላለፈ (Direct Deposited)', 'Deposited to Commercial Bank account')}
                </p>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {netSalary.toLocaleString()} <span className="text-xs font-normal">ETB</span>
              </div>
            </div>

            {/* Salary Discrepancy Notice & Complaint Action */}
            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                {t('በወር ደመወዝዎ፣ አበል ወይም ተቀናሽ ላይ ስህተት ወይም ጥያቄ ካለዎት ማመልከቻ መፃፍ ይችላሉ።', 'Have a question or discrepancy about your payroll calculations?')}
              </span>
              <button
                onClick={() => {
                  setAppType('የደመወዝና አበል ቅሬታ (Salary & Allowance Complaint)');
                  setAppTitle('የወር ደመወዝ ወይም አበል ስሌት ቅሬታ');
                  setShowNewAppModal(true);
                }}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('የደመወዝ ቅሬታ አስገባ', 'File Salary Complaint')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MY APPLICATIONS & STATUS TRACKER */}
      {activeSection === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                {t('ያቀረብኳቸው ማመልከቻዎችና የክትትል ሁኔታ', 'My Submitted Applications & Tracking')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('ለቅርብ ኃላፊና ለHR ቦርድ ያቀረቧቸው ጥያቄዎችና የውሳኔ ደረጃ', 'Status timeline for leaves, transfers, promotions, and certificates')}
              </p>
            </div>

            <button
              onClick={() => setShowNewAppModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('አዲስ ማመልከቻ', 'New Application')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {memberApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h5 className="font-bold text-white text-sm">{t('ምንም ያቀረቡት ማመልከቻ የለም', 'No applications submitted yet.')}</h5>
                <p className="mt-1">{t('የእረፍት ፈቃድ፣ የዝውውር ወይም የማዕረግ ጥያቄ ለማቅረብ "አዲስ ማመልከቻ" የሚለውን ይጫኑ።', 'Click "New Application" to apply for leave, transfer, or rank review.')}</p>
              </div>
            ) : (
              memberApplications.map(app => (
                <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                          {app.applicationNo}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">{app.type}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{app.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : app.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-400'
                            : app.status === 'supervisor_review'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-blue-500/15 text-blue-300'
                        }`}
                      >
                        {app.status === 'approved'
                          ? t('ጸድቋል (Approved)', 'Approved')
                          : app.status === 'rejected'
                          ? t('ውድቅ ተደርጓል (Rejected)', 'Rejected')
                          : app.status === 'supervisor_review'
                          ? t('በቅርብ ኃላፊ እይታ ላይ', 'Under Supervisor Review')
                          : t('በHR ቦርድ እይታ ላይ', 'Under HR Review')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{app.description}</p>

                  {/* Multi-stage Workflow Progress Timeline */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('የውሳኔ ሂደትና የፊርማ ታሪክ', 'Approval Workflow Steps')}
                    </span>
                    <div className="space-y-2 mt-2">
                      {app.workflowHistory.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2.5 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-semibold text-white">{step.step}</span>
                            <span className="text-slate-400 ml-2">({step.actor})</span>
                            {step.note && <p className="text-slate-400 text-[11px] mt-0.5 italic">"{step.note}"</p>}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">{step.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: CAREER & RANK */}
      {activeSection === 'career' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                {t('የማዕረግና የፖሊስ አገልግሎት ታሪክ', 'Rank History & Service Progression')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('በኮሚሽኑ ውስጥ ያገለገሉባቸው ማዕረጎችና የተሰጡ ሹመቶች', 'Chronological appointments from basic recruit to present')}
              </p>
            </div>
            <button
              onClick={() => {
                setAppType('የማዕረግ እድገት ይግባኝ (Promotion Appeal)');
                setAppTitle('የማዕረግ እድገት ይግባኝ አቤቱታ');
                setShowNewAppModal(true);
              }}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('የማዕረግ እድገት ይግባኝ አቅርብ', 'Submit Promotion Appeal')}</span>
            </button>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-700 space-y-6 my-4">
            {activeMember.rankHistory.map((rh, idx) => (
              <div key={rh.id} className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900 shadow" />
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      {rh.rank}
                      {idx === 0 && (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-semibold">
                          {t('ወቅታዊ ማዕረግ', 'Current')}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-400">{rh.effectiveDate}</span>
                  </div>
                  <div className="mt-2 text-slate-300">
                    <span className="text-slate-400">{t('የትዕዛዝ ቁጥር:', 'Order Ref:')}</span>{' '}
                    <span className="font-mono text-amber-300">{rh.orderNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: LEAVE BALANCES */}
      {activeSection === 'leave' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-semibold">{t('ጠቅላላ ዓመታዊ ፈቃድ', 'Total Entitled')}</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{activeMember.leaveBalance.annualTotal} {t('ቀናት', 'days')}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-semibold">{t('የተወሰደ ፈቃድ', 'Leave Used')}</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{activeMember.leaveBalance.annualUsed} {t('ቀናት', 'days')}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-center">
              <span className="text-xs text-blue-300 font-bold">{t('የቀረ ቀሪ ፈቃድ', 'Remaining Days')}</span>
              <div className="text-3xl font-black text-blue-400 font-mono mt-1">{activeMember.leaveBalance.annualRemaining} {t('ቀናት', 'days')}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-semibold">{t('የህመም ፈቃድ', 'Sick Leave')}</span>
              <div className="text-2xl font-black text-slate-300 font-mono mt-1">{activeMember.leaveBalance.sickUsed} {t('ቀናት', 'days')}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <h4 className="text-base font-bold text-white mb-2">{t('ዓመታዊ እረፍት መውሰድ ይፈልጋሉ?', 'Plan Your Leave?')}</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              {t(
                `እስከ ${activeMember.leaveBalance.annualRemaining} ቀናት የሚደርስ ዓመታዊ ፈቃድ ማመልከት ይችላሉ። ማመልከቻው በቀጥታ ለቅርብ ኃላፊዎ ይደርሳል።`,
                `You have ${activeMember.leaveBalance.annualRemaining} days remaining for this calendar cycle. Submit an online request below.`
              )}
            </p>
            <button
              onClick={() => {
                setAppType('የእረፍት ፈቃድ (Leave)');
                setAppTitle(`የ${leaveDays} ቀናት ዓመታዊ እረፍት ጥያቄ`);
                setShowNewAppModal(true);
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('የእረፍት ፈቃድ አመልክት', 'Apply for Leave Now')}</span>
            </button>
          </div>
        </div>
      )}

      {/* NEW APPLICATION MODAL */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                {t('አዲስ የHR ማመልከቻ ማቅረቢያ', 'Submit New HR Service Application')}
              </h4>
              <button onClick={() => setShowNewAppModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {submitFeedback && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{submitFeedback}</span>
              </div>
            )}

            <form onSubmit={handleApplicationSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የማመልከቻ ወይም የቅሬታ አይነት', 'Application or Complaint Type')}</label>
                <select
                  value={appType}
                  onChange={e => {
                    const val = e.target.value as ApplicationType;
                    setAppType(val);
                    if (val.includes('Leave')) setAppTitle('የዓመታዊ እረፍት ፈቃድ ጥያቄ');
                    else if (val.includes('Transfer')) setAppTitle('የጣቢያ ዝውውር ማመልከቻ');
                    else if (val.includes('Promotion') && val.includes('ይግባኝ')) setAppTitle('የማዕረግ እድገት ይግባኝ አቤቱታ');
                    else if (val.includes('Promotion')) setAppTitle('የማዕረግ እድገት ግምገማ ጥያቄ');
                    else if (val.includes('Salary') || val.includes('ደመወዝ')) setAppTitle('የወር ደመወዝ ወይም አበል ስሌት ቅሬታ');
                    else if (val.includes('Profile') || val.includes('ማህደር')) setAppTitle('የማህደር መረጃ ማስተካከያ ቅሬታ');
                    else if (val.includes('Grievance') || val.includes('አጠቃላይ ቅሬታ')) setAppTitle('አጠቃላይ አቤቱታና ቅሬታ');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <optgroup label={t('⚠️ ቅሬታዎችና ይግባኞች (Complaints & Appeals)', '⚠️ Complaints & Appeals')}>
                    <option value="የማህደር መረጃ ቅሬታ (Profile Info Discrepancy)">የማህደር መረጃ ቅሬታ (Profile Info Discrepancy)</option>
                    <option value="የደመወዝና አበል ቅሬታ (Salary & Allowance Complaint)">የደመወዝና አበል ቅሬታ (Salary & Allowance Complaint)</option>
                    <option value="የማዕረግ እድገት ይግባኝ (Promotion Appeal)">የማዕረግ እድገት ይግባኝ (Promotion Appeal)</option>
                    <option value="የዲሲፕሊን ውሳኔ ይግባኝ (Disciplinary Appeal)">የዲሲፕሊን ውሳኔ ይግባኝ (Disciplinary Appeal)</option>
                    <option value="አጠቃላይ ቅሬታና አቤቱታ (General Grievance)">አጠቃላይ ቅሬታና አቤቱታ (General Grievance)</option>
                  </optgroup>
                  <optgroup label={t('📋 መደበኛ የHR አገልግሎት ጥያቄዎች (Standard HR Requests)', '📋 Standard HR Requests')}>
                    <option value="የእረፍት ፈቃድ (Leave)">የእረፍት ፈቃድ (Leave Request)</option>
                    <option value="ዝውውር (Transfer)">የቦታ/ጣቢያ ዝውውር (Transfer Request)</option>
                    <option value="የማዕረግ እድገት (Promotion)">የማዕረግ እድገት (Promotion Review)</option>
                    <option value="ሥልጠና (Training)">ሥልጠናና ትምህርት (Training Request)</option>
                    <option value="ጥቅማ ጥቅም (Benefits)">ጥቅማጥቅምና አበል (Benefits Claim)</option>
                    <option value="የመረጃ ማስተካከያ (Info Correction)">የመረጃ ማስተካከያ (Data Correction)</option>
                    <option value="የአገልግሎት ማስረጃ (Certificate Request)">የአገልግሎት ማስረጃ (Service Certificate)</option>
                  </optgroup>
                </select>
              </div>

              {/* Dynamic form field for Leave */}
              {appType.includes('Leave') && (
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t('የቀናት ብዛት', 'Days')}</label>
                    <input
                      type="number"
                      min={1}
                      max={activeMember.leaveBalance.annualRemaining}
                      value={leaveDays}
                      onChange={e => setLeaveDays(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t('የሚጀምርበት ቀን', 'Start Date')}</label>
                    <input
                      type="date"
                      value={leaveStartDate}
                      onChange={e => setLeaveStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic field for Transfer */}
              {appType.includes('Transfer') && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t('የሚፈለገው ጣቢያ/ቦታ', 'Desired Station')}</label>
                  <select
                    value={transferStation}
                    onChange={e => setTransferStation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="ባምባሲ ወረዳ ፖሊስ ጣቢያ">ባምባሲ ወረዳ ፖሊስ ጣቢያ</option>
                    <option value="አሶሳ ከተማ ፖሊስ መምሪያ">አሶሳ ከተማ ፖሊስ መምሪያ</option>
                    <option value="አሶሳ ዋና መምሪያ (Assosa HQ)">አሶሳ ዋና መምሪያ (Assosa HQ)</option>
                    <option value="መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)">መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)</option>
                    <option value="ፓዌ ወረዳ ፖሊስ ጣቢያ">ፓዌ ወረዳ ፖሊስ ጣቢያ</option>
                    <option value="ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)">ጉባ ወረዳ (ህዳሴ ግድብ)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የርዕስ ማጠቃለያ', 'Application Title')}</label>
                <input
                  type="text"
                  required
                  value={appTitle}
                  onChange={e => setAppTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የ10 ቀናት ዓመታዊ እረፍት ጥያቄ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ዝርዝር ማብራሪያና ምክንያት', 'Full Details & Justification')}</label>
                <textarea
                  required
                  rows={3}
                  value={appDescription}
                  onChange={e => setAppDescription(e.target.value)}
                  placeholder="የማመልከቻዎትን ዝርዝር ምክንያት እዚህ ይግለጹ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {t('ማመልከቻ አስገባ', 'Submit Application')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
