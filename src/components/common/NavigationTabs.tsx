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
  ChevronDown,
  X,
  Shield,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  labelEn: string;
  icon: any;
  roles: string[];
  badge?: string;
  count?: number;
  description?: string;
  highlight?: boolean;
}

interface NavFolder {
  id: string;
  nameAm: string;
  nameEn: string;
  icon: any;
  description: string;
  items: NavItem[];
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, t, applications } = useHrms();
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const pendingAppsCount = applications.filter(
    a => a.status === 'supervisor_review' || a.status === 'hr_review'
  ).length;

  const folders: NavFolder[] = [
    {
      id: 'personnel_folder',
      nameAm: 'ማህደር 1፡ የሰው ኃይል ማህደርና ምዝገባ',
      nameEn: 'Dossier 1: Personnel Registry & Files',
      icon: Users,
      description: 'የፖሊስ አባላት የግል ማህደር፣ የመታወቂያ ውህደትና የመግቢያ መለያዎች',
      items: [
        {
          id: 'personnel',
          label: t('የአባላት ዲጂታል ማህደር', 'Personnel Registry & Files'),
          labelEn: 'Personnel Registry & Files',
          icon: Users,
          roles: ['hr_admin', 'management', 'supervisor', 'payroll_officer'],
          description: 'የአባላት ዝርዝር፣ ማዕረግ፣ የስራ አድራሻ፣ አገልግሎትና ማህደር'
        },
        {
          id: 'id_integration',
          label: t('የመታወቂያ ሲስተም ውህደት', 'Police ID System Integration'),
          labelEn: 'Police ID Integration',
          icon: Cpu,
          roles: ['hr_admin', 'management'],
          badge: 'Live ID',
          description: 'ከክልሉ ፖሊስ የመታወቂያ ዳታቤዝ ጋር የቀጥታ ማመሳከሪያ'
        },
        {
          id: 'user_accounts',
          label: t('የመግቢያ መለያዎች አስተዳደር', 'User Credentials & Access'),
          labelEn: 'User Credentials & Access',
          icon: KeyRound,
          roles: ['hr_admin'],
          badge: 'Admin',
          description: 'ለአባላትና ለኃላፊዎች የመግቢያ Username እና Password መስጫ'
        }
      ]
    },
    {
      id: 'payroll_folder',
      nameAm: 'ማህደር 2፡ የደመወዝና ፔሮል ማዕከል',
      nameEn: 'Dossier 2: Compensation & Payroll',
      icon: CreditCard,
      description: 'የ13 ዓምድ ይፋዊ ፔሮል፣ ወርሃዊ ማህደር፣ የደመወዝ ማስተካከያና ቅነሳዎች',
      items: [
        {
          id: 'payroll',
          label: t('የደመወዝና እርከን ስሌት (13 ዓምድ ፔሮል)', 'Salary & Payroll Management'),
          labelEn: 'Salary & Payroll Management',
          icon: CreditCard,
          roles: ['hr_admin', 'management', 'payroll_officer'],
          description: 'መሰረታዊ ደመወዝ፣ አበል፣ ግብር፣ 7% እና 33% ጡረታ፣ የህክምና እና የተጣራ ደመወዝ'
        }
      ]
    },
    {
      id: 'workflow_folder',
      nameAm: 'ማህደር 3፡ ማመልከቻና Self-Service',
      nameEn: 'Dossier 3: Workflows & Self-Service',
      icon: FileText,
      description: 'የአባላት የግል ፖርታል፣ የፈቃድና የብድር ማመልከቻዎች የስራ ፍሰት',
      items: [
        {
          id: 'self_service',
          label: t('የአባላት Self-Service ፖርታል', 'Member Self-Service Portal'),
          labelEn: 'Member Self-Service Portal',
          icon: UserCheck,
          roles: ['member', 'hr_admin', 'supervisor'],
          description: 'የአባሉ የግል ደመወዝ ስሊፕ፣ የማዕረግ/እርከን ቀናት እና የደረሱ ማሳወቂያዎች',
          highlight: currentRole === 'member'
        },
        {
          id: 'applications',
          label: t('የማመልከቻዎች የስራ ፍሰት', 'Applications & Workflow'),
          labelEn: 'Applications & Workflow',
          icon: FileText,
          roles: ['hr_admin', 'management', 'supervisor'],
          count: pendingAppsCount,
          description: 'የእረፍት ፈቃድ፣ የዝውውር እና የብድር ጥያቄዎች ማጽደቂያ'
        }
      ]
    },
    {
      id: 'separation_folder',
      nameAm: 'ማህደር 4፡ ስንብትና ጡረታ',
      nameEn: 'Dossier 4: Retirement & Separation',
      icon: LogOut,
      description: 'የጡረታ ዝግጁነት ማንቂያ፣ የአገልግሎት ክሊራንስ እና የስንብት ዶሴ',
      items: [
        {
          id: 'separation',
          label: t('የስንብትና ጡረታ ማስተዳደሪያ', 'Retirement & Separation'),
          labelEn: 'Retirement & Separation',
          icon: LogOut,
          roles: ['hr_admin', 'management'],
          description: 'የጡረታ እድሜ የደረሱ አባላት ክሊራንስና የጡረታ ሰነድ'
        }
      ]
    },
    {
      id: 'reports_folder',
      nameAm: 'ማህደር 5፡ ሪፖርቶች፣ ዳሽቦርድና ኦዲት',
      nameEn: 'Dossier 5: Reports & Institutional Audit',
      icon: BarChart3,
      description: 'የአባላት ማዕረግና እርከን ትንተና፣ የፆታ ተዋፅኦ፣ ሪፖርቶችና የኦዲት መዝገብ',
      items: [
        {
          id: 'dashboard',
          label: t('አጠቃላይ ዳሽቦርድ (ዕድገትና ትንተና)', 'Operations & Promotion Analytics'),
          labelEn: 'Operations & Promotion Analytics',
          icon: LayoutDashboard,
          roles: ['hr_admin', 'management', 'supervisor', 'payroll_officer'],
          description: 'የዕድገት እጩዎች በብዛት፣ በፆታ፣ በማዕረግ በግራፍና በሰንጠረዥ'
        },
        {
          id: 'reports',
          label: t('ሪፖርቶችና ስታስቲክስ', 'Reports & Statistics'),
          labelEn: 'Reports & Statistics',
          icon: BarChart3,
          roles: ['hr_admin', 'management', 'payroll_officer'],
          description: 'የሰው ኃይልና የደመወዝ ወርሃዊ ይፋዊ ሪፖርቶች'
        },
        {
          id: 'audit_trail',
          label: t('የኦዲትና ቁጥጥር መዝገብ', 'Audit Trail & Logs'),
          labelEn: 'Audit Trail & Logs',
          icon: History,
          roles: ['hr_admin', 'management'],
          description: 'በሲስተሙ የተከናወኑ ማናቸውም የHR እና የፔሮል እርምጃዎች መዝገብ'
        }
      ]
    }
  ];

  // Filter accessible folders & items by role
  const accessibleFolders = folders
    .map(f => ({
      ...f,
      items: f.items.filter(item => item.roles.includes(currentRole))
    }))
    .filter(f => f.items.length > 0);

  // Flat list of all accessible items
  const allAccessibleItems = accessibleFolders.flatMap(f => f.items);

  // Find active item and folder
  const currentActiveItem = allAccessibleItems.find(i => i.id === activeTab) || allAccessibleItems[0];
  const currentActiveFolder = accessibleFolders.find(f =>
    f.items.some(i => i.id === activeTab)
  ) || accessibleFolders[0];

  // If member role, clean simplified banner
  if (currentRole === 'member') {
    return (
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-18 z-30 shadow-md">
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
    <>
      {/* 
        Single Compact Bar directly under Logo Header
        Avoids stretching horizontally across the screen
      */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-18 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Left: Master Dossier File Trigger Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsDossierOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
                title={t('ሁሉንም ርዕሶች በአንድ ማህደር ክፈት', 'Open Master System Dossier')}
              >
                <FolderOpen className="w-4 h-4 fill-slate-950" />
                <span>{t('📁 የሲስተሙ ዋና ማህደር (ፋይል ክፈት)', '📁 System Master Dossier')}</span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              {/* Active Document Indicator Badge */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">{t('ክፍት ፋይል፡', 'Active:')}</span>
                {currentActiveItem && (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <currentActiveItem.icon className="w-3.5 h-3.5 text-amber-400 inline" />
                    <span>{currentActiveItem.label}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: Quick Switcher Dropdown & Direct Back to Payroll */}
            <div className="flex items-center gap-2">
              {/* Quick Dropdown Selector so user can jump immediately without horizontal spread */}
              <div className="relative">
                <select
                  value={activeTab}
                  onChange={e => setActiveTab(e.target.value)}
                  className="bg-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer pr-8"
                  title={t('ወደሚፈልጉት ማህደር በቀጥታ ይሂዱ', 'Jump directly to document')}
                >
                  {accessibleFolders.map(folder => (
                    <optgroup key={folder.id} label={folder.nameAm}>
                      {folder.items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Direct Quick Return to Payroll Button */}
              {activeTab !== 'payroll' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('payroll')}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
                  title={t('ወደ ደመወዝና እርከን ስሌት ተመለስ', 'Return to 13-Column Payroll')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t('ወደ ፔሮል', 'Payroll')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 
        MASTER DOSSIER POPUP DRAWER / MODAL
        All topics are collected inside this ONE single file container
        User enters this file and clicks what they want to use!
      */}
      {isDossierOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'BG Regional Police Commission')}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400">
                      {t('ዋና ማህደር ማውጫ', 'Master Archive Catalog')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>{t('📁 የሲስተሙ ዋና ዋና ማህደሮችና መምሪያዎች', 'HRMS Official Master Dossier')}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t(
                      'ከታች ከተዘረዘሩት ማህደሮች የሚፈልጉትን ፋይል ክሊክ በማድረግ በቀጥታ ይጠቀሙ።',
                      'Click any file folder inside this central dossier to navigate directly.'
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDossierOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={t('ዝጋ', 'Close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: All 5 Dossier Folders & Sub-items */}
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accessibleFolders.map(folder => {
                  const FolderIcon = folder.icon;
                  const isCurrentFolderActive = folder.items.some(i => i.id === activeTab);

                  return (
                    <div
                      key={folder.id}
                      className={`rounded-2xl p-4 border transition-all ${
                        isCurrentFolderActive
                          ? 'bg-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Folder Title */}
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl ${
                            isCurrentFolderActive
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            <FolderIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              {t(folder.nameAm, folder.nameEn)}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {folder.description}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                          {folder.items.length} ፋይሎች
                        </span>
                      </div>

                      {/* Items inside this folder */}
                      <div className="space-y-1.5">
                        {folder.items.map(item => {
                          const ItemIcon = item.icon;
                          const isItemActive = activeTab === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsDossierOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                                isItemActive
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <ItemIcon className={`w-4 h-4 flex-shrink-0 ${
                                  isItemActive ? 'text-slate-950' : 'text-amber-400'
                                }`} />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span>{item.label}</span>
                                    {item.badge && !isItemActive && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-amber-300 border border-slate-700">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className={`text-[10px] mt-0.5 leading-snug line-clamp-1 ${
                                      isItemActive ? 'text-slate-900 font-medium' : 'text-slate-400'
                                    }`}>
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                {item.count !== undefined && item.count > 0 && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isItemActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                                  }`}>
                                    {item.count}
                                  </span>
                                )}
                                {isItemActive ? (
                                  <CheckCircle className="w-4 h-4 text-slate-950" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('ቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ዲጂታል የሰው ኃይል አስተዳደር', 'Benishangul Gumuz Police Commission HRMS')}</span>
              </span>

              <button
                type="button"
                onClick={() => setIsDossierOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                {t('ዝጋ', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
