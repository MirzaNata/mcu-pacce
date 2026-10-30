import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Stethoscope, CheckCircle, Clock } from 'lucide-react';
import { patientService } from '../services/patientService';
import { mcuService } from '../services/mcuService';
import type { Patient, MCURecord } from '../types';

export const LabManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mcuRecords, setMcuRecords] = useState<Record<string, MCURecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatients();
        if (isMounted) setPatients(data);

        const map: Record<string, MCURecord> = {};
        for (const p of data) {
          const rec = await mcuService.getMCUByPatientId(p.id);
          if (rec) map[p.id] = rec;
        }
        if (isMounted) setMcuRecords(map);
      } catch (err) {
        console.error('Gagal mengambil data lab:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPatients = patients.filter((p) => {
    const query = searchTerm.toLowerCase();
    const matchName = p.fullName.toLowerCase().includes(query);
    const matchMcu = (p.mcuNumber || '').toLowerCase().includes(query);
    return matchName || matchMcu;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat manajemen penunjang medis...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-black text-gray-900">Pemeriksaan Penunjang & Laboratorium</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Modul pengisian EKG, Rontgen, Spirometri, Audiometri, dan Lab
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Peserta atau No. MCU..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                <th className="p-4">Peserta / MCU</th>
                <th className="p-4">Perusahaan</th>
                <th className="p-4 text-center">Pemeriksaan Penunjang</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((p) => {
                const supporting = mcuRecords[p.id]?.supportingExamination;
                const hasExams = supporting && (
                  (supporting.mainExams && Object.keys(supporting.mainExams).length > 0) ||
                  (supporting.additionalExams && supporting.additionalExams.length > 0)
                );

                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{p.fullName}</div>
                      <div className="font-mono text-blue-600 font-bold text-[11px]">{p.mcuNumber || '-'}</div>
                    </td>
                    <td className="p-4 text-gray-700">{p.company || p.companyName || '-'}</td>
                    <td className="p-4 text-center">
                      {hasExams ? (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 font-bold rounded-lg inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Sudah Diisi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 font-medium rounded-lg inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Belum Diisi
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => navigate(`/mcu-examination/${p.id}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" /> Input Penunjang
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};