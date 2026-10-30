import { supabase } from '../lib/supabaseClient';
import type { LabResult } from '../types';

export const labService = {
  async getLabResultsByPatientId(patientId: string): Promise<LabResult[]> {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data laboratorium:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      patientId: r.patient_id,
      testName: r.test_name,
      result: r.result,
      unit: r.unit,
      referenceRange: r.reference_range,
      status: r.status,
      notes: r.notes,
      date: r.date || r.upload_date || r.created_at?.split('T')[0],
      uploadDate: r.upload_date || r.created_at?.split('T')[0],
      fileDataUrl: r.file_data_url || r.fileDataUrl || r.fileData || '',
      fileData: r.file_data || r.fileData || '',
    }));
  },

  async saveLabResult(data: Omit<LabResult, 'id' | 'uploadDate'>): Promise<LabResult | null> {
    const dataUrl = data.fileDataUrl || data.fileData || '';

    const { data: inserted, error } = await supabase
      .from('lab_results')
      .insert([{
        patient_id: data.patientId,
        test_name: data.testName,
        result: data.result,
        unit: data.unit,
        reference_range: data.referenceRange,
        status: data.status,
        notes: data.notes,
        date: data.date || new Date().toISOString().split('T')[0],
        upload_date: new Date().toISOString().split('T')[0],
        file_data_url: dataUrl,
      }])
      .select()
      .single();

    if (error || !inserted) {
      console.error('Gagal menyimpan hasil lab:', error);
      return null;
    }

    return {
      id: inserted.id,
      patientId: inserted.patient_id,
      testName: inserted.test_name,
      result: inserted.result,
      unit: inserted.unit,
      referenceRange: inserted.reference_range,
      status: inserted.status,
      notes: inserted.notes,
      date: inserted.date,
      uploadDate: inserted.upload_date,
      fileDataUrl: inserted.file_data_url,
    };
  },

  async deleteLabResult(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('lab_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus data lab:', error);
      return false;
    }

    return true;
  }
};