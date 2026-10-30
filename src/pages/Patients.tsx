import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Building2,
  Calendar,
  Phone
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { authService } from '../services/authService';
import { PatientForm } from '../components/PatientForm';
import type { Patient } from '../types';

export const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const currentUser = authService.getCurrentUser();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Gagal mengambil daftar pasien:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreateOrUpdate = async (formData: Partial<Patient>) => {
    if (editingPatient) {
      await patientService.updatePatient(editingPatient.id, formData);
    } else {
      await patientService.createPatient(formData);
    }
    setShowForm(false);
    setEditingPatient(null);
    await fetchPatients();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data peserta ini?')) {
      await patientService.deletePatient(id);
      await fetchPatients();
    }
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchTerm.toLowerCase();
    const matchName = p.fullName.toLowerCase().includes(query);
    const matchMcu = (p.mcuNumber || '').toLowerCase().includes(query);
    const matchNik = (p.nik || '').toLowerCase().includes(query);
    const matchIdentity = (p.identityNumber || '').toLowerCase().includes(query);
    const matchCompany = (p.company || p.companyName || '').toLowerCase().includes(query);

    return matchName || matchMcu || matchNik || matchIdentity || matchCompany;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat data peserta MCU dari Supabase...
      </div>
    );
  }

  const userRole = (currentUser?.role || '').toString().toLowerCase();
  const canManage = userRole === 'admin' || userRole === 'staff' || userRole === 'doctor';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Data Peserta Medical Check-Up</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Kelola data registrasi dan identitas peserta MCU
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Peserta Baru
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama Peserta, NIK, No. MCU, atau Perusahaan..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* PATIENTS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="p-4">Identitas Peserta</th>
                <th className="p-4">Perusahaan / Instansi</th>
                <th className="p-4">Kontak & Usia</th>
                <th className="p-4 text-center">Status Registration</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                    Tidak ada data peserta MCU yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{patient.fullName}</div>
                      <div className="font-mono text-[11px] text-blue-600 font-bold">
                        {patient.mcuNumber || '-'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        NIK: {patient.nik || patient.identityNumber || '-'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{patient.company || patient.companyName || '-'}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {patient.department || patient.position ? `${patient.department || ''} - ${patient.position || ''}` : '-'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{patient.phoneNumber || patient.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{patient.gender} • {patient.age || '-'} Thn</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                        {patient.status || 'Registered'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/mcu-examination/${patient.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Input Examination"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setEditingPatient(patient);
                                setShowForm(true);
                              }}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Peserta"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(patient.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Peserta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT PESERTA */}
      {showForm && (
        <PatientForm
          initialData={editingPatient || undefined}
          onSubmit={handleCreateOrUpdate}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};