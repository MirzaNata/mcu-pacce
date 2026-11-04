import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  User as UserIcon, 
  Activity, 
  Stethoscope, 
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  X,
  Eye,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  Coffee,
  Eye as VisionIcon,
  FlaskConical,
  Scan,
} from 'lucide-react';
import { mcuService } from '../services/mcuService';
import { patientService } from '../services/patientService';
import { labService } from '../services/labService';
import { radiologyService } from '../services/radiologyService';
import { attachmentService } from '../services/attachmentService';
import type { Patient, MCURecord, Attachment } from '../types';
import { PdfAttachmentRenderer } from '../components/PdfAttachmentRenderer';

const ANAMNESIS_COMPLAINTS_MAP: Record<string, string> = {
  nyeri_dada: 'Nyeri dada',
  pusing: 'Pusing',
  nyeri_lutut: 'Nyeri lutut',
  nyeri_punggung: 'Nyeri punggung',
  tremor: 'Tremor',
  sesak_napas: 'Sesak napas dengan atau tanpa aktivitas',
  diare_sembelit: 'Diare/sembelit',
  haid_tidak_teratur: 'Siklus haid tidak teratur',
  pingsan_berulang: 'Riwayat pingsan berulang',
  masalah_kulit: 'Masalah kulit (bentol, eksim, psoriasis)',
  berdebar: 'Berdebar',
  batuk: 'Batuk',
  nyeri_perut: 'Nyeri perut',
  maag: 'Maag',
  penurunan_bb: 'Penurunan berat badan',
  riwayat_kejang: 'Riwayat kejang',
  kaki_bengkak: 'Kaki bengkak',
  alergi: 'Alergi',
  sakit_kepala: 'Sakit kepala',
  demam: 'Demam',
  patah_tulang: 'Riwayat patah tulang',
  tidak_ada_keluhan: 'Tidak ada keluhan',
  lainnya: 'Lainnya',
};

const MEDICAL_HISTORY_ITEMS = [
  { id: 'kelainan_kongenital', label: '1. Kelainan kongenital atau bawaan' },
  { id: 'alergi', label: '2. Alergi, termasuk alergi obat-obatan' },
  { id: 'hipertensi', label: '3. Hipertensi' },
  { id: 'penyakit_jantung', label: '4. Penyakit jantung atau pembuluh darah' },
  { id: 'stroke', label: '5. Stroke atau penyakit saraf lainnya' },
  { id: 'diabetes_melitus', label: '6. Diabetes Melitus' },
  { id: 'asma', label: '7. Asma' },
  { id: 'penyakit_tiroid', label: '8. Penyakit kelenjar tiroid' },
  { id: 'penyakit_ginjal', label: '9. Penyakit ginjal' },
  { id: 'kanker_ganas', label: '10. Kanker ganas' },
  { id: 'batu_saluran_kencing', label: '11. Riwayat batu saluran kencing' },
  { id: 'tuberkulosis', label: '12. Tuberkulosis (TB)' },
  { id: 'hepatitis_b', label: '13. Hepatitis B' },
  { id: 'sakit_kritis', label: '14. Riwayat sakit kritis' },
  { id: 'kecelakaan_lalu_lintas', label: '15. Riwayat kecelakaan lalu lintas' },
  { id: 'tindakan_operasi', label: '16. Riwayat tindakan operasi' },
  { id: 'penyakit_kejiwaan', label: '17. Penyakit kejiwaan' },
  { id: 'lainnya', label: '18. Lainnya' },
];

const VACCINATION_ITEMS = [
  { id: 'hepatitis_b', label: '1. Hepatitis B' },
  { id: 'dpt', label: '2. DPT' },
  { id: 'bcg', label: '3. BCG' },
  { id: 'polio', label: '4. Polio' },
  { id: 'hib', label: '5. HiB' },
  { id: 'pcv', label: '6. PCV' },
  { id: 'rotavirus', label: '7. Rotavirus' },
  { id: 'lainnya', label: '8. Lainnya' },
];

const PHYSICAL_EXAM_ITEMS = [
  { id: 'kepala', label: '1. Kepala' },
  { id: 'mata', label: '2. Mata' },
  { id: 'telinga', label: '3. Telinga' },
  { id: 'hidung', label: '4. Hidung' },
  { id: 'mulut', label: '5. Mulut' },
  { id: 'leher_tenggorokan', label: '6. Leher dan Tenggorokan' },
  { id: 'tonsil', label: '7. Tonsil' },
  { id: 'tiroid', label: '8. Tiroid' },
  { id: 'thorax', label: '9. Thorax' },
  { id: 'paru', label: '10. Paru' },
  { id: 'jantung', label: '11. Jantung' },
  { id: 'abdomen', label: '12. Abdomen' },
  { id: 'ekstremitas', label: '13. Ekstremitas' },
  { id: 'kulit', label: '14. Kulit' },
];

