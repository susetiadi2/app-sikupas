
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VisitForm from './components/VisitForm';
import Login from './components/Login';
import HistoryDetail from './components/HistoryDetail';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Mentoring from './components/Mentoring';
import VisitHistory from './components/VisitHistory'; // Import komponen baru
import { SchoolVisit, UserProfile, School } from './types';
import { Loader2 } from 'lucide-react';

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw3Jr5kR1UjopdMpP5nk17-iulrFYzKdS30OI88uFiTqFsZtt_RLgIK1u6s4TXnWzM4gw/exec';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visits, setVisits] = useState<SchoolVisit[]>([]);
  const [mySchools, setMySchools] = useState<School[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<SchoolVisit | null>(null);
  const [isNewVisit, setIsNewVisit] = useState(false);
  const [instruments, setInstruments] = useState([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async (inspectorId: string) => {
    setIsLoadingData(true);
    try {
      const visitRes = await fetch(`${GAS_API_URL}?action=getVisits&inspectorId=${inspectorId}`);
      const visitResult = await visitRes.json();
      if (visitResult.status === 'success') {
        const mappedVisits = visitResult.data.map((v: any) => ({
          ...v,
          jam: v.jam || "",
          empathyMetrics: v.empathyMetrics || { schoolClimate: 3, teacherEngagement: 3, leadershipVibe: 3 },
          keyFindings: Array.isArray(v.keyFindings) ? v.keyFindings : (typeof v.keyFindings === 'string' && v.keyFindings !== "" ? v.keyFindings.split(', ') : []),
          agreedActions: Array.isArray(v.agreedActions) ? v.agreedActions : (typeof v.agreedActions === 'string' && v.agreedActions !== "" ? v.agreedActions.split(', ') : [])
        }));
        setVisits(mappedVisits);
        localStorage.setItem('siap_visits', JSON.stringify(mappedVisits));
      }

      const schoolRes = await fetch(`${GAS_API_URL}?action=getSchools&inspectorId=${inspectorId}`);
      const schoolResult = await schoolRes.json();
      if (schoolResult.status === 'success') {
        setMySchools(schoolResult.data || []);
        localStorage.setItem('siap_schools', JSON.stringify(schoolResult.data || []));
      }
    } catch (error) {
      console.error("Kesalahan Koneksi Server:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchUserData = async (id_pengawas: string) => {
    try {
      const userRes = await fetch(`${GAS_API_URL}?action=getUser&id_pengawas=${id_pengawas}`);
      const userResult = await userRes.json();
      if (userResult.status === 'success') {
        const updatedUser = { ...userResult.data, isAuthenticated: true };
        setUser(updatedUser);
        localStorage.setItem('siap_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Kesalahan Mengambil Data User:", error);
    }
  };

  const uploadUserPhoto = async (file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const response = await fetch(GAS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateUserPhoto', id_pengawas: user.id_pengawas, photoData: base64 })
        });
        const result = await response.json();
        if (result.status === 'success') {
          const updatedUser = { ...user, photo_url: result.photoUrl };
          setUser(updatedUser);
          localStorage.setItem('siap_user', JSON.stringify(updatedUser));
        } else {
          alert('Gagal upload foto: ' + result.message);
        }
      } catch (error) {
        console.error("Kesalahan Upload Foto:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('siap_user');
    const savedSchools = localStorage.getItem('siap_schools');
    const savedVisits = localStorage.getItem('siap_visits');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (savedSchools) setMySchools(JSON.parse(savedSchools));
      if (savedVisits) setVisits(JSON.parse(savedVisits));
      fetchData(parsedUser.id_pengawas);
    }
  }, []);

  const handleLogin = async (nip: string, password?: string) => {
    setIsAuthenticating(true);
    setLoginError(null);
    try {
      const cleanNip = nip.trim();
      const cleanPass = password ? password.trim() : "";
      const fetchUrl = `${GAS_API_URL}?action=login&nip=${cleanNip}&password=${encodeURIComponent(cleanPass)}`;
      const response = await fetch(fetchUrl);
      const result = await response.json();
      
      if (result.status === 'success') {
        const userData: UserProfile = { ...result.data, isAuthenticated: true };
        setUser(userData);
        localStorage.setItem('siap_user', JSON.stringify(userData));
        await fetchData(userData.id_pengawas);
      } else {
        setLoginError(result.message || 'NIP tidak terdaftar atau sandi salah.');
      }
    } catch (error) {
      setLoginError('Gangguan Koneksi. Pastikan internet stabil.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setVisits([]);
    setMySchools([]);
    localStorage.clear();
  };

  const handleSaveVisit = async (newVisit: SchoolVisit) => {
    if (!user) return;
    setIsSaving(true);

    const now = new Date();
    const localTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    const visitData = { ...newVisit, inspectorId: user.id_pengawas, jam: localTime };
    console.log('Sending visitData:', visitData);

    try {
      await fetch(GAS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveVisit', data: visitData })
      });
      
      const updatedVisits = [visitData, ...visits];
      setVisits(updatedVisits);
      localStorage.setItem('siap_visits', JSON.stringify(updatedVisits));
      
      setTimeout(() => fetchData(user.id_pengawas), 3000);
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
      setActiveTab('dashboard');
      setIsNewVisit(false);
    }
  };

  if (isAuthenticating || isSaving) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
          {isSaving ? 'Menyimpan Laporan...' : 'Verifikasi Keamanan...'}
        </p>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    if (selectedVisit) return <HistoryDetail visit={selectedVisit} user={user} onBack={() => setSelectedVisit(null)} />;
    if (isNewVisit) return <VisitForm onSave={handleSaveVisit} onCancel={() => setIsNewVisit(false)} user={user} schoolsList={mySchools} />;

    switch (activeTab) {
      case 'dashboard': 
        return (
          <Dashboard 
            visits={visits} 
            user={user} 
            schoolsCount={mySchools.length} 
            onMenuClick={() => setIsSidebarOpen(true)}
            onRefresh={() => fetchData(user.id_pengawas)}
            onVisitClick={(v) => setSelectedVisit(v)}
            isLoading={isLoadingData}
            onNewVisit={() => setIsNewVisit(true)}
          />
        );
      case 'mentoring':
        return (
          <Mentoring 
            visits={visits}
            schools={mySchools}
            user={user}
            onVisitClick={(v) => setSelectedVisit(v)}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        );
      case 'settings':
        return (
          <Settings
            user={user}
            schools={mySchools}
            visits={visits}
            onRefresh={() => { fetchData(user.id_pengawas); fetchUserData(user.id_pengawas); }}
            isLoading={isLoadingData}
            onMenuClick={() => setIsSidebarOpen(true)}
            onUploadPhoto={uploadUserPhoto}
          />
        );
      case 'reports':
        return (
          <Reports 
            visits={visits} 
            user={user} 
            onMenuClick={() => setIsSidebarOpen(true)}
            onVisitClick={(v) => setSelectedVisit(v)}
          />
        );
      case 'history': // Peningkatan: Sekarang menggunakan komponen VisitHistory dengan filter
        return (
          <VisitHistory 
            visits={visits}
            onVisitClick={(v) => setSelectedVisit(v)}
            onNewVisit={() => setIsNewVisit(true)}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FE] relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {!selectedVisit && !isNewVisit && (
        <div className={`fixed inset-y-0 left-0 z-40 lg:static transform lg:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            currentTab={activeTab} 
            setTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
            onLogout={handleLogout}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}
      
      <main className="flex-1 min-h-screen overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
