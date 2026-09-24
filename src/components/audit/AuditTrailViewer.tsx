import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AuditTrailViewer: React.FC = () => {
  const { auditLogs, t } = useHrms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    const actor = (log.actorName || log.user || '').toLowerCase();
    const matchesSearch =
      !q ||
      actor.includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.targetPoliceId.toLowerCase().includes(q) ||
      log.targetMemberName.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
              {t('የማይለወጥ የደህንነት ኦዲት መዝገብ', 'Immutable Security Audit Trail')}
            </span>
            <span className="text-xs text-slate-400">
              {auditLogs.length} {t('ምዝገባዎች', 'Logged Events')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {t('የHR ውሳኔዎችና የለውጥ ታሪክ ኦዲት', 'HR Decisions & Audit Event Trail')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'በማዕረግ፣ በደመወዝ፣ በዝውውር፣ በሰነዶችና በስንብት ላይ የተከናወኑ ማናቸውም ለውጦች፣ የፈጻሚው ማንነት፣ ሰዓትና የቀድሞ/አዲስ ዋጋ',
              'Tamper-evident log of institutional actions, administrative actors, prior/updated states, and IP traces'
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC VERIFIED INTEGRITY</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(
              'በፈጻሚ ስም፣ በድርጊት፣ በPolice ID ፈልግ...',
              'Search by actor, action description, or Police ID...'
            )}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">{t('ሁሉም ዘርፎች (All Categories)', 'All Categories')}</option>
            <option value="rank">{t('የማዕረግ እድገት (Rank)', 'Rank')}</option>
            <option value="salary">{t('ደመወዝ/እርከን (Salary)', 'Salary')}</option>
            <option value="transfer">{t('ዝውውር (Transfer)', 'Transfer')}</option>
            <option value="training">{t('ስልጠና (Training)', 'Training')}</option>
            <option value="leave">{t('ፈቃድ (Leave)', 'Leave')}</option>
            <option value="performance">{t('አፈጻጸም (Performance)', 'Performance')}</option>
            <option value="document">{t('ሰነድ (Document)', 'Document')}</option>
            <option value="separation">{t('ስንብት (Separation)', 'Separation')}</option>
            <option value="id_integration">{t('የመታወቂያ ውህደት (ID Integration)', 'ID Integration')}</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t('ቀንና ሰዓት', 'Timestamp')}</th>
                <th className="py-3 px-4">{t('ፈጻሚ ተጠቃሚ', 'Acting User')}</th>
                <th className="py-3 px-4">{t('ዘርፍ', 'Category')}</th>
                <th className="py-3 px-4">{t('ድርጊት', 'Action')}</th>
                <th className="py-3 px-4">{t('ተዛማጅ አባል', 'Target Member')}</th>
                <th className="py-3 px-4">{t('የነበረው ➜ አዲሱ ሁኔታ', 'Prior ➜ New Value')}</th>
                <th className="py-3 px-4 font-mono text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-sans">
                    {t('ምንም የኦዲት መዝገብ አልተገኘም', 'No audit logs found for your search query.')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      <div className="font-semibold text-white">{log.actorName || log.user}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorRole || log.role}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      <div className="font-semibold text-white">{log.targetMemberName}</div>
                      <div className="text-[10px] font-mono text-amber-400">{log.targetPoliceId}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-xs">
                      {(log.oldValue || log.previousValue) && log.newValue ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-rose-400 line-through truncate max-w-[120px]">{log.oldValue || log.previousValue}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="text-emerald-400 font-semibold truncate max-w-[120px]">{log.newValue}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">{log.newValue || '-'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
