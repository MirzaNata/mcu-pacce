import { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import type { Patient } from '../types';

interface PatientFormProps {
  isOpen: boolean;
  initialData?: Patient | null;
  onClose: () => void;
  onSave: (patientData: Omit<Patient, 'id' | 'mcuNumber' | 'registrationDate' | 'status'>) => void;
}

export const PatientForm = ({ isOpen, initialData, onClose, onSave }: PatientFormProps) => {
  const [prevInitialData, setPrevInitialData] = useState<Patient | null | undefined>(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [identityNumber, setIdentityNumber] = useState(initialData?.identityNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [gender, setGender] = useState<'Laki-Laki' | 'Perempuan'>(initialData?.gender || 'Laki-Laki');
  const [nationality, setNationality] = useState(initialData?.nationality || 'WNI');
  const [bloodType, setBloodType] = useState(initialData?.bloodType || 'A');
  const [rhesus, setRhesus] = useState(initialData?.rhesus || '+');
  const [maritalStatus, setMaritalStatus] = useState(initialData?.maritalStatus || 'Belum Menikah');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [position, setPosition] = useState(initialData?.position || '');

  const [errorMessage, setErrorMessage] = useState('');

  // Sinkronisasi state saat props initialData atau isOpen berubah (dilakukan saat render)
  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setFullName(initialData?.fullName || '');
    setIdentityNumber(initialData?.identityNumber || '');
    setDateOfBirth(initialData?.dateOfBirth || '');
    setGender(initialData?.gender || 'Laki-Laki');
    setNationality(initialData?.nationality || 'WNI');
    setBloodType(initialData?.bloodType || 'A');
    setRhesus(initialData?.rhesus || '+');
    setMaritalStatus(initialData?.maritalStatus || 'Belum Menikah');
    setPhoneNumber(initialData?.phoneNumber || '');
    setAddress(initialData?.address || '');
    setCompanyName(initialData?.companyName || '');
    setPosition(initialData?.position || '');
    setErrorMessage('');
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap peserta wajib diisi.');
      return;
    }
    if (!identityNumber.trim()) {
      setErrorMessage('Nomor Identitas (NIK) wajib diisi.');
      return;
    }
    if (!dateOfBirth.trim()) {
      setErrorMessage('Tanggal lahir wajib diisi.');
      return;
    }
    if (!gender) {
      setErrorMessage('Jenis kelamin wajib dipilih.');
      return;
    }

    setErrorMessage('');
    onSave({
      fullName: fullName.trim(),
      identityNumber: identityNumber.trim(),
      dateOfBirth,
      gender,
      nationality,
      bloodType,
      rhesus,
      maritalStatus,
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      companyName: companyName.trim(),
      position: position.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {initialData ? 'Edit Data Diri Peserta MCU' : 'Tambah Peserta MCU Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="mis. Budi Santoso"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nomor Identitas (NIK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="mis. 3507123456780001"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Laki-Laki' | 'Perempuan')}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium cursor-pointer outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kewarganegaraan</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="WNI / WNA"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status Perkawinan</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium cursor-pointer outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
                <option value="Duda / Janda">Duda / Janda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Golongan Darah</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium cursor-pointer outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rhesus</label>
              <select
                value={rhesus}
                onChange={(e) => setRhesus(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium cursor-pointer outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="+">Positif (+)</option>
                <option value="-">Negatif (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="mis. 081234567890"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Perusahaan / Instansi</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="mis. PT Sumber Makmur"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Jabatan / Posisi Pekerjaan</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="mis. Staff Admin / Operator Mesin"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat domisili peserta..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Peserta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};