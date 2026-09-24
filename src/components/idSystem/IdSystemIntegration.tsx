import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  PoliceRank,
  DepartmentName,
  StationLocation,
  PoliceIdIdentity
} from '../../types/hrms';
import {
  Cpu,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  ArrowRight,
  Database,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building,
  Calendar,
  Sparkles,
  Camera,
  Layers,
  FileCheck,
  Zap,
  Flame,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

interface IdSystemIntegrationProps {
  onOpenMemberFile: (policeId: string) => void;
}

export const IdSystemIntegration: React.FC<IdSystemIntegrationProps> = ({ onOpenMemberFile }) => {
  const {
    externalIdSystemRecords,
    members,
    lookupPoliceIdInIdSystem,
    integrateNewMemberFromIdSystem,
    syncMemberWithIdSystem,
    isLiveIdConnected,
    liveIdStatus,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncWithLiveIdSystemNow,
    autoOpenPersonnelFileFromIdSystem,
    simulateCreateIdInExternalSystem,
    t
  } = useHrms();

  const [activeSubTab, setActiveSubTab] = useState<'hub' | 'create_sim' | 'lookup'>('hub');
  const [searchQuery, setSearchQuery] = useState('BGR-POL-1600001');
  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    found: boolean;
    data?: PoliceIdIdentity;
    alreadyInHrm: boolean;
  }>({
    searched: false,
    found: false,
    alreadyInHrm: false
  });

  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSim, setIsCreatingSim] = useState(false);

  // Simulation Form State (Creating an ID in the ID System)
  const [simFullNameAm, setSimFullNameAm] = useState('ኮንስታብል ተስፋዬ በቀለ ቶሎሳ');
  const [simFullNameEn, setSimFullNameEn] = useState('Constable Tesfaye Bekele Tolosa');
  const [simRankAm, setSimRankAm] = useState<PoliceRank>('ኮንስታብል');
  const [simRankEn, setSimRankEn] = useState('Constable');
  const [simPhone, setSimPhone] = useState('+251917654321');
  const [simBadge, setSimBadge] = useState('POL-16089');
  const [simGender, setSimGender] = useState('ወ');
  const [simBlood, setSimBlood] = useState('O+');
  const [simPhotoUrl, setSimPhotoUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80');

  // Initial Placement when using custom onboarding form
  const [initialRank, setInitialRank] = useState<PoliceRank>('ኮንስታብል');
  const [initialDepartment, setInitialDepartment] = useState<DepartmentName>('ወንጀል መከላከልና ፓትሮል መምሪያ');
  const [initialStation, setInitialStation] = useState<StationLocation>('አሶሳ ከተማ ፖሊስ መምሪያ');
  const [initialPosition, setInitialPosition] = useState('መደበኛ የጥበቃና ፓትሮል ኦፊሰር');
  const [initialGrade, setInitialGrade] = useState(1);
  const [initialStep, setInitialStep] = useState(1);

  const samplePhotos = [
    { label: 'Officer M1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80' },
    { label: 'Officer F1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80' },
    { label: 'Officer M2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80' },
    { label: 'Officer F2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = lookupPoliceIdInIdSystem(searchQuery);
    setSearchResult({
      searched: true,
      found: res.found,
      data: res.data,
      alreadyInHrm: res.alreadyInHrm
    });
    setNotificationMsg(null);
  };

  const handleDirectAutoOpen = (policeId: string) => {
    const res = autoOpenPersonnelFileFromIdSystem(policeId);
    if (res.success) {
      setNotificationMsg({ text: res.message, type: 'success' });
      if (res.newMember) {
        onOpenMemberFile(res.newMember.policeId);
      }
    } else {
      setNotificationMsg({ text: res.message, type: 'error' });
    }
  };

  const handleIntegrate = () => {
    if (!searchResult.data) return;

    const res = integrateNewMemberFromIdSystem(searchResult.data.policeId, {
      rank: initialRank,
      department: initialDepartment,
      station: initialStation,
      position: initialPosition,
      grade: initialGrade,
      step: initialStep
    });

    if (res.success) {
      setNotificationMsg({ text: res.message, type: 'success' });
      handleSearch();
      if (res.newMember) {
        onOpenMemberFile(res.newMember.policeId);
      }
    } else {
      setNotificationMsg({ text: res.message, type: 'error' });
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await syncWithLiveIdSystemNow();
      setNotificationMsg({
        text: res.message,
        type: res.success ? 'success' : 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateInExternalSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSim(true);
    setNotificationMsg(null);
    try {
      const res = await simulateCreateIdInExternalSystem({
        fullNameAm: simFullNameAm,
        fullNameEn: simFullNameEn,
        rankAm: simRankAm,
        rankEn: simRankEn,
        phone: simPhone,
        photoUrl: simPhotoUrl,
        gender: simGender,
        badgeNumber: simBadge,
        bloodType: simBlood
      });

      setNotificationMsg({ text: res.message, type: 'success' });
      if (res.autoCreatedMember) {
        onOpenMemberFile(res.autoCreatedMember.policeId);
      }
    } catch (err: any) {
      setNotificationMsg({ text: err?.message || 'ስህተት ተከስቷል', type: 'error' });
    } finally {
      setIsCreatingSim(false);
    }
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSimPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Principle & Architecture Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                {t('የመታወቂያ ሲስተም ውህደት', 'POLICE ID SYSTEM INTEGRATION GATEWAY')}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Flame size={12} className="text-emerald-400 animate-pulse" />
                Firebase Live (bg-police-id-system)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t(
                'በመታወቂያ ሲስተም መታወቂያ ሲሰራ ➜ ፎቶውን በመውሰድ በHRM ማህደር የመክፈት ሂደት',
                'ID System Direct Photo Ingestion & Automated HRM Dossier Provisioning'
              )}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              {t(
                'የፖሊስ መታወቂያ ቁጥር፣ ባዮሜትሪክ ማንነት እና ፎቶ የሚመነጩት በነባሩ የፖሊስ መታወቂያ ሲስተም (Police ID System) ብቻ ነው። ለአንድ አባል እዚያ መታወቂያ ሲሰራ፣ የHRM ሲስተሙ የቀጥታ የFirebase REST APIን በመጠቀም የመታወቂያ ፎቶውንና መረጃውን በራስ-ሰር በመውሰድ የተሟላ ዲጂታል ማህደር ይከፍታል። ከዚያ በኋላ በHRM ላይ ማዕረግ፣ ደመወዝ፣ ዝውውርና ሌሎች ስራዎች ይከናወናሉ።',
                'Police ID numbers and biometric card photos are issued exclusively by the standalone Police ID System. When an ID is created there, this HRM System instantly ingests the official ID photo and identity into a master digital personnel dossier, enabling seamless promotions, payroll, postings, and service operations.'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Auto-Sync Toggle Switch */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-200">
                  {t('በራስ-ሰር ማህደር ክፈት', 'Auto-Open Dossier')}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  {autoSyncEnabled ? t('በርቷል (Enabled)', 'Active') : t('ጠፍቷል (Disabled)', 'Off')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSyncEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Manual Sync Now Button */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? t('እየተመሳሰለ ነው...', 'Syncing...') : t('አሁን አመሳስል', 'Sync Live IDs')}
            </button>
          </div>
        </div>

        {/* 3 Step Interactive Workflow Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {t('በመታወቂያ ሲስተም መታወቂያ ይሰራል', '1. ID Created in ID System')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('ፎቶ፣ የልደት ቀን፣ ማዕረግና የፖሊስ ID ይመደባል።', 'Officer photo, details & ID assigned.')}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {t('HRM ፎቶውን ወስዶ ማህደር ይከፍታል', '2. HRM Ingests Photo & Opens File')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('የመታወቂያ ፎቶው ተወስዶ ሙሉ ዲጂታል ማህደር ይከፈታል።', 'ID photo ingested into permanent dossier.')}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {t('በHRM ላይ ሌሎች ስራዎች ይከናወናሉ', '3. Perform all HR Operations')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('ማዕረግ እድገት፣ ደመወዝ፣ ዝውውር፣ ስልጠና፣ ፈቃድ...', 'Promotions, salary scale, postings & leave.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Banner */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fadeIn ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notificationMsg.text}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-xs font-bold underline hover:opacity-75"
          >
            {t('ዝጋ', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('hub')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'hub'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          {t('የመታወቂያዎች ማዕከልና ማህደሮች', 'ID System Records & Dossiers')}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
            {externalIdSystemRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('create_sim')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'create_sim'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap size={16} className="text-amber-500" />
          {t('አዲስ መታወቂያ ስራ ➜ በHRM ማህደር አስከፍት', 'Simulate ID Creation ➜ Auto Dossier')}
        </button>

        <button
          onClick={() => setActiveSubTab('lookup')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'lookup'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search size={16} />
          {t('በID ቁጥር ፈልግና ምደባ ምረጥ', 'Manual ID Lookup & Custom Placement')}
        </button>
      </div>

      {/* TAB 1: Hub & Roster */}
      {activeSubTab === 'hub' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Database size={16} className="text-blue-600" />
                  {t('በመታወቂያ ሲስተም የተመዘገቡ አባላት ዝርዝር', 'Officers Registered in Police ID System')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'በመታወቂያ ሲስተሙ የተሰሩ መታወቂያዎች እዚህ ይታያሉ። ማህደር ያልተከፈተላቸውን በአንድ ክሊክ ፎቷቸውን ወስደህ ማህደር መክፈት ትችላለህ።',
                    'All ID cards issued in ID system. Click to open dossier using the member ID photo or inspect existing HRM file.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {t('በHRM የተከፈቱ:', 'In HRM:')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {members.length} {t('ማህደሮች', 'dossiers')}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">{t('የአባል ፎቶና ስም', 'Member Photo & Name')}</th>
                    <th className="py-3 px-4">{t('የፖሊስ ID ቁጥር', 'Police ID Number')}</th>
                    <th className="py-3 px-4">{t('ማዕረግና ባጅ', 'Rank & Badge')}</th>
                    <th className="py-3 px-4">{t('ስልክና ደም', 'Phone & Blood')}</th>
                    <th className="py-3 px-4">{t('የHRM ማህደር ሁኔታ', 'HRM Dossier Status')}</th>
                    <th className="py-3 px-4 text-right">{t('ተግባራት', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {externalIdSystemRecords.map((idRec) => {
                    const existingMember = members.find(
                      m => m.policeId.toUpperCase() === idRec.policeId.toUpperCase()
                    );
                    const hasDossier = !!existingMember;

                    return (
                      <tr key={idRec.policeId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shrink-0 shadow-sm relative group">
                              <img
                                src={idRec.photoUrl}
                                alt={idRec.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {idRec.fullName}
                              </div>
                              {idRec.fullNameEn && (
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {idRec.fullNameEn}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {idRec.gender} • {idRec.address.zone}, {idRec.address.wereda}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                            {idRec.policeId}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {idRec.rankAm || 'ኮንስታብል'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {idRec.badgeNumber || 'POL-16000'}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <div>{idRec.phone || 'N/A'}</div>
                          <div className="text-[11px] font-bold text-rose-600">
                            {idRec.bloodGroup || 'O+'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {hasDossier ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle size={12} className="text-emerald-600" />
                              {t('ማህደር ተከፍቷል (ገባሪ)', 'Dossier Active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Zap size={12} className="text-amber-600" />
                              {t('አዲስ ከመታወቂያ ሲስተም', 'Pending Dossier')}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {hasDossier ? (
                            <button
                              onClick={() => onOpenMemberFile(idRec.policeId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                            >
                              <FileCheck size={13} />
                              {t('ማህደሩን እይና ስራ', 'Open Dossier')}
                              <ArrowRight size={12} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDirectAutoOpen(idRec.policeId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <Camera size={13} />
                              {t('ፎቶውን ወስደህ ማህደር ክፈት', 'Auto Ingest & Open')}
                              <ArrowUpRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Simulation / Live Test Creation */}
      {activeSubTab === 'create_sim' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                <Zap size={13} className="text-amber-600" />
                {t('የተጠቃሚ ጥያቄ ማስፈጸሚያ ሞካሪ (Real Pipeline Demonstration)', 'Interactive ID-to-HRM Pipeline')}
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {t(
                  'በሌላ መታወቂያ ሲስተም ለአንድ አባል መታወቂያ ስራ ➜ ቀጥታ በHRM ላይ ፎቶውን በመውሰድ ማህደር ክፈት',
                  'Simulate ID Creation in External ID System ➜ Instantly Capture Photo & Open HRM File'
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'በዚህ ፎርም አዲስ የፖሊስ መታወቂያ ሲሰራ፣ ሲስተሙ ወዲያውኑ የመታወቂያ ፎቶውን ወስዶ በHRM ላይ የተሟላ ዲጂታል ማህደር (Digital Dossier) ይከፍታል። ከዚያ በኋላ ወዲያውኑ ማዕረግ፣ ደመወዝ፣ ዝውውርና ሌሎች ስራዎችን መስራት ትችላለህ።',
                  'Submitting this form issues an ID in the ID system, which triggers immediate photo ingestion into an active HRM dossier, opening up full HR workflows.'
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateInExternalSystem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Preview & Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('የአባሉ ይፋዊ የመታወቂያ ፎቶ (ID Card Photo)', 'Official ID Card Photo')}
                </label>

                <div className="w-full aspect-[3/4] max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-slate-300 overflow-hidden bg-slate-50 relative shadow-inner flex items-center justify-center">
                  <img
                    src={simPhotoUrl}
                    alt="ID Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 p-2 text-center text-white text-[11px] font-bold">
                    {t('ይህ ፎቶ ወደ HRM ማህደር ይገባል', 'Direct Ingestion into HRM')}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600">
                    {t('ናሙና ፎቶ ምረጥ ወይም የራስህን ጫን:', 'Choose Sample Photo or Upload:')}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {samplePhotos.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSimPhotoUrl(p.url)}
                        className={`p-1 rounded-lg border overflow-hidden ${
                          simPhotoUrl === p.url ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-200'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-10 object-cover rounded" />
                      </button>
                    ))}
                  </div>

                  <label className="mt-2 block w-full text-center px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                    <Camera size={13} className="inline mr-1 text-slate-500" />
                    {t('የራስህን ፎቶ ጫን (Upload Photo)', 'Upload Custom Photo')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form Details */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('ሙሉ ስም (በአማርኛ) *', 'Full Name (Amharic) *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={simFullNameAm}
                      onChange={(e) => setSimFullNameAm(e.target.value)}
                      placeholder="ለምሳሌ፡ ኮንስታብል ተስፋዬ በቀለ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Full Name (English) *', 'Full Name (English) *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={simFullNameEn}
                      onChange={(e) => setSimFullNameEn(e.target.value)}
                      placeholder="e.g. Constable Tesfaye Bekele"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('የመጀመሪያ ማዕረግ *', 'Initial Police Rank *')}
                    </label>
                    <select
                      value={simRankAm}
                      onChange={(e) => {
                        const val = e.target.value as PoliceRank;
                        setSimRankAm(val);
                        setSimRankEn(val === 'ኮንስታብል' ? 'Constable' : val === 'ሳጅን' ? 'Sergeant' : 'Inspector');
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                    >
                      <option value="ኮንስታብል">ኮንስታብል (Constable)</option>
                      <option value="ረዳት ሳጅን">ረዳት ሳጅን (Asst Sergeant)</option>
                      <option value="ምክትል ሳጅን">ምክትል ሳጅን (Deputy Sergeant)</option>
                      <option value="ሳጅን">ሳጅን (Sergeant)</option>
                      <option value="ዋና ሳጅን">ዋና ሳጅን (Chief Sergeant)</option>
                      <option value="ረዳት ኢንስፔክተር">ረዳት ኢንስፔክተር (Asst Inspector)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('የባጅ ቁጥር', 'Badge Number')}
                    </label>
                    <input
                      type="text"
                      value={simBadge}
                      onChange={(e) => setSimBadge(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('ስልክ ቁጥር', 'Phone Number')}
                    </label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('ፆታ', 'Gender')}
                    </label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="simGender"
                          checked={simGender === 'ወ'}
                          onChange={() => setSimGender('ወ')}
                        />
                        {t('ወንድ (Male)', 'Male')}
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="simGender"
                          checked={simGender === 'ሴ'}
                          onChange={() => setSimGender('ሴ')}
                        />
                        {t('ሴት (Female)', 'Female')}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('የደም ዓይነት', 'Blood Group')}
                    </label>
                    <select
                      value={simBlood}
                      onChange={(e) => setSimBlood(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {/* Instant Ingestion CTA */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>
                      {t(
                        'መታወቂያው ሲሰራ ወዲያውኑ ፎቶውን ወስዶ የHRM ማህደር ይከፍታል።',
                        'Instantly creates ID in ID system & opens full dossier in HRM.'
                      )}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingSim}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    <Zap size={16} className={isCreatingSim ? 'animate-spin' : ''} />
                    {isCreatingSim
                      ? t('እየተሰራ ነው...', 'Processing...')
                      : t('መታወቂያ ስራና በHRM ማህደር ክፈት', 'Issue ID & Auto-Create HRM File')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Manual Search & Custom Onboarding Placement */}
      {activeSubTab === 'lookup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('የPolice ID ፍለጋና ማረጋገጫ', 'Police ID Lookup & Verification')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'ከመታወቂያ ሲስተሙ የተሰጠውን ልዩ የፖሊስ መታወቂያ ቁጥር በማስገባት የተረጋገጠ ማንነትና ፎቶ ያግኙ።',
                  'Lookup an existing Police ID from the Police ID System to verify biometrics and photo.'
                )}
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. BGR-POL-1600001 or BG-000125"
                  className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                >
                  {t('ፈልግ', 'Search')}
                </button>
              </div>
            </form>

            {/* Quick Demo Selector */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 block mb-2">
                {t('ለሙከራ የሚሆኑ ፈጣን መታወቂያዎች (Quick Demo IDs):', 'Sample IDs to test:')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {externalIdSystemRecords.slice(0, 5).map(ext => (
                  <button
                    key={ext.policeId}
                    type="button"
                    onClick={() => {
                      setSearchQuery(ext.policeId);
                      const res = lookupPoliceIdInIdSystem(ext.policeId);
                      setSearchResult({
                        searched: true,
                        found: res.found,
                        data: res.data,
                        alreadyInHrm: res.alreadyInHrm
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    {ext.policeId}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Result & Placement Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {searchResult.searched ? (
              searchResult.found && searchResult.data ? (
                <div className="space-y-6">
                  {/* Verified Card Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0 shadow-sm">
                        <img
                          src={searchResult.data.photoUrl}
                          alt={searchResult.data.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                          <ShieldCheck size={12} />
                          {t('በመታወቂያ ሲስተም የተረጋገጠ ማንነት', 'Verified ID System Record')}
                        </div>
                        <h4 className="text-base font-black text-slate-900 leading-tight">
                          {searchResult.data.fullName}
                        </h4>
                        <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                          {searchResult.data.policeId}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {searchResult.data.gender} • {t('የተሰጠበት ቀን:', 'Issued:')} {searchResult.data.issueDate}
                        </div>
                      </div>
                    </div>

                    <div>
                      {searchResult.alreadyInHrm ? (
                        <div className="text-center sm:text-right space-y-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle size={14} />
                            {t('ማህደሩ ቀድሞውኑ ተከፍቷል', 'Dossier Already Active')}
                          </span>
                          <button
                            onClick={() => onOpenMemberFile(searchResult.data!.policeId)}
                            className="block w-full text-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
                          >
                            {t('ማህደሩን እይና ስራ', 'Open Dossier')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDirectAutoOpen(searchResult.data!.policeId)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                        >
                          <Camera size={14} />
                          {t('ፎቶውን ወስደህ ማህደር ክፈት', 'Auto Ingest & Open File')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If not in HRM, show optional initial placement customization */}
                  {!searchResult.alreadyInHrm && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {t('የመጀመሪያ ምደባና የስራ ደረጃ ማስተካከያ (Initial Placement)', 'Initial Placement')}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {t('የመጀመሪያ ማዕረግ', 'Initial Rank')}
                          </label>
                          <select
                            value={initialRank}
                            onChange={(e) => setInitialRank(e.target.value as PoliceRank)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ኮንስታብል">ኮንስታብል (Constable)</option>
                            <option value="ረዳት ሳጅን">ረዳት ሳጅን (Asst Sergeant)</option>
                            <option value="ምክትል ሳጅን">ምክትል ሳጅን (Deputy Sergeant)</option>
                            <option value="ሳጅን">ሳጅን (Sergeant)</option>
                            <option value="ረዳት ኢንስፔክተር">ረዳት ኢንስፔክተር (Asst Inspector)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {t('የተመደበበት መምሪያ', 'Department')}
                          </label>
                          <select
                            value={initialDepartment}
                            onChange={(e) => setInitialDepartment(e.target.value as DepartmentName)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ወንጀል መከላከልና ፓትሮል መምሪያ">ወንጀል መከላከልና ፓትሮል መምሪያ</option>
                            <option value="ወንጀል ምርመራ መምሪያ">ወንጀል ምርመራ መምሪያ</option>
                            <option value="ትራፊክ ደህንነትና ቁጥጥር መምሪያ">ትራፊክ ደህንነትና ቁጥጥር መምሪያ</option>
                            <option value="ልዩ ፈጣን ኃይል መምሪያ">ልዩ ፈጣን ኃይል መምሪያ</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleIntegrate}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors inline-flex items-center gap-2"
                        >
                          <UserPlus size={14} />
                          {t('በተመረጠው ምደባ ማህደር ክፈት', 'Open Dossier with Custom Placement')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <AlertCircle size={36} className="mx-auto text-rose-500 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">
                    {t('ይህ የPolice ID በመታወቂያ ሲስተም ውስጥ አልተገኘም', 'ID Not Found in Police ID System')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('እባክዎ ትክክለኛውን የፖሊስ መታወቂያ ቁጥር ያስገቡ።', 'Please check and enter a valid issued Police ID.')}
                  </p>
                </div>
              )
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Search size={32} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  {t('የፖሊስ ID ቁጥር አስገብተው ፈልግ የሚለውን ይጫኑ', 'Enter Police ID and click Search')}
                </p>
                <p className="text-xs text-slate-400">
                  {t('በመታወቂያ ሲስተሙ የተመዘገበው ፎቶና መረጃ ወዲያውኑ ይመጣል።', 'Official biometric ID record will be retrieved.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
