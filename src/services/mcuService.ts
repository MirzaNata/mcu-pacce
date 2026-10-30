import { supabase } from '../lib/supabaseClient';
import type { MCURecord } from '../types';

export const mcuService = {
  // Ambil rekam MCU berdasarkan ID Pasien
  async getMCUByPatientId(patientId: string): Promise<MCURecord | null> {
    const { data, error } = await supabase
      .from('mcu_records')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      patientId: data.patient_id,
      generalExamination: data.general_examination,
      anamnesis: data.anamnesis,
      medicalHistory: data.medical_history,
      vaccinationHistory: data.vaccination_history,
      lifestyle: data.lifestyle,
      physicalExamination: data.physical_examination,
      visionExamination: data.vision_examination,
      supportingExamination: data.supporting_examination,
      doctorConclusion: data.doctor_conclusion,
      updatedAt: data.updated_at,
      status: data.doctor_conclusion?.finalResult || 'DRAFT',
    } as unknown as MCURecord;
  },

  // Simpan / Update rekam MCU
  async saveMCURecord(mcuRecord: MCURecord): Promise<boolean> {
    const existing = await this.getMCUByPatientId(mcuRecord.patientId);
    const existingId = (existing as any)?.id;

    const payload = {
      patient_id: mcuRecord.patientId,
      general_examination: mcuRecord.generalExamination || {},
      anamnesis: mcuRecord.anamnesis || {},
      medical_history: mcuRecord.medicalHistory || {},
      vaccination_history: mcuRecord.vaccinationHistory || {},
      lifestyle: mcuRecord.lifestyle || {},
      physical_examination: mcuRecord.physicalExamination || {},
      vision_examination: mcuRecord.visionExamination || {},
      supporting_examination: mcuRecord.supportingExamination || {},
      doctor_conclusion: mcuRecord.doctorConclusion || {},
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await supabase
        .from('mcu_records')
        .update(payload)
        .eq('id', existingId);
      return !error;
    } else {
      const { error } = await supabase
        .from('mcu_records')
        .insert([payload]);
      return !error;
    }
  },

  // Upload gambar tanda tangan ke Supabase Storage (Bucket 'signatures')
  async uploadDoctorSignature(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `signature_${Date.now()}.${fileExt}`;
    const filePath = `doctors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Gagal upload tanda tangan:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('signatures')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};