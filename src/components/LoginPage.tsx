import React, { useState } from 'react';
import { AuthUser } from '../types';
import { SYSTEM_AUTH_CONFIG, DEFAULT_AUDIT_USER } from '../data/authUsers';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  KeyRound,
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser, remember: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const inputUser = username.trim();
      const inputPass = password;

      // Validate exactly against User = Audit and Password = auditmcu208
      const isUserMatch = inputUser.toLowerCase() === SYSTEM_AUTH_CONFIG.authorizedUser.toLowerCase();
      const isPassMatch = inputPass === SYSTEM_AUTH_CONFIG.authorizedPassword;

      if (isUserMatch && isPassMatch) {
        setIsLoading(false);
        onLogin(DEFAULT_AUDIT_USER, rememberMe);
      } else {
        setIsLoading(false);
        setErrorMessage('ชื่อผู้ใช้ (User) หรือรหัสผ่าน (Password) ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-pink-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Institutional Emblem & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-amber-400/50 shadow-2xl shadow-pink-950/60 group">
            <img 
              src="/mcu-logo.png" 
              alt="ตราสัญลักษณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)" 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>  สำนักงานตรวจสอบภายใน มจร</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              ระบบสารสนเทศผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ
            </h1>
            <p className="text-xs sm:text-sm text-pink-200/80 mt-1 font-medium">
              มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU Internal Audit System)
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="mt-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-pink-700" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              กรุณาระบุ User และ Password เพื่อเข้าใช้งานระบบงานตรวจสอบภายใน
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                User
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอก User"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/70 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-700/30 focus:border-pink-700 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอก Password"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-700/30 focus:border-pink-700 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-pink-700 rounded-sm border-slate-300 focus:ring-pink-600 cursor-pointer"
                />
                <span>จดจำการเข้าสู่ระบบบนเครื่องนี้</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-pink-800 to-pink-900 hover:from-pink-900 hover:to-pink-950 text-white font-semibold text-sm shadow-md shadow-pink-900/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ (Sign In)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-[11px] text-pink-200/70 leading-relaxed max-w-sm mx-auto">
            ระบบสารสนเทศนี้จำกัดการเข้าถึงเฉพาะเจ้าหน้าที่สำนักงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)
          </p>
          <div className="text-[10px] text-pink-300/40">
            MCU Internal Audit Information System
          </div>
        </div>
      </div>
    </div>
  );
};
