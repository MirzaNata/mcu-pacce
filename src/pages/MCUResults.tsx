import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { mcuService } from '../services/mcuService';
import type { Patient, MCURecord } from '../types';

interface MCUResultItem {
  patient: Patient;
  mcu?: MCURecord | null;
}

export const MCUResults = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MCUResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientsList = await patientService.getPatients();
        
        const results = await Promise.all(
          patientsList.map(async (patient) => {
            const mcu = await mcuService.getMCUByPatientId(patient.id).then(
              (res) => res || mcuService.initializeOrGetMCU(patient.id)
            );
            return { patient, mcu };
          })
        );

        if (isMounted) {
          setItems(results);
          setLoading(false);
        }
      } catch (error) {
        console.error('Gagal memuat hasil MCU:', error);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchName = item.patient.fullName.toLowerCase().includes(term);
    const matchMcuNum = (item.patient.mcuNumber || '').toLowerCase().includes(term);
    const matchNik = (item.patient.nik || item.patient.identityNumber || '').toLowerCase().includes(term);
    const matchSearch = matchName || matchMcuNum || matchNik;

    const finalResult = item.mcu?.doctorConclusion?.finalResult || '';
    
    if (statusFilter === 'ALL') return matchSearch;
    if (statusFilter === 'FIT') return matchSearch && finalResult === 'FIT';
    if (statusFilter === 'FIT_CATATAN') return matchSearch && finalResult === 'FIT_DENGAN_CATATAN';
    if (statusFilter === 'UNFIT') return matchSearch && finalResult === 'UNFIT';
    if (statusFilter === 'PENDING') return matchSearch && !finalResult;

    return matchSearch;
  });

  const renderStatusBadge = (finalResult?: string) => {
    if (finalResult === 'FIT') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-100 text-green-800 border border-green-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> FIT
        </span>
      );
    }
    if (finalResult === 'FIT_DENGAN_CATATAN') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> FIT DENGAN CATATAN
        </span>
      );
    }
    if (finalResult === 'UNFIT') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> UNFIT
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" /> Menunggu Kesimpulan
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat daftar hasil MCU...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Daftar Hasil Medical Check-Up</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Ringkasan status kelayakan kesehatan dan hasil MCU peserta
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, No. MCU, atau NIK..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Status Kelayakan</option>
            <option value="FIT">FIT (Sehat)</option>
            <option value="FIT_CATATAN">FIT Dengan Catatan</option>
            <option value="UNFIT">UNFIT (Tidak Laik)</option>
            <option value="PENDING">Belum Ditentukan</option>
          </select>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="p-4">Peserta / No. MCU</th>
                <th className="p-4">Perusahaan / Instansi</th>
                <th className="p-4">Sistol/Diastol</th>
                <th className="p-4 text-center">Status Kelayakan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                    Tidak ada data hasil MCU yang cocok.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ patient, mcu }) => {
                  const sys = mcu?.generalExamination?.systolic;
                  const dia = mcu?.generalExamination?.diastolic;
                  const bpText = sys && dia ? `${sys}/${dia} mmHg` : '-';
                  const finalRes = mcu?.doctorConclusion?.finalResult;

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{patient.fullName}</div>
                        <div className="font-mono text-[11px] text-blue-600 font-bold">
                          {patient.mcuNumber || '-'}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {patient.company || patient.companyName || '-'}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-800">
                        {bpText}
                      </td>
                      <td className="p-4 text-center">
                        {renderStatusBadge(finalRes)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/mcu-results/${patient.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Lihat Detail Hasil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/mcu-examination/${patient.id}`)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit Pemeriksaan"
                          >
                            <FileCheck className="w-4 h-4" />
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