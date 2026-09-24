import React, { useState, useEffect } from 'react';
import { HrmsProvider, useHrms } from './context/HrmsContext';
import { Header } from './components/common/Header';
import { NavigationTabs } from './components/common/NavigationTabs';
import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { PersonnelRegistry } from './components/personnel/PersonnelRegistry';
import { MemberPersonnelFileModal } from './components/personnel/MemberPersonnelFileModal';
import { IdSystemIntegration } from './components/idSystem/IdSystemIntegration';
import { MemberSelfServicePortal } from './components/selfService/MemberSelfServicePortal';
import { ApplicationWorkflowManager } from './components/applications/ApplicationWorkflowManager';
import { PayrollManager } from './components/payroll/PayrollManager';
import { SeparationManager } from './components/separation/SeparationManager';
import { ReportsHub } from './components/reports/ReportsHub';
import { AuditTrailViewer } from './components/audit/AuditTrailViewer';
import { LoginPortal } from './components/auth/LoginPortal';
import { UserAccountsManager } from './components/auth/UserAccountsManager';
import { MemberProfile } from './types/hrms';
import { Shield, Lock } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { members, currentUser, currentRole, t } = useHrms();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentRole === 'member' ? 'self_service' : 'dashboard';
  });
  const [selectedMemberForFile, setSelectedMemberForFile] = useState<MemberProfile | null>(null);

  // When logged in as member, strictly constrain to self_service
  useEffect(() => {
    if (currentRole === 'member') {
      setActiveTab('self_service');
    }
  }, [currentRole]);

  // If not logged in, show secure login portal
  if (!currentUser) {
    return (
      <LoginPortal
        onLoginSuccess={() => {
          setActiveTab(currentRole === 'member' ? 'self_service' : 'dashboard');
        }}
      />
    );
  }

  const handleOpenMemberFile = (policeId: string) => {
    const found = members.find(m => m.policeId.toUpperCase() === policeId.toUpperCase());
    if (found) {
      setSelectedMemberForFile(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Navigation Sub-header (only show if not strictly constrained or show member single tab) */}
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <OperationsDashboard
            onNavigateTab={setActiveTab}
            onOpenMemberFile={handleOpenMemberFile}
          />
        )}

        {activeTab === 'id_integration' && (
          <IdSystemIntegration onOpenMemberFile={handleOpenMemberFile} />
        )}

        {activeTab === 'user_accounts' && (
          <UserAccountsManager />
        )}

        {activeTab === 'personnel' && (
          <PersonnelRegistry onOpenIdGateway={() => setActiveTab('id_integration')} />
        )}

        {activeTab === 'self_service' && (
          <MemberSelfServicePortal />
        )}

        {activeTab === 'applications' && (
          <ApplicationWorkflowManager />
        )}

        {activeTab === 'payroll' && (
          <PayrollManager />
        )}

        {activeTab === 'separation' && (
          <SeparationManager />
        )}

        {activeTab === 'reports' && (
          <ReportsHub />
        )}

        {activeTab === 'audit' && (
          <AuditTrailViewer />
        )}
      </main>

      {/* Global Member Personnel File Modal */}
      {selectedMemberForFile && (
        <MemberPersonnelFileModal
          member={selectedMemberForFile}
          onClose={() => setSelectedMemberForFile(null)}
        />
      )}

      {/* Official Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Regional Police Commission')}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('ዲጂታል የሰው ኃይል አስተዳደርና የአባላት Self-Service HRM System', 'Digital Human Resource Management & Member Self-Service Portal')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('የተጠበቀ የደህንነት ሲስተም (Protected Network)', 'Authoritative ID-Locked Database')}</span>
            </span>
            <span className="text-slate-400 font-mono">v2.5.0-PROD</span>
            <span className="text-slate-400">© 2026 BG Police Commission. {t('መብቱ በህግ የተጠበቀ ነው።', 'All rights reserved.')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <HrmsProvider>
      <MainAppContent />
    </HrmsProvider>
  );
}
