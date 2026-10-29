import { useState } from 'react';
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
  Eye as VisionIcon
} from 'lucide-react';
import { mcuService } from '../services/mcuService';
import { patientService } from '../services/patientService';
import type { MCURecord } from '../types';

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

  const [patient] = useState(() => (id ? patientService.getPatientById(id) : null));
  const [mcuData] = useState<MCURecord | null>(() => 
    id ? mcuService.getMCUByPatientId(id) || mcuService.initializeOrGetMCU(id) : null
  );

  if (!patient || !mcuData) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat detail hasil MCU...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
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

  const renderFinalResultBadge = (result?: string) => {
    if (result === 'FIT') {
      return (
        <div className="px-5 py-2 bg-green-100 text-green-800 border border-green-300 font-black rounded-xl text-xs uppercase tracking-wide inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> FIT (SEHAT / LAIK KERJA)
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
          <XCircle className="w-4 h-4" /> UNFIT (TIDAK LAIK KERJA)
        </div>
      );
    }
    return (
      <div className="px-5 py-2 bg-gray-100 text-gray-600 border border-gray-300 font-bold rounded-xl text-xs uppercase tracking-wide">
        BELUM DITENTUKAN DOKTER
      </div>
    );
  };

  const pAny = patient as unknown as Record<string, unknown>;
  const docAny = (mcuData.doctorConclusion || {}) as unknown as Record<string, unknown>;

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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
            <span className="font-mono font-bold text-blue-600">{patient.mcuNumber} / {String(pAny.nik || pAny.id || '-')}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Jenis Kelamin / Usia</span>
            <span className="font-bold text-gray-800">
              {patient.gender === 'Laki-Laki' || pAny.gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({String(pAny.age || '-')} Tahun)
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Perusahaan / Instansi</span>
            <span className="font-bold text-gray-800">{String(pAny.company || '-')}</span>
          </div>
        </div>
      </div>

      {/* 2. TANDA VITAL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <Activity className="w-4 h-4" /> Pemeriksaan Tanda Vital & Antropometri
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Tekanan Darah</span>
            <span className="font-black text-gray-900 text-sm">
              {mcuData.generalExamination?.systolic && mcuData.generalExamination?.diastolic 
                ? `${mcuData.generalExamination.systolic}/${mcuData.generalExamination.diastolic} mmHg` 
                : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Nadi</span>
            <span className="font-black text-gray-900 text-sm">
              {mcuData.generalExamination?.pulse ? `${mcuData.generalExamination.pulse} x/menit` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Laju Napas</span>
            <span className="font-black text-gray-900 text-sm">
              {mcuData.generalExamination?.respiratoryRate ? `${mcuData.generalExamination.respiratoryRate} x/menit` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">Suhu Tubuh</span>
            <span className="font-black text-gray-900 text-sm">
              {mcuData.generalExamination?.temperature ? `${mcuData.generalExamination.temperature} °C` : '-'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 block font-medium">TB / BB</span>
            <span className="font-black text-gray-900 text-sm">
              {mcuData.generalExamination?.height || '-'} cm / {mcuData.generalExamination?.weight || '-'} kg
            </span>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-blue-700 block font-medium">BMI / Status</span>
            <span className="font-black text-blue-900 text-sm">
              {mcuData.generalExamination?.bmi || '-'} {mcuData.generalExamination?.bmiCategory ? `(${mcuData.generalExamination.bmiCategory})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ANAMNESIS (KELUHAN) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
          <UserIcon className="w-4 h-4" /> Pemeriksaan Fisik Organ & Visus
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHYSICAL_EXAM_ITEMS.map((item) => {
            const data = mcuData.physicalExamination?.bodyParts?.[item.id] || {};
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
                const data = mcuData.supportingExamination?.mainExams?.[item.id] || {};
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
                {mcuData.doctorConclusion?.conclusion || 'Belum ada kesimpulan.'}
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
                {mcuData.doctorConclusion?.recommendation || 'Belum ada rekomendasi.'}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Hasil Status Akhir
            </span>
            
            {renderFinalResultBadge(mcuData.doctorConclusion?.finalResult)}

            <div className="pt-2 text-xs text-gray-500 space-y-1 w-full">
              <p className="font-medium">
                Tanggal: <span className="font-bold text-gray-700">{mcuData.doctorConclusion?.date || patient.registrationDate || '2026-10-15'}</span>
              </p>
              
              {/* GAMBAR TANDA TANGAN DOKTER */}
              {docAny.doctorSignature ? (
                <div className="py-2 flex justify-center">
                  <img 
                    src={String(docAny.doctorSignature)} 
                    alt="Tanda Tangan Dokter" 
                    style={{ maxWidth: '160px' }}
                    className="h-16 w-auto object-contain" 
                  />
                </div>
              ) : null}

              <p className="font-black text-gray-900 text-sm pt-1">
                {mcuData.doctorConclusion?.doctorName || 'Dokter Pemeriksa'}
              </p>
              <p className="text-[11px] text-gray-400 font-semibold">
                Klinik Pakisaji Cardiovascular Center
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PREVIEW PDF & CETAK LAPORAN LENGKAP */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-6 p-8 shadow-2xl relative space-y-6 print:m-0 print:p-0 print:shadow-none print:w-full text-black">
            
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Preview Laporan MCU Resmi (Lengkap)</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
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

            {/* HALAMAN CETAK A4 LENGKAP */}
            <div className="space-y-5 text-xs leading-relaxed">
              
              {/* KOP SURAT KLINIK */}
              <div className="border-b-2 border-blue-900 pb-3 text-center space-y-1">
                <h1 className="text-lg font-black tracking-wide text-blue-950 uppercase">
                  PAKISAJI CARDIOVASCULAR CENTER
                </h1>
                <p className="font-semibold text-gray-700 text-[11px]">
                  Klinik Spesialis Jantung & Pembuluh Darah • Medical Check-Up Center
                </p>
                <p className="text-[10px] text-gray-500">
                  Jl. Raya Karangpandan No. 88, Pakisaji, Kab. Malang, Jawa Timur • Telp: (0341) 800-123
                </p>
              </div>

              {/* JUDUL LAPORAN */}
              <div className="text-center pt-1">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest underline decoration-2 decoration-blue-600 underline-offset-4">
                  LAPORAN HASIL MEDICAL CHECK-UP
                </h2>
                <p className="text-[11px] text-gray-500 font-medium mt-1">
                  Nomor Dokumen: <span className="font-mono font-bold text-gray-800">{patient.mcuNumber}</span>
                </p>
              </div>

              {/* I. DATA PASIEN */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                <div className="font-bold text-[11px] text-blue-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  I. Identitas Peserta MCU
                </div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-6 text-xs pt-1">
                  <div className="flex"><span className="w-32 text-gray-500">Nama Lengkap</span>: <span className="font-bold text-gray-900 ml-1">{patient.fullName}</span></div>
                  <div className="flex"><span className="w-32 text-gray-500">No. MCU / NIK</span>: <span className="font-mono font-bold text-gray-900 ml-1">{patient.mcuNumber} / {String(pAny.nik || '-')}</span></div>
                  <div className="flex"><span className="w-32 text-gray-500">Jenis Kelamin / Usia</span>: <span className="font-medium text-gray-800 ml-1">{patient.gender === 'Laki-Laki' || pAny.gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({String(pAny.age || '-')} Thn)</span></div>
                  <div className="flex"><span className="w-32 text-gray-500">Perusahaan / Instansi</span>: <span className="font-medium text-gray-800 ml-1">{String(pAny.company || '-')}</span></div>
                </div>
              </div>

              {/* II. TANDA VITAL */}
              <div className="space-y-1.5">
                <div className="font-bold text-[11px] text-blue-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  II. Tanda Vital & Antropometri
                </div>
                <table className="w-full text-left border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-gray-100 font-bold text-gray-800">
                      <th className="border border-gray-300 p-1.5 text-center">Tekanan Darah</th>
                      <th className="border border-gray-300 p-1.5 text-center">Nadi</th>
                      <th className="border border-gray-300 p-1.5 text-center">Laju Napas</th>
                      <th className="border border-gray-300 p-1.5 text-center">Suhu</th>
                      <th className="border border-gray-300 p-1.5 text-center">TB / BB</th>
                      <th className="border border-gray-300 p-1.5 text-center">BMI / Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-1.5 text-center font-bold">
                        {mcuData.generalExamination?.systolic && mcuData.generalExamination?.diastolic 
                          ? `${mcuData.generalExamination.systolic}/${mcuData.generalExamination.diastolic} mmHg` 
                          : '-'}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center">
                        {mcuData.generalExamination?.pulse ? `${mcuData.generalExamination.pulse} x/menit` : '-'}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center">
                        {mcuData.generalExamination?.respiratoryRate ? `${mcuData.generalExamination.respiratoryRate} x/menit` : '-'}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center">
                        {mcuData.generalExamination?.temperature ? `${mcuData.generalExamination.temperature} °C` : '-'}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center">
                        {mcuData.generalExamination?.height || '-'} cm / {mcuData.generalExamination?.weight || '-'} kg
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center font-bold">
                        {mcuData.generalExamination?.bmi || '-'} {mcuData.generalExamination?.bmiCategory ? `(${mcuData.generalExamination.bmiCategory})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* III. ANAMNESIS & GAYA HIDUP */}
              <div className="space-y-1.5">
                <div className="font-bold text-[11px] text-blue-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  III. Anamnesis Keluhan & Gaya Hidup
                </div>
                <div className="p-3 border border-gray-300 rounded-lg bg-gray-50/50 space-y-1 text-[11px]">
                  <p><span className="font-bold">Keluhan Saat Pemeriksaan:</span> {(mcuData.anamnesis?.complaints || []).map(c => ANAMNESIS_COMPLAINTS_MAP[c] || c).join(', ') || 'Tidak ada keluhan'}</p>
                  <p><span className="font-bold">Kebiasaan Merokok:</span> {mcuData.lifestyle?.smoking?.status || 'Tidak'} {mcuData.lifestyle?.smoking?.notes ? `(${mcuData.lifestyle.smoking.notes})` : ''} | <span className="font-bold">Alkohol:</span> {mcuData.lifestyle?.alcohol?.status || 'Tidak'}</p>
                  <p><span className="font-bold">Pola BAB / BAK:</span> {mcuData.lifestyle?.bowel?.status || 'Normal'} / {mcuData.lifestyle?.bladder?.status || 'Normal'}</p>
                </div>
              </div>

              {/* IV. PEMERIKSAAN FISIK & VISUS */}
              <div className="space-y-1.5">
                <div className="font-bold text-[11px] text-blue-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  IV. Hasil Pemeriksaan Fisik Organ & Visus
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  {PHYSICAL_EXAM_ITEMS.map((item) => {
                    const data = mcuData.physicalExamination?.bodyParts?.[item.id] || {};
                    return (
                      <div key={item.id} className="flex justify-between border-b border-gray-200 py-0.5">
                        <span className="font-medium text-gray-800">{item.label}</span>
                        <span className={`font-bold ${data.status === 'Normal' ? 'text-green-700' : data.status === 'Tidak Normal' ? 'text-red-700' : 'text-gray-400'}`}>
                          {data.status || 'Belum Diperiksa'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {mcuData.visionExamination && (
                  <div className="p-2 bg-gray-100 rounded text-[11px] flex justify-between font-medium mt-1">
                    <span>Visus OD/OS: {mcuData.visionExamination.rightEye || '-'}/{mcuData.visionExamination.leftEye || '-'}</span>
                    <span>Buta Warna: {mcuData.visionExamination.colorBlindness || '-'}</span>
                  </div>
                )}
              </div>

              {/* V. PEMERIKSAAN PENUNJANG */}
              <div className="space-y-1.5">
                <div className="font-bold text-[11px] text-blue-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  V. Hasil Pemeriksaan Penunjang Medis
                </div>
                <table className="w-full text-left border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-gray-100 font-bold text-gray-800">
                      <th className="border border-gray-300 p-1.5 w-1/3">Pemeriksaan</th>
                      <th className="border border-gray-300 p-1.5 text-center w-1/4">Status Hasil</th>
                      <th className="border border-gray-300 p-1.5 w-1/2">Catatan Temuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUPPORTING_EXAM_ITEMS.map((item) => {
                      const data = mcuData.supportingExamination?.mainExams?.[item.id] || {};
                      return (
                        <tr key={item.id}>
                          <td className="border border-gray-300 p-1 font-semibold">{item.label}</td>
                          <td className="border border-gray-300 p-1 text-center font-bold">
                            {data.status || 'Belum Diperiksa'}
                          </td>
                          <td className="border border-gray-300 p-1 text-gray-700">{data.notes || '-'}</td>
                        </tr>
                      );
                    })}
                    {(mcuData.supportingExamination?.additionalExams || []).map((exam) => (
                      <tr key={exam.id}>
                        <td className="border border-gray-300 p-1 font-semibold">{exam.name}</td>
                        <td className="border border-gray-300 p-1 text-center font-bold">{exam.status || 'Belum Diperiksa'}</td>
                        <td className="border border-gray-300 p-1 text-gray-700">{exam.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* VI. KESIMPULAN & TANDA TANGAN DOKTER */}
              <div className="pt-2 border-t border-gray-300 space-y-3">
                <div className="font-bold text-[11px] text-blue-900 uppercase tracking-wider">
                  VI. Kesimpulan & Rekomendasi Kelayakan Medis
                </div>

                <div className="grid grid-cols-3 gap-4 border border-gray-300 p-3 rounded-xl bg-gray-50/50">
                  <div className="col-span-2 space-y-2">
                    <div>
                      <span className="font-bold text-gray-700 block text-[11px]">Kesimpulan Klinik:</span>
                      <p className="text-gray-900 font-medium leading-normal mt-0.5">
                        {mcuData.doctorConclusion?.conclusion || 'Belum ada kesimpulan.'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block text-[11px]">Rekomendasi / Saran:</span>
                      <p className="text-gray-900 font-medium leading-normal mt-0.5">
                        {mcuData.doctorConclusion?.recommendation || 'Belum ada rekomendasi.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-between text-center border-l border-gray-300 pl-3 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Status Kelayakan</span>
                      <div className="mt-1">
                        {renderFinalResultBadge(mcuData.doctorConclusion?.finalResult)}
                      </div>
                    </div>

                    {/* FOTO TANDA TANGAN DOKTER */}
                    <div className="flex flex-col items-center my-1">
                      {docAny.doctorSignature ? (
                        <img 
                          src={String(docAny.doctorSignature)} 
                          alt="Tanda Tangan Dokter" 
                          style={{ maxWidth: '140px' }}
                          className="h-14 w-auto object-contain" 
                        />
                      ) : (
                        <div className="h-14 flex items-center justify-center text-gray-300 italic text-[10px]">
                          ( Tanda Tangan Dokter )
                        </div>
                      )}
                      <span className="font-black text-gray-900 text-xs border-b border-gray-800 pb-0.5 px-2">
                        {mcuData.doctorConclusion?.doctorName || 'Dokter Pemeriksa'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                        SIP / Dokter Pemeriksa MCU
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-500 font-medium">
                      Malang, {mcuData.doctorConclusion?.date || patient.registrationDate || '15 Oktober 2026'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};