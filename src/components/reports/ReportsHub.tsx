import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Users,
  Award,
  CreditCard,
  LogOut,
  Calendar,
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

export const ReportsHub: React.FC = () => {
  const { members, applications, auditLogs, t } = useHrms();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerCsvDownload = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 1. Full Force Roster
  const handleExportRoster = () => {
    const headers = ['Police ID', 'Badge', 'Full Name', 'Rank', 'Department', 'Station', 'Status', 'Employment Date', 'Salary Grade', 'Salary Step'];
    const rows = members.map(m => [
      `"${m.policeId}"`,
      `"${m.badgeNumber}"`,
      `"${m.identity.fullName}"`,
      `"${m.currentRank}"`,
      `"${m.currentDepartment}"`,
      `"${m.currentStation}"`,
      `"${m.status}"`,
      `"${m.employmentDate}"`,
      m.salaryGrade,
      m.salaryStep
    ]);
    triggerCsvDownload('Begu_Police_Full_Roster', headers, rows);
  };

  // 2. Rank & Hierarchy Distribution
  const handleExportRankDistribution = () => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      counts[m.currentRank] = (counts[m.currentRank] || 0) + 1;
    });
    const headers = ['Rank Name', 'Officers Count', 'Percentage'];
    const rows = Object.entries(counts).map(([rank, count]) => [
      `"${rank}"`,
      count,
      `"${((count / members.length) * 100).toFixed(1)}%"`
    ]);
    triggerCsvDownload('Begu_Police_Rank_Distribution', headers, rows);
  };

  // 3. Monthly Payroll Ledger
  const handleExportPayroll = () => {
    const headers = ['Police ID', 'Officer Name', 'Rank', 'Grade', 'Step', 'Base Salary', 'Duty Allowance', 'Field Allowance', 'Hazard Allowance', 'Gross Pay', 'Pension 7%', 'Tax', 'Net Pay'];
    const rows = members.map(m => {
      const allowances = m.monthlyAllowances.duty + m.monthlyAllowances.field + m.monthlyAllowances.housing + m.monthlyAllowances.transport + m.monthlyAllowances.hazard;
      const gross = m.baseSalary + allowances;
      const pension = Math.round(m.baseSalary * m.pensionDeductionRate);
      const tax = Math.round(gross * m.taxDeductionRate);
      const net = gross - pension - tax;
      return [
        `"${m.policeId}"`,
        `"${m.identity.fullName}"`,
        `"${m.currentRank}"`,
        m.salaryGrade,
        m.salaryStep,
        m.baseSalary,
        m.monthlyAllowances.duty,
        m.monthlyAllowances.field,
        m.monthlyAllowances.hazard,
        gross,
        pension,
        tax,
        net
      ];
    });
    triggerCsvDownload('Begu_Police_Payroll_Ledger', headers, rows);
  };

  // 4. Leave Balances Report
  const handleExportLeave = () => {
    const headers = ['Police ID', 'Officer Name', 'Rank', 'Department', 'Annual Total Days', 'Annual Used Days', 'Annual Remaining Days', 'Sick Used Days'];
    const rows = members.map(m => [
      `"${m.policeId}"`,
      `"${m.identity.fullName}"`,
      `"${m.currentRank}"`,
      `"${m.currentDepartment}"`,
      m.leaveBalance.annualTotal,
      m.leaveBalance.annualUsed,
      m.leaveBalance.annualRemaining,
      m.leaveBalance.sickUsed
    ]);
    triggerCsvDownload('Begu_Police_Leave_Ledger', headers, rows);
  };

  // 5. Audit Trail Report
  const handleExportAudit = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Action', 'Category', 'Target Police ID', 'Target Name', 'IP Address'];
    const rows = auditLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actorName || l.user}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.targetPoliceId}"`,
      `"${l.targetMemberName}"`,
      `"${l.ipAddress}"`
    ]);
    triggerCsvDownload('Begu_Police_Audit_Trail_Report', headers, rows);
  };

  const reportCards = [
    {
      title: t('የአባላት አጠቃላይ ሬጅስትሪ ሪፖርት', 'Force Personnel Master Roster'),
      desc: t('ሙሉ የአባላት ዝርዝር፣ ማዕረግ፣ መምሪያ፣ ጣቢያ፣ የስራ ሁኔታና መለያ ቁጥሮች', 'Complete master roster with ranks, station assignments, and statuses.'),
      icon: Users,
      action: handleExportRoster,
      tag: 'HR MASTER'
    },
    {
      title: t('የማዕረግና የሰው ኃይል ስርጭት ሪፖርት', 'Rank & Hierarchy Distribution'),
      desc: t('ከኮንስታብል እስከ ኮሚሽነር ያለው የማዕረግ ድርሻና የስራ መደብ ቁጥር', 'Force strength by rank breakdown and senior officer ratios.'),
      icon: Award,
      action: handleExportRankDistribution,
      tag: 'ORGANIZATIONAL'
    },
    {
      title: t('የወር ደመወዝና ጥቅማጥቅም ሰነድ (Payroll)', 'Monthly Payroll & Compensation Schedule'),
      desc: t('የመሰረታዊ ደመወዝ፣ አበሎች፣ የጡረታና ግብር ተቀናሾች እንዲሁም የተጣራ ክፍያ', 'Gross compensations, duty hazard allowances, tax & net pay ledger.'),
      icon: CreditCard,
      action: handleExportPayroll,
      tag: 'FINANCE & PAYROLL'
    },
    {
      title: t('የእረፍትና የፈቃድ አጠቃቀም ሪፖርት', 'Institutional Leave Utilization Report'),
      desc: t('የእያንዳንዱ አባል የተወሰደ ፈቃድ፣ ቀሪ ቀናትና የህመም እረፍቶች', 'Annual leave balances, utilized days, and active absences.'),
      icon: Calendar,
      action: handleExportLeave,
      tag: 'ATTENDANCE'
    },
    {
      title: t('የኦዲትና የደህንነት ክትትል ሪፖርት', 'Audit Trail & Compliance Log'),
      desc: t('በሲስተሙ የተከናወኑ የHR ለውጦች፣ የደመወዝ፣ የማዕረግና የዝውውር ውሳኔዎች ታሪክ', 'Immutable audit logs with acting users, timestamps, and IP logs.'),
      icon: ShieldCheck,
      action: handleExportAudit,
      tag: 'SECURITY & AUDIT'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
              {t('የሪፖርትና ዳታ ማውጫ ማዕከል', 'Analytics & Reports Hub')}
            </span>
            <span className="text-xs text-slate-400">CSV & Print Ready</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {t('የቤጉ ፖሊስ ኦፊሴላዊ የHR ሪፖርቶች', 'Begu Police Official HR Reports')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'ለኮሚሽነር ጽህፈት ቤትና ለመንግስት አስተዳደር የሚቀርቡ የሰው ኃይል፣ የደመወዝና የአፈጻጸም ሪፖርቶች',
              'Generate, inspect, and export comprehensive force reports in standard Excel / CSV formats'
            )}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>{t('ገጹን አትም', 'Print Page')}</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{downloadSuccess} {t('በተሳካ ሁኔታ ወርዷል!', 'downloaded successfully!')}</span>
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportCards.map((rc, idx) => {
          const Icon = rc.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {rc.tag}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {rc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rc.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Format: .CSV / Excel</span>
                <button
                  onClick={rc.action}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('አውርድ', 'Download')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
