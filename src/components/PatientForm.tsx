import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import type { Patient } from '../types';

export interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (formData: Partial<Patient>) => Promise<void> | void;
  onClose: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  initialData,
  onSubmit,
  onClose,
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [identityNumber, setIdentityNumber] = useState(initialData?.identityNumber || initialData?.nik || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [gender, setGender] = useState<'Laki-Laki' | 'Perempuan' | 'L' | 'P'>(initialData?.gender || 'Laki-Laki');
  const [nationality, setNationality] = useState(initialData?.nationality || 'WNI');
  const [bloodType, setBloodType] = useState(initialData?.bloodType || 'A');
  const [rhesus, setRhesus] = useState(initialData?.rhesus || '+');
  const [maritalStatus, setMaritalStatus] = useState(initialData?.maritalStatus || 'Belum Menikah');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || initialData?.phone || '');
  const [companyName, setCompanyName] = useState(initialData?.companyName || initialData?.company || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [position, setPosition] = useState(initialData?.position || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      nik: identityNumber,
      identityNumber,
      dateOfBirth,
      gender,
      nationality,
      bloodType,
      rhesus,
      maritalStatus,
      phoneNumber,
      phone: phoneNumber,
      companyName,
      company: companyName,
      department,
      position,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              {initialData ? 'Edit Data Peserta MCU' : 'Tambah Peserta MCU Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Nama Lengkap Peserta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="mis. Budi Santoso"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">NIK / No. Identitas</label>
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="16 digit NIK"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Status Pernikahan</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
                <option value="Duda/Janda">Duda / Janda</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">No. HP / WhatsApp</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="mis. 08123456789"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Kewarganegaraan</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="WNI / WNA"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Golongan Darah</label>
              <div className="flex gap-2">
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
                <select
                  value={rhesus}
                  onChange={(e) => setRhesus(e.target.value)}
                  className="w-20 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Perusahaan / Instansi</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nama PT / Instansi"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Departemen</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="mis. Produksi / HRD"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Jabatan / Posisi</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="mis. Staff / Operator"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Daftarkan Peserta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};