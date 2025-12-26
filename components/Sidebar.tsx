
import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ClipboardList, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, onLogout, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Kunjungan', icon: Briefcase },
    { id: 'mentoring', label: 'Pendampingan', icon: Users },
    { id: 'reports', label: 'Laporan', icon: ClipboardList },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white h-screen sticky top-0 border-r border-slate-100 flex flex-col p-6 z-20 shrink-0 shadow-xl lg:shadow-none">
      {/* Logo & Close Button (Mobile Only) */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ShieldCheck size={24} />
          </div>
          <div className="leading-tight">
            <h1 className="font-black text-slate-800 text-sm">SIAP</h1>
            <h1 className="font-black text-slate-800 text-sm">MENDAMPING</h1>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="pt-6 border-t border-slate-50 space-y-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-500 rounded-xl transition-all font-semibold text-sm"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>

        <div className="px-4 py-3 rounded-xl bg-slate-50 flex items-center justify-between group cursor-pointer">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            V 3.9 Stable
          </div>
          <ChevronRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
