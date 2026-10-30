import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Activity
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { mcuService } from '../services/mcuService';
import type { Patient, MCURecord } from '../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mcuRecords, setMcuRecords] = useState<Record<string, MCURecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatients();
        if (isMounted) setPatients(data);

        const mcuMap: Record<string, MCURecord> = {};
        for (const p of data) {
          const rec = await mcuService.getMCUByPatientId(p.id);
          if (rec) mcuMap[p.id] = rec;
        }
        if (isMounted) setMcuRecords(mcuMap);
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPatients = patients.length;
  let fitCount = 0;
  let fitCatatanCount = 0;
  let unfitCount = 0;
  let pendingCount = 0;

  patients.forEach((p) => {
    const res = mcuRecords[p.id]?.doctorConclusion?.finalResult;
    if (res === 'FIT') fitCount++;
    else if (res === 'FIT_DENGAN_CATATAN') fitCatatanCount++;
    else if (res === 'UNFIT') unfitCount++;
    else pendingCount++;
  });

  const filteredPatients = patients.filter((p) => {
    const query = searchTerm.toLowerCase();
    const matchName = p.fullName.toLowerCase().includes(query);
    const matchMcu = (p.mcuNumber || '').toLowerCase().includes(query);
    const matchCompany = (p.company || p.companyName || '').toLowerCase().includes(query);
    return matchName || matchMcu || matchCompany;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat data dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-black text-gray-900">Dashboard Utama MCU</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Pakisaji Cardiovascular Center — Sistem Informasi Medical Check-Up
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Peserta</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{totalPatients}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Status FIT</span>
            <span className="text-2xl font-black text-green-600 mt-1 block">{fitCount}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">FIT Catatan / Unfit</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{fitCatatanCount + unfitCount}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Proses Pemeriksaan</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{pendingCount}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* QUICK RECENT PATIENTS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900">Peserta Terbaru Registered</h2>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari peserta..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                <th className="p-3">Nama Peserta</th>
                <th className="p-3">No. MCU</th>
                <th className="p-3">Perusahaan</th>
                <th className="p-3 text-center">Status Kesimpulan</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.slice(0, 10).map((p) => {
                const res = mcuRecords[p.id]?.doctorConclusion?.finalResult;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 font-bold text-gray-900">{p.fullName}</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{p.mcuNumber || '-'}</td>
                    <td className="p-3 text-gray-700">{p.company || p.companyName || '-'}</td>
                    <td className="p-3 text-center font-bold">
                      {res === 'FIT' && <span className="text-green-600">FIT</span>}
                      {res === 'FIT_DENGAN_CATATAN' && <span className="text-amber-600">FIT CATATAN</span>}
                      {res === 'UNFIT' && <span className="text-red-600">UNFIT</span>}
                      {!res && <span className="text-gray-400 font-normal">Pending</span>}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/mcu-examination/${p.id}`);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" /> Periksa
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