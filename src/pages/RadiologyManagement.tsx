import { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Trash2, 
  Eye, 
  FileText, 
  Radio, 
  X 
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { documentStorageService } from '../services/documentStorageService';
import { PDFPreviewModal } from '../components/PDFPreviewModal';
import type { Patient, MCUDocument } from '../types';

export const RadiologyManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<MCUDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<MCUDocument | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientData, docData] = await Promise.all([
        patientService.getPatients(),
        documentStorageService.getDocuments(),
      ]);
      setPatients(patientData);
      setDocuments(docData);
    } catch (err) {
      console.error('Gagal memuat data radiologi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !uploadFile) return;

    try {
      setUploading(true);
      await documentStorageService.uploadDocument({
        patientId: selectedPatient.id,
        fileName: uploadFile.name,
        fileBlob: uploadFile,
        patientName: selectedPatient.fullName,
        mcuNumber: selectedPatient.mcuNumber || '',
        fileSize: uploadFile.size,
        uploadDate: new Date().toISOString().split('T')[0],
        category: 'RADIOLOGY',
      });
      
      setUploadFile(null);
      setSelectedPatient(null);
      await fetchData();
    } catch (err) {
      console.error('Gagal mengunggah berkas radiologi:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: MCUDocument) => {
    if (!doc.id) return;
    if (window.confirm(`Hapus dokumen ${doc.fileName}?`)) {
      await documentStorageService.deleteDocument(doc.id);
      await fetchData();
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchName = p.fullName.toLowerCase().includes(q);
    const matchMcu = (p.mcuNumber || '').toLowerCase().includes(q);
    const matchNik = (p.nik || p.identityNumber || '').toLowerCase().includes(q);

    return matchName || matchMcu || matchNik;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat data manajemen radiologi...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-black text-gray-900">Manajemen Berkas Radiologi & Rontgen</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Unggah dan kelola hasil foto Thorax, Rontgen, serta dokumen radiologi peserta MCU
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Peserta, No. MCU, atau NIK..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* PATIENTS & RADIOLOGY DOCS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                <th className="p-4">Peserta / No. MCU</th>
                <th className="p-4">Perusahaan</th>
                <th className="p-4">Dokumen Radiologi Terunggah</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => {
                const patientDocs = documents.filter((d) => d.patientId === patient.id);

                return (
                  <tr key={patient.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{patient.fullName}</div>
                      <div className="font-mono text-blue-600 font-bold text-[11px]">{patient.mcuNumber || '-'}</div>
                    </td>
                    <td className="p-4 text-gray-700">{patient.company || patient.companyName || '-'}</td>
                    <td className="p-4">
                      {patientDocs.length === 0 ? (
                        <span className="text-gray-400 italic text-[11px]">Belum ada berkas radiologi</span>
                      ) : (
                        <div className="space-y-1">
                          {patientDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-medium text-gray-800 truncate">{doc.fileName}</span>
                                <span className="text-[10px] text-gray-400">({doc.uploadDate || '-'})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setPreviewDoc(doc)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                                  title="Pratinjau"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(doc)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Unggah Foto
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPLOAD */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-gray-900">Unggah Berkas Radiologi</h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Unggah berkas foto Thorax/Rontgen untuk: <strong className="text-gray-900">{selectedPatient.fullName}</strong> ({selectedPatient.mcuNumber})
            </p>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih File PDF / Gambar</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah...' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <PDFPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};