import React, { useState, useMemo } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { MemberProfile, PoliceRank, DepartmentName, EmploymentStatus } from '../../types/hrms';
import { MemberPersonnelFileModal } from './MemberPersonnelFileModal';
import { AdminAddMemberModal } from './AdminAddMemberModal';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  LogOut,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  Printer,
  Plus,
  UserPlus,
  GraduationCap,
  TrendingUp,
  Calendar,
  Gift,
  AlertOctagon,
  Award,
  FolderOpen,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface PersonnelRegistryProps {
  onOpenIdGateway: () => void;
}

export const PersonnelRegistry: React.FC<PersonnelRegistryProps> = ({ onOpenIdGateway }) => {
  const { members, t, currentRole, deleteMember } = useHrms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  const [selectedMemberForModal, setSelectedMemberForModal] = useState<MemberProfile | null>(null);
  const [initialTabForModal, setInitialTabForModal] = useState<string>('overview');
  const [initialActionForModal, setInitialActionForModal] = useState<string | null>(null);
  const [showQuickRecordLauncher, setShowQuickRecordLauncher] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [selectedPoliceIdForLauncher, setSelectedPoliceIdForLauncher] = useState<string>('');
  const [selectedTabForLauncher, setSelectedTabForLauncher] = useState<string>('training');

  // Direct Admin Delete States
  const [memberToDelete, setMemberToDelete] = useState<MemberProfile | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter logic
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.policeId.toLowerCase().includes(q) ||
        m.identity.fullName.toLowerCase().includes(q) ||
        m.badgeNumber.toLowerCase().includes(q) ||
        m.position.toLowerCase().includes(q) ||
        m.currentStation.toLowerCase().includes(q);

      const matchesRank = selectedRank === 'all' || m.currentRank === selectedRank;
      const matchesDept = selectedDept === 'all' || m.currentDepartment === selectedDept;
      const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
      const matchesGender = selectedGender === 'all' || m.identity.gender === selectedGender;

      return matchesSearch && matchesRank && matchesDept && matchesStatus && matchesGender;
    });
  }, [members, searchQuery, selectedRank, selectedDept, selectedStatus, selectedGender]);

  // Export to CSV function
  const handleExportCsv = () => {
    const headers = [
      'Police ID',
      'Badge',
      'Full Name',
      'Gender',
      'Date of Birth',
      'Current Rank',
      'Department',
      'Station',
      'Status',
      'Salary Grade',
      'Salary Step',
      'Base Salary ETB',
      'Employment Date'
    ];

    const rows = filteredMembers.map(m => [
      `"${m.policeId}"`,
      `"${m.badgeNumber}"`,
      `"${m.identity.fullName}"`,
      `"${m.identity.gender}"`,
      `"${m.identity.dateOfBirth}"`,
      `"${m.currentRank}"`,
      `"${m.currentDepartment}"`,
      `"${m.currentStation}"`,
      `"${m.status}"`,
      m.salaryGrade,
      m.salaryStep,
      m.baseSalary,
      `"${m.employmentDate}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Begu_Police_Force_Roster_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
              {t('የአባላት ማዕከላዊ ሬጅስትሪ', 'Central Force Registry')}
            </span>
            <span className="text-xs text-slate-400">
              {filteredMembers.length} of {members.length} {t('አባላት', 'Members')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {t('የቤጉ ፖሊስ አባላት ሙሉ ማህደር', 'Begu Police Personnel Registry')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'በPolice ID የተዋሃዱ የፖሊስ አባላት ዲጂታል ዶሴ፣ ማዕረግ፣ ምደባና የስራ ህይወት ክትትል',
              'Unified police force personnel directory with one-click access to complete digital service files'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(currentRole === 'hr_admin' || currentRole === 'management') && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('አዲስ አባል እንደ አዲስ መዝግብ', 'Register New Officer')}</span>
            </button>
          )}

          {currentRole !== 'member' && (
            <button
              onClick={() => {
                setSelectedPoliceIdForLauncher(filteredMembers[0]?.policeId || members[0]?.policeId || '');
                setShowQuickRecordLauncher(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>{t('አዲስ HR መዝገብ አስገባ', 'Quick Log HR Entry')}</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t('Excel / CSV አውርድ', 'Export Roster')}</span>
          </button>

          {currentRole !== 'member' && (
            <button
              onClick={onOpenIdGateway}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition-colors shadow"
            >
              <Users className="w-4 h-4" />
              <span>{t('ከመታወቂያ ሲስተም አዲስ አባል አዋህድ', 'Onboard via ID System')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(
              'በስም፣ በPolice ID (BG-000101)፣ በመለያ ቁጥር፣ ወይም በጣቢያ ፈልግ...',
              'Search by Name, Police ID (BG-000101), Badge, or Station...'
            )}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Rank Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('ማዕረግ (Rank)', 'Rank')}
            </label>
            <select
              value={selectedRank}
              onChange={e => setSelectedRank(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="all">{t('ሁሉም ማዕረጎች', 'All Ranks')}</option>
              <option value="ኮንስታብል">ኮንስታብል</option>
              <option value="ረዳት ሳጅን">ረዳት ሳጅን</option>
              <option value="ሳጅን">ሳጅን</option>
              <option value="ዋና ሳጅን">ዋና ሳጅን</option>
              <option value="ምክትል ኢንስፔክተር">ምክትል ኢንስፔክተር</option>
              <option value="ዋና ኢንስፔክተር">ዋና ኢንስፔክተር</option>
              <option value="ኮማንደር">ኮማንደር</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('መምሪያ (Department)', 'Directorate')}
            </label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="all">{t('ሁሉም መምሪያዎች', 'All Directorates')}</option>
              <option value="ወንጀል ምርመራ መምሪያ">ወንጀል ምርመራ መምሪያ</option>
              <option value="ወንጀል መከላከልና ፓትሮል መምሪያ">ወንጀል መከላከልና ፓትሮል መምሪያ</option>
              <option value="ትራፊክ ደህንነትና ቁጥጥር መምሪያ">ትራፊክ ደህንነትና ቁጥጥር መምሪያ</option>
              <option value="ልዩ ፈጣን ኃይል መምሪያ">ልዩ ፈጣን ኃይል መምሪያ</option>
              <option value="የሰው ኃይል አስተዳደርና ልማት መምሪያ">የሰው ኃይል አስተዳደርና ልማት መምሪያ</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('የስራ ሁኔታ (Status)', 'Service Status')}
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="all">{t('ሁሉም ሁኔታዎች', 'All Statuses')}</option>
              <option value="active">{t('በስራ ላይ (Active)', 'Active')}</option>
              <option value="on_leave">{t('በእረፍት ፈቃድ ላይ', 'On Leave')}</option>
              <option value="transferred_pending">{t('በዝውውር ላይ', 'In Transfer')}</option>
              <option value="retired">{t('በጡረታ የተሰናበተ', 'Retired')}</option>
              <option value="dismissed">{t('የተባረረ (Dismissed)', 'Dismissed')}</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('ጾታ (Gender)', 'Gender')}
            </label>
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="all">{t('ሁሉም ጾታዎች', 'All Genders')}</option>
              <option value="ወንድ">{t('ወንድ (Male)', 'Male')}</option>
              <option value="ሴት">{t('ሴት (Female)', 'Female')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Police ID</th>
                <th className="py-3 px-4">{t('የአባሉ ስም & ፎቶ', 'Member Name & Photo')}</th>
                <th className="py-3 px-4">{t('ማዕረግ', 'Rank')}</th>
                <th className="py-3 px-4">{t('መምሪያ & ጣቢያ', 'Directorate & Station')}</th>
                <th className="py-3 px-4">{t('የደመወዝ እርከን', 'Scale')}</th>
                <th className="py-3 px-4">{t('ሁኔታ', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('ተግባራት', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {t('የተፈለገው አባል አልተገኘም', 'No police officers matched your search criteria.')}
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr
                    key={m.policeId}
                    className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    onClick={() => setSelectedMemberForModal(m)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {m.policeId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.identity.photoUrl}
                          alt={m.identity.fullName}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-700 group-hover:border-amber-400 transition-colors"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                            {m.identity.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {m.badgeNumber} · {m.identity.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-200">{m.currentRank}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{m.currentDepartment}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{m.currentStation}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      Grade {m.salaryGrade} · Step {m.salaryStep}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          m.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : m.status === 'on_leave'
                            ? 'bg-blue-500/15 text-blue-400'
                            : m.status === 'retired'
                            ? 'bg-amber-500/15 text-amber-300'
                            : m.status === 'dismissed'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-purple-500/15 text-purple-300'
                        }`}
                      >
                        {m.status === 'active'
                          ? t('በስራ ላይ', 'Active')
                          : m.status === 'on_leave'
                          ? t('ፈቃድ ላይ', 'Leave')
                          : m.status === 'retired'
                          ? t('ጡረታ', 'Retired')
                          : m.status === 'dismissed'
                          ? t('የተባረረ', 'Dismissed')
                          : t('ዝውውር', 'Transfer')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setInitialTabForModal('training');
                            setSelectedMemberForModal(m);
                          }}
                          title={t('ስልጠናዎች', 'Trainings')}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-300 hover:text-white transition-colors border border-blue-500/20"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInitialTabForModal('performance');
                            setSelectedMemberForModal(m);
                          }}
                          title={t('አፈጻጸም', 'Performance')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition-colors border border-emerald-500/20"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInitialTabForModal('leave');
                            setSelectedMemberForModal(m);
                          }}
                          title={t('ፈቃድ', 'Leave')}
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-white transition-colors border border-sky-500/20"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInitialTabForModal('benefits');
                            setSelectedMemberForModal(m);
                          }}
                          title={t('ጥቅማጥቅም', 'Benefits')}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-colors border border-amber-500/20"
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInitialTabForModal('disciplinary');
                            setSelectedMemberForModal(m);
                          }}
                          title={t('ዲሲፕሊንና ሽልማት', 'Discipline & Awards')}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors border border-rose-500/20"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInitialTabForModal('overview');
                            setInitialActionForModal(null);
                            setSelectedMemberForModal(m);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm ml-1"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{t('ዶሴ ክፈት', 'Dossier')}</span>
                        </button>

                        {(currentRole === 'hr_admin' || currentRole === 'management') && (
                          <>
                            <button
                              onClick={() => {
                                setInitialTabForModal('overview');
                                setInitialActionForModal('edit_profile');
                                setSelectedMemberForModal(m);
                              }}
                              title={t('የአባሉን መረጃ አርትዕ (አድራሻ፣ የስራ ሃላፊነት)', 'Edit Profile (Address, Role)')}
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-colors border border-amber-500/30"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setMemberToDelete(m);
                                setDeleteReasonText('');
                                setDeleteFeedback(null);
                              }}
                              title={t('አባል ከሲስተም ሰርዝ / አጥፋ', 'Delete Officer')}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors border border-rose-500/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick HR Record Launcher Modal */}
      {showQuickRecordLauncher && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('አዲስ HR መዝገብ አስገባ (ስልጠና፣ አፈፃፀም፣ ፈቃድ፣ ጥቅማጥቅም፣ ዲሲፕሊን)', 'Quick Log Personnel Record')}
                </h4>
                <p className="text-xs text-slate-400">
                  {t('የፖሊስ አባሉንና የሚመዘገበውን ዘርፍ ይምረጡ', 'Select police officer and record category')}
                </p>
              </div>
              <button onClick={() => setShowQuickRecordLauncher(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('የፖሊስ አባል ይምረጡ *', 'Select Police Officer *')}
                </label>
                <select
                  value={selectedPoliceIdForLauncher}
                  onChange={e => setSelectedPoliceIdForLauncher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  {members.map(m => (
                    <option key={m.policeId} value={m.policeId}>
                      {m.policeId} - {m.identity.fullName} ({m.currentRank} - {m.currentDepartment})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('የሚመዘገበው ዘርፍ / ፎልደር *', 'Select Category / Dossier Folder *')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'training', label: 'ስልጠናዎች', icon: GraduationCap, color: 'text-blue-400' },
                    { id: 'performance', label: 'አፈፃፀም ምዘና', icon: TrendingUp, color: 'text-emerald-400' },
                    { id: 'leave', label: 'ፈቃድ መዝገብ', icon: Calendar, color: 'text-sky-400' },
                    { id: 'benefits', label: 'ጥቅማ ጥቅም', icon: Gift, color: 'text-amber-400' },
                    { id: 'disciplinary', label: 'ዲሲፕሊን & ሽልማት', icon: AlertOctagon, color: 'text-rose-400' },
                    { id: 'separation', label: 'ስንብት & ጡረታ', icon: LogOut, color: 'text-purple-400' }
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedTabForLauncher === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedTabForLauncher(cat.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-xs font-bold mt-1">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowQuickRecordLauncher(false)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                {t('ሰርዝ', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = members.find(m => m.policeId.toUpperCase() === selectedPoliceIdForLauncher.toUpperCase()) || members[0];
                  if (target) {
                    setInitialTabForModal(selectedTabForLauncher);
                    setSelectedMemberForModal(target);
                    setShowQuickRecordLauncher(false);
                  }
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <FolderOpen className="w-4 h-4" />
                <span>{t('ማህደር ክፈትና አዲስ መዝግብ', 'Open Dossier & Add Entry')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personnel Dossier Modal */}
      {selectedMemberForModal && (
        <MemberPersonnelFileModal
          member={selectedMemberForModal}
          initialTab={initialTabForModal}
          initialActionModal={initialActionForModal || undefined}
          onClose={() => {
            setSelectedMemberForModal(null);
            setInitialActionForModal(null);
          }}
        />
      )}

      {/* Admin New Member Creation Modal */}
      <AdminAddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSuccess={newMember => {
          setSelectedMemberForModal(newMember);
          setInitialTabForModal('overview');
          setInitialActionForModal(null);
        }}
      />

      {/* Admin Direct Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  {t('የፖሊስ አባልን ከሲስተም ሰርዝ / አጥፋ', 'Delete Officer From System')}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {memberToDelete.policeId} · {memberToDelete.identity.fullName}
                </p>
              </div>
            </div>

            {deleteFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  deleteFeedback.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {deleteFeedback.message}
              </div>
            )}

            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1 text-slate-300">
              <p className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{t('እርግጠኛ ነዎት ይህን አባል ማጥፋት ይፈልጋሉ?', 'Are you sure you want to delete this officer?')}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {t(
                  'ይህ እርምጃ የአባሉን የግል ማህደር፣ የደመወዝ ዝርዝርና ተያያዥ መረጃዎችን ከክላውድ ዳታቤዝ (ፋየርስቶር) ሙሉ በሙሉ ያጠፋል።',
                  'This action permanently deletes this officer profile and associated records from Cloud Firestore.'
                )}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">
                {t('የማጥፋት ምክንያት (ምሳሌ፡ በስህተት የገባ፣ የተባረረ):', 'Reason for Deletion:')}
              </label>
              <input
                type="text"
                value={deleteReasonText}
                onChange={e => setDeleteReasonText(e.target.value)}
                placeholder="ለምሳሌ፡ የተባዛ/በስህተት የተመዘገበ መረጃ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setMemberToDelete(null);
                  setDeleteReasonText('');
                  setDeleteFeedback(null);
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                {t('ተመለስ / ሰርዝ', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteFeedback(null);
                  try {
                    const res = await deleteMember(memberToDelete.policeId, deleteReasonText);
                    setIsDeleting(false);
                    if (res.success) {
                      setDeleteFeedback({ type: 'success', message: res.message });
                      setTimeout(() => {
                        setMemberToDelete(null);
                        setDeleteReasonText('');
                        setDeleteFeedback(null);
                      }, 1000);
                    } else {
                      setDeleteFeedback({ type: 'error', message: res.message });
                    }
                  } catch (err: any) {
                    setIsDeleting(false);
                    setDeleteFeedback({ type: 'error', message: err?.message || 'አባሉን ማጥፋት አልተቻለም' });
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? t('በማጥፋት ላይ...', 'Deleting...') : t('አባል ሙሉ በሙሉ አጥፋ', 'Permanently Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
