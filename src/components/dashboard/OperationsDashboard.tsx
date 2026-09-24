import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  Users,
  UserCheck,
  PlaneTakeoff,
  LogOut,
  FileCheck2,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Download,
  Calendar,
  Layers,
  Banknote,
  Upload,
  Cloud,
  Shield,
  Camera,
  CheckCircle
} from 'lucide-react';
import { SystemLogoModal } from '../common/SystemLogoModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface OperationsDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenMemberFile?: (policeId: string) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ onNavigateTab }) => {
  const { members, applications, t, systemLogo, isLogoSynced, currentRole } = useHrms();
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Aggregate statistics dynamically
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === 'active').length;
  const onLeaveCount = members.filter(m => m.status === 'on_leave').length;
  const transferredPendingCount = members.filter(m => m.status === 'transferred_pending').length;
  const retiredCount = members.filter(m => m.status === 'retired').length;
  const dismissedCount = members.filter(m => m.status === 'dismissed').length;
  const resignedCount = members.filter(m => m.status === 'resigned').length;

  const pendingApps = applications.filter(a => a.status === 'supervisor_review' || a.status === 'hr_review').length;

  const totalMonthlyPayroll = members
    .filter(m => m.status === 'active' || m.status === 'on_leave')
    .reduce((sum, m) => {
      const allowances =
        m.monthlyAllowances.duty +
        m.monthlyAllowances.field +
        m.monthlyAllowances.housing +
        m.monthlyAllowances.transport +
        m.monthlyAllowances.hazard;
      return sum + m.baseSalary + allowances;
    }, 0);

  // Ranks breakdown for chart
  const rankCountMap: Record<string, number> = {};
  members.forEach(m => {
    rankCountMap[m.currentRank] = (rankCountMap[m.currentRank] || 0) + 1;
  });
  const rankChartData = Object.entries(rankCountMap).map(([rank, count]) => ({
    rank,
    count
  }));

  // Department breakdown
  const deptCountMap: Record<string, number> = {};
  members.forEach(m => {
    // short name
    const shortName = m.currentDepartment.replace(' መምሪያ', '');
    deptCountMap[shortName] = (deptCountMap[shortName] || 0) + 1;
  });
  const deptChartData = Object.entries(deptCountMap).map(([name, value]) => ({
    name,
    value
  }));

  // Service Years distribution (0-5, 6-10, 11-15, 16-20, 20+)
  const serviceDistribution = [
    { bracket: '0–5 ዓመት', count: 0 },
    { bracket: '6–10 ዓመት', count: 0 },
    { bracket: '11–15 ዓመት', count: 0 },
    { bracket: '16–20 ዓመት', count: 0 },
    { bracket: '20+ ዓመት', count: 0 }
  ];

  const currentYear = 2026;
  members.forEach(m => {
    const empYear = parseInt(m.employmentDate.substring(0, 4), 10);
    const yrs = currentYear - empYear;
    if (yrs <= 5) serviceDistribution[0].count++;
    else if (yrs <= 10) serviceDistribution[1].count++;
    else if (yrs <= 15) serviceDistribution[2].count++;
    else if (yrs <= 20) serviceDistribution[3].count++;
    else serviceDistribution[4].count++;
  });

  // Gender breakdown
  const maleCount = members.filter(m => m.identity.gender === 'ወንድ').length;
  const femaleCount = members.filter(m => m.identity.gender === 'ሴት').length;

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

  // Upcoming retirement list (Age >= 58 or service >= 30)
  const upcomingRetirements = members.filter(m => {
    const birthYear = parseInt(m.identity.dateOfBirth.substring(0, 4), 10);
    const age = currentYear - birthYear;
    return age >= 57 && m.status !== 'retired' && m.status !== 'dismissed';
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if pending retirements or applications */}
      {upcomingRetirements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                {t('አስቸኳይ የጡረታ ማሳሰቢያ (Upcoming Retirement Readiness Alert)', 'Upcoming Retirement Action Required')}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {t(
                  `በተቋሙ ውስጥ የጡረታ እድሜያቸው (60 ዓመት) የተቃረቡ ${upcomingRetirements.length} ከፍተኛ አባላት ይገኛሉ። የቅድመ-ጡረታ ሰነድ ማጣራትና ክሊራንስ እንዲጀመር ይመከራል።`,
                  `There are ${upcomingRetirements.length} members approaching statutory retirement age (60 years). Please initiate separation dossier preparation.`
                )}
              </p>
              <div className="mt-2 flex items-center gap-3">
                {upcomingRetirements.slice(0, 3).map(m => (
                  <span key={m.policeId} className="text-xs font-medium text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {m.identity.fullName} ({m.policeId}) · {m.currentRank}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('separation')}
            className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors flex-shrink-0 ml-4"
          >
            <span>{t('ወደ ጡረታ ዶሴ', 'View Separation')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Commission Branding & Cloud Logo Management Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 overflow-hidden">
              {systemLogo ? (
                <img
                  src={systemLogo}
                  alt="Commission Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <Shield className="w-7 h-7 text-amber-400 fill-amber-400/20" />
              )}
            </div>
            <div
              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isLogoSynced ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Police Commission')}
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-mono">
                <Cloud className="w-3 h-3" />
                <span>begu-police-hrms (Firestore Live)</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {t('የሲስተም ሎጎና የኮሚሽኑ ይፋዊ ብራንዲንግ', 'Commission Official Logo & System Branding')}
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                'አድሚኑ የሚያስገባው ሎጎ ለሁሉም የፖሊስ አባላት በSelf-Service ፖርታል፣ በመግቢያ ገጽ እና በደመወዝ ፔይስሊፕ ላይ በቀጥታ ይታያል።',
                'Custom logo uploaded by the Admin syncs in real-time to all member portals, payslips, and login screens.'
              )}
            </p>
          </div>
        </div>

        {(currentRole === 'hr_admin' || currentRole === 'management') && (
          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{t('ከጋለሪ ሎጎ ቀይር / Upload Logo', 'Upload Logo from Gallery')}</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Police Force */}
        <div
          onClick={() => onNavigateTab('personnel')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('ጠቅላላ አባላት', 'Total Force')}</span>
            <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalCount}</span>
            <span className="text-[11px] text-emerald-400 font-medium">100%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">{t('በHRM የተመዘገቡ', 'Enrolled in HRMS')}</p>
        </div>

        {/* Active Duty */}
        <div
          onClick={() => onNavigateTab('personnel')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('በስራ ላይ (Active)', 'Active Duty')}</span>
            <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">{Math.round((activeCount / totalCount) * 100)}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">{t('በግዳጅና በስራ ላይ', 'Currently deployed')}</p>
        </div>

        {/* On Leave */}
        <div
          onClick={() => onNavigateTab('personnel')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('በፈቃድ ላይ', 'On Leave')}</span>
            <Calendar className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-400">{onLeaveCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">{Math.round((onLeaveCount / totalCount) * 100)}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">{t('ዓመታዊ/ህመም ፈቃድ', 'Annual / Sick leave')}</p>
        </div>

        {/* Transferred Pending */}
        <div
          onClick={() => onNavigateTab('personnel')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('በዝውውር ላይ', 'In Transfer')}</span>
            <PlaneTakeoff className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-400">{transferredPendingCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">{Math.round((transferredPendingCount / totalCount) * 100)}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">{t('የጣቢያ ምደባ ዝውውር', 'Relocation processing')}</p>
        </div>

        {/* Separated & Retired */}
        <div
          onClick={() => onNavigateTab('separation')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('የተሰናበቱ/ጡረታ', 'Separated / Ret.')}</span>
            <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400">{retiredCount + dismissedCount + resignedCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {retiredCount} {t('ጡረታ', 'ret')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {t(`በጡረታ (${retiredCount}) · የተባረሩ (${dismissedCount})`, `Ret: ${retiredCount} · Dism: ${dismissedCount}`)}
          </p>
        </div>

        {/* Pending Applications */}
        <div
          onClick={() => onNavigateTab('applications')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('ተጠባባቂ ጥያቄዎች', 'Pending Apps')}</span>
            <FileCheck2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">{pendingApps}</span>
            <span className="text-[11px] text-amber-400 font-semibold">{t('ምርመራ', 'Action')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">{t('በኃላፊ/HR እይታ ላይ', 'Under Review')}</p>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {t('ዋና የሲስተም አሰራር (System Actions):', 'Operational Quick Actions:')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('id_integration')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t('ከመታወቂያ ሲስተም ጋር አገናኝ (ID Gateway)', 'Police ID Gateway & Onboard')}</span>
          </button>

          <button
            onClick={() => onNavigateTab('personnel')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('የአባላት ማህደር ፈልግ (Search Roster)', 'Search Registry')}</span>
          </button>

          <button
            onClick={() => onNavigateTab('payroll')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('የመስከረም 2026 ደመወዝ', 'View Monthly Payroll')}</span>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('ሪፖርት አውርድ (Export Reports)', 'Export Force Data')}</span>
          </button>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rank Distribution Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                {t('የአባላት ብዛት በማዕረግ ደረጃ (Rank Distribution)', 'Police Rank Structure Breakdown')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('በኮሚሽኑ ውስጥ የሚገኙ የፖሊስ አባላት በደረጃ ተከፋፍለው', 'Current active & enrolled personnel per rank tier')}
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
              {totalCount} {t('አባላት', 'Members')}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis
                  dataKey="rank"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} ${t('አባላት', 'Officers')}`, t('ብዛት', 'Count')]}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Strength Pie / Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                {t('የአባላት ምደባ በመምሪያ (Department Deployment)', 'Department & Branch Staffing')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('በተለያዩ የስራ ክፍሎች የተመደቡ አባላት ድርሻ', 'Force distribution across core policing directorates')}
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {t(`ወንድ: ${maleCount} · ሴት: ${femaleCount}`, `M: ${maleCount} · F: ${femaleCount}`)}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(((percent as number | undefined) ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {deptChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Years Experience Bracket */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                {t('በአገልግሎት ዘመን የተከፋፈለ (Service Years Bracket)', 'Tenure & Service Longevity')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('የአባላት የልምድና የአገልግሎት ዘመን ስርጭት', 'Personnel breakdown by years of police service')}
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="bracket" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial & Status Summary Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              {t('የደመወዝ ክፍያና የሁኔታዎች ማጠቃለያ', 'Payroll & Service Status Summary')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('የወር ደመወዝ በጀትና የአባላት የሁኔታ መረጃ', 'Institutional expenditure & service breakdown')}
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-850 bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t('የመስከረም 2026 ጠቅላላ የወር ደመወዝና አበል', 'Monthly Active Gross Payroll (Sept 2026)')}</span>
                <span className="text-emerald-400 font-semibold">{t('ጸድቋል', 'Approved')}</span>
              </div>
              <div className="mt-1 text-2xl font-black text-white font-mono">
                {totalMonthlyPayroll.toLocaleString()} <span className="text-xs font-normal text-amber-400">ETB</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                <span>{t(`መሰረታዊ ደመወዝ + የሜዳ፣ ስጋትና ቤት አበል`, 'Basic Salary + Field, Duty, Hazard & Housing Allowances')}</span>
                <button
                  onClick={() => onNavigateTab('payroll')}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  {t('ዝርዝር ይመልከቱ', 'View Details')} ➜
                </button>
              </div>
            </div>

            {/* Service Status Breakdown Table */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  {t('በንቁ ስራ ላይ ያሉ አባላት', 'Active Duty Police Officers')}
                </span>
                <span className="font-bold text-white font-mono">{activeCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  {t('በእረፍትና በህክምና ፈቃድ ላይ', 'On Approved Leave')}
                </span>
                <span className="font-bold text-white font-mono">{onLeaveCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  {t('በክብር በጡረታ የተሸኙ', 'Honorable Pension Retirees')}
                </span>
                <span className="font-bold text-white font-mono">{retiredCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  {t('በዲሲፕሊን የተባረሩ አባላት', 'Dismissed / Disciplinary Action')}
                </span>
                <span className="font-bold text-white font-mono">{dismissedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Logo Modal */}
      <SystemLogoModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />
    </div>
  );
};
