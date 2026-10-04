import React, { useState, useEffect } from 'react';
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
  KeyRound,
  Folder,
  FolderOpen,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  badge?: string;
  count?: number;
  highlight?: boolean;
}

interface NavFolder {
  id: string;
  nameAm: string;
  nameEn: string;
  icon: any;
  items: NavItem[];
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, t, applications } = useHrms();
  const [viewMode, setViewMode] = useState<'folders' | 'all'>('folders');

  const pendingAppsCount = applications.filter(
    a => a.status === 'supervisor_review' || a.status === 'hr_review'
  ).length;

  const folders: NavFolder[] = [
    {
      id: 'personnel_folder',
      nameAm: 'የሰው ኃይል ማህደርና ምዝገባ',
      nameEn: 'Personnel & ID Dossier',
      icon: Users,
      items: [
        {
          id: 'personnel',
          label: t('የአባላት ዲጂታል ማህደር', 'Personnel Registry & Files'),
          icon: Users,
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
        }
      ]
    },
    {
      id: 'payroll_folder',
      nameAm: 'የደመወዝና ፔሮል ማዕከል',
      nameEn: 'Compensation & Payroll',
      icon: CreditCard,
      items: [
        {
          id: 'payroll',
          label: t('የደመወዝና እርከን ስሌት (13 ዓምድ ፔሮል)', 'Salary & Payroll Management'),
          icon: CreditCard,
          roles: ['hr_admin', 'management', 'payroll_officer']
        }
      ]
    },
    {
      id: 'workflow_folder',
      nameAm: 'ማመልከቻና Self-Service',
      nameEn: 'Workflows & Self-Service',
      icon: FileText,
      items: [
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
        }
      ]
    },
    {
      id: 'separation_folder',
      nameAm: 'ስንብትና ጡረታ',
      nameEn: 'Retirement & Separation',
      icon: LogOut,
      items: [
        {
          id: 'separation',
          label: t('የስንብትና ጡረታ ማስተዳደሪያ', 'Retirement & Separation'),
          icon: LogOut,
          roles: ['hr_admin', 'management']
        }
      ]
    },
    {
      id: 'reports_folder',
      nameAm: 'ሪፖርቶች፣ ዳሽቦርድና ኦዲት',
      nameEn: 'Reports & Institutional Audit',
      icon: BarChart3,
      items: [
        {
          id: 'dashboard',
          label: t('አጠቃላይ ዳሽቦርድ', 'Operations Dashboard'),
          icon: LayoutDashboard,
          roles: ['hr_admin', 'management', 'supervisor', 'payroll_officer']
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
      ]
    }
  ];

  // Filter folders by active user role
  const accessibleFolders = folders
    .map(f => ({
      ...f,
      items: f.items.filter(item => item.roles.includes(currentRole))
    }))
    .filter(f => f.items.length > 0);

  // Active folder detection
  const currentActiveFolder = accessibleFolders.find(f =>
    f.items.some(item => item.id === activeTab)
  ) || accessibleFolders[0];

  const [activeFolderId, setActiveFolderId] = useState<string>(
    currentActiveFolder?.id || 'payroll_folder'
  );

  useEffect(() => {
    const parentFolder = accessibleFolders.find(f =>
      f.items.some(item => item.id === activeTab)
    );
    if (parentFolder) {
      setActiveFolderId(parentFolder.id);
    }
  }, [activeTab]);

  const activeFolder = accessibleFolders.find(f => f.id === activeFolderId) || accessibleFolders[0];

  // If member role, keep it simplified
  if (currentRole === 'member') {
    return (
      <nav className="bg-slate-900/95 border-b border-slate-800 backdrop-blur sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-white">
              {t('የአባላት ይፋዊ Self-Service ፖርታል', 'Official Member Self-Service Portal')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {t('ደህንነቱ የተጠበቀ የግል ማህደር', 'Secure Member Access')}
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-slate-900/95 border-b border-slate-800 backdrop-blur sticky top-18 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Tier 1: Folder Categories Bar (ክሊክ አድርጎ የሚገቡትን ርዕሶችን በአንድ ፋይል የሰበሰበ) */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('ዋና ዋና ፋይሎች፡', 'System Dossiers:')}</span>
            </span>

            {accessibleFolders.map(folder => {
              const isFolderSelected = activeFolderId === folder.id;
              const hasActiveChild = folder.items.some(item => item.id === activeTab);
              const FolderIcon = folder.icon;

              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    // Automatically switch to first child if current active is outside
                    if (!folder.items.some(i => i.id === activeTab)) {
                      setActiveTab(folder.items[0].id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isFolderSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm'
                      : hasActiveChild
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <FolderIcon className={`w-3.5 h-3.5 ${isFolderSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{t(folder.nameAm, folder.nameEn)}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isFolderSelected ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {folder.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Toggle between Folder View and All Tabs View */}
          <button
            onClick={() => setViewMode(viewMode === 'folders' ? 'all' : 'folders')}
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 transition-colors"
            title={viewMode === 'folders' ? t('ሁሉንም ርዕሶች በአንድ ላይ ዘርዝር', 'Show all tabs') : t('በፋይል ፎልደሮች ከፋፍለህ አሳይ', 'Folder categorized')}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{viewMode === 'folders' ? t('ሁሉንም አሳይ', 'All Views') : t('በፋይል ከፋፍል', 'Folder View')}</span>
          </button>
        </div>

        {/* Tier 2: Sub-items inside Active Folder (or All Items in All Mode) + Back Button */}
        <div className="flex items-center justify-between gap-3 pt-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 flex-1 min-w-max">
            {/* Quick Back to First Folder Button */}
            <button
              onClick={() => {
                setActiveFolderId('payroll_folder');
                setActiveTab('payroll');
              }}
              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors flex-shrink-0"
              title={t('ወደ ዋናው የደመወዝ ፔሮል ማህደር ተመለስ', 'Return to Main Payroll Dossier')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('ወደ ፔሮል ተመለስ', 'Back to Payroll')}</span>
            </button>

            <span className="text-slate-600">|</span>

            {/* Sub-items */}
            {(viewMode === 'folders'
              ? (activeFolder?.items || [])
              : accessibleFolders.flatMap(f => f.items)
            ).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {item.badge && !isActive && (
                    <span className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-amber-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Breadcrumb Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono flex-shrink-0 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
            <span>📁 {t(activeFolder?.nameAm || '', activeFolder?.nameEn || '')}</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-400 font-bold">📄 {activeTab}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
