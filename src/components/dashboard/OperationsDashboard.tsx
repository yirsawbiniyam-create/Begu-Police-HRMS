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
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
  Search,
  Filter,
  Eye,
  User
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

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ onNavigateTab, onOpenMemberFile }) => {
  const {
    members,
    applications,
    t,
    systemLogo,
    isLogoSynced,
    currentRole,
    eligibleStepIncrementMembers,
    eligibleRankPromotionMembers
  } = useHrms();
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

  // Promotion & Step Increment Analytics Filters & Data
  const [promoFilter, setPromoFilter] = useState<'all' | 'rank_only' | 'step_only'>('all');
  const [promoSearch, setPromoSearch] = useState('');

  // Gender breakdown for promotion and step increment
  const stepMaleCount = eligibleStepIncrementMembers.filter(m => m.identity.gender === 'ወንድ').length;
  const stepFemaleCount = eligibleStepIncrementMembers.filter(m => m.identity.gender === 'ሴት').length;

  const rankPromoMaleCount = eligibleRankPromotionMembers.filter(m => m.identity.gender === 'ወንድ').length;
  const rankPromoFemaleCount = eligibleRankPromotionMembers.filter(m => m.identity.gender === 'ሴት').length;

  // Unified list of all candidates
  const allEligibleOfficersMap = new Map<string, typeof members[0]>();
  eligibleStepIncrementMembers.forEach(m => allEligibleOfficersMap.set(m.policeId, m));
  eligibleRankPromotionMembers.forEach(m => allEligibleOfficersMap.set(m.policeId, m));
  const allEligibleOfficers = Array.from(allEligibleOfficersMap.values());

  const totalEligibleMale = allEligibleOfficers.filter(m => m.identity.gender === 'ወንድ').length;
  const totalEligibleFemale = allEligibleOfficers.filter(m => m.identity.gender === 'ሴት').length;

  const genderPromoChartData = [
    { name: t('ወንድ አባላት (Male)', 'Male Officers'), value: totalEligibleMale },
    { name: t('ሴት አባላት (Female)', 'Female Officers'), value: totalEligibleFemale }
  ];

  // Distribution by Police Rank for promotions & steps
  const rankPromoChartMap: Record<string, { rank: string; promoCount: number; stepCount: number }> = {};
  allEligibleOfficers.forEach(m => {
    if (!rankPromoChartMap[m.currentRank]) {
      rankPromoChartMap[m.currentRank] = { rank: m.currentRank, promoCount: 0, stepCount: 0 };
    }
  });
  eligibleRankPromotionMembers.forEach(m => {
    if (!rankPromoChartMap[m.currentRank]) {
      rankPromoChartMap[m.currentRank] = { rank: m.currentRank, promoCount: 0, stepCount: 0 };
    }
    rankPromoChartMap[m.currentRank].promoCount++;
  });
  eligibleStepIncrementMembers.forEach(m => {
    if (!rankPromoChartMap[m.currentRank]) {
      rankPromoChartMap[m.currentRank] = { rank: m.currentRank, promoCount: 0, stepCount: 0 };
    }
    rankPromoChartMap[m.currentRank].stepCount++;
  });
  const rankPromoChartData = Object.values(rankPromoChartMap);

  // Filtered list for the Promotion Table
  const filteredEligibleOfficers = allEligibleOfficers.filter(m => {
    const isStep = eligibleStepIncrementMembers.some(s => s.policeId === m.policeId);
    const isPromo = eligibleRankPromotionMembers.some(p => p.policeId === m.policeId);

    if (promoFilter === 'step_only' && !isStep) return false;
    if (promoFilter === 'rank_only' && !isPromo) return false;

    if (promoSearch.trim()) {
      const q = promoSearch.toLowerCase();
      const match =
        m.identity.fullName.toLowerCase().includes(q) ||
        m.policeId.toLowerCase().includes(q) ||
        m.currentRank.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Promotion & Step Increment Due Alerts for Admin */}
      {(eligibleStepIncrementMembers.length > 0 || eligibleRankPromotionMembers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligibleStepIncrementMembers.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-r-2xl flex items-start justify-between shadow-md">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      {eligibleStepIncrementMembers.length}
                    </span>
                    <h4 className="text-sm font-bold text-amber-300">
                      {t('እርከን የሚያገኙ አባላት (Step Increment Due)', 'Step Increment Due')}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {t(
                      `${eligibleStepIncrementMembers.length} አባላት ዓመታዊ የእርከን ማግኛ ጊዜያቸው ደርሷል።`,
                      `${eligibleStepIncrementMembers.length} officers are due for salary step increment.`
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {eligibleStepIncrementMembers.slice(0, 4).map(m => (
                      <button
                        key={m.policeId}
                        onClick={() => {
                          if (onOpenMemberFile) onOpenMemberFile(m.policeId);
                          else onNavigateTab('personnel');
                        }}
                        className="text-[11px] font-mono font-medium text-amber-300 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-colors"
                      >
                        <span>{m.identity.fullName}</span>
                        <span className="text-slate-400">({m.policeId})</span>
                      </button>
                    ))}
                    {eligibleStepIncrementMembers.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{eligibleStepIncrementMembers.length - 4} ሌሎች
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('payroll')}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors flex-shrink-0 ml-3 shadow"
              >
                <span>{t('እርከን ስጥ', 'Grant Steps')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {eligibleRankPromotionMembers.length > 0 && (
            <div className="bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-transparent border-l-4 border-blue-500 p-4 rounded-r-2xl flex items-start justify-between shadow-md">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      {eligibleRankPromotionMembers.length}
                    </span>
                    <h4 className="text-sm font-bold text-blue-300">
                      {t('ማዕረግ የሚያገኙ አባላት (Rank Promotion Due)', 'Rank Promotion Due')}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {t(
                      `${eligibleRankPromotionMembers.length} አባላት ቀጣይ የማዕረግ እድገት ማግኛ ጊዜያቸው ደርሷል።`,
                      `${eligibleRankPromotionMembers.length} officers reached tenure requirement for next rank.`
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {eligibleRankPromotionMembers.slice(0, 4).map(m => (
                      <button
                        key={m.policeId}
                        onClick={() => {
                          if (onOpenMemberFile) onOpenMemberFile(m.policeId);
                          else onNavigateTab('personnel');
                        }}
                        className="text-[11px] font-mono font-medium text-blue-300 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-blue-500/30 flex items-center gap-1 transition-colors"
                      >
                        <span>{m.identity.fullName}</span>
                        <span className="text-slate-400">({m.currentRank})</span>
                      </button>
                    ))}
                    {eligibleRankPromotionMembers.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{eligibleRankPromotionMembers.length - 4} ሌሎች
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('personnel')}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors flex-shrink-0 ml-3 shadow"
              >
                <span>{t('ማዕረግ ስጥ', 'Promote')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

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

      {/* ========================================================================= */}
      {/* PROMOTION & STEP INCREMENT ANALYTICS (GRAPHS & TABLE BY GENDER & RANK) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20 uppercase">
                {t('የአባላት ዕድገት ትንተና', 'Promotion Analytics')}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{t('በቀን ማንቂያ የሚሰራ (Auto-Tracked)', 'Time-Based Tracking')}</span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{t('ማዕረግና እርከን የሚያገኙ አባላት አጠቃላይ ትንተና (በብዛት፣ በፆታና በማዕረግ)', 'Promotion & Step Increment Roster & Analytics')}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              {t(
                'በአድሚኑ በተሞላው የማዕረግና የእርከን ማግኛ ቀን መሰረት ጊዜያቸው የደረሰ አባላት በብዛት፣ በፆታ፣ በማዕረግ በግራፍና በሰንጠረዥ የተደራጀ ይፋዊ ሪፖርት።',
                'Official command distribution by gender, rank tier, and active eligibility table based on HR promotion schedules.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('payroll')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('ወደ ፔሮል እርከን ስሌት', 'Go to Payroll Steps')}</span>
            </button>
            <button
              onClick={() => onNavigateTab('personnel')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('የማዕረግ ዶሴ ክፈት', 'Personnel Promotions')}</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Step Increment Total & Gender */}
          <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('እርከን የሚያገኙ አባላት', 'Step Increment Due')}</span>
              </span>
              <span className="font-mono text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {stepMaleCount + stepFemaleCount}
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {stepMaleCount + stepFemaleCount} <span className="text-xs text-slate-400 font-sans font-normal">አባላት</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <span>ወንድ:</span> <strong className="font-mono">{stepMaleCount}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-pink-400 font-semibold">
                <span>ሴት:</span> <strong className="font-mono">{stepFemaleCount}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: Rank Promotion Total & Gender */}
          <div className="bg-slate-950/80 border border-blue-500/30 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{t('ማዕረግ የሚያገኙ አባላት', 'Rank Promotion Due')}</span>
              </span>
              <span className="font-mono text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                {rankPromoMaleCount + rankPromoFemaleCount}
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {rankPromoMaleCount + rankPromoFemaleCount} <span className="text-xs text-slate-400 font-sans font-normal">አባላት</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <span>ወንድ:</span> <strong className="font-mono">{rankPromoMaleCount}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-pink-400 font-semibold">
                <span>ሴት:</span> <strong className="font-mono">{rankPromoFemaleCount}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Total Eligible Unique Force */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t('ጠቅላላ ዕድገት ተጠቃሚ አባላት', 'Total Promotion Candidates')}
            </span>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {allEligibleOfficers.length}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{t('ከጠቅላላ ኃይል ድርሻ:', 'Share of Force:')}</span>
              <span className="font-mono font-bold text-emerald-400">
                {totalCount > 0 ? ((allEligibleOfficers.length / totalCount) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* Card 4: Gender Proportion Summary */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t('የፆታ ተዋፅኦ (Gender Parity)', 'Candidate Gender Balance')}
            </span>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <span className="text-[10px] text-slate-400 block">ወንድ</span>
                <span className="text-xl font-bold text-blue-400 font-mono">{totalEligibleMale}</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 block">ሴት</span>
                <span className="text-xl font-bold text-pink-400 font-mono">{totalEligibleFemale}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              {t(`ሴት አባላት ድርሻ: `, `Female Ratio: `)}
              <strong className="text-pink-400 font-mono">
                {allEligibleOfficers.length > 0 ? ((totalEligibleFemale / allEligibleOfficers.length) * 100).toFixed(1) : 0}%
              </strong>
            </div>
          </div>
        </div>

        {/* Charts Grid: Rank Distribution (Bar) & Gender Ratio (Pie) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Bar Chart of Promotion Candidates by Rank */}
          <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-amber-400" />
                  <span>{t('በማዕረግ የተከፋፈለ የዕድገት እጩዎች ብዛት (ግራፍ)', 'Promotion & Step Candidates by Police Rank')}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('ለእያንዳንዱ የፖሊስ ማዕረግ የማዕረግ እድገት (ሰማያዊ) እና የእርከን ጭማሪ (ቢጫ)', 'Rank promotion (Blue) vs Step increment (Amber) per rank')}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                  <span>ማዕረግ ({rankPromoMaleCount + rankPromoFemaleCount})</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                  <span>እርከን ({stepMaleCount + stepFemaleCount})</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              {rankPromoChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {t('በአሁን ወቅት ዕድገት የደረሰ አባል የለም', 'No eligible officers at this time')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankPromoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                    <XAxis
                      dataKey="rank"
                      stroke="#94a3b8"
                      fontSize={11}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="promoCount" name={t('የማዕረግ እድገት', 'Rank Promotion')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stepCount" name={t('የእርከን ጭማሪ', 'Step Increment')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Gender Proportion Pie Chart */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>{t('በፆታ ተዋፅኦ (Gender Parity Chart)', 'Gender Breakdown')}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('የእጩ አባላት የፆታ ስርጭት', 'Eligible candidates by sex')}
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              {allEligibleOfficers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {t('ምንም እጩ የለም', 'No candidates')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderPromoChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${(name || '').split(' ')[0]}: ${value}`}
                      labelLine={false}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ec4899" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-around text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>ወንድ: {totalEligibleMale} ({allEligibleOfficers.length > 0 ? ((totalEligibleMale / allEligibleOfficers.length) * 100).toFixed(0) : 0}%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-pink-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                <span>ሴት: {totalEligibleFemale} ({allEligibleOfficers.length > 0 ? ((totalEligibleFemale / allEligibleOfficers.length) * 100).toFixed(0) : 0}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Promotion & Step Eligibility Table (በሰንጠረዥ) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{t('ዕድገት የሚያገኙ አባላት ይፋዊ ሰንጠረዥ (Eligible Officers Roster)', 'Eligible Officers Roster Table')}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('ማዕረግና እርከን የሚያገኙ አባላት ዝርዝር፣ ቀጣይ ቀናቸውና የዕድገት ደረጃቸው', 'Itemized list with due dates, rank targets, and dossier links')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setPromoFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    promoFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('ሁሉም', 'All')} ({allEligibleOfficers.length})
                </button>
                <button
                  onClick={() => setPromoFilter('rank_only')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    promoFilter === 'rank_only' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('ማዕረግ ብቻ', 'Rank')} ({eligibleRankPromotionMembers.length})
                </button>
                <button
                  onClick={() => setPromoFilter('step_only')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    promoFilter === 'step_only' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('እርከን ብቻ', 'Step')} ({eligibleStepIncrementMembers.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={promoSearch}
                  onChange={e => setPromoSearch(e.target.value)}
                  placeholder={t('አባል ፈልግ (ስም፣ ID)...', 'Search officer...')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead className="bg-slate-900/90 text-slate-300 font-bold uppercase text-[11px] border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-3">Police ID</th>
                  <th className="py-3 px-3">የአባሉ ስም (Officer)</th>
                  <th className="py-3 px-2 text-center">ፆታ (Sex)</th>
                  <th className="py-3 px-2">የአሁን ማዕረግ</th>
                  <th className="py-3 px-2">ደረጃ/እርከን</th>
                  <th className="py-3 px-3">ቀጣይ ማዕረግ ማግኛ ጊዜ</th>
                  <th className="py-3 px-3">ቀጣይ እርከን ማግኛ ጊዜ</th>
                  <th className="py-3 px-3 text-center">የዕድገት አይነት</th>
                  <th className="py-3 px-3 text-center">እርምጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredEligibleOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                      {t('ምንም የተገኘ አባል የለም', 'No eligible candidates found for this filter')}
                    </td>
                  </tr>
                ) : (
                  filteredEligibleOfficers.map(m => {
                    const isStep = eligibleStepIncrementMembers.some(s => s.policeId === m.policeId);
                    const isPromo = eligibleRankPromotionMembers.some(p => p.policeId === m.policeId);

                    return (
                      <tr key={m.policeId} className="hover:bg-slate-900/60 transition-colors">
                        {/* ID */}
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {m.policeId}
                        </td>

                        {/* Officer */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={m.identity.photoUrl}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-slate-700 flex-shrink-0"
                            />
                            <div>
                              <span className="font-bold text-white block">{m.identity.fullName}</span>
                              <span className="text-[10px] text-slate-400">{m.currentDepartment}</span>
                            </div>
                          </div>
                        </td>

                        {/* Sex */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.identity.gender === 'ሴት'
                                ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {m.identity.gender}
                          </span>
                        </td>

                        {/* Current Rank */}
                        <td className="py-2.5 px-2 font-semibold text-slate-200 whitespace-nowrap">
                          {m.currentRank}
                        </td>

                        {/* Grade & Step */}
                        <td className="py-2.5 px-2 font-mono text-slate-300 whitespace-nowrap">
                          G{m.salaryGrade} · S{m.salaryStep}
                        </td>

                        {/* Rank Eligibility Date */}
                        <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                          {m.nextPromotionEligibilityDate ? (
                            <span className={isPromo ? 'text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20' : 'text-slate-400'}>
                              {m.nextPromotionEligibilityDate}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>

                        {/* Step Increment Date */}
                        <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                          {m.nextStepIncrementDate ? (
                            <span className={isStep ? 'text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20' : 'text-slate-400'}>
                              {m.nextStepIncrementDate}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>

                        {/* Status Badges */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {isPromo && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                <Award className="w-3 h-3" />
                                <span>ማዕረግ ደርሷል</span>
                              </span>
                            )}
                            {isStep && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                <span>እርከን ደርሷል</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (onOpenMemberFile) onOpenMemberFile(m.policeId);
                              else onNavigateTab('personnel');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition-colors border border-slate-700"
                            title={t('የአባሉን ማህደር ክፈትና ዕድገት ስጥ', 'Open Dossier & Manage Promotion')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('ማህደር እይ', 'Dossier')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
