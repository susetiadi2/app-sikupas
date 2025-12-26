
import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  School as SchoolIcon,
  Sparkles,
  Info,
  RefreshCw,
  CheckCircle2,
  Mail,
  Code,
  Eye,
  EyeOff,
  Database,
  BarChart3,
  Menu,
  ChevronRight,
  Camera
} from 'lucide-react';
import { UserProfile, School, SchoolVisit } from '../types';
import { getLeadershipAdvice } from '../geminiService';

interface SettingsProps {
  user: UserProfile;
  schools: School[];
  visits: SchoolVisit[];
  onRefresh: () => void;
  isLoading?: boolean;
  onMenuClick?: () => void;
  onUploadPhoto?: (file: File) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, schools, visits, onRefresh, isLoading, onMenuClick, onUploadPhoto }) => {
  const [aiQuote, setAiQuote] = useState<string>("Memuat nasihat kepemimpinan...");
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      const quote = await getLeadershipAdvice(user.nama_pengawas, user.wilayah);
      setAiQuote(quote || "");
    };
    fetchQuote();
  }, [user]);

  // Statistik Sederhana
  const stats = {
    totalSchools: schools.length,
    totalVisits: visits.length,
    activeDays: Array.from(new Set(visits.map(v => v.date))).length
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 bg-white rounded-xl shadow-sm text-slate-400"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Pusat Data & Profil</h1>
            <p className="text-slate-400 text-xs font-medium">Manajemen identitas dan transparansi data pengawas.</p>
          </div>
        </div>
        <button 
          onClick={onRefresh}
          className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
          disabled={isLoading}
        >
          {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          <span className="hidden sm:inline">Sinkronkan Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & AI */}
        <div className="lg:col-span-4 space-y-8">
          {/* User Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-5"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                  <img
                    key={user.photo_url} // Force re-render when photo_url changes
                    src={user.photo_url || `https://ui-avatars.com/api/?name=${user.nama_pengawas}&background=6366f1&color=fff&size=128`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                  <CheckCircle2 size={14} />
                </div>
                {onUploadPhoto && (
                  <label className="absolute -bottom-1 -left-1 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert('File dipilih: ' + file.name);
                          onUploadPhoto(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <h2 className="mt-6 text-xl font-black text-slate-800">{user.nama_pengawas}</h2>
              <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 bg-indigo-50 px-4 py-1 rounded-full">{user.jabatan}</p>
            </div>
            
            <div className="mt-8 space-y-4 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NIP Resmi</p>
                  <p className="text-sm font-bold text-slate-700">{user.nip}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Wilayah Kerja</p>
                  <p className="text-sm font-bold text-slate-700">{user.wilayah}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{user.email || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Motivation Card */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-125 transition-transform" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-200 flex items-center gap-2">
                <Sparkles size={14} /> Leadership Insight
              </h3>
              <p className="text-base font-bold italic leading-relaxed">
                "{aiQuote}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: All Data & Raw Viewer */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Sekolah', value: stats.totalSchools, icon: SchoolIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Laporan', value: stats.totalVisits, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Hari Aktif', value: stats.activeDays, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' }
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm text-center">
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <s.icon size={20} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-xl font-black text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Full School Data List */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800">Daftar Sekolah Binaan</h3>
                <p className="text-slate-400 text-xs font-medium">Seluruh entitas yang berada di bawah pengawasan Anda.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg">TOTAL: {schools.length}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
              {schools.length > 0 ? schools.map((school) => (
                <div key={school.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <SchoolIcon size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{school.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">NPSN: {school.npsn}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">KEPSEK: {school.principal}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                </div>
              )) : (
                <div className="py-20 text-center">
                  <p className="text-slate-400 text-sm italic">Belum ada data sekolah yang dimuat.</p>
                </div>
              )}
            </div>
          </div>

          {/* Raw Data Transparency Mode */}
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <button 
              onClick={() => setShowRawData(!showRawData)}
              className="w-full p-8 flex items-center justify-between group hover:bg-slate-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showRawData ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Code size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Transparansi Data (Raw JSON)</h3>
                  <p className="text-slate-500 text-xs font-medium">Klik untuk melihat struktur data mentah yang tersimpan di server.</p>
                </div>
              </div>
              <div className="text-slate-500">
                {showRawData ? <EyeOff size={24} /> : <Eye size={24} />}
              </div>
            </button>

            {showRawData && (
              <div className="p-8 pt-0 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Application State Monitor</span>
                    <button 
                      onClick={() => {
                        const allData = { user, schools, visits };
                        navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
                        alert("Seluruh data berhasil disalin ke clipboard!");
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Salin Semua JSON
                    </button>
                  </div>
                  <pre className="text-[11px] text-indigo-300/80 font-mono overflow-x-auto custom-scrollbar max-h-[300px] leading-relaxed">
                    {JSON.stringify({ 
                      identity: user, 
                      registered_schools: schools,
                      visit_logs: visits 
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>SIAP MENDAMPING ENGINE V3.9</span>
        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden sm:block"></div>
        <span>Security Verified Profile</span>
        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden sm:block"></div>
        <span>Dinas Pendidikan Digital Transformation</span>
      </footer>
    </div>
  );
};

export default Settings;
