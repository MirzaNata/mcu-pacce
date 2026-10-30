import React, { useState, useEffect } from 'react';
import { X, Download, Printer, FileText } from 'lucide-react';
import type { MCUDocument } from '../types';

interface PDFPreviewModalProps {
  document: MCUDocument | null;
  onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  document,
  onClose,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    if (document) {
      if (document.fileBlob) {
        const url = URL.createObjectURL(document.fileBlob);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (document.fileUrl) {
        setPdfUrl(document.fileUrl);
      }
    }
  }, [document]);

  if (!document) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      printWindow?.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {document.fileName || 'Laporan_MCU.pdf'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {document.patientName || 'Peserta MCU'} • No. MCU:{' '}
                <span className="font-mono font-bold text-blue-600">
                  {document.mcuNumber || '-'}
                </span>{' '}
                • {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfUrl && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak
                </button>
                <a
                  href={pdfUrl}
                  download={document.fileName || 'Laporan_MCU.pdf'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Unduh PDF
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="flex-1 bg-gray-100 p-2 overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-full rounded-xl border border-gray-200 bg-white"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
              Pratinjau dokumen tidak tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};