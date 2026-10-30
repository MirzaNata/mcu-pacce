import { supabase } from '../lib/supabaseClient';
import type { MCUDocument } from '../types';

export const documentStorageService = {
  async getDocuments(): Promise<MCUDocument[]> {
    const { data, error } = await supabase
      .from('mcu_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil daftar dokumen:', error);
      return [];
    }

    return (data || []).map((doc: any) => ({
      id: doc.id,
      patientId: doc.patient_id,
      fileName: doc.file_name,
      patientName: doc.patient_name,
      mcuNumber: doc.mcu_number,
      fileSize: doc.file_size,
      fileUrl: doc.file_url,
      uploadDate: doc.upload_date || doc.created_at?.split('T')[0],
      category: doc.category || 'RADIOLOGY',
    }));
  },

  async uploadDocument(doc: Omit<MCUDocument, 'id'>): Promise<MCUDocument | null> {
    let fileUrl = doc.fileUrl || '';

    if (doc.fileBlob) {
      const fileNamePath = `${Date.now()}_${doc.fileName || 'document.pdf'}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('mcu-documents')
        .upload(fileNamePath, doc.fileBlob);

      if (!storageError && storageData) {
        const { data: publicUrlData } = supabase.storage
          .from('mcu-documents')
          .getPublicUrl(fileNamePath);
        fileUrl = publicUrlData?.publicUrl || '';
      }
    }

    const { data, error } = await supabase
      .from('mcu_documents')
      .insert([{
        patient_id: doc.patientId,
        file_name: doc.fileName,
        patient_name: doc.patientName,
        mcu_number: doc.mcuNumber,
        file_size: doc.fileSize,
        file_url: fileUrl,
        upload_date: doc.uploadDate || new Date().toISOString().split('T')[0],
        category: doc.category || 'RADIOLOGY',
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal menyimpan record dokumen:', error);
      return null;
    }

    return {
      id: data.id,
      patientId: data.patient_id,
      fileName: data.file_name,
      patientName: data.patient_name,
      mcuNumber: data.mcu_number,
      fileSize: data.file_size,
      fileUrl: data.file_url,
      uploadDate: data.upload_date,
      category: data.category,
    };
  },

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('mcu_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus dokumen:', error);
      return false;
    }

    return true;
  }
};