import { supabase } from '../lib/supabaseClient';
import type { LabResult } from '../types';

export const labService = {
  // Fungsi yang sudah ada sebelumnya
  async getLabResultsByPatientId(patientId: string): Promise<LabResult[]> {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Gagal mengambil data lab:', error);
      return [];
    }
    return data || [];
  },

  async saveLabResult(data: Omit<LabResult, 'id' | 'uploadedAt'>): Promise<LabResult | null> {
    const { data: result, error } = await supabase
      .from('lab_results')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Gagal menyimpan hasil lab:', error);
      throw error;
    }
    return result;
  },

  // 1. Ambil URL Publik Dokumen PDF Hasil Lab
  async getLabDocumentUrl(patientId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('mcu-documents')
        .list(`lab/${patientId}`);

      if (error || !data || data.length === 0) return null;

      // Ambil berkas terbaru jika ada beberapa berkas
      const latestFile = data[data.length - 1];
      const { data: publicUrlData } = supabase.storage
        .from('mcu-documents')
        .getPublicUrl(`lab/${patientId}/${latestFile.name}`);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Gagal mengambil URL dokumen lab:', err);
      return null;
    }
  },

  // 2. Unggah Berkas PDF Hasil Lab ke Supabase Storage
  async uploadLabDocument(patientId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `lab_${Date.now()}.${fileExt}`;
    const filePath = `lab/${patientId}/${fileName}`;

    // Hapus berkas lama jika ada sebelum mengunggah yang baru
    await this.deleteLabDocument(patientId);

    const { error: uploadError } = await supabase.storage
      .from('mcu-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('mcu-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // 3. Hapus Berkas PDF Hasil Lab dari Supabase Storage
  async deleteLabDocument(patientId: string): Promise<void> {
    try {
      const { data: listData } = await supabase.storage
        .from('mcu-documents')
        .list(`lab/${patientId}`);

      if (listData && listData.length > 0) {
        const filesToDelete = listData.map((f) => `lab/${patientId}/${f.name}`);
        await supabase.storage.from('mcu-documents').remove(filesToDelete);
      }
    } catch (err) {
      console.error('Gagal menghapus dokumen lab:', err);
    }
  },
};