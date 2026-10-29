import { useEffect, useMemo } from 'react';
import { X, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import type { MCUDocument } from '../types';

interface PDFPreviewModalProps {
  document: MCUDocument | null;
  onClose: () => void;
}

export const PDFPreviewModal = ({ document, onClose }: PDFPreviewModalProps) => {
  // Menghitung URL PDF secara deklaratif tanpa setState di useEffect
  const pdfUrl = useMemo(() => {
    if (document && document.fileBlob) {
      return URL.createObjectURL(document.fileBlob);
    }
    return null;
  }, [document]);

  // Cleanup pembersihan memori URL saat pdfUrl berubah atau modal ditutup
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  if (!document) return null;

  const handleOpenNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{document.fileName}</h3>
              <p className="text-xs text-gray-500">
                {document.patientName} • No. MCU: <span className="font-mono font-bold text-blue-600">{document.mcuNumber}</span> • {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Tab Baru</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 p-2 overflow-hidden flex items-center justify-center">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-xl border border-gray-200 bg-white"
              title={document.fileName}
            />
          ) : (
            <div className="text-center p-8 text-gray-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-xs font-semibold">Gagal memuat dokumen PDF.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};