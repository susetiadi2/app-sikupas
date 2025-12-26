
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, MapPin, ListPlus, Send, Loader2, Search, 
  CheckCircle2, AlertCircle, BookOpen, BarChart3, 
  Users, Monitor, Settings, Zap, Heart, PenTool,
  RotateCcw, Trash2, Navigation2, Crosshair, Globe
} from 'lucide-react';
import { SchoolVisit, SupervisionType, LocationData, School, UserProfile } from '../types';

interface VisitFormProps {
  onSave: (visit: SchoolVisit) => void;
  onCancel: () => void;
  user: UserProfile;
  schoolsList: School[];
}

const SignaturePad: React.FC<{ label: string, onSave: (data: string) => void }> = ({ label, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (hasSignature && canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
  };

  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <button onClick={(e) => { e.preventDefault(); clear(); }} className="text-red-500 p-1.5 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1">
          <RotateCcw size={12} />
          <span className="text-[9px] font-bold uppercase">Ulangi</span>
        </button>
      </div>
      <div className="bg-white border-2 border-slate-200 rounded-[2rem] overflow-hidden h-44 relative touch-none shadow-sm group-hover:border-indigo-200 transition-colors">
        <canvas
          ref={canvasRef}
          width={500}
          height={176}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => { startDrawing(e); }}
          onTouchMove={(e) => { draw(e); }}
          onTouchEnd={(e) => { stopDrawing(); }}
          className="w-full h-full cursor-crosshair"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300 gap-2">
            <PenTool size={20} className="opacity-30" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tanda Tangan di Sini</span>
          </div>
        )}
      </div>
    </div>
  );
};