const SUPPORTING_EXAM_ITEMS = [
  { id: 'ekg', label: '1. EKG' },
  { id: 'echocardiography', label: '2. Echocardiography' },
  { id: 'treadmill', label: '3. Treadmill' },
  { id: 'rontgen', label: '4. Rontgen' },
  { id: 'spirometri', label: '5. Spirometri' },
  { id: 'audiometri', label: '6. Audiometri' },
];

export const MCUResultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [mcuData, setMcuData] = useState<MCURecord | null>(null);
  const [labFileUrl, setLabFileUrl] = useState<string | null>(null);
  const [radiologyFileUrl, setRadiologyFileUrl] = useState<string | null>(null);
  const [penunjangAttachments, setPenunjangAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      Promise.all([
        patientService.getPatientById(id),
        mcuService.getMCUByPatientId(id).then((res) => res || mcuService.initializeOrGetMCU(id)),
        labService.getLabDocumentUrl(id),
        radiologyService.getRadiologyDocumentUrl(id),
        typeof attachmentService?.getAttachmentsByPatientId === 'function'
          ? attachmentService.getAttachmentsByPatientId(id, 'PENUNJANG')
          : Promise.resolve([]),
      ])
        .then(([patientRes, mcuRes, labUrl, radUrl, penunjangList]) => {
          if (isMounted) {
            setPatient(patientRes);
            setMcuData(mcuRes);
            setLabFileUrl(labUrl);
            setRadiologyFileUrl(radUrl);
            setPenunjangAttachments(penunjangList || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Gagal mengambil detail hasil MCU:', err);
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !patient || !mcuData) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium print:hidden">
        Memuat detail hasil MCU dari Supabase...
      </div>
    );
  }

  const gen = (mcuData.generalExamination || {}) as Record<string, any>;
  const doc = (mcuData.doctorConclusion || {}) as Record<string, any>;
  const pAny = patient as unknown as Record<string, unknown>;
  const docAny = (mcuData.doctorConclusion || {}) as unknown as Record<string, unknown>;

  const handlePrint = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.focus();
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const isPdfUrl = (url: string | null) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  const renderStatusBadge = (status?: string) => {
    if (status === 'Normal') {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Normal
        </span>
      );
    }
    if (status === 'Tidak Normal') {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> Tidak Normal
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" /> Belum Diperiksa
      </span>
    );
  };

  const formatFinalResultText = (res?: string) => {
    if (!res) return 'BELUM DITENTUKAN DOKTER';
    if (res === 'FIT') return 'FIT';
    if (res === 'FIT_DENGAN_CATATAN') return 'FIT DENGAN CATATAN';
    if (res === 'UNFIT') return 'UNFIT';
    return res;
  };

  const renderFinalResultBadge = (result?: string) => {
    if (result === 'FIT') {
      return (
        <div className="px-5 py-2 bg-green-100 text-green-800 border border-green-300 font-black rounded-xl text-xs uppercase tracking-wide inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> FIT
        </div>
      );
    }
    if (result === 'FIT_DENGAN_CATATAN') {
      return (
        <div className="px-5 py-2 bg-amber-100 text-amber-800 border border-amber-300 font-black rounded-xl text-xs uppercase tracking-wide inline-flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> FIT DENGAN CATATAN
        </div>
      );
    }
    if (result === 'UNFIT') {
      return (
        <div className="px-5 py-2 bg-red-100 text-red-800 border border-red-300 font-black rounded-xl text-xs uppercase tracking-wide inline-flex items-center gap-2">
          <XCircle className="w-4 h-4" /> UNFIT
        </div>
      );
    }
    return (
      <div className="px-5 py-2 bg-gray-100 text-gray-600 border border-gray-300 font-bold rounded-xl text-xs uppercase tracking-wide">
        BELUM DITENTUKAN DOKTER
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">Hasil Lengkap Pemeriksaan MCU</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Ringkasan rekam medis dan kesimpulan kesehatan peserta
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Eye className="w-4 h-4" /> Cetak Laporan MCU
        </button>
      </div>

      {/* 1. INFORMASI PESERTA CARD */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <UserIcon className="w-4 h-4" /> Informasi Identitas Peserta
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Nama Lengkap</span>
            <span className="font-bold text-gray-900 text-sm">{patient.fullName}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">No. MCU / NIK</span>
            <span className="font-mono font-bold text-blue-600">{patient.mcuNumber} / {String(patient.nik || pAny.identityNumber || pAny.id || '-')}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Jenis Kelamin / Usia</span>
            <span className="font-bold text-gray-800">
              {patient.gender === 'Laki-Laki' || pAny.gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({String(pAny.age || '-')} Tahun)
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Perusahaan / Instansi</span>
            <span className="font-bold text-gray-800">{String(patient.company || patient.companyName || '-')}</span>
          </div>
        </div>
      </div>

      {/* 2. TANDA VITAL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <Activity className="w-4 h-4" /> Pemeriksaan Tanda Vital & Antropometri
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Tekanan Darah</span>
            <span className="font-black text-gray-900 text-sm">
              {gen.systolic && gen.diastolic ? `${gen.systolic}/${gen.diastolic} mmHg` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Nadi</span>
            <span className="font-black text-gray-900 text-sm">
              {gen.pulse ? `${gen.pulse} x/menit` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Laju Napas</span>
            <span className="font-black text-gray-900 text-sm">
              {gen.respiratoryRate ? `${gen.respiratoryRate} x/menit` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Suhu Tubuh</span>
            <span className="font-black text-gray-900 text-sm">
              {gen.temperature ? `${gen.temperature} °C` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">TB / BB</span>
            <span className="font-black text-gray-900 text-sm">
              {gen.height || '-'} cm / {gen.weight || '-'} kg
            </span>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-blue-700 block font-medium">BMI / Status</span>
            <span className="font-black text-blue-900 text-sm">
              {gen.bmi || '-'} {gen.bmiCategory ? `(${gen.bmiCategory})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ANAMNESIS (KELUHAN) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <MessageSquare className="w-4 h-4" /> Anamnesis (Keluhan Saat Ini)
        </div>
        <div className="text-xs">
          {(mcuData.anamnesis?.complaints || []).length === 0 ? (
            <p className="text-gray-400 italic">Tidak ada keluhan yang dicatat.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(mcuData.anamnesis?.complaints || []).map((cId) => (
                <span key={cId} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-medium">
                  {ANAMNESIS_COMPLAINTS_MAP[cId] || cId}
                </span>
              ))}
            </div>
          )}
          {mcuData.anamnesis?.otherComplaintText && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-700">Keluhan Lainnya: </span>
              <span className="text-gray-800">{mcuData.anamnesis.otherComplaintText}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. RIWAYAT KESEHATAN */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <ClipboardList className="w-4 h-4" /> Riwayat Kesehatan Peserta
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-gray-700 font-bold uppercase">
                <th className="p-3 w-1/3">Jenis Riwayat</th>
                <th className="p-3 text-center w-1/5">Riwayat Pribadi</th>
                <th className="p-3 text-center w-1/5">Riwayat Keluarga</th>
                <th className="p-3 w-1/3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MEDICAL_HISTORY_ITEMS.map((item) => {
                const data = mcuData.medicalHistory?.[item.id] || {};
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-semibold text-gray-800">{item.label}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold ${data.personalHistory === 'Ya' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {data.personalHistory || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold ${data.familyHistory === 'Ya' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {data.familyHistory || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{data.description || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RIWAYAT VAKSINASI */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <ShieldCheck className="w-4 h-4" /> Riwayat Vaksinasi
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {VACCINATION_ITEMS.map((item) => {
            const data = mcuData.vaccinationHistory?.[item.id] || {};
            return (
              <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-800 block">{item.label}</span>
                <span className="text-gray-500">Status: </span>
                <span className={`font-bold ${data.status === 'Ya' ? 'text-blue-600' : 'text-gray-400'}`}>
                  {data.status || '-'}
                </span>
                {data.date && <div className="text-[11px] text-gray-500 mt-1">Tgl: {data.date}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. GAYA HIDUP & KEBIASAAN */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <Coffee className="w-4 h-4" /> Gaya Hidup & Kebiasaan
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Merokok</span>
            <p>Status: <span className="font-bold">{mcuData.lifestyle?.smoking?.status || '-'}</span></p>
            {mcuData.lifestyle?.smoking?.status === 'Ya' && (
              <p>{mcuData.lifestyle.smoking.cigarettesPerDay} batang/hari ({mcuData.lifestyle.smoking.durationYears} thn)</p>
            )}
            <p className="text-gray-500 italic">{mcuData.lifestyle?.smoking?.notes || '-'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Alkohol</span>
            <p>Status: <span className="font-bold">{mcuData.lifestyle?.alcohol?.status || '-'}</span></p>
            {mcuData.lifestyle?.alcohol?.status === 'Ya' && (
              <p>{mcuData.lifestyle.alcohol.bottlesPerDay} botol/hari ({mcuData.lifestyle.alcohol.durationYears} thn)</p>
            )}
            <p className="text-gray-500 italic">{mcuData.lifestyle?.alcohol?.notes || '-'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Teh / Kopi & Pencernaan</span>
            <p>Teh/Kopi: <span className="font-bold">{mcuData.lifestyle?.teaCoffee?.status || '-'}</span></p>
            <p>BAB: <span className="font-bold">{mcuData.lifestyle?.bowel?.status || '-'}</span> | BAK: <span className="font-bold">{mcuData.lifestyle?.bladder?.status || '-'}</span></p>
          </div>
        </div>
      </div>

      {/* 7. PEMERIKSAAN FISIK ORGAN & VISUS MATA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <UserIcon className="w-4 h-4" /> Pemeriksaan Fisik Organ & Visus
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHYSICAL_EXAM_ITEMS.map((item) => {
            const data = (mcuData.physicalExamination?.bodyParts?.[item.id] || {}) as { status?: string; notes?: string };
            return (
              <div key={item.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-gray-800 block">{item.label}</span>
                  {data.notes && <span className="text-[10px] text-gray-500">{data.notes}</span>}
                </div>
                {renderStatusBadge(data.status)}
              </div>
            );
          })}
        </div>

        {/* DETAILS VISUS MATA */}
        {mcuData.visionExamination && (
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-2 mt-4">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <VisionIcon className="w-4 h-4" /> Pemeriksaan Visus & Mata
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>Visus OD (Kanan): <span className="font-bold">{mcuData.visionExamination.rightEye || '-'}</span></div>
              <div>Visus OS (Kiri): <span className="font-bold">{mcuData.visionExamination.leftEye || '-'}</span></div>
              <div>Visus OU (Kedua): <span className="font-bold">{mcuData.visionExamination.bothEyes || '-'}</span></div>
              <div>Tes Buta Warna: <span className="font-bold">{mcuData.visionExamination.colorBlindness || '-'}</span></div>
            </div>
            {mcuData.visionExamination.notes && (
              <p className="text-gray-600 text-[11px] pt-1">Keterangan: {mcuData.visionExamination.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* 8. PEMERIKSAAN PENUNJANG MEDIS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <Stethoscope className="w-4 h-4" /> Pemeriksaan Penunjang Medis
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-gray-700 font-bold uppercase">
                <th className="p-3 w-1/3">Pemeriksaan Utama</th>
                <th className="p-3 text-center w-1/3">Status Hasil</th>
                <th className="p-3 w-1/3">Catatan / Temuan Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SUPPORTING_EXAM_ITEMS.map((item) => {
                const data = (mcuData.supportingExamination?.mainExams?.[item.id] || {}) as { status?: string; notes?: string };
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-semibold text-gray-800">{item.label}</td>
                    <td className="p-3 text-center">{renderStatusBadge(data.status)}</td>
                    <td className="p-3 text-gray-600">{data.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PEMERIKSAAN PENUNJANG TAMBAHAN */}
        {(mcuData.supportingExamination?.additionalExams || []).length > 0 && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="font-bold text-xs text-gray-800 block">Pemeriksaan Penunjang Tambahan:</span>
            <div className="space-y-1.5">
              {(mcuData.supportingExamination?.additionalExams || []).map((exam) => (
                <div key={exam.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-800">{exam.name}</span>
                    {exam.notes && <span className="text-gray-500 text-[11px] block">{exam.notes}</span>}
                  </div>
                  {renderStatusBadge(exam.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 9. KESIMPULAN & REKOMENDASI DOKTER */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <FileCheck className="w-4 h-4" /> Kesimpulan & Rekomendasi Dokter
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Kesimpulan Klinik
              </label>
              <div 
                style={{ minHeight: '70px' }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-medium leading-relaxed"
              >
                {doc.conclusion || 'Belum ada kesimpulan.'}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Rekomendasi / Saran
              </label>
              <div 
                style={{ minHeight: '70px' }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-medium leading-relaxed"
              >
                {doc.recommendation || 'Belum ada rekomendasi.'}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Hasil Status Akhir
            </span>
            
            {renderFinalResultBadge(doc.finalResult)}

            <div className="pt-2 text-xs text-gray-500 space-y-1 w-full">
              <p className="font-medium">
                Tanggal: <span className="font-bold text-gray-700">{doc.date || patient.registrationDate || '2026-10-15'}</span>
              </p>
              
              {/* GAMBAR TANDA TANGAN DOKTER */}
              {docAny.doctorSignature ? (
                <div className="py-2 flex justify-center">
                  <img 
                    src={String(docAny.doctorSignature)} 
                    alt="Tanda Tangan Dokter" 
                    style={{ maxHeight: '64px', width: 'auto' }}
                    className="h-16 w-auto object-contain" 
                  />
                </div>
              ) : null}

              <p className="font-black text-gray-900 text-sm pt-1">
                {doc.doctorName || 'Dokter Pemeriksa'}
              </p>
              <p className="text-[11px] text-gray-400 font-semibold">
                Klinik Pakisaji Cardiovascular Center
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PREVIEW PDF & CETAK LAPORAN BILINGUAL LENGKAP STANDAR PERUSAHAAN */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-6 p-8 shadow-2xl relative space-y-6 print:m-0 print:p-0 print:shadow-none print:w-full text-black">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Preview Laporan MCU Resmi (Standar Perusahaan)</h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOKUMEN CETAK A4 PROPOSIONAL */}
            <div className="space-y-5 text-xs font-sans text-gray-900 print:text-black">
              
              {/* KOP SURAT BILINGUAL DENGAN LOGO */}
              <div className="border-b-2 border-black pb-2 flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logonew.png" 
                    alt="Logo Klinik" 
                    style={{ height: '48px', width: 'auto' }}
                    className="h-12 w-auto object-contain shrink-0" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div>
                    <h1 className="text-lg font-black text-black uppercase tracking-tight">
                      Klinik Pakisaji Cardiovascular Center
                    </h1>
                    <p className="text-xs text-gray-700 font-medium italic mt-0.5">
                      Jl. Pakisaji No.1, Pakisaji, Kab.Malang
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-bold text-black uppercase">Laporan Pemeriksaan Kesehatan</h2>
                  <p className="text-xs text-gray-600 italic">Medical Check Up Record</p>
                </div>
              </div>

              {/* I. DATA PRIBADI */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Data Pribadi (Sesuai KTP / Passport)</span>
                  <span className="italic font-normal lowercase text-gray-600">Personal Data (as in NID/Passport)</span>
                </div>
                <table className="w-full border-collapse border border-black text-xs">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold w-1/5 bg-gray-50 border-r border-black">
                        Tanggal Registrasi<br/><span className="text-[10px] font-normal italic text-gray-500">Registration Date</span>
                      </td>
                      <td className="p-2 w-3/10 border-r border-black font-semibold">
                        : {patient.registrationDate || '08-10-2026'}
                      </td>
                      <td className="p-2 font-bold w-1/5 bg-gray-50 border-r border-black">
                        Gol. Darah (Rhesus)<br/><span className="text-[10px] font-normal italic text-gray-500">Blood Type</span>
                      </td>
                      <td className="p-2 w-3/10 font-semibold">
                        : {patient.bloodType || '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        Nama Lengkap<br/><span className="text-[10px] font-normal italic text-gray-500">Full Name</span>
                      </td>
                      <td className="p-2 border-r border-black font-bold text-black">
                        : {patient.fullName}
                      </td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        Nomor Identitas<br/><span className="text-[10px] font-normal italic text-gray-500">Identity Number</span>
                      </td>
                      <td className="p-2 font-mono font-bold">
                        : {patient.nik || patient.identityNumber || '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        Tanggal Lahir / Usia<br/><span className="text-[10px] font-normal italic text-gray-500">Date of Birth / Age</span>
                      </td>
                      <td className="p-2 border-r border-black">
                        : {patient.dateOfBirth || '-'} ({patient.age || '-'} Thn)
                      </td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        Jenis Kelamin<br/><span className="text-[10px] font-normal italic text-gray-500">Sex</span>
                      </td>
                      <td className="p-2 font-semibold">
                        : [{patient.gender === 'Laki-Laki' || pAny.gender === 'L' ? '☑' : '☐'}] Laki-laki &nbsp; [{patient.gender === 'Perempuan' || pAny.gender === 'P' ? '☑' : '☐'}] Perempuan
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        Perusahaan / Status<br/><span className="text-[10px] font-normal italic text-gray-500">Company / Status</span>
                      </td>
                      <td className="p-2 border-r border-black font-semibold">
                        : {patient.company || patient.companyName || '-'}
                      </td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        No. Telp.<br/><span className="text-[10px] font-normal italic text-gray-500">Phone Number</span>
                      </td>
                      <td className="p-2">
                        : {patient.phone || patient.phoneNumber || (patient as any).phone_number || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">
                        Alamat<br/><span className="text-[10px] font-normal italic text-gray-500">Address</span>
                      </td>
                      <td colSpan={3} className="p-2">
                        : {patient.address || (patient as any).alamat || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* II. GAYA HIDUP & KEBIASAAN */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Riwayat Kebiasaan Hidup</span>
                  <span className="italic font-normal lowercase text-gray-600">Personal Habits</span>
                </div>
                <table className="w-full border-collapse border border-black text-xs">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold w-1/6 bg-gray-50 border-r border-black">Merokok / Smoking</td>
                      <td className="p-2 w-1/3 border-r border-black">
                        <div>
                          [{mcuData.lifestyle?.smoking?.status === 'Ya' ? '☑' : '☐'}] Ya 
                          {mcuData.lifestyle?.smoking?.status === 'Ya' && (
                            <span className="font-bold text-black ml-1">
                              ({mcuData.lifestyle.smoking.cigarettesPerDay || 0} btg/hr{mcuData.lifestyle.smoking.durationYears ? `, ${mcuData.lifestyle.smoking.durationYears} thn` : ''})
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          [{mcuData.lifestyle?.smoking?.status === 'Tidak' ? '☑' : '☐'}] Tidak
                        </div>
                      </td>
                      <td className="p-2 font-bold w-1/6 bg-gray-50 border-r border-black">Alkohol / Alcohol</td>
                      <td className="p-2">
                        <div>
                          [{mcuData.lifestyle?.alcohol?.status === 'Ya' ? '☑' : '☐'}] Ya
                          {mcuData.lifestyle?.alcohol?.status === 'Ya' && (
                            <span className="font-bold text-black ml-1">
                              ({mcuData.lifestyle.alcohol.bottlesPerDay || 0} botol/hr{mcuData.lifestyle.alcohol.durationYears ? `, ${mcuData.lifestyle.alcohol.durationYears} thn` : ''})
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          [{mcuData.lifestyle?.alcohol?.status === 'Tidak' ? '☑' : '☐'}] Tidak
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">BAB / Bowel</td>
                      <td className="p-2 border-r border-black">: {mcuData.lifestyle?.bowel?.status || 'Normal'}</td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">BAK / Bladder</td>
                      <td className="p-2">: {mcuData.lifestyle?.bladder?.status || 'Normal'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* III. RIWAYAT KESEHATAN PRIBADI & KELUARGA */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Riwayat Kesehatan Pribadi dan Keluarga</span>
                  <span className="italic font-normal lowercase text-gray-600">Personal and Family Medical History</span>
                </div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 font-bold border-b border-black text-center">
                      <th className="p-1.5 text-left w-1/2 border-r border-black">Kelainan Medis / Medical Problem</th>
                      <th className="p-1.5 w-1/8 border-r border-black">Pribadi / Personal</th>
                      <th className="p-1.5 w-1/8 border-r border-black">Keluarga / Family</th>
                      <th className="p-1.5 text-left">Keterangan / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEDICAL_HISTORY_ITEMS.map((item) => {
                      const data = mcuData.medicalHistory?.[item.id] || {};
                      return (
                        <tr key={item.id} className="border-b border-gray-300">
                          <td className="p-1.5 font-medium border-r border-black">{item.label}</td>
                          <td className="p-1.5 text-center border-r border-black">{data.personalHistory || 'Tidak'}</td>
                          <td className="p-1.5 text-center border-r border-black">{data.familyHistory || 'Tidak'}</td>
                          <td className="p-1.5">{data.description || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* IV. RIWAYAT VAKSINASI */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Riwayat Vaksinasi</span>
                  <span className="italic font-normal lowercase text-gray-600">Vaccination History</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px] border border-black p-2">
                  {VACCINATION_ITEMS.map((item) => {
                    const data = mcuData.vaccinationHistory?.[item.id] || {};
                    return (
                      <div key={item.id} className="p-1 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{item.label}:</span>
                          <span>[{data.status === 'Ya' ? '☑' : '☐'}] Ya</span>
                        </div>
                        {data.status === 'Ya' && data.date && (
                          <div className="text-[10px] text-gray-600 font-medium text-right mt-0.5">
                            Tgl: {data.date}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* V. ANAMNESIS KELUHAN */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Anamnesis (Keluhan Saat Pemeriksaan)</span>
                  <span className="italic font-normal lowercase text-gray-600">Any Complaints During Examination</span>
                </div>
                <div className="border border-black p-2 text-[11px]">
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.entries(ANAMNESIS_COMPLAINTS_MAP).map(([key, label]) => {
                      const isChecked = (mcuData.anamnesis?.complaints || []).includes(key);
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <span>[{isChecked ? '☑' : '☐'}]</span>
                          <span className={isChecked ? 'font-bold text-black' : 'text-gray-700'}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {mcuData.anamnesis?.otherComplaintText && (
                    <div className="mt-2 pt-1.5 border-t border-gray-300">
                      <span className="font-bold">Keluhan Lainnya: </span>{mcuData.anamnesis.otherComplaintText}
                    </div>
                  )}
                </div>
              </div>

              {/* VI. PEMERIKSAAN UMUM & TANDA VITAL & VISUS MATA */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Pemeriksaan Umum & Visus Mata</span>
                  <span className="italic font-normal lowercase text-gray-600">General & Vision Examination</span>
                </div>
                <table className="w-full border-collapse border border-black text-xs">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black w-1/6">Tekanan Darah</td>
                      <td className="p-2 border-r border-black w-1/3">
                        : {gen.systolic && gen.diastolic ? `${gen.systolic}/${gen.diastolic} mmHg` : '-'}
                      </td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black w-1/6">Nadi / Pulse Rate</td>
                      <td className="p-2">: {gen.pulse || gen.pulseRate || '-'} x/mnt</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Laju Napas / RR</td>
                      <td className="p-2 border-r border-black">: {gen.respiratoryRate || '-'} x/mnt</td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Suhu / Temp</td>
                      <td className="p-2">: {gen.temperature || '-'} °C</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Tinggi / Berat</td>
                      <td className="p-2 border-r border-black">: {gen.height || '-'} cm / {gen.weight || '-'} kg</td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Saturasi O2</td>
                      <td className="p-2">: {gen.oxygenSaturation || '-'} %</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">BMI / Index Body</td>
                      <td className="p-2 border-r border-black font-bold">: {gen.bmi || '-'} {gen.bmiCategory ? `(${gen.bmiCategory})` : ''}</td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Tes Buta Warna</td>
                      <td className="p-2">: {mcuData.visionExamination?.colorBlindness || 'Normal'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Visus OD / OS</td>
                      <td className="p-2 border-r border-black font-semibold">
                        : OD (Kanan): {mcuData.visionExamination?.rightEye || '-'} | OS (Kiri): {mcuData.visionExamination?.leftEye || '-'}
                      </td>
                      <td className="p-2 font-bold bg-gray-50 border-r border-black">Visus OU (Binokular)</td>
                      <td className="p-2 font-semibold">
                        : {mcuData.visionExamination?.bothEyes || '-'} {mcuData.visionExamination?.notes ? `(${mcuData.visionExamination.notes})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* VII. PEMERIKSAAN FISIK ORGAN */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Pemeriksaan Fisik</span>
                  <span className="italic font-normal lowercase text-gray-600">General Physical Examination</span>
                </div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 font-bold border-b border-black">
                      <th className="p-1.5 text-left w-1/3 border-r border-black">Organ / Body Part</th>
                      <th className="p-1.5 text-center w-1/4 border-r border-black">Hasil / Result</th>
                      <th className="p-1.5 text-left">Keterangan / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PHYSICAL_EXAM_ITEMS.map((item) => {
                      const data = (mcuData.physicalExamination?.bodyParts?.[item.id] || {}) as { status?: string; notes?: string };
                      return (
                        <tr key={item.id} className="border-b border-gray-300">
                          <td className="p-1.5 font-medium border-r border-black">{item.label}</td>
                          <td className="p-1.5 text-center font-bold border-r border-black">{data.status || 'Normal'}</td>
                          <td className="p-1.5">{data.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* VIII. PEMERIKSAAN PENUNJANG */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Pemeriksaan Penunjang</span>
                  <span className="italic font-normal lowercase text-gray-600">Other Tests Findings</span>
                </div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 font-bold border-b border-black">
                      <th className="p-1.5 text-left w-1/3 border-r border-black">Pemeriksaan / Test</th>
                      <th className="p-1.5 text-center w-1/4 border-r border-black">Hasil / Result</th>
                      <th className="p-1.5 text-left">Keterangan / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUPPORTING_EXAM_ITEMS.map((item) => {
                      const data = (mcuData.supportingExamination?.mainExams?.[item.id] || {}) as { status?: string; notes?: string };
                      return (
                        <tr key={item.id} className="border-b border-gray-300">
                          <td className="p-1.5 font-medium border-r border-black">{item.label}</td>
                          <td className="p-1.5 text-center font-bold border-r border-black">{data.status || 'Normal'}</td>
                          <td className="p-1.5">{data.notes || '-'}</td>
                        </tr>
                      );
                    })}
                    {(mcuData.supportingExamination?.additionalExams || []).map((exam) => (
                      <tr key={exam.id} className="border-b border-gray-300">
                        <td className="p-1.5 font-medium border-r border-black">{exam.name}</td>
                        <td className="p-1.5 text-center font-bold border-r border-black">{exam.status || 'Normal'}</td>
                        <td className="p-1.5">{exam.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* IX. KESIMPULAN, SARAN, DOKTER & TANDA TANGAN */}
              <div className="pt-3 border-t-2 border-black space-y-2.5 print:break-inside-avoid">
                <div className="font-bold text-xs bg-gray-100 p-1.5 border border-black uppercase flex justify-between">
                  <span>Kesimpulan & Saran</span>
                  <span className="italic font-normal lowercase text-gray-600">Resume & Advice</span>
                </div>

                <div className="border border-black p-3 space-y-2 text-xs">
                  <p className="italic text-gray-700">
                    Dengan ini saya menyatakan telah melakukan pemeriksaan terhadap pasien dan mencatat penemuan klinis seperti di atas.<br/>
                    <span className="text-[11px] text-gray-500">I certify that I have examined the above-named person and my findings are as above.</span>
                  </p>
                  
                  <div className="pt-1 space-y-1">
                    <p className="font-bold text-sm">
                      Status Kelayakan Kerja: {' '}
                      <span className="font-black text-black border border-black px-2 py-0.5 bg-gray-100 rounded inline-block uppercase">
                        {formatFinalResultText(doc.finalResult)}
                      </span>
                    </p>
                    <p className="text-xs">
                      <span className="font-bold">Kesimpulan Klinis Dokter:</span> {doc.conclusion || '-'}
                    </p>
                    <p className="text-xs">
                      <span className="font-bold">Saran / Advice:</span> {doc.recommendation || 'Tidak ada saran khusus'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4">
                  <div className="text-[10px] text-gray-500 italic max-w-sm">
                    Dokumen hasil pemeriksaan kesehatan ini dicetak dan disahkan secara resmi oleh Klinik Pakisaji Cardiovascular Center Malang.
                  </div>
                  <div className="text-center w-60 space-y-1">
                    <p className="text-xs font-bold">Malang, {doc.date || patient.registrationDate || '10 Oktober 2026'}</p>
                    <p className="text-[11px] text-gray-600">Dokter Pemeriksa / Examining Physician,</p>
                    <div className="h-16 flex items-center justify-center my-1">
                      {docAny.doctorSignature ? (
                        <img 
                          src={String(docAny.doctorSignature)} 
                          alt="Tanda Tangan Dokter" 
                          style={{ maxHeight: '64px', width: 'auto' }}
                          className="h-16 w-auto object-contain" 
                        />
                      ) : (
                        <div className="border border-dashed border-gray-300 w-full h-12 flex items-center justify-center text-[10px] text-gray-400">
                          [ Tanda Tangan Dokter ]
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-sm underline">{doc.doctorName || 'dr. Syifa Azzahra'}</p>
                    <p className="text-[10px] text-gray-500">Dokter Umum / General Practitioner</p>
                  </div>
                </div>
              </div>

              {/* HALAMAN LAMPIRAN 1: HASIL LABORATORIUM */}
              {labFileUrl && (
                isPdfUrl(labFileUrl) ? (
                  <PdfAttachmentRenderer
                    pdfUrl={labFileUrl}
                    title="Lampiran I: Hasil Pemeriksaan Laboratorium"
                    patientName={patient.fullName}
                    mcuNumber={patient.mcuNumber || '-'} 
                  />
                ) : (
                  <div className="print-attachment-page">
                    <div className="font-bold text-xs bg-gray-200 p-2 border border-black uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><FlaskConical className="w-4 h-4" /> Lampiran I: Hasil Pemeriksaan Laboratorium</span>
                      <span className="text-[10px] text-gray-600 font-normal">Pasien: {patient.fullName} ({patient.mcuNumber})</span>
                    </div>
                    
                    <div className="attachment-container border border-black border-t-0 bg-white flex justify-center items-center">
                      <img src={labFileUrl} alt="Hasil Laboratorium" className="attachment-img" />
                    </div>
                  </div>
                )
              )}

              {/* HALAMAN LAMPIRAN 2: HASIL RADIOLOGI / RONTGEN */}
              {radiologyFileUrl && (
                isPdfUrl(radiologyFileUrl) ? (
                  <PdfAttachmentRenderer
                    pdfUrl={radiologyFileUrl}
                    title="Lampiran II: Hasil Pemeriksaan Radiologi / Rontgen"
                    patientName={patient.fullName}
                    mcuNumber={patient.mcuNumber || '-'} 
                  />
                ) : (
                  <div className="print-attachment-page">
                    <div className="font-bold text-xs bg-gray-200 p-2 border border-black uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Scan className="w-4 h-4" /> Lampiran II: Hasil Pemeriksaan Radiologi / Rontgen</span>
                      <span className="text-[10px] text-gray-600 font-normal">Pasien: {patient.fullName} ({patient.mcuNumber})</span>
                    </div>
                    
                    <div className="attachment-container border border-black border-t-0 bg-white flex justify-center items-center">
                      <img src={radiologyFileUrl} alt="Hasil Radiologi" className="attachment-img" />
                    </div>
                  </div>
                )
              )}

              {/* HALAMAN LAMPIRAN 3: PEMERIKSAAN PENUNJANG (KONDISIONAL) */}
              {penunjangAttachments.length > 0 && (
                <div className="print-attachment-page space-y-4">
                  <div className="font-bold text-xs bg-gray-200 p-2 border border-black uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" /> Lampiran III: Hasil Pemeriksaan Penunjang (EKG / Spirometri / dll)
                    </span>
                    <span className="text-[10px] text-gray-600 font-normal">
                      Pasien: {patient.fullName} ({patient.mcuNumber})
                    </span>
                  </div>

                  <div className="space-y-6">
                    {penunjangAttachments.map((file, idx) => (
                      <div key={file.id || idx} className="space-y-2 border border-black p-2 bg-white">
                        <div className="font-bold text-[11px] text-gray-800 border-b border-black pb-1">
                          Berkas {idx + 1}: {file.fileName || 'Hasil Pemeriksaan Penunjang'}
                        </div>
                        {isPdfUrl(file.fileUrl) ? (
                          <PdfAttachmentRenderer
                            pdfUrl={file.fileUrl}
                            title={`Lampiran Penunjang: ${file.fileName || `Berkas ${idx + 1}`}`}
                            patientName={patient.fullName}
                            mcuNumber={patient.mcuNumber || '-'}
                          />
                        ) : (
                          <div className="attachment-container">
                            <img src={file.fileUrl} alt={file.fileName || 'Hasil Penunjang'} className="attachment-img" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CSS KHUSUS MEDIA PRINT A4 PRESISI */}
      <style>{`
        .print-attachment-page {
           margin-top: 2rem;
        }
        .attachment-container {
           height: 500px;
           width: 100%;
           display: flex;
           justify-content: center;
           align-items: center;
           overflow: hidden;
           background-color: white;
        }
        .attachment-frame {
           width: 100%;
           height: 100%;
           border: none;
           background-color: white;
        }
        .attachment-img {
           width: 100%;
           height: 100%;
           object-fit: contain;
           background-color: white;
        }

        /* Setelan Khusus Saat Dicetak ke PDF / Kertas */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          aside, nav, header, .print\\:hidden {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            overflow: visible !important;
          }
          .fixed {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .fixed > div {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .print-attachment-page {
            break-before: page !important;
            page-break-before: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            min-height: 270mm !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            background-color: white !important;
          }
          .attachment-container {
            flex-grow: 1 !important;
            height: 260mm !important;
            width: 100% !important;
            border: none !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            background-color: white !important;
          }
          .attachment-frame {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            background-color: white !important;
          }
          
          .attachment-img {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 260mm !important;
            object-fit: contain !important;
            margin: auto !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};