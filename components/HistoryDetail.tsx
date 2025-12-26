
import React, { useState, useRef } from 'react';
import { SchoolVisit, UserProfile } from '../types';
import { 
  ChevronLeft, Printer, Share2, MapPin, Calendar, 
  FileText, Clock, ShieldCheck, Smartphone, Award,
  X, MessageCircle, Link, Camera, CheckCircle2
} from 'lucide-react';

interface HistoryDetailProps {
  visit: SchoolVisit;
  user: UserProfile;
  onBack: () => void;
}

const HistoryDetail: React.FC<HistoryDetailProps> = ({ visit, user, onBack }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const verificationUrl = `https://script.google.com/macros/s/AKfycbyqO-h0eqEmIy28nU3nJvclldjCYaAcunlARhjJSZIFtiGPUjIJicenZXr_EkSN8qePTA/exec?action=verify&id=${visit.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  const getDirectImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('data:image')) return url;
    const driveRegex = /(?:id=|\/d\/|folders\/|file\/d\/)([\w-]{25,})/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const formatCoord = (val: any) => {
    if (val === undefined || val === null || val === '') return '-';
    // Membersihkan karakter aneh, konversi koma ke titik
    const cleanStr = val.toString().replace(',', '.').replace(/[^-0.9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? '-' : num.toFixed(7); // Gunakan 7 desimal untuk akurasi GPS
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const reportHtml = reportRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>LAPORAN_DIGITAL_${visit.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print { 
              .no-print { display: none !important; } 
              body { padding: 0; margin: 0; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 24px; border: 1px solid #e2e8f0; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; vertical-align: top; }
            th { background-color: #f8fafc; color: #64748b; font-weight: 800; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${reportHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative animate-in fade-in duration-500">
      {/* Share Menu */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800">Bagikan Laporan</h3>
               <button onClick={() => setShowShareMenu(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
             </div>
             <div className="space-y-3">
               <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Laporan Kunjungan ' + visit.schoolName + ': ' + verificationUrl)}`, '_blank')} className="w-full flex items-center gap-4 p-5 bg-emerald-50 text-emerald-700 rounded-3xl font-bold border border-emerald-100">
                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white"><MessageCircle size={24} /></div>
                 <span>WhatsApp</span>
               </button>
               <button onClick={() => { navigator.clipboard.writeText(verificationUrl); alert('Tautan disalin!'); setShowShareMenu(false); }} className="w-full flex items-center gap-4 p-5 bg-indigo-50 text-indigo-700 rounded-3xl font-bold border border-indigo-100">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Link size={24} /></div>
                 <span>Salin Tautan</span>
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 sticky top-0 border-b border-slate-100 flex items-center justify-between z-10 print:hidden shadow-sm">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"><ChevronLeft size={24} /></button>
        <div className="flex flex-col items-center">
          <h2 className="font-black text-slate-800 text-sm tracking-widest uppercase">Bukti Digital</h2>
          <span className="text-[9px] font-bold text-slate-400 italic">Verifikasi Koordinat & Foto</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowShareMenu(true)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><Share2 size={20} /></button>
          <button onClick={handlePrint} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><Printer size={20} /></button>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto" ref={reportRef}>
        
        <div className="text-center space-y-2 mb-8">
           <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">BUKTI DIGITAL KUNJUNGAN PENGAWAS</h1>
           <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">ID: {visit.id}</span>
              <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${visit.locationVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {visit.locationStatus || 'Terverifikasi'}
              </span>
           </div>
        </div>

        {/* TABEL DATA UTAMA */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-32">Photo</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date & Time</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">School & Focus</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">GPS Coordinat</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 align-top">
                  <td className="p-4">
                    <div className="flex justify-center">
                      {visit.photoUrl ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 flex items-center justify-center relative group">
                          <img 
                            src={getDirectImageUrl(visit.photoUrl)} 
                            className="w-full h-full object-cover" 
                            alt="Bukti Kunjungan"
                            loading="eager"
                            onError={(e) => {
                               e.currentTarget.onerror = null; 
                               e.currentTarget.src = "https://placehold.co/400x400/f1f5f9/94a3b8?text=Foto+Privat";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200">
                          <Camera size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2 mt-2">
                       <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{visit.date}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{visit.jam || '--:--'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="mt-1 space-y-1">
                      <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">{visit.schoolName}</p>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-tight inline-block border border-indigo-100">
                        {visit.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1 mt-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                      <div className="flex justify-between items-center gap-4 text-[10px]">
                         <span className="font-black text-slate-400 uppercase tracking-widest">Lat:</span> 
                         <span className="font-mono font-black text-slate-700 tracking-tighter">{formatCoord(visit.location?.latitude)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4 text-[10px]">
                         <span className="font-black text-slate-400 uppercase tracking-widest">Lon:</span> 
                         <span className="font-mono font-black text-slate-700 tracking-tighter">{formatCoord(visit.location?.longitude)}</span>
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Radius Selisih</span>
                        <span className="text-[10px] font-black text-indigo-600">{visit.distanceMeter || 0} m</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Catatan & Tindak Lanjut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><FileText size={20} /></div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">Hasil Observasi</h4>
              </div>
              <p className="text-xs font-bold text-slate-600 leading-relaxed italic bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex-1">
                "{visit.notes || 'Tidak ada catatan tambahan.'}"
              </p>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Award size={20} /></div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">Komitmen Perubahan</h4>
              </div>
              <ul className="space-y-3 flex-1">
                {visit.agreedActions && visit.agreedActions.length > 0 ? visit.agreedActions.map((a, i) => (
                  <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-50 shadow-sm">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    {a}
                  </li>
                )) : (
                  <li className="text-xs font-bold text-slate-400 italic p-4">Belum ada rencana aksi.</li>
                )}
              </ul>
           </div>
        </div>

        {/* Tanda Tangan */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mt-8">
           <div className="grid grid-cols-2 gap-12 text-center">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kepala Sekolah,</p>
                 <div className="h-32 flex items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-50 p-2 overflow-hidden">
                    {visit.signaturePrincipal ? (
                      <img src={visit.signaturePrincipal} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="TTD Kepsek" />
                    ) : (
                      <div className="text-slate-200 text-[10px] font-black uppercase tracking-widest">BELUM TTD</div>
                    )}
                 </div>
                 <p className="text-xs font-black text-slate-800 underline underline-offset-4 decoration-indigo-200 uppercase">{visit.principalName || 'Kepala Sekolah'}</p>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengawas Sekolah,</p>
                 <div className="h-32 flex items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-50 p-2 overflow-hidden">
                    {visit.signatureSupervisor ? (
                      <img src={visit.signatureSupervisor} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="TTD Pengawas" />
                    ) : (
                      <div className="text-slate-200 text-[10px] font-black uppercase tracking-widest">BELUM TTD</div>
                    )}
                 </div>
                 <p className="text-xs font-black text-slate-800 underline underline-offset-4 decoration-indigo-200 uppercase">{user.nama_pengawas}</p>
                 <p className="text-[9px] font-bold text-slate-400">NIP: {user.nip}</p>
              </div>
           </div>

           <div className="mt-12 pt-8 border-t border-slate-50 text-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                 <img src={qrCodeUrl} className="w-24 h-24 border p-1 bg-white rounded-lg shadow-sm" alt="QR Link" />
                 <div className="text-left space-y-2 max-w-sm">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck size={14} className="text-indigo-600" /> Integrity System Verified
                    </p>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                       Dokumen ini merupakan bukti sah pelaksanaan tugas pengawasan yang telah verifikasi koordinat lokasi GPS dan foto bukti lapangan melalui platform SIAP-MENDAMPING.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <footer className="text-center py-4 flex flex-col gap-2 no-print">
           <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              <Smartphone size={12} /> Mobile Signature & Geofence Protected
           </div>
        </footer>
      </div>
    </div>
  );
};

export default HistoryDetail;
