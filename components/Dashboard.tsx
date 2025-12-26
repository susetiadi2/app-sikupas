
import React, { useMemo } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Users, 
  FileText,
  ChevronRight,
  RefreshCw,
  Loader2,
  MapPin,
  TrendingUp,
  AlertCircle,
  Plus,
  Menu
} from 'lucide-react';
import { SchoolVisit, UserProfile } from '../types';

interface DashboardProps {
  visits: SchoolVisit[];
  user: UserProfile;
  schoolsCount: number;
  onMenuClick?: () => void;
  onRefresh?: () => void;
  onVisitClick: (visit: SchoolVisit) => void;
  isLoading?: boolean;
  onNewVisit?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  visits = [], 
  user, 
  schoolsCount, 
  onMenuClick, 
  onRefresh, 
  onVisitClick, 
  isLoading,
  onNewVisit 
}) => {
  const stats = useMemo(() => {
    const safeVisits = Array.isArray(visits) ? visits : [];
    const totalVisits = safeVisits.length;
    const validLocs = safeVisits.filter(v => v.locationVerified).length;
    const locRate = totalVisits > 0 ? Math.round((validLocs / totalVisits) * 100) : 0;
    
    const avgClimate = totalVisits > 0 
      ? (safeVisits.reduce((acc, v) => acc + (v.empathyMetrics?.schoolClimate || 0), 0) / totalVisits).toFixed(1) 
      : '0.0';

    return [
      { label: 'Total Kunjungan', value: totalVisits, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Sekolah Binaan', value: schoolsCount || 0, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Presensi Valid', value: `${locRate}%`, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Indeks Budaya', value: avgClimate, icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];
  }, [visits, schoolsCount]);

  const getInsight = () => {
    if (!visits || visits.length === 0) return "Selamat bertugas, Bapak. Mulailah kunjungan pertama untuk melihat ringkasan aktivitas pendampingan.";
    const lastVisit = visits[0];
    const locRate = parseInt(stats[2].value.toString());
    if (locRate >= 80) return `Kunjungan konsisten di lokasi (${locRate}%). Pertahankan integritas data lapangan Anda.`;
    return "Aktivitas pendampingan terpantau stabil. Pastikan setiap temuan terdokumentasi dengan baik.";
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header Dashboard */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Tombol Hamburger Mobile */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-white rounded-2xl shadow-md text-indigo-600 border border-indigo-50 hover:bg-indigo-50 transition-all active:scale-90 flex items-center justify-center"
            aria-label="Buka Menu"
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
              Dashboard <span className="text-indigo-600">Pengawas</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">Wilayah Binaan: {user.wilayah} • {user.nama_pengawas}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-3 bg-white rounded-2xl font-bold text-sm shadow-sm border border-slate-100 transition-all ${isLoading ? 'text-indigo-400 opacity-70' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            <span className="hidden sm:inline">Sinkronisasi</span>
          </button>
          
          <button 
            onClick={onNewVisit}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} />
            Input Kunjungan
          </button>
        </div>
      </header>

      {/* Insight Banner */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status Kualitatif</h3>
            <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed italic">
              "{getInsight()}"
            </p>
          </div>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{isLoading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabel Kunjungan Terakhir */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            Update Pendampingan
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase">Real-Time</span>
          </h2>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-6">Sekolah & Fokus</th>
                  <th className="px-8 py-6">Tanggal</th>
                  <th className="px-8 py-6">Integritas Lokasi</th>
                  <th className="px-8 py-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visits.length > 0 ? visits.slice(0, 5).map((v, i) => (
                  <tr 
                    key={v.id || i} 
                    onClick={() => onVisitClick(v)}
                    className="group hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-sm block truncate group-hover:text-indigo-600 transition-colors">
                            {v.schoolName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {v.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-600">{v.date}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${v.locationVerified ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${v.locationVerified ? 'text-emerald-600' : 'text-red-500'}`}>
                          {v.locationVerified ? 'DI LOKASI' : 'JARAK JAUH'}
                        </span>
                      </div>
                      {v.distanceMeter && !v.locationVerified && (
                        <p className="text-[8px] font-bold text-slate-400 mt-1 italic">Selisih: {v.distanceMeter}m</p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <AlertCircle size={48} />
                        <p className="text-sm font-bold uppercase tracking-widest">Belum ada data kunjungan untuk periode ini</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <p>© 2024 SIAP-MENDAMPING CORE ENGINE</p>
        <p>User: {user.nip}</p>
      </footer>
    </div>
  );
};

export default Dashboard;
