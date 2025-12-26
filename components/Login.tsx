
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (nip: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nip && password) {
      onLogin(nip, password);
    } else {
      alert("Harap isi NIP dan Kata Sandi");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/50 flex flex-col justify-center items-center p-6">
      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col items-center">
        
        {/* Shield Icon with Gradient */}
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-indigo-200/50">
          <ShieldCheck size={48} className="text-white" />
        </div>
        
        {/* Title and Subtitle */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-2xl font-black text-[#8B5CF6] tracking-wide">
            SIAP MENDAMPING
          </h1>
          <p className="text-slate-400 text-[13px] leading-relaxed max-w-[280px] mx-auto font-medium">
            Sistem Informasi Akuntabilitas & Pendampingan Transformasi Budaya Sekolah
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* NIP Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="NIP Anda"
              className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Kata Sandi"
              className="w-full pl-12 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 active:scale-[0.98] transition-all text-lg mt-2"
          >
            Masuk Sekarang
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <p className="text-[12px] text-slate-400 font-medium">
            <span className="opacity-70">? Lupa Kata Sandi?</span> Hubungi Administrator SIM Dinas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
