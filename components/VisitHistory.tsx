
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  RotateCcw, 
  ChevronRight, 
  Plus, 
  Menu,
  FileText,
  Clock,
  MapPin,
  CalendarRange,
  ArrowRight
} from 'lucide-react';
import { SchoolVisit } from '../types';

interface VisitHistoryProps {
  visits: SchoolVisit[];
  onVisitClick: (visit: SchoolVisit) => void;
  onNewVisit: () => void;
  onMenuClick: () => void;
}

const VisitHistory: React.FC<VisitHistoryProps> = ({ visits, onVisitClick, onNewVisit, onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredData = useMemo(() => {
    return visits.filter(v => {
      const visitDate = new Date(v.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const matchesSearch = v.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           v.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (start && visitDate < start) return false;
      if (end && visitDate > end) return false;
      
      return matchesSearch;
    });
  }, [visits, searchTerm, startDate, endDate]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-white rounded-2xl shadow-sm text-indigo-600 border border-slate-100"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">
              Arsip <span className="text-indigo-600">Kunjungan</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Data Historis Pendampingan Satuan Pendidikan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs transition-all border ${isFilterOpen || startDate || endDate ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
           >
             <Filter size={16} />
             <span>Filter Waktu</span>
             {(startDate || endDate) && <span className="w-2 h-2 bg-white rounded-full animate-pulse ml-1"></span>}
           </button>
           
           <button 
              onClick={onNewVisit}
              className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-slate-100 active:scale-95 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Input Baru</span>
            </button>
        </div>
      </header>

      {/* Filter Panel */}
      {(isFilterOpen || startDate || endDate) && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto flex-1">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Cari Kata Kunci</label>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                          type="text" 
                          placeholder="Nama sekolah / kegiatan..."
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Dari Tanggal</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                       <input 
                          type="date" 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Sampai Dengan</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                       <input 
                          type="date" 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                 {(startDate || endDate || searchTerm) && (
                    <button 
                       onClick={resetFilters}
                       className="flex items-center gap-2 px-6 py-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                    >
                       <RotateCcw size={14} /> Reset
                    </button>
                 )}
                 <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex-1 md:flex-none"
                 >
                   Selesai
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* List Section */}
      <div className="space-y-4">
        {filteredData.length > 0 ? filteredData.map((v) => (
          <div 
            key={v.id}
            onClick={() => onVisitClick(v)}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-5 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${v.locationVerified ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-400'}`}>
                <FileText size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate text-lg">{v.schoolName}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{v.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{v.jam || "--:--"}</span>
                  </div>
                  <span className="px-3 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-tight inline-block border border-indigo-100">
                    {v.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Integritas Lokasi</p>
                 <div className="flex items-center justify-end gap-2">
                    <div className={`w-2 h-2 rounded-full ${v.locationVerified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tight ${v.locationVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                      {v.locationVerified ? 'DI LOKASI' : 'JARAK JAUH'}
                    </span>
                 </div>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white py-32 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 space-y-4">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
               <CalendarRange size={48} className="opacity-20" />
             </div>
             <div className="text-center">
                <h3 className="font-black text-sm uppercase tracking-widest opacity-50">Tidak ada data ditemukan</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Gunakan filter atau pencarian lain.</p>
             </div>
             <button onClick={resetFilters} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest underline underline-offset-4 decoration-2">Hapus Filter</button>
          </div>
        )}
      </div>

      <footer className="text-center pt-8 border-t border-slate-100">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">SIAP MENDAMPING CORE SYSTEM</p>
      </footer>
    </div>
  );
};

export default VisitHistory;
