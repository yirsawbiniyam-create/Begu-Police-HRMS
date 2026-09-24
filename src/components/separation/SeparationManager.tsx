import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { MemberProfile, SeparationType } from '../../types/hrms';
import {
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Plus,
  Shield,
  Award,
  Calendar
} from 'lucide-react';
import { MemberPersonnelFileModal } from '../personnel/MemberPersonnelFileModal';

export const SeparationManager: React.FC = () => {
  const { members, currentRole, t, processServiceSeparation } = useHrms();

  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [targetMemberForSeparation, setTargetMemberForSeparation] = useState<MemberProfile | null>(null);

  // Form states
  const [sepType, setSepType] = useState<SeparationType>('በጡረታ የተሰናበተ (Retirement)');
  const [sepReason, setSepReason] = useState('የህግ የጡረታ እድሜ (60 ዓመት) በመድረሱ የተሰናበተ');
  const [sepRef, setSepRef] = useState(`DEC/SEP/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
  const [pensionEligible, setPensionEligible] = useState(true);
  const [pensionBookRef, setPensionBookRef] = useState(`PEN-BG-2026-${Math.floor(Math.random() * 8000 + 1000)}`);

  // Filter separated members
  const separatedMembers = members.filter(m => m.separation !== undefined || m.status === 'retired' || m.status === 'dismissed');

  // Filter near-retirement members (e.g. DOB before 1970 or service years > 20)
  const nearRetirementMembers = members.filter(m => {
    if (m.separation) return false;
    const birthYear = parseInt(m.identity.dateOfBirth.substring(0, 4), 10);
    const age = 2026 - birthYear;
    return age >= 52;
  });

  const handleExecuteSeparation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberForSeparation) return;

    processServiceSeparation(targetMemberForSeparation.policeId, {
      type: sepType,
      reason: sepReason,
      decisionRef: sepRef,
      pensionEligible,
      pensionBookRef: pensionEligible ? pensionBookRef : undefined
    });

    setShowProcessModal(false);
    setTargetMemberForSeparation(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
              {t('የአገልግሎት ስንብትና ጡረታ ማዕከል', 'Separation & Retirement Archive')}
            </span>
            <span className="text-xs text-slate-400">Statutory HR Dossier</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {t('የአባላት የአገልግሎት ማብቂያና የጡረታ ክሊራንስ', 'Service Retirement & Separation Management')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'የጡረታ እድሜ የደረሱ አባላት፣ የህግ ስንብት፣ የንብረትና ሰነድ ክሊራንስ እና የጡረታ ደብተር ምዝገባ',
              'Formal retirement processing, clearance verification, pension registry, and permanent file archival'
            )}
          </p>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center flex-shrink-0">
          <div className="text-[11px] font-semibold text-slate-400">{t('ጡረታ የተሰናበቱ', 'Retired Officers')}</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{separatedMembers.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{t('የተዘጉ ማህደሮች', 'Archived Files')}</div>
        </div>
      </div>

      {/* Near Retirement Alert Section */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('የጡረታ እድሜ የደረሱ አባላት ቅድመ-ማንቂያ (Upcoming Retirement Radar)', 'Upcoming Retirements (Officers Aged 52-60)')}
          </h3>
          <span className="text-xs font-mono text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded">
            {nearRetirementMembers.length} {t('አባላት', 'Officers')}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {t(
            'እነዚህ አባላት ወደ ጡረታ እድሜ የተቃረቡ ሲሆን የቅድመ-ጡረታ ማሳሰቢያ፣ የክሊራንስ ዝግጅትና የጡረታ ሰነድ መረጃ ሊሰናዳላቸው ይገባል።',
            'Officers approaching statutory retirement age. Prepare clearance forms, service audit, and social security pension dossiers.'
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {nearRetirementMembers.map(m => {
            const age = 2026 - parseInt(m.identity.dateOfBirth.substring(0, 4), 10);
            const serviceYears = 2026 - parseInt(m.employmentDate.substring(0, 4), 10);
            return (
              <div
                key={m.policeId}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img src={m.identity.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                  <div>
                    <div className="font-bold text-white text-xs">{m.identity.fullName}</div>
                    <div className="text-[11px] text-slate-400">
                      {m.currentRank} · {m.policeId} · {m.currentDepartment}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                      {t('ዕድሜ:', 'Age:')} {age} {t('ዓመት', 'yrs')} · {t('አገልግሎት:', 'Service:')} {serviceYears} {t('ዓመታት', 'yrs')}
                    </div>
                  </div>
                </div>

                {currentRole === 'hr_admin' && (
                  <button
                    onClick={() => {
                      setTargetMemberForSeparation(m);
                      setShowProcessModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow"
                  >
                    {t('ጡረታ ፈጽም', 'Retire')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formally Separated / Retired Members Registry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <LogOut className="w-4 h-4 text-rose-400" />
          {t('የተሰናበቱና የጡረተኞች ማህደር ሰንጠረዥ (Archived Separated Dossiers)', 'Separated & Retired Force Archive')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Police ID</th>
                <th className="py-2.5 px-3">{t('ሙሉ ስም & ፎቶ', 'Full Name')}</th>
                <th className="py-2.5 px-3">{t('የስንብት አይነት', 'Type')}</th>
                <th className="py-2.5 px-3">{t('የአገልግሎት ዘመን', 'Service')}</th>
                <th className="py-2.5 px-3">{t('የውሳኔ ቁጥር', 'Decision Ref')}</th>
                <th className="py-2.5 px-3">{t('የጡረታ መብት', 'Pension')}</th>
                <th className="py-2.5 px-3 text-right">{t('ማህደር', 'Dossier')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {separatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    {t('ምንም የተሰናበተ አባል አልተመዘገበም', 'No separated records logged.')}
                  </td>
                </tr>
              ) : (
                separatedMembers.map(m => (
                  <tr key={m.policeId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{m.policeId}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        <img src={m.identity.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-700" />
                        <span className="font-semibold text-white">{m.identity.fullName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium">
                        {m.separation?.separationType || m.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {m.separation?.totalServiceYears || (2026 - parseInt(m.employmentDate.substring(0, 4), 10))} {t('ዓመታት', 'years')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-300">
                      {m.separation?.decisionRef || 'DEC/LEG/2026/01'}
                    </td>
                    <td className="py-2.5 px-3">
                      {m.separation?.pensionEligible ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{t('ጡረተኛ', 'Eligible')}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{t('የለም', 'No')}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline"
                      >
                        {t('ማህደር ክፈት', 'Inspect File')} ➜
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Separation Processing Modal */}
      {showProcessModal && targetMemberForSeparation && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  {t('የአገልግሎት ስንብትና ጡረታ መዝግብ', 'Formal Separation & Clearance')}
                </h4>
                <p className="text-xs text-slate-400">{targetMemberForSeparation.identity.fullName} ({targetMemberForSeparation.policeId})</p>
              </div>
              <button onClick={() => setShowProcessModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteSeparation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የስንብት አይነት', 'Separation Type')}</label>
                <select
                  value={sepType}
                  onChange={e => setSepType(e.target.value as SeparationType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="በጡረታ የተሰናበተ (Retirement)">በጡረታ የተሰናበተ (Retirement)</option>
                  <option value="በግል ፈቃድ የለቀቀ (Resignation)">በግል ፈቃድ የለቀቀ (Resignation)</option>
                  <option value="የተባረረ (Dismissal)">የተባረረ (Dismissal)</option>
                  <option value="በህክምና ምክንያት የተሰናበተ (Medical Discharge)">በህክምና ምክንያት የተሰናበተ</option>
                  <option value="የአገልግሎት ዘመን ያበቃ (Term Ended)">የአገልግሎት ዘመን ያበቃ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የውሳኔ ቁጥር', 'Decision Ref')}</label>
                  <input
                    type="text"
                    required
                    value={sepRef}
                    onChange={e => setSepRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጡረታ መብት', 'Pension')}</label>
                  <select
                    value={pensionEligible ? 'true' : 'false'}
                    onChange={e => setPensionEligible(e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="true">አዎ (ህጋዊ ጡረተኛ)</option>
                    <option value="false">የለም</option>
                  </select>
                </div>
              </div>

              {pensionEligible && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('የጡረታ ደብተር መለያ', 'Pension Book Ref')}</label>
                  <input
                    type="text"
                    value={pensionBookRef}
                    onChange={e => setPensionBookRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ዝርዝር ምክንያትና የክሊራንስ ማስታወሻ', 'Reason & Clearance Summary')}</label>
                <textarea
                  rows={3}
                  required
                  value={sepReason}
                  onChange={e => setSepReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  {t('ሰርዝ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs"
                >
                  {t('ስንብት አጽድቅና ማህደር ዝጋ', 'Execute Separation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Member Dossier Modal */}
      {selectedMember && (
        <MemberPersonnelFileModal
          member={selectedMember}
          initialTab="separation"
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};
