import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { OnlineApplication, ApplicationStatus } from '../../types/hrms';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  ChevronRight,
  Filter,
  ExternalLink,
  MessageSquare,
  Building,
  Shield
} from 'lucide-react';

export const ApplicationWorkflowManager: React.FC = () => {
  const { applications, reviewApplication, currentRole, t } = useHrms();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<OnlineApplication | null>(null);

  // Review modal state
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewerName, setReviewerName] = useState('ኮማንደር የማነ (HR ዳይሬክተር)');

  const filteredApps = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const handleExecuteReview = () => {
    if (!selectedApp) return;

    let actionStr: any;
    if (currentRole === 'supervisor') {
      actionStr = reviewAction === 'approve' ? 'supervisor_approve' : 'supervisor_reject';
    } else {
      actionStr = reviewAction === 'approve' ? 'hr_approve' : 'hr_reject';
    }

    reviewApplication(selectedApp.id, actionStr, reviewerName, reviewNote);
    setSelectedApp(null);
    setReviewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
              {t('የማመልከቻዎች የስራ ፍሰት ማዕከል', 'Application Approval Engine')}
            </span>
            <span className="text-xs text-slate-400">
              {applications.length} {t('ጠቅላላ ማመልከቻዎች', 'Total Applications')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {t('የአባላት ጥያቄዎችና ይፋዊ የውሳኔ ፍሰት', 'Member Requests & Multi-Stage Approvals')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'በአባላት የቀረቡ የእረፍት፣ የዝውውር፣ የማዕረግና የጥቅማጥቅም ጥያቄዎችን በቅርብ ኃላፊና በHR ቦርድ መርምሮ ማጽደቅ',
              'Review, endorse, and finalize submitted police service petitions with automated profile updates'
            )}
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'all', label: t('ሁሉም', 'All') },
            { id: 'supervisor_review', label: t('በኃላፊ እይታ', 'Supervisor') },
            { id: 'hr_review', label: t('በHR እይታ', 'HR Review') },
            { id: 'approved', label: t('የጸደቁ', 'Approved') },
            { id: 'rejected', label: t('ውድቅ የሆኑ', 'Rejected') }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === f.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h5 className="font-bold text-white text-sm">{t('ምንም የሚጠብቅ ማመልከቻ የለም', 'No applications found in this queue.')}</h5>
          </div>
        ) : (
          filteredApps.map(app => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                    {app.policeId.replace('BG-', '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{app.applicationNo}</span>
                      <span className="text-slate-400 text-xs">·</span>
                      <span className="text-xs font-semibold text-slate-200">{app.type}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-0.5">{app.title}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-300">{app.memberName}</span> ({app.memberRank}) · {app.memberDepartment}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      app.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-400'
                        : app.status === 'supervisor_review'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-blue-500/15 text-blue-300'
                    }`}
                  >
                    {app.status === 'approved'
                      ? t('ጸድቋል (Approved)', 'Approved')
                      : app.status === 'rejected'
                      ? t('ውድቅ ተደርጓል (Rejected)', 'Rejected')
                      : app.status === 'supervisor_review'
                      ? t('በቅርብ ኃላፊ እይታ ላይ', 'Under Supervisor Review')
                      : t('በHR ቦርድ እይታ ላይ', 'Under HR Review')}
                  </span>

                  {/* Action button if pending */}
                  {(app.status === 'supervisor_review' || app.status === 'hr_review') && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setReviewAction('approve');
                        setReviewNote('');
                        if (currentRole === 'supervisor') {
                          setReviewerName('የመምሪያ ኃላፊ / አዛዥ');
                        } else {
                          setReviewerName('ኮማንደር የማነ (የHR ዳይሬክተር)');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                    >
                      <span>{t('መርምርና ውሳኔ ስጥ', 'Review & Decide')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                {app.description}
              </p>

              {/* Workflow History Steps */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                {app.workflowHistory.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-white font-medium">{step.step}</span>
                    <span className="text-[11px] text-slate-500">({step.actor})</span>
                    {sIdx < app.workflowHistory.length - 1 && <span className="text-slate-600">➜</span>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400">{selectedApp.applicationNo}</span>
                <h4 className="text-base font-bold text-white">{selectedApp.title}</h4>
                <p className="text-xs text-slate-400">{selectedApp.memberName} ({selectedApp.memberRank})</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block text-[11px] mb-1">{t('የቀረበው ጥያቄ ዝርዝር፡', 'Petition Content:')}</span>
              {selectedApp.description}
            </div>

            {/* Decision choices */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">{t('ውሳኔ ይምረጡ', 'Select Action')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('approve')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    {currentRole === 'supervisor'
                      ? t('ይሁንታ ስጥ (ወደ HR አስተላልፍ)', 'Endorse (Forward to HR)')
                      : t('አጽድቅ (Approve Request)', 'Approve & Execute')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('reject')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    reviewAction === 'reject'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>{t('ውድቅ አድርግ (Reject)', 'Reject Petition')}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ገምጋሚ / ፈራሚ ኃላፊ', 'Reviewing Officer')}</label>
              <input
                type="text"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('ኦፊሴላዊ አስተያየትና ውሳኔ ማስታወሻ', 'Official Remarks / Notes')}</label>
              <textarea
                rows={3}
                required
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="የውሳኔውን ምክንያትና ማስታወሻ እዚህ ያስገቡ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                {t('ሰርዝ', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleExecuteReview}
                className={`px-5 py-2 font-bold rounded-lg text-xs ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {t('ውሳኔውን መዝግብ', 'Submit Official Decision')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
