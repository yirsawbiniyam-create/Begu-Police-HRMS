import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { Role } from '../../types/hrms';
import {
  Shield,
  Bell,
  Globe,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  KeyRound,
  Lock,
  Camera,
  Cloud
} from 'lucide-react';
import { SystemLogoModal } from './SystemLogoModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLoginPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenLoginPortal }) => {
  const {
    currentUser,
    logout,
    currentRole,
    setCurrentRole,
    activeMember,
    activeMemberPoliceId,
    setActiveMemberPoliceId,
    members,
    language,
    setLanguage,
    t,
    systemLogo,
    isLogoSynced,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetToDefaultData
  } = useHrms();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleLabels: Record<Role, { am: string; en: string }> = {
    hr_admin: { am: 'የHR አስተዳዳሪ (HR Admin)', en: 'HR Administrator' },
    management: { am: 'ከፍተኛ አመራር (Command / Management)', en: 'Police Command / Management' },
    payroll_officer: { am: 'የደመወዝ ባለሙያ (Payroll Officer)', en: 'Payroll Officer' },
    supervisor: { am: 'የቅርብ ኃላፊ / አዛዥ (Supervisor)', en: 'Supervisor / Unit Commander' },
    member: { am: 'የፖሊስ አባል (Member Self-Service)', en: 'Police Member Portal' }
  };

  const isMemberSession = currentRole === 'member';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & Emblem */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative group">
              <button
                type="button"
                onClick={() => {
                  if (currentRole === 'hr_admin' || currentRole === 'management') {
                    setShowLogoModal(true);
                  }
                }}
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl shadow-inner border border-amber-400/40 overflow-hidden transition-all active:scale-95 ${
                  currentRole === 'hr_admin' || currentRole === 'management'
                    ? 'cursor-pointer hover:border-amber-300 hover:ring-2 hover:ring-amber-500/30'
                    : 'cursor-default'
                } ${systemLogo ? 'bg-slate-950 p-1' : 'bg-gradient-to-br from-amber-500 to-amber-700'}`}
                title={
                  currentRole === 'hr_admin' || currentRole === 'management'
                    ? t('የኮሚሽኑን ሎጎ ለመቀየር እዚህ ይጫኑ', 'Click to change Commission Logo')
                    : t('የቤኒሻንጉል ጉሙዝ ፖሊስ ይፋዊ አርማ', 'Official Police Commission Emblem')
                }
              >
                {systemLogo ? (
                  <img
                    src={systemLogo}
                    alt="Commission Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Shield className="w-6 h-6 text-slate-950 fill-amber-300 stroke-amber-950" />
                )}
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isLogoSynced ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                  title={isLogoSynced ? 'Cloud Firestore Synced' : 'Ready'}
                />

                {(currentRole === 'hr_admin' || currentRole === 'management') && (
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <Camera className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              </button>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                  {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Police Commission')}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">·</span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {isMemberSession ? t('የአባላት Self-Service ፖርታል', 'Member Self-Service Portal') : t('HRM & Self-Service', 'Official HRMS Portal')}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{t('የቤጉ ፖሊስ ዲጂታል የሰው ኃይል አስተዳደር', 'Begu Police Digital HRMS')}</span>
                {(currentRole === 'hr_admin' || currentRole === 'management') && (
                  <button
                    type="button"
                    onClick={() => setShowLogoModal(true)}
                    className="hidden lg:flex items-center gap-1 text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-normal transition-all"
                    title={t('የሲስተም ሎጎ ቀይር', 'Customize System Logo')}
                  >
                    <Camera className="w-3 h-3 text-amber-400" />
                    <span>{t('ሎጎ ቀይር', 'Change Logo')}</span>
                  </button>
                )}
              </h1>
            </div>
          </div>

          {/* Controls: User Profile, Role, Notifications, Language, Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title={t('ቋንቋ ቀይር', 'Switch Language')}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{language === 'am' ? 'EN' : 'አማ'}</span>
            </button>

            {/* Authenticated Member Badge (Strictly locked to current member) */}
            {isMemberSession && activeMember && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                <img
                  src={activeMember.identity.photoUrl}
                  alt={activeMember.identity.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-amber-300 leading-none">
                    {activeMember.identity.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {activeMember.policeId} · {activeMember.currentRank}
                  </div>
                </div>
                <span className="text-[10px] bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800 font-bold hidden md:inline">
                  {t('የእኔ ማህደር', 'My Profile')}
                </span>
              </div>
            )}

            {/* Non-member Role Selector (Only for Admin / Staff preview) */}
            {!isMemberSession && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowRoleSelector(!showRoleSelector);
                    setShowNotifications(false);
                    setShowMemberSelector(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-medium max-w-[130px] sm:max-w-none truncate">
                    {roleLabels[currentRole][language]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showRoleSelector && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border border-slate-700 py-1 z-50 bg-slate-900">
                    <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t('የተጠቃሚ ሚና ይምረጡ (Select User Role)', 'Select System Role (RBAC)')}
                    </div>
                    {(Object.keys(roleLabels) as Role[]).map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setCurrentRole(r);
                          if (r === 'member') {
                            setActiveTab('self_service');
                          }
                          setShowRoleSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          currentRole === r ? 'text-amber-400 font-semibold bg-slate-800/50' : 'text-slate-200'
                        }`}
                      >
                        <span>{roleLabels[r][language]}</span>
                        {currentRole === r && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t border-slate-800 text-[11px] text-slate-400">
                      {t('እያንዳንዱ ሚና በሲስተም ደንቡ መሰረት የተፈቀደለትን ብቻ ያያል።', 'Role determines specific interface & permissions.')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowRoleSelector(false);
                  setShowMemberSelector(false);
                }}
                className="relative p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title={t('ማሳወቂያዎች', 'Notifications')}
              >
                <Bell className="w-4 h-4 text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      {t('የHR ማሳወቂያዎችና ማንቂያዎች', 'HR Alerts & Notifications')}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        {t('ሁሉንም አንብብ', 'Mark all read')}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        {t('ምንም ማሳወቂያ የለም', 'No notifications')}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkTab) setActiveTab(n.linkTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-800/80 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-100 flex items-center gap-1">
                              {n.type === 'alert' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline flex-shrink-0" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-blue-400 inline flex-shrink-0" />
                              )}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.date.split(' ')[0]}</span>
                          </div>
                          <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout / Switch User Button */}
            <button
              onClick={() => {
                logout();
                if (onOpenLoginPortal) onOpenLoginPortal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold transition-all shadow-sm"
              title={t('ውጣ ወይም መለያ ቀይር', 'Log out / Switch account')}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t('ውጣ', 'Log Out')}</span>
            </button>

            {/* Reset Data Button (Emergency refresh to original demo dataset) */}
            <button
              onClick={() => {
                if (window.confirm(t('ሁሉንም መረጃዎች ወደ መጀመሪያው የሙከራ ዳታ መመለስ ይፈልጋሉ?', 'Reset all data to default demo state?'))) {
                  resetToDefaultData();
                }
              }}
              className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors hidden md:block"
              title={t('መረጃውን እንደ አዲስ ጀምር', 'Reset Demo State')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* System Logo Modal */}
      <SystemLogoModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />
    </header>
  );
};
