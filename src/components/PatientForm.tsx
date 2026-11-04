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
  const [formData, setFormData] = useState<Partial<Patient>>({
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

  useEffect(() => {
    if (patient) {
      setFormData({
        ...patient,
        company: patient.company || patient.companyName || '',
        nik: patient.nik || (patient as any).identityNumber || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (patient && patient.id) {
        await patientService.updatePatient(patient.id, formData as Patient);
      } else {
        await patientService.addPatient(formData as Patient);
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
                value={formData.nik || (formData as any).identityNumber || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value, identityNumber: e.target.value } as any)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor NIK KTP/Passport"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">No. MCU</label>
              <input
                type="text"
                value={formData.mcuNumber || ''}
                onChange={(e) => setFormData({ ...formData, mcuNumber: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Otomatis / Manual (cth: MCU-738721)"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Perusahaan / Instansi *</label>
              <input
                type="text"
                required
                value={formData.company || (formData as any).companyName || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value, companyName: e.target.value } as any)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Nama perusahaan"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin *</label>
              <select
                value={formData.gender || 'Laki-Laki'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Usia (Tahun)</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || undefined })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 28"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
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

            <div>
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