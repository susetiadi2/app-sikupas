
export enum SupervisionType {
  IKM = 'Kurikulum Merdeka',
  PBD = 'Rapor Pendidikan',
  Kombel = 'Komunitas Belajar',
  PMM = 'Kinerja PMM',
  Digital = 'Digitalisasi',
  Manajerial = 'Tata Kelola',
  ACADEMIC = 'Akademik',
  COACHING = 'Pendampingan'
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface SchoolVisit {
  id: string;
  inspectorId: string;
  schoolId?: string;
  schoolName: string;
  principalName: string;
  date: string;
  jam?: string;
  type: SupervisionType | string;
  location?: LocationData;
  locationVerified?: boolean;
  distanceMeter?: number;
  locationStatus?: string;
  photoUrl?: string;
  notes: string;
  empathyMetrics: {
    schoolClimate: number;
    teacherEngagement: number;
    leadershipVibe: number;
  };
  keyFindings: string[];
  agreedActions: string[];
  signatureSupervisor?: string;
  signaturePrincipal?: string;
  status: 'Draft' | 'Submitted' | 'Archived';
  link_pdf?: string;
}

export interface School {
  id: string;
  npsn: string;
  name: string;
  principal: string;
  inspectorId: string; // ID Pengawas yang ditugaskan
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  id_pengawas: string;
  nama_pengawas: string;
  nip: string;
  email: string;
  wilayah: string;
  jabatan: string;
  aktif: string | boolean;
  photo_url?: string;
  isAuthenticated: boolean;
}
