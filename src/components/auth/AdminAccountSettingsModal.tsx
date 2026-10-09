import React, { useState, useEffect } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  KeyRound,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Building,
  Save,
  Sparkles
} from 'lucide-react';

interface AdminAccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAccountSettingsModal: React.FC<AdminAccountSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, updateUserAccountCredentials, t } = useHrms();

  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [password, setPassword] = useState(currentUser?.password || 'Admin123@');
  const [confirmPassword, setConfirmPassword] = useState(currentUser?.password || 'Admin123@');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setUsername(currentUser.username || 'admin');
      setPassword(currentUser.password || 'Admin123@');
      setConfirmPassword(currentUser.password || 'Admin123@');
      setFeedback(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setFeedback({
        type: 'error',
        message: t('እባክዎ የተጠቃሚ ስም ያስገቡ', 'Please enter username')
      });
      return;
    }

    if (!cleanPass) {
      setFeedback({
        type: 'error',
        message: t('እባክዎ የይለፍ ቃል ያስገቡ', 'Please enter password')
      });
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setFeedback({
        type: 'error',
        message: t('የይለፍ ቃሎቹ አይመሳሰሉም! እባክዎ በትክክል ያረጋግጡ', 'Passwords do not match')
      });
      return;
    }

    setIsSaving(true);
    try {
      const targetId = currentUser?.id || 'usr-admin-1';
      const res = await updateUserAccountCredentials(targetId, cleanUser, cleanPass, 'hr_admin');
      setIsSaving(false);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: t(
            'የአድሚን የተጠቃሚ ስምና የይለፍ ቃል በፋየርስቶር ክላውድ ዳታቤዝ በተሳካ ሁኔታ ተቀምጧል!',
            'Admin username and password updated in Cloud Firestore successfully!'
          )
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (err: any) {
      setIsSaving(false);
      setFeedback({
        type: 'error',
        message: err?.message || 'መለያውን ማስተካከል አልተቻለም'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">
                {t('የአድሚን መለያና የይለፍ ቃል ማስተካከያ', 'Admin Credentials & Security')}
              </h4>
              <p className="text-[11px] text-slate-400">
                {currentUser?.fullName || t('የኮሚሽኑ ዋና HR አስተዳዳሪ', 'Chief Police HR Admin')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info card */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-[11px] text-slate-300">
            <span className="font-semibold text-white block">
              {t('ይፋዊ የሲስተም አድሚን መለያ', 'Official System Admin Account')}
            </span>
            <span className="text-slate-400">
              {t(
                'እዚህ የሚያስተካክሉት የተጠቃሚ ስምና የይለፍ ቃል በፋየርስቶር ክላውድ ዳታቤዝ ላይ ተቀምጦ ለቀጣይ መግቢያዎች ያገለግላል።',
                'Your updated credentials are saved directly to Cloud Firestore for future logins.'
              )}
            </span>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {t('የአድሚን የተጠቃሚ ስም (Admin Username) *', 'Admin Username *')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {t('የመጀመሪያ ነባሪ፡ admin', 'Default: admin')}
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {t('አዲስ የይለፍ ቃል (New Password) *', 'New Password *')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin123@"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {t('የመጀመሪያ ነባሪ፡ Admin123@', 'Default: Admin123@')}
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {t('የይለፍ ቃል አረጋግጥ (Confirm Password) *', 'Confirm Password *')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Admin123@"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              {t('ሰርዝ', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>
                {isSaving
                  ? t('በፋየርስቶር በማስቀመጥ ላይ...', 'Saving to Firestore...')
                  : t('ለውጦችን በፋየርስቶር አስቀምጥ', 'Save to Cloud Firestore')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
