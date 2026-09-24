import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  LogIn,
  ArrowRight,
  Sparkles,
  Info,
  BadgeCheck
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess?: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const { login, language, setLanguage, t, systemLogo } = useHrms();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ የተጠቃሚ ስምና የይለፍ ቃል ያስገቡ'
          : 'Please enter your username and password'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    }, 400);
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          {systemLogo ? (
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden">
              <img
                src={systemLogo}
                alt="Commission Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Shield className="w-5 h-5 text-slate-950 font-black fill-slate-950/20" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-black text-white tracking-wide uppercase">
              {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Police Commission')}
            </h1>
            <p className="text-[10px] text-amber-400/90 font-mono tracking-wider">
              {t('የሰው ኃይል አስተዳደርና የአባላት Self-Service ፖርታል', 'Digital HRMS & Member Portal')}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
          <button
            onClick={() => setLanguage('am')}
            className={`px-3 py-1 rounded-md transition-all ${
              language === 'am' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            አማርኛ
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-md transition-all ${
              language === 'en' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="text-center space-y-2 mb-6">
              {systemLogo ? (
                <div className="inline-flex p-1.5 bg-slate-950/80 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/10 mb-1 w-16 h-16 items-center justify-center overflow-hidden">
                  <img
                    src={systemLogo}
                    alt="Commission Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 mb-1">
                  <Lock className="w-6 h-6" />
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('ወደ ሲስተሙ ይግቡ', 'Sign In to Commission Portal')}
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t(
                  'በHR አስተዳዳሪ የተሰጠዎትን የተጠቃሚ ስምና የይለፍ ቃል በማስገባት ይግቡ',
                  'Enter your official credentials issued by the HR Administration'
                )}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('የተጠቃሚ ስም ወይም የፖሊስ መታወቂያ ቁጥር', 'Username or Police ID')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="ለምሳሌ፡ BG-000101 ወይም admin"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t('የይለፍ ቃል (Password)', 'Password')}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {t('በአድሚኑ የሚሰጥ', 'Issued by Admin')}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 transition-all font-mono"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t('ግባ (Sign In)', 'Sign In')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Test Accounts Box */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('ባለ 1-ክሊክ መሞከሪያ መለያዎች (Demo Accounts)', 'Quick Demo Test Accounts')}</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3">
                {t(
                  'ከዚህ በታች ካሉት መለያዎች በአንዱ ላይ ጠቅ በማድረግ ወዲያውኑ ገብተው መሞከር ይችላሉ፦',
                  'Click any credential pill below to auto-fill and test role-specific dashboards:'
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* 1. Member BG-000101 */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('BG-000101', 'Police@2026')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-[11px]">👮 {t('የፖሊስ አባል (Member)', 'Member Officer')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">አሸናፊ ታደሰ (BG-000101)</div>
                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                    User: <span className="text-white">BG-000101</span> · Pass: <span className="text-slate-300">Police@2026</span>
                  </div>
                </button>

                {/* 2. HR Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'Admin@123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-[11px]">🔑 {t('HR አድሚን (Admin)', 'HR Admin')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">ዋና የHR አስተዳዳሪ (Full Access)</div>
                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                    User: <span className="text-white">admin</span> · Pass: <span className="text-slate-300">Admin@123</span>
                  </div>
                </button>

                {/* 3. Station Commander / Supervisor */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('supervisor.assosa', 'Supervisor@123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-300 text-[11px]">🎖️ {t('የጣቢያ አዛዥ (Supervisor)', 'Station Commander')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">ኮማንደር ከበደ (የአሶሳ አዛዥ)</div>
                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                    User: <span className="text-white">supervisor.assosa</span>
                  </div>
                </button>

                {/* 4. Payroll Officer */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('payroll.officer', 'Payroll@123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-[11px]">💳 {t('የደመወዝ ኦፊሰር (Payroll)', 'Payroll Officer')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">አቶ ጥላሁን (የደመወዝ ባለሙያ)</div>
                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                    User: <span className="text-white">payroll.officer</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3 text-slate-400 text-xs">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="text-white font-semibold block mb-0.5">
                {t('የመለያ አሰጣጥ መመሪያ', 'Credential Policy Notice')}
              </span>
              {t(
                'አባላትና ኃላፊዎች በሲስተሙ ለመጠቀም የሚችሉት በHR አስተዳዳሪው ዩሰርኔምና ፓስዎርድ ሲፈጠርላቸው ብቻ ነው። አባላት የራሳቸውን መረጃ ብቻ የመመልከት እና ማመልከቻ የማቅረብ ፍቃድ አላቸው።',
                'Members and staff can only sign in using credentials created and authorized by the HR Admin. Member accounts are strictly restricted to read-only viewing of their own personnel dossier and submitting official requests.'
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-800/60 text-[11px] text-slate-500 font-mono relative z-10">
        <p>
          © 2026 {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Regional Police Commission')} · {t('ደህንነቱ የተጠበቀ ይፋዊ ሲስተም', 'Official Secure HRMS')}
        </p>
      </footer>
    </div>
  );
};
