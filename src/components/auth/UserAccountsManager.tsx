import React, { useState, useMemo } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { MemberProfile, SystemUserAccount, Role, DepartmentName, StationLocation } from '../../types/hrms';
import {
  KeyRound,
  Shield,
  UserCheck,
  Search,
  Filter,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  Sparkles,
  AlertCircle,
  CheckCircle,
  UserX,
  BadgeAlert,
  FileText,
  Building,
  MapPin,
  RefreshCw,
  Users
} from 'lucide-react';

export const UserAccountsManager: React.FC = () => {
  const {
    members,
    userAccounts,
    provisionMemberCredentials,
    toggleUserAccountStatus,
    createStaffAccount,
    deleteStaffAccount,
    t
  } = useHrms();

  const [activeTab, setActiveTab] = useState<'members' | 'staff'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'provisioned' | 'unprovisioned'>('all');

  // Modal State for Provisioning / Resetting Member Credential
  const [selectedMemberForCred, setSelectedMemberForCred] = useState<MemberProfile | null>(null);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('Police@2026');
  const [showPassword, setShowPassword] = useState(true);
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);
  const [provisionErrorMsg, setProvisionErrorMsg] = useState<string | null>(null);
  const [copiedSlip, setCopiedSlip] = useState(false);

  // Modal State for New Staff Account
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('Staff@2026');
  const [staffRole, setStaffRole] = useState<Role>('supervisor');
  const [staffDepartment, setStaffDepartment] = useState<DepartmentName>('ወንጀል መከላከልና ፓትሮል መምሪያ');
  const [staffStation, setStaffStation] = useState<StationLocation>('አሶሳ ከተማ ፖሊስ መምሪያ');
  const [staffError, setStaffError] = useState<string | null>(null);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.policeId.toLowerCase().includes(q) ||
        m.identity.fullName.toLowerCase().includes(q) ||
        m.badgeNumber.toLowerCase().includes(q) ||
        m.currentStation.toLowerCase().includes(q) ||
        (m.userAccount?.username && m.userAccount.username.toLowerCase().includes(q));

      const hasAccount = Boolean(
        m.userAccount?.password || userAccounts.some(u => u.policeId === m.policeId)
      );

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'provisioned' && hasAccount) ||
        (filterStatus === 'unprovisioned' && !hasAccount);

      return matchesSearch && matchesFilter;
    });
  }, [members, userAccounts, searchQuery, filterStatus]);

  // Non-member staff accounts
  const staffAccounts = useMemo(() => {
    return userAccounts.filter(u => u.role !== 'member');
  }, [userAccounts]);

  const handleOpenProvisionModal = (m: MemberProfile) => {
    setSelectedMemberForCred(m);
    // Default username to member's Police ID (or existing username)
    setInputUsername(m.userAccount?.username || m.policeId);
    setInputPassword(m.userAccount?.password || 'Police@2026');
    setProvisionSuccessMsg(null);
    setProvisionErrorMsg(null);
    setCopiedSlip(false);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputPassword(`Pol@${rand}26`);
  };

  const handleSaveMemberCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForCred) return;

    setProvisionErrorMsg(null);
    const res = provisionMemberCredentials(
      selectedMemberForCred.policeId,
      inputUsername,
      inputPassword
    );

    if (res.success) {
      setProvisionSuccessMsg(res.message);
    } else {
      setProvisionErrorMsg(res.message);
    }
  };

  const handleCreateStaffAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    const res = createStaffAccount({
      fullName: staffFullName,
      username: staffUsername,
      password: staffPassword,
      role: staffRole,
      department: staffDepartment,
      station: staffStation,
      isActive: true
    });

    if (res.success) {
      setShowNewStaffModal(false);
      setStaffFullName('');
      setStaffUsername('');
      setStaffPassword('Staff@2026');
    } else {
      setStaffError(res.message);
    }
  };

  const handleCopySlip = () => {
    if (!selectedMemberForCred) return;
    const slip = `የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን
የአባል Self-Service መግቢያ መለያ ማረጋገጫ ወረቀት
---------------------------------------
የአባል ስም: ${selectedMemberForCred.identity.fullName}
የፖሊስ መታወቂያ: ${selectedMemberForCred.policeId}
ማዕረግ: ${selectedMemberForCred.currentRank}
የተጠቃሚ ስም (Username): ${inputUsername}
የይለፍ ቃል (Password): ${inputPassword}
---------------------------------------
ማሳሰቢያ፡ ይህ መለያ የእርስዎ ብቻ ስለሆነ በጥንቃቄ ይያዙ።`;

    navigator.clipboard.writeText(slip);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('የተጠቃሚዎችና የመግቢያ መለያዎች አስተዳደር', 'User Credentials & Access Management')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {t(
              'ለፖሊስ አባላት በመታወቂያ ቁጥራቸው መሰረት ዩሰርኔምና ፓስዎርድ በመፍጠር የSelf-Service ፖርታል መዳረሻ ይስጡ፤ እንዲሁም ለጣቢያ አዛዦችና የደመወዝ ባለሙያዎች መለያዎችን ያስተዳድሩ።',
              'Authorize and provision portal credentials for police members using their Police ID, and control access permissions for supervisors and operational staff.'
            )}
          </p>
        </div>

        {activeTab === 'staff' && (
          <button
            onClick={() => setShowNewStaffModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('አዲስ የኃላፊ መለያ ፍጠር', 'Create Staff Account')}</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('የፖሊስ አባላት Self-Service መለያዎች', 'Police Member Portal Accounts')}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'staff'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t('የኃላፊዎችና የባለሙያዎች መለያዎች', 'Supervisors & Staff Accounts')}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
            {staffAccounts.length}
          </span>
        </button>
      </div>

      {/* TAB 1: POLICE MEMBER PORTAL ACCOUNTS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">{t('ጠቅላላ የተመዘገቡ አባላት', 'Total Officers')}</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{members.length}</div>
              </div>
              <Users className="w-8 h-8 text-slate-700" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold">{t('የመግቢያ መለያ የተሰጣቸው', 'Provisioned Accounts')}</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {members.filter(m => m.userAccount?.password || userAccounts.some(u => u.policeId === m.policeId)).length}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/30" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-semibold">{t('መለያ የሚጠብቁ (ያልተሰጣቸው)', 'Unprovisioned / Pending')}</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {members.filter(m => !m.userAccount?.password && !userAccounts.some(u => u.policeId === m.policeId)).length}
                </div>
              </div>
              <BadgeAlert className="w-8 h-8 text-amber-500/30" />
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('በስም፣ በፖሊስ መታወቂያ፣ ወይም በተጠቃሚ ስም ፈልግ...', 'Search by ID, name, or username...')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">{t('ማጣሪያ:', 'Filter:')}</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="all">{t('ሁሉም አባላት (All)', 'All Members')}</option>
                <option value="provisioned">{t('መለያ የተሰጣቸው ብቻ', 'Provisioned Only')}</option>
                <option value="unprovisioned">{t('መለያ ያልተሰጣቸው ብቻ', 'Unprovisioned Only')}</option>
              </select>
            </div>
          </div>

          {/* Members Credential Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Police ID</th>
                    <th className="py-3 px-4">{t('የአባሉ ስም & ማዕረግ', 'Officer Name & Rank')}</th>
                    <th className="py-3 px-4">{t('የተጠቃሚ ስም (Username)', 'Username')}</th>
                    <th className="py-3 px-4">{t('የይለፍ ቃል ሁኔታ', 'Password Status')}</th>
                    <th className="py-3 px-4">{t('የመለያ ሁኔታ', 'Account Status')}</th>
                    <th className="py-3 px-4 text-right">{t('የአድሚን ተግባር', 'Admin Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                        {t('ምንም የተገኘ አባል የለም', 'No officers match the search or filter.')}
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map(m => {
                      const userAcc = userAccounts.find(u => u.policeId === m.policeId);
                      const hasAccount = Boolean(m.userAccount?.password || userAcc);
                      const currentUsername = userAcc?.username || m.userAccount?.username || m.policeId;
                      const isActive = userAcc ? userAcc.isActive : (m.userAccount?.isActive ?? true);

                      return (
                        <tr key={m.policeId} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                            {m.policeId}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={m.identity.photoUrl}
                                alt={m.identity.fullName}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-white">{m.identity.fullName}</div>
                                <div className="text-[11px] text-slate-400">
                                  {m.currentRank} · {m.currentStation}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {hasAccount ? (
                              <span className="font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {currentUsername}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">{t('ያልተዘጋጀ', 'Not set')}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {hasAccount ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <Lock className="w-3 h-3" />
                                {t('ሚስጥር ቃል ተዘጋጅቷል', 'Configured')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <AlertCircle className="w-3 h-3" />
                                {t('መለያ የለውም', 'No Access')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {hasAccount ? (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-rose-500/15 text-rose-400'
                                }`}
                              >
                                {isActive ? t('ንቁ (Active)', 'Active') : t('የታገደ (Disabled)', 'Disabled')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                            {userAcc && (
                              <button
                                onClick={() => toggleUserAccountStatus(userAcc.id)}
                                title={isActive ? t('መለያውን አግድ', 'Deactivate Account') : t('መለያውን አግብር', 'Activate Account')}
                                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                  isActive
                                    ? 'border-rose-800/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60'
                                    : 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60'
                                }`}
                              >
                                {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenProvisionModal(m)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all ${
                                hasAccount
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                              }`}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>
                                {hasAccount
                                  ? t('መለያ አሻሽል / ቀይር', 'Reset Login')
                                  : t('የመግቢያ መለያ ስጥ', 'Provision Login')}
                              </span>
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
      )}

      {/* TAB 2: STAFF & OFFICERS ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t('የኃላፊው / የባለሙያው ስም', 'Staff Name')}</th>
                    <th className="py-3 px-4">{t('የተጠቃሚ ስም (Username)', 'Username')}</th>
                    <th className="py-3 px-4">{t('የስራ ድርሻ (Role)', 'Assigned Role')}</th>
                    <th className="py-3 px-4">{t('መምሪያ / ጣቢያ', 'Department & Station')}</th>
                    <th className="py-3 px-4">{t('ሁኔታ', 'Status')}</th>
                    <th className="py-3 px-4 text-right">{t('ተግባራት', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {staffAccounts.map(st => (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{st.fullName}</td>
                      <td className="py-3 px-4 font-mono text-amber-400 font-bold">{st.username}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.role === 'hr_admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : st.role === 'supervisor'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : st.role === 'payroll_officer'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {st.role === 'hr_admin'
                            ? 'HR Admin'
                            : st.role === 'supervisor'
                            ? 'Supervisor'
                            : st.role === 'payroll_officer'
                            ? 'Payroll Officer'
                            : 'Management'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div>{st.department || '—'}</div>
                        <div className="text-[10px] text-slate-400">{st.station || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.isActive
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {st.isActive ? t('ንቁ', 'Active') : t('የታገደ', 'Disabled')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => toggleUserAccountStatus(st.id)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                            st.isActive
                              ? 'border-rose-800 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60'
                              : 'border-emerald-800 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60'
                          }`}
                        >
                          {st.isActive ? t('አግድ', 'Deactivate') : t('አግብር', 'Activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION / RESET MEMBER CREDENTIAL MODAL */}
      {selectedMemberForCred && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {t('ለአባል የSelf-Service መግቢያ መለያ መስጫ', 'Provision Member Portal Credentials')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('በፖሊስ መታወቂያ ቁጥር የተጠቃሚ ስምና የይለፍ ቃል ፍጠር', 'Set login username & password for the officer')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForCred(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Officer Brief */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <img
                src={selectedMemberForCred.identity.photoUrl}
                alt={selectedMemberForCred.identity.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400/60 shadow"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.2 rounded border border-amber-400/20">
                    {selectedMemberForCred.policeId}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {selectedMemberForCred.currentRank}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm truncate mt-0.5">
                  {selectedMemberForCred.identity.fullName}
                </h4>
                <div className="text-[11px] text-slate-400 truncate">
                  {selectedMemberForCred.currentDepartment} · {selectedMemberForCred.currentStation}
                </div>
              </div>
            </div>

            {provisionErrorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{provisionErrorMsg}</span>
              </div>
            )}

            {provisionSuccessMsg && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>{provisionSuccessMsg}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {t(
                    'አባሉ በዚህ ዩሰርኔምና ፓስዎርድ ገብቶ የራሱን ማህደር ብቻ መመልከትና ማመልከቻዎችን ማቅረብ ይችላል።',
                    'The officer can now log into the Self-Service Portal to view their dossier and submit requests.'
                  )}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleCopySlip}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    {copiedSlip ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSlip ? t('ተገልብጧል!', 'Copied!') : t('የመግቢያ ወረቀት ኮፒ አድርግ', 'Copy Credential Slip')}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('አትም', 'Print Slip')}</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveMemberCredential} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t('የተጠቃሚ ስም (Username)', 'Username for Member')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setInputUsername(selectedMemberForCred.policeId)}
                    className="text-[10px] text-amber-400 hover:underline font-mono"
                  >
                    {t('በፖሊስ መታወቂያው አድርግ', 'Use Police ID')}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={inputUsername}
                  onChange={e => setInputUsername(e.target.value)}
                  placeholder="ለምሳሌ፡ BG-000101"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t('የይለፍ ቃል (Password)', 'Password')}
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t('አዲስ ፓስዎርድ አመንጭ', 'Generate Random')}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={inputPassword}
                    onChange={e => setInputPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 pr-10 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Credential Slip Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-amber-400 font-bold text-center border-b border-slate-800 pb-1">
                  የአባል የመግቢያ ማረጋገጫ ወረቀት (Credential Slip)
                </div>
                <div className="flex justify-between">
                  <span>Police ID:</span>
                  <span className="text-white font-bold">{selectedMemberForCred.policeId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Username:</span>
                  <span className="text-amber-300 font-bold">{inputUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <span className="text-emerald-400 font-bold">{inputPassword}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMemberForCred(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  {t('ዝጋ', 'Close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{t('መለያውን አጽድቅና ስጥ', 'Save & Grant Credentials')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STAFF ACCOUNT MODAL */}
      {showNewStaffModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>{t('አዲስ የኃላፊ/ባለሙያ መለያ ማመንጫ', 'Create Staff / Supervisor Account')}</span>
              </h3>
              <button onClick={() => setShowNewStaffModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {staffError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {staffError}
              </div>
            )}

            <form onSubmit={handleCreateStaffAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ሙሉ ስም', 'Full Name')}</label>
                <input
                  type="text"
                  required
                  value={staffFullName}
                  onChange={e => setStaffFullName(e.target.value)}
                  placeholder="ለምሳሌ፡ ኮማንደር ሙሉጌታ ታደሰ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተጠቃሚ ስም', 'Username')}</label>
                  <input
                    type="text"
                    required
                    value={staffUsername}
                    onChange={e => setStaffUsername(e.target.value)}
                    placeholder="supervisor.bambasi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የይለፍ ቃል', 'Password')}</label>
                  <input
                    type="text"
                    required
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የስራ ድርሻ (Role)', 'Role')}</label>
                <select
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="supervisor">{t('የጣቢያ / የመምሪያ አዛዥ (Supervisor)', 'Station / Directorate Supervisor')}</option>
                  <option value="payroll_officer">{t('የደመወዝ ባለሙያ (Payroll Officer)', 'Payroll Officer')}</option>
                  <option value="management">{t('ከፍተኛ አመራር (Management)', 'Commission Management')}</option>
                  <option value="hr_admin">{t('HR አስተዳዳሪ (HR Admin)', 'HR Administrator')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('መምሪያ', 'Department')}</label>
                <select
                  value={staffDepartment}
                  onChange={e => setStaffDepartment(e.target.value as DepartmentName)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="ወንጀል ምርመራ መምሪያ">ወንጀል ምርመራ መምሪያ</option>
                  <option value="ወንጀል መከላከልና ፓትሮል መምሪያ">ወንጀል መከላከልና ፓትሮል መምሪያ</option>
                  <option value="ትራፊክ ደህንነትና ቁጥጥር መምሪያ">ትራፊክ ደህንነትና ቁጥጥር መምሪያ</option>
                  <option value="ልዩ ፈጣን ኃይል መምሪያ">ልዩ ፈጣን ኃይል መምሪያ</option>
                  <option value="የሰው ኃይል አስተዳደርና ልማት መምሪያ">የሰው ኃይል አስተዳደርና ልማት መምሪያ</option>
                  <option value="ፋይናንስና በጀት መምሪያ">ፋይናንስና በጀት መምሪያ</option>
                  <option value="የኮሚሽኑ ዋና አዛዥ ጽ/ቤት">የኮሚሽኑ ዋና አዛዥ ጽ/ቤት</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የተመደበበት ጣቢያ', 'Station')}</label>
                <select
                  value={staffStation}
                  onChange={e => setStaffStation(e.target.value as StationLocation)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="አሶሳ ከተማ ፖሊስ መምሪያ">አሶሳ ከተማ ፖሊስ መምሪያ</option>
                  <option value="አሶሳ ዋና መምሪያ (Assosa HQ)">አሶሳ ዋና መምሪያ (Assosa HQ)</option>
                  <option value="መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)">መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)</option>
                  <option value="ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)">ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)</option>
                  <option value="ባምባሲ ወረዳ ፖሊስ ጣቢያ">ባምባሲ ወረዳ ፖሊስ ጣቢያ</option>
                  <option value="ፓዌ ወረዳ ፖሊስ ጣቢያ">ፓዌ ወረዳ ፖሊስ ጣቢያ</option>
                  <option value="ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)">ጉባ ወረዳ (ህዳሴ ግድብ)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewStaffModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {t('መለያውን ፍጠር', 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