const VisitForm: React.FC<VisitFormProps> = ({ onSave, onCancel, user, schoolsList }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationVerified, setLocationVerified] = useState<boolean | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolList, setShowSchoolList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<SchoolVisit>>({
    id: 'VK-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    date: new Date().toISOString().split('T')[0],
    schoolId: '',
    schoolName: '',
    principalName: '',
    type: '' as any,
    notes: '',
    empathyMetrics: { schoolClimate: 3, teacherEngagement: 3, leadershipVibe: 3 },
    keyFindings: [],
    agreedActions: [],
    status: 'Draft',
    signatureSupervisor: '',
    signaturePrincipal: ''
  });

  const [newAction, setNewAction] = useState('');
  const [newFinding, setNewFinding] = useState('');

  const supervisionMenus = [
    { id: SupervisionType.IKM, label: 'IKM', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: SupervisionType.PBD, label: 'PBD', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: SupervisionType.Kombel, label: 'Kombel', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: SupervisionType.PMM, label: 'PMM', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: SupervisionType.Digital, label: 'Digital', icon: Monitor, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: SupervisionType.Manajerial, label: 'Manajerial', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50' }
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const validateGeofence = (loc: LocationData, school: School) => {
    if (school.latitude && school.longitude) {
      const dist = calculateDistance(loc.latitude, loc.longitude, school.latitude, school.longitude);
      setDistance(dist);
      setLocationVerified(dist <= 250); 
    } else {
      setDistance(null);
      setLocationVerified(null);
    }
  };

  const fetchLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser ini.");
      setLoading(false);
      return;
    }
    if (navigator.permissions) {
      navigator.permissions.query({name:'geolocation'}).then(permission => {
        if (permission.state === 'denied') {
          alert("Akses lokasi ditolak. Mohon izinkan akses lokasi di pengaturan browser dan refresh halaman.");
          setLoading(false);
          return;
        }
        getLocation();
      }).catch(() => {
        getLocation(); // fallback
      });
    } else {
      getLocation();
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setLocation(loc);
        if (selectedSchool) validateGeofence(loc, selectedSchool);
        setLoading(false);
      },
      (error) => {
        let message = "Gagal mengambil lokasi.";
        if (error.code === error.PERMISSION_DENIED) {
          message += " Akses lokasi ditolak.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message += " Lokasi tidak tersedia.";
        } else if (error.code === error.TIMEOUT) {
          message += " Timeout mengambil lokasi.";
        }
        message += " Mohon aktifkan GPS dan izinkan akses lokasi.";
        alert(message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectSchool = (school: School) => {
    setSelectedSchool(school);
    setFormData({ ...formData, schoolId: school.id, schoolName: school.name, principalName: school.principal });
    setShowSchoolList(false);
    fetchLocation();
  };

  const filteredSchools = schoolsList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.npsn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 pb-32 bg-slate-50 min-h-screen max-w-2xl mx-auto">
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
          reader.readAsDataURL(file);
        }
      }} />
      
      {/* Step Progress */}
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Trash2 size={20} /></button>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 w-10 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800">Validasi Lokasi</h2>
            <p className="text-sm text-slate-500 font-medium">Pilih sekolah dan lokasi akan diverifikasi otomatis.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={fetchLocation} 
              className={`w-full p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-2 transition-all ${location ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 shadow-sm'}`}
            >
              {loading ? <Loader2 size={32} className="animate-spin text-indigo-600" /> : <MapPin size={32} />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{location ? 'KOORDINAT TERKUNCI' : 'Klik untuk Ambil Lokasi GPS'}</span>
            </button>

            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block px-1">Pilih Sekolah Binaan</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari sekolah..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none text-sm font-bold"
                  value={selectedSchool ? selectedSchool.name : searchTerm}
                  onFocus={() => { setShowSchoolList(true); if (selectedSchool) { setSelectedSchool(null); setSearchTerm(''); } }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {showSchoolList && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {filteredSchools.map(s => (
                    <button key={s.id} onClick={() => selectSchool(s)} className="w-full p-4 border-b border-slate-50 hover:bg-indigo-50 text-left">
                      <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DETAIL VERIFIKASI GEOPOSISI (INTI PERUBAHAN) */}
            {selectedSchool && location && (
              <div className={`p-6 rounded-[2.5rem] border-2 space-y-4 animate-in fade-in zoom-in-95 duration-300 ${locationVerified === true ? 'bg-emerald-50 border-emerald-100' : locationVerified === false ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${locationVerified === true ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                       <Navigation2 size={20} className={locationVerified ? "animate-pulse" : ""} />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">{selectedSchool.name}</h3>
                       <p className={`text-[10px] font-black ${locationVerified ? 'text-emerald-700' : 'text-red-700'} uppercase tracking-widest`}>
                        {locationVerified ? 'LOKASI SESUAI (IN-RADIUS)' : 'LOKASI TIDAK SESUAI'}
                       </p>
                    </div>
                  </div>
                  {locationVerified === true ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-400" />}
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-200/50">
                   {/* Lokasi Bapak */}
                   <div className="bg-white/60 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <Crosshair size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lokasi Pengawas (Anda)</p>
                        <p className="text-[10px] font-mono font-bold text-slate-600 truncate">
                          Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                        </p>
                      </div>
                   </div>

                   {/* Lokasi Sekolah */}
                   <div className="bg-white/60 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                      <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                        <Globe size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Koordinat Sekolah Target</p>
                        <p className="text-[10px] font-mono font-bold text-slate-600 truncate">
                          Lat: {selectedSchool.latitude?.toFixed(6) || '-'}, Lon: {selectedSchool.longitude?.toFixed(6) || '-'}
                        </p>
                      </div>
                   </div>

                   {/* Rincian Jarak */}
                   <div className={`p-3 rounded-2xl flex items-center justify-between ${locationVerified ? 'bg-emerald-100/50' : 'bg-red-100/50'}`}>
                      <div className="flex items-center gap-3">
                         <MapPin size={16} className={locationVerified ? 'text-emerald-600' : 'text-red-600'} />
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Akurasi Radius Jarak</span>
                      </div>
                      <div className="text-right">
                         <span className={`text-sm font-black ${locationVerified ? 'text-emerald-700' : 'text-red-700'}`}>
                           {distance !== null ? `${Math.round(distance)} Meter` : '---'}
                         </span>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setStep(2)} 
            disabled={!location || !selectedSchool}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2.5rem] font-black shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all mt-6 uppercase tracking-[0.2em] text-xs"
          >
            Mulai Instrumen Supervisi
          </button>
        </div>
      )}

      {/* Step 2-4 tetap menggunakan logika yang ada */}
      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800">Instrumen Kunjungan</h2>
            <p className="text-sm text-slate-500 font-medium">Tentukan fokus pendampingan hari ini.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {supervisionMenus.map(m => (
              <button 
                key={m.id} onClick={() => setFormData({...formData, type: m.id})}
                className={`p-4 rounded-[1.5rem] border-2 text-left flex items-center gap-3 transition-all ${formData.type === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                <m.icon size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
          <textarea 
            className="w-full p-5 rounded-[2rem] border border-slate-200 bg-white text-sm font-medium min-h-[150px] outline-none focus:border-indigo-500 transition-colors"
            placeholder="Tuliskan catatan kualitatif hasil observasi..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Kembali</button>
            <button onClick={() => setStep(3)} disabled={!formData.type || !formData.notes} className="flex-[2] bg-indigo-600 text-white py-4 rounded-[2rem] font-black shadow-lg shadow-indigo-50">Berikutnya</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800">Temuan dan Tindak Lanjut</h2>
            <p className="text-sm text-slate-500 font-medium">Rumuskan temuan utama dan komitmen perubahan untuk sekolah.</p>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temuan Utama</label>
             <div className="space-y-4">
               <div className="flex gap-2">
                 <input
                   type="text" placeholder="Tambah temuan..."
                   className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                   value={newFinding} onChange={(e) => setNewFinding(e.target.value)}
                   onKeyPress={(e) => {
                     if(e.key === 'Enter' && newFinding){
                       setFormData({...formData, keyFindings: [...(formData.keyFindings || []), newFinding]});
                       setNewFinding('');
                     }
                   }}
                 />
                 <button onClick={() => { if(newFinding){setFormData({...formData, keyFindings: [...(formData.keyFindings || []), newFinding]}); setNewFinding('');} }} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-md"><ListPlus /></button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {formData.keyFindings?.map((f, i) => (
                   <div key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl uppercase flex items-center gap-2 border border-emerald-100">
                     {f}
                     <button onClick={() => setFormData({...formData, keyFindings: formData.keyFindings?.filter((_, idx) => idx !== i)})}>
                       <Trash2 size={12} className="text-emerald-300 hover:text-red-500" />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
             <div className="flex gap-2">
               <input
                 type="text" placeholder="Tambah rencana aksi..."
                 className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                 value={newAction} onChange={(e) => setNewAction(e.target.value)}
                 onKeyPress={(e) => {
                   if(e.key === 'Enter' && newAction){
                     setFormData({...formData, agreedActions: [...(formData.agreedActions || []), newAction]});
                     setNewAction('');
                   }
                 }}
               />
               <button onClick={() => { if(newAction){setFormData({...formData, agreedActions: [...(formData.agreedActions || []), newAction]}); setNewAction('');} }} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-md"><ListPlus /></button>
             </div>
             <div className="flex flex-wrap gap-2">
                {formData.agreedActions?.map((a, i) => (
                  <div key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl uppercase flex items-center gap-2 border border-indigo-100">
                    {a}
                    <button onClick={() => setFormData({...formData, agreedActions: formData.agreedActions?.filter((_, idx) => idx !== i)})}>
                      <Trash2 size={12} className="text-indigo-300 hover:text-red-500" />
                    </button>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(2)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Kembali</button>
            <button onClick={() => setStep(4)} disabled={formData.agreedActions?.length === 0} className="flex-[2] bg-indigo-600 text-white py-4 rounded-[2rem] font-black shadow-lg shadow-indigo-50">Tahap Akhir (TTD)</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800">Pengesahan Digital</h2>
            <p className="text-sm text-slate-500 font-medium">Lengkapi dokumentasi dan tanda tangan elektronik.</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-48 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${formData.photoUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
            >
              {formData.photoUrl ? (
                <img src={formData.photoUrl} className="w-full h-full object-cover rounded-[2.3rem] p-1.5" />
              ) : (
                <>
                  <Camera size={40} className="text-slate-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ambil Foto Bukti Kunjungan</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-1 gap-8">
               <SignaturePad 
                label={`Tanda Tangan Pengawas (${user.nama_pengawas})`} 
                onSave={(sig) => setFormData({...formData, signatureSupervisor: sig})} 
               />
               <SignaturePad
                label={`Tanda Tangan Kepala Sekolah (${formData.principalName || 'Kepala Sekolah ' + formData.schoolName})`}
                onSave={(sig) => setFormData({...formData, signaturePrincipal: sig})}
               />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
             <button
                onClick={() => {
                  const finalData = {
                    ...formData,
                    location: location!,
                    locationVerified: locationVerified === true,
                    distanceMeter: distance ? Math.round(distance) : 0,
                    locationStatus: locationVerified === true ? "DI LOKASI" : "JARAK JAUH",
                    status: 'Submitted'
                  } as SchoolVisit;
                  console.log('finalData:', finalData);
                  onSave(finalData);
                }}
                disabled={!formData.photoUrl || !formData.signatureSupervisor || !formData.signaturePrincipal}
                className="w-full bg-indigo-600 text-white py-5 rounded-[2.5rem] font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
             >
               <Send size={20} /> Simpan Laporan Ber-TTD
             </button>
             <button onClick={() => setStep(3)} className="w-full py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Kembali</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitForm;
