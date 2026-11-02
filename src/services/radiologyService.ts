import { supabase } from '../lib/supabaseClient';

export interface RadiologyResult {
  id?: string;
  patient_id: string;
  file_url?: string;
  notes?: string;
  uploaded_at?: string;
}

export const radiologyService = {
  async getRadiologyResultsByPatientId(patientId: string): Promise<RadiologyResult[]> {
    const { data, error } = await supabase
      .from('radiology_results')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Gagal mengambil data radiologi:', error);
      return [];
    }
    return data || [];
  },

  async saveRadiologyResult(data: Omit<RadiologyResult, 'id' | 'uploaded_at'>): Promise<RadiologyResult | null> {
    const { data: result, error } = await supabase
      .from('radiology_results')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Gagal menyimpan hasil radiologi:', error);
      throw error;
    }
    return result;
  },

  // 1. Ambil URL Publik Dokumen PDF/Gambar Hasil Radiologi
  async getRadiologyDocumentUrl(patientId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('mcu-documents')
        .list(`radiology/${patientId}`);

      if (error || !data || data.length === 0) return null;

      const latestFile = data[data.length - 1];
      const { data: publicUrlData } = supabase.storage
        .from('mcu-documents')
        .getPublicUrl(`radiology/${patientId}/${latestFile.name}`);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Gagal mengambil URL dokumen radiologi:', err);
      return null;
    }
  },

  // 2. Unggah Berkas Radiologi ke Supabase Storage (mcu-documents/radiology/)
  async uploadRadiologyDocument(patientId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `rad_${Date.now()}.${fileExt}`;
    const filePath = `radiology/${patientId}/${fileName}`;

    await this.deleteRadiologyDocument(patientId);

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

  // 3. Hapus Berkas Radiologi dari Supabase Storage
  async deleteRadiologyDocument(patientId: string): Promise<void> {
    try {
      const { data: listData } = await supabase.storage
        .from('mcu-documents')
        .list(`radiology/${patientId}`);

      if (listData && listData.length > 0) {
        const filesToDelete = listData.map((f) => `radiology/${patientId}/${f.name}`);
        await supabase.storage.from('mcu-documents').remove(filesToDelete);
      }
    } catch (err) {
      console.error('Gagal menghapus dokumen radiologi:', err);
    }
  },
};