import React, { useState, useEffect } from 'react';
import type { Patient, MCURecord, MCUStatus } from '../types';
import { mcuService } from '../services/mcuService';
import { 
  User, 
  Building, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Heart,
  Eye,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

interface PatientDetailProps {
  patient: Patient;
  onEditMCU?: (patientId: string) => void;
  onViewResult?: (patientId: string) => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  onEditMCU,
  onViewResult,
}) => {
  const [mcuRecord, setMcuRecord] = useState<MCURecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (patient?.id) {
      setLoading(true);
      mcuService.getMCUByPatientId(patient.id).then((record) => {
        if (isMounted) {
          setMcuRecord(record);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [patient?.id]);

  const pAny = patient as any;
  const currentStatus: MCUStatus = 
    (patient as any).status || 
    (mcuRecord as any)?.status || 
    mcuRecord?.doctorConclusion?.finalResult || 
    'BELUM_MULAI';

  const finalResult = mcuRecord?.doctorConclusion?.finalResult || 'Belum Ada Kesimpulan';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FIT':
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Fit to Work / Selesai
          </span>
        );
      case 'FIT_WITH_NOTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Fit with Note
          </span>
        );
      case 'UNFIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Unfit
          </span>
        );
      case 'PROSES':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" /> Dalam Proses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" /> Belum Mulai
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-6">
      {/* Header Info Pasien */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{patient.fullName}</h2>
            {getStatusBadge(currentStatus)}
          </div>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>No. MCU: <strong className="text-emerald-400">{patient.mcuNumber}</strong></span>
            <span>•</span>
            <span>NIK: {pAny.nik || pAny.identityNumber || '-'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onEditMCU && (
            <button
              onClick={() => onEditMCU(patient.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              Pemeriksaan MCU
            </button>
          )}
          {onViewResult && (
            <button
              onClick={() => onViewResult(patient.id)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Lihat Laporan
            </button>
          )}
        </div>
      </div>

      {/* Grid Informasi Detail Pasien */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Jenis Kelamin / Usia</p>
            <p className="text-sm font-semibold text-slate-200">
              {patient.gender === 'L' || patient.gender === 'Laki-Laki' ? 'Laki-Laki' : 'Perempuan'} 
              {pAny.age ? ` (${pAny.age} Thn)` : ''}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Perusahaan / Instansi</p>
            <p className="text-sm font-semibold text-slate-200">
              {patient.company || '-'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tanggal Registrasi</p>
            <p className="text-sm font-semibold text-slate-200">
              {patient.registrationDate || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Rekam Medis MCU */}
      <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/40 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Status Ringkasan MCU
        </h3>

        {loading ? (
          <p className="text-sm text-slate-400 animate-pulse">Memuat data rekam medis...</p>
        ) : mcuRecord ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/30">
              <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Tekanan Darah
              </span>
              <span className="font-medium text-slate-200">
                {mcuRecord.physicalExamination?.bloodPressure || '-'} mmHg
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/30">
              <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Visus Mata
              </span>
              <span className="font-medium text-slate-200">
                OD: {mcuRecord.visionExamination?.farRight || '-'} | OS: {mcuRecord.visionExamination?.farLeft || '-'}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/30">
              <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Kesimpulan Dokter
              </span>
              <span className="font-semibold text-emerald-400">
                {finalResult}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/30">
              <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Terakhir Diperbarui
              </span>
              <span className="font-medium text-slate-300">
                {mcuRecord.updatedAt ? new Date(mcuRecord.updatedAt).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Belum ada data pemeriksaan MCU yang diinput untuk pasien ini.</p>
        )}
      </div>
    </div>
  );
};