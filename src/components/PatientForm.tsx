import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { patientService } from '../services/patientService';
import type { Patient } from '../types';

export interface PatientFormProps {
  patient?: Patient | null;
  onClose: () => void;
  onSubmit?: () => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onClose,
  onSubmit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '',
    nik: '',
    mcuNumber: '',
    gender: 'Laki-Laki',
    age: undefined,
    dateOfBirth: '',
    phone: '',
    address: '',
    company: '',
    bloodType: '',
    registrationDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  // Hitung usia otomatis dari tanggal lahir
  const calculateAge = (dobString: string): number | undefined => {
    if (!dobString) return undefined;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : undefined;
  };

  useEffect(() => {
    if (patient) {
      const pAny = patient as any;
      
      // Ambil tanggal registrasi dari berbagai kemungkinan field
      const rawRegDate = patient.registrationDate || pAny.registration_date || pAny.created_at || '';
      const formattedRegDate = rawRegDate ? rawRegDate.split('T')[0] : new Date().toISOString().split('T')[0];

      // Ambil tanggal lahir
      const rawDob = patient.dateOfBirth || pAny.date_of_birth || '';
      const formattedDob = rawDob ? rawDob.split('T')[0] : '';

      setFormData({
        ...patient,
        fullName: patient.fullName || pAny.full_name || '',
        nik: patient.nik || pAny.identityNumber || pAny.identity_number || '',
        company: patient.company || patient.companyName || pAny.company_name || '',
        phone: patient.phone || pAny.phoneNumber || pAny.phone_number || '',
        address: patient.address || pAny.alamat || '',
        gender: patient.gender || pAny.jenis_kelamin || 'Laki-Laki',
        bloodType: patient.bloodType || pAny.blood_type || '',
        dateOfBirth: formattedDob,
        age: patient.age || calculateAge(formattedDob),
        registrationDate: formattedRegDate,
      });
    } else {
      setFormData({
        fullName: '',
        nik: '',
        mcuNumber: '',
        gender: 'Laki-Laki',
        age: undefined,
        dateOfBirth: '',
        phone: '',
        address: '',
        company: '',
        bloodType: '',
        registrationDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [patient]);

  // Handler saat Tanggal Lahir diubah
  const handleDateOfBirthChange = (dob: string) => {
    const computedAge = calculateAge(dob);
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: dob,
      age: computedAge !== undefined ? computedAge : prev.age,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buat payload dengan menyelaraskan seluruh alias nama kolom Supabase/DB
      const payload: Record<string, any> = {
        ...formData,
        fullName: formData.fullName,
        full_name: formData.fullName,
        
        nik: formData.nik,
        identityNumber: formData.nik,
        identity_number: formData.nik,
        
        company: formData.company,
        companyName: formData.company,
        company_name: formData.company,

        // No. Telepon disinkronkan ke 3 variasi variabel
        phone: formData.phone,
        phoneNumber: formData.phone,
        phone_number: formData.phone,

        // Alamat disinkronkan ke 2 variasi variabel
        address: formData.address,
        alamat: formData.address,

        // Tanggal Registrasi disinkronkan ke 2 variasi variabel
        registrationDate: formData.registrationDate,
        registration_date: formData.registrationDate,

        dateOfBirth: formData.dateOfBirth,
        date_of_birth: formData.dateOfBirth,

        bloodType: formData.bloodType,
        blood_type: formData.bloodType,
      };

      // Jika tambah peserta baru, buat No. MCU otomatis
      if (!patient) {
        try {
          const existingPatients = await patientService.getPatients();
          const nextNumber = (existingPatients.length + 1).toString().padStart(6, '0');
          payload.mcuNumber = `MCU-${nextNumber}`;
          payload.mcu_number = payload.mcuNumber;
        } catch {
          payload.mcuNumber = `MCU-${Date.now().toString().slice(-6)}`;
          payload.mcu_number = payload.mcuNumber;
        }
      }

      if (patient && patient.id) {
        await patientService.updatePatient(patient.id, payload as Patient);
      } else {
        await patientService.addPatient(payload as Patient);
      }
      
      if (onSubmit) await onSubmit();
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error('Gagal menyimpan data pasien:', err);
      alert('Terjadi kesalahan saat menyimpan data pasien.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-xl relative my-8">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            {patient ? 'Edit Data Peserta MCU' : 'Tambah Peserta MCU Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">NIK / No. Identitas *</label>
              <input
                type="text"
                required
                value={formData.nik || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor NIK KTP/Passport"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Perusahaan / Instansi *</label>
              <input
                type="text"
                required
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Nama perusahaan"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin *</label>
              <select
                value={formData.gender || 'Laki-Laki'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleDateOfBirthChange(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Usia (Tahun)</label>
              <input
                type="number"
                value={formData.age !== undefined && formData.age !== null ? formData.age : ''}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || undefined })}
                className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="Otomatis dari Tanggal Lahir"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">No. Telepon / WA</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="08123456789"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Golongan Darah</label>
              <input
                type="text"
                value={formData.bloodType || ''}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: O (+)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Tanggal Registrasi</label>
              <input
                type="date"
                value={formData.registrationDate || ''}
                onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 text-xs">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="Alamat domisili peserta"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : patient ? 'Simpan Perubahan' : 'Tambah Peserta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};