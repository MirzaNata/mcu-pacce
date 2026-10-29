import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  Pencil, 
  Trash2, 
  Stethoscope, 
  FileText, 
  CheckCircle2 
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { authService } from '../services/authService';
import { PatientForm } from '../components/PatientForm';
import type { Patient } from '../types';

export const Patients = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [patients, setPatients] = useState<Patient[]>(() => patientService.getPatients());
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
  };

  const handleSavePatient = (formData: Omit<Patient, 'id' | 'mcuNumber' | 'registrationDate' | 'status'>) => {
    if (editingPatient) {
      patientService.updatePatient(editingPatient.id, formData);
      showNotification('Data diri peserta berhasil diperbarui!');
    } else {
      patientService.createPatient(formData);
      showNotification('Peserta MCU baru berhasil ditambahkan!');
    }
    setPatients(patientService.getPatients());
    handleCloseModal();
  };

  const handleDeletePatient = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus peserta ${name}?`)) {
      patientService.deletePatient(id);
      showNotification(`Peserta ${name} berhasil dihapus.`);
      setPatients(patientService.getPatients());
    }
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(query) ||
      p.mcuNumber.toLowerCase().includes(query) ||
      p.identityNumber.toLowerCase().includes(query) ||
      (p.companyName && p.companyName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Kelola Data Peserta MCU</h1>
          <p className="text-xs text-gray-500 mt-0.5">Daftar seluruh peserta pemeriksaan Medical Check-Up Klinik Pakisaji Cardiovascular Center</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Peserta Baru</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama, No. MCU, NIK, atau instansi..."
          className="w-full text-xs font-medium outline-hidden placeholder:text-gray-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold text-xs uppercase">
                <th className="p-3.5">No. MCU</th>
                <th className="p-3.5">Nama Peserta / NIK</th>
                <th className="p-3.5">Tgl Lahir / JK</th>
                <th className="p-3.5">Perusahaan / Jabatan</th>
                <th className="p-3.5 text-center">Status MCU</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-gray-500 font-medium">
                    Tidak ada data peserta MCU yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-mono text-xs font-bold text-blue-600">
                      {patient.mcuNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900 text-xs">{patient.fullName}</div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">NIK: {patient.identityNumber}</div>
                    </td>
                    <td className="p-3.5 text-xs text-gray-700">
                      <div>{patient.dateOfBirth}</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">{patient.gender}</div>
                    </td>
                    <td className="p-3.5 text-xs text-gray-700">
                      <div className="font-semibold text-gray-800">{patient.companyName || '-'}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{patient.position || '-'}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {patient.status === 'SELESAI'
                          ? 'Selesai'
                          : patient.status === 'MENUNGGU_DOKTER'
                          ? 'Menunggu Dokter'
                          : patient.status === 'DALAM_PROSES'
                          ? 'Dalam Proses'
                          : 'Belum Mulai'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/examination/${patient.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Pemeriksaan MCU"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/mcu-results/${patient.id}`)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Hasil MCU"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(patient)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data Diri Peserta"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {currentUser?.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleDeletePatient(patient.id, patient.fullName)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Peserta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      <PatientForm
        isOpen={isFormOpen}
        initialData={editingPatient}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
      />
    </div>
  );
};