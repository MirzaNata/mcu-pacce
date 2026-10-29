import React, { useMemo } from 'react';
import { 
  User as UserIcon, 
  Calendar, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  CreditCard, 
  Heart, 
  Activity,
  FileCheck2,
  Stethoscope,
  X
} from 'lucide-react';
import type { Patient, MCUStatus } from '../types';
import { mcuService } from '../services/mcuService';

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
  onStartMCU?: (patientId: string) => void;
  onViewResult?: (patientId: string) => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  onClose,
  onStartMCU,
  onViewResult,
}) => {
  // Derived state menggunakan useMemo tanpa trigger setState di dalam useEffect
  const mcuRecord = useMemo(() => {
    if (!patient.id) return undefined;
    return mcuService.getMCUByPatientId(patient.id);
  }, [patient.id]);

  const currentStatus: MCUStatus = patient.status || mcuRecord?.status || 'BELUM_MULAI';
  const finalResult = mcuRecord?.doctorConclusion?.finalResult || '';

  const getStatusBadge = (status: MCUStatus) => {
    switch (status) {
      case 'SELESAI':
        return <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full border border-green-200">SELESAI</span>;
      case 'DALAM_PROSES':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full border border-blue-200">DALAM PROSES</span>;
      case 'MENUNGGU_DOKTER':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-full border border-orange-200">MENUNGGU DOKTER</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-full border border-gray-200">BELUM MULAI</span>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'FIT':
        return <span className="px-3 py-1 bg-green-600 text-white font-extrabold text-xs rounded-lg shadow-sm">FIT</span>;
      case 'FIT_DENGAN_CATATAN':
        return <span className="px-3 py-1 bg-yellow-500 text-white font-extrabold text-xs rounded-lg shadow-sm">FIT DENGAN CATATAN</span>;
      case 'UNFIT':
        return <span className="px-3 py-1 bg-red-600 text-white font-extrabold text-xs rounded-lg shadow-sm">UNFIT</span>;
      default:
        return <span className="text-xs text-gray-400 font-medium">Belum Ada Kesimpulan</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {patient.mcuNumber}
            </span>
            <h2 className="text-lg font-black text-gray-900 mt-1">{patient.fullName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status & Hasil MCU */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Pemeriksaan</p>
              <div className="mt-1">{getStatusBadge(currentStatus)}</div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Akhir Dokter</p>
              <div className="mt-1">{getResultBadge(finalResult)}</div>
            </div>
          </div>

          {/* Informasi Identitas Diri */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Identitas Peserta</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">NIK:</span>
                <span className="font-bold text-gray-900">{patient.identityNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Tgl Lahir:</span>
                <span className="font-bold text-gray-900">{patient.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Gender / Gol. Darah:</span>
                <span className="font-bold text-gray-900">
                  {patient.gender} {patient.bloodType ? `(${patient.bloodType}${patient.rhesus || ''})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Status Pernikahan:</span>
                <span className="font-bold text-gray-900">{patient.maritalStatus || '-'}</span>
              </div>
            </div>
          </div>

          {/* Kontak & Domisili */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Kontak & Alamat</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">No. Telp / WA:</span>
                <span className="font-bold text-gray-900">{patient.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Alamat:</span>
                <span className="font-bold text-gray-900">{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Pekerjaan */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Data Pekerjaan</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Instansi / Perusahaan:</span>
                <span className="font-bold text-gray-900">{patient.companyName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Jabatan:</span>
                <span className="font-bold text-gray-900">{patient.position || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
          {currentStatus === 'SELESAI' && onViewResult ? (
            <button
              onClick={() => onViewResult(patient.id)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Lihat Hasil Akhir</span>
            </button>
          ) : onStartMCU ? (
            <button
              onClick={() => onStartMCU(patient.id)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Pemeriksaan MCU</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};