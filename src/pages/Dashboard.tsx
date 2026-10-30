import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  Activity, 
  Clock, 
  FileText, 
  Printer, 
  Search 
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { mcuService } from '../services/mcuService';
import type { Patient, MCURecord } from '../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mcuRecords, setMcuRecords] = useState<Record<string, MCURecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const patientList = await patientService.getPatients();
      setPatients(patientList);

      const recordsMap: Record<string, MCURecord> = {};
      for (const p of patientList) {
        if (p.id) {
          const mcu = await mcuService.getMCUByPatientId(p.id);
          if (mcu) {
            recordsMap[p.id] = mcu;
          }
        }
      }
      setMcuRecords(recordsMap);
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hitung statistik
  const totalPatients = patients.length;
  let fitCount = 0;
  let fitCatatanUnfitCount = 0;

  Object.values(mcuRecords).forEach((mcu) => {
    const result = mcu.doctorConclusion?.finalResult;
    if (result === 'FIT') {
      fitCount++;
    } else if (result === 'FIT_DENGAN_CATATAN' || result === 'UNFIT') {
      fitCatatanUnfitCount++;
    }
  });

  const inProgressCount = totalPatients - (fitCount + fitCatatanUnfitCount);

  // Filter pencarian peserta
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      (p.mcuNumber && p.mcuNumber.toLowerCase().includes(term)) ||
      (p.company && p.company.toLowerCase().includes(term)) ||
      (p.companyName && p.companyName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              TOTAL PESERTA
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {totalPatients}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Status FIT */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              STATUS FIT
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {fitCount}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* FIT Catatan / UNFIT */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              FIT CATATAN / UNFIT
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {fitCatatanUnfitCount}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Proses Pemeriksaan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              PROSES PEMERIKSAAN
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {inProgressCount < 0 ? 0 : inProgressCount}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900 text-sm">Peserta Terbaru Registered</h2>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari peserta..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-y border-gray-100">
                <th className="p-3">NAMA PESERTA</th>
                <th className="p-3">NO. MCU</th>
                <th className="p-3">PERUSAHAAN</th>
                <th className="p-3 text-center">STATUS KESIMPULAN</th>
                <th className="p-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Memuat data peserta terbaru...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Tidak ada peserta terdaftar.
                  </td>
                </tr>
              ) : (
                filteredPatients.slice(0, 10).map((p) => {
                  const res = p.id ? mcuRecords[p.id]?.doctorConclusion?.finalResult : null;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3 font-bold text-gray-900">{p.fullName}</td>
                      <td className="p-3 font-mono font-bold text-blue-600">{p.mcuNumber || '-'}</td>
                      <td className="p-3 text-gray-700">{p.company || p.companyName || '-'}</td>
                      <td className="p-3 text-center font-bold">
                        {res === 'FIT' && <span className="text-emerald-600">FIT</span>}
                        {res === 'FIT_DENGAN_CATATAN' && <span className="text-amber-600">FIT CATATAN</span>}
                        {res === 'UNFIT' && <span className="text-red-600">UNFIT</span>}
                        {!res && <span className="text-gray-400 font-normal">Pending</span>}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Periksa */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (p.id) navigate(`/mcu-examination/${p.id}`);
                            }}
                            className="p-1.5 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                            title="Buka Lembar Pemeriksaan"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>

                          {/* Tombol Cetak PDF */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (p.id) navigate(`/mcu-results/${p.id}`);
                            }}
                            className="p-1.5 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                            title="Cetak Hasil MCU (PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};