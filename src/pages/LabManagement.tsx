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
  
  // State untuk modal upload PDF
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const patientList = await patientService.getPatients();
      setPatients(patientList);

      // Ambil daftar file laboratorium untuk tiap peserta
      const filesMap: Record<string, string> = {};
      for (const p of patientList) {
        if (p.id) {
          const fileUrl = await labService.getLabDocumentUrl(p.id);
          if (fileUrl) {
            filesMap[p.id] = fileUrl;
          }
        }
      }
      setLabFiles(filesMap);
    } catch (err) {
      console.error('Gagal memuat data laboratorium:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setPdfFile(null);
    setUploadError(null);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
    setPdfFile(null);
    setUploadError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Format file harus berupa PDF (.pdf)');
        setPdfFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // Max 10MB
        setUploadError('Ukuran file maksimal adalah 10MB');
        setPdfFile(null);
        return;
      }
      setUploadError(null);
      setPdfFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id || !pdfFile) return;

    try {
      setUploading(true);
      setUploadError(null);

      const fileUrl = await labService.uploadLabDocument(selectedPatient.id, pdfFile);
      
      // Update state lokal
      setLabFiles((prev) => ({
        ...prev,
        [selectedPatient.id]: fileUrl,
      }));

      handleCloseModal();
      alert('Berkas PDF hasil laboratorium berhasil diunggah!');
    } catch (err: any) {
      console.error('Gagal mengunggah PDF lab:', err);
      setUploadError(err?.message || 'Gagal mengunggah berkas PDF laboratorium');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (patientId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus berkas PDF hasil laboratorium ini?')) {
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
          Pengelolaan berkas PDF hasil pemeriksaan laboratorium pasien
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

      {/* Tabel Peserta & Status Upload PDF */}
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
                  const hasPdf = Boolean(p.id && labFiles[p.id]);
                  const pdfUrl = p.id ? labFiles[p.id] : null;

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
                        {hasPdf ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 font-bold text-[11px] rounded-lg border border-green-200">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            PDF Terunggah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 font-medium text-[11px] rounded-lg">
                            Belum Ada PDF
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {hasPdf && pdfUrl ? (
                            <>
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1.5"
                                title="Lihat Berkas PDF Hasil Lab"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Lihat PDF</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenUploadModal(p)}
                                className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                                title="Ganti PDF"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Ganti</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => p.id && handleDeleteFile(p.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Hapus PDF"
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
                              <span>Upload PDF Lab</span>
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

      {/* MODAL UPLOAD PDF */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Upload Hasil Laboratorium (PDF)</h3>
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
                  Pilih Berkas PDF Hasil Lab
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/30 rounded-2xl transition-all cursor-pointer">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-gray-700 text-center">
                    {pdfFile ? pdfFile.name : 'Klik untuk memilih berkas PDF'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">Format PDF, maksimal 10MB</span>
                  <input
                    type="file"
                    accept="application/pdf"
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
                  disabled={!pdfFile || uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Mengunggah...' : 'Simpan PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};