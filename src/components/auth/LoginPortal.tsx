import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  Shield,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn
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
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="text-center space-y-3 mb-6">
              {systemLogo ? (
                <div className="inline-flex p-2 bg-slate-950 rounded-2xl border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 mb-2 w-20 h-20 items-center justify-center overflow-hidden">
                  <img
                    src={systemLogo}
                    alt="Commission Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="inline-flex p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 mb-2">
                  <Shield className="w-8 h-8" />
                </div>
              )}

              {/* Required Official System Titles */}
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight leading-snug">
                  ቤኒሻንጉል ጉሙዝ ክልል ፖሊስ የሰዉ ሀብት እና ልማት አስተዳደር ሲሰትም
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wider font-mono uppercase">
                  BENISHANGUL GUMUZ REGIONAL POLICE HRM SYSTEM
                </h2>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                {t('የመግቢያ የተጠቃሚ ስምና የይለፍ ቃል ያስገቡ', 'Please enter your username and password')}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('የተጠቃሚ ስም (Username)', 'Username')}
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
                    placeholder={t('የተጠቃሚ ስም ያስገቡ', 'Enter username')}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('የይለፍ ቃል (Password)', 'Password')}
                </label>
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
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 transition-all font-mono"
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
                className="w-full mt-3 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t('ግባ (Sign In)', 'Sign In')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Presets for Smooth Access */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-2 font-mono uppercase tracking-wider">
                {t('ፈጣን የመግቢያ አማራጮች (Quick Access Roles):', 'Quick Demo Accounts:')}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('Admin123@');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all font-semibold"
                >
                  👑 Admin (admin)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('payroll');
                    setPassword('payroll@2026');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all font-semibold"
                >
                  💰 Payroll (payroll)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('BG-000101');
                    setPassword('Police@2026');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all font-semibold"
                >
                  👮 Member (BG-000101)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-800/60 text-[11px] text-slate-500 font-mono relative z-10">
        <p>
          © 2026 {t('የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን', 'Benishangul Gumuz Regional Police Commission')} · {t('የሰው ኃይል ልማት አስተዳደር', 'Police HRMS')}
        </p>
      </footer>
    </div>
  );
};
