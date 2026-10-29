import { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Search, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  FlaskConical,
  Plus,
  Loader2
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { documentStorageService } from '../services/documentStorageService';
import { PDFPreviewModal } from '../components/PDFPreviewModal';
import type { Patient, MCUDocument } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const LabManagement = () => {
  const [patients, setPatients] = useState<Patient[]>(() => patientService.getPatients());
  const [documents, setDocuments] = useState<MCUDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Preview & Delete State
  const [previewDoc, setPreviewDoc] = useState<MCUDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<MCUDocument | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pemuatan data async dari IndexedDB
  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      try {
        const docs = await documentStorageService.getDocumentsByCategory('LAB');
        if (isMounted) {
          setDocuments(docs);
        }
      } catch (err) {
        console.error('Gagal memuat dokumen laboratorium:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshData = async () => {
    setPatients(patientService.getPatients());
    try {
      const docs = await documentStorageService.getDocumentsByCategory('LAB');
      setDocuments(docs);
    } catch (err) {
      console.error('Gagal memperbarui data laboratorium:', err);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenUploadModal = (patientId?: string) => {
    if (patientId) setSelectedPatientId(patientId);
    else if (patients.length > 0) setSelectedPatientId(patients[0].id);
    setSelectedFile(null);
    setUploadNotes('');
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Format file tidak valid. Hanya file PDF yang diperbolehkan.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Ukuran file melebihi batas maksimum 10 MB.');
      setSelectedFile(null);
      return;
    }

    setUploadError('');
    setSelectedFile(file);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setUploadError('Silakan pilih peserta MCU terlebih dahulu.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Silakan pilih file PDF hasil laboratorium.');
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) {
      setUploadError('Data peserta tidak ditemukan.');
      return;
    }

    setIsSaving(true);
    try {
      await documentStorageService.saveDocument({
        patientId: patient.id,
        mcuNumber: patient.mcuNumber,
        patientName: patient.fullName,
        identityNumber: patient.identityNumber,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileBlob: selectedFile,
        uploadDate: new Date().toISOString().split('T')[0],
        category: 'LAB',
        notes: uploadNotes.trim(),
      });

      showNotification(`Dokumen laboratorium peserta ${patient.fullName} berhasil disimpan!`);
      setIsUploadModalOpen(false);
      await refreshData();
    } catch (err) {
      console.error(err);
      setUploadError('Gagal menyimpan dokumen laboratorium.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    try {
      await documentStorageService.deleteDocument(deleteDoc.id);
      showNotification(`Dokumen "${deleteDoc.fileName}" berhasil dihapus.`);
      setDeleteDoc(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      showNotification('Gagal menghapus dokumen.');
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.mcuNumber.toLowerCase().includes(q) ||
      p.identityNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-black text-gray-900">Manajemen Dokumen Laboratorium</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pengunggahan dan pengelolaan berkas PDF hasil pemeriksaan laboratorium SIMRS peserta MCU
          </p>
        </div>

        <button
          onClick={() => handleOpenUploadModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Unggah Hasil Laboratorium</span>
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
          placeholder="Cari berdasarkan nama peserta, No. MCU, atau NIK..."
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
                <th className="p-3.5 text-center">Status Laboratorium</th>
                <th className="p-3.5">Dokumen Tersimpan</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-gray-500 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data dokumen laboratorium...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-gray-500 font-medium">
                    Tidak ada data peserta MCU yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const patientDocs = documents.filter((d) => d.patientId === patient.id);
                  const hasDocs = patientDocs.length > 0;

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-xs font-bold text-blue-600">
                        {patient.mcuNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900 text-xs">{patient.fullName}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">NIK: {patient.identityNumber}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                            hasDocs
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {hasDocs ? `Sudah Diunggah (${patientDocs.length} File)` : 'Belum Ada File'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {hasDocs ? (
                          <div className="space-y-1.5">
                            {patientDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs gap-2"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-medium text-gray-800 truncate">{doc.fileName}</span>
                                  <span className="text-[10px] text-gray-400">({doc.uploadDate})</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDoc(doc)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                    title="Lihat PDF"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteDoc(doc)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus PDF"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum ada hasil lab</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenUploadModal(patient.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer mx-auto"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah File</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload PDF */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-base font-bold text-gray-900">Unggah Hasil Laboratorium (PDF)</h2>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Peserta MCU <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium cursor-pointer outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.mcuNumber}) - NIK: {p.identityNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  File PDF Hasil Laboratorium <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl text-center bg-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-bold text-gray-700">
                    {selectedFile ? selectedFile.name : 'Klik untuk memilih file PDF dari SIMRS'}
                  </span>
                  <span className="text-[10px] text-gray-400">Hanya format PDF (Maksimal 10 MB)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Dokumen (Opsional)</label>
                <input
                  type="text"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="mis. Hasil Kimia Darah & Hematologi..."
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Dokumen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Konfirmasi Hapus Dokumen</h3>
            <p className="text-xs text-gray-600">
              Apakah Anda yakin ingin menghapus dokumen laboratorium <strong>"{deleteDoc.fileName}"</strong> milik peserta <strong>{deleteDoc.patientName}</strong>?
            </p>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setDeleteDoc(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau PDF */}
      <PDFPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};