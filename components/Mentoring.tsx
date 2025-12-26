
import React, { useState, useMemo } from 'react';
import { 
  School as SchoolIcon, 
  ChevronRight, 
  Search, 
  Calendar, 
  FileText, 
  ArrowLeft,
  BookOpen,
  LayoutGrid,
  History,
  TrendingUp,
  Menu,
  Filter,
  RotateCcw,
  CalendarRange
} from 'lucide-react';
import { SchoolVisit, UserProfile, School } from '../types';

interface MentoringProps {
  visits: SchoolVisit[];
  schools: School[];
  user: UserProfile;
  onVisitClick: (visit: SchoolVisit) => void;
  onMenuClick?: () => void;
}

const Mentoring: React.FC<MentoringProps> = ({ visits, schools, user, onVisitClick, onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSchoolName, setSelectedSchoolName] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter kunjungan berdasarkan rentang tanggal
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const visitDate = new Date(v.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && visitDate < start) return false;
      if (end && visitDate > end) return false;
      return true;
    });
  }, [visits, startDate, endDate]);

  // Mengelompokkan kunjungan hasil filter berdasarkan nama sekolah
  const groupedData = useMemo(() => {
    const groups: Record<string, SchoolVisit[]> = {};
    
    // Pastikan kita mencakup semua sekolah binaan
    schools.forEach(s => {
      groups[s.name] = [];
    });

    // Masukkan kunjungan yang sudah difilter tanggalnya ke grup masing-masing
    filteredVisits.forEach(v => {
      if (!groups[v.schoolName]) {
        groups[v.schoolName] = [];
      }
      groups[v.schoolName].push(v);
    });

    // Urutkan kunjungan dalam grup berdasarkan tanggal terbaru
    Object.keys(groups).forEach(name => {
      groups[name].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return groups;
  }, [filteredVisits, schools]);

  const schoolList = useMemo(() => {
    return Object.keys(groupedData)
      .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => groupedData[b].length - groupedData[a].length); 
  }, [groupedData, searchTerm]);

  const resetFilter = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const isAnyFilterActive = startDate || endDate || searchTerm;

  if (selectedSchoolName) {
    const schoolVisits = groupedData[selectedSchoolName];
    return (
      <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedSchoolName(null)}
            className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">{selectedSchoolName}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Rekam Jejak Pendampingan • {schoolVisits.length} Laporan Terfilter
            </p>
          </div>
        </header>

        <div className="space-y-6 relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

          {schoolVisits.length > 0 ? schoolVisits.map((v, idx) => (
            <div 
              key={v.id} 
              onClick={() => onVisitClick(v)}
              className="relative flex flex-col md:flex-row gap-6 group cursor-pointer"
            >
              <div className="absolute left-8 top-10 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 z-10 hidden md:block group-hover:scale-125 transition-transform"></div>

              <div className="md:ml-16 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:border-indigo-100 transition-all flex-1">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        Laporan Terpilih
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-xs font-bold">{v.date}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                      {v.type}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                      "{v.notes}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Lokasi</p>
                       <span className={`text-[10px] font-black uppercase ${v.locationVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
                         {v.locationVerified ? 'TERVERIFIKASI' : 'JARAK JAUH'}
                       </span>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
              <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Tidak ada laporan pada rentang waktu ini</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32">
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
              Buku Kendali <span className="text-indigo-600">Sekolah</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Rekapitulasi Giat Pendampingan Per Satuan Pendidikan
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
           
           <div className="relative w-full md:w-72 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari sekolah..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Panel Filter Tanggal */}
      {(isFilterOpen || startDate || endDate) && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                 <div className="w-full md:w-auto">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Dari Tanggal</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                       <input 
                          type="date" 
                          className="w-full md:w-48 pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                       />
                    </div>
                 </div>
                 <div className="hidden md:block text-slate-300 mt-6">
                    <ArrowLeft className="rotate-180" size={16} />
                 </div>
                 <div className="w-full md:w-auto">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Sampai Dengan</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                       <input 
                          type="date" 
                          className="w-full md:w-48 pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                 {isAnyFilterActive && (
                    <button 
                       onClick={resetFilter}
                       className="flex items-center gap-2 px-6 py-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                    >
                       <RotateCcw size={14} /> Reset Filter
                    </button>
                 )}
                 <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                 >
                   Terapkan
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Pencarian Mobile */}
      <div className="md:hidden">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari sekolah binaan..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schoolList.map(name => {
          const vList = groupedData[name];
          const hasVisits = vList.length > 0;
          return (
            <div 
              key={name}
              onClick={() => setSelectedSchoolName(name)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
            >
              <SchoolIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:text-indigo-50 transition-colors" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition-all ${hasVisits ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <SchoolIcon size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${hasVisits ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {vList.length} Kunjungan
                    </span>
                  </div>
                </div>

                <div className="min-h-[60px]">
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase leading-tight tracking-tight">
                    {name}
                  </h3>
                  {hasVisits && (
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Terakhir: {vList[0].date}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <History size={14} className="text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lihat Rekap</span>
                   </div>
                   <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight size={16} />
                   </div>
                </div>
              </div>
            </div>
          );
        })}

        {schoolList.length === 0 && (
           <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                 <CalendarRange size={40} />
              </div>
              <h3 className="text-slate-500 font-black uppercase tracking-widest text-sm">Tidak ada data ditemukan</h3>
              <p className="text-slate-400 text-xs mt-2">Coba sesuaikan pencarian atau rentang waktu filter Bapak.</p>
              <button onClick={resetFilter} className="mt-6 text-indigo-600 font-bold text-xs underline underline-offset-4">Reset Semua Filter</button>
           </div>
        )}
      </div>

      <footer className="text-center pt-8 border-t border-slate-100">
         <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            <TrendingUp size={12} /> Progress Monitoring System Enabled
         </div>
      </footer>
    </div>
  );
};

export default Mentoring;
