import React from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  LayoutDashboard,
  Cpu,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  LogOut,
  BarChart3,
  History,
  KeyRound
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, t, applications } = useHrms();

  const pendingAppsCount = applications.filter(a => a.status === 'supervisor_review' || a.status === 'hr_review').length;

  const tabs = [
    {
      id: 'dashboard',
      label: t('አጠቃላይ ዳሽቦርድ', 'Operations Dashboard'),
      icon: LayoutDashboard,
      roles: ['hr_admin', 'management', 'supervisor', 'payroll_officer']
    },
    {
      id: 'id_integration',
      label: t('የመታወቂያ ሲስተም ውህደት', 'Police ID System Integration'),
      icon: Cpu,
      roles: ['hr_admin', 'management'],
      badge: 'API'
    },
    {
      id: 'user_accounts',
      label: t('የመግቢያ መለያዎች አስተዳደር', 'User Credentials & Access'),
      icon: KeyRound,
      roles: ['hr_admin'],
      badge: 'Admin'
    },
    {
      id: 'personnel',
      label: t('የአባላት ዲጂታል ማህደር', 'Personnel Registry & Files'),
      icon: Users,
      roles: ['hr_admin', 'management', 'supervisor', 'payroll_officer']
    },
    {
      id: 'self_service',
      label: t('የአባላት Self-Service ፖርታል', 'Member Self-Service Portal'),
      icon: UserCheck,
      roles: ['member', 'hr_admin', 'supervisor'],
      highlight: currentRole === 'member'
    },
    {
      id: 'applications',
      label: t('የማመልከቻዎች የስራ ፍሰት', 'Applications & Workflow'),
      icon: FileText,
      roles: ['hr_admin', 'management', 'supervisor'],
      count: pendingAppsCount
    },
    {
      id: 'payroll',
      label: t('የደመወዝና እርከን ስሌት', 'Salary & Payroll Management'),
      icon: CreditCard,
      roles: ['hr_admin', 'management', 'payroll_officer']
    },
    {
      id: 'separation',
      label: t('የስንብትና ጡረታ ማስተዳደሪያ', 'Retirement & Separation'),
      icon: LogOut,
      roles: ['hr_admin', 'management']
    },
    {
      id: 'reports',
      label: t('ሪፖርቶችና ስታስቲክስ', 'Reports & Statistics'),
      icon: BarChart3,
      roles: ['hr_admin', 'management', 'payroll_officer']
    },
    {
      id: 'audit_trail',
      label: t('የኦዲትና ቁጥጥር መዝገብ', 'Audit Trail & Logs'),
      icon: History,
      roles: ['hr_admin', 'management']
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(currentRole));

  return (
    <nav className="bg-slate-900/95 border-b border-slate-800 backdrop-blur sticky top-18 z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2 min-w-max">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && !isActive && (
                  <span className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-amber-300 border border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
