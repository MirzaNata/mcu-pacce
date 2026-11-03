import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Konfigurasi worker PDF.js via CDN agar tidak membebankan bundler Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfAttachmentRendererProps {
  pdfUrl: string;
  title: string;
  patientName: string;
  mcuNumber: string;
}

export const PdfAttachmentRenderer: React.FC<PdfAttachmentRendererProps> = ({
  pdfUrl,
  title,
  patientName,
  mcuNumber,
}) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const renderPdfPages = async () => {
      try {
        setLoading(true);
        setError(false);

        // Muat dokumen PDF
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;
        const pageImages: string[] = [];

        // Konversi setiap halaman PDF menjadi gambar PNG resolusi tinggi (scale 2.0)
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport } as any).promise;
            pageImages.push(canvas.toDataURL('image/png'));
          }
        }

        if (isMounted) {
          setPages(pageImages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Gagal merender PDF:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    if (pdfUrl) {
      renderPdfPages();
    }

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-gray-500 font-medium italic border border-dashed border-gray-300 rounded-xl my-4">
        Memproses halaman lampiran PDF...
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-red-500 font-medium border border-red-200 rounded-xl my-4">
        Gagal memuat pratinjau PDF. Silakan buka berkas secara langsung.
      </div>
    );
  }

  return (
    <>
      {pages.map((imgSrc, index) => (
        <div key={index} className="print-attachment-page">
          <div className="font-bold text-xs bg-gray-200 p-2 border border-black uppercase flex items-center justify-between">
            <span>
              {title} {pages.length > 1 ? `(Halaman ${index + 1} dari ${pages.length})` : ''}
            </span>
            <span className="text-[10px] text-gray-600 font-normal">
              Pasien: {patientName} ({mcuNumber})
            </span>
          </div>

          <div className="attachment-container border border-black border-t-0 bg-white flex justify-center items-center">
            <img
              src={imgSrc}
              alt={`${title} Halaman ${index + 1}`}
              className="attachment-img"
            />
          </div>
        </div>
      ))}
    </>
  );
};