
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  BarChart3, 
  FileText,
  MapPin,
  TrendingUp,
  Download,
  Menu,
  CheckCircle2,
  AlertCircle,
  Target,
  ArrowRight
} from 'lucide-react';
import { SchoolVisit, UserProfile, SupervisionType } from '../types';

interface ReportsProps {
  visits: SchoolVisit[];
  user: UserProfile;
  onMenuClick?: () => void;
  onVisitClick: (visit: SchoolVisit) => void;
}

const Reports: React.FC<ReportsProps> = ({ visits, user, onMenuClick, onVisitClick }) => {
  const [filterType, setFilterType] = useState<'weekly' | 'semester'>('weekly');
  const [selectedSemester, setSelectedSemester] = useState<'ganjil' | 'genap'>(
    new Date().getMonth() >= 6 ? 'ganjil' : 'genap'
  );

  // Filter Data Berdasarkan Periode
  const filteredVisits = useMemo(() => {
    const now = new Date();
    return visits.filter(v => {
      const visitDate = new Date(v.date);
      if (filterType === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return visitDate >= weekAgo;
      } else {
        const month = visitDate.getMonth();
        return selectedSemester === 'ganjil' ? (month >= 6 && month <= 11) : (month >= 0 && month <= 5);
      }
    });
  }, [visits, filterType, selectedSemester]);

  // Statistik Laporan
  const stats = useMemo(() => {
    const total = filteredVisits.length;
    const validLoc = filteredVisits.filter(v => v.locationVerified).length;
    const validPercent = total > 0 ? Math.round((validLoc / total) * 100) : 0;
    
    // Hitung Distribusi Jenis Supervisi
    const distribution: Record<string, number> = {};
    filteredVisits.forEach(v => {
      distribution[v.type] = (distribution[v.type] || 0) + 1;
    });

    const topFocus = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total, validLoc, validPercent, distribution, topFocus };
  }, [filteredVisits]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24">
      {/* Header & Filter Toggle */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-white rounded-2xl shadow-sm text-indigo-600 border border-slate-100"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">
              Analisis <span className="text-indigo-600">Kinerja</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Periode Laporan: {filterType === 'weekly' ? '7 Hari Terakhir' : `Semester ${selectedSemester === 'ganjil' ? 'I (Ganjil)' : 'II (Genap)'}`}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setFilterType('weekly')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${filterType === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mingguan
          </button>
          <button 
            onClick={() => setFilterType('semester')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${filterType === 'semester' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Semesteran
          </button>
        </div>
      </header>

      {/* Semester Selection Cards */}
      {filterType === 'semester' && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
          <button 
            onClick={() => setSelectedSemester('ganjil')}
            className={`p-6 rounded-[2rem] border-2 text-left transition-all ${selectedSemester === 'ganjil' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
          >
            <Calendar className="mb-4 opacity-50" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Juli - Desember</p>
            <h3 className="font-black text-lg">Semester Ganjil</h3>
          </button>
          <button 
            onClick={() => setSelectedSemester('genap')}
            className={`p-6 rounded-[2rem] border-2 text-left transition-all ${selectedSemester === 'genap' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
          >
            <Calendar className="mb-4 opacity-50" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Januari - Juni</p>
            <h3 className="font-black text-lg">Semester Genap</h3>
          </button>
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Activity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-48 group hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <TrendingUp size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Giat</p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">{stats.total}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min((stats.total / 10) * 100, 100)}%` }}></div>
          </div>
          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Kuantitas Pendampingan Terpantau</p>
        </div>

        {/* Focus Type */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-48 group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Target size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fokus Utama</p>
              <h3 className="text-xl font-black text-slate-800 mt-1 truncate max-w-[120px]">{stats.topFocus}</h3>
            </div>
          </div>
          <div className="mt-4">
             <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-1">
                <span>Intensitas Fokus</span>
                {/* Fallback to 0 for arithmetic safety if Record lookup is undefined */}
                <span>{stats.total > 0 ? Math.round(((stats.distribution[stats.topFocus] || 0) / stats.total) * 100) : 0}%</span>
             </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                {/* Fallback to 0 for arithmetic safety if Record lookup is undefined */}
                <div className="bg-emerald-500 h-full" style={{ width: `${stats.total > 0 ? ((stats.distribution[stats.topFocus] || 0) / stats.total) * 100 : 0}%` }}></div>
             </div>
          </div>
          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Topik Supervisi Dominan</p>
        </div>

        {/* Geofence Integrity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-48 group hover:border-amber-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
              <MapPin size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integritas Data</p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">{stats.validPercent}%</h3>
            </div>
          </div>
          <div className="mt-4 space-y-2">
             <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{stats.validLoc} Terverifikasi GPS</span>
             </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${stats.validPercent}%` }}></div>
             </div>
          </div>
          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Validitas Presensi Lapangan</p>
        </div>
      </div>

      {/* Analysis Section: Supervision Type Distribution */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-600" /> Distribusi Capaian Supervisi
        </h3>
        <div className="space-y-6">
          {Object.entries(stats.distribution).map(([type, count]) => (
            <div key={type} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-slate-700">{type}</span>
                <span className="text-[10px] font-black text-indigo-600">{count} Giat</span>
              </div>
              <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100 p-0.5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-1000"
                  /* Explicitly cast count as any/number to satisfy potential strict compiler arithmetic checks */
                  style={{ width: `${((count as any) / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
          {Object.keys(stats.distribution).length === 0 && (
            <p className="text-center py-10 text-slate-400 italic text-sm">Belum ada data distribusi supervisi.</p>
          )}
        </div>
      </div>

      {/* Detailed List Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Log Aktivitas Terperinci</h2>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
            <Download size={14} /> Ekspor PDF
          </button>
        </div>

        <div className="grid gap-4">
          {filteredVisits.length > 0 ? filteredVisits.map((v) => (
            <div 
              key={v.id}
              onClick={() => onVisitClick(v)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${v.locationVerified ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-400'}`}>
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{v.schoolName}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.date}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{v.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status Kehadiran</p>
                   <div className="flex items-center justify-end gap-2">
                      {v.locationVerified ? (
                        <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-tight">
                          <CheckCircle2 size={12} /> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-red-500 flex items-center gap-1 uppercase tracking-tight">
                          <AlertCircle size={12} /> Jarak Jauh
                        </span>
                      )}
                   </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white py-24 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                 <FileText size={40} className="opacity-20" />
               </div>
               <p className="font-black text-sm uppercase tracking-widest opacity-50">Belum ada rekam jejak untuk periode ini</p>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center pt-8 border-t border-slate-100">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">SIAP MENDAMPING ANALYTICS CORE</p>
      </footer>
    </div>
  );
};

export default Reports;
