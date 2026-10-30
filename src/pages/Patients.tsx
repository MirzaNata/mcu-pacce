import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Printer, 
  Trash2, 
  Filter, 
  UserPlus 
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { mcuService } from '../services/mcuService';
import type { Patient, MCURecord } from '../types';
import { PatientForm } from '../components/PatientForm';

export const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mcuRecords, setMcuRecords] = useState<Record<string, MCURecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const patientList = await patientService.getPatients();
      setPatients(patientList);

      const records: Record<string, MCURecord> = {};
      for (const p of patientList) {
        if (p.id) {
          const mcu = await mcuService.getMCUByPatientId(p.id);
          if (mcu) {
            records[p.id] = mcu;
          }
        }
      }
      setMcuRecords(records);
    } catch (err) {
      console.error('Gagal memuat data peserta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data peserta ini?')) {
      try {
        await patientService.deletePatient(id);
        loadData();
      } catch (err) {
        alert('Gagal menghapus peserta');
      }
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.mcuNumber && p.mcuNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.nik && p.nik.includes(searchTerm));
    
    const matchesCompany = selectedCompany === 'ALL' || p.company === selectedCompany || p.companyName === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  const companies = Array.from(
    new Set(patients.map((p) => p.company || p.companyName).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Daftar Peserta MCU</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Kelola data registrasi peserta, pemeriksaan, dan cetak hasil MCU
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Peserta Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, No. MCU, atau NIK..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium cursor-pointer outline-hidden"
          >
            <option value="ALL">Semua Perusahaan</option>
            {companies.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                <th className="p-3.5">No. MCU</th>
                <th className="p-3.5">Nama Peserta</th>
                <th className="p-3.5">Perusahaan</th>
                <th className="p-3.5">Gender / Usia</th>
                <th className="p-3.5 text-center">Status Kesimpulan</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Memuat data peserta...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Tidak ada data peserta ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const mcu = p.id ? mcuRecords[p.id] : null;
                  const finalResult = mcu?.doctorConclusion?.finalResult;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-blue-600">
                        {p.mcuNumber || '-'}
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {p.fullName}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {p.company || p.companyName || '-'}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {p.gender} ({p.age || '-'} thn)
                      </td>
                      <td className="p-3.5 text-center">
                        {finalResult === 'FIT' && (
                          <span className="px-2.5 py-1 bg-green-100 text-green-800 font-bold text-[11px] rounded-lg border border-green-200">
                            FIT
                          </span>
                        )}
                        {finalResult === 'FIT_DENGAN_CATATAN' && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200">
                            FIT CATATAN
                          </span>
                        )}
                        {finalResult === 'UNFIT' && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold text-[11px] rounded-lg border border-red-200">
                            UNFIT
                          </span>
                        )}
                        {!finalResult && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 font-medium text-[11px] rounded-lg">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Periksa */}
                          <button
                            type="button"
                            onClick={() => navigate(`/mcu-examination/${p.id}`)}
                            className="p-1.5 px-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Buka Lembar Pemeriksaan"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>

                          {/* Tombol Cetak PDF Hasil */}
                          <button
                            type="button"
                            onClick={() => navigate(`/mcu-results/${p.id}`)}
                            className="p-1.5 px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Cetak Hasil / PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak PDF</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => p.id && handleDelete(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus Peserta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {isModalOpen && (
        <PatientForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={async () => {
            setIsModalOpen(false);
            await loadData();
          }}
        />
      )}
    </div>
  );
};