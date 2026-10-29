import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { patientService } from '../services/patientService';
import type { Patient } from '../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [patients] = useState<Patient[]>(() => patientService.getPatients());

  const totalPatients = patients.length;
  const completedMcu = patients.filter((p: Patient) => p.status === 'SELESAI').length;
  const inProgressMcu = patients.filter((p: Patient) => p.status === 'DALAM_PROSES' || p.status === 'MENUNGGU_DOKTER').length;
  const pendingMcu = patients.filter((p: Patient) => p.status === 'BELUM_MULAI').length;

  const recentPatients = patients.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama MCU</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan statistik dan aktivitas pemeriksaan peserta MCU Klinik Pakisaji Cardiovascular Center
          </p>
        </div>
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Kelola Peserta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Peserta</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalPatients}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">MCU Selesai</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{completedMcu}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Dalam Proses</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{inProgressMcu}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Belum Mulai</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{pendingMcu}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Peserta MCU Pendaftaran Terbaru</h2>
          <button
            onClick={() => navigate('/patients')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold text-xs uppercase">
                <th className="p-3.5">No. MCU</th>
                <th className="p-3.5">Nama Peserta / NIK</th>
                <th className="p-3.5">Perusahaan</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-gray-500">
                    Belum ada data peserta terdaftar.
                  </td>
                </tr>
              ) : (
                recentPatients.map((p: Patient) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-mono text-xs font-bold text-blue-600">{p.mcuNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900 text-xs">{p.fullName}</div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">NIK: {p.identityNumber}</div>
                    </td>
                    <td className="p-3.5 text-xs text-gray-700">{p.companyName || '-'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {p.status === 'SELESAI'
                          ? 'Selesai'
                          : p.status === 'MENUNGGU_DOKTER'
                          ? 'Menunggu Dokter'
                          : p.status === 'DALAM_PROSES'
                          ? 'Dalam Proses'
                          : 'Belum Mulai'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => navigate(`/examination/${p.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Buka Examination"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};