import React, { useState, useMemo } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { MemberProfile, PoliceRank, DepartmentName, EmploymentStatus } from '../../types/hrms';
import { MemberPersonnelFileModal } from './MemberPersonnelFileModal';
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
  Printer
} from 'lucide-react';

interface PersonnelRegistryProps {
  onOpenIdGateway: () => void;
}

export const PersonnelRegistry: React.FC<PersonnelRegistryProps> = ({ onOpenIdGateway }) => {
  const { members, t, currentRole } = useHrms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  const [selectedMemberForModal, setSelectedMemberForModal] = useState<MemberProfile | null>(null);

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
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t('Excel / CSV አውርድ', 'Export Roster')}</span>
          </button>

          {currentRole === 'hr_admin' && (
            <button
              onClick={onOpenIdGateway}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow"
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
                      <button
                        onClick={() => setSelectedMemberForModal(m)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors ml-auto shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('ዲጂታል ማህደር', 'Personnel File')}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personnel Dossier Modal */}
      {selectedMemberForModal && (
        <MemberPersonnelFileModal
          member={selectedMemberForModal}
          onClose={() => setSelectedMemberForModal(null)}
        />
      )}
    </div>
  );
};
