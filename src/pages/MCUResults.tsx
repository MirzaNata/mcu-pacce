import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, CheckCircle2, Clock } from 'lucide-react';
import { patientService } from '../services/patientService';
import { mcuService } from '../services/mcuService';
import type { Patient, MCURecord } from '../types';

interface MCUResultItem {
  patient: Patient;
  mcu: MCURecord & { doctorConclusion?: { finalResult?: string } };
}

export const MCUResults = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');

  const mcuData: MCUResultItem[] = useMemo(() => {
    const patients = patientService.getPatients();
    return patients.map((p: Patient) => ({
      patient: p,
      mcu: mcuService.initializeOrGetMCU(p.id) as MCUResultItem['mcu']
    }));
  }, []);

  const filteredData = useMemo(() => {
    return mcuData.filter((item: MCUResultItem) => {
      const matchSearch = 
        item.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patient.identityNumber.includes(searchTerm) ||
        item.patient.mcuNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const finalResult = item.mcu.doctorConclusion?.finalResult || 'BELUM_DITETAPKAN';
      const matchFilter = filterResult === 'ALL' || finalResult === filterResult;

      return matchSearch && matchFilter;
    });
  }, [mcuData, searchTerm, filterResult]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hasil Medical Check-Up</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar laporan hasil akhir dan cetak dokumen MCU peserta.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari Nama, NIK, atau No. MCU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select 
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white font-medium text-gray-700"
          >
            <option value="ALL">Semua Hasil</option>
            <option value="FIT">FIT</option>
            <option value="FIT_DENGAN_CATATAN">FIT DENGAN CATATAN</option>
            <option value="UNFIT">UNFIT</option>
            <option value="BELUM_DITETAPKAN">Belum Ditetapkan</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-bold text-gray-700">No. MCU / Tanggal</th>
                <th className="p-4 font-bold text-gray-700">Identitas Peserta</th>
                <th className="p-4 font-bold text-gray-700">Status Proses</th>
                <th className="p-4 font-bold text-gray-700">Hasil Akhir</th>
                <th className="p-4 font-bold text-gray-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? filteredData.map(({ patient, mcu }) => {
                const finalResult = mcu.doctorConclusion?.finalResult;
                const isFinished = mcu.status === 'SELESAI';
                
                return (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-blue-700">{patient.mcuNumber}</div>
                      <div className="text-xs text-gray-500 mt-1">{patient.registrationDate || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{patient.fullName}</div>
                      <div className="text-xs text-gray-500 mt-1">NIK: {patient.identityNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isFinished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {isFinished ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                        {mcu.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {finalResult ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                          finalResult === 'FIT' ? 'bg-green-100 text-green-800 border-green-300' :
                          finalResult === 'UNFIT' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}>
                          {finalResult.replace(/_/g, ' ')}
                        </span>
                      ) : (
                         <span className="text-xs text-gray-400 font-medium italic">Belum Ditetapkan</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => navigate(`/mcu-result/${patient.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" /> Detail & Cetak
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    Tidak ada data yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};