import { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  Trash2, 
  Eye, 
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { labService } from '../services/labService';
import type { Patient } from '../types';

export const LabManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labFiles, setLabFiles] = useState<Record<string, string>>({}); // Map patientId -> fileUrl
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State untuk modal upload
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const patientList = await patientService.getPatients();
      setPatients(patientList);

      // Eksekusi pengambilan berkas lab secara paralel
      const filePromises = patientList.map(async (p) => {
        if (!p.id) return null;
        const fileUrl = await labService.getLabDocumentUrl(p.id);
        return { id: p.id, fileUrl };
      });

      const fileResults = await Promise.all(filePromises);

      const filesMap: Record<string, string> = {};
      fileResults.forEach((item) => {
        if (item && item.fileUrl) {
          filesMap[item.id] = item.fileUrl;
        }
      });

      setLabFiles(filesMap);
    } catch (err) {
      console.error('Gagal memuat data laboratorium:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setUploadedFile(null);
    setUploadError(null);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
    setUploadedFile(null);
    setUploadError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Izinkan PDF dan Gambar (JPG, PNG, JPEG, WEBP)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Format file harus berupa Gambar (.jpg, .png) atau PDF (.pdf)');
        setUploadedFile(null);
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // Max 15MB
        setUploadError('Ukuran file maksimal adalah 15MB');
        setUploadedFile(null);
        return;
      }
      setUploadError(null);
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id || !uploadedFile) return;

    try {
      setUploading(true);
      setUploadError(null);

      const fileUrl = await labService.uploadLabDocument(selectedPatient.id, uploadedFile);
      
      // Update state lokal
      setLabFiles((prev) => ({
        ...prev,
        [selectedPatient.id]: fileUrl,
      }));

      handleCloseModal();
      alert('Berkas hasil Laboratorium berhasil diunggah!');
    } catch (err: any) {
      console.error('Gagal mengunggah berkas laboratorium:', err);
      setUploadError(err?.message || 'Gagal mengunggah berkas hasil laboratorium');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (patientId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus berkas hasil laboratorium ini?')) {
      try {
        await labService.deleteLabDocument(patientId);
        setLabFiles((prev) => {
          const updated = { ...prev };
          delete updated[patientId];
          return updated;
        });
      } catch (err) {
        alert('Gagal menghapus berkas laboratorium');
      }
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      (p.mcuNumber && p.mcuNumber.toLowerCase().includes(term)) ||
      (p.company && p.company.toLowerCase().includes(term)) ||
      (p.companyName && p.companyName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-blue-600" />
          Pemeriksaan Penunjang & Laboratorium
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Pengelolaan berkas foto hasil cetak atau PDF laboratorium peserta MCU
        </p>
      </div>

      {/* Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Peserta atau No. MCU..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabel Peserta & Status Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                <th className="p-3.5">PESERTA / MCU</th>
                <th className="p-3.5">PERUSAHAAN</th>
                <th className="p-3.5 text-center">STATUS BERKAS LAB</th>
                <th className="p-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    Memuat data peserta laboratorium...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    Tidak ada data peserta ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const hasFile = Boolean(p.id && labFiles[p.id]);
                  const fileUrl = p.id ? labFiles[p.id] : null;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{p.fullName}</span>
                        <span className="font-mono text-[11px] font-bold text-blue-600 block mt-0.5">
                          {p.mcuNumber || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {p.company || p.companyName || '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        {hasFile ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 font-bold text-[11px] rounded-lg border border-green-200">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            Berkas Terunggah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 font-medium text-[11px] rounded-lg">
                            Belum Ada Berkas
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {hasFile && fileUrl ? (
                            <>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1.5"
                                title="Lihat Berkas Lab"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Lihat Berkas</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenUploadModal(p)}
                                className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                                title="Ganti Berkas"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Ganti</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => p.id && handleDeleteFile(p.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenUploadModal(p)}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Upload Lab</span>
                            </button>
                          )}
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

      {/* MODAL UPLOAD LABORATORIUM */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Upload Berkas Hasil Laboratorium</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedPatient.fullName} ({selectedPatient.mcuNumber || '-'})
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Pilih Berkas Foto atau PDF Hasil Laboratorium
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/30 rounded-2xl transition-all cursor-pointer">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-gray-700 text-center">
                    {uploadedFile ? uploadedFile.name : 'Klik untuk memilih berkas'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">Format JPG / PNG / PDF (Maks. 15MB)</span>
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!uploadedFile || uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Mengunggah...' : 'Simpan Berkas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};