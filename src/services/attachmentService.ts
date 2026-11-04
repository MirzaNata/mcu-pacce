// CATATAN: Jika nama file supabase Anda adalah 'supabaseClient.ts', 
// ubah '../lib/supabase' menjadi '../lib/supabaseClient'
import { supabase } from '../lib/supabaseClient';
import type { Attachment } from '../types';

export const attachmentService = {
  async getAttachmentsByPatientId(patientId: string, category: string = 'PENUNJANG'): Promise<Attachment[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('category', category);

      if (error) {
        console.error('Gagal mengambil lampiran:', error);
        return [];
      }

      // Menambahkan (item: any) untuk mencegah error ts(7006)
      return (data || []).map((item: any) => ({
        id: item.id,
        patientId: item.patient_id,
        fileName: item.file_name,
        fileUrl: item.file_url,
        fileType: item.file_type,
        category: item.category,
        createdAt: item.created_at,
      }));
    } catch (err) {
      console.error('Error attachmentService.getAttachmentsByPatientId:', err);
      return [];
    }
  },

  async uploadAttachment(patientId: string, file: File, category: string = 'PENUNJANG'): Promise<Attachment | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `mcu-attachments/${patientId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('mcu-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('mcu-files')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      const { data, error: dbError } = await supabase
        .from('attachments')
        .insert([
          {
            patient_id: patientId,
            file_name: file.name,
            file_url: fileUrl,
            file_type: file.type,
            category: category,
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      return {
        id: data.id,
        patientId: data.patient_id,
        fileName: data.file_name,
        fileUrl: data.file_url,
        fileType: data.file_type,
        category: data.category,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('Error attachmentService.uploadAttachment:', err);
      throw err;
    }
  },

  async deleteAttachment(attachmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) {
        console.error('Gagal menghapus lampiran:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error attachmentService.deleteAttachment:', err);
      return false;
    }
  },
};